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
	else {
	    config.json = params;
	    headers['Content-type'] = 'application/json';
	}

	_httpRequest(config,
		     function (error, response, body) {
			 if (error)
			     return reject(error);

			 if (response.statusCode < 200 || response.statusCode >= 300)
				 return reject(body);

             if (typeof body !== 'string')
                return resolve(body);

			 if (parseJson) {
			     try {
					 return resolve(JSON.parse(body));
			     } catch (e) {
                     e.failedData = body;
					 return reject(e);
			     }
             } else
			     return resolve(body);
		     });
    });
}

function extractSubjectObject(desc, tmpl) {
	function escapeRegExp(str) {
		// http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	var regex = escapeRegExp(tmpl).replace(/%%.+?%%/g, "(.+)");

	var current = 0;
	return desc.match(regex).slice(1);
}


module.exports.request = httpRequest;
module.exports.extractSubjectObject = extractSubjectObject;

