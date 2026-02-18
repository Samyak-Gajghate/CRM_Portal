# SSCRM — Enterprise CRM & Knowledge Management System

> **Spring Boot 3.2 · PostgreSQL · JWT · Docker · Flyway**

A full-stack Customer Relationship Management system with ticket lifecycle management, SLA enforcement, knowledge base, and role-based access control.

[**Live Demo (Backend)**](https://sscrm-backend.fly.dev) | [**Frontend**](https://crm-customer-portal.vercel.app)

---

## 🚀 Quick Start (Docker — one command)

```bash
# 1. Copy and fill in secrets
cp .env.example .env
# Edit .env: set DB_PASSWORD, JWT_SECRET, and optionally MAIL_* vars

# 2. Launch everything
docker compose up --build -d

# 3. Open the app
open http://localhost:8080/login
# Default admin: admin / Admin@123
```

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        B[Browser / Thymeleaf UI]
        R[React Customer Portal]
    end

    subgraph API["Spring Boot Backend :8080"]
        direction TB
        SC[SecurityConfig<br/>JWT + Session]
        AC[AuthController]
        TC[TicketController]
        CC[CustomerController]
        FC[FAQController]
        DC[DashboardController]
    end

    subgraph Services["Service Layer"]
        TS[TicketService]
        SLA[SLAService<br/>@Scheduled]
        AS[AuthService]
        CS[CustomerService]
        ES[EmailService]
    end

    subgraph Data["Data Layer"]
        JPA[Spring Data JPA]
        FW[Flyway Migrations]
        PG[(PostgreSQL)]
    end

    B -->|Session Cookie| SC
    R -->|Bearer JWT| SC
    SC --> AC & TC & CC & FC & DC
    TC --> TS
    TS --> ES
    SLA -->|every 60s| ES
    TS & AS & CS --> JPA
    JPA --> PG
    FW -->|V1__init_schema| PG
```

---

## 🔐 Security

| Layer | Mechanism |
|---|---|
| **Authentication** | Form login (web UI) + JWT Bearer token (REST API) |
| **Password hashing** | BCrypt (strength 10) |
| **Token validity** | 2 hours (configurable via `JWT_EXPIRATION`) |
| **CSRF** | Enabled for web UI, disabled for `/api/**` |
| **Session** | Single concurrent session per user |
| **Method security** | `@EnableMethodSecurity` — `@PreAuthorize` on controllers |

---

## 👥 Role Matrix

| Feature | ADMIN | SUPERVISOR | AGENT | CUSTOMER |
|---|:---:|:---:|:---:|:---:|
| View all tickets | ✅ | ✅ | ✅ | ❌ |
| Create ticket | ✅ | ✅ | ✅ | ✅ |
| Assign agent | ✅ | ✅ | ❌ | ❌ |
| Update ticket status | ✅ | ✅ | ✅ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| Manage FAQs | ✅ | ✅ | ✅ | ❌ |
| View dashboard | ✅ | ✅ | ✅ | ❌ |
| View own tickets | ✅ | ✅ | ✅ | ✅ |

---

## ⏱️ SLA Rules

| Priority | Resolution SLA | Warning Threshold |
|---|---|---|
| **CRITICAL** | 2 hours | < 30 min remaining |
| **HIGH** | 8 hours | < 2 hours remaining |
| **MEDIUM** | 24 hours | < 6 hours remaining |
| **LOW** | 48 hours | < 12 hours remaining |

Tickets breaching SLA are automatically escalated to `ESCALATED` status and trigger email alerts. The `SLAService` runs every 60 seconds via `@Scheduled`.

---

## 🗄️ Database Migrations (Flyway)

Schema is managed by Flyway — **never edit migration files after deployment**.

| File | Description |
|---|---|
| `V1__init_schema.sql` | Creates all tables, indexes, enum types, and seeds admin user |

To add a new migration:
```
src/main/resources/db/migration/V2__your_description.sql
```

---

## 🛠️ Local Development (without Docker)

### Prerequisites
- Java 17+
- PostgreSQL 14+
- Maven 3.8+

### Setup
```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE sscrm_db;"
psql -U postgres -c "CREATE USER sscrm_user WITH PASSWORD 'StrongPassword123';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE sscrm_db TO sscrm_user;"

# 2. Run (Flyway will apply migrations automatically)
mvn spring-boot:run
```

---

## 🧪 Running Tests

```bash
# All tests (uses H2 in-memory DB, no external dependencies)
mvn test

# Test coverage report
mvn test jacoco:report
```

**Test suite:**
- `TicketServiceTest` — 14 unit tests (Mockito)
- `SLAServiceTest` — 5 unit tests (Mockito)
- `SecurityConfigTest` — 6 integration tests (MockMvc + Spring Security Test)
- `CustomerServiceTest`, `EmailServiceTest`, `UserServiceTest` — additional coverage
- `TicketIntegrationTest` — end-to-end flow

---

## 📁 Project Structure

```
crm-system/
├── src/
│   ├── main/
│   │   ├── java/com/sscrm/
│   │   │   ├── config/          # Security, JWT, CORS
│   │   │   ├── controller/      # REST API controllers
│   │   │   │   └── view/        # Thymeleaf view controllers
│   │   │   ├── dto/             # Request/Response DTOs
│   │   │   ├── entity/          # JPA entities
│   │   │   ├── exception/       # Global exception handler
│   │   │   ├── repository/      # Spring Data JPA repos
│   │   │   └── service/         # Business logic
│   │   └── resources/
│   │       ├── db/migration/    # Flyway SQL scripts
│   │       ├── templates/       # Thymeleaf HTML + email templates
│   │       └── application.yml
│   └── test/
│       ├── java/com/sscrm/
│       │   ├── controller/      # Security integration tests
│       │   ├── service/         # Service unit tests
│       │   └── integration/     # End-to-end tests
│       └── resources/
│           └── application-test.yml  # H2 test config
├── crm-customer-portal/         # React frontend
├── docs/
│   └── API.md                   # Full API reference
├── Dockerfile                   # Multi-stage build
├── docker-compose.yml           # One-command deployment
├── .env.example                 # Environment variable template
└── pom.xml
```

---

## 📖 API Reference

See **[docs/API.md](docs/API.md)** for the full API reference with request/response examples.

---

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `DB_NAME` | | `sscrm_db` | PostgreSQL database name |
| `DB_USER` | | `sscrm_user` | PostgreSQL username |
| `DB_PASSWORD` | ✅ | — | PostgreSQL password |
| `JWT_SECRET` | ✅ | — | 256-bit JWT signing key |
| `JWT_EXPIRATION` | | `7200000` | Token TTL in milliseconds |
| `MAIL_HOST` | | `smtp.gmail.com` | SMTP server |
| `MAIL_USERNAME` | | — | SMTP username |
| `MAIL_PASSWORD` | | — | SMTP password / app password |
| `EMAIL_ENABLED` | | `false` | Enable/disable email sending |
