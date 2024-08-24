<h1 align="center">🛒 Marketplace Platform 🛍️</h1>

<h2 align="center">🏢 System Architecture (Current) 🛠️</h2>

![sysArchi](resources/system_architecture_v1.png)

Marketplace Platform is a web application that allows users to either buy or sell products. The platform is developed using the Spring Boot and Angular frameworks, integrated with multiple AWS services, ensuring scalability, reliability, and security of the system.

<h2 align="center">📚 Table of Contents 📚</h2>

- [System Design](#system-design)
- [Development Methodology](#development-methodology)
- [System Attributes](#system-attributes)

<h2 align="center" id="system-design">🔧 System Design 🔧</h2>
The system architecture is composed of five core components: the front-end, back-end, database, authentication service, and storage service, all working in collaboration to meet the system's functional requirements. The implementation of these components, uses the following frameworks and services:
- Back-End Services (Spring Boot)
- Front-End Services (Angular)
- Database (Amazon DynamoDB)
- Authentication Service (Amazon Cognito)
- Storage Service (Amazon S3)

### Back-End Services
The back-end is built using the Spring Boot framework, adhering to a microservices architecture. The back-end logic is divided into three distinct microservices—`User`, `Product`, and `Order`—each responsible for isolating specific functionalities. These services interact with one another as needed. <br/>
Microservices are deployed on `AWS Elastic Kubernetes Service` (EKS), offering robust scalability and high reliability. Each microservice is exposed internally within the EKS cluster via ClusterIP services. An Ingress service, managed by an Ingress controller integrated with the cluster, is used to route external traffic to the appropriate microservice based on URL path mapping. <br/>

<p align="center">
<img src="resources/backend_microservices.png" width="70%"/>
</p>

#### Communication of Microservices
Inter-pod communication occurs over the Kubernetes network, ensuring secure and reliable data exchange. The pods are designed to be stateless, with persistent data stored in the database, enabling horizontal scaling without risk of data loss. Pods communicate with each other through services using DNS names provided by the Kubernetes DNS service. <br/>
Communication with external services like Amazon DynamoDB and Amazon S3 is facilitated via a NAT Gateway, allowing pods within private subnets to access the internet. Applications running in the pods utilize the AWS SDK for Java, which offers a high-level API that abstracts the underlying HTTP API interactions with AWS services. The SDK includes built-in retry logic and error handling, enhancing the system's resilience to transient failures.
<h2 align="center" id="development-methodology">🔨 Development Methodology 🔨</h2>

<h2 align="center" id="system-attributes">📈 System Attributes 📈</h2>

### Reliability


### Security
Environment variables containing sensitive information, such as database credentials and API keys, are stored securely in Kubernetes Secrets. <br/>
