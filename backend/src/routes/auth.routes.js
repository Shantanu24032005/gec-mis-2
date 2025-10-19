// src/routes/auth.routes.js
import express from 'express';
import { register, login, logout } from '../controller/auth.controller.js';
import upload from '../middleware/upload.js'; // <-- Import multer config

const router = express.Router();

// Add the middleware here. 'image' is the field name from the frontend.
router.post('/register', upload.single('image'), register); // <-- MODIFIED
router.post('/login', login);
router.post('/logout', logout);

export default router;