# Job Portal - Backend REST API

Job Portal Backend is a comprehensive RESTful API built with Spring Boot that serves as the backbone for a modern job board platform. It handles user authentication, job postings, application management, and various administrative operations.

## 🚀 Features

-   **Authentication & Authorization**:
    -   Secure user registration and login with **JWT (JSON Web Tokens)**.
    -   **Password Encryption** using Spring Security.
    -   Role-based access control (Admin, Company, Candidate).
-   **Job Management**:
    -   CRUD operations for job postings.
    -   Advanced filtering and searching (by category, location, salary range, job type).
    -   Job status tracking (OPEN, CLOSED).
-   **Application Tracking**:
    -   Candidates can apply for jobs.
    -   Companies can review and manage applications.
    -   Application status workflow (APPLIED, SHORTLISTED, REJECTED, OFFERED).
-   **User Management**:
    -   Profile management for Candidates and Companies.
    -   Account activation/deactivation.
-   **Notifications**:
    -   Email notifications for account verification, job applications, and status updates.

## 🛠️ Tech Stack

-   **Framework**: Spring Boot 3.x
-   **Language**: Java 17+
-   **Security**: Spring Security, JWT (jjwt)
-   **Database**: MySQL ( RDS )
-   **ORM**: Spring Data JPA, Hibernat
-   **Testing**: Spring Boot Test, JUnit 5, Mockito
-   **Documentation**: Springdoc OpenAPI (Swagger UI)
-   **Build Tool**: Maven
-   **Dev Tools**: Spring Boot DevTools

## 📂 Project Structure

The project follows a standard Spring Boot layered architecture:

```
src/main/java/
└── com/jobportal/
    ├── config/        # Security configurations, CORS, AppConfig
    ├── controller/    # REST API endpoints (Auth, User, Company, Job, etc.)
    ├── dto/           # Data Transfer Objects (Request/Response models)
    ├── entity/        # JPA Entities (Database Models)
    ├── exception/     # Custom Exception Classes
    ├── repository/    # Spring Data JPA Repositories
    ├── service/       # Business Logic Layer
    ├── util/          # Utility classes (JwtUtils, EmailUtils)
    └── JobPortalBackendApplication.java
```

## 🔌 API Endpoints

### Authentication
-   `POST /api/auth/register` - Register a new user
-   `POST /api/auth/login` - Authenticate and get JWT token
-   `GET /api/auth/me` - Get current user profile

### Users
-   `PUT /api/users/me` - Update current user profile
-   `GET /api/users/me` - Get current user

### Companies
-   `POST /api/companies/register` - Register a new company
-   `GET /api/companies/{id}` - Get company details
-   `PUT /api/companies/{id}` - Update company profile

### Jobs
-   `POST /api/jobs` - Create a new job (Company)
-   `GET /api/jobs` - Get all jobs (with filters)
-   `GET /api/jobs/{id}` - Get job by ID
-   `PUT /api/jobs/{id}` - Update job (Company)
-   `DELETE /api/jobs/{id}` - Delete job (Company)

### Applications
-   `POST /api/applications` - Apply for a job (Candidate)
-   `GET /api/applications` - Get my applications (Candidate) / Get all applications for a job (Company)
-   `GET /api/applications/{id}` - Get application details
-   `PUT /api/applications/{id}/status` - Update application status (Company)

## 🚀 Getting Started

### Prerequisites
-   Java 17 or higher
-   Maven 3.6 or higher
-   PostgreSQL database

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd jobportal-backend
    ```

2.  Configure the database:
    Update `src/main/resources/application.properties` with your database credentials:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/jobportal
    spring.datasource.username=postgres
    spring.datasource.password=your_password
    ```

3.  Run the application:
    ```bash
    mvn spring-boot:run
    ```

### Database Schema

The application uses Spring Data JPA to automatically create and update database tables based on the entity models. The schema includes tables such as:

-   `users`
-   `companies`
-   `jobs`
-   `applications`
-   `roles`
-   `tokens`

### Testing

Run the test suite to ensure everything is working correctly:
```bash
mvn test
```

### API Documentation

Once the application is running, you can access the interactive API documentation (Swagger UI) at:

-   **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
-   **API Docs (YAML)**: `http://localhost:8080/v3/api-docs`

## 🛡️ Security

The backend uses Spring Security with JWT for authentication:

1.  Upon successful login, a JWT token is issued.
2.  This token must be included in the `Authorization` header for protected endpoints:
    ```
    Authorization: Bearer <your-jwt-token>
    ```
3.  The token expires in 24 hours.

## 🔧 Configuration

You can configure the application using environment variables or the `application.properties` file:

| Property | Description | Default |
|----------|-------------|---------|
| `server.port` | Port number for the server | `8080` |
| `spring.datasource.url` | Database connection URL | Varies |
| `spring.datasource.username` | Database username | `postgres` |
| `spring.datasource.password` | Database password | `your_password` |
| `app.jwt-secret` | JWT secret key | `supersecretkey` |
| `app.jwt-expiration-ms` | Token expiration time in milliseconds | `86400000` (1 day) |
| `spring.mail.host` | SMTP server host | `smtp.gmail.com` |
| `spring.mail.port` | SMTP server port | `587` |
| `spring.mail.username` | Email account username | Varies |
| `spring.mail.password` | Email account password | Varies |
| `spring.mail.properties.mail.smtp.auth` | Enable SMTP authentication | `true` |
| `spring.mail.properties.mail.smtp.starttls.enable` | Enable TLS | `true` |

## 🚀 Deployment
This platform is deploying on K3s Cluster in EC2 instance connection with RDS MySQL DB 

### Docker

Create a Docker image:
```bash
docker build -t jobportal-backend .
```

Run the container:
```bash
docker run -d -p 8080:8080 \
  -e DB_URL="jdbc:postgresql://localhost:5432/jobportal" \
  -e DB_USERNAME="postgres" \
  -e DB_PASSWORD="your_password" \
  --name jobportal-backend \
  jobportal-backend
```

