# Use the official Node.js image.
FROM node:18

# Create and set the working directory.
WORKDIR /app

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Build the Next.js application.
RUN npm run build

# Start the Next.js application.
CMD ["npm", "start"]
