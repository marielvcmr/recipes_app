import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { app } from './app.js';

try {
  await connectDB();
} catch (err) {
  console.error('No se pudo conectar a MongoDB:', err.message);
  process.exit(1);
}

app.listen(env.port, (error) => {
  if (error) throw error;
  console.log(`API escuchando en http://localhost:${env.port}/api/v1 (${env.nodeEnv})`);
});
