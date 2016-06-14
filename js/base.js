/**
 * Created by xingweiwei on 15/6/19.
 */
(function($, window) {

	'use strict'

	//默认隐藏标题，自动处理成 XXX...
	//全文自动设置为 title属性
	$.fn.extend({
		priceCalculator: function(options) {
			var $this = $(this),
				totalPriceArr = [],
				config = {
					unitprice: '',
					subtotal: '',
					totalprice: '',
					onchange: function() {}
				};
			if (options) {
				$.extend(config, options);
			};
			init($this);
			$.each($this, function(index) {
				var $this = $(this);
				if ($this.is('input')) {
					var counterEl = $this;
				} else {
					var counterEl = $this.find('input');
				}
				$this.find('a').on('click', function(e) {
					var counter = counterEl.val();
					switch ($(this).index()) {
						case 0:
							counter--;
							if (counter < 0) {
								counter = 0;
							}
							break;
						case 2:
							counter++;
							break;
					}
					e.stopPropagation();
					counterEl.val(counter);
					setter(index, counter);
					config.onchange();
					fireOnchange(counterEl);
				})
				counterEl.on('keydown keyup', function(e) {
					var $this = $(this),
						counter = 0,
						keycode = e.charCode ? e.charCode : e.keyCode;
					switch (e.type) {
						case 'keydown':
							if (keycode != 8 && keycode != 37 && keycode != 39 && keycode < 48 || keycode > 57 && keycode < 96 || keycode > 105) {
								e.preventDefault();
							} else if (keycode != 37 && keycode != 39) {
								$this.val() != 0 ? $this.val() != 0 : $this.val('');
							}
							break;
						case 'keyup':
							counter = Number(counterEl.val());
							setter(index, counter);
							config.onchange();
							fireOnchange(counterEl);
							break;
					}
				})
			});

			function getUnitprice(index) {
				if (typeof config.unitprice == 'number') {
					var unitPrice = config.unitprice;

				} else if (typeof config.unitprice == 'string') {
					var unitPrice = $(config.unitprice).eq(index).text().replace("￥", '');
				}
				return unitPrice;
			}

			function setter(index, counter) {
				var result = getUnitprice(index) * counter;
				$(config.subtotal).eq(index).html(parseFloat(result).toFixed(2));

				totalprice(index, result)
			}

			function totalprice(index, price) {
				totalPriceArr[index] = price;

				var totalPrice = 0;
				for (var i = totalPriceArr.length - 1; i >= 0; i--) {
					totalPrice += totalPriceArr[i];
				};
				//console.log(totalPriceArr[0])
				$(config.totalprice).html(parseFloat(totalPrice).toFixed(2));
			}

			function init(_this) {
				var length = _this.length;
				$.each(_this, function(index) {
					var val = _this.eq(index).find('input').val();
					setter(index, val)
				});
			}

			function fireOnchange(_this) {
				_this.trigger('onchange');
			}
		}
	});

	$.extend({
		remResizing: function(options) {
			options = $.extend({
				fontsize: 16,
				baseline: 320,
				threshold: 0,
				basedonnarrow: false,
				basedonwide: false,
				dropoff: false,
				aligncenter: false,
				inward: false
			}, options);
			var htmlEl = $('html'),
				bodyEl = $('body'),
				frontline = $(window).width(),
				windowHeight = $(window).height();

			if (options.baseline <= 0) {
				options.baseline = 1;
			};
			sizeConstraint();
			$(window).on('resize', function() {
				sizeConstraint();
			});

			function sizeConstraint() {
				if (options.basedonnarrow) {
					orientationSensor({
						portrait: function() {
							frontline = $(window).width(),
								windowHeight = $(window).height();
						},
						landscape: function() {
							frontline = $(window).height(),
								windowHeight = $(window).width();
						}
					});
				} else {
					frontline = $(window).width(),
						windowHeight = $(window).height();
				}

				var factor = 0;
				if (options.baseline == 0) {
					//alert('当最小宽度等于0时')
					factor = 1;
				} else if (frontline <= options.baseline) {
					//alert('当最小宽度不等于0且屏幕宽度小于等于最小宽度时')
					if (options.inward) {
						factor = frontline / options.threshold;
					} else {
						factor = frontline / options.baseline;
					}
				} else if (frontline > options.baseline && frontline <= options.threshold || options.threshold == 0) {
					//alert('当屏幕宽度大于最小宽度且小于等于最大宽度，或没有最大宽度时')
					if (options.threshold >= 0) {
						if (options.inward) {
							factor = frontline / options.threshold;
						} else {
							factor = frontline / options.baseline;
						}
					}
					console.log(frontline)
				} else if (frontline > options.threshold) {
					//alert('当屏幕宽度大于最大宽度时')
					factor = frontline / options.threshold;

					if (options.aligncenter) {
						bodyEl.css({
							margin: '0 auto',
							width: options.threshold
						});
					} else {
						bodyEl.css('margin', 0);
					}
					// if (options.dropoff) {
					//  alert('dsadas')
					//  htmlEl.css('font-size', 'none');
					//  return;
					// };
				}
				htmlEl.css('font-size', options.fontsize * factor);
				if (options.dropoff && frontline > options.threshold) {
					// alert('dsadas')
					htmlEl.css('font-size', '')
				};
			}
			//屏幕方向探测器
			function orientationSensor(callback) {
				var windowWidth = $(window).width(),
					windowHeight = $(window).height(),
					orientation = '';
				checkoritation();
				$(window).resize(function() {
					checkoritation();
				});

				function checkoritation() {
					if (typeof(callback) != 'undefined') {
						if (windowWidth < windowHeight) {
							return callback.portrait();
						} else {
							return callback.landscape();
						}
					} else {
						callback = {
							portrait: function() {},
							landscape: function() {}
						}
					}
				}
				//console.log((frontline < windowHeight) ? orientation = 'portrait' : orientation = 'landscape')
				return (windowWidth < windowHeight) ? orientation = 'portrait' : orientation = 'landscape';
			}
		}
	});

})(jQuery, window);
