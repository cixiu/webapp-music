import {PlayMode} from 'common/js/config';
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache';

const state = {
	singer: {},
	playing: false,
	fullScreen: false,
	playList: [],
	sequenceList: [],
	mode: PlayMode.sequence,
	currentIndex: -1,
	disc: {},
	topList: {},
	searchHistory: loadSearch(),
	playHistory: loadPlay(),
	favoriteList: loadFavorite()
};

export default state;
