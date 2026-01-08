const { withPodfile } = require("expo/config-plugins");

module.exports = function withModularHeaders(config) {
  return withPodfile(config, (config) => {
    const podfile = config.modResults.contents;

    // Add use_modular_headers! after the first line (platform declaration)
    if (!podfile.includes("use_modular_headers!")) {
      config.modResults.contents = podfile.replace(
        /(platform :ios.*\n)/,
        "$1use_modular_headers!\n"
      );
    }

    return config;
  });
};

