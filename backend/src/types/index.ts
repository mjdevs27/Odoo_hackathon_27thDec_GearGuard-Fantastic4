// Backend TypeScript Types
export type MaintenanceType = 'CORRECTIVE' | 'PREVENTIVE';
export type RequestStage = 'NEW' | 'IN_PROGRESS' | 'REPAIRED' | 'SCRAP';
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type EquipmentStatus = 'ACTIVE' | 'SCRAPPED';

export interface Company {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export interface Department {
    id: string;
    company_id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export interface AppUser {
    id: string;
    company_id: string;
    full_name: string;
    email: string | null;
    avatar_url: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface EquipmentCategory {
    id: string;
    company_id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export interface MaintenanceTeam {
    id: string;
    company_id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export interface Equipment {
    id: string;
    company_id: string;
    name: string;
    serial_number: string;
    category_id: string | null;
    department_id: string | null;
    owner_user_id: string | null;
    maintenance_team_id: string | null;
    default_technician_id: string | null;
    location: string | null;
    purchase_date: Date | null;
    warranty_end_date: Date | null;
    status: EquipmentStatus;
    scrapped_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface MaintenanceRequest {
    id: string;
    company_id: string;
    subject: string;
    description: string | null;
    equipment_id: string;
    equipment_category_id: string | null;
    team_id: string | null;
    created_by_id: string | null;
    assigned_to_id: string | null;
    type: MaintenanceType;
    priority: RequestPriority;
    stage: RequestStage;
    request_date: Date;
    scheduled_at: Date | null;
    duration_minutes: number;
    due_at: Date | null;
    is_overdue: boolean;
    repaired_at: Date | null;
    scrapped_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface RequestComment {
    id: string;
    request_id: string;
    author_id: string | null;
    body: string;
    created_at: Date;
}
