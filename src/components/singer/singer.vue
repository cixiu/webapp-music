<template>
	<div class="singer" ref="singer">
		<list-view :data="singers" @select="selectSinger" ref="list"></list-view>
		<router-view></router-view>
	</div>
</template>

<script type="text/ecmascript-6">
	import ListView from 'base/list-view/list-view';
	import {getSingerList} from 'api/singer';
	import {ERR_OK} from 'api/config';
	import Singer from 'common/js/singer';
	import {mapMutations} from 'vuex';
	import {playListMixin} from 'common/js/mixin';

	let HOT_NAME = '热门';
	let HOT_SINGER_LENGTH = 10;

	export default {
		mixins: [playListMixin],
		data() {
			return {
				singers: []
			};
		},
		created() {
			this._getSingerList();
		},
		methods: {
			handlePlayList(playList) {
				const bottom = playList.length > 0 ? '60px' : '';
				this.$refs.singer.style.bottom = bottom;
				this.$refs.list.refresh();
			},
			selectSinger(singer) {
				this.$router.push({
					path: `/singer/${singer.id}`
				});
				this.setSinger(singer);
			},
			// 获取歌手列表数据
			_getSingerList() {
				getSingerList().then((response) => {
					if (response.code === ERR_OK) {
						this.singers = this._normalizeSingers(response.data.list);
					}
				});
			},
			// 处理歌手列表数据为有序数据
			_normalizeSingers(list) {
				let map = {
					hot: {
						title: HOT_NAME,
						items: []
					}
				};
				list.forEach(item => {
					if (item.Fsort <= HOT_SINGER_LENGTH) {
						map.hot.items.push(new Singer({
							id: item.Fsinger_mid,
							name: item.Fsinger_name
						}));
					}
					const key = item.Findex;
					if (!map[key]) {
						map[key] = {
							title: key,
							items: []
						};
					}
					map[key].items.push(new Singer({
						id: item.Fsinger_mid,
						name: item.Fsinger_name
					}));
				});

				// 为了得到有序的数据，我们还需要处理map
				let hot = [];
				let ret = [];
				for (let key in map) {
					let value = map[key];
					if (value.title.match(/[a-zA-Z]/)) {
						ret.push(value);
					} else if (value.title === HOT_NAME) {
						hot.push(value);
					}
				}
				// 给字母序列排序
				ret.sort((a, b) => {
					return a.title.charCodeAt(0) - b.title.charCodeAt(0);
				});
				return hot.concat(ret);
			},
			...mapMutations({
				setSinger: 'SET_SINGER'
			})
		},
		components: {
			ListView
		}
	};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	.singer
		position: fixed
		width: 100%
		top: 88px
		left: 0
		bottom: 0
</style>