import * as types from './mutations-types';
import {PlayMode} from 'common/js/config';
import {shuffle} from 'common/js/util';
import {saveSearch, deleteSearch, clearSearch, savePlay} from 'common/js/cache';

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
	},
	insertSong({commit, state}, song) {
		let playList = state.playList.slice();
		let sequenceList = state.sequenceList.slice();
		let currentIndex = state.currentIndex;
		// 记录当前歌曲
		let currentSong = playList[currentIndex];
		// 查询当前播发的歌曲列表是否有待插入的歌曲并返回其索引
		let fpIndex = findIndex(playList, song);
		// 因为时插入歌曲 所以索引+1
		currentIndex++;
		// 插入这首歌到当前位置
		playList.splice(currentIndex, 0, song);
		// 如果播放列表已经包含了这首要插入的歌
		if (fpIndex > -1) {
			// 当要插入的这首歌的序号大于原播放列表里的序号时 则删除掉原来的歌曲
			if (currentIndex > fpIndex) {
				playList.splice(fpIndex, 1);
				currentIndex--;
			} else {  // 当要插入的这首歌的序号小于原播放列表里的序号时 则删除掉原来的歌曲
				playList.splice(fpIndex + 1, 1);
			}
		}

		// 记录当前播放歌曲在顺序播放列表中的位置，并且在这个位置之后需要插入待插入的歌曲
		let currentSIndex = findIndex(sequenceList, currentSong) + 1;
		// 查询顺序播放歌曲列表是否有待插入的歌曲并返回其索引
		let fsIndex = findIndex(sequenceList, song);
		// 在当前顺序播放列表中的当前播放歌曲之后插入待插入的歌曲
		sequenceList.splice(currentSIndex, 0, song);
		// 如果顺序播放列表已经包含了这首要插入的歌
		if (fsIndex > -1) {
			// 当要插入的这首歌的序号大于原顺序播放列表里的序号时 则删除掉原来的歌曲
			if (currentSIndex > fsIndex) {
				sequenceList.splice(fsIndex, 1);
			} else {  // 当要插入的这首歌的序号小于原顺序播放列表里的序号时 则删除掉原来的歌曲
				sequenceList.splice(fsIndex + 1, 1);
			}
		}
		commit(types.SET_PLAY_LIST, playList);
		commit(types.SET_SEQUENCE_LIST, sequenceList);
		commit(types.SET_CURRENT_INDEX, currentIndex);
		commit(types.SET_PLAYING_STATE, true);
		commit(types.SET_FULL_SCREEN, true);
	},
	saveSearchHistory({commit}, query) {
		commit(types.SET_SEARCH_HISTORY, saveSearch(query));
	},
	deleteSearchHistory({commit}, query) {
		commit(types.SET_SEARCH_HISTORY, deleteSearch(query));
	},
	clearSearchHistory({commit}) {
		commit(types.SET_SEARCH_HISTORY, clearSearch());
	},
	deleteSong({commit, state}, song) {
		let playList = state.playList.slice();
		let sequenceList = state.sequenceList.slice();
		let currentIndex = state.currentIndex;
		let pIndex = findIndex(playList, song);
		playList.splice(pIndex, 1);
		let sIndex = findIndex(sequenceList, song);
		sequenceList.splice(sIndex, 1);

		if (currentIndex > pIndex || currentIndex === playList.length) {
			currentIndex--;
		}
		commit(types.SET_PLAY_LIST, playList);
		commit(types.SET_SEQUENCE_LIST, sequenceList);
		commit(types.SET_CURRENT_INDEX, currentIndex);

		if (!playList.length) {
			commit(types.SET_PLAYING_STATE, false);
		} else {
			if (currentIndex === pIndex) {
				commit(types.SET_PLAYING_STATE, true);
			}
		}
	},
	deleteSongList({commit}) {
		commit(types.SET_PLAY_LIST, []);
		commit(types.SET_SEQUENCE_LIST, []);
		commit(types.SET_CURRENT_INDEX, -1);
		commit(types.SET_PLAYING_STATE, false);
	},
	savePlayHistory({commit}, song) {
		commit(types.SET_PLAY_HISTORY, savePlay(song));
	}
};

export default actions;
