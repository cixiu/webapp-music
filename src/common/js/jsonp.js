/*
原生的jsonp库见： https://github.com/webmodules/jsonp
jsonp(url, opts, fn)
	url (String) url to fetch
	opts (Object), optional
		param (String) name of the query string parameter to specify the callback (defaults to callback)
		timeout (Number) how long after a timeout error is emitted. 0 to disable (defaults to 60000)
		prefix (String) prefix for the global callback functions that handle jsonp responses (defaults to __jp)
		name (String) name of the global callback functions that handle jsonp responses (defaults to prefix + incremented counter)
	fn callback
The callback is called with err, data parameters.
*/
import originJSONP from 'jsonp';

export default function jsonp(url, data, option) {
	// url拼接
	url += (url.indexOf('?') < 0 ? '?' : '&') + param(data);
	
	return new Promise((resolve, reject) => {
		originJSONP(url, option, (err, data) => {
			if (!err) {
				resolve(data);
			} else {
				reject(err);
			}
		});
	});
};

function param(data) {
	let url = '';
	for (var key in data) {
		let value = data[key] !== undefined ? data[key] : '';
		url += `&${key}=${encodeURIComponent(value)}`;
	};
	return url ? url.substring(1) : '';
}
