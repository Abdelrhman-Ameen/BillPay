# BillPay

BillPay is a full-stack demo for managing and paying household bills. It has two roles:
customers can view their bills and try simulated payments, while administrators can add service
providers, create bills, and review all payment attempts.

No real payment gateway is connected, so the project never transfers real money.

![Java](https://img.shields.io/badge/Java-17-111111?style=flat-square)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=flat-square)
![Angular](https://img.shields.io/badge/Angular-20-DD0031?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square)

## Features

Customers can:

- Register and log in
- View their pending, paid, and cancelled bills
- Pay a pending bill using cash, card, or wallet simulation
- View successful and failed payment attempts

Administrators can:

- Add service providers
- Create bills for customers
- View all recorded payments

The API also checks that bill amounts are positive, paid bills are not paid twice, cancelled bills
cannot be paid, and customers cannot open another customer's bills.

## Tech stack

- Java 17 and Spring Boot
- Spring Data JPA and PostgreSQL
- Spring Security with JWT authentication
- Angular and SCSS
- JUnit 5, Mockito, AssertJ, and H2 for tests
- Maven and pnpm

## Project structure

```text
BillPay/
├── backend/       Spring Boot REST API
├── frontend/      Angular application
└── compose.yaml   Local PostgreSQL container
```

The backend uses four JPA entities:

```text
User 1 ─── * Bill * ─── 1 ServiceProvider
                 │
                 ├── * Payment attempts
                 └── 0..1 successful Payment
```

A failed payment is saved in the transaction history, but the bill stays pending. Only a
successful attempt marks the bill as paid.

## Payment strategy

All payment types implement the same interface:

```java
public interface PaymentMethod {
    PaymentResult pay(BigDecimal amount);
}
```

The implementations are `CashPayment`, `CardPayment`, and `WalletPayment`.
`PaymentMethodRegistry` chooses the requested implementation, then `PaymentService` runs it.

The simulation uses predictable rules so both outcomes are easy to test:

- Cash succeeds.
- Card fails when the amount is more than EGP 20,000.
- Wallet fails when the amount is more than EGP 5,000.

## Run locally

You need Java 17, Node.js, pnpm, and either Docker Desktop or a local PostgreSQL database.

### 1. Start PostgreSQL

```bash
docker compose up -d db
```

The included Compose file creates a local `billpay` database. Its default credentials are only for
local development and can be changed with `DB_USERNAME` and `DB_PASSWORD`.

### 2. Set the JWT secret

`JWT_SECRET` is required and is not stored in this repository. Set it to a Base64-encoded random
value before starting the API.

PowerShell example:

```powershell
$bytes = New-Object byte[] 48
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
```

To load the optional local demo accounts and sample bills:

```powershell
$env:SEED_DATA = "true"
```

### 3. Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows, run `.\mvnw.cmd spring-boot:run`.

### 4. Start the frontend

In a second terminal:

```bash
cd frontend
pnpm install
pnpm start
```

Open `http://localhost:4200`. During development, Angular forwards `/api` requests to the backend
at `http://localhost:8080`.

### Demo accounts

These accounts are created only when `SEED_DATA=true`:

| Role | Email | Password |
|---|---|---|
| Customer | `customer@billpay.dev` | `Customer123!` |
| Administrator | `admin@billpay.dev` | `Admin123!` |

Keep seeding disabled on a public or production deployment.

## Environment variables

| Variable | Required | Default |
|---|---:|---|
| `JWT_SECRET` | Yes | None |
| `DB_URL` | No | `jdbc:postgresql://localhost:5432/billpay` |
| `DB_USERNAME` | No | `billpay` |
| `DB_PASSWORD` | No | `billpay` |
| `DB_POOL_SIZE` | No | `5` |
| `ADMIN_NAME` | No | `BillPay Admin` |
| `ADMIN_EMAIL` | No | None |
| `ADMIN_PASSWORD` | No | None |
| `SEED_DATA` | No | `false` |
| `PORT` | No | `8080` |

Local `.env` files, private keys, credentials, dependencies, logs, and build output are excluded by
`.gitignore`.

If both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are supplied, the backend creates that administrator
the first time it starts. The password must contain at least eight characters.

## Deploy

The Angular interface can be deployed separately as a static Vercel preview. Import this repository
in Vercel, set the root directory to `frontend`, and use the included `vercel.json`.

The online preview does not connect to the Spring Boot API. It shows a notice explaining that
login, bills, and payments are available when the complete project is run locally.

The backend and PostgreSQL configuration remain in this repository for local development. The root
`Dockerfile` can still build the complete frontend and backend as one container later.

## API endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/providers` | Public |
| GET | `/api/customer/bills` | Customer |
| POST | `/api/customer/bills/{id}/payments` | Customer |
| GET | `/api/customer/payments` | Customer |
| POST | `/api/admin/providers` | Administrator |
| POST | `/api/admin/bills` | Administrator |
| GET | `/api/admin/customers` | Administrator |
| GET | `/api/admin/payments` | Administrator |

## Tests

Run the backend tests:

```bash
cd backend
./mvnw test
```

Build the Angular application:

```bash
cd frontend
pnpm build
```

The test suite covers the three payment strategies and the main bill-payment rules.

## Possible next steps

- Add Flyway database migrations
- Add pagination to bills and payments
- Add refresh-token rotation
- Add Testcontainers integration tests
- Add database backups and monitoring
