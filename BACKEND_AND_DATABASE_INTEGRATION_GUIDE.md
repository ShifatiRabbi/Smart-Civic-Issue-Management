# Smart Civic Issue Management Platform
## Backend (BE) & Database (DB) Integration Blueprint & Technical Specification

> **Version**: 1.0.0-PROD  
> **Target Audience**: Backend Engineers (Spring Boot / Node.js / Go), Database Administrators (PostgreSQL / PostGIS), Cloud Platform Engineers.  
> **Frontend Stack**: React 18+, TypeScript, Tailwind CSS, Vite, Lucide Icons.  
> **API Standard**: RESTful JSON over HTTPS, RFC 7807 Problem Details, Spring Data Pageable pagination, WebSocket / STOMP for geospatial telemetry.

---

## 1. Architectural System Overview

The **Smart Civic Issue Management Platform** is a multi-tenant, role-based municipal service delivery platform designed for cities and civic authorities. It automates the lifecycle of citizen complaints, spatial dispatch of emergency crews, SLA escalation management, regulatory compliance, and geospatial fleet operations.

### High-Level System Architecture

```
+-------------------------------------------------------------------------------+
|                             CLIENT APPLICATION                                |
|  [Citizen Portal]  [Worker Terminal]  [Staff Triage]  [Supervisor]  [Admin]   |
+---------------------------------------+---------------------------------------+
                                        |
                 RESTful HTTPS JSON     |    WSS (STOMP / WebSocket)
             (Authorization: Bearer)    |    (Fleet GPS & Alerts)
                                        v
+-------------------------------------------------------------------------------+
|                       API GATEWAY / INGRESS CONTROLLER                        |
|   - Rate Limiting (100 req/min/IP)          - CORS Security                   |
|   - Distributed Tracing (X-Correlation-ID)  - TLS Termination                 |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                      BACKEND APPLICATION (e.g. Spring Boot 3)                  |
|  +--------------------+  +--------------------+  +-------------------------+  |
|  | Auth & RBAC Guard  |  | Complaint Lifecycle|  | SLA Escalation Monitor  |  |
|  +--------------------+  +--------------------+  +-------------------------+  |
|  +--------------------+  +--------------------+  +-------------------------+  |
|  | GIS Proximity Dis. |  | AI Auto-Triage (AI)|  | Regulatory Audit Engine |  |
|  +--------------------+  +--------------------+  +-------------------------+  |
+-------------------+-------------------+-------------------+-------------------+
                    |                   |                   |
                    v                   v                   v
        +-----------------------+ +---------------+ +-----------------------+
        | PostgreSQL 15+        | | S3 / GCS      | | Gemini 2.5 Flash      |
        | + PostGIS Spatial DB  | | Cloud Storage | | AI Civic Intelligence |
        +-----------------------+ +---------------+ +-----------------------+
```

### Supported User Roles (RBAC Matrix)

| Role Code | Role Name | Primary Interface | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| `PUBLIC` | Anonymous Resident | `/explore`, `/map`, `/complaints/:ref` | View non-sensitive civic issues, track complaint by reference number, view public heatmap |
| `CITIZEN` | Registered Resident | `/citizen/*` | File geo-tagged reports, upload evidence, track personal complaints, endorse issues, receive SMS/email alerts |
| `FIELD_WORKER` | Municipal Crew | `/worker/*` | Accept assignments, update en-route/on-site status, upload resolution proof photos, record materials used |
| `DEPARTMENT_STAFF`| Intake / Triage Staff | `/staff/*` | Verify reports, reject duplicates, assign work orders to field crews, monitor department backlogs |
| `SUPERVISOR` | Ward Operations Lead | `/supervisor/*` | Oversee SLA compliance, approve/reject resolution proofs, override priority, handle escalations |
| `ADMIN` | Municipal Administrator | `/admin/*`, `/gis`, `/intelligence`, `/analytics` | Full system governance, user directory management, department setup, SLA matrix rules, audit log review |

---

## 2. Complaint Finite State Machine (FSM)

