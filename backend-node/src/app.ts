import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import lmsRoutes from './routes/lms.routes';
import portalRoutes from './routes/portal.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app: Application = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', courseRoutes);
app.use('/api/v1', enrollmentRoutes);
app.use('/api/v1', lmsRoutes);
app.use('/api/v1', portalRoutes);

app.use(errorMiddleware);

export default app;
