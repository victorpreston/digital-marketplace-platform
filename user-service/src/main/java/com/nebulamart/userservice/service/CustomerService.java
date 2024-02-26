package com.nebulamart.userservice.service;
import jakarta.servlet.http.HttpSession;

import com.nebulamart.userservice.entity.Customer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

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
    public CustomerService(CognitoIdentityProviderClient cognitoClient) {
        this.cognitoClient = cognitoClient;
    }

    public Customer createNewCustomer(Customer customer) {

        try {
            String newId = java.util.UUID.randomUUID().toString();
            customer.setId(newId);

            AdminCreateUserRequest createCustomerRequest = AdminCreateUserRequest.builder()
                    .userPoolId("us-east-1_vZN7WiYNK")
                    .username(customer.getEmail())
                    .temporaryPassword("Key@1234")
//                    .userAttributes(
//                            AttributeType.builder().name("id").value(customer.getId()).build()
//                    )
                    .messageAction("SUPPRESS")
                    .build();

            AdminCreateUserResponse response = cognitoClient.adminCreateUser(createCustomerRequest);
            System.out.println(
                    "User " + response.user().username() + "is created. Status: " + response.user().userStatus());
            return customer;

        } catch (CognitoIdentityProviderException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            return null;
        }
    }

    public void signUp() {
        String email = "sharadashehan6@gmail.com";
        String password = "Key@1234";

        String CLIENT_ID = "1fjn8v6osaqv9udtichd3o2vr8";
        String CLIENT_SECRET = "13or9t1duhuu8ktof3s3eq2fct70q9qspddji1ip3ebd9kjkcmr3";
        String USER_POOL_ID = "us-east-1_vZN7WiYNK";

        AttributeType attributePhoneNumber = AttributeType.builder()
                .name("phone_number")
                .value("+94781748749")
                .build();

        AttributeType attributeName = AttributeType.builder()
                .name("name")
                .value("Sharada Shehan")
                .build();

        List<AttributeType> attrs = new ArrayList<>();
        attrs.add(attributePhoneNumber);
        attrs.add(attributeName);

        try {
            String secretVal = calculateSecretHash(CLIENT_ID, CLIENT_SECRET, email);
            SignUpRequest signUpRequest = SignUpRequest.builder()
                    .userAttributes(attrs)
                    .username(email)
                    .clientId(CLIENT_ID)
                    .password(password)
                    .secretHash(secretVal)
                    .build();

            SignUpResponse result = cognitoClient.signUp(signUpRequest);
            System.out.println(result);
            System.out.println("User has been signed up");

        } catch (CognitoIdentityProviderException e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
//        } catch (NoSuchAlgorithmException e) {
//            e.printStackTrace();
//        } catch (InvalidKeyException e) {
//            e.printStackTrace();
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

    public void confirmSignUp(){

        String email = "sharadashehan6@gmail.com";
        String password = "Key@1234";

        String CLIENT_ID = "1fjn8v6osaqv9udtichd3o2vr8";
        String CLIENT_SECRET = "13or9t1duhuu8ktof3s3eq2fct70q9qspddji1ip3ebd9kjkcmr3";
        String USER_POOL_ID = "us-east-1_vZN7WiYNK";
        String confirmationCode = "282327";

        ConfirmSignUpRequest req = ConfirmSignUpRequest.builder()
                .clientId(CLIENT_ID)
                .secretHash(calculateSecretHash(CLIENT_ID, CLIENT_SECRET, email))
                .confirmationCode(confirmationCode)
                .username(email)
                .build();

        ConfirmSignUpResponse response = cognitoClient.confirmSignUp(req);
        System.out.println(response);
        System.out.println("User " + " sign up confirmed");
    }

    public String signIn(String username, String password) {

        String CLIENT_ID = "1fjn8v6osaqv9udtichd3o2vr8";
        String CLIENT_SECRET = "13or9t1duhuu8ktof3s3eq2fct70q9qspddji1ip3ebd9kjkcmr3";
        String USER_POOL_ID = "us-east-1_vZN7WiYNK";

        final Map<String, String> authParams = new HashMap<>();
        authParams.put("USERNAME", username);
        authParams.put("PASSWORD", password);
        authParams.put("SECRET_HASH", calculateSecretHash(CLIENT_ID,
                CLIENT_SECRET, username));

        final AdminInitiateAuthRequest authRequest = AdminInitiateAuthRequest.builder()
                .authFlow(AuthFlowType.ADMIN_USER_PASSWORD_AUTH)
                .clientId(CLIENT_ID)
                .userPoolId(USER_POOL_ID)
                .authParameters(authParams)
                .build();

        AdminInitiateAuthResponse result = cognitoClient.adminInitiateAuth(authRequest);

        System.out.println(result);

        System.out.println(result.authenticationResult().accessToken());
        System.out.println(result.authenticationResult().idToken());

        return result.authenticationResult().accessToken();

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

