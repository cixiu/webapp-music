import jsonp from 'common/js/jsonp';
import {commonParams, options} from 'api/config';
// import axios from 'axios';

export function getTopList() {
	const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg';

	const data = Object.assign({}, commonParams, {
		uin: 0,
		platform: 'h5',
		needNewCode: 1,
		_: +new Date()
	});

	return jsonp(url, data, options);
}

export function getMusicList(topid) {
	const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg';

	const data = Object.assign({}, commonParams, {
		uin: 0,
		platform: 'h5',
		needNewCode: 1,
		type: 'top',
		tpl: 3,
		page: 'detail',
		topid,
		_: +new Date()
	});

	return jsonp(url, data, options);
}
