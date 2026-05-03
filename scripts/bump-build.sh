#!/bin/bash
# bump-build.sh
# Usage: npm run bump-build
# Reads the current buildNumber from app.json, increments it by 1,
# writes it back, then runs expo prebuild to sync it into the native ios/ folder.

set -e

APP_JSON="$(dirname "$0")/../app.json"

# Read current build number
CURRENT=$(node -e "const a=require('$APP_JSON'); console.log(a.expo.ios.buildNumber)")
NEXT=$((CURRENT + 1))

echo "📦 Bumping build number: $CURRENT → $NEXT"

# Write new build number back to app.json
node -e "
const fs = require('fs');
const path = '$APP_JSON';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
data.expo.ios.buildNumber = String($NEXT);
fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log('✅ app.json updated to build $NEXT');
"

# Regenerate native ios/ folder so Xcode picks up the new build number
echo "🔄 Running expo prebuild to sync ios/ project files..."
cd "$(dirname "$0")/.." && npx expo prebuild --platform ios --clean

echo ""
echo "✅ Done! Build number is now $NEXT."
echo "   Open Xcode → Product → Archive to build and upload."
