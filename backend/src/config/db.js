import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

if (env.nodeEnv === 'development') {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}

export async function connectDB() {
  await mongoose.connect(env.mongodbUri);
  console.log(`MongoDB conectado: ${mongoose.connection.name}`);
}
