FROM node:22-alpine

WORKDIR /app

# Copy only package files first
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
