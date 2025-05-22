#!/bin/bash

# Install pre-commit hook for React import checking

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy the pre-commit hook
cp scripts/pre-commit-react-imports.sh .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook installed successfully."
echo "React import checking will run automatically before each commit."
