# Use the official Node.js LTS image
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source code
COPY . .

# Install SSH client
RUN apt-get update && apt-get install -y openssh-client

# Expose the application port
EXPOSE 3000

# Start the application
CMD [ "node", "app.js" ]