Every complaint strictly follows a deterministic state progression. Any invalid state transition MUST return `HTTP 409 Conflict` with an explanatory error code.

```
       [ Citizen Files Report ]
                  |
                  v
            +-----------+
            | SUBMITTED |
            +-----+-----+
                  |
                  | (Staff reviews report)
                  v
           +--------------+
           | UNDER_REVIEW |
           +------+-------+
                  |
         +--------+--------+
         |                 |
  (Staff Validates) (Invalid/Duplicate)
         |                 |
         v                 v
   +----------+      +----------+
   | VERIFIED |      | REJECTED |
   +-----+----+      +----------+
         |
         | (Staff Dispatches Worker)
         v
   +----------+
   | ASSIGNED |
   +-----+----+
         |
         | (Worker clicks "Start En Route")
         v
  +-------------+
  | IN_PROGRESS |
  +------+------+
         |
         | (Worker uploads proof & completes work)
         v
    +----------+
    | RESOLVED | <----+ (Supervisor rejects review: sends back)
    +----+-----+      |
         |            |
   (Supervisor Sign-Off / Citizen Satisfied)
         |
         +-----------------------------+
         |                             |
  (Citizen Approves / Auto-Close)  (Citizen Disputes / Dissatisfied)
         |                             |
         v                             v
     +--------+                  +----------+
     | CLOSED |                  | REOPENED |
     +--------+                  +----+-----+
                                      |
                                      +--> (Re-enters ASSIGNED or UNDER_REVIEW)
```

---

## 3. Database Schema Specification (PostgreSQL 15+ & PostGIS)

The database schema requires **PostgreSQL 15+** with the **PostGIS extension** enabled for spatial queries (bounding boxes, proximity buffers, and nearest-crew lookups).

### Entity Relationship Diagram (ERD)

```
+-------------------+        +----------------------+
|    departments    | 1    * | complaint_categories |
+-------------------+--------+----------------------+
| id (PK)           |        | id (PK)              |
| code (UNIQUE)     |        | department_id (FK)   |
| name              |        | code (UNIQUE)        |
+---------+---------+        | sla_target_hours     |
          |                  +----------+-----------+
          | 1                           | 1
          |                             |
          | *                           | *
+---------+---------+        +----------+-----------+        +----------------------+
|       users       | 1    * |   civic_complaints   | 1    * |complaint_attachments |
+-------------------+--------+----------------------+--------+----------------------+
| id (PK)           |        | id (PK)              |        | id (PK)              |
| email (UNIQUE)    |        | reference_no (UNIQUE)|        | complaint_id (FK)    |
| role              |        | category_id (FK)     |        | file_url             |
| department_id (FK)|        | department_id (FK)   |        | stage (SUB/RES)      |
+---------+---------+        | citizen_id (FK)      |        +----------------------+
          | 1                | assigned_worker_id(FK|
          |                  | location_geom (POINT)|
          | 1                | status               |        +----------------------+
+---------+---------+        | sla_status           | 1    * |  complaint_timeline  |
|   field_workers   |        | sla_deadline         |--------+----------------------+
+-------------------+        +----------+-----------+        | id (PK)              |
| id (PK, FK users) |                   | 1                  | complaint_id (FK)    |
| vehicle_number    |                   |                    | from_status          |
| status            |                   | *                  | to_status            |
| rating            |        +----------+-----------+        | actor_id (FK)        |
+-------------------+        |  complaint_supports  |        +----------------------+
                             +----------------------+
                             | complaint_id (FK)    |
                             | user_id (FK)         |
                             +----------------------+
```

### PostgreSQL DDL Schema Script

