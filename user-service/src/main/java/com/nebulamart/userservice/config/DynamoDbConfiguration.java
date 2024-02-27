package com.nebulamart.userservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class DynamoDbConfiguration {

    @Value("${aws-role-user.access-key}")
    private String accessKey;

    @Value("${aws-role-user.secret-key}")
    private String secretKey;

    @Bean
    public DynamoDbClient dynamoDbClient() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        return DynamoDbClient.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(awsCredentialsProvider)
                .build();
    }
}
