import path from 'path';
import fs from 'fs';
import express from 'express';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function configureProduction(app) {
  const frontendDist = path.resolve(
    __dirname,
    process.env.FRONTEND_DIST || '../../frontend/dist',
  );
  const hasFrontend = fs.existsSync(path.join(frontendDist, 'index.html'));

  if (!hasFrontend) return;

  app.use(
    express.static(frontendDist, {
      maxAge: '1y',
      immutable: true,
      index: false,
      setHeaders(res, filePath) {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    }),
  );

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}
