import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

const router = Router();

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Signup endpoint
router.post('/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Validate input
        if (!fullName || !email || !password) {
            return res.status(400).json({
                error: 'All fields are required',
                field: !fullName ? 'fullName' : !email ? 'email' : 'password'
            });
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format',
                field: 'email'
            });
        }

        // Validate password strength
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters and contain uppercase, lowercase, and special character',
                field: 'password'
            });
        }

        // Check if email already exists
        const existingUser = await pool.query(
            'SELECT id FROM portal_user WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: 'Email already registered',
                field: 'email'
            });
        }

        // Get company ID (XYZ company)
        const companyResult = await pool.query(
            "SELECT id FROM company WHERE name = 'XYZ' LIMIT 1"
        );

        if (companyResult.rows.length === 0) {
            return res.status(500).json({ error: 'Company not found' });
        }

        const companyId = companyResult.rows[0].id;

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await pool.query(
            `INSERT INTO portal_user (company_id, full_name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, created_at`,
            [companyId, fullName, email.toLowerCase(), passwordHash]
        );

        const newUser = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: newUser.id,
                email: newUser.email,
                companyId: companyId
            },
            process.env.JWT_SECRET || 'gearguard-secret-key-2025',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                fullName: newUser.full_name,
                email: newUser.email,
                createdAt: newUser.created_at
            },
            token
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Find user
        const result = await pool.query(
            'SELECT id, company_id, full_name, email, password_hash, is_active FROM portal_user WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is inactive' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                companyId: user.company_id
            },
            process.env.JWT_SECRET || 'gearguard-secret-key-2025',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Validate token endpoint
router.get('/validate', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'gearguard-secret-key-2025'
        ) as any;

        const result = await pool.query(
            'SELECT id, full_name, email, is_active FROM portal_user WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0 || !result.rows[0].is_active) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({
            valid: true,
            user: {
                id: result.rows[0].id,
                fullName: result.rows[0].full_name,
                email: result.rows[0].email
            }
        });

    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;
