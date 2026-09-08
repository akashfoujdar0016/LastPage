import jwt from 'jsonwebtoken'; import crypto from 'node:crypto'; import {env} from '../config/env.js';

export const signAccess=(c)=>jwt.sign(c,env.JWT_ACCESS_SECRET,{expiresIn:env.ACCESS_TOKEN_TTL});
export const verifyAccess=(t)=>jwt.verify(t,env.JWT_ACCESS_SECRET);
export const randomToken=()=>crypto.randomBytes(48).toString('hex');
export const hashToken=(v)=>crypto.createHash('sha256').update(v).digest('hex');
