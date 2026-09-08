import mongoose from 'mongoose'; import {env} from '../config/env.js';
let cached = null;
export function db(){ if(mongoose.connection.readyState===1) return Promise.resolve(mongoose); if(!cached) cached=mongoose.connect(env.MONGODB_URI,{dbName:env.MONGODB_DB_NAME,serverSelectionTimeoutMS:10000}); return cached; }
