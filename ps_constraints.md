# PS-Specific UX Constraints & Validation Rules

## Critical Constraints to Enforce

### 1. Calendar View - PREVENTIVE Requests Only

**Requirement:** Calendar must show ONLY preventive maintenance requests.

**Implementation:**

#### Backend API (Server-Side Filter)
```typescript
// backend/src/services/requestService.ts
export class RequestService {
  static async getCalendarRequests(companyId: string) {
    const query = `
      SELECT 
        mr.id, mr.subject, mr.scheduled_at, mr.duration_minutes,
        mr.equipment_id, mr.assigned_to_id, mr.team_id,
        e.name as equipment_name,
        u.full_name as assigned_to_name
      FROM maintenance_request mr
      JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN app_user u ON mr.assigned_to_id = u.id
      WHERE mr.company_id = $1
        AND mr.type = 'PREVENTIVE'  -- CRITICAL: Only preventive
        AND mr.scheduled_at IS NOT NULL
      ORDER BY mr.scheduled_at
    `;
    
    const result = await pool.query(query, [companyId]);
    return result.rows;
  }
}
```

#### Frontend UI (Client-Side Display)
```typescript
// frontend/src/pages/Maintenance/CalendarView.tsx
const CalendarView = () => {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    // API already filters for PREVENTIVE only
    requestsAPI.getCalendar().then(data => {
      const calendarEvents = data.map(req => ({
        id: req.id,
        title: req.subject,
        start: req.scheduled_at,
        end: addMinutes(req.scheduled_at, req.duration_minutes),
        backgroundColor: '#10b981', // Green for preventive
        extendedProps: {
          equipmentName: req.equipment_name,
          assignedTo: req.assigned_to_name,
          type: 'PREVENTIVE'
        }
      }));
      setEvents(calendarEvents);
    });
  }, []);
  
  return <FullCalendar events={events} />;
};
```

---

### 2. Kanban Board - Exact Stage Mapping

**Requirement:** Drag-drop must map exactly to stages: NEW → IN_PROGRESS → REPAIRED/SCRAP

**Implementation:**

#### Kanban Column Configuration
```typescript
// frontend/src/components/maintenance/KanbanBoard.tsx
const KANBAN_COLUMNS = [
  { id: 'NEW', title: 'New Requests', color: 'blue' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'yellow' },
  { id: 'REPAIRED', title: 'Repaired', color: 'green' },
  { id: 'SCRAP', title: 'Scrapped', color: 'red' }
] as const;

type KanbanStage = typeof KANBAN_COLUMNS[number]['id'];
```

#### Drag-Drop Handler with Validation
```typescript
const handleDragEnd = async (result: DropResult) => {
  const { source, destination, draggableId } = result;
  
  if (!destination) return;
  
  const newStage = destination.droppableId as KanbanStage;
  const oldStage = source.droppableId as KanbanStage;
  
  if (newStage === oldStage) return;
  
  // Validate stage transition
  const isValidTransition = validateStageTransition(oldStage, newStage);
  if (!isValidTransition) {
    toast.error(`Cannot move from ${oldStage} to ${newStage}`);
    return;
  }
  
  try {
    // Update stage via API
    await requestsAPI.updateStage(draggableId, newStage);
    
    // Optimistically update UI
    setRequests(prev => 
      prev.map(req => 
        req.id === draggableId 
          ? { ...req, stage: newStage }
          : req
      )
    );
    
    toast.success(`Request moved to ${newStage}`);
  } catch (error) {
    toast.error('Failed to update request stage');
  }
};

// Stage transition validation
function validateStageTransition(from: KanbanStage, to: KanbanStage): boolean {
  const validTransitions: Record<KanbanStage, KanbanStage[]> = {
    'NEW': ['IN_PROGRESS', 'SCRAP'],
    'IN_PROGRESS': ['REPAIRED', 'SCRAP'],
    'REPAIRED': [], // Terminal state
    'SCRAP': [] // Terminal state
  };
  
  return validTransitions[from]?.includes(to) ?? false;
}
```

#### Backend Stage Update
```typescript
// backend/src/services/requestService.ts
static async updateRequestStage(id: string, stage: RequestStage): Promise<MaintenanceRequest> {
  // Database trigger will automatically:
  // - Set repaired_at when stage → REPAIRED
  // - Set scrapped_at when stage → SCRAP
  // - Update equipment.status to SCRAPPED when request → SCRAP
  
  const query = `
    UPDATE maintenance_request
    SET stage = $1
    WHERE id = $2
    RETURNING *
  `;
  
  const result = await pool.query(query, [stage, id]);
  
  if (result.rows.length === 0) {
    throw new Error('Request not found');
  }
  
  return result.rows[0];
}
```

