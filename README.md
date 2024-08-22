# MarketplacePlatform
## Microservices on Kubernetes (AWS EKS) with Jenkins CI/CD Pipeline

### Prerequisites
1. An EC2 instance (t2.medium or higher) with Ubuntu 20.04 LTS installed and port 8080 open.
2. An IAM role with AdministratorAccess policy attached to the EC2 instance.
3. ECR repositories created for the microservices. You can create them using the following commands.

    ```
    aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<region>.amazonaws.com
    ```
    ```
    aws ecr create-repository --repository-name marketplace/user-service-image
    ```
    ```
    aws ecr create-repository --repository-name marketplace/product-service-image
    ```
    ```
    aws ecr create-repository --repository-name marketplace/order-service-image
    ```
4. Helm installed on the EC2 instance. You can install it using the following commands.
    ```
    curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
    ```
    ```
    sudo apt-get install apt-transport-https --yes
    ```
    ```
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
    ```
    ```
    sudo apt-get update
    ```
    ```
    sudo apt-get install helm
    ```
    ```
    helm version
    ```
    
### Steps
1. SSH into the EC2 instance and update the package list.
    ```
    sudo apt update
    ```

2. Install Java and Maven.
    ```
    sudo apt-get install default-jdk -y
    ```
    ```
    java -version
    ```
    ```
    sudo apt install maven -y
    ```
    ```
    mvn --version
    ```

3. Install Jenkins.
    ```
    sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
    ```
    ```
    echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
    ```
    ```
    sudo apt-get update
    ```
    ```
    sudo apt-get install jenkins -y
    ```

4. Get the Jenkins Admin password.
    ```
    sudo cat /var/lib/jenkins/secrets/initialAdminPassword
    ```

5. Access Jenkins on a web browser using the public IP of the EC2 instance and port 8080.
    ```
    http://<public-ip>:8080
    ```
    Enter the password obtained in step 4. Install the suggested plugins. Create an admin user account.

6. SSH into the EC2 instance and Install AWS, eksctl and kubectl CLI.
    
    AWS CLI:
    ```
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    ```
    ```
    sudo apt install unzip
    ```
    ```
    sudo unzip awscliv2.zip
    ```
    ```
    sudo ./aws/install
    ```
    ```
    aws --version
    ```

    eksctl CLI:
    ```
    curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
    ```
    ```
    sudo mv /tmp/eksctl /usr/local/bin
    ```
    ```
    eksctl version
    ```

    kubectl CLI:
    ```
    sudo curl --silent --location -o /usr/local/bin/kubectl https://s3.us-west-2.amazonaws.com/amazon-eks/1.22.6/2022-03-09/bin/linux/amd64/kubectl
    ```
    ```
    sudo chmod +x /usr/local/bin/kubectl
    ```
    ```
    kubectl version --short --client
    ```

7. Switch to Jenkins user, create an AWS EKS cluster and configure kubectl.
    ```
    sudo su - jenkins
    ```
    ```
    eksctl create cluster --name <cluster-name> --region <region> --nodegroup-name <nodegroup-name> --node-type t3.small --nodes 2 --managed
    ```
    ```
    eksctl get cluster --name <cluster-name> --region <region>
    ```
    ```
    aws eks update-kubeconfig --name <cluster-name> --region <region>
    ```
    
    Copy the content in config file to a file named kubeconfig in your pc.
    ```
    cat /var/lib/jenkins/.kube/config
    ```
        
8. Create an ingress controller for the EKS cluster.
    ```
    eksctl utils associate-iam-oidc-provider --cluster <cluster-name> --approve
    ```
    Copy the `iam_policy.json`(from the repository) to the current directory of the EC2 instance.
    ```
    aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json
    ```
    Get the ARN of the created IAM policy.
    ```
    eksctl create iamserviceaccount --cluster=<cluster-name> --namespace=kube-system --name=aws-load-balancer-controller --attach-policy-arn=<ARN-of-created-iam-policy> --override-existing-serviceaccounts --approve
    ```
    ```
    helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=marketplace-eks --set serviceAccount.create=false --set serviceAccount.name=aws-load-balancer-controller
    ```

9. Switch back to the root user and install docker.
    ```
    sudo apt install docker.io -y
    ```
    Add the Jenkins user to the docker group.
    ```
    sudo usermod -aG docker $USER
    ```
    Restart Jenkins, System daemon and Docker.
    ```
    sudo service jenkins restart
    ```
    ```
    sudo systemctl daemon-reload
    ```
    ```
    sudo service docker stop
    ```
    ```
    sudo service docker start
    ```

10. Access Jenkins via web browser, to complete following configurations.
    Install the following plugins:
    - Docker
    - Docker Pipeline
    - Kubernetes CLI

    Create Maven3 variable under Global Tool Configuration. (Tools -> Maven installations > Add Maven)
    - Name: Maven3
    - MAVEN_HOME: /usr/share/maven

    Create Credentials for AWS EKS. (Credentials -> Global credentials -> Add Credentials)
    - Kind: Secret file
    - ID: K8S
    - Upload the kubeconfig file created in step 7.

11. Create a new pipeline job in Jenkins. In `jenkins-pipeline.groovy` file, replace environment variable values enclosed within <> with your values. Copy the content of the file and paste it in the pipeline script section of the Jenkins job. Save the job and run it.
