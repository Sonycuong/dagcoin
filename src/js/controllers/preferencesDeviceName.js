(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('preferencesDeviceNameController',
    function ($scope, $timeout, configService, go) {
      const config = configService.getSync();
      this.deviceName = config.deviceName;

      this.save = function () {
        const self = this;
        const device = require('byteballcore/device.js');
        device.setDeviceName(self.deviceName);
        const opts = { deviceName: self.deviceName };

        configService.set(opts, (err) => {
          if (err) {
            $scope.$emit('Local/DeviceError', err);
            return;
          }
          $timeout(() => {
            go.path('preferencesGlobal');
          }, 50);
        });
      };

      $scope.$watch('prefDeviceName.deviceName', (newValue, oldValue) => {
        if (newValue.length > 50) {
          $scope.prefDeviceName.deviceName = oldValue;
        }
      });
    });
}());
