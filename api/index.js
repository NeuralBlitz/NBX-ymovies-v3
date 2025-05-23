// Vercel serverless function entry point
import { createServer } from '../dist/index.js';

let app;

export default async function handler(req, res) {
  try {
    // Cache the app instance to avoid reinitializing on every request
    if (!app) {
      app = await createServer();
    }
    
    // Handle the request
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
