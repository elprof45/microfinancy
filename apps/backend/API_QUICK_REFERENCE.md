# API Quick Reference

## Base URL
```
http://localhost:3030
```

## Authentication

### Headers
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### Endpoints

#### Register / Create First User
```http
POST /auth/register
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "nom": "Full Name",
  "role": "ADMIN|CAISSIER|COLLECTEUR",
  "agenceId": 1 (optional),
  "telephone": "+226..."
}
```

#### Login
```http
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
Response: { accessToken, refreshToken, user }
```

#### Refresh Token
```http
POST /auth/refresh
{ "refreshToken": "..." }
```

#### Logout
```http
POST /auth/logout
```

---

## Users Management (ADMIN Only)

```http
GET    /users                  # List all users
GET    /users/:id              # Get user details
POST   /users                  # Create new user
PUT    /users/:id              # Update user
DELETE /users/:id              # Delete user
GET    /users?skip=0&take=20   # Paginated list
```

---

## Entities (CRUD Operations)

### Societies
```http
GET/POST/PUT/DELETE /societies
GET /societies/:id
```

### Agencies
```http
GET/POST/PUT/DELETE /agences
GET /agences/:id
GET /agences/:id/stats
```

### Clients
```http
GET/POST/PUT/DELETE /client-totines
GET /client-totines/:id
```

### Accounts
```http
GET/POST/PUT/DELETE /comptes
GET /comptes/:id/history
```

### Cotisations
```http
GET/POST/PUT/DELETE /cotisations
GET /cotisations/:id
```

### Movements (Savings)
```http
GET/POST/PUT/DELETE /mouvement-epargnes
GET /mouvement-epargnes/:id/stats
GET /mouvement-epargnes/:id/history
```

### Passbooks (Carnets)
```http
GET/POST/PUT/DELETE /carnets
GET /carnets/:id
```

---

## Workflow Management

### Get Transaction Status
```http
GET /workflows/mouvement-epargne/:id/status
Response: { id, currentStatus, allowedTransitions }
```

### Approve Transaction
```http
POST /workflows/mouvement-epargne/:id/approve
Response: { message: "Movement approved successfully" }
```

### Reject Transaction
```http
POST /workflows/mouvement-epargne/:id/reject
{ "reason": "Invalid amount" }
```

### Cancel Transaction
```http
POST /workflows/mouvement-epargne/:id/cancel
{ "reason": "Client request" }
```

### Get Pending Approvals
```http
GET /workflows/pending
Response: { count, movements: [...] }
```

---

## Bulk Operations

### Import Clients
```http
POST /bulk/import-clients
{
  "agenceId": 1,
  "clients": [
    {
      "numeroClient": "CLI-001",
      "nom": "John Doe",
      "telephone": "+226...",
      "email": "john@example.com",
      "agentCollecteurId": 2
    }
  ]
}
Response: { success, failed, errors, createdClients }
```

### Import Cotisations
```http
POST /bulk/import-cotisations
{
  "agenceId": 1,
  "cotisations": [
    {
      "clientId": 1,
      "mois": "JANVIER",
      "annee": 2026,
      "mise": 50000
    }
  ]
}
```

### Validate Multiple Movements
```http
POST /bulk/validate-movements
{ "movementIds": [1, 2, 3] }
Response: { success, failed, updated }
```

---

## Analytics & Reporting

### Dashboard Overview
```http
GET /reports/dashboard
Response: {
  role,
  stats: { totalClients, totalBalance, pendingApprovals, activeCollectors, monthlyRevenue },
  alerts: { rejectedMovements, hasIssues }
}
```

### Agency Report
```http
GET /reports/agency/:id
Response: {
  agency,
  stats,
  collectorPerformance: [...]
}
```

### Collector Performance
```http
GET /reports/collector/:id
Response: {
  collector,
  stats: { managedClients, totalCotisations, totalCollected, averagePerCotisation }
}
```

### Revenue Analysis
```http
GET /reports/revenue?period=monthly
Response: { totalRevenue, revenueByType: [...] }
```

### Movement Summary
```http
GET /reports/movements
Response: {
  totalMovements,
  totalAmount,
  byStatus: [...],
  byType: [...]
}
```

---

## Pagination

Add to any GET list endpoint:
```
?skip=0&take=20&sortBy=createdAt&sortOrder=desc
```

Response includes:
```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "skip": 0,
  "take": 20,
  "statusCode": 200
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid or expired token",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied. Required roles: ADMIN, CAISSIER",
  "statusCode": 403
}
```

### 422 Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "code": "invalid_string",
      "message": "Invalid email address"
    }
  ],
  "statusCode": 422
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found",
  "statusCode": 404
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "statusCode": 500
}
```

---

## Success Response Format

```json
{
  "success": true,
  "data": { /* entity or array of entities */ },
  "statusCode": 200
}
```

---

## Status Codes Cheat Sheet

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 422 | Validation Error | Request validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## Entity Status Values

### Transactions (MouvementEpargne)
- `EN_ATTENTE` - Pending approval
- `VALIDE` - Approved
- `REJETE` - Rejected
- `ANNULE` - Cancelled
- `REMBOURSE` - Reimbursed

### Users (Utilisateur)
- `isActive: true` - Active
- `isActive: false` - Deactivated

### Cotisations
- `isActif: true` - Active
- `isActif: false` - Inactive

---

## Role Permissions Matrix

| Endpoint | ADMIN | CAISSIER | COLLECTEUR |
|----------|-------|----------|-----------|
| `/users` (create/delete) | ✅ | ❌ | ❌ |
| `/users` (read) | ✅ | ✅ | ✅ |
| `/workflows/approve` | ✅ | ✅ | ❌ |
| `/workflows/pending` | ✅ | ✅ | ❌ |
| `/bulk/*` | ✅ | ✅ | ❌ |
| `/reports/dashboard` | ✅ | ✅ | ✅ |
| `/reports/agency/:id` | ✅ | ✅ (own) | ❌ |
| `/reports/collector/:id` | ✅ | ❌ | ✅ (own) |
| `/client-totines` (create) | ✅ | ✅ | ❌ |
| `/cotisations` (create) | ✅ | ✅ | ✅ |

---

## Frontend Integration Checklist

- [ ] Store tokens from `/auth/login` response
- [ ] Add `Authorization: Bearer` header to all requests
- [ ] Handle 401 responses by redirecting to login page
- [ ] Implement token refresh when access token expires
- [ ] Show pending count from `/reports/dashboard` on dashboard
- [ ] Display validation errors from `details` array (422 responses)
- [ ] Use pagination for large lists (skip/take parameters)
- [ ] Show user's role and restrict UI based on permissions
- [ ] Display transaction statuses and allowed actions from `/workflows` endpoints
- [ ] Show import results with success/failure counts from `/bulk/*`
- [ ] Display analytics charts using data from `/reports/*`
- [ ] Implement form validation before sending requests
- [ ] Add loading states for async operations
- [ ] Show user-friendly error messages for failed requests
- [ ] Implement logout by clearing tokens
