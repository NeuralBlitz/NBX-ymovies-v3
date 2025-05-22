@echo off
REM Install pre-commit hook for React import checking

REM Create hooks directory if it doesn't exist
if not exist .git\hooks mkdir .git\hooks

REM Copy the pre-commit hook
copy /Y scripts\pre-commit-react-imports.sh .git\hooks\pre-commit

echo ✅ Pre-commit hook installed successfully.
echo React import checking will run automatically before each commit.

REM For Windows users who use git with bash (e.g., Git for Windows)
echo Note: For Windows users, you may need to manually ensure the hook is executable
echo       if using Git for Windows or WSL.
