module.exports = {
  apps: [
    {
      name: 'wangai-studio-server',
      script: 'dist/main.js',
      instances: 'max', // 使用所有可用的CPU核心
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // 自动重启配置
      watch: false,
      ignore_watch: ['node_modules', 'logs'],

      // 内存和CPU限制
      max_memory_restart: '1G',

      // 重启策略
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',

      // 健康检查
      health_check_grace_period: 3000,

      // 其他配置
      merge_logs: true,
      time: true
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: ['159.75.171.63'], // 替换为实际服务器IP
      ref: 'origin/main',
      repo: 'your-git-repo-url', // 替换为实际Git仓库地址
      path: '/var/www/wangai-studio-server',
      'pre-deploy-local': '',
      'post-deploy': 'pnpm install && pnpm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};