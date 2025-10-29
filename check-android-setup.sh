#!/bin/bash

# InstaGoods Capacitor Android Setup Verification Script
# This script checks if your environment is ready for Android development

echo "🔍 Checking InstaGoods Android Development Setup..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Found: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js v18 or higher."
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} Found: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found. Please install npm."
    exit 1
fi

# Check if dependencies are installed
echo -n "Checking node_modules... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${YELLOW}!${NC} Dependencies not installed. Run: npm install"
fi

# Check Capacitor dependencies
echo -n "Checking Capacitor packages... "
if grep -q "@capacitor/core" package.json && \
   grep -q "@capacitor/android" package.json && \
   grep -q "@capacitor/cli" package.json; then
    echo -e "${GREEN}✓${NC} Capacitor packages found in package.json"
else
    echo -e "${RED}✗${NC} Capacitor packages missing from package.json"
    exit 1
fi

# Check capacitor.config.ts
echo -n "Checking Capacitor config... "
if [ -f "capacitor.config.ts" ]; then
    echo -e "${GREEN}✓${NC} capacitor.config.ts exists"
else
    echo -e "${RED}✗${NC} capacitor.config.ts not found"
    exit 1
fi

# Check android directory
echo -n "Checking Android platform... "
if [ -d "android" ]; then
    echo -e "${GREEN}✓${NC} Android platform added"
else
    echo -e "${RED}✗${NC} Android platform not found. Run: npx cap add android"
    exit 1
fi

# Check Java
echo -n "Checking Java (JDK)... "
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo -e "${GREEN}✓${NC} Found: $JAVA_VERSION"
else
    echo -e "${YELLOW}!${NC} Java not found. Install via Android Studio or download JDK 17+"
fi

# Check Android SDK
echo -n "Checking Android SDK... "
if [ -n "$ANDROID_HOME" ] || [ -n "$ANDROID_SDK_ROOT" ]; then
    echo -e "${GREEN}✓${NC} ANDROID_HOME is set"
    if [ -d "$ANDROID_HOME" ]; then
        echo "   Location: $ANDROID_HOME"
    fi
else
    echo -e "${YELLOW}!${NC} ANDROID_HOME not set. Install Android Studio and set environment variable"
fi

# Check Gradle
echo -n "Checking Gradle wrapper... "
if [ -f "android/gradlew" ]; then
    echo -e "${GREEN}✓${NC} Gradle wrapper found"
else
    echo -e "${YELLOW}!${NC} Gradle wrapper not found"
fi

# Check Android Studio
echo -n "Checking Android Studio... "
if command -v studio &> /dev/null || \
   [ -d "/Applications/Android Studio.app" ] || \
   [ -d "/opt/android-studio" ] || \
   [ -d "$HOME/android-studio" ]; then
    echo -e "${GREEN}✓${NC} Android Studio appears to be installed"
else
    echo -e "${YELLOW}!${NC} Android Studio not found. Install from: https://developer.android.com/studio"
fi

echo ""
echo "📱 Next Steps:"
echo "1. If any items are marked with ${YELLOW}!${NC}, install the missing components"
echo "2. Run: npm run build"
echo "3. Run: npm run cap:sync:android"
echo "4. Run: npm run cap:open:android (to open in Android Studio)"
echo "5. Build and run the app from Android Studio"
echo ""
echo "📚 For detailed instructions, see: docs/MOBILE_DEVELOPMENT.md"
echo ""
