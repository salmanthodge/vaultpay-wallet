import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * This service only VERIFIES tokens (it doesn't issue customer tokens):
 * - customer access tokens, with the shared JWT_ACCESS_SECRET
 * - S2S tokens, with the shared S2S_SECRET
 */
export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);
export const verifyServiceToken = (token) => jwt.verify(token, env.S2S_SECRET);
