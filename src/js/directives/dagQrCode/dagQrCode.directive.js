(() => {
  'use strict';

  const QRCode = require('qrcode');

  /**
   * @desc custome qr-code drawer
   * @example <dag-qr-code></dag-qr-code>
   */
  angular
    .module('copayApp.directives')
    .directive('dagQrCode', dagQrCode);

  dagQrCode.$inject = [];

  function dagQrCode() {
    return {
      restrict: 'E',
      scope: {},
      link: ($scope, element, attrs) => {
        function drawLogo(logoPath, canvas, callback) {
          const img = new Image();
          img.onload = () => {
            const ctx = canvas.getContext('2d');
            const x = (140 - img.width) / 2;
            const y = (140 - img.height) / 2;
            ctx.drawImage(img, x, y, img.width, img.height);
            callback(null, canvas);
          };
          img.src = logoPath;
        }

        function changeColor(r, g, b, canvas) {
          const ctx = canvas.getContext('2d');
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0, ii = imgData.data.length; i < ii; i += 4) {
            imgData.data[i] |= r;
            imgData.data[i + 1] = g | imgData.data[i + 1];
            imgData.data[i + 2] = b | imgData.data[i + 2];
          }
          ctx.putImageData(imgData, 0, 0);
          return canvas;
        }

        function perform(text, options, nextStep) {
          let canvas = document.createElement('canvas');

          QRCode.toCanvas(canvas, text, {
            errorCorrectionLevel: 'H'
          }, (err) => {
            if (err) {
              nextStep(err, null);
              return false;
            }
            if (options.r || options.g || options.b) {
              canvas = changeColor(options.r, options.g, options.b, canvas);
            }
            if (options.logoPath) {
              drawLogo(options.logoPath, canvas, nextStep);
            } else {
              nextStep(null, canvas);
            }
          });
        }

        attrs.$observe('url', (url) => {
          if (url && url.length > 20) {
            perform(url, {
              r: 213,
              g: 31,
              b: 38,
              logoPath: 'img/dagcoin_35x35.png'
            }, (err, canvas) => {
              if (err) {
                alert(err);
              } else {
                const src = canvas.toDataURL();
                element.html(`<img width="260" src="${src}">`);
              }
            });
          }
        });
      }
    };
  }
})();
