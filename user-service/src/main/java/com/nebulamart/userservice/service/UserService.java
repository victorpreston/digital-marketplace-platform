package com.nebulamart.userservice.service;

import com.nebulamart.userservice.template.*;
import com.nebulamart.userservice.template.ChangePasswordResponse;
import com.nebulamart.userservice.util.AuthFacade;
import com.nebulamart.userservice.util.SecretHash;
import com.nebulamart.userservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;
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
    public UserService(CognitoIdentityProviderClient cognitoClient, AuthFacade authFacade, CustomerService customerService) {
        this.cognitoClient = cognitoClient;
        this.authFacade = authFacade;
    }

    public ResponseEntity<VerifyAccountResponse> confirmSignUp(String email, String confirmationCode) {
        try {
            ConfirmSignUpRequest req = ConfirmSignUpRequest.builder()
                    .clientId(clientId)
                    .secretHash(SecretHash.calculateSecretHash(clientId, clientSecret, email))
                    .confirmationCode(confirmationCode)
                    .username(email)
                    .build();
            ConfirmSignUpResponse response = cognitoClient.confirmSignUp(req);
            if (response.sdkHttpResponse().isSuccessful()) {
                return ResponseEntity.ok(new VerifyAccountResponse(true, "Account verified successfully"));
            }
            return ResponseEntity.status(400).body(new VerifyAccountResponse(false, "Account verification failed"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new VerifyAccountResponse(false, e.getMessage()));
        }
    }

    public ResponseEntity<SignInResponse> signIn(UserSignIn userSignIn) {
        try {
            final Map<String, String> authParams = new HashMap<>();
            authParams.put("USERNAME", userSignIn.getEmail());
            authParams.put("PASSWORD", userSignIn.getPassword());
            authParams.put("SECRET_HASH", SecretHash.calculateSecretHash(clientId, clientSecret, userSignIn.getEmail()));
            final AdminInitiateAuthRequest authRequest = AdminInitiateAuthRequest.builder()
                    .authFlow(AuthFlowType.ADMIN_USER_PASSWORD_AUTH)
                    .clientId(clientId)
                    .userPoolId(userPoolId)
                    .authParameters(authParams)
                    .build();
            AdminInitiateAuthResponse result = cognitoClient.adminInitiateAuth(authRequest);
            return ResponseEntity.ok(new SignInResponse(result.authenticationResult().idToken(), result.authenticationResult().accessToken()));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new SignInResponse(null, null, e.getMessage()));
        }
    }

    public ResponseEntity<StatusResponse> signOut(String bearerHeader) {
        try {
            String accessToken = bearerHeader.split(" ")[1];
            GlobalSignOutRequest signOutRequest = GlobalSignOutRequest.builder().accessToken(accessToken).build();
            GlobalSignOutResponse response = cognitoClient.globalSignOut(signOutRequest);
            return ResponseEntity.ok(new StatusResponse(response.sdkHttpResponse().isSuccessful()));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new StatusResponse(false));
        }
    }

    public ResponseEntity<ChangePasswordResponse> changeTempPassword(String accessToken, String oldPassword, String newPassword) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            String cognitoUsername = authFacade.getCognitoUsername(wrappedUser);
            String email = authFacade.getEmail(wrappedUser);

            SignInResponse signInResponse = signIn(new UserSignIn(email, oldPassword)).getBody();
            if (signInResponse == null || signInResponse.getAccessToken() == null) {
                throw new Exception("Invalid old password");
            }
            AdminSetUserPasswordRequest passwordRequest = AdminSetUserPasswordRequest.builder()
                    .username(cognitoUsername)
                    .userPoolId(userPoolId)
                    .password(newPassword)
                    .permanent(true)
                    .build();
            AdminSetUserPasswordResponse response = cognitoClient.adminSetUserPassword(passwordRequest);
            if (response.sdkHttpResponse().isSuccessful()) {
                return ResponseEntity.ok(new ChangePasswordResponse(true, "Password changed successfully"));
            }
            return ResponseEntity.status(400).body(new ChangePasswordResponse(false, "Failed to change password"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(400).body(new ChangePasswordResponse(false, e.getMessage()));
        }
    }
}
