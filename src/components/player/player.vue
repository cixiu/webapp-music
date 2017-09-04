<template>
	<div class="player" v-show="playList.length > 0">
		<transition 
					name="normal"
					@enter="enter"
					@after-enter="afterEnter"
					@leave="leave"
					@after-leave="afterLeave"
		>
			<div class="normal-player" v-show="fullScreen">
				<div class="background">
					<img width="100%" height="100%" :src="currentSong.image">
				</div>
				<div class="top">
					<div class="back" @click="back">
						<i class="icon-back"></i>
					</div>
					<h1 class="title" v-html="currentSong.name"></h1>
					<h2 class="subtitle" v-html="currentSong.singer"></h2>
				</div>
				<div 
					class="middle"
					@touchstart="middleTouchStart"
					@touchmove="middleTouchMove"
					@touchend="middleTouchEnd"
				>
					<div class="middle-l" ref="middle">
						<div class="cd-wrapper" ref="cdWrapper">
							<div class="cd" :class="cdRotate">
								<img class="image" :src="currentSong.image"></img>
							</div>
						</div>
						<div class="playing-lyric-wrapper">
							<div class="playing-lyric">{{ playingLyric }}</div>
						</div>
					</div>
					<scroll class="middle-r" :data="currentLyric && currentLyric.lines" ref="lyricList">
						<div class="lyric-wrapper">
							<div v-if="currentLyric">
								<p class="text" :class="{current: currentLineNum === index}" v-for="(line, index) in currentLyric.lines" ref="lyricLine">{{ line.txt }}</p>
							</div>
						</div>
					</scroll>
				</div>
				<div class="bottom">
					<div class="dot-wrapper">
						<span class="dot" :class="{active: currentShow === 'cd'}"></span>
						<span class="dot" :class="{active: currentShow === 'lyric'}"></span>
					</div>
					<div class="progress-wrapper">
						<span class="time time-l">{{ format(currentTime) }}</span>
						<div class="progress-bar-wrapper">
							<progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
						</div>
						<span class="time time-r">{{ format(currentSong.duration) }}</span>
					</div>
					<div class="operators">
						<div class="icon i-left" @click="changePlayMode">
							<i :class="iconPlayMode"></i>
						</div>
						<div class="icon i-left" :class="disableCls">
							<i class="icon-prev" @click="prev"></i>
						</div>
						<div class="icon i-center" :class="disableCls">
							<i :class="playIcon" @click="togglePlay"></i>
						</div>
						<div class="icon i-right" :class="disableCls">
							<i class="icon-next" @click="next"></i>
						</div>
						<div class="icon i-right">
							<i class="icon icon-not-favorite"></i>
						</div>
					</div>
				</div>
			</div>
		</transition>
		<transition name="mini">
			<div class="mini-player" v-show="!fullScreen" @click="open">
				<div class="icon">
					<img width="40" height="40" :src="currentSong.image" :class="cdRotate">
				</div>
				<div class="text">
					<h2 class="name" v-html="currentSong.name"></h2>
					<p class="desc" v-html="currentSong.singer"></p>
				</div>
				<div class="control">
					<progress-circle :radius="32" :percent="percent">
						<i class="icon-mini" :class="minPlayIcon" @click.stop="togglePlay"></i>
					</progress-circle>
				</div>
				<div class="control" @click.stop="showPlaylist">
					<i class="icon-playlist"></i>
				</div>
			</div>
		</transition>
		<playlist ref="playlist"></playlist>
		<audio :src="currentSong.url" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end" ref="audio"></audio>
	</div>
</template>

