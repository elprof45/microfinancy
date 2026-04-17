# Workflow System Summary - Backend API

## Overview
The workflow system manages the approval process for financial movements (savings transactions) and bulk data imports in the Microphina application. It implements a state-machine pattern for movement approval workflows.

---

## 1. WORKFLOW ENDPOINTS

### File: `/src/workflows/workflows_router.ts`
**Base Path:** `/workflows` (all routes require authentication)

#### 1.1 Get Movement Status & Allowed Transitions
```
GET /workflows/mouvement-epargne/:id/status
```
**Description:** Retrieve current status and allowed transitions for a savings movement
**Auth:** Requires authentication (all roles)
**Access Control:** Users can only view movements from their agency (ADMIN can view all)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "reference": "MOV-001",
    "currentStatus": "EN_ATTENTE",
    "allowedTransitions": ["VALIDE", "REJETE"],
    "mouvement": {
      "montant": 50000,
      "dateMouvement": "2026-04-17T10:30:00Z",
      "type": "VERSEMENT",
      "observations": null
    }
  },
  "statusCode": 200
}
```

**Status Transition Rules:**
- `EN_ATTENTE` → `["VALIDE", "REJETE"]` (CAISSIER/ADMIN only, COLLECTEUR cannot transition)
- `VALIDE` → `["ANNULE"]` (ADMIN only)
- `REJETE` → `["EN_ATTENTE"]` (can be resubmitted)
- `ANNULE` → `[]` (terminal state)
- `REMBOURSE` → `[]` (terminal state)

---

#### 1.2 Approve a Movement
```
POST /workflows/mouvement-epargne/:id/approve
```
**Description:** Approve a pending movement (EN_ATTENTE → VALIDE)
**Auth Required:** ADMIN or CAISSIER only
**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Movement approved successfully",
    "newStatus": "VALIDE"
  },
  "statusCode": 200
}
```

**Errors:**
- `404`: Movement not found
- `403`: Invalid status transition (not EN_ATTENTE) or insufficient permissions

---

#### 1.3 Reject a Movement
```
POST /workflows/mouvement-epargne/:id/reject
```
**Description:** Reject a pending movement (EN_ATTENTE → REJETE)
**Auth Required:** ADMIN or CAISSIER only
**Request Body:**
```json
{
  "reason": "Optional rejection reason/explanation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Movement rejected",
    "newStatus": "REJETE"
  },
  "statusCode": 200
}
```

**Notes:**
- Rejection reason is stored in the `observations` field
- Movement can be resubmitted after rejection

---

#### 1.4 Cancel a Movement
```
POST /workflows/mouvement-epargne/:id/cancel
```
**Description:** Cancel an approved movement (VALIDE → ANNULE)
**Auth Required:** ADMIN only
**Request Body:**
```json
{
  "reason": "Optional cancellation reason"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Movement cancelled",
    "newStatus": "ANNULE"
  },
  "statusCode": 200
}
```

**Notes:**
- Only approved movements can be cancelled
- Terminal state - cannot be reactivated
- Cancellation reason stored in `observations`

---

#### 1.5 Get Cotisation Status
```
GET /workflows/cotisations/:id/status
```
**Description:** Retrieve status of a cotisation (monthly savings contribution)
**Auth:** Requires authentication (all roles)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "currentStatus": "ACTIVE",
    "cotisation": {
      "mois": "JANVIER",
      "annee": 2026,
      "mise": 10000,
      "isActif": true
    }
  },
  "statusCode": 200
}
```

**Status Values:**
- `ACTIVE`: `isActif = true`
- `INACTIVE`: `isActif = false`

---

#### 1.6 Get Pending Movements (Approval Queue)
```
GET /workflows/pending
```
**Description:** Retrieve all pending movements requiring approval
**Auth Required:** ADMIN or CAISSIER only
**Query Parameters:** None
**Pagination:** Limited to 50 most recent items

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 3,
    "movements": [
      {
        "id": 1,
        "reference": "MOV-001",
        "type": "VERSEMENT",
        "montant": 50000,
        "dateMouvement": "2026-04-17T10:30:00Z",
        "clientName": "Jean Dupont",
        "createdBy": "Alice Martin",
        "observations": null
      },
      {
        "id": 2,
        "reference": "MOV-002",
        "type": "RETRAIT",
        "montant": 25000,
        "dateMouvement": "2026-04-17T11:00:00Z",
        "clientName": "Marie Sow",
        "createdBy": "Bob Traore",
        "observations": null
      }
    ]
  },
  "statusCode": 200
}
```

