<template>
	<transition name="slide">
		<music-list :songs="songs" :title="title" :bg-image="bgImage" :rank="rank"></music-list>
	</transition>
</template>

<script type="text/ecmascript-6">
	import MusicList from 'components/music-list/music-list';
	import {mapGetters} from 'vuex';
	import {getMusicList} from 'api/rank';
	import {ERR_OK} from 'api/config';
	import {createSong} from 'common/js/song';

	export default {
		data() {
			return {
				songs: [],
				rank: true
			};
		},
		created() {
			this._getMusicList();
		},
		computed: {
			title() {
				return this.topList.topTitle;
			},
			bgImage() {
				if (this.songs.length) {
					return this.songs[0].image;
				}
				return '';
			},
			...mapGetters([
				'topList'
			])
		},
		methods: {
			_getMusicList() {
				if (!this.topList.id) {
					this.$router.push('/rank');
					return;
				}
				getMusicList(this.topList.id).then((response) => {
					if (response.code === ERR_OK) {
						this.songs = this._normalizeSongs(response.songlist);
						console.log(this.songs);
					}
				});
			},
			_normalizeSongs(list) {
				let ret = [];
				list.forEach((item) => {
					let musicData = item.data;
					if (musicData.songid && musicData.albumid) {
						ret.push(createSong(musicData));
					}
				});
				return ret;
			}
		},
		components: {
			MusicList
		}
	};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	.slide-enter, .slide-leave-active
		transform: translate3d(100%, 0, 0)
	.slide-enter-active, .slide-leave-active
		transition: all 0.5s
</style>
