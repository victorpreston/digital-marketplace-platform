package com.nebulamart.orderservice.config;

import com.nebulamart.orderservice.entity.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Configuration
public class DynamoDbConfiguration {

    @Value("${aws-role-user.access-key}")
    private String accessKey;

    @Value("${aws-role-user.secret-key}")
    private String secretKey;

    @Bean
    public DynamoDbTable<Customer> customerTable() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Customer", TableSchema.fromBean(Customer.class));
    }

    @Bean
    public DynamoDbTable<Seller> sellerTable() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Seller", TableSchema.fromBean(Seller.class));
    }

    @Bean
    public DynamoDbTable<Courier> courierTable() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Courier", TableSchema.fromBean(Courier.class));
    }

    @Bean
    public DynamoDbTable<Order> orderTable() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Order", TableSchema.fromBean(Order.class));
    }

    @Bean
    public DynamoDbTable<Review> reviewTable() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Review", TableSchema.fromBean(Review.class));
    }

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
    public DynamoDbIndex<Order> orderTableCourierIndex() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Order", TableSchema.fromBean(Order.class)).index("courier-index");
    }

    @Bean
    public DynamoDbIndex<Order> orderTableSellerIndex() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Order", TableSchema.fromBean(Order.class)).index("seller-index");
    }

    @Bean
    public DynamoDbIndex<Order> orderTableCustomerIndex() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Order", TableSchema.fromBean(Order.class)).index("customer-index");
    }

    @Bean
    public DynamoDbIndex<Order> orderTableProductIndex() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Order", TableSchema.fromBean(Order.class)).index("product-index");
    }

    @Bean
    public DynamoDbIndex<Review> reviewTableProductIndex() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Review", TableSchema.fromBean(Review.class)).index("product-index");
    }

    @Bean
    public DynamoDbIndex<Review> reviewTableSellerIndex() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Review", TableSchema.fromBean(Review.class)).index("seller-index");
    }

    @Bean
    public DynamoDbIndex<Review> reviewTableCourierIndex() {
        AwsCredentialsProvider awsCredentialsProvider = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKey, secretKey));

        DynamoDbEnhancedClient dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(DynamoDbClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(awsCredentialsProvider)
                        .build())
                .build();
        return dynamoDbEnhancedClient.table("Review", TableSchema.fromBean(Review.class)).index("courier-index");
    }

}