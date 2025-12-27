import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Get all maintenance requests with details
router.get('/', async (req, res) => {
    try {
        const query = `
      SELECT 
        mr.id, mr.subject, mr.description, mr.type, mr.priority, mr.stage,
        mr.request_date, mr.scheduled_at, mr.due_at, mr.is_overdue,
        mr.duration_minutes, mr.repaired_at,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        mt.name as team_name,
        creator.full_name as created_by,
        assignee.full_name as assigned_to
      FROM maintenance_request mr
      JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN maintenance_team mt ON mr.team_id = mt.id
      LEFT JOIN app_user creator ON mr.created_by_id = creator.id
      LEFT JOIN app_user assignee ON mr.assigned_to_id = assignee.id
      ORDER BY mr.created_at DESC
    `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Failed to fetch maintenance requests' });
    }
});

// Get Kanban board data (grouped by stage)
router.get('/kanban', async (req, res) => {
    try {
        const query = `
      SELECT 
        mr.stage,
        json_agg(
          json_build_object(
            'id', mr.id,
            'subject', mr.subject,
            'priority', mr.priority,
            'is_overdue', mr.is_overdue,
            'equipment_name', e.name,
            'assigned_to', u.full_name,
            'due_at', mr.due_at
          ) ORDER BY mr.created_at DESC
        ) as requests
      FROM maintenance_request mr
      JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN app_user u ON mr.assigned_to_id = u.id
      GROUP BY mr.stage
    `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching kanban data:', error);
        res.status(500).json({ error: 'Failed to fetch kanban data' });
    }
});

// Get calendar data (PREVENTIVE requests only)
router.get('/calendar', async (req, res) => {
    try {
        const query = `
      SELECT 
        mr.id, mr.subject, mr.scheduled_at, mr.duration_minutes,
        mr.equipment_id, mr.assigned_to_id,
        e.name as equipment_name,
        u.full_name as assigned_to_name
      FROM maintenance_request mr
      JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN app_user u ON mr.assigned_to_id = u.id
      WHERE mr.type = 'PREVENTIVE'
        AND mr.scheduled_at IS NOT NULL
      ORDER BY mr.scheduled_at
    `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        res.status(500).json({ error: 'Failed to fetch calendar data' });
    }
});

export default router;
