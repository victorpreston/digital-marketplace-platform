# MarketplacePlatform
## Microservices with docker-compose and NGINX as reverse proxy

1. Clone the repository

2. Compile and Package microservices with maven

User Service
```
cd user-service
mvn clean package
```

Product Service
```
cd product-service
mvn clean package
```

Order Service
```
cd order-service
mvn clean package
```

3. create .env file in the root directory and add the following variables:
```
USER_SERVICE_PORT=port-for-user-service
PRODUCT_SERVICE_PORT=port-for-product-service
ORDER_SERVICE_PORT=port-for-order-service
JWT_ISSUER_URI=jwt-issuer-uri
COGNITO_USER_POOL_ID=cognito-user-pool-id
COGNITO_USER_POOL_CLIENT_ID=cognito-user-pool-client-id
COGNITO_USER_POOL_CLIENT_SECRET=cognito-user-pool-client-secret
AWS_S3_BUCKET_NAME=aws-s3-bucket-name
AWS_USER_ACCESS_KEY=aws-user-access-key
AWS_USER_SECRET_KEY=aws-user-secret-key
```

4. Run the following command to start the services
```
docker-compose up
```
