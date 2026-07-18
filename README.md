# 🚀 Enterprise Cloud-Native Job Portal Platform

![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Spring Boot](https://img.shields.io/badge/spring_boot-%236DB33F.svg?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

An enterprise-grade, cloud-native recruitment platform built to bridge the gap between graduates seeking employment and recruiters managing multi-stage hiring pipelines. The platform features strict role-based authentication, real-time application tracking, interactive interview scheduling, and an automated asynchronous email notification engine.

---

## 💻 1. Platform Tech Stack

### Frontend Architecture
* **Framework:** React.js 18 (Single Page Application)
* **Styling:** Bootstrap 5, React Bootstrap, CSS Flexbox
* **Static Serving:** Nginx (Alpine) with `try_files` configuration to allow deep SPA linking.

### Backend & Security
* **Framework:** Java 11, Spring Boot 2.4
* **Security:** Spring Security OAuth2, JSON Web Tokens (JWT)
* **Data Persistence:** Spring Data JPA, Hibernate ORM
* **Async Tasks:** JavaMailSender with Spring TaskExecutor (`@Async`)

### DevOps, Cloud & Infrastructure
* **Cloud Provider:** Amazon Web Services (AWS)
* **Compute Engine:** AWS EC2 (Elastic Compute Cloud) running Ubuntu/Linux
* **Database:** AWS RDS (Relational Database Service) for MySQL 8.0
* **Containerization & Orchestration:** Docker, K3s (Lightweight Kubernetes)
* **Ingress Controller:** Traefik Ingress routing `jobs-portal.duckdns.org`
* **CI/CD Automation:** GitHub Actions
* **Infrastructure as Code (IaC):** HashiCorp Terraform (`variables.tf`, declarative cloud provisioning)
* **Code Quality & Security:** SonarQube, GitGuardian, Trivy (Image Vulnerability Scanning)

## 2. Tech Stack & Infrastructure

### 1. Frontend Architecture
* **Framework:** React.js 18 (Single Page Application)
* **Styling:** Bootstrap 5, React Bootstrap, CSS Flexbox
* **Static Serving & Routing:** Nginx (Alpine) with `try_files` configuration to allow deep SPA linking without `404 Not Found` errors.

### 2. Backend & Security
* **Framework:** Java 11, Spring Boot 2.4
* **Security:** Spring Security OAuth2, JSON Web Tokens (JWT)
* **Data Persistence:** Spring Data JPA, Hibernate ORM
* **Async Tasks:** JavaMailSender with Spring TaskExecutor

### 3. Database & Cloud Storage
* **Relational Database:** MySQL 8.0
* **Managed Cloud Storage:** AWS RDS (Relational Database Service)

### 4. DevOps, Kubernetes & Cloud (AWS)
* **Compute Engine:** AWS EC2 (Elastic Compute Cloud)
* **Orchestration:** K3s (Lightweight Kubernetes)
* **Ingress & Load Balancing:** Traefik Ingress Controller routing `jobs-portal.duckdns.org`
* **Kubernetes Resilience:** Tuned `Recreate` deployment strategies, memory constraints, and strict Actuator Health Probes (`startupProbe`, `livenessProbe`, `readinessProbe`) to prevent `OOMKilled` crashes on single-node environments.
* **Infrastructure as Code:** HashiCorp Terraform (`/terraform`)

---

## 3. Project File Structure

```text
.
├── .github/workflows/          # GitHub Actions CI/CD pipelines (`ci-cd.yml`)
├── jobportal-backend/          # Java Spring Boot REST API source code
│   ├── src/main/java/com/      # Controllers, Services, Security, Repositories
│   ├── Dockerfile              # Multi-stage JDK 11 Docker configuration
│   └── pom.xml                 # Maven dependencies
├── jobportal-frontend/         # React SPA source code
│   ├── src/                    # React components, Pages, Axios API client
│   ├── public/                 # Static assets
│   ├── Dockerfile              # Multi-stage Nginx static serving configuration
│   └── package.json            # NPM dependencies
├── k8s/                        # Kubernetes Declarative Manifests
│   ├── backend-deployment.yaml # Spring Boot Pod & Health Probes setup
│   ├── frontend-deployment.yaml# Nginx React Pod setup
│   ├── configmap.yaml          # Externalized environment variables
│   ├── ingress.yaml            # Traefik routing rules (DuckDNS)
│   └── secrets-template.yaml   # Baseline secret layout
├── terraform/                  # Infrastructure as Code (AWS EC2 / RDS provisioning)
│   ├── main.tf                 # Core AWS infrastructure
│   ├── rds.tf                  # Database instance definition
│   └── variables.tf            # Terraform inputs
├── docker-compose.yml          # Local full-stack development orchestrator
├── README.md                   # Project documentation
└── TROUBLESHOOTING_AND_FIXES.md# Deep-dive DevOps troubleshooting guide
```

---

## 4. Platform Performance & Reliability

This system is engineered to handle real-world traffic with zero UI blocking or resource starvation on cloud environments:
* **Zero-Blocking `@Async` Email Engine:** Email notifications (`JavaMailSender`) are executed on background threads (`cTaskExecutor-*`). API responses complete in `<10ms` while rich HTML interview invitations are processed asynchronously.
* **Eager Data Pre-Fetching:** To prevent Hibernate `LazyInitializationException` across background threads, all deep entity graphs (Job → Company, Applicant → User) are eagerly fetched inside a strict `@Transactional` context before asynchronous handoff.
* **Client-Side ID Sanitization:** Strict numeric validation in the React client (`sanitizeApplicationId`) prevents server-side path traversal injection (`SonarQube S7044 / S8476`).
* **Optimized Kubernetes Memory Footprint:** Tuned `Recreate` deployment strategies with strict CPU/Memory limits (`requests: 200Mi, limits: 768Mi`) to prevent `OOMKilled` crashes on single-node EC2 instances during rolling updates.
* **Actuator Probes Guardrails:** Specialized `/api/v1/actuator/health` endpoint separation (`startupProbe` up to 400s, `livenessProbe`, `readinessProbe`) ensures Spring Boot warms up cleanly before Kubernetes routes traffic.

---

## 5. System Architecture & Traffic Flow

```text
       [ Users / Recruiters ]
                 │ (HTTPS / HTTP)
                 ▼
     ┌───────────────────────┐
     │ Traefik Ingress K3s   │ (jobs-portal.duckdns.org)
     └───────────┬───────────┘
                 │
      ┌──────────┴──────────┐
      ▼ /                   ▼ /api/*
┌───────────┐         ┌───────────┐
│  React    │         │ Spring    │ ──(@Async Mail)──> [ Gmail SMTP ]
│  Frontend │         │ Boot Pod  │
└───────────┘         └─────┬─────┘
                            │ (JDBC)
                            ▼
                     ┌───────────┐
                     │  AWS RDS  │ (Managed MySQL 8.0)
                     └───────────┘
```

---

## 6. DevOps & CI/CD Architecture

The CI/CD pipeline runs entirely on **GitHub Actions**, transforming git commits into live cloud deployments instantly:
1. **Build Phase:** Multi-stage Docker files compile Java (Maven) and React (npm build) into lightweight `eclipse-temurin` and `nginx:alpine` containers tagged with the Git SHA.
2. **Push Phase:** Pushes secure Docker images to Docker Hub (`ravindudilhan/jobportal-*`).
3. **Preflight Phase:** Uses `KUBECONFIG` to securely SSH into AWS EC2 K3s and validates cluster health. 
4. **Secret Injection Phase:** Reads encrypted GitHub Actions secrets (`RDSDB_PASSWORD`, `MAIL_PASSWORD`, `JWT_SECRET`) and dynamically injects them into the K3s `jobportal-secrets` namespace using declarative `dry-run` YAML.
5. **Rollout Phase:** Uses `sed` to replace generic image tags in `k8s/deployment.yaml` with the new commit SHA, applies the manifests (`kubectl apply`), and automatically fetches real-time pod tail logs to verify zero-downtime deployment success.


### 🔐 Security & Authentication
* **OAuth2 + JWT Authentication:** Stateless bearer token security protecting REST API endpoints.
* **Role-Based Access Control (RBAC):** Strict isolation between `ROLE_APPLICANT` and `ROLE_COMPANY`.
* **Cryptographic Email Verification:** Accounts are locked until verified via dynamic, time-sensitive email links.

### 🎓 Applicant & Graduate Features
* **Comprehensive Profiles:** Manage academic background, university details, and technical skills.
* **One-Click Applications:** Discover public job listings and apply instantly.
* **Real-Time Tracking Dashboard:** Track live application statuses across all applied jobs via dynamic color-coded badges.

### 🏢 Recruiter & Company Features
* **Job Listing Management:** Post, edit, and publish job opportunities to the public platform.
* **Candidate Pool Analytics:** View comprehensive applicant lists, degrees, and skills per job listing.
* **Interactive 5-Stage Hiring Pipeline:** Move candidates through structured lifecycle stages (`APPLIED` → `SHORTLISTED` → `INTERVIEW_SCHEDULED` → `OFFERED` / `REJECTED`).
* **Dynamic Interview Modals:** When scheduling interviews, recruiters input exact **Date, Time, Format (Online/In-Person), and Instructions (Google Meet URLs)** which are instantly processed.

### ✉️ Automated Asynchronous Email Engine
* **Non-Blocking `@Async` Dispatch:** Fast API responses (<10ms) while rich HTML and plain-text emails are processed on background Spring Boot threads.
* **Transaction-Safe Pre-Fetching:** Eliminates `LazyInitializationException` by eagerly extracting deep Hibernate entity relationships inside the database transaction before passing data to background workers.

---

### 6. Automated CI/CD (GitHub Actions)
* **Multi-Stage Containerization:** Docker builds optimized for tiny artifact sizes.
* **Declarative Namespace Guardrails:** `kubectl create namespace --dry-run=client -o yaml | kubectl apply -f -`
* **Zero-Hardcoded Secrets:** Automated synchronization of GitHub Actions Repository Secrets directly into Kubernetes `jobportal-secrets`.
* **Zero-Downtime Rollouts:** Streamlined `sed` image tagging replacing SHAs dynamically, followed by live rollout verification and diagnostic log tails.


---

## 7. Installation & Deployment Guide

### Option A: Local Development (Docker Compose)
Run the entire platform locally without a Kubernetes cluster:
```bash
# Clone the repository
git clone https://github.com/ravindudilhan/job-portal.git
cd job-portal

# Build and start all services
docker-compose up -d --build
```
* **Frontend UI:** `http://localhost:3000`
* **Backend API:** `http://localhost:8080/api/v1`

### Option B: Production Deployment (Kubernetes / AWS K3s)
Ensure your AWS EC2 instance is running K3s and your `KUBECONFIG` is configured locally.
1. Authenticate to the cluster and create the namespace safely:
   ```bash
   kubectl create namespace job-portal --dry-run=client -o yaml | kubectl apply -f -
   ```
2. Inject your production secrets (RDS credentials, Gmail App Passwords, JWT keys):
   ```bash
   kubectl create secret generic jobportal-secrets \
     --from-literal=mysql-root-password='your_rds_password' \
     --from-literal=mail-password='your_gmail_app_password' \
     --from-literal=jwt-secret='your_jwt_secret' \
     --namespace=job-portal \
     --dry-run=client -o yaml | kubectl apply -f -
   ```
3. Apply the declarative environment configs and deployment manifests:
   ```bash
   kubectl apply -f k8s/
   ```


## 8. Security & Code Quality
* **ID Sanitization:** Strict frontend validation preventing path traversal vulnerabilities (`SonarQube S7044 / S8476`).
* **GitGuardian Clean:** 100% of SMTP and JWT credentials externalized from the source tree into runtime environment variables and GitHub Secrets.

---
*Built with ❤️ for modern cloud recruitment.*
---
*Architected and engineered for modern cloud recruitment.*