**Data Filtering:**
- ADMIN: sees all pending movements across all agencies
- CAISSIER: sees only pending movements from their agency

---

## 2. BULK IMPORT ENDPOINTS

### File: `/src/bulk/bulk_router.ts`
**Base Path:** `/bulk` (all routes require authentication)

#### 2.1 Import Clients (Batch)
```
POST /bulk/import-clients
```
**Description:** Import multiple clients from JSON array
**Auth Required:** ADMIN or CAISSIER only
**Request Body:**
```json
{
  "agenceId": 1,
  "clients": [
    {
      "numeroClient": "CLI-001",
      "nom": "Jean Dupont",
      "telephone": "+223 75 12 34 56",
      "email": "jean@example.com",
      "agentCollecteurId": 5
    },
    {
      "numeroClient": "CLI-002",
      "nom": "Marie Sow",
      "telephone": "+223 75 98 76 54",
      "email": "marie@example.com"
    }
  ]
}
```

**Required Fields:**
- `agenceId`: Agency ID (must be accessible to user)
- `clients`: Array of client objects
  - `numeroClient` ✓ (required, must be unique)
  - `nom` ✓ (required)
  - `telephone` (optional)
  - `email` (optional)
  - `agentCollecteurId` (optional, defaults to current user's ID)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Import completed: 2 succeeded, 0 failed",
    "success": 2,
    "failed": 0,
    "errors": [],
    "createdClients": [
      {
        "id": 1,
        "numeroClient": "CLI-001",
        "nom": "Jean Dupont"
      },
      {
        "id": 2,
        "numeroClient": "CLI-002",
        "nom": "Marie Sow"
      }
    ]
  },
  "statusCode": 201
}
```

**Automatic Actions:**
- Creates client record
- Creates default EPARGNE (savings) account
- Creates passbook (carnet)
- All with XOF currency

**Error Handling:**
```json
{
  "success": true,
  "data": {
    "message": "Import completed: 1 succeeded, 1 failed",
    "success": 1,
    "failed": 1,
    "errors": [
      {
        "row": 2,
        "error": "Client CLI-002 already exists"
      }
    ],
    "createdClients": [...]
  },
  "statusCode": 201
}
```

**Validation Errors:**
- `numeroClient` must be unique
- Both `numeroClient` and `nom` are required
- User must have access to the specified agency

---

#### 2.2 Import Cotisations (Batch)
```
POST /bulk/import-cotisations
```
**Description:** Import multiple monthly savings contributions
**Auth Required:** ADMIN, CAISSIER, or COLLECTEUR

**Request Body:**
```json
{
  "agenceId": 1,
  "cotisations": [
    {
      "clientId": 1,
      "mois": "JANVIER",
      "annee": 2026,
      "mise": 10000
    },
    {
      "clientId": 1,
      "mois": "FEVRIER",
      "annee": 2026,
      "mise": 10000
    },
    {
      "clientId": 2,
      "mois": "JANVIER",
      "annee": 2026,
      "mise": 15000
    }
  ]
}
```

**Required Fields:**
- `agenceId` ✓
- `cotisations` ✓ (array with):
  - `clientId` ✓
  - `mois` ✓ (enum: JANVIER, FEVRIER, MARS, ..., DECEMBRE)
  - `annee` ✓
  - `mise` ✓ (contribution amount)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Import completed: 3 succeeded, 0 failed",
    "success": 3,
    "failed": 0,
    "errors": [],
    "createdCotisations": [
      {
        "id": 1,
        "mois": "JANVIER",
        "annee": 2026,
        "mise": 10000
      },
      {
        "id": 2,
        "mois": "FEVRIER",
        "annee": 2026,
        "mise": 10000
      },
      {
        "id": 3,
        "mois": "JANVIER",
        "annee": 2026,
        "mise": 15000
      }
    ]
  },
  "statusCode": 201
}
```