```sql
-- Enable PostGIS spatial extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Departments Table
CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Complaint Categories Table
CREATE TABLE complaint_categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    department_id VARCHAR(36) NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    icon_name VARCHAR(50) DEFAULT 'AlertCircle',
    sla_target_hours INTEGER NOT NULL DEFAULT 48,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Municipal Wards Table (with PostGIS Boundary Polygon)
CREATE TABLE municipal_wards (
    code VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    population INTEGER NOT NULL,
    councilor_name VARCHAR(100) NOT NULL,
    boundary_geom GEOMETRY(Polygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Users Table (Core RBAC)
CREATE TYPE user_role_enum AS ENUM (
    'PUBLIC', 'CITIZEN', 'FIELD_WORKER', 'DEPARTMENT_STAFF', 'SUPERVISOR', 'ADMIN'
);

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    role user_role_enum NOT NULL DEFAULT 'CITIZEN',
    department_id VARCHAR(36) REFERENCES departments(id) ON DELETE SET NULL,
    ward VARCHAR(30) REFERENCES municipal_wards(code) ON DELETE SET NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Field Workers Extension Table
CREATE TYPE worker_status_enum AS ENUM (
    'AVAILABLE', 'ON_DUTY', 'BUSY', 'ON_BREAK', 'OFF_DUTY'
);

CREATE TABLE field_workers (
    id VARCHAR(36) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(50) NOT NULL,
    status worker_status_enum NOT NULL DEFAULT 'AVAILABLE',
    max_capacity INTEGER NOT NULL DEFAULT 4,
    specialization VARCHAR(100) NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 4.50,
    current_location TEXT,
    location_geom GEOMETRY(Point, 4326),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Fleet Telemetry Table (Live GPS Ping Archive)
CREATE TABLE fleet_telemetry (
    id BIGSERIAL PRIMARY KEY,
    worker_id VARCHAR(36) NOT NULL REFERENCES field_workers(id) ON DELETE CASCADE,
    location_geom GEOMETRY(Point, 4326) NOT NULL,
    heading_degrees INTEGER DEFAULT 0,
    speed_kmh NUMERIC(5, 2) DEFAULT 0.0,
    battery_pct INTEGER CHECK (battery_pct BETWEEN 0 AND 100),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_fleet_telemetry_worker_time ON fleet_telemetry (worker_id, recorded_at DESC);

-- 7. Civic Complaints Table
CREATE TYPE complaint_status_enum AS ENUM (
    'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 
    'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED', 'CANCELLED'
);

CREATE TYPE priority_level_enum AS ENUM (
    'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
);

CREATE TYPE sla_status_enum AS ENUM (
    'WITHIN_SLA', 'AT_RISK', 'BREACHED'
);

CREATE TABLE civic_complaints (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    reference_number VARCHAR(40) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status complaint_status_enum NOT NULL DEFAULT 'SUBMITTED',
    priority priority_level_enum NOT NULL DEFAULT 'MEDIUM',
    category_id VARCHAR(36) NOT NULL REFERENCES complaint_categories(id),
    department_id VARCHAR(36) NOT NULL REFERENCES departments(id),
    ward VARCHAR(30) NOT NULL REFERENCES municipal_wards(code),
    address TEXT NOT NULL,
    location_geom GEOMETRY(Point, 4326) NOT NULL,
    citizen_id VARCHAR(36) NOT NULL REFERENCES users(id),
    assigned_worker_id VARCHAR(36) REFERENCES field_workers(id),
    sla_status sla_status_enum NOT NULL DEFAULT 'WITHIN_SLA',
    sla_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    support_count INTEGER NOT NULL DEFAULT 0,
    notify_sms BOOLEAN DEFAULT TRUE,
    notify_email BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Spatial and Performance Indexes
CREATE INDEX idx_complaints_geom ON civic_complaints USING GIST (location_geom);
CREATE INDEX idx_complaints_status_ward ON civic_complaints (status, ward);
CREATE INDEX idx_complaints_sla_status ON civic_complaints (sla_status, sla_deadline);
CREATE INDEX idx_complaints_citizen ON civic_complaints (citizen_id);
CREATE INDEX idx_complaints_worker ON civic_complaints (assigned_worker_id);

-- 9. Complaint Attachments Table
CREATE TABLE complaint_attachments (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    complaint_id VARCHAR(36) NOT NULL REFERENCES civic_complaints(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    stage VARCHAR(30) NOT NULL CHECK (stage IN ('SUBMISSION', 'RESOLUTION')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_attachments_complaint ON complaint_attachments(complaint_id);

-- 10. Complaint Timeline & Audit Trail
CREATE TABLE complaint_timeline (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    complaint_id VARCHAR(36) NOT NULL REFERENCES civic_complaints(id) ON DELETE CASCADE,
    from_status complaint_status_enum,
    to_status complaint_status_enum NOT NULL,
    actor_id VARCHAR(36) NOT NULL REFERENCES users(id),
    actor_name VARCHAR(150) NOT NULL,
    actor_role user_role_enum NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_timeline_complaint ON complaint_timeline(complaint_id, timestamp ASC);

-- 11. Community Upvotes / Support Endorsements
CREATE TABLE complaint_supports (
    complaint_id VARCHAR(36) NOT NULL REFERENCES civic_complaints(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (complaint_id, user_id)
);

-- 12. SLA Configuration Matrix
CREATE TABLE sla_matrix_rules (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    category_id VARCHAR(36) NOT NULL REFERENCES complaint_categories(id) ON DELETE CASCADE,
    priority priority_level_enum NOT NULL,
    target_hours INTEGER NOT NULL CHECK (target_hours > 0),
    warning_threshold_pct INTEGER NOT NULL DEFAULT 75 CHECK (warning_threshold_pct BETWEEN 50 AND 95),
    auto_escalation_role user_role_enum DEFAULT 'SUPERVISOR',
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sla_cat_priority UNIQUE (category_id, priority)
);

-- 13. Critical Municipal Assets (Hydrants, Substations, Bridges)
CREATE TABLE municipal_assets (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(150) NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- 'WATER_TREATMENT', 'SUBSTATION', 'BRIDGE', 'HOSPITAL'
    ward VARCHAR(30) REFERENCES municipal_wards(code),
    location_geom GEOMETRY(Point, 4326) NOT NULL,
    status VARCHAR(30) DEFAULT 'OPERATIONAL',
    inspection_cycle_days INTEGER DEFAULT 90,
    last_inspected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_assets_geom ON municipal_assets USING GIST (location_geom);

-- 14. Notifications Table
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_id VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

-- 15. Security & Regulatory Audit Logs
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    actor_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    correlation_id VARCHAR(64),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs (actor_id);
```

