(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('preferencesAliasController',
    function ($scope, $timeout, configService, profileService, go, gettext, lodash) {
      const self = this;
      const config = configService.getSync();
      const fc = profileService.focusedClient;
      const walletId = fc.credentials.walletId;
      config.aliasFor = config.aliasFor || {};
      this.alias = config.aliasFor[walletId] || fc.credentials.walletName;

      function setError(error) {
        self.error = gettext(error);
      }

      this.save = function () {
        const opts = {
          aliasFor: {},
        };

        opts.aliasFor[walletId] = self.alias.trim();

        const existingWallet = lodash.find(self.wallets, { name: self.alias.trim() });
        if (existingWallet) {
          setError('Wallet with the same name already exists');
          return;
        }

        configService.set(opts, (err) => {
          if (err) {
            $scope.$emit('Local/DeviceError', err);
            return;
          }
          $scope.$emit('Local/AliasUpdated');
          $timeout(() => {
            go.path('preferences');
          }, 50);
        });
      };

      this.loadExistingWallets = function () {
        if (!profileService.profile) {
          return;
        }

        config.aliasFor = config.aliasFor || {};

        const ret = lodash.map(profileService.profile.credentials, c => ({
          name: config.aliasFor[c.walletId] || c.walletName,
        }));

        self.wallets = lodash.sortBy(ret, 'name');
        self.wallets = lodash.filter(self.wallets, c => (c.name !== self.alias));
      };

      $scope.$watch('prefAlias.alias', (newValue, oldValue) => {
        if (typeof newValue !== 'undefined') {
          if (newValue.length > 50) {
            $scope.prefAlias.alias = oldValue;
          }
        }
      });

      self.loadExistingWallets();
    });
}());
