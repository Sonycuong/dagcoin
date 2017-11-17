(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('versionAndWalletTypeController', function (gettext) {
    // wallet type
    const conf = require('byteballcore/conf.js');
    this.type = conf.bLight ? gettext('light wallet') : gettext('full wallet');
    this.version = window.version;
    this.commitHash = window.commitHash;
  });
}());
