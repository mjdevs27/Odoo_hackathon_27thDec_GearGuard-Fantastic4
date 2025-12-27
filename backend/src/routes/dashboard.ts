import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// Get dashboard statistics
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM app.equipment WHERE status = 'ACTIVE') as total_equipment,
                (SELECT COUNT(*) FROM app.equipment WHERE status = 'ACTIVE') as active_equipment,
                (SELECT COUNT(*) FROM app.maintenance_request WHERE stage IN ('NEW', 'IN_PROGRESS')) as open_requests,
                (SELECT COUNT(*) FROM app.maintenance_request WHERE is_overdue = true AND stage IN ('NEW', 'IN_PROGRESS')) as overdue_count,
                (SELECT COUNT(*) FROM app.maintenance_request WHERE stage = 'NEW') as new_count,
                (SELECT COUNT(*) FROM app.maintenance_request WHERE stage = 'IN_PROGRESS') as in_progress_count,
                (SELECT COUNT(*) FROM app.maintenance_request WHERE stage = 'REPAIRED') as repaired_count,
                (SELECT COUNT(*) FROM app.maintenance_request WHERE stage = 'SCRAP') as scrap_count,
                (SELECT COUNT(*) FROM app.maintenance_team) as total_teams,
                (SELECT COUNT(*) FROM app.app_user WHERE is_active = true) as total_technicians
        `;

        const result = await pool.query(statsQuery);

        // Calculate technician load (mock for now - can be enhanced)
        const technicianLoad = 85; // Will be calculated based on actual assignments

        res.json({
            criticalEquipment: parseInt(result.rows[0].open_requests) || 0,
            technicianLoad: technicianLoad,
            openRequests: parseInt(result.rows[0].open_requests) || 0,
            overdueCount: parseInt(result.rows[0].overdue_count) || 0,
            stageCounts: {
                new: parseInt(result.rows[0].new_count) || 0,
                in_progress: parseInt(result.rows[0].in_progress_count) || 0,
                repaired: parseInt(result.rows[0].repaired_count) || 0,
                scrap: parseInt(result.rows[0].scrap_count) || 0
            },
            totalEquipment: parseInt(result.rows[0].total_equipment) || 0,
            totalTeams: parseInt(result.rows[0].total_teams) || 0,
            totalTechnicians: parseInt(result.rows[0].total_technicians) || 0
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// Get all maintenance requests for Kanban
router.get('/requests', async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                mr.id,
                mr.subject,
                mr.description,
                mr.stage,
                mr.priority,
                mr.is_overdue,
                mr.due_at,
                mr.created_at,
                e.name as equipment_name,
                e.serial_number as equipment_code,
                ec.name as category,
                au.full_name as technician_name,
                UPPER(LEFT(au.full_name, 1)) as technician_avatar,
                c.name as company_name
            FROM app.maintenance_request mr
            LEFT JOIN app.equipment e ON mr.equipment_id = e.id
            LEFT JOIN app.equipment_category ec ON mr.equipment_category_id = ec.id
            LEFT JOIN app.app_user au ON mr.assigned_to_id = au.id
            LEFT JOIN app.company c ON mr.company_id = c.id
            ORDER BY 
                CASE mr.priority 
                    WHEN 'URGENT' THEN 1 
                    WHEN 'HIGH' THEN 2 
                    WHEN 'MEDIUM' THEN 3 
                    WHEN 'LOW' THEN 4 
                END,
                mr.created_at DESC
        `;

        const result = await pool.query(query);

        const requests = result.rows.map((row: any) => ({
            id: row.id,
            subject: row.subject,
            description: row.description,
            equipment: row.equipment_name || 'Unknown Equipment',
            equipmentCode: row.equipment_code,
            technician: row.technician_name || 'Unassigned',
            technicianAvatar: row.technician_avatar || 'U',
            category: row.category || 'General',
            stage: row.stage.toLowerCase(),
            priority: row.priority.toLowerCase(),
            company: row.company_name || 'Unknown',
            isOverdue: row.is_overdue || false,
            dueAt: row.due_at,
            createdAt: row.created_at
        }));

        res.json(requests);
    } catch (error) {
        console.error('Error fetching maintenance requests:', error);
        res.status(500).json({ error: 'Failed to fetch maintenance requests' });
    }
});

// Update maintenance request stage (for Kanban drag & drop)
router.patch('/requests/:id/stage', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { stage } = req.body;

        // Validate stage
        const validStages = ['NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP'];
        const upperStage = stage.toUpperCase();

        if (!validStages.includes(upperStage)) {
            return res.status(400).json({ error: 'Invalid stage' });
        }

        const query = `
            UPDATE app.maintenance_request 
            SET stage = $1::app.request_stage, updated_at = NOW()
            WHERE id = $2
            RETURNING id, stage
        `;

        const result = await pool.query(query, [upperStage, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json({
            message: 'Stage updated successfully',
            request: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating request stage:', error);
        res.status(500).json({ error: 'Failed to update request stage' });
    }
});

// Get technicians list
router.get('/technicians', async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                au.id,
                au.full_name,
                au.email,
                UPPER(LEFT(au.full_name, 1)) as avatar,
                au.is_active,
                (SELECT COUNT(*) FROM app.maintenance_request mr 
                 WHERE mr.assigned_to_id = au.id 
                 AND mr.stage IN ('NEW', 'IN_PROGRESS')) as active_requests
            FROM app.app_user au
            WHERE au.is_active = true
            ORDER BY au.full_name
        `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching technicians:', error);
        res.status(500).json({ error: 'Failed to fetch technicians' });
    }
});

// Get equipment list
router.get('/equipment', async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                e.id,
                e.name,
                e.serial_number,
                e.status,
                e.location,
                ec.name as category,
                d.name as department,
                mt.name as team_name
            FROM app.equipment e
            LEFT JOIN app.equipment_category ec ON e.category_id = ec.id
            LEFT JOIN app.department d ON e.department_id = d.id
            LEFT JOIN app.maintenance_team mt ON e.maintenance_team_id = mt.id
            ORDER BY e.name
        `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ error: 'Failed to fetch equipment' });
    }
});

// Get calendar events (maintenance requests with scheduled dates)
router.get('/calendar', async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                mr.id,
                mr.subject,
                mr.description,
                mr.stage,
                mr.priority,
                mr.scheduled_at,
                mr.duration_minutes,
                e.name as equipment_name,
                au.full_name as technician_name
            FROM app.maintenance_request mr
            LEFT JOIN app.equipment e ON mr.equipment_id = e.id
            LEFT JOIN app.app_user au ON mr.assigned_to_id = au.id
            WHERE mr.scheduled_at IS NOT NULL
            ORDER BY mr.scheduled_at ASC
        `;

        const result = await pool.query(query);

        const events = result.rows.map((row: any) => ({
            id: row.id,
            title: row.subject,
            start: row.scheduled_at,
            end: new Date(new Date(row.scheduled_at).getTime() + (row.duration_minutes || 60) * 60000).toISOString(),
            priority: row.priority,
            stage: row.stage,
            equipment: row.equipment_name || '',
            technician: row.technician_name || ''
        }));

        res.json(events);
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
});

export default router;