---

## 4. REST API Endpoint Specifications

All endpoints are versioned under `/api/v1`.

### Unified Request / Response Envelopes

#### 1. Success Data Envelope
```json
{
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2026-09-21T01:50:00.000Z"
}
```

#### 2. Spring Data Paginated Response
```json
{
  "content": [ ... ],
  "page": 0,
  "size": 10,
  "totalElements": 254,
  "totalPages": 26,
  "hasNext": true,
  "hasPrevious": false
}
```

#### 3. Standard RFC 7807 Error Response
```json
{
  "code": "VALIDATION_FAILED",
  "message": "One or more fields failed validation checks",
  "timestamp": "2026-09-21T01:50:00.000Z",
  "path": "/api/v1/complaints",
  "correlationId": "civic-1774259400000-8fx2a",
  "validationErrors": {
    "title": ["Title must contain at least 5 characters"],
    "ward": ["Specified ward 'WARD-99' is invalid or not recognized"]
  }
}
```

---

### Module 1: Authentication & User Session (`/auth`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Any | Authenticate with email and password; returns JWT access token (15m) and refresh token (7d). |
| `POST` | `/auth/register` | Any | Register a new citizen account. Sets role to `CITIZEN`. |
| `POST` | `/auth/refresh` | Any | Rotate JWT token using HTTP-only refresh cookie. |
| `GET` | `/auth/me` | Authenticated | Retrieve current user profile, role, department, and permissions. |
| `POST` | `/auth/logout` | Authenticated | Invalidate refresh token and session. |

**Login Request Body:**
```json
{
  "email": "citizen@city.gov",
  "password": "SecurePassword123!"
}
```

