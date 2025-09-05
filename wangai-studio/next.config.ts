import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     // 让 markdown-it 走 Node 原生模块，不打进浏览器 chunk
  //     config.externals.push('markdown-it');
  //   }
  //   return config;
  // },

  // 跳过 TypeScript 类型检查
  typescript: {
    ignoreBuildErrors: true,
  },
  // 跳过 ESLint 检查（可选）
  eslint: {
    ignoreDuringBuilds: true,
  },

};

export default nextConfig;
