# Milkday frontend

Responsive Angular 17 standalone application for the Digital Milk Delivery and Billing System. It uses Angular `HttpClient` to call the Spring Boot API at `http://localhost:8080/api`.

## Run

```bash
npm install
npm start
```

Open the local URL printed by Angular CLI (normally `http://localhost:4200`). The backend should be running on port 8080. The API's controllers enable cross-origin access for local development.

## Main files

```text
src/app/
├── app.component.ts       # Standalone page, tabs, forms, responsive styles
├── customer.service.ts    # Typed HTTP calls for customers, entries, and bills
└── models.ts              # API request/response types
src/main.ts                # Standalone bootstrap and HttpClient provider
```

The UI has customer registration/listing, daily delivery logging, and monthly billing. Billing amounts are displayed in ₹ and use the current customer rate returned by the API.
