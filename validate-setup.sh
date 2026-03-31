#!/bin/bash

# FlowAI - Setup Validator
# Checks if everything is configured correctly

echo "🔍 FlowAI Setup Validator"
echo "=========================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES=0

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Not installed"
    ISSUES=$((ISSUES+1))
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} $NPM_VERSION"
else
    echo -e "${RED}✗${NC} Not installed"
    ISSUES=$((ISSUES+1))
fi

# Check PostgreSQL
echo -n "Checking PostgreSQL... "
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗${NC} Not installed"
    ISSUES=$((ISSUES+1))
fi

echo ""
echo "Checking Configuration Files..."
echo "================================"

# Check backend .env
echo -n "Backend .env... "
if [ -f "backend/.env" ]; then
    if grep -q "OPENROUTER_API_KEY" backend/.env; then
        if grep -q "sk-or-v1-" backend/.env; then
            echo -e "${GREEN}✓${NC} Found with API key"
        else
            echo -e "${YELLOW}⚠${NC} Missing/invalid API key"
            ISSUES=$((ISSUES+1))
        fi
    else
        echo -e "${RED}✗${NC} Missing OPENROUTER_API_KEY"
        ISSUES=$((ISSUES+1))
    fi
else
    echo -e "${RED}✗${NC} File not found"
    ISSUES=$((ISSUES+1))
fi

# Check backend dependencies
echo -n "Backend dependencies... "
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗${NC} Not installed (run: cd backend && npm install)"
    ISSUES=$((ISSUES+1))
fi

# Check frontend .env.local
echo -n "Frontend .env.local... "
if [ -f "frontend/.env.local" ]; then
    if grep -q "REACT_APP_API_URL" frontend/.env.local; then
        echo -e "${GREEN}✓${NC} Found"
    else
        echo -e "${RED}✗${NC} Missing REACT_APP_API_URL"
        ISSUES=$((ISSUES+1))
    fi
else
    echo -e "${YELLOW}⚠${NC} Not found (will use default)"
fi

# Check frontend dependencies
echo -n "Frontend dependencies... "
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Installed"
else
    echo -e "${RED}✗${NC} Not installed (run: cd frontend && npm install)"
    ISSUES=$((ISSUES+1))
fi

echo ""
echo "Checking Database..."
echo "===================="

# Check if PostgreSQL is running (if available)
if command -v psql &> /dev/null; then
    echo -n "PostgreSQL connection... "
    if psql -U postgres -c "SELECT 1" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} PostgreSQL is running"
        
        echo -n "Database 'flowai' exists... "
        if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw flowai; then
            echo -e "${GREEN}✓${NC} Database found"
        else
            echo -e "${RED}✗${NC} Database not found (run: npm run migrate in backend)"
            ISSUES=$((ISSUES+1))
        fi
    else
        echo -e "${YELLOW}⚠${NC} PostgreSQL not running or no connection"
        echo "   (This is OK if you're just checking config - start PostgreSQL to test)"
    fi
fi

echo ""
echo "Summary"
echo "======="

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "You're ready to go! Start with:"
    echo "  Terminal 1: cd backend && npm run dev"
    echo "  Terminal 2: cd frontend && npm start"
else
    echo -e "${RED}✗ $ISSUES issue(s) found${NC}"
    echo ""
    echo "See SETUP.md for detailed setup instructions"
fi
