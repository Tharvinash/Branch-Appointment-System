## Functional Requirements — Branch Appointment System

### Document control
- **Project**: Branch Appointment System (Job Progress Control Board)
- **Scope**: Web UI (Next.js) + REST API (Spring Boot) for managing bays, technicians, service advisors, and the end-to-end vehicle booking/job lifecycle.
- **Version**: 1.0
- **Date**: 2025-12-15

### Purpose
Define the functional behavior the system must provide, including user-facing workflows and API capabilities required to support them.

### Definitions
- **Booking**: A vehicle/job record tracked from check-in to completion.
- **Bay**: A physical/operational work area (e.g., “Spray Booth (SB)”) with a unique bay number and an assigned technician.
- **Bay Name**: A standardized bay category name (seeded reference data).
- **Process history / Booking process**: Audit trail of booking status changes and bay-to-bay moves.
- **Time extension**: A record of a booking’s end time being extended (with required reason).

---

## Actors & roles
### Roles
- **Admin**
  - Manages reference/operational data (bays, technicians, service advisors).
  - Uses the booking dashboard to control and monitor job flow.
- **Technician**
  - Views the booking dashboard.
  - (Operationally) participates in job processing; technician availability/skills affect bay assignment.
- **Service Advisor**
  - Views the booking dashboard.
  - Creates and tracks bookings (check-ins).
- **System**
  - Enforces authentication, data validation, workflow rules, logging, and report generation.

### Role mapping
- **Backend roles**: `ADMIN`, `TECHNICIAN`, `SERVICE_ADVISOR`.
- **Frontend routing roles**: `admin` vs `user` (where `user` represents Technician/Service Advisor).

---

## Functional requirements

### FR-AUTH — Authentication & session
- **FR-AUTH-001 (Register)**: The system shall allow a new user to register with **name**, **email**, **password**, and **role**.
  - **Accepted roles**: Technician or Service Advisor via UI; Admin role may exist for administrative accounts.
  - **Acceptance criteria**:
    - Registration fails if email already exists.
    - Password is stored securely (hashed).

- **FR-AUTH-002 (Login)**: The system shall authenticate users by email + password and issue an **access token**.
  - **Acceptance criteria**:
    - Invalid credentials return an error.
    - Valid login returns token + user identity (id, name, email, role).

- **FR-AUTH-003 (Logout)**: The system shall allow users to logout by clearing the stored token and redirecting to login.

- **FR-AUTH-004 (Authenticated API access)**: All API endpoints except login/register shall require a valid bearer token.
  - **Acceptance criteria**:
    - Requests without a token are rejected.

- **FR-AUTH-005 (Role-based UI routing)**: After login, the UI shall route users to the correct dashboard based on role.
  - **Acceptance criteria**:
    - Admin users land on `/admin`.
    - Non-admin users land on `/user`.

---

### FR-REF — Reference data
- **FR-REF-001 (Leave reasons)**: The system shall provide a list of standard leave reasons to support Technician/Service Advisor “ON_LEAVE” status.

- **FR-REF-002 (Bay names)**: The system shall provide a list of standard bay names:
  - Surface Preparation (SP)
  - Spray Booth (SB)
  - Polishing (PL)
  - Assembly/Disassembly (A/D)
  - Panel Beating (PB)
  - Mechanical (MEC)
  - Windscreen (WS)
  - Frame Alligner (FA)
  - QC

- **FR-REF-003 (Stoppage reasons)**: The system shall provide a list of standard job stoppage reasons (e.g., waiting for parts, total loss).

---

### FR-TECH — Technician management (Admin)
- **FR-TECH-001 (List technicians)**: Admin shall be able to list all technicians.
- **FR-TECH-002 (Create technician)**: Admin shall be able to create a technician with:
  - **name** (required)
  - **status**: `AVAILABLE` or `ON_LEAVE` (required)
  - **reason** (optional; applicable when `ON_LEAVE`)
  - **job skills** (optional; set of Bay Names)
- **FR-TECH-003 (Update technician)**: Admin shall be able to update name/status/reason/job skills.
  - **Acceptance criteria**:
    - If status changes to `AVAILABLE`, reason is cleared.
    - If status is `ON_LEAVE`, reason may be set or left unchanged.
