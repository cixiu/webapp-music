<template>
	<scroll 
			class="listview" 
			:data="data" 
			ref="listview"
			:listenScroll="listenScroll"
			@scroll="scroll"
			:probe-type="probeType"
	>
		<ul>
			<li class="list-group" v-for="group in data" ref="listGroup">
				<h2 class="title">{{ group.title }}</h2>
				<ul>
					<li class="list-group-item" v-for="item in group.items" @click="selectItem(item)">
						<img class="avatar" v-lazy="item.avatar">
						<span class="name">{{ item.name }}</span>
					</li>
				</ul>
			</li>
		</ul>
		<div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
			<ul>
				<li class="item" v-for="(item, index) in shortcutList" :data-index="index" :class="{current: currentIndex === index}">
					{{ item }}
				</li>
			</ul>
		</div>
		<div class="list-fixed" v-show="fixedTitle" ref="listFixed">
			<h2 class="fixed-title">{{ fixedTitle }}</h2>
		</div>
		<div class="loading-container" v-show="!data.length">
			<loading></loading>
		</div>
	</scroll>
</template>

<script type="text/ecmascript-6">
	import Scroll from 'base/scroll/scroll';
	import Loading from 'base/loading/loading';
	import {getData} from 'common/js/dom';

	// 每个字母锚点的高度
	const ANCHOR_HEIGHT = 18;
	const TITLE_HEIGHT = 30;

	export default {
		data() {
			return {
				scrollY: -1,
				currentIndex: 0,
				diff: 0
			};
		},
		props: {
			data: {
				type: Array,
				default: []
			}
		},
		created() {
			this.touch = {};
			this.listenScroll = true;
			this.listHeight = [];    // list-group的高度集合
			this.probeType = 3;
		},
		computed: {
			shortcutList() {
				return this.data.map((group) => {
					return group.title.substring(0, 1);
				});
			},
			fixedTitle() {
				if (this.scrollY > 0) {
					return '';
				}
				return this.data[this.currentIndex] ? this.data[this.currentIndex].title : '';
			}
		},
		methods: {
			selectItem(item) {
				this.$emit('select', item);
			},
			onShortcutTouchStart(e) {
				let anchorIndex = getData(e.target, 'index');
				this.touch.y1 = e.touches[0].pageY;
				this.touch.anchorIndex = anchorIndex;
				this._scrollTo(anchorIndex);
			},
			onShortcutTouchMove(e) {
				this.touch.y2 = e.touches[0].pageY;
				let delta = Math.floor((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT);
				let anchorIndex = parseInt(this.touch.anchorIndex) + delta;
				this._scrollTo(anchorIndex);
			},
			scroll(pos) {
				this.scrollY = pos.y;
			},
			refresh() {
				this.$refs.listview.refresh();
			},
			_scrollTo(index) {
				// 鼠标或者手指点击或者滑动右侧快速入口的边界判断
				if (!index && index !== 0) {
					return;
				}
				if (index < 0) {
					index = 0;
				} else if (index > this.listHeight.length - 2) {
					index = this.listHeight.length - 2;
				}
				this.scrollY = -this.listHeight[index];

				this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);
			},
			// 计算各个区块的累计高度
			_calculateHeihgt() {
				this.listHeight = [];
				let list = this.$refs.listGroup;
				let height = 0;
				this.listHeight.push(height);
				for (let i = 0; i < list.length; i++) {
					let item = list[i];
					height += item.clientHeight;
					this.listHeight.push(height);
				}
			}
		},
		watch: {
			data() {
				setTimeout(() => {
					this._calculateHeihgt();
				}, 20);
			},
			scrollY(newY) {
				let listHeight = this.listHeight;
				// 当滚动到顶部 newY > 0时
				if (newY > 0) {
					this.currentIndex = 0;
					return;
				}
				// 在中间滚动时
				for (let i = 0; i < listHeight.length - 1; i++) {
					let height1 = listHeight[i];
					let height2 = listHeight[i + 1];
					if (-newY >= height1 && -newY < height2) {
						this.currentIndex = i;
						this.diff = height2 + newY;
						return;
					}
				}
				// 当滚动到底部时，且-newY大于最后一个元素区块高度的上线时
				this.currentIndex = listHeight.length - 2;
			},
			diff(newDiff) {
				let fixedTop = (newDiff > 0 && newDiff < TITLE_HEIGHT) ? newDiff - TITLE_HEIGHT : 0;
				if (this.fixedTop === fixedTop) {
					return;
				}
				this.fixedTop = fixedTop;
				this.$refs.listFixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`;
			}
		},
		components: {
			Scroll,
			Loading
		}
	};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	@import '../../common/stylus/variable.styl'
	
	.listview
		position: relative
		width: 100%
		height: 100%
		overflow: hidden
		background: $color-background
		.list-group
			padding-bottom: 30px
			.title
				height: 30px
				line-height: 30px
				padding-left: 20px
				font-size: $font-size-small
				color: $color-text-l
				background: $color-highlight-background
			.list-group-item
				display: flex
				align-items: center
				padding: 20px 0 0 30px
				.avatar
					flex: 0 0 50px
					width: 50px
					height: 50px
					border-radius: 50%
				.name
					margin-left: 20px
					font-size: $font-size-medium
					color: $color-text-l
		.list-shortcut
			position: absolute
			top: 50%
			right: 0
			z-index: 30
			transform: translateY(-50%)
			width: 20px
			padding: 20px 0
			border-radius: 10px
			text-align: center
			background: $color-background-d
			font-family: Helvetica
			.item
				padding: 3px
				line-height: 1
				font-size: $font-size-small
				color: $color-text-l
				&.current
					color: $color-theme
		.list-fixed
			position: absolute
			top: 0
			left: 0
			width: 100%
			.fixed-title
				height: 30px
				line-height: 30px
				padding-left: 20px
				font-size: $font-size-small
				color: $color-text-l
				background: $color-highlight-background
		.loading-container
			position: absolute
			top: 50%
			width: 100%
			transform: translateY(-50%)
</style>
