import {mapGetters, mapMutations} from 'vuex';
import {PlayMode} from 'common/js/config';
import {shuffle} from 'common/js/util';

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

export const playerMixin = {
	computed: {
		iconPlayMode() {
			return this.mode === PlayMode.sequence ? 'icon-sequence' : this.mode === PlayMode.loop ? 'icon-loop' : 'icon-random';
		},
		...mapGetters([
			'sequenceList',
			'currentSong',
			'mode',
			'playList'
		])
	},
	methods: {
		changePlayMode() {
			const mode = (this.mode + 1) % 3;
			this.setPlayMode(mode);
			let list = null;
			if (mode === PlayMode.random) {
				list = shuffle(this.sequenceList);
			} else {
				list = this.sequenceList;
			}
			this.resetCurrentIndex(list);
			this.setPlayList(list);
		},
		resetCurrentIndex(list) {
			let index = list.findIndex((item) => {
				return item.id === this.currentSong.id;
			});
			this.setCurrentIndex(index);
		},
		...mapMutations({
			setPlayingState: 'SET_PLAYING_STATE',
			setCurrentIndex: 'SET_CURRENT_INDEX',
			setPlayMode: 'SET_PLAY_MODE',
			setPlayList: 'SET_PLAY_LIST'
		})
	}
};
