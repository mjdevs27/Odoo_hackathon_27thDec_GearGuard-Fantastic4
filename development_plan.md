# GearGuard Development Plan 🚀

## What We're Building

A maintenance management system with:
1. **Equipment Registry** - Track all company equipment
2. **Maintenance Requests** - Report and track repair work
3. **Team Management** - Assign work to maintenance teams
4. **Kanban Board** - Visual workflow (NEW → IN_PROGRESS → REPAIRED/SCRAP)
5. **Calendar** - Schedule preventive maintenance
6. **Dashboard** - Overview of all activities

---

## Phase 2: Core Features (Next Steps)

### 1. Equipment Management 📦

**What it does:** View and manage all company equipment.

**How we'll build it:**

**Backend (Already Done ✅):**
- `GET /api/equipment` - List all equipment
- `GET /api/equipment/:id` - Get equipment details

**Frontend (To Build):**
```
Step 1: Create Equipment List Page
├── Display equipment in a table/grid
├── Show: Name, Serial #, Category, Location, Status
├── Add filters (by category, department, status)
└── Click to view details

Step 2: Create Equipment Detail Page
├── Show all equipment info
├── Display maintenance history
├── Show assigned team and technician
└── Link to create new maintenance request
```

**Files to Create:**
- `frontend/src/pages/Equipment/EquipmentList.tsx`
- `frontend/src/pages/Equipment/EquipmentDetail.tsx`
- `frontend/src/components/equipment/EquipmentCard.tsx`
- `frontend/src/services/equipment.ts` (API calls)

---

### 2. Maintenance Request List 🔧

**What it does:** View all maintenance requests with filtering.

**How we'll build it:**

**Backend (Already Done ✅):**
- `GET /api/requests` - List all requests

**Frontend (To Build):**
```
Step 1: Create Request List Page
├── Display requests in a table
├── Show: Subject, Equipment, Priority, Stage, Due Date
├── Color-code by priority (RED=urgent, YELLOW=high, etc.)
├── Show overdue indicator
└── Add filters (by stage, priority, type)

Step 2: Add Request Detail Modal/Page
├── Show full request details
├── Display comments/worklog
├── Show activity history
└── Add "Update Status" button
```

**Files to Create:**
- `frontend/src/pages/Maintenance/RequestList.tsx`
- `frontend/src/components/maintenance/RequestCard.tsx`
- `frontend/src/components/maintenance/RequestDetail.tsx`
- `frontend/src/services/requests.ts` (API calls)

---

### 3. Kanban Board 📋

**What it does:** Drag-and-drop visual workflow for requests.

**How we'll build it:**

**Backend (Already Done ✅):**
- `GET /api/requests/kanban` - Grouped by stage

**Frontend (To Build):**
```
Step 1: Create Kanban Board Layout
├── 4 columns: NEW | IN_PROGRESS | REPAIRED | SCRAP
├── Each column shows count
└── Cards display: Subject, Priority, Equipment

Step 2: Add Drag-and-Drop
├── Use react-beautiful-dnd library
├── Drag card from one column to another
├── On drop → call API to update stage
└── Show loading state during update

Step 3: Add Card Details
├── Click card to open detail modal
├── Show priority color indicator
├── Show overdue badge if applicable
└── Show assigned technician avatar
```

**Backend to Add:**
- `PATCH /api/requests/:id/stage` - Update request stage

**Files to Create:**
- `frontend/src/pages/Maintenance/KanbanView.tsx`
- `frontend/src/components/maintenance/KanbanBoard.tsx`
- `frontend/src/components/maintenance/KanbanCard.tsx`

**Libraries Needed:**
```bash
npm install react-beautiful-dnd @types/react-beautiful-dnd
```

---

### 4. Calendar View 📅

**What it does:** Schedule and view preventive maintenance.

**How we'll build it:**

**Backend (Already Done ✅):**
- `GET /api/requests/calendar` - PREVENTIVE requests only

**Frontend (To Build):**
```
Step 1: Set Up FullCalendar
├── Install FullCalendar library
├── Configure month/week/day views
└── Set up event rendering

Step 2: Display Preventive Maintenance
├── Fetch calendar data from API
├── Convert to FullCalendar event format
├── Color-code by priority
└── Show equipment name in event title

Step 3: Add Interactivity
├── Click event to view request details
├── Show event duration
└── Display assigned technician
```

