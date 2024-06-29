package com.nebulamart.userservice.service;

import com.nebulamart.userservice.template.*;
import com.nebulamart.userservice.template.ChangePasswordResponse;
import com.nebulamart.userservice.util.AuthFacade;
import com.nebulamart.userservice.util.SecretHash;
import com.nebulamart.userservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    private final CognitoIdentityProviderClient cognitoClient;
    private final AuthFacade authFacade;

    @Value("${aws-cognito.user-pool-id}")
    private String userPoolId;

    @Value("${aws-cognito.user-pool-client-id}")
    private String clientId;

    @Value("${aws-cognito.user-pool-client-secret}")
    private String clientSecret;

    @Autowired
    public UserService(CognitoIdentityProviderClient cognitoClient, DynamoDbClient dynamoDbClient, AuthFacade authFacade, CustomerService customerService) {
        this.cognitoClient = cognitoClient;
        this.authFacade = authFacade;
    }

    public VerifyAccountResponse confirmSignUp(String email, String confirmationCode) {

        ConfirmSignUpRequest req = ConfirmSignUpRequest.builder()
                .clientId(clientId)
                .secretHash(SecretHash.calculateSecretHash(clientId, clientSecret, email))
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
        authParams.put("SECRET_HASH", SecretHash.calculateSecretHash(clientId, clientSecret, userSignIn.getEmail()));

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

    public StatusResponse signOut(String accessToken) {
        GlobalSignOutRequest signOutRequest = GlobalSignOutRequest.builder()
                .accessToken(accessToken)
                .build();

        GlobalSignOutResponse response = cognitoClient.globalSignOut(signOutRequest);
        return new StatusResponse(response.sdkHttpResponse().isSuccessful());
    }

    public ChangePasswordResponse changeTempPassword(String accessToken, String oldPassword, String newPassword) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String cognitoUsername = authFacade.getCognitoUsername(wrappedUser);
            String email = authFacade.getEmail(wrappedUser);
            String role = authFacade.getRole(wrappedUser);

            if (role.equals("CUSTOMER")) {
                SignInResponse signInResponse = signIn(new UserSignIn(email, oldPassword));
                if (signInResponse.getAccessToken() == null) {
                    throw new Exception("Invalid old password");
                }
            } else if (role.equals("SELLER")) {
                throw new Exception("Not implemented");
            } else if (role.equals("COURIER")) {
                throw new Exception("Not implemented");
            } else {
                throw new Exception("Invalid role");
            }

            AdminSetUserPasswordRequest passwordRequest = AdminSetUserPasswordRequest.builder()
                    .username(cognitoUsername)
                    .userPoolId(userPoolId)
                    .password(newPassword)
                    .permanent(true)
                    .build();

            AdminSetUserPasswordResponse response = cognitoClient.adminSetUserPassword(passwordRequest);
            if (response.sdkHttpResponse().isSuccessful()) {
                return new ChangePasswordResponse(true);
            } else {
                return new ChangePasswordResponse(false, "Failed to change password");
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return new ChangePasswordResponse(false, e.getMessage());
        }
    }
}
