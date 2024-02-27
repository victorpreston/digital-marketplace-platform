package com.nebulamart.userservice.service;

import com.nebulamart.userservice.template.StatusResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GlobalSignOutRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GlobalSignOutResponse;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Service
public class UserService {

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
}
