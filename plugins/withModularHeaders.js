/**
 * Expo config plugin: withModularHeaders
 *
 * Firebase Swift pods (FirebaseCoreInternal, FirebaseCrashlytics, FirebaseSessions)
 * require modular headers when building as static libraries with React Native's
 * New Architecture. This plugin injects `use_modular_headers!` globally in the
 * Podfile, which is the approach recommended by @react-native-firebase docs.
 *
 * The global flag is safe here because Expo's generated Podfile already uses
 * `use_frameworks! :linkage => :static` and all RN pods handle modular headers.
 */
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withModularHeaders = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (!fs.existsSync(podfilePath)) {
        return config;
      }

      let podfile = fs.readFileSync(podfilePath, 'utf8');

      // Add modular_headers for the specific Firebase pods that need it
      const firebasePods = [
        'GoogleUtilities',
        'FirebaseCore',
        'FirebaseCoreExtension',
        'FirebaseInstallations',
        'GoogleDataTransport',
        'nanopb',
      ];

      for (const pod of firebasePods) {
        const podLine = `  pod '${pod}'`;
        const modularLine = `  pod '${pod}', :modular_headers => true`;

        if (podfile.includes(podLine) && !podfile.includes(modularLine)) {
          podfile = podfile.replace(
            new RegExp(`  pod '${pod}'(?!,)`, 'g'),
            modularLine
          );
        }
      }

      // Also add use_modular_headers! globally if not already present
      if (!podfile.includes('use_modular_headers!')) {
        // Insert after the first `platform :ios` line
        podfile = podfile.replace(
          /(platform :ios[^\n]*\n)/,
          '$1use_modular_headers!\n'
        );
      }

      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);
};

module.exports = withModularHeaders;
