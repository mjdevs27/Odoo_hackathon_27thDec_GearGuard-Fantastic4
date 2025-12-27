import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// Get all maintenance teams
router.get('/teams', async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                mt.id,
                mt.name,
                mt.created_at,
                c.name as company_name,
                (SELECT COUNT(*) FROM app.maintenance_team_member mtm WHERE mtm.team_id = mt.id) as member_count
            FROM app.maintenance_team mt
            LEFT JOIN app.company c ON mt.company_id = c.id
            ORDER BY mt.name
        `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Get team by ID with members
router.get('/teams/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const teamQuery = `
            SELECT mt.*, c.name as company_name
            FROM app.maintenance_team mt
            LEFT JOIN app.company c ON mt.company_id = c.id
            WHERE mt.id = $1
        `;

        const membersQuery = `
            SELECT au.id, au.full_name, au.email
            FROM app.maintenance_team_member mtm
            JOIN app.app_user au ON mtm.user_id = au.id
            WHERE mtm.team_id = $1
        `;

        const [teamResult, membersResult] = await Promise.all([
            pool.query(teamQuery, [id]),
            pool.query(membersQuery, [id])
        ]);

        if (teamResult.rows.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json({
            ...teamResult.rows[0],
            members: membersResult.rows
        });
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

// Get single maintenance request by ID
router.get('/requests/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                mr.id,
                mr.subject,
                mr.description,
                mr.stage::text as stage,
                mr.priority::text as priority,
                mr.type::text as maintenance_type,
                mr.is_overdue,
                mr.due_at,
                mr.request_date,
                mr.scheduled_at as scheduled_date,
                mr.duration_minutes,
                mr.created_at,
                e.id as equipment_id,
                e.name as equipment_name,
                e.serial_number as equipment_serial,
                ec.name as category,
                mt.id as team_id,
                mt.name as team_name,
                au_assigned.id as technician_id,
                au_assigned.full_name as technician_name,
                au_created.full_name as created_by,
                c.name as company_name
            FROM app.maintenance_request mr
            LEFT JOIN app.equipment e ON mr.equipment_id = e.id
            LEFT JOIN app.equipment_category ec ON mr.equipment_category_id = ec.id
            LEFT JOIN app.maintenance_team mt ON mr.team_id = mt.id
            LEFT JOIN app.app_user au_assigned ON mr.assigned_to_id = au_assigned.id
            LEFT JOIN app.app_user au_created ON mr.created_by_id = au_created.id
            LEFT JOIN app.company c ON mr.company_id = c.id
            WHERE mr.id = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching request:', error);
        res.status(500).json({ error: 'Failed to fetch request' });
    }
});

// Create new maintenance request
router.post('/requests', async (req: Request, res: Response) => {
    try {
        const {
            subject,
            description,
            equipment_id,
            team_id,
            technician_id,
            maintenance_type,
            priority,
            scheduled_date,
            duration_minutes,
            notes
        } = req.body;

        // Get company_id from first company (single company setup)
        const companyResult = await pool.query('SELECT id FROM app.company LIMIT 1');
        const company_id = companyResult.rows[0]?.id;

        const query = `
            INSERT INTO app.maintenance_request (
                company_id,
                subject,
                description,
                equipment_id,
                team_id,
                assigned_to_id,
                type,
                priority,
                scheduled_at,
                duration_minutes,
                stage
            ) VALUES ($1, $2, $3, $4, $5, $6, $7::app.maintenance_type, $8::app.request_priority, $9, $10, 'NEW')
            RETURNING id
        `;

        const result = await pool.query(query, [
            company_id,
            subject,
            description || null,
            equipment_id || null,
            team_id || null,
            technician_id || null,
            maintenance_type || 'CORRECTIVE',
            priority || 'MEDIUM',
            scheduled_date || null,
            duration_minutes || 0
        ]);

        res.status(201).json({
            message: 'Request created successfully',
            id: result.rows[0].id
        });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ error: 'Failed to create request' });
    }
});

// Update maintenance request
router.put('/requests/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            subject,
            description,
            equipment_id,
            team_id,
            technician_id,
            maintenance_type,
            priority,
            scheduled_date,
            duration_minutes,
            stage,
            notes,
            instructions
        } = req.body;

        const query = `
            UPDATE app.maintenance_request SET
                subject = COALESCE($1, subject),
                description = COALESCE($2, description),
                equipment_id = COALESCE($3, equipment_id),
                team_id = COALESCE($4, team_id),
                assigned_to_id = COALESCE($5, assigned_to_id),
                type = COALESCE($6::app.maintenance_type, type),
                priority = COALESCE($7::app.request_priority, priority),
                scheduled_at = COALESCE($8, scheduled_at),
                duration_minutes = COALESCE($9, duration_minutes),
                stage = COALESCE($10::app.request_stage, stage),
                updated_at = NOW()
            WHERE id = $11
            RETURNING id
        `;

        const result = await pool.query(query, [
            subject,
            description,
            equipment_id,
            team_id,
            technician_id,
            maintenance_type,
            priority,
            scheduled_date,
            duration_minutes,
            stage,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json({ message: 'Request updated successfully' });
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ error: 'Failed to update request' });
    }
});

// Get all equipment categories
router.get('/categories', async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT id, name
            FROM app.equipment_category
            ORDER BY name
        `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export default router;
