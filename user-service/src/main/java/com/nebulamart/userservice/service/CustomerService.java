package com.nebulamart.userservice.service;
import com.nebulamart.userservice.entity.User;
import com.nebulamart.userservice.template.*;

import com.nebulamart.userservice.entity.Customer;
import com.nebulamart.userservice.util.AuthFacade;
import com.nebulamart.userservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class CustomerService {

    private final CognitoIdentityProviderClient cognitoClient;

    @Autowired
    private DynamoDbClient dynamoDbClient;

    @Autowired
    private AuthFacade authFacade;

    @Value("${aws-cognito.user-pool-id}")
    private String userPoolId;

    @Value("${aws-cognito.user-pool-client-id}")
    private String clientId;

    @Value("${aws-cognito.user-pool-client-secret}")
    private String clientSecret;

    @Autowired
    public CustomerService(CognitoIdentityProviderClient cognitoClient) {
        this.cognitoClient = cognitoClient;
    }

    public Customer customerSignUp(CustomerSignUp customerSignUp) {

        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();

        AttributeType attributeRole = AttributeType.builder()
                .name("custom:role")
                .value("CUSTOMER")
                .build();

        List<AttributeType> attrs = new ArrayList<>();
        attrs.add(attributeRole);

        try {
            String secretVal = calculateSecretHash(clientId, clientSecret, customerSignUp.getEmail());
            SignUpRequest signUpRequest = SignUpRequest.builder()
                    .userAttributes(attrs)
                    .username(customerSignUp.getEmail())
                    .clientId(clientId)
                    .password(customerSignUp.getPassword())
                    .secretHash(secretVal)
                    .build();

            SignUpResponse result = cognitoClient.signUp(signUpRequest);
            String userId = result.userSub();
            Customer customer = new Customer(userId, customerSignUp.getName(), customerSignUp.getEmail(), customerSignUp.getContactNumber(), customerSignUp.getLocation(), customerSignUp.getAddress());

            DynamoDbTable<Customer> customerTable = enhancedClient.table("Customer", TableSchema.fromBean(Customer.class));
            customerTable.putItem(customer);
            return customer;

        } catch (CognitoIdentityProviderException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            return null;
        }
    }

    public VerifyAccountResponse confirmSignUp(String email, String confirmationCode) {

        ConfirmSignUpRequest req = ConfirmSignUpRequest.builder()
                .clientId(clientId)
                .secretHash(calculateSecretHash(clientId, clientSecret, email))
                .confirmationCode(confirmationCode)
                .username(email)
                .build();

        try {
            ConfirmSignUpResponse response = cognitoClient.confirmSignUp(req);
            if (response.sdkHttpResponse().isSuccessful()) {
                return new VerifyAccountResponse(true, "Account verified successfully");
            } else {
                return new VerifyAccountResponse(false, "Account verification failed");
            }
        } catch (CognitoIdentityProviderException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            return new VerifyAccountResponse(false, e.awsErrorDetails().errorMessage());
        }
    }

    public SignInResponse signIn(UserSignIn userSignIn) {

        final Map<String, String> authParams = new HashMap<>();
        authParams.put("USERNAME", userSignIn.getEmail());
        authParams.put("PASSWORD", userSignIn.getPassword());
        authParams.put("SECRET_HASH", calculateSecretHash(clientId, clientSecret, userSignIn.getEmail()));

        try {
            final AdminInitiateAuthRequest authRequest = AdminInitiateAuthRequest.builder()
                    .authFlow(AuthFlowType.ADMIN_USER_PASSWORD_AUTH)
                    .clientId(clientId)
                    .userPoolId(userPoolId)
                    .authParameters(authParams)
                    .build();

            AdminInitiateAuthResponse result = cognitoClient.adminInitiateAuth(authRequest);
            return new SignInResponse(result.authenticationResult().idToken(), result.authenticationResult().accessToken());

        } catch (CognitoIdentityProviderException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            return new SignInResponse(null, null, e.awsErrorDetails().errorMessage());
        }
    }

    private static String calculateSecretHash(String userPoolClientId, String userPoolClientSecret, String userName) {
        final String HMAC_SHA256_ALGORITHM = "HmacSHA256";

        SecretKeySpec signingKey = new SecretKeySpec(
                userPoolClientSecret.getBytes(StandardCharsets.UTF_8),
                HMAC_SHA256_ALGORITHM);
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256_ALGORITHM);
            mac.init(signingKey);
            mac.update(userName.getBytes(StandardCharsets.UTF_8));
            byte[] rawHmac = mac.doFinal(userPoolClientId.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Error while calculating ");
        }
    }

    public Customer getCustomerDetails(String accessToken) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            return (Customer) authFacade.getUser(wrappedUser);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
