module.exports = {
    apps: [
        {
            name: 'wangai-studio',
            cwd: '/home/www.wangai.studio', // 替换为您的项目路径
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
            },
            instances: 'max', // 使用所有CPU核心
            exec_mode: 'cluster', // 集群模式
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            // 日志配置
            log_file: 'logs/combined.log',
            out_file: 'logs/out.log',
            error_file: 'logs/error.log',
            time: true,
        },
    ],
}