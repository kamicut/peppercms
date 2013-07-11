var pepper = function (gdocsURL, schema) {
	'use strict';
	var that = {},
		_collection = [],
		_key = null,
		_worksheet = 'od6',
		_url = gdocsURL, 
		_schema = schema;
		
	//Get key and worksheet
	(function _getKeyfromURL() {
		var params = _url.slice(_url.indexOf('?') + 1).split('&');
		for(var i = 0; i < params.length; i++) {
			var element = params[i].split('=');
			if (element[0] === 'key') {
				_key = element[1];
			}
			if (element[0] === 'worksheet') {
				_worksheet = element[1];
			}
		}
	})();
	
	(function fixSchemaKeys() {
		var newSchema = {}
		for (var key in _schema) {
			newSchema[key.toLowerCase().replace(/[^a-zA-Z0-9]/g,'')] = _schema[key];
		}
		_schema = newSchema;
	}());
	
	that.sync = function () {	
		function req() {
			var request = new XMLHttpRequest(),
				deferred = Q.defer();
				
			//If key undefined, throw error
			if (!_key || !_worksheet) {
				deferred.reject(new Error("Could not get key from URL"));
				return deferred.promise;
			}
			var url = "https://spreadsheets.google.com/feeds/list/" + _key + "/"+ _worksheet +"/public/values?alt=json";
		    
		    function onload() {
		        if (request.status === 200) {
		            deferred.resolve(request.responseText);
		        } else {
		            deferred.reject(new Error("Status code was " + request.status));
		        }
		    }

		    function onerror() {
		        deferred.reject(new Error("Can't XHR " + JSON.stringify(url)));
		    }	

		    function onprogress(event) {
		        deferred.notify(event.loaded / event.total);
		    }
			
		    request.open("GET", url, true);
			request.onreadystatechange = function () {
	            if (request.readyState === 4) {
	                onload();
	            }
	        };
		    request.onload = request.load = onload;
		    request.onerror = request.error = onerror;
		    request.onprogress = onprogress;
		    request.send();
			
		    return deferred.promise;
		}
	
		function parseData(dataFromSheet) {
			var deferred = Q.defer(),
				output = [];
			
			if (!dataFromSheet) { 
				deferred.reject(new Error("No Data retrieved"));
			}
			
			//Parse 
			var json = JSON.parse(dataFromSheet),
				numEntries = json.feed.entry.length;
			for (var i =0 ;	i<numEntries; i++) {
				var entry = json.feed.entry[i];
				var outEntry = {}, propNames = [];
				if (typeof _schema !== 'object') {
					deferred.rejet(new Error("Schema is not properly defined."))
				} else {
					for (var key in _schema) {
						var prop = 'gsx$' + key;
						if (entry.hasOwnProperty(prop)) {
							var value = entry[prop]['$t'];
							switch(_schema[key].toLowerCase()) {
								case 'int':
									//Strip away any non numerical characters
									value = parseInt(value.replace(/\D/g,''), 10); 
									break;
								case 'float':
									value = parseFloat(value);
									break;
								case 'arrayofstring':
									value = value.split(',');
									break;
								case 'arrayofint':
									value = value.split(',');
									for (var j=0; j<value.length; j++) {
										value[j] = parseInt(value[j]);
									}
									break;
								case 'arrayoffloat':
									value = value.split(',');
									for (var j=0; j<value.length; j++) {
										value[j] = parseFloat(value[j]);
									}
									break;
								case 'string':
									break;
								default:
									deferred.reject('Could not understand format '+_schema[key]);
									break;
							}
							outEntry[key] = value;
						}
					}
				}
				
				output.push(outEntry);
			}
			_collection = output;
			deferred.resolve(_collection);
		
			return deferred.promise;
		}
	
		return req()
		.then(function(data) {
			return parseData(data);
		})
	}

	that.getCollection = function() {
		return _collection;
	}
	
	that.getSchema = function() {
		return _schema;
	}
	
	that.getKey = function() {
		return _key;
	}
	
	return that;
};

