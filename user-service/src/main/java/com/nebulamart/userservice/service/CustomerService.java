package com.nebulamart.userservice.service;
import com.nebulamart.userservice.template.CustomerSignUp;
import com.nebulamart.userservice.template.SignInResponse;
import com.nebulamart.userservice.template.UserSignIn;
import jakarta.servlet.http.HttpSession;

import com.nebulamart.userservice.entity.Customer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeAction;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.AttributeValueUpdate;
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.*;

@Service
public class CustomerService {

    private final CognitoIdentityProviderClient cognitoClient;

    @Autowired
    private DynamoDbClient dynamoDbClient;

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
                .value("customer")
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
            Customer customer = new Customer(userId, customerSignUp.getName(), customerSignUp.getEmail(), customerSignUp.getContactNumber(), customerSignUp.getLocation(), customerSignUp.getAddress(), false);

            DynamoDbTable<Customer> customerTable = enhancedClient.table("Customer", TableSchema.fromBean(Customer.class));
            customerTable.putItem(customer);
            return customer;

        } catch (CognitoIdentityProviderException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            return null;
        }
    }

    public Boolean confirmSignUp(String email, String confirmationCode) {

        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();

        ConfirmSignUpRequest req = ConfirmSignUpRequest.builder()
                .clientId(clientId)
                .secretHash(calculateSecretHash(clientId, clientSecret, email))
                .confirmationCode(confirmationCode)
                .username(email)
                .build();

        try {
//            HashMap<String, AttributeValue> itemKey = new HashMap<>();
//            itemKey.put("email", AttributeValue.builder()
//                    .s(email)
//                    .build());
//
//            HashMap<String, AttributeValueUpdate> updatedValues = new HashMap<>();
//            updatedValues.put("isVerified", AttributeValueUpdate.builder()
//                    .value(AttributeValue.builder().bool(true).build())
//                    .action(AttributeAction.PUT)
//                    .build());
//
//            UpdateItemRequest request = UpdateItemRequest.builder()
//                    .tableName("Customer")
//                    .key(itemKey)
//                    .attributeUpdates(updatedValues)
//                    .build();
//
//            dynamoDbClient.updateItem(request);
//            return true;

            ConfirmSignUpResponse response = cognitoClient.confirmSignUp(req);
            if (response.sdkHttpResponse().isSuccessful()) {
//                DynamoDbTable<Customer> customerTable = enhancedClient.table("Customer", TableSchema.fromBean(Customer.class));
//                Customer customer = customerTable.getItem(r -> r.key("email", email));
//                customer.setIsVerified(true);
//                customerTable.updateItem(customer);
                return true;
            } else {
                return false;
            }
        } catch (CognitoIdentityProviderException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            return false;
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

            System.out.println("Auth Request: " + authRequest);

            AdminInitiateAuthResponse result = cognitoClient.adminInitiateAuth(authRequest);
            System.out.println(result.authenticationResult().accessToken());

            return new SignInResponse(result.authenticationResult().idToken());
        } catch (CognitoIdentityProviderException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            return null;
        }

    }

    public void signOut() {
        String accessToken = "eyJraWQiOiJqRUNMYldcL1JBNGVkQmQzaEpQZjI3SlB4ZnpyY1EyRVowZG5ybGQ2OUhoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwNDY4YTRjOC03MGExLTcwZGQtMmVjOS0wMjc5YjUyNmY3N2UiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV92Wk43V2lZTksiLCJjbGllbnRfaWQiOiIxZmpuOHY2b3NhcXY5dWR0aWNoZDNvMnZyOCIsIm9yaWdpbl9qdGkiOiJhMzc4MTNjNC1lYzM4LTQ1OGQtOTk1Yi0zMzRjNzE0NWMzNDYiLCJldmVudF9pZCI6IjIwNmQ4NWYzLTczNmQtNDM0Zi1hZTJmLTU1MGMxODMzYjIyOCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3MDg5MjQyMzYsImV4cCI6MTcwODkyNzgzNiwiaWF0IjoxNzA4OTI0MjM2LCJqdGkiOiI5NzU0ZDZhNS1iZGRmLTRmYmEtOTk4Mi1mZjdhMTVkOWU0MDYiLCJ1c2VybmFtZSI6IjA0NjhhNGM4LTcwYTEtNzBkZC0yZWM5LTAyNzliNTI2Zjc3ZSJ9.ECYh4buR19Q_7QZgnyutIfIVPwh2z0p-3SwbCMSkiNK81CR3YGnAp-S6Sm4OKZi-6iw3JJf_s91r6IxvrAkl4-jQgLtn_xSTlquOW1nfTu8iIypRxiT-lSg9d0x9t7Qgd-FVfHB9_Jlu04JhUxqluLtaf0NAH8Ag0q5mahWVCqCCh4QOrOHcNOzcTHp10SmFYP3LRF7h9urDoN2y2gASSKpD8xOqSHImQZ0dh8e5-tVy2LBjw0G79kNRZvWopxrxGDlDdV0VAt82JZdVKZfzVmARtJpAcQzbzINOUkuH7RhKe4z5GdiqTPV426l_SyJcb-u9g_JIek4WaytU7sNi2g";

        GlobalSignOutRequest signOutRequest = GlobalSignOutRequest.builder()
                .accessToken(accessToken)
                .build();

        GlobalSignOutResponse response = cognitoClient.globalSignOut(signOutRequest);
        System.out.println(response);
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

    public void changeTempPassword(){

        String CLIENT_ID = "1fjn8v6osaqv9udtichd3o2vr8";
        String CLIENT_SECRET = "13or9t1duhuu8ktof3s3eq2fct70q9qspddji1ip3ebd9kjkcmr3";
        String USER_POOL_ID = "us-east-1_vZN7WiYNK";
        String newPassword = "Key@1234";

        try {
            AdminSetUserPasswordRequest passwordRequest = AdminSetUserPasswordRequest.builder()
                    .username("sharadashehan6@gmail.com")
                    .userPoolId(USER_POOL_ID)
                    .password(newPassword)
                    .permanent(true)
                    .build();

            AdminSetUserPasswordResponse response = cognitoClient.adminSetUserPassword(passwordRequest);
            System.out.println(response);
            System.out.println("The password was successfully changed");

        } catch(CognitoIdentityProviderException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        }
    }
}
