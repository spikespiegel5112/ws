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
		},
		align: function(options) {
			options = $.extend({
				position: 'both',
				container: '',
				isimage: false,
				offsetx: 0,
				offsety: 0,
				ignore: ''
			}, options);

			var that = this,
				imgSrc = that.attr('src'),
				reload = false,
				container = $(options.container),
				thisWidth = 0,
				thisHeight = 0,
				containerWidth = 0,
				containerHeight = 0,
				timer,
				ignoreX = 0,
				ignoreY = 0,
				ignoreArr = [],
				windowWidth = $(window).width(),
				windowHeight = $(window).height();
			//_this.attr('src', imgSrc + '?' + Date.parse(new Date()))

			initAligning();
			$(window).resize(function() {
				initAligning();
			});

			function initAligning() {
				if (typeof options.ignore === 'string') {
					ignoreArr = options.ignore.split(',');
					for (var i = 0; i < ignoreArr.length; i++) {
						ignoreX += $(ignoreArr[i]).width();
						ignoreY += $(ignoreArr[i]).height();
					}
				}
				//当居中元素是img标签时，特殊处理！
				if (that.is('img')) {
					//递归判断需要居中的图片是否加载完成，如果没有就重载
					var checkImageLoaded = function() {
						that.each(function(index) {
							var $this = $(this);
							if ($this.height() == 0) {
								console.log('load failed ' + $(this).width())
								reload = true;
								return false;
							} else {
								containerWidth = container.eq(index).width();
								containerHeight = container.eq(index).height();
								checkPosition($this)
								console.log('第' + index + '张图片的高度:' + containerHeight);
							}
						});
						if (reload) {
							reload = false;
							checkBrowser({
								ie: function() {
									timer = window.setTimeout(function() {
										checkImageLoaded();
									}, 100);
								},
								other: function() {
									timer = setTimeout(function() {
										checkImageLoaded();
									}, 100);
								}
							})
						}
					}
					checkImageLoaded();
					//缺省情况
				} else {
					//需要遍历每个居中对象，判断其每个container尺寸不同时，需分别处理
					//当设置了container时，以container尺寸大小居中
					if (options.container != '') {
						that.each(function(index) {
							var $this = $(this);
							containerHeight = container.eq(index).height();
							containerWidth = container.eq(index).width();
							console.log(containerHeight)
							if ($this.is(':hidden')) {
								return true
							} else {
								checkPosition($this);
							}
						});
						//当没有设置container时，以窗口尺寸大小居中
					} else {
						containerWidth = $(window).width();
						containerHeight = $(window).height();
						that.each(function(index) {
							var $this = $(this);
							if ($this.is(':hidden')) {
								return true
							} else {
								checkPosition($this);
							}
						});
					}
				}
			}

			function checkPosition(_this) {
				checkBrowser({
					ie: function() {
						window.clearTimeout(timer);
					},
					other: function() {
						clearTimeout(timer);
					}
				})

				var thisWidth = _this.outerWidth(),
					thisHeight = _this.outerHeight();

				switch (options.position) {
					case 'both':
						var marginY = (containerHeight - thisHeight) / 2;
						if (thisWidth <= $(window).width()) {
							if (options.offsetx != 0) {
								_this.css({
									'margin': marginY + options.offsety - ignoreY + 'px ' + (containerWidth - thisWidth) / 2 + offsetX - ignoreX + 'px'
								});
							} else {
								_this.css({
									'margin': marginY + options.offsety - ignoreY + 'px auto'
								});
							}
						} else {
							var marginX = (containerWidth - thisWidth) / 2;
							_this.css({
								'margin': marginY + options.offsety - ignoreY + 'px ' + (marginX + options.offsetx) + 'px'
							});
						}
						break;
					case 'top':
						aligning(function(thisWidth, thisHeight) {
							if ($(document).height() > $(window).height()) {
								return;
							} else {
								_this.css({
									'margin': (containerWidth - thisWidth) / 2 + ' auto'
								});
							}
						});
						break;
					case 'right':
						aligning(function(thisWidth, thisHeight) {
							_this.css({
								'margin': (windowHeight - thisHeight) / 2 + 'px 0 0 ' + (containerWidth - thisWidth) + 'px'
							});
						});
						break;
					case 'bottom':
						aligning(function(thisWidth, thisHeight) {
							_this.css({
								'margin': (windowHeight - thisHeight + options.offsety - ignoreY) + 'px auto 0'
							});
						});
						break;
					case 'left':
						aligning(function(thisWidth, thisHeight) {
							_this.css({
								'margin': (windowHeight - thisHeight) / 2 + 'px 0 0 0'
							});
						});
						break;
				}
			}

			function aligning(callback) {
				thisWidth = that.outerWidth();
				thisHeight = that.outerHeight();
				return callback(thisWidth, thisHeight);
			}

			function checkBrowser(callback) {
				callback = $.extend({
					ie: function() {
						return;
					},
					other: function() {
						return;
					}
				}, callback)
				if (navigator.appName.indexOf("Explorer") > -1) {
					console.log('IE')
					callback.ie();
				} else {
					// console.log('other')
					callback.other();
				}
			}
			//屏幕方向探测器
			function orientationSensor(callback) {
				var windowWidth = $(window).width(),
					windowHeight = $(window).height(),
					orientation = '';
				callback = $.extend({
					portrait: function() {},
					landscape: function() {},
					orientationchange: function(windowWidth, windowHeight) {}
				}, callback)

				checkoritation();
				$(window).resize(function() {
					checkoritation();
				});

				function checkoritation() {
					callback.orientationchange();
					if (windowWidth < windowHeight) {
						return callback.portrait();
					} else {
						return callback.landscape();
					}
				}
				return (windowWidth < windowHeight) ? orientation = 'portrait' : orientation = 'landscape';
			}
		},
		//滑块拖动控件
		sliderControl: function(options, callback) {
			var config = $.extend({
				density: 100,
				axisx: '',
				offset: 0,
				returnto: false,
				progress: ''
			}, options);

			var that = $(this),
				isMousedown = false,
				offsetLeft = that.offset().left,
				startX = 0,
				startY = 0,
				axisWidth = $(config.axisx).width(),
				sliderWidth = that.width(),
				unitWidth = axisWidth / config.density,
				index = 0,
				progress = 0,
				returned = false,
				offsetVal = [],
				container = that.parent(),
				timer;

			var touchStart, touchMove, touchEnd;
			touchStart = isMobile() ? 'touchstart' : 'mousedown';
			touchMove = isMobile() ? 'touchmove' : 'mousemove';
			touchEnd = isMobile() ? 'touchend' : 'mouseup';

			config.density += 1;

			if (typeof config.offset == 'string') {
				$(config.offset).each(function(i) {
					offsetVal[i] = Number($(this).val());
				});
			} else if (typeof config.offset == 'number') {
				that.each(function(i) {
					offsetVal[i] = config.offset;
					$(config.returnto).val(offsetVal[i]);

				});
			}
			that.each(function(i) {
				//that.css('margin-left', -sliderWidth / 2);
				that.eq(i).on(touchStart, function(e) {
					isMousedown = true;
					if (isMobile()) {
						var touch = e.originalEvent.touches[0];
					} else {
						var touch = e;
					}
					var startX = touch.clientX,
						startY = touch.clientY;
					index = i;
				});
				container.on(touchMove, function(e) {
					if (isMousedown) {
						if (isMobile()) {
							var touch = e.originalEvent.touches[0];
						} else {
							var touch = e;
						}
						var moveX = touch.pageX - offsetLeft;
						//在滑动滑块的时候阻止默认事件
						if (moveX - startX != 0) {
							e.preventDefault();
						}
						if (touch.clientX < offsetLeft + axisWidth && touch.clientX > offsetLeft) {
							if (returned) {
								that.eq(index).css('margin-left', moveX - sliderWidth / 2);
								returned = false;
							}
						}
						if (!returned) {
							progress = progress * (config.density / axisWidth) + offsetVal[index];
							if (progress >= config.density + offsetVal[index]) {
								progress = config.density + offsetVal[index] - 1;
							};
							if ($(config.returnto).eq(index).is('input')) {
								$(config.returnto).eq(index).val(Math.floor(progress));
							} else {
								$(config.returnto).eq(index).html(Math.floor(progress));
							}
							returned = true;
						};
						if (moveX < 0) {
							progress = 0;
						} else if (moveX >= axisWidth) {
							progress = axisWidth;
						} else {
							progress = moveX + 1;
						}
						if (typeof options == 'string') {
							switch (options) {
								case 'onmove':
									callback();
									break;
							}
							return;
						}
					}
				});
			});

			$(config.returnto).each(function(i) {
				var thisReturnto = $(this),
					initVal = Number(thisReturnto.val()),
					timer;
				if (thisReturnto.is('input')) {
					var isFirefox = 0;
					if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
						thisReturnto.attr('autocomplete', 'off')
					}
					thisReturnto.keyup(function() {
						clearTimeout(timer);
						var $this = $(this),
							inputVal = constrainInputVal(Number($(this).val()), initVal);

						timer = setTimeout(function() {
							$(this).val(inputVal);
							that.eq(i).css('margin-left', (inputVal - offsetVal[i]) * (axisWidth / config.density));
							$this.blur();
						}, 1000);
					});
				} else {
					var value = Number($(this).val());
					$(this).html(value);
				}
				thisReturnto.blur(function() {
					var inputVal = constrainInputVal(Number($(this).val()), initVal);
					$(this).val(inputVal);
					that.eq(i).css('margin-left', (inputVal - offsetVal[i]) * (axisWidth / config.density));
				})
			});

			$(document).on(touchEnd, function() {
				isMousedown = false;
			});

			function constrainInputVal(inputVal, initVal) {
				if (inputVal <= initVal) {
					inputVal = initVal;
				} else if (inputVal > initVal && inputVal < config.density + initVal) {
					inputVal = inputVal;
				} else if (inputVal >= config.density + initVal) {
					inputVal = config.density + initVal - 1
				} else if (isNaN(value)) {
					inputVal = initVal;
				}
				return inputVal;
			}

			function isMobile() {
				var sUserAgent = navigator.userAgent.toLowerCase(),
					bIsIpad = sUserAgent.match(/ipad/i) == "ipad",
					bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os",
					bIsMidp = sUserAgent.match(/midp/i) == "midp",
					bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
					bIsUc = sUserAgent.match(/ucweb/i) == "ucweb",
					bIsAndroid = sUserAgent.match(/android/i) == "android",
					bIsCE = sUserAgent.match(/windows ce/i) == "windows ce",
					bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile",
					bIsWebview = sUserAgent.match(/webview/i) == "webview";
				return (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM);
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
