FROM node:14-alpine

WORKDIR /app

COPY . .

# Tạo thư mục cache
RUN mkdir /cache
WORKDIR /cache

# cài đặt vào the node_modules's cache directory.
COPY package.json ./

RUN npm config set https-proxy http://10.61.11.42:3128

RUN npm config set http-proxy http://10.61.11.42:3128

RUN npm config set proxy http://10.61.11.42:3128

RUN npm install

RUN yarn install

# Chuyển về làm việc tại thư mục /app 
WORKDIR /app

# Development
CMD ["npm", "yarn", "start", "run", "dev"]

# Production
# RUN npm install -g pm2
# CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]