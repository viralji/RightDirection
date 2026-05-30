/** PM2 — RightDirection only (does not manage Task_Management / ClickK). */
module.exports = {
  apps: [
    {
      name: 'rightdirection-api',
      cwd: '/var/www/rightdirection/api',
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'rightdirection-web',
      cwd: '/var/www/rightdirection/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001 -H 127.0.0.1',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
      },
    },
    {
      name: 'rightdirection-ai',
      cwd: '/var/www/rightdirection/ai-service',
      script: 'venv/bin/python',
      args: '-m uvicorn app.main:app --host 127.0.0.1 --port 8000',
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
