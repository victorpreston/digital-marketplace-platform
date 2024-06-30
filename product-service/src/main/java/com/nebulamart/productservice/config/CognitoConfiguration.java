package com.nebulamart.productservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import org.springframework.beans.factory.annotation.Value;

import software.amazon.awssdk.regions.Region;

@Configuration
public class CognitoConfiguration {

    @Value("${aws-role-user.access-key}")
    private String accessKey;

    @Value("${aws-role-user.secret-key}")
    private String secretKey;

    @Bean
    public CognitoIdentityProviderClient cognitoIdentityProviderClient() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        return CognitoIdentityProviderClient.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(awsCredentialsProvider)
                .build();
    }
}