**Error Handling:**
```json
{
  "success": true,
  "data": {
    "message": "Import completed: 2 succeeded, 1 failed",
    "success": 2,
    "failed": 1,
    "errors": [
      {
        "row": 3,
        "error": "Cotisation for JANVIER/2026 already exists"
      }
    ],
    "createdCotisations": [...]
  },
  "statusCode": 201
}
```

**Validation:**
- Client must exist
- Client must have a passbook (carnet)
- No duplicate month/year combinations for same client
- All required fields must be present

---

#### 2.3 Bulk Validate Movements
```
POST /bulk/validate-movements
```
**Description:** Approve multiple movements at once
**Auth Required:** ADMIN or CAISSIER only

**Request Body:**
```json
{
  "movementIds": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Validation completed: 4 succeeded, 1 failed",
    "success": 4,
    "failed": 1,
    "errors": [
      {
        "id": 5,
        "error": "Cannot approve movement with status: VALIDE"
      }
    ],
    "updated": [1, 2, 3, 4]
  },
  "statusCode": 200
}
```

**Constraints:**
- Only EN_ATTENTE movements can be approved
- Failed items don't prevent other items from being processed
- Returns detailed error information per movement

---

## 3. WORKFLOW STATUS VALUES

### Movement Status Enum (`StatutTransaction`)
```
EN_ATTENTE   - Awaiting approval
VALIDE       - Approved and validated
REJETE       - Rejected by approver
ANNULE       - Cancelled after approval
REMBOURSE    - Reimbursed (terminal state)
```

### Status Transition State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW STATE MACHINE                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│    EN_ATTENTE ──[approve]──► VALIDE ──[cancel]──► ANNULE    │
│       ▲            │          (final)                        │
│       │            │                                         │
│       └────[resubmit after]──REJETE                          │
│               rejection         │                            │
│                                 │ (no revert)               │
│                            (terminal state)                 │
│                                                              │
│    [REMBOURSE] - Terminal state, no transitions             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. REQUEST/RESPONSE STRUCTURES

### Standard API Response Format
All endpoints follow this response structure:

**Success Response:**
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "statusCode": 200
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "statusCode": 400 | 403 | 404 | 500
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Validation error (bad request)
- `401`: Missing/invalid authentication token
- `403`: Insufficient permissions or forbidden action
- `404`: Resource not found
- `500`: Server error

---

## 5. WORKFLOW MIDDLEWARE & UTILITIES

### Authentication Middleware (`/src/middleware/auth.ts`)
- Applied to all workflow and bulk endpoints
- Extracts JWT token from `Authorization: Bearer <token>` header
- Adds user object to context (`c.user`) with:
  - `id`: User ID
  - `email`: User email
  - `role`: User role (ADMIN, CAISSIER, COLLECTEUR)
  - `agenceId`: User's agency ID
  - `societeId`: User's society ID

### Authorization Middleware (`/src/middleware/authorize.ts`)
```typescript
// Usage: requireRole(["ADMIN", "CAISSIER"])
export const requireRole = (allowedRoles: string[]) => Middleware
```

- Role-based access control (RBAC)
- Returns 403 if user role not in allowed list
- Returns 401 if user not authenticated

