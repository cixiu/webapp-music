import {mapGetters} from 'vuex';

export const playListMixin = {
	computed: {
		...mapGetters([
			'playList'
		])
	},
	mounted() {
		this.handlePlayList(this.playList);
	},
	activated() {
		this.handlePlayList(this.playList);
	},
	methods: {
		handlePlayList() {
			throw new Error('component must implement handlePlayList methods');
		}
	},
	watch: {
		playList(newVal) {
			this.handlePlayList(newVal);
		}
	}
};
