<template>
	<transition name="slide">
		<music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
	</transition>
</template>

<script type="text/ecmascript-6">
	import MusicList from 'components/music-list/music-list';
	import {mapGetters} from 'vuex';
	import {getSongList} from 'api/recommend';
	import {ERR_OK} from 'api/config';
	import {createSong} from 'common/js/song';

	export default {
		data() {
			return {
				songs: []
			};
		},
		computed: {
			title() {
				return this.disc.dissname;
			},
			bgImage() {
				return this.disc.imgurl;
			},
			...mapGetters([
				'disc'
			])
		},
		created() {
			this._getSongList();
		},
		methods: {
			_getSongList() {
				if (!this.disc.dissid) {
					this.$router.push('/recommend');
					return;
				}
				getSongList(this.disc.dissid).then((response) => {
					if (response.code === ERR_OK) {
						this.songs = this._normalizeSongs(response.cdlist[0].songlist);
						console.log(this.songs);
					}
				});
			},
			_normalizeSongs(list) {
				let ret = [];
				list.forEach((musicData) => {
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
	@import '../../common/stylus/variable.styl'
	
	.singer-detail
		position: fixed
		z-index: 100
		top: 0
		right: 0
		bottom: 0
		left: 0
		background: $color-background
	.slide-enter, .slide-leave-active
		transform: translate3d(100%, 0, 0)
	.slide-enter-active, .slide-leave-active
		transition: all 0.5s
</style>
