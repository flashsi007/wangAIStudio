FROM node:20.17.0
RUN npm config set registry https://registry.npmmirror.com
WORKDIR /app

# 1. 复制 package.json 后直接安装
COPY package.json ./
# RUN npm install --production
RUN npm install --omit=dev --verbose --timing

# 2. 复制源码并构建
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm install && npm run build && npm prune --production

# 3. 复制环境变量
COPY .env.production ./.env

EXPOSE 3000
CMD ["node", "dist/main"]