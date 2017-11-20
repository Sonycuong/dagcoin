(function () {
  'use strict';

  angular
    .module('copayApp.directives')
    .directive('whenScrolled', ['$timeout', function ($timeout) {
      function ScrollPosition(node) {
        this.node = node;
        this.previousScrollHeightMinusTop = 0;
        this.readyFor = 'up';
      }

      ScrollPosition.prototype.restore = function () {
        if (this.readyFor === 'up') {
          this.node.scrollTop = this.node.scrollHeight
            - this.previousScrollHeightMinusTop;
        }
      };

      ScrollPosition.prototype.prepareFor = function (direction) {
        this.readyFor = direction || 'up';
        this.previousScrollHeightMinusTop = this.node.scrollHeight
          - this.node.scrollTop;
      };

      return function (scope, elm, attr) {
        const raw = elm[0];

        const chatScrollPosition = new ScrollPosition(raw);

        $timeout(() => {
          raw.scrollTop = raw.scrollHeight;
        });

        elm.bind('scroll', () => {
          scope.autoScrollEnabled = true;

          if (raw.scrollTop <= 20 && !scope.loadingHistory) { // load more items before you hit the top
            scope.loadingHistory = true;
            chatScrollPosition.prepareFor('up');
            scope[attr.whenScrolled](() => {
              scope.$digest();
              chatScrollPosition.restore();
              scope.loadingHistory = false;
            });
          }
        });
      };
    }]);
}());