---

### 3. Technician Assignment - Team Membership Validation

**Requirement:** Assigned technician MUST belong to the request's team (enforced by DB trigger).

**Implementation:**

#### Frontend - Dropdown Filter
```typescript
// frontend/src/components/maintenance/RequestForm.tsx
const RequestForm = ({ requestId }: { requestId?: string }) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [availableTechnicians, setAvailableTechnicians] = useState<AppUser[]>([]);
  
  // Fetch technicians when team changes
  useEffect(() => {
    if (selectedTeam) {
      teamsAPI.getTeamMembers(selectedTeam).then(members => {
        setAvailableTechnicians(members);
      });
    } else {
      setAvailableTechnicians([]);
    }
  }, [selectedTeam]);
  
  return (
    <form>
      <Select
        label="Maintenance Team"
        value={selectedTeam}
        onChange={setSelectedTeam}
        options={teams}
      />
      
      <Select
        label="Assign Technician"
        value={assignedTo}
        onChange={setAssignedTo}
        options={availableTechnicians}  // Only team members
        disabled={!selectedTeam}
        placeholder={selectedTeam ? "Select technician" : "Select team first"}
      />
    </form>
  );
};
```

#### Backend - Database Trigger Enforcement
```sql
-- This is already in your schema (gearguard_schema_patched.sql)
-- Lines 336-366

CREATE OR REPLACE FUNCTION enforce_assignee_in_team()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to_id IS NOT NULL AND NEW.team_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM maintenance_team_member m
      WHERE m.team_id = NEW.team_id
        AND m.user_id = NEW.assigned_to_id
    ) THEN
      RAISE EXCEPTION 'Assigned technician (%) is not a member of team (%)', 
        NEW.assigned_to_id, NEW.team_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_request_assignee_team_check
BEFORE INSERT OR UPDATE OF assigned_to_id, team_id ON maintenance_request
FOR EACH ROW
EXECUTE FUNCTION enforce_assignee_in_team();
```

#### Backend API - Error Handling
```typescript
// backend/src/services/requestService.ts
static async assignTechnician(requestId: string, technicianId: string): Promise<MaintenanceRequest> {
  try {
    const query = `
      UPDATE maintenance_request
      SET assigned_to_id = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [technicianId, requestId]);
    return result.rows[0];
  } catch (error: any) {
    // Database trigger will throw exception if technician not in team
    if (error.message.includes('is not a member of team')) {
      throw new Error('Technician must be a member of the assigned team');
    }
    throw error;
  }
}
```

---

## Summary Checklist

✅ **Calendar View**
- [ ] Backend API filters `type = 'PREVENTIVE'` server-side
- [ ] Frontend only displays preventive requests
- [ ] No corrective requests appear on calendar

✅ **Kanban Board**
- [ ] Exactly 4 columns: NEW, IN_PROGRESS, REPAIRED, SCRAP
- [ ] Stage transitions validated client-side
- [ ] Database triggers fire on stage changes
- [ ] Equipment auto-scraps when request → SCRAP

✅ **Technician Assignment**
- [ ] Frontend dropdown shows only team members
- [ ] Database trigger validates team membership
- [ ] API returns clear error if validation fails
- [ ] No bypass possible via direct API calls

---

## Testing Validation Rules

### Test Case 1: Calendar Filter
```bash
# Should return only PREVENTIVE requests
curl http://localhost:5000/api/requests/calendar

# Verify response contains only type: 'PREVENTIVE'
```

### Test Case 2: Invalid Stage Transition
```bash
# Try to move REPAIRED → IN_PROGRESS (should fail)
curl -X PATCH http://localhost:5000/api/requests/{id}/stage \
  -H "Content-Type: application/json" \
  -d '{"stage": "IN_PROGRESS"}'
```

### Test Case 3: Invalid Technician Assignment
```bash
# Try to assign technician not in team (should fail with DB error)
curl -X PATCH http://localhost:5000/api/requests/{id}/assign \
  -H "Content-Type: application/json" \
  -d '{"technicianId": "non-team-member-id"}'
```
