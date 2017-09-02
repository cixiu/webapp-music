<template>
	<div class="music-list">
		<div class="back" @click="back">
			<i class="icon-back"></i>
		</div>
		<h1 class="title" v-html="title"></h1>
		<div class="bg-image" :style="bgStyle" ref="bgImage">
			<div class="play-wrapper" v-show="songs.length" ref="playWrapper">
				<div class="play" @click="random">
					<i class="icon-play"></i>
					<span class="text">随机播放全部</span>
				</div>
			</div>
			<div class="filter" ref="filter"></div>
		</div>
		<div class="bg-layer" ref="bgLayer"></div>
		<scroll class="list" :data="songs" :probe-type="probeType" :listen-scroll="listenScroll" @scroll="scroll" ref="list">
			<div class="song-list-wrapper">
				<song-list :songs="songs" @select="selectItem" :rank="rank"></song-list>
			</div>
			<div class="loading-container" v-show="!songs.length">
				<loading></loading>
			</div>
		</scroll>
	</div>
</template>

<script type="text/ecmascript-6">
	import Scroll from 'base/scroll/scroll';
	import SongList from 'base/song-list/song-list';
	import Loading from 'base/loading/loading';
	import {prefixStyle} from 'common/js/dom';
	import {mapActions} from 'vuex';
	import {playListMixin} from 'common/js/mixin';

	const RESERVE_HEIGHT = 40;  // 保留的title的高度
	const transform = prefixStyle('transform');
	const backdrop = prefixStyle('backdrop-filter');

	export default {
		mixins: [playListMixin],
		data() {
			return {
				scrollY: 0
			};
		},
		props: {
			songs: {
				type: Array,
				default: []
			},
			title: {
				type: String,
				default: ''
			},
			bgImage: {
				type: String,
				default: ''
			},
			rank: {
				type: Boolean,
				default: false
			}
		},
		mounted() {
			this.imageHeight = this.$refs.bgImage.clientHeight;
			this.minTranslateY = -this.imageHeight + RESERVE_HEIGHT;
			this.$refs.list.$el.style.top = `${this.imageHeight}px`;
		},
		created() {
			this.probeType = 3;
			this.listenScroll = true;
		},
		computed: {
			bgStyle() {
				return `background-image: url(${this.bgImage})`;
			}
		},
		methods: {
			handlePlayList(playList) {
				const bottom = playList.length > 0 ? '60px' : '';
				this.$refs.list.$el.style.bottom = bottom;
				this.$refs.list.refresh();
			},
			back() {
				this.$router.back();
			},
			scroll(pos) {
				this.scrollY = pos.y;
			},
			selectItem(song, index) {
				this.selectPlay({
					list: this.songs,
					index
				});
			},
			random() {
				this.randomPlay({
					list: this.songs
				});
			},
			...mapActions([
				'selectPlay',
				'randomPlay'
			])
		},
		watch: {
			scrollY(newY) {
				// 上拉效果
				let TranslateY = Math.max(this.minTranslateY, newY);
				this.$refs.bgLayer.style[transform] = `translate3d(0, ${TranslateY}px, 0)`;
				let zIndex = 0;
				if (newY < this.minTranslateY) {
					zIndex = 10;
					this.$refs.bgImage.style.paddingTop = 0;
					this.$refs.bgImage.style.height = `${RESERVE_HEIGHT}px`;
					this.$refs.playWrapper.style.display = 'none';
				} else {
					this.$refs.bgImage.style.paddingTop = '70%';
					this.$refs.bgImage.style.height = 0;
					this.$refs.playWrapper.style.display = '';
				}
				
				// 下拉效果
				let scale = 1;
				let blur = 0;  // 上滑图片背景高斯模糊
				const percent = Math.abs(newY / this.imageHeight);
				if (newY > 0) {
					zIndex = 10;
					scale = 1 + percent;
				} else {
					blur = Math.min(20 * percent, 20);
				}
				this.$refs.bgImage.style.zIndex = zIndex;
				this.$refs.bgImage.style[transform] = `scale(${scale})`;
				this.$refs.filter.style[backdrop] = `blur(${blur}px)`;
			}
		},
		components: {
			Scroll,
			SongList,
			Loading
		}
	};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	@import '../../common/stylus/variable.styl'
	@import '../../common/stylus/mixin.styl'
	
	.music-list
		position: fixed
		top: 0
		right: 0
		bottom: 0
		left: 0
		z-index: 100
		background: $color-background
		.back
			position: absolute
			top: 0
			left: 6px
			z-index: 50
			.icon-back
				display: block
				padding: 10px
				font-size: $font-size-large-x
				color: $color-theme
		.title
			position: absolute
			z-index: 40
			top: 0
			left: 10%
			width: 80%
			line-height: 40px
			text-align: center
			font-size: $font-size-large
			color: $color-text
			no-wrap()
		.bg-image
			position: relative
			width: 100%
			height: 0
			padding-top: 70%
			background-size: cover
			transform-origin: top
			.play-wrapper
				position: absolute
				z-index: 50
				bottom: 20px
				width: 100%
				.play
					box-sizing: border-box
					width: 135px
					padding: 7px 0
					margin: 0 auto
					text-align: center
					border: 1px solid $color-theme
					border-radius: 100px
					color: $color-theme
					font-size: 0
					.icon-play
						display: inline-block
						vertical-align: middle
						margin-right: 6px
						font-size: $font-size-medium-x
					.text
						display: inline-block
						vertical-align: middle
						font-size: $font-size-small
			.filter
				position: absolute
				top: 0
				left: 0
				width: 100%
				height: 100%
				background: rgba(7, 17, 27, 0.4)
		.bg-layer
			position: relative
			height: 100%
			background: $color-background
		.list
			position: fixed
			top: 0
			bottom: 0
			width: 100%
			background: $color-background
			// overflow: hidden
			.song-list-wrapper
				padding: 20px 30px
			.loading-container
				position: absolute
				top: 50%
				width: 100%
				transform: translateY(-50%)
</style>
