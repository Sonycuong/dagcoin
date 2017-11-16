(function () {
  'use strict';

  const eventBus = require('byteballcore/event_bus.js');

  angular.module('copayApp.controllers').controller('inviteCorrespondentDeviceController',
    ($scope, $timeout, profileService, go, isCordova, correspondentListService, gettextCatalog) => {
      function onPaired(peerAddress) {
        correspondentListService.setCurrentCorrespondent(peerAddress, () => {
          go.path('correspondentDevices.correspondentDevice');
        });
      }

      const conf = require('byteballcore/conf.js');
      $scope.protocol = conf.program;
      $scope.isCordova = isCordova;
      const fc = profileService.focusedClient;
      $scope.color = fc.backgroundColor;


      $scope.$on('qrcode:error', (event, error) => {
        console.log(error);
      });

      $scope.copyCode = function () {
        console.log('copyCode');
        if (isCordova) {
          window.cordova.plugins.clipboard.copy($scope.code);
          window.plugins.toast.showShortCenter(gettextCatalog.getString('Copied to clipboard'));
        }

        $scope.tooltipCopiedShown = true;

        $timeout(() => {
          $scope.tooltipCopiedShown = false;
        }, 1000);
      };

      $scope.onTextClick = function ($event) {
        console.log('onTextClick');
        $event.target.select();
      };

      $scope.error = null;
      correspondentListService.startWaitingForPairing((pairingInfo) => {
        console.log(`beginAddCorrespondent ${pairingInfo.pairing_secret}`);
        $scope.code = `${pairingInfo.device_pubkey}@${pairingInfo.hub}#${pairingInfo.pairing_secret}`;
        $scope.$digest();
        const eventName = `paired_by_secret-${pairingInfo.pairing_secret}`;
        eventBus.once(eventName, onPaired);
        $scope.$on('$destroy', () => {
          console.log('removing listener for pairing by our secret');
          eventBus.removeListener(eventName, onPaired);
        });
      });

      $scope.cancelAddCorrespondent = function () {
        go.path('correspondentDevices');
      };
    });
}());
