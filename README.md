# Digital Milk Delivery and Billing System

A minimal REST API built with Spring Boot 3, Java 17, Spring Data JPA, H2, and Lombok.

## Run locally

```bash
mvn spring-boot:run
```

The in-memory H2 database is available at `jdbc:h2:mem:milk_delivery` while the application is running. The H2 console is at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:milk_delivery`, user: `sa`, blank password).

## API

Create a customer:

```http
POST /api/customers
Content-Type: application/json

{"name":"Asha Patel","phone":"+91 9876543210","address":"12 Main Road","milkRatePerLiter":62.5}
```

List customers: `GET /api/customers`

Log a delivery:

```http
POST /api/milk-entries
Content-Type: application/json

{"customerId":1,"date":"2026-09-26","liters":2.5}
```

Get a monthly bill: `GET /api/billing/monthly?customerId=1&year=2026&month=9`

The billing response includes total liters and multiplies that quantity by the customer's current `milkRatePerLiter`. Dates are selected inclusively from the first day of the requested month up to, but not including, the first day of the next month. Validation failures return HTTP 400; unknown customer IDs return HTTP 404.

## Structure

```text
src/main/java/com/example/milkdelivery/
├── MilkDeliveryApplication.java
├── controller/       # REST endpoints
├── dto/              # Request and response records
├── entity/           # JPA entities
├── exception/        # API errors and exception mapping
├── repository/       # Spring Data repositories
└── service/          # Business logic and transactions
src/main/resources/application.properties
frontend/               # Angular 17 single-page application
```

## Angular frontend

The standalone Angular application is in [`frontend/`](frontend/README.md). From that directory, run `npm install` and `npm start` while the Spring Boot API is running on port 8080.

## Run the full stack with Docker Compose

From the repository root, build and start PostgreSQL, the Spring Boot API, and the Angular/Nginx frontend:

```bash
docker-compose up --build
```

Open `http://localhost` for the frontend. The API is available at `http://localhost:8080/api`, and PostgreSQL is published on port `5432`. PostgreSQL data persists in the named `postgres-data` volume. The backend waits until PostgreSQL's health check passes before starting. For detached mode, add `-d`; verify service state with `docker-compose ps` and logs with `docker-compose logs -f`.
