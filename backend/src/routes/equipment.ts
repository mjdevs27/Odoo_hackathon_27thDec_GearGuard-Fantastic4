import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// Get all equipment with details
router.get('/', async (req, res) => {
    try {
        const query = `
      SELECT 
        e.id, e.name, e.serial_number, e.location, e.status,
        e.purchase_date, e.warranty_end_date,
        ec.name as category,
        d.name as department,
        mt.name as maintenance_team,
        u.full_name as default_technician
      FROM equipment e
      LEFT JOIN equipment_category ec ON e.category_id = ec.id
      LEFT JOIN department d ON e.department_id = d.id
      LEFT JOIN maintenance_team mt ON e.maintenance_team_id = mt.id
      LEFT JOIN app_user u ON e.default_technician_id = u.id
      WHERE e.status = 'ACTIVE'
      ORDER BY e.created_at DESC
    `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ error: 'Failed to fetch equipment' });
    }
});

// Get equipment by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
      SELECT 
        e.*,
        ec.name as category_name,
        d.name as department_name,
        mt.name as maintenance_team_name,
        u.full_name as default_technician_name
      FROM equipment e
      LEFT JOIN equipment_category ec ON e.category_id = ec.id
      LEFT JOIN department d ON e.department_id = d.id
      LEFT JOIN maintenance_team mt ON e.maintenance_team_id = mt.id
      LEFT JOIN app_user u ON e.default_technician_id = u.id
      WHERE e.id = $1
    `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Equipment not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ error: 'Failed to fetch equipment' });
    }
});

export default router;