**Login Response Body (`200 OK`):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr-citizen-01",
      "fullName": "Sarah Jenkins",
      "email": "citizen@city.gov",
      "role": "CITIZEN",
      "ward": "Ward 4 (North)",
      "phone": "+1 (555) 019-2831"
    }
  },
  "timestamp": "2026-09-21T01:50:00.000Z"
}
```

---

### Module 2: Public Civic Portal (`/public`)

*Note: All public endpoints MUST strip citizen PII (citizen phone, email, and exact name) to preserve privacy compliance.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/public/complaints` | Paginated search of verified/in-progress issues. Supports filters: `?category=`, `?ward=`, `?status=`, `?page=`, `?size=`. |
| `GET` | `/public/complaints/{referenceNumber}` | View public timeline, status, and resolution photo for a specific complaint (e.g. `CC-2026-00412`). |
| `GET` | `/public/complaints/map` | Returns lightweight geospatial GeoJSON FeatureCollection of all active public pins (`latitude`, `longitude`, `status`, `priority`). |
| `GET` | `/public/stats` | Returns aggregate city stats (`totalResolved`, `activeIssues`, `slaComplianceRate`, `avgResolutionHours`). |

---

### Module 3: Citizen Workflows (`/complaints`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/complaints` | `CITIZEN` | Submit a new complaint with geo-coordinates, photos, and notification flags. |
| `GET` | `/complaints/my` | `CITIZEN` | Retrieve current user's submitted complaints with full history. |
| `GET` | `/complaints/{id}` | `CITIZEN`, Staff+ | Detailed view including worker assignments and full timeline. |
| `POST` | `/complaints/{id}/support` | `CITIZEN` | Endorse / upvote a community complaint (increments `support_count`). |
| `POST` | `/complaints/{id}/reopen` | `CITIZEN` | Reopen a `RESOLVED` issue within 7 days if unsatisfied with proof. |

**Create Complaint Request Body (`POST /complaints`):**
```json
{
  "title": "Severe Pothole Cluster with Exposed Rebar",
  "description": "Deep asphalt subsidence causing tire damage near the intersection.",
  "categoryCode": "POTHOLE",
  "ward": "Ward 4 (North)",
  "address": "452 Maple Boulevard, Sector 4",
  "coordinates": {
    "latitude": 23.8142,
    "longitude": 90.4189
  },
  "priority": "HIGH",
  "attachments": [
    {
      "name": "pothole_depth.jpg",
      "fileUrl": "https://storage.googleapis.com/.../pothole_depth.jpg",
      "fileSize": 2480100,
      "mimeType": "image/jpeg",
      "stage": "SUBMISSION"
    }
  ],
  "notifySms": true,
  "notifyEmail": true
}
```

---

### Module 4: Field Worker Terminal (`/worker`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/worker/assignments` | `FIELD_WORKER` | Get active work orders assigned to authenticated field worker. |
| `PATCH`| `/worker/assignments/{id}/status` | `FIELD_WORKER` | Update assignment status (`IN_PROGRESS` when en route, `ON_SITE`). |
| `POST` | `/worker/assignments/{id}/evidence`| `FIELD_WORKER` | Submit resolution proof (photo URL, resolution notes, materials used); triggers status -> `RESOLVED`. |

**Submit Evidence Request Body:**
```json
{
  "notes": "Hot asphalt mix compacted, surface leveled, reflective markers installed.",
  "photoUrl": "https://storage.googleapis.com/.../resolution_proof.jpg",
  "materialsUsed": "Cold mix asphalt (60kg), Tack coat emulsion, 4x reflective curb markers"
}
```

---

### Module 5: Department Staff Triage (`/staff`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/staff/complaints` | `STAFF`, `SUPERVISOR`, `ADMIN` | Intake queue for department staff. Filter by `status=SUBMITTED`, `priority`, `ward`. |
| `POST` | `/staff/complaints/{id}/verify` | `STAFF`, `SUPERVISOR`, `ADMIN` | Validate complaint as genuine municipal issue; sets status to `VERIFIED`. |
| `POST` | `/staff/complaints/{id}/reject` | `STAFF`, `SUPERVISOR`, `ADMIN` | Reject issue with official reason code (e.g. `DUPLICATE`, `OUT_OF_JURISDICTION`, `INSUFFICIENT_INFO`). |
| `POST` | `/staff/complaints/{id}/assign` | `STAFF`, `SUPERVISOR`, `ADMIN` | Dispatch complaint to a specific `workerId`; sets status to `ASSIGNED`. |
| `GET` | `/staff/workers` | `STAFF`, `SUPERVISOR`, `ADMIN` | Get department field workers with current workload capacity (`activeAssignments / maxCapacity`). |