**Files to Create:**
- `frontend/src/pages/Maintenance/CalendarView.tsx`
- `frontend/src/components/maintenance/CalendarEvent.tsx`

**Libraries Needed:**
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

---

### 5. Dashboard 📊

**What it does:** Overview of key metrics and recent activity.

**How we'll build it:**

**Backend to Add:**
```
GET /api/dashboard/stats
├── Total equipment count
├── Active equipment count
├── Open requests count
├── Overdue requests count
├── Requests by stage (for chart)
└── Recent activity
```

**Frontend (To Build):**
```
Step 1: Create Metric Cards
├── Total Equipment
├── Open Requests
├── Overdue Requests
└── Completed This Month

Step 2: Add Charts
├── Requests by Stage (Pie/Donut chart)
├── Requests by Priority (Bar chart)
└── Equipment by Category (Bar chart)

Step 3: Recent Activity Feed
├── Show last 10 activities
├── "Request #123 moved to IN_PROGRESS"
└── "Equipment XYZ assigned to Team A"
```

**Files to Create:**
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/components/dashboard/MetricCard.tsx`
- `frontend/src/components/dashboard/Charts.tsx`
- `frontend/src/components/dashboard/ActivityFeed.tsx`

**Libraries Needed:**
```bash
npm install recharts
```

---

## Phase 3: Advanced Features

### 6. Create/Edit Requests ➕

**Backend to Add:**
```
POST /api/requests - Create new request
PATCH /api/requests/:id - Update request
POST /api/requests/:id/comments - Add comment
```

**Frontend:**
- Request creation form
- Equipment selector dropdown
- Team/technician assignment
- Priority and type selection

---

### 7. Team Management 👥

**Backend to Add:**
```
GET /api/teams - List all teams
GET /api/teams/:id/members - Get team members
GET /api/teams/:id/workload - Get team workload
```

**Frontend:**
- Team list page
- Team member management
- Workload visualization

---

### 8. Search & Filters 🔍

**Frontend:**
- Global search bar
- Advanced filters for equipment
- Advanced filters for requests
- Save filter presets

---

## Development Order (Recommended)

### Week 1: Core UI
1. ✅ Setup (Done)
2. Equipment List Page
3. Request List Page
4. Basic routing and navigation

### Week 2: Interactive Features
5. Kanban Board with drag-drop
6. Calendar View
7. Dashboard with charts

### Week 3: CRUD Operations
8. Create Request Form
9. Edit Request
10. Comments/Activity Log

### Week 4: Polish
11. Team Management
12. Search & Filters
13. Mobile responsiveness
14. Performance optimization

---

## Key Technologies We'll Use

**Frontend:**
- **React Router** - Page navigation
- **Axios** - API calls
- **react-beautiful-dnd** - Kanban drag-drop
- **FullCalendar** - Calendar view
- **Recharts** - Dashboard charts
- **Lucide React** - Icons
- **Tailwind CSS** - Styling

**Backend:**
- **Express** - API server
- **pg** - PostgreSQL queries
- **TypeScript** - Type safety

---

## How Each Feature Connects

```
Equipment Registry
    ↓
Maintenance Request Created
    ↓
Appears in: Request List, Kanban (NEW), Dashboard
    ↓
Assigned to Team
    ↓
Technician moves to IN_PROGRESS (Kanban)
    ↓
Work completed → REPAIRED (Kanban)
    ↓
Shows in Dashboard as "Completed"
```

**Preventive Maintenance Flow:**
```
Equipment Registry
    ↓
Schedule Preventive Maintenance
    ↓
Appears in: Calendar View, Request List
    ↓
On scheduled date → Technician completes
    ↓
Marked as REPAIRED
```

---

## Next Immediate Steps

1. **Start Frontend Dev Server**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Set Up Routing**
   - Install react-router-dom
   - Create basic layout (Navbar, Sidebar)
   - Set up routes for pages

3. **Create Axios Service**
   - API base configuration
   - Equipment service
   - Requests service

4. **Build First Page: Equipment List**
   - Fetch data from API
   - Display in table/grid
   - Add basic styling

**Ready to start?** We'll build one feature at a time, testing as we go! 🚀
