package com.nebulamart.userservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.nebulamart.userservice.template.ChangePasswordResponse;
import com.nebulamart.userservice.template.SignInResponse;
import com.nebulamart.userservice.template.StatusResponse;
import com.nebulamart.userservice.template.UserSignIn;
import com.nebulamart.userservice.util.AuthFacade;
import com.nebulamart.userservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Service
public class UserService {

    private final CognitoIdentityProviderClient cognitoClient;

    @Autowired
    private DynamoDbClient dynamoDbClient;

    @Autowired
    private AuthFacade authFacade;

    @Autowired
    private CustomerService customerService;

    @Value("${aws-cognito.user-pool-id}")
    private String userPoolId;

    @Value("${aws-cognito.user-pool-client-id}")
    private String clientId;

    @Value("${aws-cognito.user-pool-client-secret}")
    private String clientSecret;

    @Autowired
    public UserService(CognitoIdentityProviderClient cognitoClient) {
        this.cognitoClient = cognitoClient;
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
            String cognitoUsername = wrappedUser.getCognitoUsername();

            SignInResponse signInResponse = customerService.signIn(new UserSignIn(wrappedUser.getEmail(), oldPassword));
            if (signInResponse.getAccessToken() == null) {
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
