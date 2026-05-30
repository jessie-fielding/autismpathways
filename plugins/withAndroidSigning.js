const { withAppBuildGradle } = require('@expo/config-plugins');
const path = require('path');

/**
 * Injects the release signing config into the Android build.gradle
 * using the autism-pathways-upload.jks keystore.
 */
module.exports = function withAndroidSigning(config) {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // Only inject if not already present
    if (buildGradle.includes('autism-pathways-upload.jks')) {
      return config;
    }

    // Inject signingConfigs block before the buildTypes block
    const signingConfig = `
    signingConfigs {
        release {
            storeFile file('../../autism-pathways-upload.jks')
            storePassword 'BiMi1994!'
            keyAlias 'upload'
            keyPassword 'BiMi1994!'
        }
    }
`;

    // Insert signingConfigs before buildTypes
    config.modResults.contents = buildGradle.replace(
      /(\s*buildTypes\s*\{)/,
      `${signingConfig}$1`
    );

    // Wire the release build type to use the signing config
    config.modResults.contents = config.modResults.contents.replace(
      /release\s*\{([^}]*)\}/s,
      (match) => {
        if (match.includes('signingConfig')) return match;
        return match.replace(
          /(\s*)(minifyEnabled|proguardFiles|shrinkResources)/,
          '$1signingConfig signingConfigs.release\n$1$2'
        );
      }
    );

    return config;
  });
};
