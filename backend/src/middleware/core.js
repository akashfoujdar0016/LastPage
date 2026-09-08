import cors from 'cors'; import helmet from 'helmet'; import {origins} from '../config/env.js'; import {verifyAccess} from '../utils/auth.js';

export const security=[helmet(),cors({origin:(origin,cb)=>{if(!origin||origins.includes(origin)) return cb(null,true); cb(new Error('CORS blocked'));},credentials:true}), (req,res,next)=>{if(req.path!=='/api/health') res.setHeader('Cache-Control','no-store'); next();}];
export function auth(required=true){return (req,res,next)=>{const h=req.headers.authorization; if(!h){if(required)return res.status(401).json({error:'Authentication required'}); return next();} try{req.user=verifyAccess(h.replace(/^Bearer\s+/i,'')); next();}catch{res.status(401).json({error:'Invalid or expired token'});}}}
export const requireRole=(...roles)=>(req,res,next)=>{if(!req.user||!roles.includes(req.user.role))return res.status(403).json({error:'Forbidden'});next()};