- **FR-TECH-004 (Delete technician)**: Admin shall be able to delete a technician.

---

### FR-SA — Service advisor management (Admin)
- **FR-SA-001 (List service advisors)**: Admin shall be able to list all service advisors.
- **FR-SA-002 (Create service advisor)**: Admin shall be able to create a service advisor with:
  - **name** (required)
  - **status**: `AVAILABLE` or `ON_LEAVE` (required)
  - **reason** (optional; applicable when `ON_LEAVE`)
- **FR-SA-003 (Update service advisor)**: Admin shall be able to update name/status/reason.
  - **Acceptance criteria**:
    - If status changes to `AVAILABLE`, reason is cleared.
- **FR-SA-004 (Delete service advisor)**: Admin shall be able to delete a service advisor.

---

### FR-BAY — Bay management (Admin)
- **FR-BAY-001 (List bays)**: Admin shall be able to list all bays with bay name, bay number, status, and assigned technician.
- **FR-BAY-002 (Create bay)**: Admin shall be able to create a bay with:
  - **bay name** (required; selected from Bay Names)
  - **bay number** (required; unique)
  - **status**: `ACTIVE` or `INACTIVE` (required)
  - **technician** (required)
  - **Acceptance criteria**:
    - The assigned technician must have the bay’s bay-name as a job skill.

- **FR-BAY-003 (Update bay)**: Admin shall be able to update bay name, bay number, status, and technician assignment.
  - **Acceptance criteria**:
    - If the bay name changes, the assigned technician must still have the required skill or the technician selection must be changed.

- **FR-BAY-004 (Delete bay)**: Admin shall be able to delete a bay.

---

### FR-BOOK — Booking lifecycle & workflow
#### Booking data
- **FR-BOOK-001 (Booking fields)**: A booking shall store:
  - **car registration number** (required)
  - **check-in date** (required)
  - **promise date** (required; must be on/after check-in date)
  - **service advisor** (required)
  - **bay** (required)
  - **job type**: `LIGHT`, `MEDIUM`, `HEAVY`, `WINDScreen` (required)
  - **status** (system-managed)
  - **job start/end time** (optional, required for certain transitions)
  - **stoppage reason** (optional; required for stoppage action)

#### Core booking operations
- **FR-BOOK-002 (Create booking / check-in)**: Authorized users shall be able to create a new booking.
  - **Acceptance criteria**:
    - New bookings are created in `QUEUING` status.

- **FR-BOOK-003 (View bookings)**: Authorized users shall be able to:
  - View all bookings
  - View a booking by id

- **FR-BOOK-004 (Update booking)**: Authorized users shall be able to update editable booking fields (car reg, dates, bay, advisor, job type, status transitions where allowed).

- **FR-BOOK-005 (Delete booking)**: Authorized users shall be able to delete a booking.

#### Status model
- **FR-BOOK-006 (Statuses)**: The system shall support these booking statuses:
  - `QUEUING`, `NEXT_JOB`, `ACTIVE_BOARD`, `BAY_QUEUE` (Waiting for QC), `JOB_STOPPAGE`, `REPAIR_COMPLETION`

- **FR-BOOK-007 (Allowed transitions)**: The system shall enforce valid workflow transitions:
  - `QUEUING` → `NEXT_JOB` (assign to bay)
  - `BAY_QUEUE` → `NEXT_JOB` (move to next job)
  - `NEXT_JOB` → `ACTIVE_BOARD` (start job)
  - `ACTIVE_BOARD` → `JOB_STOPPAGE` (pause job)
  - `JOB_STOPPAGE` → `ACTIVE_BOARD` (resume job)
  - `ACTIVE_BOARD` → `REPAIR_COMPLETION` (complete job)

- **FR-BOOK-008 (Start job requires times)**: When moving `NEXT_JOB` → `ACTIVE_BOARD`, job start and end times are required.

- **FR-BOOK-009 (Pause job requires stoppage reason)**: When moving `ACTIVE_BOARD` → `JOB_STOPPAGE`, the user shall select a stoppage reason.

