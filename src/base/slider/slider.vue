<template>
	<div class="slider" ref="slider">
		<div class="slider-group" ref="sliderGroup">
			<slot></slot>
		</div>
		<div class="dots">
			<span class="dot" v-for="(dot, index) in dots" :class="{active: currentPageIndex === index}"></span>
		</div>
	</div>
</template>

<script type="text/ecmascript-6">
	import BScroll from 'better-scroll';
	import {addClass} from 'common/js/dom';

	export default {
		data() {
			return {
				dots: [],
				currentPageIndex: 0
			};
		},
		props: {
			loop: {
				type: Boolean,
				default: true
			},
			autoPlay: {
				type: Boolean,
				default: true
			},
			interval: {
				type: Number,
				default: 4000
			}
		},
		mounted() {
			setTimeout(() => {
				this._setSliderWidth();
				this._initDots();
				this._initSlider();
				if (this.autoPlay) {
					this._play();
				}
			}, 20);

			window.addEventListener('resize', () => {
				if (!this.slider || !this.slider.enabled) {
					return;
				}
				clearTimeout(this.resizeTimer);
				this.resizeTimer = setTimeout(() => {
					// 如果slider正在轮播中
					if (this.slider.isInTransition) {
						this._onScrollEnd();
					} else {
						if (this.autoPlay) {
							this._play();
						}
					}
					this.refresh();
				}, 60);
			});
		},
		destroyed() {
			clearTimeout(this.timer);
		},
		methods: {
			refresh() {
				if (this.slider) {
					this._setSliderWidth(true);
					this.slider.refresh();
				}
			},
			// 设置slider的宽度
			_setSliderWidth(isResize) {
				this.children = this.$refs.sliderGroup.children;
				let width = 0;
				let sliderWidth = this.$refs.slider.clientWidth;

				for (let i = 0; i < this.children.length; i++) {
					let child = this.children[i];
					// 给slider-group的子元素加class
					addClass(child, 'slider-item');
					child.style.width = sliderWidth + 'px';
					width += sliderWidth;
				};
				if (this.loop && !isResize) {
					width += 2 * sliderWidth;
				};
				this.$refs.sliderGroup.style.width = width + 'px';
			},
			_initDots() {
				this.dots = new Array(this.children.length);
			},
			_initSlider() {
				this.slider = new BScroll(this.$refs.slider, {
					scrollX: true,
					scrollY: false,
					momentum: false,
					snap: {
						loop: this.loop,
						threshold: 0.3,
						speed: 400
					}
				});
				// 滚动结束时触发
				this.slider.on('scrollEnd', this._onScrollEnd);
				// 鼠标或者手指抬起时触发
				this.slider.on('touchEnd', () => {
					if (this.autoPlay) {
						this._play();
					}
				});
				// 滚动开始前触发(鼠标或者手指按下也触发)
				this.slider.on('beforeScrollStart', () => {
					if (this.autoPlay) {
						clearTimeout(this.timer);
					}
				});
			},
			_play() {
				let pageIndex = this.currentPageIndex + 1;
				if (this.loop) {
					pageIndex += 1;
				}
				clearTimeout(this.timer);
				this.timer = setTimeout(() => {
					this.slider.goToPage(pageIndex, 0, 400);
				}, this.interval);
			},
			_onScrollEnd() {
				let pageIndex = this.slider.getCurrentPage().pageX;
				if (this.loop) {
					pageIndex -= 1;
				}
				this.currentPageIndex = pageIndex;
				// 滚动结束后清除定时器，再执行_play方法以达到自动滚动的效果
				if (this.autoPlay) {
					clearTimeout(this.timer);
					this._play();
				}
			}
		}
	};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	@import '../../common/stylus/variable.styl'

	.slider
		min-height: 1px
		.slider-group
			position: relative
			overflow: hidden
			white-space: nowrap
			.slider-item
				float: left
				box-sizing: border-box
				overflow: hidden
				text-align: center
				a
					display: block
					width: 100%
					text-decoration: none
				img
					display: block
					width: 100%
		.dots
			position: absolute
			right: 0
			left: 0
			bottom: 12px
			text-align: center
			font-size: 0
			.dot
				display: inline-block
				margin: 0 4px
				width: 8px
				height: 8px
				border-radius: 50%
				background: $color-text-l
				&.active
					width: 20px
					border-radius: 5px
					background: $$color-text-ll
</style>
