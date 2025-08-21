#!/bin/bash

# Production build script for Vercel deployment
# This script handles database migrations without interactive input

echo "Starting production build..."

# Check if we're in a CI environment
if [ "$CI" = "true" ] || [ "$VERCEL" = "1" ]; then
    echo "Running in CI/CD environment, skipping interactive database operations"
    
    # For CI/CD, we should use migrations instead of db:push
    # If you need to run migrations, uncomment the next line:
    # echo "Running database migrations..."
    # yarn db:migrate
    
    echo "Building application..."
    yarn build
else
    echo "Running in development environment"
    yarn db:push && yarn build
fi

echo "Build completed successfully!"
