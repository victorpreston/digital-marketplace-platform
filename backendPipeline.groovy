pipeline {
   tools {
        maven 'Maven3'
    }
    agent any
    environment {
        userServicePort = "9001"
        productServicePort = "9002"
        orderServicePort = "9003"
        userRegistryName = "marketplace/user-service-image"
        productRegistryName = "marketplace/product-service-image"
        orderRegistryName = "marketplace/order-service-image"
        awsAccountId = "<AWS_ACCOUNT_ID>"
        awsRegion = "<AWS_REGION>"
        jwtIssuerUri = "<JWT_ISSUER_URI>"
        cognitoUserPoolId = "<COGNITO_USER_POOL_ID>"
        cognitoUserPoolClientId = "<COGNITO_USER_POOL_CLIENT_ID>"
        cognitoUserPoolClientSecret = "<COGNITO_USER_POOL_CLIENT_SECRET>"
        awsS3BucketName = "<AWS_S3_BUCKET_NAME>"
        awsUserAccessKey = "<AWS_USER_ACCESS_KEY>"
        awsUserSecretKey = "<AWS_USER_SECRET_KEY>"
        gitHubKey = "<GITHUB_SSH_KEY_ID>"
        gitHubUrl = "<GITHUB_REPO_SSH_URL>"
        gitHubBranch = "*/<GITHUB_BRANCH>"
    }

    triggers {
        // Polling the Git repository every 1 minute
        pollSCM('*/1 * * * *')
    }

    stages {
        // Cloning the Git repository
        stage('Cloning Git') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: "*/${gitHubBranch}"]], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[credentialsId: "${gitHubKey}", url: "${gitHubUrl}"]]])
            }
        }

        // Building the application
        stage ('Build') {
            steps {
                withEnv([
                    "ISSUER_URI=${jwtIssuerUri}",
                    "S3_BUCKET_NAME=${awsS3BucketName}",
                    "AWS_ACCESS_KEY=${awsUserAccessKey}",
                    "AWS_SECRET_KEY=${awsUserSecretKey}"
                ]) {
                    script {
                        withEnv([
                            "PORT=${userServicePort}",
                            "USER_POOL_ID=${cognitoUserPoolId}",
                            "USER_POOL_CLIENT_ID=${cognitoUserPoolClientId}",
                            "USER_POOL_CLIENT_SECRET=${cognitoUserPoolClientSecret}"
                        ]) {
                            dir ('user-service') {
                                sh 'mv src/main/resources/application-prod.yml src/main/resources/application.yml'
                                sh 'mvn clean package'
                            }
                        }
                        withEnv([
                            "PORT=${productServicePort}",
                            "USER_SERVICE_HOST=localhost",
                            "USER_SERVICE_PORT=${userServicePort}"
                        ]) {
                            dir ('product-service') {
                                sh 'mv src/main/resources/application-prod.yml src/main/resources/application.yml'
                                sh 'mvn clean package'
                            }
                        }
                        withEnv([
                            "PORT=${orderServicePort}",
                            "USER_SERVICE_HOST=localhost",
                            "USER_SERVICE_PORT=${userServicePort}",
                            "PRODUCT_SERVICE_HOST=localhost",
                            "PRODUCT_SERVICE_PORT=${productServicePort}"
                        ]) {
                            dir ('order-service') {
                                sh 'mv src/main/resources/application-prod.yml src/main/resources/application.yml'
                                sh 'mvn clean package'
                            }
                        }
                    }
                }
            }
        }

        // Building Docker images
        stage('Building image') {
            steps{
                script {
                    dir ('user-service') {
                        sh "mv src/main/resources/application.yml src/main/resources/application-prod.yml"
                        sh "docker build -t ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/${userRegistryName}:latest ."
                    }
                    dir ('product-service') {
                        sh "mv src/main/resources/application.yml src/main/resources/application-prod.yml"
                        sh "docker build -t ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/${productRegistryName}:latest ."
                    }
                    dir ('order-service') {
                        sh "mv src/main/resources/application.yml src/main/resources/application-prod.yml"
                        sh "docker build -t ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/${orderRegistryName}:latest ."
                    }
                    sh 'docker images'
                }
            }
        }
   
        // Uploading Docker images into AWS ECR
        stage('Pushing to ECR') {
            steps{  
                script {
                    sh "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 058264124182.dkr.ecr.us-east-1.amazonaws.com"
                    sh "docker push ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/${userRegistryName}:latest"
                    sh "docker push ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/${productRegistryName}:latest"
                    sh "docker push ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/${orderRegistryName}:latest"
                }
            }
        }

        // Deploying the application into AWS EKS
        stage('K8S Deploy') {
            steps{ 
                script {
                    sh "sed -i 's|<USER_SERVICE_IMAGE>|${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/${userRegistryName}:latest|g' eks-deploy.yml"
                    sh "sed -i 's|<PRODUCT_SERVICE_IMAGE>|${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/${productRegistryName}:latest|g' eks-deploy.yml"
                    sh "sed -i 's|<ORDER_SERVICE_IMAGE>|${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com/${orderRegistryName}:latest|g' eks-deploy.yml"
                    sh "sed -i 's|<JWT_ISSUER_URI>|${jwtIssuerUri}|g' eks-deploy.yml"
                    sh "sed -i 's|<COGNITO_USER_POOL_ID>|${cognitoUserPoolId}|g' eks-deploy.yml"
                    sh "sed -i 's|<COGNITO_USER_POOL_CLIENT_ID>|${cognitoUserPoolClientId}|g' eks-deploy.yml"
                    sh "sed -i 's|<COGNITO_USER_POOL_CLIENT_SECRET>|${cognitoUserPoolClientSecret}|g' eks-deploy.yml"
                    sh "sed -i 's|<AWS_S3_BUCKET_NAME>|${awsS3BucketName}|g' eks-deploy.yml"
                    sh "sed -i 's|<AWS_ACCESS_KEY>|${awsUserAccessKey}|g' eks-deploy.yml"
                    sh "sed -i 's|<AWS_SECRET_KEY>|${awsUserSecretKey}|g' eks-deploy.yml"
                    sh "cat eks-deploy.yml"
                    withKubeConfig([credentialsId: 'K8S']) {
                        sh ('kubectl apply -f  eks-deploy.yml')
                    }
                }
            }
        }
    }
}
