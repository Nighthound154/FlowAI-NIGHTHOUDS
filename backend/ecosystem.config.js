module.exports = {
  apps: [
    {
      name: 'flowai-backend',
      script: 'src/index.js',
      cwd: '/var/www/flowai/backend',
      instances: 'max',         // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      // Auto-restart on crash
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      // Logging
      error_file: '/var/log/flowai/error.log',
      out_file: '/var/log/flowai/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