---

### Module 6: Operations Supervisor (`/supervisor`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/supervisor/escalations` | `SUPERVISOR`, `ADMIN` | List complaints with `slaStatus IN ('AT_RISK', 'BREACHED')`. |
| `POST` | `/supervisor/reviews/{id}` | `SUPERVISOR`, `ADMIN` | Approve worker resolution (moves to `CLOSED`) or reject resolution (returns to `ASSIGNED` with rework notes). |
| `GET` | `/supervisor/metrics` | `SUPERVISOR`, `ADMIN` | Department resolution rates, first-time-fix rates, and crew velocity. |

---

### Module 7: Municipal System Administration (`/admin`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/users` | `ADMIN` | List all system users with role filtering and account statuses. |
| `POST` | `/admin/users` | `ADMIN` | Provision staff or field worker accounts. |
| `PUT` | `/admin/users/{id}/role` | `ADMIN` | Promote or change user RBAC roles. |
| `GET` | `/admin/departments` | `ADMIN` | List municipal departments, contacts, and active workforce counts. |
| `GET` | `/admin/sla-rules` | `ADMIN` | Fetch SLA configuration matrix (hours by category and priority). |
| `PUT` | `/admin/sla-rules/{id}` | `ADMIN` | Update SLA target hours or warning thresholds. |
| `GET` | `/admin/audit-logs` | `ADMIN` | Regulatory security audit log stream with filtering by actor, action, and date range. |

---

### Module 8: Geospatial GIS & Proximity Engine (`/gis`)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/gis/fleet` | `STAFF`, `SUPERVISOR`, `ADMIN` | Returns live GPS coordinates, heading, speed, and battery of all municipal field units. |
| `GET` | `/gis/wards` | Any Authenticated | GeoJSON polygons for all ward boundaries, open backlog counts, and population data. |
| `GET` | `/gis/assets` | Any Authenticated | GeoJSON points for critical municipal assets (water treatment plants, electrical substations). |
| `GET` | `/gis/clusters` | Any Authenticated | Spatial density clusters (heatmaps) of high-priority and breached complaints. |
| `GET` | `/gis/dispatch/proximity/{incidentId}` | `STAFF`, `SUPERVISOR`, `ADMIN` | Calculates geodesic distance and drive times from all available field workers to the incident, sorted ascending. |

**Proximity Dispatch Calculation SQL:**
```sql
SELECT 
    fw.id AS worker_id,
    u.full_name,
    fw.vehicle_number,
    fw.status,
    ST_Distance(
        fw.location_geom::geography, 
        c.location_geom::geography
    ) / 1000.0 AS distance_km,
    ROUND((ST_Distance(fw.location_geom::geography, c.location_geom::geography) / 1000.0 / 25.0 * 60.0)::numeric, 1) AS estimated_transit_minutes
FROM field_workers fw
JOIN users u ON fw.id = u.id
CROSS JOIN civic_complaints c
WHERE c.id = :incidentId AND fw.status IN ('AVAILABLE', 'ON_DUTY')
ORDER BY distance_km ASC;
```

---

### Module 9: AI Civic Intelligence Backend (`/intelligence`)

