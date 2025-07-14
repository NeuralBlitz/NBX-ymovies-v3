# React Import Fixes

This document summarizes the React import issues that were fixed in the Netflix Clone application and provides guidelines to prevent similar issues in the future.

## Issues Fixed

### 1. Missing React Imports

Several components were missing the necessary React imports, which caused "React is not defined" errors:

- `skeleton.tsx`: Added `import React from "react";`
- `aspect-ratio.tsx`: Added `import * as React from "react";`
- `TVShowCard.tsx`: Added `import React from "react";`
- `TVShowList.tsx`: Added `import React, { useState } from "react";` (combined with existing imports)
- `resizable.tsx`: Added `import * as React from "react";`
- `usePersonalizedRecommendations.tsx`: Added `import React from "react";`
- `ApiTest.tsx`: Added `import React, { useState, useEffect } from 'react';` (combined with existing imports)

### 2. Import Order Issues

In page components, incorrect import ordering caused the pages to render as blank/black screens after initial rendering:

- **MovieDetail.tsx**: Fixed by reorganizing imports to be at the top of the file, before interface declarations
- **TVShowDetail.tsx**: Fixed by ensuring all imports are at the top of the file

### 3. DOM Nesting Validation Errors

Fixed DOM nesting validation errors (nested anchor tags) in various components:

- Replaced nested anchor tags with button + window.open() combinations
- Fixed trailer buttons in TVShowDetail.tsx
- Fixed review links in MovieDetail.tsx and TVShowDetail.tsx
- Fixed YouTube video links in TVShowDetail.tsx

## Best Practices

To prevent these issues in the future, follow these guidelines:

### React Imports

1. **Always import React in JSX/TSX files**:
   ```tsx
   import React from "react";
   ```
   or
   ```tsx
   import * as React from "react";
   ```

2. **Consistency**: Choose one import style and stick to it throughout the project:
   - For UI components from libraries: `import * as React from "react"`
   - For custom components: `import React from "react"`

### Import Ordering

1. **Place all imports at the top of the file**:
   - Never split imports between other code elements
   - Put imports before type declarations, interfaces, and other code

2. **Group imports logically**:
   - React and React-related packages first
   - Third-party libraries next
   - Application-specific imports last
   - UI components at the end

### DOM Nesting

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

## Testing

Before committing code:

1. Check for console errors in the browser
2. Verify that all pages render correctly
3. Use linters like ESLint to catch React import issues
4. Consider adding pre-commit hooks to catch these issues automatically
