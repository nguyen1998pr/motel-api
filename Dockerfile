FROM node:14-alpine

WORKDIR /app

COPY . .

RUN npm config set https-proxy http://10.61.11.42:3128

RUN npm config set http-proxy http://10.61.11.42:3128

RUN npm config set proxy http://10.61.11.42:3128

RUN npm install

# Development
CMD ["npm", "start", "run", "dev"]

# Production
# RUN npm install -g pm2
# CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]