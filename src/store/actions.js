import * as types from './mutations-types';
import {PlayMode} from 'common/js/config';
import {shuffle} from 'common/js/util';

function findIndex(list, song) {
	return list.findIndex((item) => {
		return item.id === song.id;
	});
}

export const actions = {
	selectPlay({commit, state}, {list, index}) {
		// 如果在随机播发的模式中，歌曲列表中再次点击了某一首歌曲，应该再次重新更新随机播发的歌单列表
		if (state.mode === PlayMode.random) {
			let randomList = shuffle(list);
			commit(types.SET_PLAY_LIST, randomList);
			index = findIndex(randomList, list[index]);
		} else {
			commit(types.SET_PLAY_LIST, list);
		}
		commit(types.SET_SEQUENCE_LIST, list);
		commit(types.SET_FULL_SCREEN, true);
		commit(types.SET_CURRENT_INDEX, index);
		commit(types.SET_PLAYING_STATE, true);
	},
	randomPlay({commit}, {list}) {
		commit(types.SET_PLAY_MODE, PlayMode.random);
		commit(types.SET_SEQUENCE_LIST, list);
		let randomList = shuffle(list);
		commit(types.SET_PLAY_LIST, randomList);
		commit(types.SET_FULL_SCREEN, true);
		commit(types.SET_CURRENT_INDEX, 0);
		commit(types.SET_PLAYING_STATE, true);
	}
};

export default actions;
