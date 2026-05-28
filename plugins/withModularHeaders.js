/**
 * Expo config plugin: withModularHeaders
 *
 * Firebase Swift pods (FirebaseCoreInternal, FirebaseCrashlytics, FirebaseSessions)
 * require `use_modular_headers!` in the Podfile when building as static libraries
 * with React Native's New Architecture. This plugin injects that line automatically
 * so `npx expo prebuild` produces a working Podfile without manual edits.
 */
const { withPodfile } = require('@expo/config-plugins');

const withModularHeaders = (config) => {
  return withPodfile(config, (config) => {
    const podfile = config.modResults.contents;

    // Only add if not already present
    if (!podfile.includes('use_modular_headers!')) {
      // Insert after the first `platform :ios` line
      config.modResults.contents = podfile.replace(
        /(platform :ios.*\n)/,
        '$1use_modular_headers!\n'
      );
    }

    return config;
  });
};

module.exports = withModularHeaders;
