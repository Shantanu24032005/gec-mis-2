import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import detailsRoutes from './routes/details.routes.js';
import adminAuthRoutes from './routes/adminauth.routes.js'

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/details', detailsRoutes);
app.use('/api/adminauth',adminAuthRoutes)


app.get("/", (req, res) => {
    res.send("GEC MIS API is running...");
});

export default app;