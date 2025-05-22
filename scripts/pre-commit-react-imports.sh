#!/bin/bash

# Pre-commit hook to check for React imports in TypeScript React files
# Place this file in .git/hooks/pre-commit and make it executable (chmod +x .git/hooks/pre-commit)

# Get a list of staged .tsx files
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.tsx$')

if [ -z "$FILES" ]; then
  # No .tsx files in this commit
  exit 0
fi

# Colorful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking React imports in staged .tsx files...${NC}"

# Error flag
HAS_ERRORS=0

for FILE in $FILES; do
  if [ ! -f "$FILE" ]; then
    continue
  fi
  
  # Check if file uses JSX but doesn't import React
  if grep -q '<[A-Z][A-Za-z0-9]*\|<[a-z]\+[\s>]' "$FILE" && ! grep -q 'import.*React' "$FILE"; then
    echo -e "${RED}ERROR:${NC} Missing React import in ${YELLOW}$FILE${NC}"
    echo "Add one of the following to the top of the file:"
    echo "  import React from 'react';"
    echo "  import * as React from 'react';"
    HAS_ERRORS=1
  fi
  
  # Check for split imports (imports after non-import code)
  if grep -q 'import' "$FILE"; then
    # Create a temporary file with line numbers
    nl "$FILE" > /tmp/file_with_line_numbers.txt
    
    # Find the first non-import, non-comment, non-empty line
    FIRST_NON_IMPORT=$(grep -n -v '^[[:space:]]*$\|^[[:space:]]*\/\/\|^[[:space:]]*\/\*\|^[[:space:]]*\*\|^[[:space:]]*\*\/\|^[[:space:]]*import' /tmp/file_with_line_numbers.txt | head -1 | cut -d: -f1)
    
    if [ -n "$FIRST_NON_IMPORT" ]; then
      # Check if there are any import statements after this line
      IMPORTS_AFTER=$(tail -n +$FIRST_NON_IMPORT "$FILE" | grep -c '^[[:space:]]*import')
      
      if [ "$IMPORTS_AFTER" -gt 0 ]; then
        echo -e "${RED}ERROR:${NC} Split imports detected in ${YELLOW}$FILE${NC}"
        echo "Move all import statements to the top of the file, before any other code."
        HAS_ERRORS=1
      fi
    fi
  fi
done

if [ $HAS_ERRORS -eq 1 ]; then
  echo -e "${RED}React import check failed.${NC} Please fix the issues above and try again."
  exit 1
else
  echo -e "${GREEN}React import check passed.${NC}"
  exit 0
fi
