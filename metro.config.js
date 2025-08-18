const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      'app': path.resolve(__dirname, 'app'),
    },
    platforms: ['ios', 'android', 'native', 'web'],
  },
  // Help with Windows long path issues
  maxWorkers: 1,
  projectRoot: path.resolve(__dirname),
  watchFolders: [path.resolve(__dirname)],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
