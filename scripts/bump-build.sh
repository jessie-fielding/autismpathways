#!/bin/bash
# bump-build.sh
# Usage: npm run bump-build (from project root)
# Increments the iOS buildNumber in app.json by 1, then runs expo prebuild
# to sync the new number into the native ios/ folder for Xcode.

set -e

# Always run from the project root regardless of where the script lives
cd "$(dirname "$0")/.."

# Read current build number
CURRENT=$(node -e "console.log(require('./app.json').expo.ios.buildNumber)")
NEXT=$((CURRENT + 1))

echo "📦 Bumping build number: $CURRENT → $NEXT"

# Write new build number back to app.json
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
data.expo.ios.buildNumber = String($NEXT);
fs.writeFileSync('./app.json', JSON.stringify(data, null, 2) + '\n');
console.log('✅ app.json updated to build $NEXT');
"

# Regenerate native ios/ folder so Xcode picks up the new build number
echo "🔄 Running expo prebuild to sync ios/ project files..."
npx expo prebuild --platform ios --clean

echo ""
echo "✅ Done! Build number is now $NEXT."
echo "   Open Xcode → Product → Archive to build and upload."
