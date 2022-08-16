## build runner
FROM node:lts-alpine as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json .

RUN export NODE_ENV=production

# Install dependencies
RUN npm install

# Move source files
COPY . .

# Build project
RUN npm run build

## producation runner
FROM node:lts-alpine as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json

# Install dependencies
RUN npm install --only=production

RUN export NODE_ENV=production

# Move build files
COPY --from=build-runner /tmp/app/dist /app/dist

# Start bot
CMD [ "npm", "run", "serve" ]
