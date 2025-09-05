FROM node:20-alpine
RUN npm config set registry https://registry.npmmirror.com

WORKDIR /app

# 1. 装 pnpm
RUN npm i -g pnpm

# 2. 拷贝包管理文件 & 安装所有依赖（含 devDeps，因为 build 需要）
COPY package.json pnpm-lock.yaml* .npmrc ./
RUN pnpm install --frozen-lockfile=false

# 3. 拷贝源码
COPY . .

# 4. 构建生产版本
RUN pnpm build

# 5. 移除 devDeps，减小镜像体积
RUN pnpm prune --prod

# 6. 启动
EXPOSE 3001
CMD ["pnpm","start"]