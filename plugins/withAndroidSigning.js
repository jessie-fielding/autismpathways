const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Injects the release signing config into the Android app/build.gradle.
 * Designed to be idempotent and survive `expo prebuild --clean`.
 */
module.exports = function withAndroidSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let gradle = config.modResults.contents;

    // ── Step 1: Remove ALL existing signingConfigs { ... } blocks ──────────
    gradle = removeSigningConfigsBlocks(gradle);

    // ── Step 2: Inject signingConfigs block before buildTypes ───────────────
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

    // Match buildTypes { with any preceding whitespace (handles inline-after-brace case)
    gradle = gradle.replace(
      /([ \t]*buildTypes\s*\{)/,
      `${signingConfigsBlock}$1`
    );

    // ── Step 3: Wire release buildType to signingConfigs.release ────────────
    gradle = replaceReleaseBlock(gradle);

    config.modResults.contents = gradle;
    return config;
  });
};

/**
 * Finds the release { } block inside buildTypes (after signingConfigs) and
 * replaces its signingConfig line with signingConfigs.release.
 * Uses brace-counting so it works regardless of block nesting.
 */
function replaceReleaseBlock(g) {
  const buildTypesIdx = g.indexOf('buildTypes');
  if (buildTypesIdx === -1) return g;

  // Find "release {" after buildTypes
  const releaseMatch = g.slice(buildTypesIdx).match(/(\n[ \t]+release[ \t]*\{)/);
  if (!releaseMatch) return g;

  const releaseStart = buildTypesIdx + releaseMatch.index;
  const releaseOpenBrace = releaseStart + releaseMatch[0].indexOf('{');

  // Scan to find the matching closing brace
  let depth = 0;
  let j = releaseOpenBrace;
  while (j < g.length) {
    if (g[j] === '{') depth++;
    else if (g[j] === '}') { depth--; if (depth === 0) break; }
    j++;
  }

  // Extract the release block body
  const blockContent = g.slice(releaseOpenBrace + 1, j);

  // Remove any existing signingConfig line, add the correct one
  let newContent = blockContent.replace(/\n[ \t]*signingConfig[ \t]+[^\n]+/g, '');
  newContent = '\n            signingConfig signingConfigs.release' + newContent;

  return g.slice(0, releaseOpenBrace + 1) + newContent + g.slice(j);
}

/**
 * Removes all `signingConfigs { ... }` blocks from the gradle string.
 * Uses brace-counting to handle nested braces correctly.
 */
function removeSigningConfigsBlocks(gradle) {
  let result = '';
  let i = 0;
  while (i < gradle.length) {
    const slice = gradle.slice(i);
    const m = slice.match(/^([ \t]*signingConfigs[ \t]*\{)/);
    if (m) {
      let depth = 0;
      let j = i;
      while (j < gradle.length) {
        if (gradle[j] === '{') depth++;
        else if (gradle[j] === '}') {
          depth--;
          if (depth === 0) { j++; if (gradle[j] === '\n') j++; break; }
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
