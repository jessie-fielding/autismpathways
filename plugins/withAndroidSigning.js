const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Injects the release signing config into the Android app/build.gradle.
 * Designed to be idempotent and survive `expo prebuild --clean`.
 *
 * Strategy:
 * 1. Remove any existing signingConfigs block entirely (handles duplicate blocks).
 * 2. Inject a single clean signingConfigs block with both debug and release configs.
 * 3. Replace the release buildType's signingConfig reference with signingConfigs.release.
 */
module.exports = function withAndroidSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let gradle = config.modResults.contents;

    // ── Step 1: Remove ALL existing signingConfigs { ... } blocks ──────────
    gradle = removeSigningConfigsBlocks(gradle);

    // ── Step 2: Inject a single clean signingConfigs block ──────────────────
    const signingConfigsBlock = `
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file('../../autism-pathways-upload.jks')
            storePassword 'BiMi1994!'
            keyAlias 'upload'
            keyPassword 'BiMi1994!'
        }
    }
`;

    // Insert signingConfigs block right before the buildTypes block
    gradle = gradle.replace(
      /(\n\s*buildTypes\s*\{)/,
      `\n${signingConfigsBlock}$1`
    );

    // ── Step 3: Wire release buildType to signingConfigs.release ────────────
    // Replace any signingConfig line inside the release { } block
    gradle = gradle.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{)([\s\S]*?)(\n\s*\})/,
      (match, open, body, close) => {
        // Remove any existing signingConfig line
        const cleanBody = body.replace(/\n\s*signingConfig\s+[^\n]+/g, '');
        // Add the correct signingConfig as the first line in the block
        return `${open}\n            signingConfig signingConfigs.release${cleanBody}${close}`;
      }
    );

    config.modResults.contents = gradle;
    return config;
  });
};

/**
 * Removes all `signingConfigs { ... }` blocks from the gradle string.
 * Uses brace-counting to handle nested braces correctly.
 */
function removeSigningConfigsBlocks(gradle) {
  let result = '';
  let i = 0;
  while (i < gradle.length) {
    const remaining = gradle.slice(i);
    const match = remaining.match(/^(\s*signingConfigs\s*\{)/);
    if (match) {
      let depth = 0;
      let j = i;
      while (j < gradle.length) {
        if (gradle[j] === '{') depth++;
        else if (gradle[j] === '}') {
          depth--;
          if (depth === 0) {
            j++;
            if (gradle[j] === '\n') j++;
            break;
          }
        }
        j++;
      }
      i = j;
    } else {
      result += gradle[i];
      i++;
    }
  }
  return result;
}
