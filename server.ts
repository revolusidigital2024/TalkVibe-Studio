import express from 'express';
import path from 'path';
import apiApp from './api/index.js';

const app = express();

app.use(apiApp);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const viteName = 'vite';
    const { createServer: createViteServer } = await import(viteName);
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

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
