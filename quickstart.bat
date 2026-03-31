@echo off
REM FlowAI - Quick Start Script for Windows
REM This script sets up and runs the entire application

echo.
echo FlowAI - Starting Application...
echo ==================================
echo.

REM Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js is not installed. Please install Node.js 20+ first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js detected: %NODE_VERSION%

REM Backend setup
echo.
echo [*] Setting up backend...
cd backend

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

echo [*] Running database migrations...
call npm run migrate

if errorlevel 1 (
    echo [X] Database migration failed. Check your PostgreSQL connection.
    echo.
    echo Make sure:
    echo 1. PostgreSQL is running
    echo 2. Database 'flowai' exists
    echo 3. User 'flowai_user' exists with password 'flowai123'
    echo.
    echo To create database, run in PowerShell as Administrator:
    echo psql -U postgres
    echo CREATE DATABASE flowai;
    echo CREATE USER flowai_user WITH PASSWORD 'flowai123';
    echo GRANT ALL PRIVILEGES ON DATABASE flowai TO flowai_user;
    echo \q
    pause
    exit /b 1
)

echo [OK] Backend ready!

REM Frontend setup
echo.
echo [*] Setting up frontend...
cd ..\frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

echo [OK] Frontend ready!

echo.
echo ==================================
echo [OK] Setup complete!
echo ==================================
echo.
echo To start the application:
echo.
echo Option 1: Using two terminals
echo - Terminal 1: cd backend ^&^& npm run dev
echo - Terminal 2: cd frontend ^&^& npm start
echo.
echo Option 2: Continue here to start in background
echo.
pause

REM Start backend in new window
cd ..\backend
start "FlowAI Backend" npm run dev

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend in new window
cd ..\frontend
start "FlowAI Frontend" npm start

echo.
echo Backend and Frontend starting in new windows...
echo.
echo Opening browser to http://localhost:3000
timeout /t 3 /nobreak
start http://localhost:3000

echo.
echo ==================================
echo Application is starting!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ==================================
pause
