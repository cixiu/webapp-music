<template>
	<scroll 
			class="suggest" 
			:data="result" 
			:pullup="pullup"
			@scrollToEnd="searchMore"
			ref="suggest"
			:beforeScroll="beforeScroll"
			@beforeScroll="listScroll"
	>
		<ul class="suggest-list">
			<li class="suggest-item" v-for="item in result" @click="selectItem(item)">
				<div class="icon">
					<i :class="getIconCls(item)"></i>
				</div>
				<div class="name">
					<span class="text" v-html="getDisplayName(item)"></span>
				</div>
			</li>
			<loading v-show="hasMore" title=""></loading>
		</ul>
		<div class="no-result-wrapper" v-show="!hasMore && !result.length">
			<no-result title="抱歉，暂无搜索结果！"></no-result>
		</div>
	</scroll>
</template>

<script type="text/ecmascript-6">
	import {search} from 'api/search';
	import {ERR_OK} from 'api/config';
	import {createSong} from 'common/js/song';
	import Scroll from 'base/scroll/scroll';
	import Loading from 'base/loading/loading';
	import Singer from 'common/js/singer';
	import {mapMutations, mapActions} from 'vuex';
	import NoResult from 'base/no-result/no-result';

	const TYPE_SINGER = 'singer';
	const perpage = 20;

	export default {
		data() {
			return {
				page: 1,
				result: [],
				pullup: true,   // 开启下拉加载更多
				hasMore: true,
				beforeScroll: true
			};
		},
		props: {
			query: {
				type: String,
				default: ''
			},
			showSinger: {
				type: Boolean,
				default: true
			}
		},
		methods: {
			getIconCls(item) {
				if (item.type === TYPE_SINGER) {
					return 'icon-mine';
				} else {
					return 'icon-music';
				}
			},
			getDisplayName(item) {
				if (item.type === TYPE_SINGER) {
					return item.singername;
				} else {
					return `${item.name} - ${item.singer}`;
				}
			},
			search() {
				this.page = 1;
				this.hasMore = true;
				this.$refs.suggest.scrollTo(0, 0);
				search(this.query, this.page, this.showSinger, perpage).then((response) => {
					if (response.code === ERR_OK) {
						this.result = this._genResult(response.data);
						this._checkMore(response.data);
					}
				});
			},
			searchMore() {
				if (!this.hasMore) {
					return;
				}
				this.page++;
				search(this.query, this.page, this.showSinger, perpage).then((response) => {
					if (response.code === ERR_OK) {
						this.result = this.result.concat(this._genResult(response.data));
						this._checkMore(response.data);
					}
				});
			},
			selectItem(item) {
				if (item.type === TYPE_SINGER) {
					const singer = new Singer({
						id: item.singermid,
						name: item.singername
					});
					this.$router.push({
						path: `/search/${singer.id}`
					});
					this.setSinger(singer);
				} else {
					this.insertSong(item);
				}
				this.$emit('select');
			},
			listScroll() {
				this.$emit('blurInput');
			},
			refresh() {
				this.$refs.suggest.refresh();
			},
			_checkMore(data) {
				const song = data.song;
				if (!song.list.length || (song.curnum + song.curpage * perpage >= song.totalnum)) {
					this.hasMore = false;
				}
			},
			_genResult(data) {
				let ret = [];
				if (data.zhida && data.zhida.singerid) {
					ret.push({...data.zhida, ...{type: TYPE_SINGER}});
				}
				if (data.song) {
					ret = ret.concat(this._normalizeSongs(data.song.list));
				}
				return ret;
			},
			_normalizeSongs(list) {
				let ret = [];
				list.forEach((musicData) => {
					if (musicData.songid && musicData.albumid) {
						ret.push(createSong(musicData));
					}
				});
				return ret;
			},
			...mapMutations({
				setSinger: 'SET_SINGER'
			}),
			...mapActions([
				'insertSong'
			])
		},
		watch: {
			query() {
				this.search();
			}
		},
		components: {
			Scroll,
			Loading,
			NoResult
		}
	};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	@import '../../common/stylus/variable.styl'
	@import '../../common/stylus/mixin.styl'

	.suggest
		height: 100%
		overflow: hidden
		.suggest-list
			padding: 0 30px
			.suggest-item
				display: flex
				align-items: center
				padding-bottom: 20px
				.icon
					flex: 0 0 30px
					width: 30px
					[class^="icon-"]
						font-size: 14px
						color: $color-text-d
				.name
					flex: 1
					font-size: $font-size-medium
					color: $color-text-d
					overflow: hidden
					.text
						no-wrap()
		.no-result-wrapper
			position: absolute
			top: 50%
			width: 100%
			transform: translateY(-50%)
</style>
