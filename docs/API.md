# SSCRM API Reference

Base URL: `http://localhost:8080`

All REST API endpoints are under `/api/**`. Web UI endpoints serve Thymeleaf pages.

---

## Authentication

All protected endpoints require either:
- **Session cookie** (web UI — obtained via form login at `/login`)
- **Bearer token** (REST API — obtained via `POST /api/auth/login`)

```
Authorization: Bearer <jwt_token>
```

---

## 🔑 Auth Endpoints

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "AGENT"
}
```
**Response `200 OK`:**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

---

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "SecurePass123!"
}
```
**Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "username": "john.doe",
  "role": "AGENT"
}
```

---

## 🎫 Ticket Endpoints

> **Required roles:** ADMIN, SUPERVISOR, AGENT (unless noted)

### Create Ticket
```http
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Login page broken",
  "description": "Users cannot log in after the last deployment.",
  "priority": "HIGH",
  "customerId": 42
}
```
**Priority values:** `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`

**Response `200 OK`:**
```json
{
  "id": 101,
  "title": "Login page broken",
  "status": "OPEN",
  "priority": "HIGH",
  "dueTime": "2026-02-18T18:25:00",
  "createdAt": "2026-02-18T10:25:00"
}
```

---

### Get All Tickets
```http
GET /api/tickets
Authorization: Bearer <token>
```

---

### Get Ticket by ID
```http
GET /api/tickets/{id}
Authorization: Bearer <token>
```

---

### Update Ticket Status
```http
PUT /api/tickets/{id}/status?status=IN_PROGRESS&userId=5
Authorization: Bearer <token>
```
**Status values:** `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`  
*(Tickets cannot be re-opened once CLOSED)*

---

### Assign Agent
```http
PUT /api/tickets/{id}/assign?agentId=5
Authorization: Bearer <token>
```
> Only users with role `AGENT` or `SUPERVISOR` can be assigned.

---

### Get Ticket History
```http
GET /api/tickets/{id}/history
Authorization: Bearer <token>
```
**Response:**
```json
[
  {
    "actionType": "STATUS_CHANGE",
    "oldValue": "OPEN",
    "newValue": "IN_PROGRESS",
    "changedBy": "agent1",
    "timestamp": "2026-02-18T11:00:00"
  }
]
```

---

### Add Comment
```http
POST /api/tickets/{id}/comments?userId=5
Authorization: Bearer <token>
Content-Type: application/json

"Investigated the issue — rolling back the deployment."
```

---

### Get Ticket Comments
```http
GET /api/tickets/{id}/comments
Authorization: Bearer <token>
```

---

## 👤 Customer Endpoints

> **Required roles:** ADMIN, SUPERVISOR, AGENT

### Create Customer
```http
POST /api/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "phone": "+1-555-0100",
  "category": "ENTERPRISE"
}
```
**Category values:** `REGULAR` | `PREMIUM` | `VIP` | `ENTERPRISE`

---

### Get All Customers
```http
GET /api/customers
Authorization: Bearer <token>
```

---

### Get Customer by ID
```http
GET /api/customers/{id}
Authorization: Bearer <token>
```

---

### Search Customers
```http
GET /api/customers/search?name=acme
Authorization: Bearer <token>
```

---

### Update Customer
```http
PUT /api/customers/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "phone": "+1-555-0101",
  "category": "VIP"
}
```

---

### Delete Customer
```http
DELETE /api/customers/{id}
Authorization: Bearer <token>
```
> **Required role:** ADMIN only

---

## 📚 FAQ Endpoints

### Create FAQ
```http
POST /api/faqs
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "How do I reset my password?",
  "answer": "Click 'Forgot Password' on the login page...",
  "category": "Account"
}
```

---

### Get All FAQs
```http
GET /api/faqs
```
> Public endpoint — no authentication required.

---

### Search FAQs
```http
GET /api/faqs/search?keyword=password
```

---

### Get FAQs by Category
```http
GET /api/faqs/category/Account
```

---

## 📊 Dashboard Endpoints

> **Required roles:** ADMIN, SUPERVISOR, AGENT

### Get Summary
```http
GET /api/dashboard/summary
Authorization: Bearer <token>
```
**Response:**
```json
{
  "totalTickets": 245,
  "openTickets": 38,
  "inProgressTickets": 12,
  "resolvedTickets": 180,
  "escalatedTickets": 5,
  "avgResolutionHours": 6.4
}
```

---

## ⚠️ Error Responses

All errors follow a consistent format:

```json
{
  "timestamp": "2026-02-18T10:25:00",
  "status": 404,
  "error": "Not Found",
  "message": "Ticket not found",
  "path": "/api/tickets/999"
}
```

| Status | Meaning |
|---|---|
| `400` | Bad Request — validation failed |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient role |
| `404` | Not Found — resource does not exist |
| `500` | Internal Server Error |
