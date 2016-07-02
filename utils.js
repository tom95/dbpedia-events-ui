const _httpRequest = require('request');
const querystring = require('querystring');

function httpRequest(method, url, params, parseJson, headers) {
    return new Promise((resolve, reject) => {
	var config = {
	    method: method,
	    url: url,
		headers: headers || {}
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

			 if (response.statusCode < 200 || response.statusCode >= 300)
				 return reject(body);

			 if (parseJson)
			     try {
					 return resolve(JSON.parse(body));
			     } catch (e) {
					 return reject(e);
			     }
			 else
			     return resolve(body);
		     });
    });
}

module.exports.request = httpRequest;
