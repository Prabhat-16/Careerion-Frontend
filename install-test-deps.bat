@echo off
REM Install Frontend Testing Dependencies

echo Installing Vitest and Testing Libraries...

call npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8

echo.
echo [OK] Testing dependencies installed successfully!
echo.
echo Run tests with:
echo   npm test              - Run tests once
echo   npm run test:watch    - Run tests in watch mode
echo   npm run test:coverage - Run tests with coverage
echo.
pause
