
import express from 'express';
import { login, logout } from './authController.js';
import { verificaToken } from './authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', verificaToken, logout);

export default router;
