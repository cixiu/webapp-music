<template>
	<div class="rank" ref="rank">
		<scroll class="toplist" :data="topList" ref="topList">
			<ul>
				<li class="item" v-for="item in topList" @click="selectItem(item)">
					<div class="icon">
						<img width="100" height="100" v-lazy="item.picUrl">
					</div>
					<ul class="songlist">
						<li class="song" v-for="(song, index) in item.songList">
							<span>{{ index + 1 }}</span>
							<span>{{ song.songname }} - {{ song.singername }}</span>
						</li>
					</ul>
				</li>
			</ul>
			<div class="loading-container" v-show="!topList.length">
				<loading></loading>
			</div>
		</scroll>
		<router-view></router-view>	
	</div>
</template>

<script type="text/ecmascript-6">
	import {getTopList} from 'api/rank';
	import {ERR_OK} from 'api/config';
	import Scroll from 'base/scroll/scroll';
	import Loading from 'base/loading/loading';
	import {playListMixin} from 'common/js/mixin';
	import {mapMutations} from 'vuex';

	export default {
		mixins: [playListMixin],
		data() {
			return {
				topList: []
			};
		},
		created() {
			this._getTopList();
		},
		methods: {
			handlePlayList(playList) {
				const bottom = playList.length > 0 ? '60px' : '';
				this.$refs.rank.style.bottom = bottom;
				this.$refs.topList.refresh();
			},
			selectItem(item) {
				this.$router.push({
					path: `/rank/${item.id}`
				});
				this.setTopList(item);
			},
			// 获取排行榜数据
			_getTopList() {
				getTopList().then((response) => {
					if (response.code === ERR_OK) {
						this.topList = response.data.topList;
					}
				});
			},
			...mapMutations({
				setTopList: 'SET_TOP_LIST'
			})
		},
		components: {
			Scroll,
			Loading
		}
	};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	@import '../../common/stylus/variable.styl'
	@import '../../common/stylus/mixin.styl'

	.rank
		position: fixed
		top: 88px
		left: 0
		bottom: 0
		width: 100%
		.toplist
			height: 100%
			overflow: hidden
			.item
				display: flex
				margin: 0 20px
				padding-top: 20px
				height: 100px
				&:last-child
					padding-bottom: 20px
				.icon
					flex: 0 0 100px
					width: 100px
					height: 100px
				.songlist
					flex: 1
					padding: 0 20px
					display: flex
					flex-direction: column
					justify-content: center
					height: 100px
					overflow: hidden
					background: $color-highlight-background
					color: $color-text-d
					font-size: $font-size-small
					.song
						line-height: 26px
						no-wrap()
			.loading-container
				position: absolute
				top: 50%
				width: 100%
				transform: translateY(-50%)
</style>