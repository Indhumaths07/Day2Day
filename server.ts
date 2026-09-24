import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // In-memory sync state
  let syncedState: any = null;

  // API endpoints
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'D2D Workflow Management System API',
      timestamp: new Date().toISOString(),
    });
  });

  // Get current sync state
  app.get('/api/workflow/state', (req, res) => {
    res.json({ state: syncedState });
  });

  // Update sync state
  app.post('/api/workflow/sync', (req, res) => {
    if (req.body && req.body.state) {
      syncedState = req.body.state;
      res.json({ success: true, timestamp: new Date().toISOString() });
    } else {
      res.status(400).json({ error: 'Missing state payload' });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`D2D server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
