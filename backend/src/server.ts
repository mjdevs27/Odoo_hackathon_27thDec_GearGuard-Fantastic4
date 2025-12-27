import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';
import authRoutes from './routes/auth';
import equipmentRoutes from './routes/equipment';
import requestRoutes from './routes/requests';
import dashboardRoutes from './routes/dashboard';
import maintenanceRoutes from './routes/maintenance';
import categoriesRoutes from './routes/categories';
import teamsRoutes from './routes/teams';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/teams', teamsRoutes);

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT 1');
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Test endpoint
app.get('/api/test/company', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM company LIMIT 1');
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 GearGuard Backend Server`);
    console.log(`📍 Running on: http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/signup`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(50));
});

// Handle server errors
server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', error);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

export default app;
