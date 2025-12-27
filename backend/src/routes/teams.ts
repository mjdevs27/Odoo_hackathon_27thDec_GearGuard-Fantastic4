import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// GET all teams with members
router.get('/', async (req, res) => {
    try {
        const teamsQuery = `
            SELECT 
                mt.id,
                mt.name,
                c.name as company
            FROM maintenance_team mt
            JOIN company c ON c.id = mt.company_id
            ORDER BY mt.name ASC
        `;
        const teamsResult = await pool.query(teamsQuery);

        // Get members for each team
        const teams = await Promise.all(teamsResult.rows.map(async (team: any) => {
            const membersQuery = `
                SELECT 
                    au.id,
                    au.full_name as name
                FROM team_member tm
                JOIN app_user au ON au.id = tm.user_id
                WHERE tm.team_id = $1
            `;
            const membersResult = await pool.query(membersQuery, [team.id]);
            return {
                id: team.id,
                name: team.name,
                members: membersResult.rows,
                company: team.company
            };
        }));

        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// GET single team by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const teamQuery = `
            SELECT 
                mt.id,
                mt.name,
                c.name as company
            FROM maintenance_team mt
            JOIN company c ON c.id = mt.company_id
            WHERE mt.id = $1
        `;
        const teamResult = await pool.query(teamQuery, [id]);

        if (teamResult.rows.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const membersQuery = `
            SELECT 
                au.id,
                au.full_name as name
            FROM team_member tm
            JOIN app_user au ON au.id = tm.user_id
            WHERE tm.team_id = $1
        `;
        const membersResult = await pool.query(membersQuery, [id]);

        res.json({
            id: teamResult.rows[0].id,
            name: teamResult.rows[0].name,
            members: membersResult.rows,
            company: teamResult.rows[0].company
        });
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

// POST create new team
router.post('/', async (req, res) => {
    try {
        const { name, member_ids, company } = req.body;

        // Get company ID
        const companyResult = await pool.query(
            'SELECT id FROM company WHERE name = $1 LIMIT 1',
            [company || 'XYZ']
        );

        if (companyResult.rows.length === 0) {
            return res.status(400).json({ error: 'Company not found' });
        }

        const companyId = companyResult.rows[0].id;

        // Create team
        const teamResult = await pool.query(
            'INSERT INTO maintenance_team (company_id, name) VALUES ($1, $2) RETURNING id, name',
            [companyId, name]
        );

        const teamId = teamResult.rows[0].id;

        // Add members
        if (member_ids && member_ids.length > 0) {
            for (const userId of member_ids) {
                await pool.query(
                    'INSERT INTO team_member (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [teamId, userId]
                );
            }
        }

        // Fetch the complete team with members
        const membersQuery = `
            SELECT 
                au.id,
                au.full_name as name
            FROM team_member tm
            JOIN app_user au ON au.id = tm.user_id
            WHERE tm.team_id = $1
        `;
        const membersResult = await pool.query(membersQuery, [teamId]);

        res.status(201).json({
            id: teamId,
            name: teamResult.rows[0].name,
            members: membersResult.rows,
            company: company || 'XYZ'
        });
    } catch (error: any) {
        console.error('Error creating team:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Team with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create team' });
    }
});

// PUT update team
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, member_ids } = req.body;

        // Update team name
        const teamResult = await pool.query(
            'UPDATE maintenance_team SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name',
            [name, id]
        );

        if (teamResult.rows.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Update members - remove all and re-add
        await pool.query('DELETE FROM team_member WHERE team_id = $1', [id]);

        if (member_ids && member_ids.length > 0) {
            for (const userId of member_ids) {
                await pool.query(
                    'INSERT INTO team_member (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [id, userId]
                );
            }
        }

        // Fetch company name
        const companyQuery = `
            SELECT c.name as company
            FROM maintenance_team mt
            JOIN company c ON c.id = mt.company_id
            WHERE mt.id = $1
        `;
        const companyResult = await pool.query(companyQuery, [id]);

        // Fetch the complete team with members
        const membersQuery = `
            SELECT 
                au.id,
                au.full_name as name
            FROM team_member tm
            JOIN app_user au ON au.id = tm.user_id
            WHERE tm.team_id = $1
        `;
        const membersResult = await pool.query(membersQuery, [id]);

        res.json({
            id: id,
            name: teamResult.rows[0].name,
            members: membersResult.rows,
            company: companyResult.rows[0]?.company || 'XYZ'
        });
    } catch (error: any) {
        console.error('Error updating team:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Team with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to update team' });
    }
});

// DELETE team
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete members first
        await pool.query('DELETE FROM team_member WHERE team_id = $1', [id]);

        // Delete team
        const result = await pool.query(
            'DELETE FROM maintenance_team WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ error: 'Failed to delete team' });
    }
});

export default router;
