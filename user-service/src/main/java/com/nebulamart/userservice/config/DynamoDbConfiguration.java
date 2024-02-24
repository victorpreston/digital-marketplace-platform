package com.nebulamart.userservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Configuration
public class DynamoDbConfiguration {

    @Bean
    public DynamoDbClient dynamoDbClient() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create("${AWS_ACCESS_KEY}", "${AWS_SECRET_KEY}"));

        return DynamoDbClient.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(awsCredentialsProvider)
                .build();
    }
}
