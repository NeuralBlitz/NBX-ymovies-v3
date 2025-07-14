# Development Tooling Guide

This document outlines tools available to help maintain code quality and prevent common issues in the Netflix Clone project.

## React Import Checking

### Why This Matters

When using JSX/TSX in React components, you need to have React imported, even if you're not explicitly using the React symbol in your code. Missing React imports can cause the "React is not defined" error.

### How to Run the Check

You can manually check for React import issues with:

```bash
npm run lint:ui
# or
npm run check:react-imports
```

This will scan the codebase and report:
- Files using JSX without importing React
- Files with mixed React import styles
- Files with split imports (imports not all at the top of the file)

### Automated Checking with Git Hooks

We've provided pre-commit hooks to automatically check for these issues before each commit:

#### Installation

For Unix/Linux/macOS/WSL:
```bash
npm run install:hooks
```

For Windows:
```bash
npm run install:hooks:win
```

This will install a pre-commit hook that prevents committing files with React import issues.

## Best Practices for React Imports

1. **Always import React in JSX/TSX files**:
   ```tsx
   import React from "react";
   ```
   or
   ```tsx
   import * as React from "react";
   ```

2. **Standardize on one import style** throughout the project:
   - For UI components from libraries: `import * as React from "react"`
   - For custom components: `import React from "react"`

3. **Place all imports at the top of the file**:
   - Never split imports between other code elements
   - Put imports before type declarations, interfaces, and other code

## DOM Nesting Guidelines

1. **Avoid nesting interactive elements**:
   - Don't put an `<a>` tag inside another `<a>` or button
   - Don't put interactive elements inside other interactive elements

2. **For link-like buttons**:
   ```tsx
   <Button 
     onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
   >
     Link text
   </Button>
   ```

## Testing for Issues

Before submitting code, run these checks:

1. Check for console errors in the browser
2. Verify that all pages render correctly
3. Run the React import checker:
   ```bash
   npm run lint:ui
   ```
4. Fix any issues reported by the tools

Following these guidelines will help keep the codebase clean and free of common React errors!
