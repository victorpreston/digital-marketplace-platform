package com.nebulamart.productservice.config;

import com.nebulamart.productservice.entity.Contract;
import com.nebulamart.productservice.entity.Product;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
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
    public DynamoDbTable<Product> productTable() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Product", TableSchema.fromBean(Product.class));
    }

    @Bean
    public DynamoDbTable<Contract> contractTable() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Contract", TableSchema.fromBean(Contract.class));
    }

}