/* eslint-disable */

(() => {
  'use strict';

  /**
   * @desc custome icon directive
   * @example <dag-qr-code></dag-qr-code>
   */
  angular
    .module('copayApp.directives')
    .directive('dagQrCode', dagQrCode);

  dagQrCode.$inject = [];

  function dagQrCode() {
    return {
      restrict: 'E',
      scope: {
        size: '@',
        width: '@'
      },
      link: ($scope, element, attrs) => {
        let global_qrlogo;

        function QRLogoOutput() {
          this.init();
        }

        QRLogoOutput.prototype = {

          /* ************************************************************ */

          grades: [
            'unreadable',	// 0
            'poor',		// 1
            'fair',		// 2
            'good',		// 3
            'excellent'	// 4
          ],

          /*   ************************************************************ */
          /**  Initialize
           */

          init: function () {

            this.element = document.createElement('div');
            /** whatever */
            this.element.className = "logo_output clearfix";

            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.element.appendChild(this.canvas);

            this.logo_grades = document.createElement('div');
            this.logo_grades.className = "logo_grades";

            var div = document.createElement('div');
            this.download = document.createElement('a');
            this.download.innerHTML = "Download Logo";
            this.download.setAttribute("href", "#");
            div.appendChild(this.download);
            this.logo_grades.appendChild(div);

            this.result = document.createElement('div');
            this.logo_grades.appendChild(this.result);

            this.functional_grade = document.createElement('div');
            this.logo_grades.appendChild(this.functional_grade);

            this.error_grade = document.createElement('div');
            this.logo_grades.appendChild(this.error_grade);

            this.element.appendChild(this.logo_grades);
          },

          /* ************************************************************ */
          copyCanvas: function (canvas, w, h) {
            this.canvas.width = w;
            this.canvas.height = h;
            this.ctx.drawImage(canvas, 0, 0);
          },

          /* ************************************************************ */
          showGrades: function (qr, ppm, ok, result) {
            this.download.canvas = this.canvas;
            this.download.onclick = function () {
              document.location.href = this.canvas.toDataURL(); //.replace("image/png", "image/octet-stream");
              return false;
            };

            var grade = 4;
            var fg_text = "";
            var eg_text = "";

            // FUNCTIONAL GRADE
            var fg = qr.functional_grade;
            if (!fg) {
              grade = 0;
              fg_text = "n/a";
            } else {
              if (fg < grade) {
                grade = fg;
              }
              fg_text = fg.toString() + ": " + this.grades[fg];
            }
            fg_text = "Functional grade:<br>" + fg_text;

            if (grade > 0) {

              // ERROR GRADE
              var eg = qr.error_grade;
              if (!eg) {
                grade = 0;
                eg_text = "n/a";
              } else {
                if (eg < grade) {
                  grade = eg;
                }
                eg_text = eg.toString() + ": " + this.grades[eg];
              }
              eg_text = "Error correction grade:<br>" + eg_text;

            }

            // OVERALL GRADE
            if (!ok) {
              grade = 0;
            }

            var og_text = "Overall grade:<br>" + grade + ": " + this.grades[grade] + "<br><br>" + result;

            this.qr = qr;
            this.result.innerHTML = og_text;
            this.functional_grade.innerHTML = fg_text;
            this.error_grade.innerHTML = eg_text;
            this.grade = grade;

            this.element.setAttribute('grade', grade.toString());
            this.element.setAttribute('ppm', ppm.toString());

            return grade;
          }
        };

        function QRLogo() {
        }

        QRLogo.prototype = {

          /* ************************************************************ */
          init: function (text, logo) {
            this.logo_canvas = logo;
            this.text = text;
          },

          /* ************************************************************ */
          show: function () {
            this.shouldStop = true;
          },

          /* ************************************************************ */
          onStart: function () {
            this.generateLogo();
          },

          /* ************************************************************ */
          onStop: function () {
            this.shouldStop = true;
          },

          /* ************************************************************ */
          onComplete: function () {
            this.div_current.style.display = "none";
            this.onStop();
            if (this.debug && this.debug_detailed) {
              this.div_debug_detailed.style.display = "block";
            }
          },

          /* ************************************************************ */
          debugOutput: function (s) {
            if (!this.debug) {
              return;
            }
            var span = document.createElement('span');
            var ss = "<b>" + s + "</b><br>";
            span.innerHTML = ss;
            this.div_debug_output.appendChild(span);

            if (this.debug_detailed) {
              this.logger.debug(ss);
            }
          },

          /* ************************************************************ */
          generateLogo: function () {

            var error_correction_level = 2;	// Level H - about 30%
            var mode = 4;			        // 8bit encoding

            var lw = this.logo_canvas.width;
            var lh = this.logo_canvas.height;
            var logo_min = Math.min(lw, lh);
            var logo_max = Math.max(lw, lh);

            var qr = new QRCodeDecode();

            this.version = qr.getVersionFromLength(error_correction_level, mode, this.text.length);
            if (this.version > 37) {
              this.max_version = 40;
            } else {
              this.max_version = this.version + 2;
            }
            var n_modules = qr.nModulesFromVersion(this.version);

            // Largest logo; aka smallest pixpermodule for QR
            var pixpermodule_min = Math.max(1, Math.ceil(logo_max / (n_modules)));

            // Smallest logo; aka largest pixpermodule for QR
            var pixpermodule_max = Math.max(1, Math.ceil(2.2 * logo_max / (n_modules)));

            var n_pixpermodule = (pixpermodule_max - pixpermodule_min);

            this.logo_n = 0;

            this.qr_ppm_array = [];
            this.qr_canvas_array = [];
            this.xy_arr = [];

            var ppm;

            for (ppm = pixpermodule_min; ppm <= pixpermodule_max; ppm++) {

              var canvas = document.createElement('canvas');

              const moduleColor = [0.835294117647059, 0.12156862745098, 0.149019607843137];
              const bgColor = [1, 1, 1];

              canvas.qrlogo_pixpermodule = ppm;
              qr.encodeToCanvas(mode, this.text, this.version, error_correction_level, ppm, canvas, bgColor, moduleColor);
              this.qr_ppm_array.push(ppm);
              this.qr_canvas_array.push(canvas);

              var n_x = Math.floor(Math.log(Math.pow(n_modules * ppm - lw + 1, 4)) / Math.pow(n_pixpermodule, 1 / 3)) + 1;
              var n_y = Math.floor(Math.log(Math.pow(n_modules * ppm - lh + 1, 4)) / Math.pow(n_pixpermodule, 1 / 3)) + 1;
              var a = this.generateXY(4 * ppm, (4 + n_modules) * ppm - lw, (4 + n_modules) * ppm - lh, n_x, n_y);
              this.xy_arr.push(a);
              this.logo_n += a.x.length;

            }

            this.logo_i = 0;

            this.current_idx = 0;
            this.current_xy_idx = 0;
            this.best_grade = 0;

            this.current_logo_output = new QRLogoOutput();
            this.current_logo_output.canvas.width = this.qr_canvas_array[this.qr_canvas_array.length-1].width;
            this.current_logo_output.canvas.height = this.qr_canvas_array[this.qr_canvas_array.length-1].height;

            setTimeout(function () {
              global_qrlogo.generateNext(global_qrlogo);
            }, 0);
          },

          /* ************************************************************ */
          generateXY: function (min, max_x, max_y, nx, ny) {

            var mx = Math.pow(2, Math.ceil(Math.log(nx) / Math.log(2)));
            var xa = [mx - 1];
            var sx;
            for (sx = mx; sx >= 2; sx /= 2) {
              var iix;
              for (iix = sx / 2; iix < mx; iix += sx) {
                xa.push(mx - iix - 1);
              }
            }

            var my = Math.pow(2, Math.ceil(Math.log(ny) / Math.log(2)));
            var ya = [my - 1];
            var sy;
            for (sy = my; sy >= 2; sy /= 2) {
              var iiy;
              for (iiy = sy / 2; iiy < my; iiy += sy) {
                ya.push(my - iiy - 1);
              }
            }

            var xval = [];
            var yval = [];

            var n = Math.max(nx, ny);

            var dx = (max_x - min) / (mx);
            var dy = (max_y - min) / (my);

            var i;
            for (i = 0; i < nx + ny; i++) {
              var j;
              for (j = Math.min(0, n - i); j <= Math.min(i, n); j++) {
                var ix = i - j;
                var iy = j;
                if ((ix < nx) && (iy < ny)) {
                  var x = min + dx * xa[ix];
                  var y = min + dy * ya[iy];
                  x = Math.round(x * 100) / 100;
                  y = Math.round(y * 100) / 100;
                  xval.push(x);
                  yval.push(y);
                }
              }
            }

            return { x: xval, y: yval };
          },

          /* ************************************************************ */
          generateNext: function () {

            this.generateThis();

            if (this.current_idx < this.qr_canvas_array.length - 1) {
              this.current_idx++;
            } else {
              this.current_idx = 0;
              this.current_xy_idx++;
              while (true) {
                if (this.current_xy_idx < this.xy_arr[this.current_idx].x.length) {
                  break;
                }
                this.current_idx++;
                if (this.current_idx >= this.qr_canvas_array.length) {
                  this.onComplete();
                  return;
                }
              }
            }

            if (!this.shouldStop) {
              setTimeout(function () {
                global_qrlogo.generateNext(global_qrlogo);
              }, 0);
            }
          },

          /* ************************************************************ */
          generateThis: function () {
            var x = this.xy_arr[this.current_idx].x[this.current_xy_idx];
            var y = this.xy_arr[this.current_idx].y[this.current_xy_idx];

            var source_canvas = this.qr_canvas_array[this.current_idx];
            var dest_canvas = this.current_logo_output.canvas;
            var dest_ctx = this.current_logo_output.ctx;
            var bg_rgb = [1, 1, 1];
            dest_ctx.fillStyle = "rgb(255,255,255)";
            dest_ctx.fillRect(0, 0, dest_canvas.width, dest_canvas.height);

            dest_ctx.drawImage(source_canvas, 0, 0);

            // The HTML5 standard does not seem to say anything about "rounding" the dx and dy parameters of drawImage.
            // However, Chrome seems to convert to integer, whereas Firefox seems to use the fractional value.
            // To ensure same results in all browsers, we round the dx and dy values.
            dest_ctx.drawImage(this.logo_canvas, Math.round(x), Math.round(y));
            var imagedata = dest_ctx.getImageData(0, 0, dest_canvas.width, dest_canvas.height);

            var qr = new QRCodeDecode();

            if (this.debug_detailed) {
              qr.logger = this.logger;
            }

            var result = "";
            var ok = false;
            var ppm;
            try {
              ppm = source_canvas.qrlogo_pixpermodule;
              var decoded = qr.decodeImageDataInsideBordersWithMaxVersion(imagedata, dest_canvas.width, dest_canvas.height,
                4 * ppm, source_canvas.width - 4 * ppm - 1, 4 * ppm, source_canvas.height - 4 * ppm - 1, this.max_version);
              ok = (decoded === this.text);
              if (!ok) {
                result = "Wrong text decode";
              }
            } catch (err) {
              result = err.toString();
              ok = false;
            }

            var grade = this.current_logo_output.showGrades(qr, ppm, ok, result);

            this.showThisResult(grade, ppm, dest_canvas, source_canvas.width, source_canvas.height, qr, ok, result);
          },

          /* ************************************************************ */
          showThisResult: function (grade, ppm, canvas, w, h, qr, ok, result) {
            if (grade === 4) {
              var logo_output;

              logo_output = new QRLogoOutput();
              logo_output.copyCanvas(canvas, w, h);
              logo_output.showGrades(qr, ppm, ok, result);
              qrlogo_onstop(logo_output.canvas.toDataURL());
              return;
            } else {
              return;
            }
          }
        };

        const size = $scope.size || $scope.width || 260;
        attrs.$observe('url', (url) => {
          render(url);
        });

        function render(url) {
          let logo = document.createElement('canvas');
          logo.width = 55;
          logo.height = 55;

          let img = new Image;
          img.onload = () => {
            logo.getContext('2d').drawImage(img, 0, 0);

            global_qrlogo = new QRLogo();
            global_qrlogo.init(url, logo);
            global_qrlogo.onStart();
          };
          img.src = 'img/dagcoin_60x60.png';

        }

        function qrlogo_onstop(src) {
          global_qrlogo.onStop();
          element.html(`<img width="${size}" src="${src}">`);
        }
      }
    };
  }
})();

