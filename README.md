#  Full Stack Job Portal Platform

A comprehensive, modern job board platform built with a microservices-inspired architecture. This repository contains the entire stack: a React frontend, a Spring Boot REST API backend, and full infrastructure configurations including Docker Compose for local development and Kubernetes manifests for production deployment.

##  System Architecture

The application is composed of the following main components:

-   **Frontend**: A responsive single-page application built with React and Bootstrap.
-   **Backend**: A robust RESTful API built with Java and Spring Boot.
-   **Database**: MySQL database for persistent data storage.
-   **Infrastructure**: Fully containerized using Docker, with Kubernetes (k8s) manifests for cluster deployment, and GitHub Actions for CI/CD.

## Features

-   **Authentication & Authorization**: Secure JWT-based authentication with role-based access control (Admin, Company, Candidate).
-   **Candidate Portal**: Browse jobs, apply for positions, and track application status.
-   **Company Portal**: Post jobs, manage listings, and review candidate applications.
-   **Advanced Filtering**: Search for jobs by category, location, and salary range.
-   **Dashboard & Analytics**: Visual data representation using Recharts (Frontend).
-   **Security Scanning**: Integrated Trivy security scanning for filesystem and container images.

##  Tech Stack

### Frontend (`/jobportal-frontend`)
-   **Framework**: React 18
-   **Styling**: Bootstrap 5, React Bootstrap
-   **Routing**: React Router DOM
-   **HTTP Client**: Axios
-   **Charts**: Recharts
-   **Testing**: React Testing Library

### Backend (`/jobportal-backend`)
-   **Framework**: Spring Boot 3.x (Java 11/17)
-   **Security**: Spring Security, JWT (JSON Web Tokens)
-   **Database / ORM**: MySQL 8.0, Spring Data JPA, Hibernate
-   **Documentation**: Springdoc OpenAPI (Swagger UI)
-   **Testing**: JUnit 5, Mockito

### DevOps & Infrastructure
-   **Containerization**: Docker, Docker Compose
-   **Orchestration**: Kubernetes (K3s compatible manifests in `/k8s`)
-   **CI/CD**: GitHub Actions
-   **Security**: Trivy Vulnerability Scanner

## Repository Structure

```text
.
├── jobportal-backend/       # Spring Boot application, REST API
├── jobportal-frontend/      # React single-page application
├── k8s/                     # Kubernetes deployment, service, ingress, and config manifests
├── .github/workflows/       # GitHub Actions CI/CD pipeline definitions
├── docker-compose.yml       # Local development orchestration
└── README.md                # Project documentation
```

##  Getting Started (Local Development)

### Prerequisites
-   [Docker](https://www.docker.com/products/docker-desktop) and Docker Compose
-   Node.js 18+ (for manual frontend setup)
-   Java 11+ and Maven (for manual backend setup)

### Option 1: Running with Docker Compose (Recommended)

The easiest way to get the entire stack running locally is using Docker Compose. It will spin up the MySQL database, the Spring Boot backend, and the React frontend.

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd job-portal
    ```

2.  Start the services:
    ```bash
    docker-compose up --build -d
    ```

3.  Access the applications:
    -   **Frontend UI**: [http://localhost:3000](http://localhost:3000)
    -   **Backend API**: [http://localhost:8080](http://localhost:8080)
    -   **Swagger API Docs**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

### Option 2: Manual Local Setup

<details>
<summary>Click to expand manual setup instructions</summary>

**1. Database Setup**
Start a local MySQL server (or run it via docker) and create a database named `job_portal`.

**2. Backend Setup**
```bash
cd jobportal-backend
mvn clean install
mvn spring-boot:run
```
*Note: Ensure your database credentials in `src/main/resources/application.properties` or environment variables match your local setup.*

**3. Frontend Setup**
```bash
cd jobportal-frontend
npm install
npm start
```
</details>

## CI/CD & Deployment

This project utilizes GitHub Actions for Continuous Integration and Continuous Deployment (`.github/workflows/ci-cd.yml`).

**The Pipeline automatically:**
1.  **Builds & Tests**: Compiles Java code, builds React app, and runs automated tests.
2.  **Security Scans**: Uses Trivy to scan the codebase and built Docker images for vulnerabilities.
3.  **Builds Images**: Builds Docker images for the frontend and backend and pushes them to Docker Hub.
4.  **Deploys to Kubernetes**: Applies the manifests in the `/k8s` directory to a K3s cluster.

### Kubernetes Setup (`/k8s`)
The project includes ready-to-use Kubernetes manifests for:
-   Namespaces and ConfigMaps
-   Backend and Frontend Deployments & Services
-   Ingress rules for routing
-   Secret templates for sensitive credentials

To deploy manually to an existing cluster:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
# Ensure you configure your secrets before applying deployments
kubectl apply -f k8s/
```


Currently in Deployment phrase and still cheking code qualities in order to make it 100% secure and working with all features as expected 

### Stuck points

Currently having problem in AWS deployment side.......

