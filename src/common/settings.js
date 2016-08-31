'use strict';

const fs = require('fs');
const settingsVersion = 1;

var merge = function(base, target) {
  var merged = base;
  if (!target) {
    target = {};
  }
  for (var prop in target) {
    merged[prop] = target[prop];
  }
  return merged;
};

var loadDefault = function(version) {
  if (version == null) {
    version = settingsVersion;
  }
  switch (version) {
    case 1:
      return {
        teams: [],
        hideMenuBar: false,
        showTrayIcon: false,
        trayIconTheme: '',
        disablewebsecurity: true,
        toggleWindowOnTrayIconClick: false,
        version: 1,
        notifications: {
          flashWindow: 0 // 0 = flash never, 1 = only when idle (after 10 seconds), 2 = always
        },
        showUnreadBadge: true
      };
  }
};

var upgradeV0toV1 = function(configV0) {
  var config = loadDefault(1);
  config.teams.push({
    name: 'Primary team',
    url: configV0.url
  });
  return config;
};

var upgrade = function(config) {
  var configVersion = config.version ? config.version : 0;
  switch (configVersion) {
    case 0:
      return upgrade(upgradeV0toV1(config));
    default:
      return config;
  }
};

module.exports = {
  version: settingsVersion,

  upgrade,

  readFileSync(configFile) {
    var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    if (config.version === settingsVersion) {
      var defaultConfig = this.loadDefault();
      config = merge(defaultConfig, config);
    }
    return config;
  },

  writeFileSync(configFile, config) {
    if (config.version != settingsVersion) {
      throw 'version ' + config.version + ' is not equal to ' + settingsVersion;
    }
    var data = JSON.stringify(config, null, '  ');
    fs.writeFileSync(configFile, data, 'utf8');
  },

  loadDefault
};
