package com.nebulamart.userservice.service;

import com.nebulamart.userservice.entity.Courier;
import com.nebulamart.userservice.template.CourierSignUp;
import com.nebulamart.userservice.util.AuthFacade;
import com.nebulamart.userservice.util.SecretHash;
import com.nebulamart.userservice.util.WrappedUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.SignUpResponse;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import java.util.ArrayList;
import java.util.List;

@Service
public class CourierService {
    private final CognitoIdentityProviderClient cognitoClient;
    private final DynamoDbClient dynamoDbClient;
    private final AuthFacade authFacade;

    @Value("${aws-cognito.user-pool-id}")
    private String userPoolId;

    @Value("${aws-cognito.user-pool-client-id}")
    private String clientId;

    @Value("${aws-cognito.user-pool-client-secret}")
    private String clientSecret;

    @Autowired
    public CourierService(CognitoIdentityProviderClient cognitoClient, DynamoDbClient dynamoDbClient, AuthFacade authFacade) {
        this.cognitoClient = cognitoClient;
        this.dynamoDbClient = dynamoDbClient;
        this.authFacade = authFacade;
    }

    public Courier courierSignUp(CourierSignUp courierSignUp) {

        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();

        AttributeType attributeRole = AttributeType.builder()
                .name("custom:role")
                .value("COURIER")
                .build();

        List<AttributeType> attrs = new ArrayList<>();
        attrs.add(attributeRole);

        try {
            String secretVal = SecretHash.calculateSecretHash(clientId, clientSecret, courierSignUp.getEmail());
            SignUpRequest signUpRequest = SignUpRequest.builder()
                    .userAttributes(attrs)
                    .username(courierSignUp.getEmail())
                    .clientId(clientId)
                    .password(courierSignUp.getPassword())
                    .secretHash(secretVal)
                    .build();

            SignUpResponse result = cognitoClient.signUp(signUpRequest);
            String userId = result.userSub();
            Courier courier = new Courier(userId, courierSignUp.getName(), courierSignUp.getEmail(), courierSignUp.getContactNumber(), courierSignUp.getLogoUrl(), 0, 0);

            DynamoDbTable<Courier> courierTable = enhancedClient.table("Courier", TableSchema.fromBean(Courier.class));
            courierTable.putItem(courier);
            return courier;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public Courier getCourierDetails(String accessToken) {
        try {
            WrappedUser wrappedUser = authFacade.getWrappedUser(accessToken);
            return (Courier) authFacade.getUser(wrappedUser);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
