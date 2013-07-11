peppercms
=========

A utility library that fetches a Google Spreadsheet as a JSON Object and parses it for later use. 

Prerequisites
-----------
The spreadsheet should be published to the web (On google docs `File > Publish to Web`).
After cloning the repository use `bower install` to install the dependencies. 

Usage
-----
First define your schema by defining the column names and their types. You can use `'string'`, `'int'`, `'float'`, `'arrayOfString'`, `'arrayOfFloat'` or `'arrayOfInt'`.
In the spreadseet, arrays are written as `value1,value2,value3`. See the sample [here.](https://docs.google.com/spreadsheet/ccc?key=0Aqv3NjQVGHDbdDdxOTRzZzRFdmJWb0owV1FPdDI1bUE)
```javascript
var schema = {
	'Name': 'string',
	'Age': 'int',
	'Favorite Colors': 'arrayOfString',
	'GPA': 'float' 
}
```
Then feed it to the constructor along with your Google Spreadsheet URL.

```javascript
var cms = pepper("MY-SPREADSHEET-URL", schema);
```
To sync the local object with the Spreadsheet, use the `sync` method. `sync` returns a [Promise](http://wiki.commonjs.org/wiki/Promises/A) so you can use `then` when the fetching is done.
```javascript
cms.sync()
.then(function(data) {
	console.log(data);
}
.fail(function (error) {
	console.log("Failed to sync: "+ error);
});
```

API
----
```javascript
pepper(id,schema)			Constructor
pepper.sync()				Fetch data from Spreadsheet
pepper.getCollection()		Getter for local data object parsed using schema
pepper.getSchema()			Getter for schema
pepper.getKey()				Getter for key
```
