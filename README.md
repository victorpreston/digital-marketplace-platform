# MarketplacePlatform
## Microservices on Kubernetes (Minikube)

### Prerequisites
1. Install Docker
2. Install Minikube
3. Install Kubectl
4. Logged into Docker Hub

### Steps
1. Clone the repository

2. Compile and Package microservices with maven

User Service
    
    cd user-service
    mvn clean package
    
Product Service
    
    cd product-service
    mvn clean package
    
Order Service
    
    cd order-service
    mvn clean package
    
3. Build Docker images and push to Docker Hub

User Service
    
    cd user-service
    docker build -t <dockerhub-username>/marketplace-user-service:latest .
    docker push <dockerhub-username>/marketplace-user-service:latest
    
Product Service
    
    cd product-service
    docker build -t <dockerhub-username>/marketplace-product-service:latest .
    docker push <dockerhub-username>/marketplace-product-service:latest

Order Service

    cd order-service
    docker build -t <dockerhub-username>/marketplace-order-service:latest .
    docker push <dockerhub-username>/marketplace-order-service:latest

4. Edit environment variables in deploy.yml file

In `<dockerhub-username>/marketplace-user-service:latest`, `<dockerhub-username>/marketplace-product-service:latest` and `<dockerhub-username>/marketplace-order-service:latest` replace `<dockerhub-username>` with your Docker Hub username.

Replace `<cognito-issuer-uri>` with your JWT issuer URI from AWS Cognito.

Replace `<cognito-user-pool-id>`, `<cognito-user-pool-client-id>` and `<cognito-user-pool-client-secret>` with your AWS Cognito user pool ID, client ID and client secret respectively.

Replace `<s3-bucket-name>` with your AWS S3 bucket name.

Replace `<aws-user-account-access-key>` and `<aws-user-account-secret-key>` with your AWS user access key and secret key respectively.

5. Start Minikube

    ```
    minikube start
    ```

6. Deploy microservices

    ```
    minikube kubectl apply -f deploy.yml
    ```
    or if you have kubectl installed and configured to use Minikube, you can use the following command:
    ```
    kubectl apply -f deploy.yml
    ```

7. Run Minikube Tunnel (To access services from outside the cluster)

    ```
    minikube tunnel
    ```

8. Access the services

Now you can access the services using the localhost IP and default HTTP port 80 `(http://127.0.0.1)`.

    http://127.0.0.1/api/products/{productId}