- **FR-BOOK-010 (Change bay while ACTIVE_BOARD)**: The system shall allow moving an `ACTIVE_BOARD` booking to a different bay.
  - **Acceptance criteria**:
    - New start and end times are required for the moved booking.
    - The move is recorded in process history as a bay-to-bay transfer.

---

### FR-PROC — Process history logging
- **FR-PROC-001 (Status change audit)**: The system shall log every booking status change as a process-history entry including:
  - fromStatus, toStatus, changedAt
  - fromProcess (bay), toProcess (bay)
  - jobStartTime/jobEndTime when relevant

- **FR-PROC-002 (Bay transfer audit)**: The system shall log bay transfers for active jobs (even when status remains the same).

- **FR-PROC-003 (View process history)**: Users shall be able to view a booking’s process history ordered by time.

---

### FR-TIME — Time windows, extensions, and delay reason
- **FR-TIME-001 (Operating hours)**: The UI shall treat shop operating hours as **08:00–19:00** with 30-minute scheduling intervals.

- **FR-TIME-002 (Validate time ranges)**: When users input job start/end times or a new extended end time, the system shall reject times outside 08:00–19:00.

- **FR-TIME-003 (Extend production time)**: Users shall be able to extend a booking’s end time.
  - **Acceptance criteria**:
    - Booking must already have an end time.
    - New end time must be after the current end time.
    - Reason is required.
    - Extension is stored as a separate time-extension record and the booking end time is updated.

- **FR-TIME-004 (Delay reason requirement after extension)**: If a booking has had time extended in its **current bay**, the system shall require a **delay reason** before allowing:
  - Completing the job, or
  - Changing the bay

- **FR-TIME-005 (Delay reason persistence)**: The delay reason shall be stored against the most recent relevant process-history entry for the booking.

---

### FR-UI — Job Progress Control Board (dashboard)
- **FR-UI-001 (Dashboard availability)**: Admin and non-admin users shall have access to the Job Progress Control Board.

- **FR-UI-002 (Summary counters)**: The dashboard shall show counts for each status (bays open, queuing, next job, in progress, waiting for QC, repair completion, job stoppage).

- **FR-UI-003 (Status columns)**: The dashboard shall list bookings in dedicated sections:
  - Queuing (`QUEUING`)
  - Waiting for QC (`BAY_QUEUE`)
  - Repair Completion (`REPAIR_COMPLETION`)
  - Job Stoppage (`JOB_STOPPAGE`)

- **FR-UI-004 (Bay timeline view)**: The dashboard shall show a bay-by-bay timeline with:
  - Next Job cards for that bay (`NEXT_JOB`)
  - Active job blocks positioned by start/end time (`ACTIVE_BOARD`)
  - Bay metadata (bay name, number, technician, active/inactive indicator)

- **FR-UI-005 (Booking actions)**: From the booking modal, users shall be able to:
  - Assign to bay
  - Move to next job
  - Start job (enter start/end time)
  - Pause job (select stoppage reason)
  - Resume job
  - Extend time (reason required)
  - Change bay (times required; delay reason may be required)
  - Complete job (delay reason may be required)
  - View process history

- **FR-UI-006 (End-of-day pending jobs prompt)**: At 19:00, the system shall detect jobs still in production (active jobs ending at/after 19:00) and prompt the next day to review them.

---

### FR-REPORT — Export/reporting
- **FR-REPORT-001 (Download process report)**: Users shall be able to download an Excel report of booking process history.
  - **Filters**: optional car registration number filter.
  - **Filename**: `{carRegNo|all}_processes.xlsx`.

- **FR-REPORT-002 (Report columns)**: The report shall include at minimum:
  - Car No Plate
  - From Status
  - To Status
  - Changed At
  - From Process (Bay)
  - To Process (Bay)

---

## Out of scope (explicit)
- **Password reset** flows.
- **Appointment slot availability optimization** (e.g., conflict detection across bays beyond basic time inputs).
- **Full RBAC enforcement on the backend** (beyond “authenticated required”).

## Assumptions
- A “booking” represents a single vehicle job tracked across multiple bays.
- Bay names and standard reasons are seeded and expected to exist in each environment.
