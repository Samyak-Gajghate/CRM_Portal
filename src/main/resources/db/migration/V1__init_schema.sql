-- ============================================================
-- V1__init_schema.sql
-- Initial schema for SSCRM (CRM & Knowledge Management System)
-- Managed by Flyway — do NOT modify this file after deployment.
-- ============================================================

-- ─── ENUM TYPES ──────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('ADMIN', 'AGENT', 'SUPERVISOR', 'CUSTOMER');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED');
CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE customer_category AS ENUM ('REGULAR', 'PREMIUM', 'VIP', 'ENTERPRISE');

-- ─── USERS ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    username   VARCHAR(255) NOT NULL UNIQUE,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       user_role    NOT NULL DEFAULT 'AGENT',
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── CUSTOMERS ───────────────────────────────────────────────────────────────

CREATE TABLE customers (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255)      NOT NULL,
    email      VARCHAR(255)      NOT NULL UNIQUE,
    phone      VARCHAR(50),
    user_id    BIGINT,
    category   customer_category NOT NULL DEFAULT 'REGULAR',
    created_at TIMESTAMP         NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP         NOT NULL DEFAULT NOW()
);

-- ─── TICKETS ─────────────────────────────────────────────────────────────────

CREATE TABLE tickets (
    id                BIGSERIAL PRIMARY KEY,
    title             VARCHAR(255)    NOT NULL,
    description       VARCHAR(2000)   NOT NULL,
    status            ticket_status   NOT NULL DEFAULT 'OPEN',
    priority          ticket_priority NOT NULL DEFAULT 'MEDIUM',
    customer_id       BIGINT          NOT NULL REFERENCES customers(id),
    assigned_agent_id BIGINT          REFERENCES users(id),
    due_time          TIMESTAMP       NOT NULL,
    resolved_at       TIMESTAMP,
    created_at        TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ─── TICKET HISTORY ──────────────────────────────────────────────────────────

CREATE TABLE ticket_history (
    id          BIGSERIAL PRIMARY KEY,
    ticket_id   BIGINT       NOT NULL REFERENCES tickets(id),
    action_type VARCHAR(100) NOT NULL,
    old_value   VARCHAR(255),
    new_value   VARCHAR(255),
    changed_by  BIGINT       REFERENCES users(id),
    timestamp   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── COMMENTS ────────────────────────────────────────────────────────────────

CREATE TABLE comments (
    id         BIGSERIAL PRIMARY KEY,
    ticket_id  BIGINT        NOT NULL REFERENCES tickets(id),
    user_id    BIGINT        NOT NULL REFERENCES users(id),
    content    VARCHAR(4000) NOT NULL,
    created_at TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── FAQS ────────────────────────────────────────────────────────────────────

CREATE TABLE faqs (
    id          BIGSERIAL PRIMARY KEY,
    question    VARCHAR(500)  NOT NULL,
    answer      VARCHAR(2000) NOT NULL,
    category    VARCHAR(255)  NOT NULL,
    created_by  BIGINT        REFERENCES users(id),
    usage_count INTEGER       NOT NULL DEFAULT 0,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX idx_tickets_status        ON tickets(status);
CREATE INDEX idx_tickets_customer      ON tickets(customer_id);
CREATE INDEX idx_tickets_agent         ON tickets(assigned_agent_id);
CREATE INDEX idx_tickets_due_time      ON tickets(due_time);
CREATE INDEX idx_ticket_history_ticket ON ticket_history(ticket_id);
CREATE INDEX idx_comments_ticket       ON comments(ticket_id);
CREATE INDEX idx_faqs_category         ON faqs(category);

-- ─── SEED: Default Admin User ─────────────────────────────────────────────────
-- Password: Admin@123 (BCrypt hash — change in production!)

INSERT INTO users (username, email, password, role, active)
VALUES (
    'admin',
    'admin@crm-system.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN',
    TRUE
);