<script type="text/ecmascript-6">
	import {mapGetters, mapMutations, mapActions} from 'vuex';
	import animations from 'create-keyframe-animation';
	import {prefixStyle} from 'common/js/dom';
	import {PlayMode} from 'common/js/config';
	import ProgressBar from 'base/progress-bar/progress-bar';
	import ProgressCircle from 'base/progress-circle/progress-circle';
	import Lyric from 'lyric-parser';
	import Scroll from 'base/scroll/scroll';
	import Playlist from 'components/playlist/playList';
	import {playerMixin} from 'common/js/mixin';

	const transform = prefixStyle('transform');

	export default {
		mixins: [playerMixin],
		data() {
			return {
				songReady: false,
				currentTime: 0,
				currentLyric: null,
				currentLineNum: 0,
				currentShow: 'cd',
				playingLyric: ''
			};
		},
		created() {
			this.touch = {};
		},
		computed: {
			playIcon() {
				return this.playing ? 'icon-pause' : 'icon-play';
			},
			minPlayIcon() {
				return this.playing ? 'icon-pause-mini' : 'icon-play-mini';
			},
			cdRotate() {
				return this.playing ? 'play' : 'play pause';
			},
			disableCls() {
				return this.songReady ? '' : 'disable';
			},
			percent() {
				return this.currentTime / this.currentSong.duration;
			},
			...mapGetters([
				'fullScreen',
				'playing',
				'currentIndex'
			])
		},
		methods: {
			back() {
				this.setFullScreen(false);
			},
			open() {
				this.setFullScreen(true);
			},
			enter(el, done) {
				let {x, y, scale} = this._getPosAndScale();
				// create-keyframe-animation库的具体用法见：https://github.com/HenrikJoreteg/create-keyframe-animation
				// 注册animation
				animations.registerAnimation({
					name: 'move',
					animation: {
						0: {
							transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
						},
						60: {
							transform: `translate3d(0, 0, 0) scale(1.1)`
						},
						100: {
							transform: `translate3d(0, 0, 0) scale(1)`
						}
					},
					presets: {
						duration: 400,
						easing: 'linear'
					}
				});
				// 运行animation
				animations.runAnimation(this.$refs.cdWrapper, 'move', done);
			},
			afterEnter() {
				// 注销animation
				animations.unregisterAnimation('move');
				this.$refs.cdWrapper.style.animation = '';
			},
			leave(el, done) {
				this.$refs.cdWrapper.style.transition = 'all 0.4s';
				const {x, y, scale} = this._getPosAndScale();
				this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
				this.$refs.cdWrapper.addEventListener('transitionend', done);
			},
			afterLeave() {
				this.$refs.cdWrapper.style.transition = '';
				this.$refs.cdWrapper.style[transform] = '';
			},
			togglePlay() {
				if (!this.songReady) {
					return;
				}
				this.setPlayingState(!this.playing);
				if (this.currentLyric) {
					this.currentLyric.togglePlay();
				}
			},
			end() {
				if (this.mode === PlayMode.loop) {
					this.loop();
				} else {
					this.next();
				}
			},
			loop() {
				this.$refs.audio.currentTime = 0;
				this.$refs.audio.play();
				if (this.currentLyric) {
					this.currentLyric.seek(0);
				}
			},
			next() {
				if (!this.songReady) {
					return;
				}
				if (this.playList.length === 1) {
					this.loop();
				} else {
					let index = this.currentIndex + 1;
					if (index === this.playList.length) {
						index = 0;
					}
					this.setCurrentIndex(index);
					if (!this.playing) {
						this.togglePlay();
					}
				}
				this.songReady = false;
			},
			prev() {
				if (!this.songReady) {
					return;
				}
				if (this.playList.length === 1) {
					this.loop();
				} else {
					let index = this.currentIndex - 1;
					if (index === -1) {
						index = this.playList.length - 1;
					}
					this.setCurrentIndex(index);
					if (!this.playing) {
						this.togglePlay();
					}
				}
				this.songReady = false;
			},
			ready() {
				this.songReady = true;
				this.savePlayHistory(this.currentSong);
			},
			error() {
				this.songReady = true;
			},
			updateTime(e) {
				this.currentTime = e.target.currentTime;
			},
			format(interval) {
				interval = interval | 0;
				const minutes = interval / 60 | 0;
				const seconds = this._pad(interval % 60);
				return `${minutes}:${seconds}`;
			},
			onProgressBarChange(percent) {
				const currentTime = percent * this.currentSong.duration;
				this.$refs.audio.currentTime = currentTime;
				if (!this.playing) {
					this.togglePlay();
				}
				if (this.currentLyric) {
					this.currentLyric.seek(currentTime * 1000);
				}
			},
			// 获取歌词
			getLyric() {
				this.currentSong.getLyric().then((lyric) => {
					this.currentLyric = new Lyric(lyric, this.handleLyric);
					if (this.playing) {
						this.currentLyric.play();
					}
				}).catch(() => {
					this.currentLyric = null;
					this.playingLyric = '';
					this.currentLineNum = 0;
				});
			},
			// 歌词滚动到相应位置
			handleLyric({lineNum, txt}) {
				this.currentLineNum = lineNum;
				if (lineNum > 5) {
					let lineEl = this.$refs.lyricLine[lineNum - 5];
					this.$refs.lyricList.scrollToElement(lineEl, 1000);
				} else {
					this.$refs.lyricList.scrollTo(0, 0, 1000);
				}
				this.playingLyric = txt;
			},
			middleTouchStart(e) {
				this.touch.initial = true;
				// 判断是否是移动
				this.touch.moved = false;
				this.touch.startX = e.touches[0].pageX;
				this.touch.startY = e.touches[0].pageY;
			},
			middleTouchMove(e) {
				if (!this.touch.initial) {
					return;
				}
				const deltaX = e.touches[0].pageX - this.touch.startX;
				const deltaY = e.touches[0].pageY - this.touch.startY;
				if (Math.abs(deltaY) > Math.abs(deltaX)) {
					return;
				}
				// 当在y方向移动大于x方向时this.touch.moved依旧为false
				if (!this.touch.moved) {
					this.touch.moved = true;
				}

				const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
				const width = Math.min(0, Math.max(-window.innerWidth, left + deltaX));
				this.touch.percent = Math.abs(width / window.innerWidth);
				this.$refs.lyricList.$el.style[transform] = `translate3d(${width}px, 0, 0)`;
				this.$refs.lyricList.$el.style.transition = ``;
				this.$refs.middle.style.opacity = 1 - this.touch.percent;
				this.$refs.middle.style.transition = ``;
			},
			middleTouchEnd(e) {
				// 当在y方向移动大于x方向时this.touch.moved依旧为false  解决在y方向滑动时抬起手指或者鼠标歌词向x方向移动的bug
				if (!this.touch.moved) {
					return;
				}

				let width = 0;
				let opacity = 0;
				if (this.currentShow === 'cd') {
					if (this.touch.percent > 0.1) {
						width = -window.innerWidth;
						this.currentShow = 'lyric';
						opacity = 0;
					} else {
						width = 0;
						opacity = 1;
					}
				} else {
					if (this.touch.percent < 0.9) {
						width = 0;
						this.currentShow = 'cd';
						opacity = 1;
					} else {
						width = -window.innerWidth;
						opacity = 0;
					}
				}
				const time = 400;
				this.$refs.lyricList.$el.style[transform] = `translate3d(${width}px, 0, 0)`;
				this.$refs.lyricList.$el.style.transition = `${time}ms`;
				this.$refs.middle.style.opacity = opacity;
				this.$refs.middle.style.transition = `${time}ms`;
			},
			showPlaylist() {
				this.$refs.playlist.show();
			},
			_pad(num, n = 2) {
				let len = num.toString().length;
				while (len < n) {
					num = '0' + num;
					len++;
				}
				return num;
			},
			_getPosAndScale() {
				const targetWidth = 40;
				const paddingLeft = 40;
				const paddingBottom = 30;
				const paddingTop = 80;
				const width = window.innerWidth * 0.8;
				const x = -(window.innerWidth / 2 - paddingLeft);
				const y = window.innerHeight - paddingTop - paddingBottom - width / 2;
				const scale = targetWidth / width;
				return {x, y, scale};
			},
			...mapMutations({
				setFullScreen: 'SET_FULL_SCREEN'
			}),
			...mapActions([
				'savePlayHistory'
			])
		},
		watch: {
			currentSong(newSong, oldSong) {
				if (!newSong.id) {
					return;
				}
				if (newSong.id === oldSong.id) {
					return;
				}
				if (this.currentLyric) {
					this.currentLyric.stop();
				}
				clearTimeout(this.timer);
				this.timer = setTimeout(() => {
					this.$refs.audio.play();
					this.getLyric();
				}, 1000);
			},
			playing(newPlaying) {
				const audio = this.$refs.audio;
				this.$nextTick(() => {
					newPlaying ? audio.play() : audio.pause();
				});
			}
		},
		components: {
			ProgressBar,
			ProgressCircle,
			Scroll,
			Playlist
		}
	};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	@import '../../common/stylus/variable.styl'
	@import '../../common/stylus/mixin.styl'
	
	.player
		.normal-player
			position: fixed
			top: 0
			right: 0
			bottom: 0
			left: 0
			z-index: 150
			background: $color-background
			.background
				position: absolute
				top: 0
				left: 0
				z-index: -1
				width: 100%
				height: 100%
				opacity: 0.6
				filter: blur(20px)
			.top
				position: relative
				margin-bottom: 25px
				.back
					position: absolute
					top: 0
					left: 6px
					z-index: 50
					.icon-back
						display: block
						padding: 9px
						font-size: $font-size-large-x
						color: $color-theme
						transform: rotate(-90deg)
				.title
					width: 70%
					margin: 0 auto
					line-height: 40px
					text-align: center
					font-size: $font-size-large
					color: $color-text
					no-wrap()
				.subtitle
					line-height: 20px
					text-align: center
					font-size: $font-size-medium
					color: $color-text
			.middle
				position: fixed
				top: 80px
				left: 0
				bottom: 170px
				width: 100%
				white-space: nowrap
				font-size: 0
				.middle-l
					display: inline-block
					vertical-align: top
					position: relative
					width: 100%
					height: 0
					padding-top: 80%
					.cd-wrapper
						position: absolute
						top: 0
						left: 10%
						width: 80%
						height: 100%
						.cd
							width: 100%
							height: 100%
							box-sizing: border-box
							border: 10px solid rgba(255, 255, 255, 0.1)
							border-radius: 50%
							&.play
								animation: rotate 20s linear infinite
							&.pause
								animation-play-state: paused
							.image
								position: absolute
								top: 0
								left: 0
								width: 100%
								height: 100%
								border-radius: 50%
					.playing-lyric-wrapper
						width: 80%
						margin: 30px auto 0 auto
						text-align: center
						overflow: hidden
						.playing-lyric
							height: 20px
							line-height: 20px
							font-size: $font-size-medium
							color: $color-text-l
				.middle-r
					display: inline-block
					vertical-align: top
					width: 100%
					height: 100%
					overflow: hidden
					.lyric-wrapper
						width: 80%
						margin: 0 auto
						text-align: center
						overflow: hidden
						.text
							line-height: 32px
							color: $color-text-l
							font-size: $font-size-medium
							&.current
								color: $color-text
			.bottom
				position: absolute
				bottom: 50px
				width: 100%
				.dot-wrapper
					text-align: center
					font-size: 0
					.dot
						display: inline-block
						vertical-align: middle
						margin: 0 4px
						width: 8px
						height: 8px
						border-radius: 50%
						background: $color-text-l
						&.active
							width: 20px
							border-radius: 5px
							background: $color-text-ll
				.progress-wrapper
					display: flex
					align-items: center
					width: 80%
					padding: 10px 0
					margin: 0 auto
					.time
						flex: 0 0 30px
						width: 30px
						line-height: 30px
						font-size: $font-size-small
						color: $color-text
						&.time-l
							text-align: left
						&.time-r
							text-align: right
					.progress-bar-wrapper
						flex: 1
				.operators
					display: flex
					align-items: center
					.icon
						flex: 1
						color: $color-theme
						&.disable
							color: $color-theme-d
						i
							font-size: 30px
					.i-left
						text-align: right
					.i-center
						padding: 0 20px
						text-align: center
						i
							font-size: 40px
					.i-right
						text-align: left
						.icon-favorite
							color: $color-sub-theme
			&.normal-enter, &.normal-leave-active
				opacity: 0
				.top
					transform: translate3d(0, -100px, 0)
				.bottom
					transform: translate3d(0, 100px, 0)
			&.normal-enter-active, &.normal-leave-active
				transition: all 0.4s
				.top, .bottom
					transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
		.mini-player
			display: flex
			align-items: center
			position: fixed
			bottom: 0
			left: 0
			z-index: 180
			width: 100%
			height: 60px
			background: $color-highlight-background
			&.mini-enter, &.mini-leave-active
				opacity: 0
			&.mini-enter-active, &.mini-leave-active
				transition: all 0.4s
			.icon
				flex: 0 0 40px
				width: 40px
				padding: 0 10px 0 20px
				img
					border-radius: 50%
					&.play
						animation: rotate 20s linear infinite
					&.pause
						animation-play-state: paused
			.text
				flex: 1
				display: flex
				flex-direction: column
				justify-content: center
				line-height: 20px
				overflow: hidden
				.name
					margin-bottom: 2px
					font-size: $font-size-medium
					color: $color-text
					no-wrap()
				.desc
					font-size: $font-size-small
					color: $color-text-d
					no-wrap()
			.control
				flex: 0 0 30px
				width: 30px
				padding: 0 10px
				.icon-play-mini, .icon-pause-mini, .icon-playlist
					font-size: 30px
					color: $color-theme-d
				.icon-mini
					position: absolute
					top: 0
					left: 0
					font-size: 32px
		@keyframes rotate
			0%
				transform: rotate(0)
			100%
				transform: rotate(360deg)
</style>
