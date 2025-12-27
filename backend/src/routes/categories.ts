import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// GET all equipment categories
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                ec.id,
                ec.name,
                COALESCE(u.full_name, '') as responsible,
                ec.responsible_id,
                c.name as company
            FROM equipment_category ec
            JOIN company c ON c.id = ec.company_id
            LEFT JOIN app_user u ON u.id = ec.responsible_id
            ORDER BY ec.name ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching equipment categories:', error);
        res.status(500).json({ error: 'Failed to fetch equipment categories' });
    }
});

// GET all users for responsible dropdown
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, full_name as name
            FROM app_user
            WHERE is_active = true
            ORDER BY full_name ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET single equipment category by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                ec.id,
                ec.name,
                COALESCE(u.full_name, '') as responsible,
                ec.responsible_id,
                c.name as company,
                ec.company_id
            FROM equipment_category ec
            JOIN company c ON c.id = ec.company_id
            LEFT JOIN app_user u ON u.id = ec.responsible_id
            WHERE ec.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching equipment category:', error);
        res.status(500).json({ error: 'Failed to fetch equipment category' });
    }
});

// POST create new equipment category
router.post('/', async (req, res) => {
    try {
        const { name, company, responsible_id } = req.body;

        // Get company ID (or use default)
        const companyResult = await pool.query(
            'SELECT id FROM company WHERE name = $1 LIMIT 1',
            [company || 'XYZ']
        );

        if (companyResult.rows.length === 0) {
            return res.status(400).json({ error: 'Company not found' });
        }

        const companyId = companyResult.rows[0].id;

        const result = await pool.query(
            `INSERT INTO equipment_category (company_id, name, responsible_id) 
             VALUES ($1, $2, $3) 
             RETURNING id, name`,
            [companyId, name, responsible_id || null]
        );

        // Fetch the full record with joins
        const fullResult = await pool.query(`
            SELECT 
                ec.id,
                ec.name,
                COALESCE(u.full_name, '') as responsible,
                ec.responsible_id,
                c.name as company
            FROM equipment_category ec
            JOIN company c ON c.id = ec.company_id
            LEFT JOIN app_user u ON u.id = ec.responsible_id
            WHERE ec.id = $1
        `, [result.rows[0].id]);

        res.status(201).json(fullResult.rows[0]);
    } catch (error: any) {
        console.error('Error creating equipment category:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Category with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create equipment category' });
    }
});

// PUT update equipment category
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, responsible_id } = req.body;

        const result = await pool.query(
            `UPDATE equipment_category 
             SET name = $1, responsible_id = $2, updated_at = NOW() 
             WHERE id = $3 
             RETURNING id, name`,
            [name, responsible_id || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Fetch the full record with joins
        const fullResult = await pool.query(`
            SELECT 
                ec.id,
                ec.name,
                COALESCE(u.full_name, '') as responsible,
                ec.responsible_id,
                c.name as company
            FROM equipment_category ec
            JOIN company c ON c.id = ec.company_id
            LEFT JOIN app_user u ON u.id = ec.responsible_id
            WHERE ec.id = $1
        `, [id]);

        res.json(fullResult.rows[0]);
    } catch (error: any) {
        console.error('Error updating equipment category:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Category with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to update equipment category' });
    }
});

// DELETE equipment category
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM equipment_category WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting equipment category:', error);
        res.status(500).json({ error: 'Failed to delete equipment category' });
    }
});

export default router;
