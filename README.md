<h1 align="center">NebulaMart - Digital Marketplace Platform</h1>

<p align="center">
  <strong>A scalable, cloud-native e-commerce platform built with microservices architecture</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Angular-18.0-red" alt="Angular">
  <img src="https://img.shields.io/badge/AWS-Cloud-orange" alt="AWS">
  <img src="https://img.shields.io/badge/Kubernetes-EKS-blue" alt="Kubernetes">
  <img src="https://img.shields.io/badge/Java-17-blue" alt="Java">
</p>

---

## Quick Links

- [Getting Started](#getting-started) - Setup and installation guide
- [API Reference](#api-reference) - Complete API documentation
- [System Design](#system-design) - Architecture and design patterns
- [Development Methodology](#development-methodology) - CI/CD pipelines
- [Contributing](#contributing) - How to contribute

---

## Overview

NebulaMart is a full-featured digital marketplace platform that enables users to buy and sell products seamlessly. Built with modern microservices architecture, the platform leverages Spring Boot for backend services, Angular for the frontend, and integrates with multiple AWS services to ensure scalability, reliability, and security.

### Key Features

- **Multi-Role Authentication** - Customer, Seller, and Courier roles with Amazon Cognito
- **Product Management** - Complete CRUD operations for products with image storage
- **Order Processing** - End-to-end order management system
- **Delivery Contracts** - Dynamic courier assignment and contract management
- **Review System** - Product and courier ratings and reviews
- **Advanced Search** - Filter products by category, price range, and text search
- **Responsive UI** - Built with Angular Material for seamless user experience
- **Secure** - JWT-based authentication with role-based access control
- **Scalable** - Microservices deployed on AWS EKS with auto-scaling capabilities

<h2 align="center">System Architecture</h2>

![System Architecture](resources/system_architecture_v1.png)

<h2 align="center">Table of Contents</h2>

- [Tech Stack](#tech-stack)
- [System Design](#system-design)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Development Methodology](#development-methodology)
- [System Attributes](#system-attributes)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)

---

<h2 align="center" id="tech-stack">Tech Stack</h2>

### Backend
- Spring Boot 3.2.3 | Java 17 | Maven
- Spring Security with OAuth2 Resource Server
- AWS SDK v2 (DynamoDB, S3, Cognito, Secrets Manager)

### Frontend
- Angular 18.0 | Angular Material
- NgRx State Management
- Chart.js, ngx-toastr, angular-oauth2-oidc

### Infrastructure
- AWS EKS (Elastic Kubernetes Service)
- Amazon DynamoDB | Amazon S3 | Amazon Cognito
- CI/CD: AWS CodePipeline (Frontend), Jenkins (Backend)
- Docker, Docker Compose, NGINX

---

<h2 align="center" id="getting-started">Getting Started</h2>

### Quick Start

**Prerequisites**: Java 17+, Node.js 18+, Maven, Docker, AWS CLI

```bash
# Clone repository
git clone <repository-url>
cd digital-marketplace-platform

# Configure .env file with AWS credentials

# Run with Docker Compose (Recommended)
docker-compose up --build

# Services available at:
# - NGINX Gateway: http://localhost:80
# - Frontend: http://localhost:4200
```

**AWS Setup Required**: DynamoDB tables (users, products, orders, contracts, reviews), S3 bucket, Cognito User Pool

---

<h2 align="center" id="system-design">System Design</h2>

The platform consists of five core components: Spring Boot microservices (User, Product, Order), Angular frontend, DynamoDB database, Cognito authentication, and S3 storage.

### Microservices Architecture
- Three Spring Boot microservices deployed on AWS EKS with ClusterIP services for internal communication
- Ingress controller routes external traffic to microservices based on URL path mapping

<p align="center">
<img src="resources/backend_microservices.png" width="70%"/>
</p>

#### Communication & Design Patterns
- **Inter-Service Communication**: Stateless pods communicate over Kubernetes network using DNS service names. External AWS services (DynamoDB, S3) accessed via NAT Gateway with AWS SDK for Java.
- **Design Patterns**: Repository (data access abstraction), Builder (AWS SDK clients), Chain of Responsibility (security filters), DTOs (data transfer), Adapter (JWT authentication), Facade (DynamoDB operations).

### Frontend, Database & AWS Services
- **Frontend**: Angular application hosted on S3 with static website hosting, communicates with backend via RESTful APIs
- **Database**: Amazon DynamoDB with Global Secondary Indexes (GSIs) for optimized queries on users, products, orders, contracts, and reviews
- **Authentication**: Amazon Cognito for user authentication and Role-Based Access Control (RBAC)
- **Storage**: Amazon S3 for product images with pre-signed URLs for direct uploads

<h2 align="center" id="development-methodology">Development Methodology</h2>

### CI/CD Pipelines

**Frontend** (AWS CodePipeline): Source → Build (npm, Angular CLI) → Deploy (S3) - See `front-dev-cicd` branch

**Backend** (Jenkins): Source → Package (Maven) → Build (Docker → ECR) → Deploy (EKS) - See `eks-jenkins-pipeline` branch

### Local Development Options
- **Native**: Spring Boot with Eureka Server (`local` branch)
- **Docker Compose**: NGINX reverse proxy (`docker-compose` branch)
- **Minikube**: Local Kubernetes cluster (`minikube-kubernetes` branch)

<h2 align="center" id="system-attributes">System Attributes</h2>

### Reliability
- Multi-instance microservices in EKS with Multi-AZ deployment and automatic pod restarts
- DynamoDB with multi-AZ replication and S3 multi-facility storage for high availability

### Security
- **Application**: Kubernetes Secrets for credentials, Cognito for verified users, IAM policies, JWT validation
- **Network**: Private subnets for pods, public Ingress controller, SSH-only access to Jenkins
- **Data**: Encryption at rest (DynamoDB with KMS, S3 with SSE-S3)

---

<h2 align="center" id="api-reference">API Reference</h2>

The platform exposes RESTful APIs for all operations. All authenticated endpoints require a valid JWT token in the Authorization header.

### Authentication Endpoints

#### Sign Up - Customer

```http
POST /api/auth/sign-up/customer
```

**Request Body:**
```json
{
  "name": "user_name",
  "email": "user_email",
  "password": "password",
  "contactNumber": "mobile_number",
  "address": "user_address"
}
```

#### Sign Up - Seller

```http
POST /api/auth/sign-up/seller
```

**Request Body:**
```json
{
  "name": "seller_name",
  "email": "seller_email",
  "password": "password",
  "contactNumber": "mobile_number",
  "address": "seller_address"
}
```

#### Sign Up - Courier

```http
POST /api/auth/sign-up/courier
```

**Request Body:**
```json
{
  "name": "courier_name",
  "email": "courier_email",
  "password": "password",
  "contactNumber": "mobile_number"
}
```

#### Verify Account

```http
GET /api/auth/verify-account?email={email}&code={verification_code}
```

**Query Parameters:**
- `email` - User's email address
- `code` - Verification code sent to email

#### Sign In

```http
POST /api/auth/sign-in
```

**Request Body:**
```json
{
  "email": "user_email",
  "password": "password"
}
```

**Response:** Returns JWT tokens for authentication

#### Sign Out

```http
GET /api/user/sign-out
```

**Authentication:** Any User ID Token Required

#### Change Password

```http
POST /api/user/change-password
```

**Authentication:** Any User ID Token Required

**Request Body:**
```json
{
  "newPassword": "new_password",
  "oldPassword": "old_password"
}
```

---

### User Management Endpoints

#### Get Customer Account

```http
GET /api/customer/account
```

**Authentication:** Customer ID Token Required

#### Get Seller Account

```http
GET /api/seller/account
```

**Authentication:** Seller ID Token Required

#### Get Courier Account

```http
GET /api/courier/account
```

**Authentication:** Courier ID Token Required

#### Update Customer Account

```http
PATCH /api/customer/account
```

**Authentication:** Customer ID Token Required

**Request Body:**
```json
{
  "name": "new_customer_name"
}
```

#### Update Seller Account

```http
PATCH /api/seller/account
```

**Authentication:** Seller ID Token Required

**Request Body:**
```json
{
  "name": "new_seller_name"
}
```

#### Update Courier Account

```http
PATCH /api/courier/account
```

**Authentication:** Courier ID Token Required

**Request Body:**
```json
{
  "contactNumber": "new_mobile_number"
}
```

#### Get Seller Details

```http
GET /api/sellers/{seller_id}
```

**Path Parameters:**
- `seller_id` - Unique identifier of the seller

#### Get Courier Details

```http
GET /api/couriers/{courier_id}
```

**Path Parameters:**
- `courier_id` - Unique identifier of the courier

#### Get Couriers List

```http
GET /api/seller/couriers-list
```

**Authentication:** Seller ID Token Required

---

### Product Management Endpoints

#### Get Product Image Upload URL

```http
GET /api/product/upload-url?extension={file_extension}
```

**Authentication:** Seller ID Token Required

**Query Parameters:**
- `extension` - File extension (e.g., jpg, png)

**Response:** Pre-signed S3 URL for image upload

#### Get Logo Upload URL

```http
GET /api/logo-upload-url?extension={file_extension}
```

**Query Parameters:**
- `extension` - File extension (e.g., jpg, png)

**Response:** Pre-signed S3 URL for logo upload

#### Create Product

```http
POST /api/product/create
```

**Authentication:** Seller ID Token Required

**Request Body:**
```json
{
  "name": "product_name",
  "description": "product_description",
  "brand": "product_brand",
  "imageUrls": [],
  "category": "ELECTRONICS",
  "stock": 10,
  "basePrice": 200000,
  "discount": 0
}
```

#### Update Product

```http
PATCH /api/product/{product_id}
```

**Authentication:** Seller ID Token Required

**Path Parameters:**
- `product_id` - Unique identifier of the product

**Request Body:**
```json
{
  "description": "new_description"
}
```

#### Delete Product

```http
DELETE /api/product/{product_id}
```

**Authentication:** Seller ID Token Required

**Path Parameters:**
- `product_id` - Unique identifier of the product

#### Get Product (Seller View)

```http
GET /api/product/{product_id}
```

**Authentication:** Seller ID Token Required

**Path Parameters:**
- `product_id` - Unique identifier of the product

#### Get All Products (Public)

```http
GET /api/products?page={page_number}
```

**Query Parameters:**
- `page` - Page number for pagination

#### Search Products

```http
GET /api/products/search?page={page_number}&category={category}&text={search_text}&minPrice={min_price}&maxPrice={max_price}
```

**Query Parameters:**
- `page` - Page number for pagination
- `category` - Product category filter
- `text` - Search text for product name/description
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter

#### Get Product Details (Public)

```http
GET /api/products/{product_id}
```

**Path Parameters:**
- `product_id` - Unique identifier of the product

#### Get Unmodified Product Details

```http
GET /api/products/{product_id}/unmodified
```

**Path Parameters:**
- `product_id` - Unique identifier of the product

---

### Contract Management Endpoints

Contracts manage the relationship between sellers and couriers for product delivery.

#### Get All Contracts

```http
GET /api/contracts
```

**Authentication:** Seller or Courier ID Token Required

#### Get Contract Details

```http
GET /api/contracts/{contract_id}
```

**Authentication:** Seller or Courier ID Token Required

**Path Parameters:**
- `contract_id` - Unique identifier of the contract

#### Add Courier to Product (Seller)

```http
POST /api/contract/seller/add-courier
```

**Authentication:** Seller ID Token Required

**Request Body:**
```json
{
  "productId": "product_id",
  "courierId": "courier_id"
}
```

#### Remove Courier from Product (Seller)

```http
DELETE /api/contract/seller/remove-courier/{product_id}
```

**Authentication:** Seller ID Token Required

**Path Parameters:**
- `product_id` - Unique identifier of the product

#### Change Courier for Product (Seller)

```http
POST /api/contract/seller/change-courier
```

**Authentication:** Seller ID Token Required

**Request Body:**
```json
{
  "productId": "product_id",
  "courierId": "courier_id"
}
```

#### Delete Contract (Seller)

```http
DELETE /api/contract/seller/delete-contract/{contract_id}
```

**Authentication:** Seller ID Token Required

**Path Parameters:**
- `contract_id` - Unique identifier of the contract

#### Respond to Contract (Courier)

```http
POST /api/contract/courier/respond
```

**Authentication:** Courier ID Token Required

**Request Body (Accept):**
```json
{
  "contractId": "contract_id",
  "accept": true,
  "deliveryCharge": 200
}
```

**Request Body (Reject):**
```json
{
  "contractId": "contract_id",
  "accept": false
}
```

#### Cancel Contract (Courier)

```http
GET /api/contract/courier/cancel-contract/{contract_id}
```

**Authentication:** Courier ID Token Required

**Path Parameters:**
- `contract_id` - Unique identifier of the contract

#### Update Contract (Courier)

```http
PATCH /api/contract/courier/update-contract/{contract_id}
```

**Authentication:** Courier ID Token Required

**Path Parameters:**
- `contract_id` - Unique identifier of the contract

**Request Body:**
```json
{
  "deliveryCharge": 200
}
```

---

### Order Management Endpoints

#### Create Order (Customer)

```http
GET /api/order/customer/create
```

**Authentication:** Customer ID Token Required

**Request Body:**
```json
{
  "orders": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ],
  "deliveryAddress": "delivery_address",
  "paymentId": "234436t7688",
  "amountPaid": 2400
}
```

#### Cancel Order (Customer)

```http
GET /api/order/customer/cancel/{order_id}
```

**Authentication:** Customer ID Token Required

**Path Parameters:**
- `order_id` - Unique identifier of the order

#### Get All Orders

```http
GET /api/orders/
```

**Authentication:** Any User ID Token Required (customer, seller, courier)

Returns orders relevant to the authenticated user's role

#### Get Order Details

```http
GET /api/orders/{order_id}
```

**Authentication:** Associated User ID Token Required (buyer, seller, courier)

**Path Parameters:**
- `order_id` - Unique identifier of the order

#### Get Orders by Product (Seller)

```http
GET /api/order/seller/orders?productId={product_id}
```

**Authentication:** Seller ID Token Required

**Query Parameters:**
- `productId` - Filter orders by product ID

#### Update Order Status - Dispatched (Courier)

```http
PATCH /api/order/courier/update-dispatched/{order_id}
```

**Authentication:** Courier ID Token Required

**Path Parameters:**
- `order_id` - Unique identifier of the order

#### Update Order Status - Delivered (Courier)

```http
PATCH /api/order/courier/update-delivered/{order_id}
```

**Authentication:** Courier ID Token Required

**Path Parameters:**
- `order_id` - Unique identifier of the order

---

### Review Endpoints

#### Create Review

```http
POST /api/review/create
```

**Authentication:** Customer ID Token Required

**Request Body:**
```json
{
  "orderId": "order_id",
  "productReview": "Product is working well",
  "courierReview": "Bit delayed delivery",
  "productRating": 5,
  "courierRating": 4
}
```

**Ratings:** Integer values from 1 to 5

#### Get Reviews

```http
GET /api/reviews?productId={product_id}
GET /api/reviews?sellerId={seller_id}
GET /api/reviews?courierId={courier_id}
```

**Query Parameters (choose one):**
- `productId` - Get reviews for a specific product
- `sellerId` - Get all reviews for products from a seller
- `courierId` - Get all reviews for a courier

#### Get Review Details

```http
GET /api/reviews/{review_id}
```

**Path Parameters:**
- `review_id` - Unique identifier of the review

---

### API Response Formats

#### Success Response
```json
{
  "status": "success",
  "data": { /* response data */ }
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Authentication Header Format

All authenticated requests must include:
```
Authorization: Bearer <JWT_ID_TOKEN>
```

---


<h2 align="center" id="future-improvements">Future Improvements</h2>

1. **Automated Testing**: Implement unit tests, integration tests, and end-to-end tests in CI/CD pipelines for both frontend and backend.

2. **Monitoring and Logging**: Integrate ELK Stack (Elasticsearch, Logstash, Kibana) for centralized logging, real-time performance metrics, and alert mechanisms.

3. **Performance Optimization**: 
   - Implement DynamoDB Accelerator (DAX) and VPC endpoints to reduce database latency
   - Deploy AWS CloudFront CDN for static content caching
   - Add Redis/ElastiCache for API response caching

4. **Analytics**: Implement clickstream analysis pipeline (API Gateway → Kinesis → Lambda → S3 → Athena → QuickSight) for user behavior tracking and product recommendations.

5. **Search Enhancement**: Integrate Elasticsearch for advanced full-text search with autocomplete and faceted filtering.

6. **Additional Features**: Payment gateway integration (Stripe, PayPal), real-time notifications (WebSockets, SNS), wishlist functionality, and multi-language support.

7. **Security Enhancements**: Implement rate limiting (AWS WAF), two-factor authentication, and regular security audits.

---

<h2 align="center">Contributing</h2>

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

<h2 align="center">Acknowledgments</h2>

Built with Spring Boot, Angular, and AWS. Special thanks to the Spring, Angular, Kubernetes, and AWS communities.

---

<p align="center">
  <strong>Built with love using Spring Boot, Angular, and AWS</strong>
</p>

<p align="center">
  <sub>NebulaMart - Empowering Digital Commerce</sub>
</p>
