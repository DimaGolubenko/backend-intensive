//Core
import express from 'express';

//Instruments
import { login, logout } from './route';

export const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);

export { router as auth };
