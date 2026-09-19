import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export const signAccess = (claims) =>
  jwt.sign(claims, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL });

export const verifyAccess = (token) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET);

export const randomToken = () =>
  crypto.randomBytes(48).toString('hex');

export const hashToken = (val) =>
  crypto.createHash('sha256').update(val).digest('hex');
