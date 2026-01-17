import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
// Middleware
// =============================================================================

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// JSON body parser
app.use(express.json());

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
  });
}

// =============================================================================
// Health Check
// =============================================================================

/**
 * GET /api/health
 * Health check endpoint for load balancers and monitoring
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// =============================================================================
// API Routes
// =============================================================================

// Import and mount route modules here
// import { userRoutes } from './routes/users.js';
// app.use('/api/users', userRoutes);

/**
 * GET /api
 * API root - returns API information
 */
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: '[PROJECT_NAME] API',
    version: '0.1.0',
    documentation: '/api/docs',
  });
});

// =============================================================================
// Error Handling
// =============================================================================

/**
 * 404 Handler - Catch unmatched routes
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
  });
});

/**
 * Global Error Handler
 */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
  });
});

// =============================================================================
// Server Startup
// =============================================================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
