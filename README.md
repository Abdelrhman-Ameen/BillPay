# BillPay — Bill Payment Management System

BillPay is a deliberately small full-stack portfolio project for managing household bills. A
customer can register, sign in, view assigned bills, run a simulated payment, and review every
successful or failed attempt. An administrator can create service providers, issue bills, and
review payments across the system.

The scope stays intentionally understandable: **four domain entities, one payment strategy
interface, one Spring Boot application, and one Angular application**.

![Java](https://img.shields.io/badge/Java-17-111111?style=flat-square)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=flat-square)
![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square)

## What is included

### Customer

- Register and log in with a short-lived access token
- View pending, paid, and cancelled bills belonging to their account
- Pay a pending bill with cash, card, or wallet simulation
- See a clear success or failure result
- Review transaction history, including failed attempts

### Administrator

- Create service providers
- Create bills for registered customers
- View every recorded payment

### Business rules

- Bill amounts use `BigDecimal` and must be positive.
- A paid bill cannot be paid again.
- A cancelled bill cannot be paid.
- Customers can only access bills assigned to their own user ID.
- A failed payment is recorded but leaves the bill pending.
- A successful payment marks the bill paid and becomes its successful payment reference.

## Architecture

```text
Angular SPA (localhost:4200)
        │ REST + Bearer token
        ▼
Spring Boot API (localhost:8080)
        │ Spring Data JPA
        ▼
PostgreSQL (localhost:5432)
```

Only four classes are JPA entities:

```text
User 1 ─── * Bill * ─── 1 ServiceProvider
                 │
                 ├── * Payment attempts
                 └── 0..1 successful Payment
```

Failed attempts remain in `Payment`, which allows a customer to retry. `Bill.successfulPayment`
points only to the attempt that settled the bill.

## OOP and Strategy pattern

All payment implementations use one abstraction:

```java
public interface PaymentMethod {
    PaymentResult pay(BigDecimal amount);
}
```

`CashPayment`, `CardPayment`, and `WalletPayment` implement that interface.
`PaymentMethodRegistry` selects the implementation at runtime and `PaymentService` depends on the
abstraction. This demonstrates interfaces, abstraction, encapsulation, polymorphism, dependency
injection, and the Strategy pattern without adding unnecessary infrastructure.

The simulator is deterministic:

- Cash is accepted.
- Card payments above EGP 20,000 fail.
- Wallet payments above EGP 5,000 fail.

These rules make both success and failure easy to demonstrate without a real gateway.

## Run locally

Prerequisites: Java 17, Docker Desktop (or a local PostgreSQL 16 instance), and Node.js.

1. Start PostgreSQL:

   ```bash
   docker compose up -d db
   ```

2. Start the API:

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   On Windows PowerShell use `.\mvnw.cmd spring-boot:run`.

3. Start the Angular app in another terminal:

   ```bash
   cd frontend
   pnpm install
   pnpm start
   ```

4. Open `http://localhost:4200`.

The Angular development server proxies `/api` requests to `http://localhost:8080`, avoiding
browser CORS differences during local development.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Customer | `customer@billpay.dev` | `Customer123!` |
| Administrator | `admin@billpay.dev` | `Admin123!` |

The application seeds these accounts, three providers, and three pending bills into an empty
database. Set `SEED_DATA=false` to disable demo data.

## Configuration

The API reads these optional environment variables:

| Variable | Default |
|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/billpay` |
| `DB_USERNAME` | `billpay` |
| `DB_PASSWORD` | `billpay` |
| `JWT_SECRET` | Development-only Base64 secret |
| `SEED_DATA` | `true` |
| `PORT` | `8080` |

Use a new high-entropy Base64 `JWT_SECRET` outside local development.

## REST API

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register customer |
| POST | `/api/auth/login` | Public | Log in |
| GET | `/api/providers` | Public | List providers |
| GET | `/api/customer/bills` | Customer | View own bills |
| POST | `/api/customer/bills/{id}/payments` | Customer | Pay own pending bill |
| GET | `/api/customer/payments` | Customer | View own history |
| POST | `/api/admin/providers` | Admin | Create provider |
| POST | `/api/admin/bills` | Admin | Create customer bill |
| GET | `/api/admin/customers` | Admin | List customers for bill creation |
| GET | `/api/admin/payments` | Admin | View all payments |

## Tests and builds

```bash
cd backend
./mvnw test

cd ../frontend
pnpm build
```

Backend tests use JUnit 5, Mockito, AssertJ, and an in-memory H2 database configured in PostgreSQL
compatibility mode. Focused unit tests cover each payment strategy and the critical payment
business rules.

## Interface direction

The UI uses a black-dominant dark theme with white typography and yellow energy accents. A light
theme is available from the header. Motion is purposeful: staggered section reveals, a floating
dashboard preview, a scrolling services ticker, sticky workflow storytelling, and animated
payment result states. Reduced-motion preferences are respected.

## Seven-day development plan

- **Days 1–2:** Java entities, payment strategies, and unit tests
- **Days 3–4:** Spring Boot REST APIs, JPA, security, and PostgreSQL
- **Days 5–6:** Angular landing page and customer/admin workspaces
- **Day 7:** End-to-end testing, README, screenshots, and cleanup
- **Later:** Deployment hardening and security improvements

## Future Improvements

The initial version intentionally excludes:

- Microservices and Kubernetes
- RabbitMQ or Kafka
- Merchant settlements
- Partial refunds
- Double-entry ledgers
- Complex idempotency handling
- Concurrent payment processing
- Real payment gateways
- Refresh-token rotation
- AI features

Reasonable next steps are Docker images for the API and UI, Flyway migrations, stronger secret
management, email verification, refresh tokens, pagination, and integration tests with
Testcontainers.

## CV wording

**BillPay — Bill Payment Management System**<br>
*Java, Spring Boot, Angular, PostgreSQL, JPA, JUnit*

- Developed a full-stack bill-payment application enabling customers to view bills, perform
  simulated payments, and review transaction history.
- Designed REST APIs using Spring Boot and persisted users, bills, service providers, and
  payments using Spring Data JPA and PostgreSQL.
- Applied OOP principles and the Strategy pattern to support multiple payment methods through a
  common interface.
- Implemented validation, role-based access, exception handling, and unit tests using JUnit and
  Mockito.
