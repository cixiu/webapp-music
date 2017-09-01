import {PlayMode} from 'common/js/config';

const state = {
	singer: {},
	playing: false,
	fullScreen: false,
	playList: [],
	sequenceList: [],
	mode: PlayMode.sequence,
	currentIndex: -1
};

export default state;
