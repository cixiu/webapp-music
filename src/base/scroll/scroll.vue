<template>
	<div class="srcoll" ref="wrapper">
		<slot></slot>
	</div>
</template>

<script type="text/ecmascript-6">
	import BScroll from 'better-scroll';

	export default {
		props: {
			probeType: {
				type: Number,
				default: 1
			},
			click: {
				type: Boolean,
				default: true
			},
			data: {
				type: Array,
				default: null
			},
			listenScroll: {
				type: Boolean,
				default: false
			},
			pullup: {
				type: Boolean,
				default: false
			},
			beforeScroll: {
				type: Boolean,
				default: false
			},
			refreshDelay: {
				type: Number,
				default: 20
			}
		},
		mounted() {
			setTimeout(() => {
				this._initScroll();
			}, 20);
		},
		methods: {
			_initScroll() {
				if (!this.$refs.wrapper) {
					return;
				}
				this.scroll = new BScroll(this.$refs.wrapper, {
					probeType: this.probeType,
					click: this.click
				});
				// 如果要监听滚动
				if (this.listenScroll) {
					let _this = this;
					this.scroll.on('scroll', (pos) => {
						_this.$emit('scroll', pos);
					});
				}
				// 是否开启下拉加载
				if (this.pullup) {
					this.scroll.on('scrollEnd', () => {
						if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
							this.$emit('scrollToEnd');
						}
					});
				}
				// 开始滚动前
				if (this.beforeScroll) {
					this.scroll.on('beforeScrollStart', () => {
						this.$emit('beforeScroll');
					});
				}
			},
			enable() {
				this.scroll && this.scroll.enable();
			},
			disable() {
				this.scroll && this.scroll.disable();
			},
			refresh() {
				this.scroll && this.scroll.refresh();
			},
			scrollTo() {
				this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
			},
			scrollToElement() {
				this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
			}
		},
		watch: {
			data() {
				setTimeout(() => {
					this.refresh();
				}, this.refreshDelay);
			}
		}
	};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	
</style>
