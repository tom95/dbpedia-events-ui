const _httpRequest = require('request');

function httpRequest(method, url, params, parseJson) {
    return new Promise((resolve, reject) => {
	var config = {
	    method: method,
	    url: url
	};

	if (method == 'GET')
	    config.url += '?' + Object.keys(params).map((key) => {
		return querystring.escape(key) + '=' + querystring.escape(params[key]);
	    }).join('&');
	else
	    config.json = params;

	_httpRequest(config,
		     function (error, response, body) {
			 if (error)
			     return reject(error);
			 else if (parseJson)
			     try {
				 return resolve(JSON.parse(body));
			     } catch (e) {
				 return reject(e);
			     }
			 else
			     return resolve(body);
		     });
    }) ;
}

module.exports.request = httpRequest;
