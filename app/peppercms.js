var pepper = function (gdocsKey, schema) {
	'use strict';
	var that = {},
		_collection = [], 
		_key = gdocsKey, 
		_schema = schema;

	that.sync = function () {	
		function req() {
			var request = new XMLHttpRequest(),
				deferred = Q.defer(),
				url = "https://spreadsheets.google.com/feeds/list/" + _key + "/od6/public/values?alt=json";
		    
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
			
			//Parse 
			var json = JSON.parse(dataFromSheet),
				numEntries = json.feed.entry.length;
			for (var i =0 ;	i<numEntries; i++) {
				var entry = json.feed.entry[i];
				var outEntry = {}, propNames = [];
				if (typeof _schema.length === 'number') {
					propNames = _schema;
					for (var j = 0; j<propNames.length; j++) {
						var prop = 'gsx$' + propNames[j];
						if (entry.hasOwnProperty(prop)) {
							outEntry[propNames[j]] = entry[prop]['$t'];	
						}
					}
				} else {
					for (var key in _schema) {
						var prop = 'gsx$' + key;
						if (entry.hasOwnProperty(prop)) {
							var value = entry[prop]['$t'];
							switch(_schema[key]) {
								case 'int':
									//Strip away any non numerical characters
									value = parseInt(value.replace(/\D/g,''), 10); 
									break;
								case 'float':
									value = parseFloat(value);
									break;
								case 'arrayOfString':
									value = value.split(',');
									break;
								case 'arrayOfInt':
									value = value.split(',');
									for (var j=0; j<value.length; j++) {
										value[j] = parseInt(value[j]);
									}
									break;
								case 'arrayOfFloat':
									value = value.split(',');
									for (var j=0; j<value.length; j++) {
										value[j] = parseFloat(value[j]);
									}
									break;
							}
							outEntry[key] = value;
						}
					}
				}
				
				output.push(outEntry);
			}
			_collection = output;
			deferred.resolve();
		
			return deferred.promise;
		}
	
		return req()
		.then(function(data) {
			return parseData(data);
		}, function(error) {
			console.log("Request failed: "+error);
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