*Backend Implementation Recommendation: Implement server-side proxying using `@google/genai` with `process.env.GEMINI_API_KEY` to prevent client API key exposure.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/intelligence/triage` | Analyzes incident text and generates category prediction, department routing, priority level, urgency score (1-10), hazard warnings, and required equipment. |
| `POST` | `/intelligence/duplicates` | Calculates semantic cosine similarity + spatial distance (< 200m) between a new complaint and open complaints to suggest cluster merges. |
| `POST` | `/intelligence/citizen-summary`| Translates technical field work notes into courteous, plain-language updates for citizens. |

**Gemini Backend Auto-Triage Prompt Architecture:**
```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function triageCivicIncident(title: string, description: string, ward: string) {
  const prompt = `
You are the Municipal AI Dispatch Engine. Analyze this citizen complaint:
Title: "${title}"
Description: "${description}"
Ward: "${ward}"

Respond strictly with valid JSON containing:
{
  "predictedCategory": "POTHOLE" | "STREETLIGHT" | "DRAINAGE" | "GARBAGE" | "WATER_LEAK" | "PARK_MAINTENANCE",
  "predictedDepartment": "RBD" | "WMD" | "WSD" | "EUD" | "PRD",
  "confidenceScore": number (0.0 to 1.0),
  "suggestedPriority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "urgencyScore": number (1 to 10),
  "severityTier": "TIER_1_STANDARD" | "TIER_2_ELEVATED" | "TIER_3_EMERGENCY",
  "safetyHazardDetected": boolean,
  "hazardReasoning": string,
  "recommendedAction": string,
  "equipmentRequired": string[]
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  return JSON.parse(response.text);
}
```

---

## 5. Real-Time Telemetry via WebSocket / STOMP

For real-time GIS fleet tracking, active complaint progress updates, and SLA breach alarms, the backend should expose a STOMP endpoint over SockJS/WebSocket:

- **Endpoint**: `wss://<api-domain>/ws-civic`
- **Authentication**: Connect header `Authorization: Bearer <JWT>`

### Standard STOMP Topics & Queues

| Destination | Direction | Description |
| :--- | :--- | :--- |
| `/topic/fleet-telemetry` | Server -> Client | Broadcasts live vehicle positions every 3-5 seconds. |
| `/topic/complaints/{id}` | Server -> Client | Broadcasts timeline status transitions for a specific complaint. |
| `/topic/sla-alerts` | Server -> Client | Emits early warning notifications when complaints reach 75% SLA consumption. |
| `/app/worker/gps-ping` | Client -> Server | Ingests field worker GPS pings (`latitude`, `longitude`, `speed`, `heading`). |

**Telemetry Payload Example:**
```json
{
  "workerId": "usr-worker-01",
  "vehicleNumber": "CREW-TRUCK-04",
  "coordinates": {
    "latitude": 23.8124,
    "longitude": 90.4158
  },
  "heading": 85,
  "speedKmh": 28.5,
  "batteryPct": 91,
  "status": "EN_ROUTE",
  "activeAssignmentId": "CC-2026-00412",
  "timestamp": "2026-09-21T01:50:00.000Z"
}
```

---

## 6. How to Connect the Frontend to the Real Backend

The frontend is architected to switch from client mock state to the live Spring Boot / Node.js backend via a single environment variable.

### Step 1: Set Backend URL in Environment
In `.env` or during deployment in your environment variables:
```env
# Point to your live backend REST API root
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Step 2: Configure CORS on the Backend
Your backend MUST allow the following headers and methods:
- **Allowed Origins**: `http://localhost:3000`, `https://*.run.app`, or your production domain.
- **Allowed Methods**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- **Allowed Headers**: `Authorization`, `Content-Type`, `Accept`, `X-Correlation-ID`.
- **Exposed Headers**: `X-Correlation-ID`.
- **Allow Credentials**: `true`.

### Step 3: Run Seed Script
Execute the DDL schema provided in **Section 3** in your PostgreSQL database, and seed standard municipal departments (`Roads & Bridges`, `Sanitation`, `Water Authority`, `Electric`, `Parks`).

---

## 7. Distributed Tracing & Logging Standard

To trace every civic transaction across the system:
1. The frontend automatically generates and attaches an `X-Correlation-ID` header (format: `civic-<timestamp>-<random-hash>`).
2. The Backend MUST capture this header in a servlet filter or middleware (MDC logging) and forward it in all logs and downstream messages.
3. If an error occurs, the backend MUST echo back the same `correlationId` in the RFC 7807 error payload for immediate cross-system debugging.
