## Backend REST API Reference

This document describes all public REST endpoints exposed by the Spring Boot backend.

- Base URL: `http://localhost:8080` (configurable via your runtime environment)
- Authentication: JWT Bearer token for all endpoints except `POST /auth/register` and `POST /auth/login`
- Authorization header: `Authorization: Bearer <JWT>`

### Authentication

#### POST /auth/register
- Description: Register a new user
- Request body (JSON):
```json
{
  "userName": "string",
  "password": "string"
}
```
- Responses:
  - 200 OK
    - Body: `"Successfully Registered"`

Example (curl):
```bash
curl -X POST http://localhost:8080/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"userName":"alice","password":"secret"}'
```

#### POST /auth/login
- Description: Authenticate and obtain a JWT
- Request body (JSON): same as registration
```json
{
  "userName": "string",
  "password": "string"
}
```
- Responses:
  - 200 OK
    - Body:
```json
{ "token": "<jwt>" }
```

Example (curl):
```bash
curl -X POST http://localhost:8080/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"userName":"alice","password":"secret"}'
```

Use the returned token in the `Authorization` header for protected endpoints:
```text
Authorization: Bearer <jwt>
```

### Bays

#### GET /bays/
- Description: List all bays
- Auth: Required (Bearer JWT)
- Response 200 (JSON): Array of `BayDto`
```json
[
  { "id": 1, "bayName": "Main Entrance Bay A", "bayNumber": "A001" }
]
```

### Technicians

#### GET /technicians
- Description: List all technicians
- Auth: Required (Bearer JWT)
- Response 200 (JSON): Array of `TechnicianDto`
```json
[
  { "id": 1, "technicianName": "John Smith", "status": "AVAILABLE" }
]
```

`status` values are one of:
- `ON_LEAVE`
- `ON_TRAINING`
- `ON_MEDICAL_LEAVE`
- `AVAILABLE`

### Categories

#### GET /categories
- Description: List all service categories
- Auth: Required (Bearer JWT)
- Response 200 (JSON): Array of `CategoryDto`
```json
[
  { "id": 1, "categoryName": "Oil Change", "duration": 30 }
]
```

### Block Times

#### GET /blockTimes
- Description: List all block times
- Auth: Required (Bearer JWT)
- Response 200 (JSON): Array of `BlockTimeDto`
```json
[
  { "id": 1, "blockName": "Lunch", "duration": 60 }
]
```

### Data Models (DTOs)

- `RegisterUserDto`
  - `userName: string`
  - `password: string`

- `LoginResponse`
  - `token: string`

- `BayDto`
  - `id: number`
  - `bayName: string`
  - `bayNumber: string`

- `TechnicianDto`
  - `id: number`
  - `technicianName: string`
  - `status: TechnicianStatusEnum`

- `CategoryDto`
  - `id: number`
  - `categoryName: string`
  - `duration: number`

- `BlockTimeDto`
  - `id: number`
  - `blockName: string`
  - `duration: number`

### Security

All non-auth routes are protected by a JWT filter that expects a header `Authorization: Bearer <token>`. Invalid or missing tokens result in HTTP 401/403 responses. CSRF is disabled and sessions are stateless.

