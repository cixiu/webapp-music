<template>
	<div class="recommend" ref="recommend">
		<scroll ref="scroll" class="recommend-content" :data="discList">
			<div>
				<div v-if="recommends.length" class="slider-wrapper">
					<slider>
						<div v-for="item in recommends">
							<a :href="item.linkUrl">
								<img @load="imgLoad" :src="item.picUrl">
							</a>
						</div>
					</slider>
				</div>
				<div class="recommend-list">
					<h1 class="list-title">热门歌单推荐</h1>
					<ul>
						<li class="item" v-for="(item, index) in discList" @click="selectItem(item)">
							<div class="icon">
								<img width="60" height="60" v-lazy="item.imgurl">
							</div>
							<div class="text">
								<h2 class="name" v-html="item.dissname"></h2>
								<p class="desc" v-html="item.creator.name"></p>
								<span class="listen-num">播放量: {{ (item.listennum / 10000).toFixed(1) }}万</span>
							</div>
						</li>
					</ul>
				</div>
			</div>
			<div class="loading-container" v-show="!discList.length">
				<loading></loading>
			</div>
		</scroll>
		<router-view></router-view>
	</div>
</template>

<script type="text/ecmascript-6">
	import Slider from 'base/slider/slider';
	import Scroll from 'base/scroll/scroll';
	import Loading from 'base/loading/loading';
	import {getRecommend, getDiscList} from 'api/recommend';
	import {ERR_OK} from 'api/config';
	import {playListMixin} from 'common/js/mixin';
	import {mapMutations} from 'vuex';

	export default {
		mixins: [playListMixin],
		data() {
			return {
				recommends: [],
				discList: []
			};
		},
		created() {
			this._getRecommend();
			this._getDiscList();
		},
		methods: {
			handlePlayList(playList) {
				const bottom = playList.length > 0 ? '60px' : 0;
				this.$refs.recommend.style.bottom = bottom;
				this.$refs.scroll.refresh();
			},
			selectItem(item) {
				this.$router.push({
					path: `/recommend/${item.dissid}`
				});
				this.setDisc(item);
			},
			// 获取轮播图数据
			_getRecommend() {
				getRecommend().then((response) => {
					if (response.code === ERR_OK) {
						this.recommends = response.data.slider;
					}
				});
			},
			// 获取歌单推荐数据
			_getDiscList() {
				getDiscList().then((response) => {
					if (response.code === ERR_OK) {
						this.discList = response.data.list;
					}
				});
			},
			// 因为getRecommend的数据是异步的 我们不能保证getRecommend一定比getDiscList请求要早
			// 如果getRecommend请求比getDiscList要晚，那么在scroll组件中计算的better-scroll高度就
			// 会少了getRecommend数据渲染的DOM高度, 因此：在请求到getRecommend数据渲染imgage的时候
			// 再次更新better-scroll，使其重新计算高度
			imgLoad() {
				if (!this.checkLoaded) {
					this.$refs.scroll.refresh();
					this.checkLoaded = true;
				}
			},
			...mapMutations({
				setDisc: 'SET_DISC'
			})
		},
		components: {
			Slider,
			Scroll,
			Loading
		}
	};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	@import '../../common/stylus/variable.styl'
	@import '../../common/stylus/mixin.styl'
	
	.recommend
		position: fixed
		width: 100%
		top: 88px
		left: 0
		bottom: 0
		.recommend-content
			height: 100%
			overflow: hidden
			.slider-wrapper
				position: relative
				width: 100%
				overflow: hidden
			.recommend-list
				.list-title
					height: 65px
					line-height: 65px
					text-align: center
					font-size: $font-size-medium
					color: $color-theme
				.item
					display: flex
					box-sizing: border-box
					align-items: center
					padding: 0 20px 20px 20px
					.icon
						flex: 0 0 60px
						width: 60px
						margin-right: 20px
					.text
						flex: 1
						display: flex
						flex-direction: column
						justify-content: center
						line-height: 20px
						overflow: hidden
						font-size: $font-size-medium
						.name
							color: $color-text
							no-wrap()
						.desc
							color: $color-text-d
						.listen-num
							color: $color-text-d
			.loading-container
				position: absolute
				width: 100%
				top: 50%
				transform: translateY(-50%)
</style>