### Agency Access Control
```typescript
export const requireAgency = (c: Context, agencyIdToCheck?: number): boolean
```
- Validates user belongs to specified agency
- ADMIN users can access any agency
- Other roles restricted to their own agency
- Used internally in endpoints for data scoping

### Data Access Layer (`/src/data-access/mouvement-epargne.da.ts`)
**Available Functions:**
```typescript
findAllMouvementEpargnes()           // Get all movements with relations
findMouvementEpargneById(id)         // Get specific movement
createMouvementEpargne(data)         // Create new movement
updateMouvementEpargne(id, data)     // Update movement
deleteMouvementEpargne(id)           // Delete movement
statsMouvementEpargne(id)            // Get movement stats/summary
historyMouvementEpargne(id)          // Get movement history & related items
```

---

## 6. USER ROLES & PERMISSIONS

### Role Capabilities

| Endpoint | ADMIN | CAISSIER | COLLECTEUR |
|----------|-------|----------|-----------|
| GET /workflows/mouvement-epargne/:id/status | ✓ (can see all) | ✓ (own agency) | ✓ (view only, no transitions) |
| POST .../approve | ✓ | ✓ | ✗ |
| POST .../reject | ✓ | ✓ | ✗ |
| POST .../cancel | ✓ | ✗ | ✗ |
| GET /workflows/pending | ✓ (all) | ✓ (own agency) | ✗ |
| POST /bulk/import-clients | ✓ | ✓ | ✗ |
| POST /bulk/import-cotisations | ✓ | ✓ | ✓ |
| POST /bulk/validate-movements | ✓ | ✓ | ✗ |

---

## 7. KEY DATA MODELS (Prisma Schema)

### MouvementEpargne (Savings Movement)
```prisma
model MouvementEpargne {
  id              Int               @id @default(autoincrement())
  reference       String            @unique
  type            TypeMouvement     // VERSEMENT, RETRAIT, DEPOT
  montant         Decimal
  soldeAvant      Decimal
  soldeApres      Decimal
  dateMouvement   DateTime          @default(now())
  statut          StatutTransaction @default(EN_ATTENTE)
  observations    String?
  agenceId        Int
  clientId        Int?
  compteId        Int?
  creeParId       Int
  valideParId     Int?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}
```

### Cotisation (Monthly Contribution)
```prisma
model Cotisation {
  id                Int       @id @default(autoincrement())
  mois              Mois      // JANVIER...DECEMBRE
  annee             Int
  mise              Decimal   // Contribution amount
  clientId          Int
  carnetId          Int       // Passbook reference
  agenceId          Int
  agentCollecteurId Int
  isActif           Boolean   @default(true)
  soldeDisponible   Decimal
  dateOuverture     DateTime  @default(now())
  dateCloture       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

---

## 8. FRONTEND IMPLEMENTATION REQUIREMENTS

### Components Needed

1. **Workflow Status Indicator**
   - Display current status with color coding
   - Show allowed transitions as action buttons
   - Disable unavailable actions based on status

2. **Movement Approval Queue**
   - Paginated list of pending movements (max 50)
   - Filter by client, date range
   - Bulk action checkboxes
   - Detail view with full movement info

3. **Approval Dialog**
   - Show movement details
   - Display allowed transitions
   - Provide reason text field (for reject/cancel)
   - Confirmation before action

4. **Bulk Import Form**
   - Client import: CSV parser or JSON input
   - Cotisation import: spreadsheet UI
   - Progress indicator and error reporting
   - Summary of succeeded/failed rows

5. **Audit Trail**
   - Show who created movement
   - Show who validated/rejected
   - Display all status changes with timestamps

### API Integration Notes
- All endpoints are relative to `/` base URL
- Include `Authorization: Bearer <token>` header on all requests
- Handle 403 Forbidden for permission denials
- Implement retry logic for failed bulk operations
- Cache workflow pending list with 30-60 second TTL
- Disable actions based on user role (front-end safeguard)

