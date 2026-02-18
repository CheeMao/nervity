# 1. 选择基础镜像
# 使用 Node.js 18 的 Alpine 版本，体积极小 (约 50MB)
FROM node:18-alpine

# 2. 设置系统环境
# 安装时区数据包，并将时区设为上海 (北京时间)，防止日志时间差8小时
RUN apk add --no-cache tzdata
ENV TZ=Asia/Shanghai

# 3. 设置容器内的工作目录
WORKDIR /app

# 4. 复制依赖定义文件
# 技巧：先只复制 package.json，利用 Docker 缓存。
# 只要这两个文件没变，下面的 npm install 就不会重新执行，构建速度飞快。
COPY package*.json ./

# 5. 安装生产依赖
# --omit=dev: 只安装 dependencies，不安装 devDependencies (如 eslint, test等)，减小体积
RUN npm install --omit=dev

# 6. 复制程序代码
# 将本地上传的 dist 文件夹，复制到容器里的 /app/dist
# 注意：前提是你本地已经执行了 npm run build
COPY dist ./dist

# 7. 声明服务端口
# 告诉使用者这个容器会占用 3000 端口
EXPOSE 3000

# 8. 启动命令
# 容器启动时执行的指令：用 node 运行编译后的主文件
CMD ["node", "dist/main"]
