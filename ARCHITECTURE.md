# DR Hub — System Architecture

> This document covers the full technical architecture of the DR Hub
> Office Hire System.

---

## Table of Contents

1. [High-Level Overview](#1-high-level-overview)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Database Schema](#4-database-schema)
5. [Authentication Flow](#5-authentication-flow)
6. [Core Booking Flow](#6-core-booking-flow)
7. [Payment Flow](#7-payment-flow)
8. [Notification Flow](#8-notification-flow)
9. [Role-Based Access Control](#9-role-based-access-control)
10. [Deployment Architecture](#10-deployment-architecture)

---

## 1. High-Level Overview

The system is divided into four layers. No layer skips another —
the frontend never talks directly to the database.
```mermaid
flowchart TD
    subgraph CLIENT["Client Layer"]
        A1["React SPA<br>Client Portal"]
        A2["React SPA<br>Admin Dashboard"]
    end

    subgraph API["API Layer — Node.js + Express"]
        B1["REST API Server<br>localhost:5000"]
        B2["Auth Middleware<br>JWT Verification"]
        B3["Role Middleware<br>Admin vs Client"]
        B4["Business Logic<br>Services Layer"]
    end

    subgraph DB["Data Layer — PostgreSQL"]
        C1[("Primary Database<br>All persistent data")]
    end

    subgraph EXT["External Services"]
        D1["M-Pesa Daraja<br>Payments"]
        D2["SendGrid<br>Email"]
        D3["Africa's Talking<br>SMS"]
        D4["AWS S3<br>File Storage"]
    end

    A1 -->|"HTTPS REST"| B1
    A2 -->|"HTTPS REST"| B1
    B1 --> B2 --> B3 --> B4
    B4 -->|"SQL via Sequelize"| C1
    B4 -->|"HTTP"| D1
    B4 -->|"HTTP"| D2
    B4 -->|"HTTP"| D3
    B4 -->|"HTTP"| D4

    classDef clientStyle fill:#fff7ed,stroke:#e87722,color:#7c2d12
    classDef apiStyle fill:#fefce8,stroke:#ca8a04,color:#713f12
    classDef dbStyle fill:#f3e8ff,stroke:#9333ea,color:#3b0764
    classDef extStyle fill:#f0fdf4,stroke:#16a34a,color:#14532d

    class A1,A2 clientStyle
    class B1,B2,B3,B4 apiStyle
    class C1 dbStyle
    class D1,D2,D3,D4 extStyle
```

---

## 2. Frontend Architecture

The frontend is a React 18 Single Page Application. All navigation
is client-side. The app is split into two portals sharing a single
codebase, separated by role.
```mermaid
flowchart TD
    subgraph ENTRY["Entry Point"]
        R["React App<br>App.jsx"]
    end

    subgraph ROUTER["React Router"]
        R --> PUB["Public Routes"]
        R --> AUTH["Protected Routes<br>requires JWT cookie"]
    end

    subgraph PUBLIC["Public Pages"]
        PUB --> P1["/ Homepage"]
        PUB --> P2["/rooms Rooms & Pricing"]
        PUB --> P3["/login Login"]
        PUB --> P4["/register Register"]
    end

    subgraph CLIENT_PAGES["Client Pages<br>role: client"]
        AUTH --> C1["/book Booking Interface"]
        AUTH --> C2["/book/confirm Confirmation"]
        AUTH --> C3["/dashboard Client Dashboard"]
        AUTH --> C4["/dashboard/feedback Feedback"]
    end

    subgraph ADMIN_PAGES["Admin Pages<br>role: admin"]
        AUTH --> AD1["/admin Overview"]
        AUTH --> AD2["/admin/bookings Booking Management"]
        AUTH --> AD3["/admin/schedule Visual Calendar"]
        AUTH --> AD4["/admin/leads Lead Manager"]
        AUTH --> AD5["/admin/analytics Analytics"]
        AUTH --> AD6["/admin/feedback Feedback Viewer"]
    end

    subgraph STATE["State Management"]
        CTX["AuthContext<br>user · role · token"]
        HOOK1["useBooking<br>booking form state"]
        HOOK2["useAvailability<br>polling every 30s"]
        HOOK3["useAdmin<br>admin data fetching"]
    end

    subgraph API_LAYER["API Layer — /src/api/"]
        AX["Axios Instance<br>baseURL · withCredentials"]
        AX --> AF1["auth.js"]
        AX --> AF2["bookings.js"]
        AX --> AF3["payments.js"]
        AX --> AF4["admin.js"]
        AX --> AF5["documents.js"]
    end

    C1 --> HOOK1
    C1 --> HOOK2
    AD1 --> HOOK3
    R --> CTX
    AF1 & AF2 & AF3 & AF4 & AF5 --> AX

    classDef page fill:#fff7ed,stroke:#e87722,color:#7c2d12
    classDef state fill:#eff6ff,stroke:#3b82f6,color:#1e3a5f
    classDef api fill:#fefce8,stroke:#ca8a04,color:#713f12

    class P1,P2,P3,P4,C1,C2,C3,C4,AD1,AD2,AD3,AD4,AD5,AD6 page
    class CTX,HOOK1,HOOK2,HOOK3 state
    class AX,AF1,AF2,AF3,AF4,AF5 api
```

---

## 3. Backend Architecture

Every request flows through the same chain:
**Route → Middleware → Controller → Service → Database**.
No layer is skipped. No business logic lives in routes.
```mermaid
flowchart LR
    subgraph INCOMING["Incoming Request"]
        REQ["HTTP Request<br>from React"]
    end

    subgraph MW["Middleware Chain"]
        MW1["cors()<br>allow React origin"]
        MW2["cookieParser()<br>read httpOnly cookie"]
        MW3["express.json()<br>parse request body"]
        MW4["authMiddleware<br>verify JWT"]
        MW5["roleMiddleware<br>check user.role"]
    end

    subgraph ROUTES["Routes /server/routes/"]
        RT1["auth.routes.js<br>/api/auth/*"]
        RT2["bookings.routes.js<br>/api/bookings/*"]
        RT3["rooms.routes.js<br>/api/rooms/*"]
        RT4["payments.routes.js<br>/api/payments/*"]
        RT5["admin.routes.js<br>/api/admin/*"]
        RT6["documents.routes.js<br>/api/documents/*"]
    end

    subgraph CTRL["Controllers"]
        CT1["auth.controller.js"]
        CT2["bookings.controller.js"]
        CT3["payments.controller.js"]
        CT4["admin.controller.js"]
        CT5["documents.controller.js"]
    end

    subgraph SVC["Services — Business Logic"]
        SV1["auth.service.js<br>hash · compare · sign JWT"]
        SV2["bookings.service.js<br>conflict check · create · confirm"]
        SV3["payments.service.js<br>STK push · webhook verify"]
        SV4["notifications.service.js<br>email · SMS triggers"]
        SV5["analytics.service.js<br>aggregate queries"]
        SV6["documents.service.js<br>upload · verify"]
    end

    subgraph MODELS["Models — Sequelize ORM"]
        M1["User.js"]
        M2["Booking.js"]
        M3["Room.js"]
        M4["Payment.js"]
        M5["Document.js"]
        M6["Feedback.js"]
    end

    REQ --> MW1 --> MW2 --> MW3
    MW3 --> RT1 & RT2 & RT3 & RT4 & RT5 & RT6
    RT2 --> MW4 --> MW5
    RT1 --> CT1
    RT2 --> CT2
    RT4 --> CT3
    RT5 --> CT4
    RT6 --> CT5
    CT1 --> SV1
    CT2 --> SV2
    CT3 --> SV3
    CT4 --> SV5
    CT5 --> SV6
    SV2 --> SV4
    SV1 & SV2 & SV3 & SV5 & SV6 --> M1 & M2 & M3 & M4 & M5 & M6

    classDef mw fill:#fef9c3,stroke:#ca8a04,color:#713f12
    classDef route fill:#fff7ed,stroke:#e87722,color:#7c2d12
    classDef ctrl fill:#f0fdf4,stroke:#16a34a,color:#14532d
    classDef svc fill:#eff6ff,stroke:#3b82f6,color:#1e3a5f
    classDef model fill:#f3e8ff,stroke:#9333ea,color:#3b0764

    class MW1,MW2,MW3,MW4,MW5 mw
    class RT1,RT2,RT3,RT4,RT5,RT6 route
    class CT1,CT2,CT3,CT4,CT5 ctrl
    class SV1,SV2,SV3,SV4,SV5,SV6 svc
    class M1,M2,M3,M4,M5,M6 model
```

---

## 4. Database Schema

Six tables with clear foreign key relationships.
The `UNIQUE(room_id, date, slot)` constraint on the bookings
table is the database-level guarantee against double bookings.
```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar name
        varchar email
        varchar phone
        varchar role
        boolean is_member
        timestamp created_at
    }

    ROOMS {
        uuid id PK
        varchar name
        integer capacity
        text description
        boolean is_active
    }

    BOOKINGS {
        uuid id PK
        uuid user_id FK
        uuid room_id FK
        uuid payment_id FK
        date date
        varchar slot
        varchar status
        varchar reference
        timestamp created_at
    }

    PAYMENTS {
        uuid id PK
        uuid user_id FK
        integer amount
        varchar status
        varchar provider
        varchar provider_ref
        timestamp created_at
    }

    DOCUMENTS {
        uuid id PK
        uuid user_id FK
        text file_url
        boolean verified
        timestamp uploaded_at
    }

    FEEDBACK {
        uuid id PK
        uuid booking_id FK
        uuid user_id FK
        integer rating
        text comment
        timestamp created_at
    }

    USERS ||--o{ BOOKINGS : "makes"
    USERS ||--o{ PAYMENTS : "initiates"
    USERS ||--o{ DOCUMENTS : "uploads"
    USERS ||--o{ FEEDBACK : "submits"
    ROOMS ||--o{ BOOKINGS : "hosts"
    BOOKINGS ||--|| PAYMENTS : "requires"
    BOOKINGS ||--o| FEEDBACK : "receives"
```

---

## 5. Authentication Flow

JWT is stored in an `httpOnly` cookie — never in localStorage.
This prevents XSS attacks from stealing the token.
```mermaid
sequenceDiagram
    actor User
    participant React
    participant API
    participant DB

    User->>React: Enters email + password
    React->>API: POST /api/auth/login
    API->>DB: SELECT * FROM users WHERE email = ?
    DB-->>API: Returns user record
    API->>API: bcrypt.compare(password, hash)

    alt Password valid
        API->>API: jwt.sign({id, role}, JWT_SECRET)
        API-->>React: 200 OK + Set-Cookie: token=JWT; httpOnly
        React->>React: Store user in AuthContext
        React-->>User: Redirect to dashboard
    else Password invalid
        API-->>React: 401 Unauthorized
        React-->>User: Show error message
    end

    Note over React,API: Every subsequent request sends<br/>cookie automatically via withCredentials:true

    React->>API: GET /api/bookings (cookie sent automatically)
    API->>API: authMiddleware — jwt.verify(cookie.token)
    API->>API: roleMiddleware — check user.role

    alt Valid token + correct role
        API-->>React: 200 OK + requested data
    else Invalid token
        API-->>React: 401 — redirect to login
    else Wrong role
        API-->>React: 403 — access denied
    end
```

---

## 6. Core Booking Flow

This is the most critical flow in the system.
Note that availability is checked TWICE — once optimistically
in the UI, and again inside the service before the database write.
```mermaid
sequenceDiagram
    actor Client
    participant React
    participant API
    participant BookingService
    participant DB
    participant NotifyService

    Client->>React: Selects room + date + slot
    React->>API: GET /api/bookings/availability
    API->>DB: SELECT WHERE room_id + date + slot + status=confirmed
    DB-->>API: Returns result
    API-->>React: { available: true/false }
    React-->>Client: Slot shown as available or greyed out

    Client->>React: Fills details + uploads document
    React->>API: POST /api/documents/upload (multipart)
    API->>API: multer processes file
    API->>DB: INSERT INTO documents
    API-->>React: { documentId }

    Client->>React: Clicks Proceed to Payment
    React->>API: POST /api/payments/initiate
    API->>API: M-Pesa STK Push request
    API-->>React: { paymentReference }
    React-->>Client: "Check your phone for M-Pesa prompt"

    Client->>Client: Completes payment on phone

    API->>API: POST /api/payments/webhook (from M-Pesa)
    API->>API: Verify webhook signature
    API->>DB: UPDATE payments SET status=completed

    API->>BookingService: createBooking()
    BookingService->>DB: Re-check availability (race condition guard)

    alt Slot still available
        BookingService->>DB: INSERT INTO bookings
        Note over BookingService,DB: UNIQUE(room_id, date, slot)<br/>enforced at DB level
        DB-->>BookingService: Booking created
        BookingService->>NotifyService: sendConfirmation() — non-blocking
        NotifyService-->>Client: Email + SMS confirmation
        BookingService-->>API: { booking }
        API-->>React: 201 Created
        React-->>Client: Confirmation screen + booking reference
    else Slot taken (race condition)
        DB-->>BookingService: UNIQUE constraint violation
        BookingService-->>API: Error — slot already booked
        API-->>React: 409 Conflict
        React-->>Client: "Sorry, this slot was just taken"
    end
```

---

## 7. Payment Flow

Payment confirmation comes from M-Pesa's webhook — not from
the client. This is the correct and secure approach. Never trust
a client-side payment callback.
```mermaid
flowchart TD
    A["Client clicks<br>Proceed to Payment"] --> B["POST /api/payments/initiate"]
    B --> C["Backend requests<br>M-Pesa OAuth token"]
    C --> D["Backend sends<br>STK Push request to M-Pesa"]
    D --> E["M-Pesa sends push<br>to client's phone"]
    E --> F{Client action<br>on phone}

    F -->|"Enters PIN<br>and confirms"| G["M-Pesa processes payment"]
    F -->|"Cancels or<br>times out"| H["M-Pesa sends failure webhook"]

    G --> I["M-Pesa sends<br>success webhook<br>POST /api/payments/webhook"]
    H --> J["Backend updates<br>payment status = failed"]
    J --> K["React polls status<br>shows failure message"]

    I --> L["Backend verifies<br>webhook signature"]
    L --> M["UPDATE payments<br>SET status = completed"]
    M --> N["Trigger booking<br>creation automatically"]
    N --> O["Booking confirmed<br>Notifications sent"]
    O --> P["React receives<br>confirmation response"]
    P --> Q["Render confirmation<br>screen to client"]

    classDef success fill:#f0fdf4,stroke:#16a34a,color:#14532d
    classDef failure fill:#fff1f2,stroke:#e11d48,color:#4c0519
    classDef process fill:#fff7ed,stroke:#e87722,color:#7c2d12

    class G,I,L,M,N,O,P,Q success
    class H,J,K failure
    class A,B,C,D,E,F process
```

---

## 8. Notification Flow

Notifications are always fired asynchronously — a failed
email or SMS must never cause a booking to fail.
```mermaid
flowchart LR
    subgraph TRIGGERS["Notification Triggers"]
        T1["Booking confirmed"]
        T2["Booking pending<br>payment overdue"]
        T3["24hrs before session"]
        T4["Admin approves<br>or rejects"]
        T5["Post-session<br>feedback request"]
    end

    subgraph SERVICE["notifications.service.js"]
        NS["NotificationsService<br>.sendConfirmation()<br>.sendReminder()<br>.sendAdminAlert()"]
    end

    subgraph CHANNELS["Delivery Channels"]
        CH1["SendGrid<br>Email"]
        CH2["Africa's Talking<br>SMS"]
    end

    subgraph TEMPLATES["Message Templates"]
        TP1["Booking confirmation<br>+ reference number"]
        TP2["Payment reminder<br>+ payment link"]
        TP3["Session reminder<br>+ room details"]
        TP4["Approval or<br>rejection notice"]
        TP5["Feedback request<br>+ booking summary"]
    end

    subgraph LOG["Notifications Log — DB"]
        DB1[("notifications<br>table<br>type · recipient<br>sent_at · status")]
    end

    T1 & T2 & T3 & T4 & T5 -->|"async — non-blocking"| NS
    NS --> CH1 & CH2
    CH1 --> TP1 & TP2 & TP3 & TP4 & TP5
    CH2 --> TP1 & TP3
    NS -->|"log every attempt"| DB1

    classDef trigger fill:#fff7ed,stroke:#e87722,color:#7c2d12
    classDef svc fill:#eff6ff,stroke:#3b82f6,color:#1e3a5f
    classDef channel fill:#f0fdf4,stroke:#16a34a,color:#14532d
    classDef db fill:#f3e8ff,stroke:#9333ea,color:#3b0764

    class T1,T2,T3,T4,T5 trigger
    class NS svc
    class CH1,CH2 channel
    class DB1 db
```

---

## 9. Role-Based Access Control

Two roles exist in the system: `client` and `admin`.
Every protected route passes through both middleware layers.
```mermaid
flowchart TD
    REQ["Incoming Request"] --> AM["authMiddleware<br>jwt.verify cookie"]

    AM -->|"No cookie<br>or invalid JWT"| E1["401 Unauthorized<br>Redirect to login"]
    AM -->|"Valid JWT"| RM["roleMiddleware<br>check user.role"]

    RM --> ROLE{user.role}

    ROLE -->|"client"| CLIENT_ROUTES["Client Routes Only"]
    ROLE -->|"admin"| ADMIN_ROUTES["Admin Routes Only"]
    ROLE -->|"role mismatch"| E2["403 Forbidden<br>Access denied"]

    subgraph CLIENT_ROUTES["Client Access"]
        CR1["GET /api/bookings/my-bookings"]
        CR2["POST /api/bookings"]
        CR3["GET /api/rooms"]
        CR4["POST /api/documents/upload"]
        CR5["POST /api/feedback"]
        CR6["GET /api/payments/status"]
    end

    subgraph ADMIN_ROUTES["Admin Access"]
        AR1["GET /api/admin/bookings — all bookings"]
        AR2["PATCH /api/admin/bookings/:id — approve/reject"]
        AR3["GET /api/admin/analytics"]
        AR4["GET /api/admin/leads"]
        AR5["GET /api/admin/feedback"]
        AR6["POST /api/admin/notifications/send"]
    end

    classDef error fill:#fff1f2,stroke:#e11d48,color:#4c0519
    classDef client fill:#fff7ed,stroke:#e87722,color:#7c2d12
    classDef admin fill:#eff6ff,stroke:#3b82f6,color:#1e3a5f
    classDef mw fill:#fef9c3,stroke:#ca8a04,color:#713f12

    class E1,E2 error
    class CR1,CR2,CR3,CR4,CR5,CR6 client
    class AR1,AR2,AR3,AR4,AR5,AR6 admin
    class AM,RM mw
```

---

## 10. Deployment Architecture
```mermaid
flowchart TD
    subgraph DEV["Development Environment"]
        DV1["React Dev Server<br>localhost:3000"]
        DV2["Express Server<br>localhost:5000"]
        DV3[("PostgreSQL<br>localhost:5432")]
        DV4["Local /uploads<br>folder"]
        DV1 <-->|"proxy"| DV2
        DV2 <--> DV3
        DV2 <--> DV4
    end

    subgraph PROD["Production Environment"]
        subgraph FRONTEND["Frontend — Vercel"]
            PF["React Build<br>drhub.co.ke"]
        end

        subgraph BACKEND["Backend — Railway"]
            PB["Node.js Server<br>api.drhub.co.ke"]
        end

        subgraph DATABASE["Database — Supabase / Neon"]
            PD[("PostgreSQL<br>Managed + Backups")]
        end

        subgraph STORAGE["Storage — AWS S3"]
            PS["S3 Bucket<br>drhub-documents"]
        end

        PF <-->|"HTTPS REST"| PB
        PB <-->|"SSL connection"| PD
        PB <-->|"SDK"| PS
    end

    subgraph EXTERNAL["External APIs"]
        EX1["M-Pesa Daraja<br>api.safaricom.co.ke"]
        EX2["SendGrid<br>api.sendgrid.com"]
        EX3["Africa's Talking<br>api.africastalking.com"]
    end

    PB <-->|"HTTPS"| EX1
    PB -->|"HTTPS"| EX2
    PB -->|"HTTPS"| EX3

    classDef dev fill:#f3e8ff,stroke:#9333ea,color:#3b0764
    classDef prod fill:#f0fdf4,stroke:#16a34a,color:#14532d
    classDef ext fill:#fff7ed,stroke:#e87722,color:#7c2d12

    class DV1,DV2,DV3,DV4 dev
    class PF,PB,PD,PS prod
    class EX1,EX2,EX3 ext
```

---

## Key Architecture Decisions

| Decision | Choice | Reason |
|---|---|---|
| SPA framework | React 18 | Component reuse across client and admin portals |
| API style | REST | Simple, well-understood, easy to test |
| Auth storage | httpOnly cookie | Prevents XSS token theft vs localStorage |
| ORM | Sequelize | Migration support + model validation |
| Double-booking guard | DB UNIQUE constraint + service check | Two layers — service catches it cleanly, DB is the final guarantee |
| Payment confirmation | M-Pesa webhook | Never trust client-side callbacks for payment status |
| Notifications | Async non-blocking | A failed email must never fail a booking |
| Real-time availability | 30s polling (demo) → WebSockets (production) | Polling sufficient for demo; WebSockets added post-launch |

---

*Last updated: April 2026 — DR Hub Engineering Team*