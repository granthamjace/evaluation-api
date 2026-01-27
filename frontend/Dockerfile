FROM node:22 AS base

WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the app
COPY . .

EXPOSE 5173

# Default command (overridden by docker-compose for dev)
CMD ["npm", "run", "dev"]
