# Node-async.js

Node-async is a utility module which provides straight-forward, powerful functions
for working with asynchronous JavaScript in [Node.js](http://nodejs.org).
Node-async is a fork [async.js](https://github.com/caolan/async/) with support object binding.
Module require [ECMAScript Harmony](http://en.wikipedia.org/wiki/ECMAScript#ECMAScript_Harmony_.286th_Edition.29), 
see [this](http://dailyjs.com/2012/10/15/preparing-for-esnext/) for information how to enable Harmony in Node.js.


## Binding Examples

By default `require('node-async')` return instance that binded to empty object.
For binding to custom object use method `.get(object)`, it's returned new instance
which will have `object` as context.

```javascript
var nasync = require( 'node-async' );
var obj = {
    data: [],
	numb: 0
};
nasync.get(obj).waterfall([
	function( callback ) {
		this.data.push( 'one' );
		callback( undefined, 'two', 'three' );
	},
	function( arg1, arg2, callback ) {
		this.data.push([ arg1, arg2 ]);
		this.numb = 10;
		callback( undefined, console.log );
	}
], function( err, log ) {
	log( this.data ); // printed "[ 'one', [ 'two', 'three' ] ]"
	log( this.numb ); // printed "10"
});
```

## Documentation

For documentation see [async documentation](https://github.com/caolan/async/#documentation).

### Collections

* [each](https://github.com/caolan/async/#each)
* [eachSeries](https://github.com/caolan/async/#eachSeries)
* [eachLimit](https://github.com/caolan/async/#eachLimit)
* [map](https://github.com/caolan/async/#map)
* [mapSeries](https://github.com/caolan/async/#mapSeries)
* [mapLimit](https://github.com/caolan/async/#mapLimit)
* [filter](https://github.com/caolan/async/#filter)
* [filterSeries](https://github.com/caolan/async/#filterSeries)
* [reject](https://github.com/caolan/async/#reject)
* [rejectSeries](https://github.com/caolan/async/#rejectSeries)
* [reduce](https://github.com/caolan/async/#reduce)
* [reduceRight](https://github.com/caolan/async/#reduceRight)
* [detect](https://github.com/caolan/async/#detect)
* [detectSeries](https://github.com/caolan/async/#detectSeries)
* [sortBy](https://github.com/caolan/async/#sortBy)
* [some](https://github.com/caolan/async/#some)
* [every](https://github.com/caolan/async/#every)
* [concat](https://github.com/caolan/async/#concat)
* [concatSeries](https://github.com/caolan/async/#concatSeries)

### Control Flow

* [series](https://github.com/caolan/async/#series)
* [parallel](https://github.com/caolan/async/#parallel)
* [parallelLimit](https://github.com/caolan/async/#parallellimittasks-limit-callback)
* [whilst](https://github.com/caolan/async/#whilst)
* [doWhilst](https://github.com/caolan/async/#doWhilst)
* [until](https://github.com/caolan/async/#until)
* [doUntil](https://github.com/caolan/async/#doUntil)
* [forever](https://github.com/caolan/async/#forever)
* [waterfall](https://github.com/caolan/async/#waterfall)
* [compose](https://github.com/caolan/async/#compose)
* [applyEach](https://github.com/caolan/async/#applyEach)
* [applyEachSeries](https://github.com/caolan/async/#applyEachSeries)
* [queue](https://github.com/caolan/async/#queue)
* [cargo](https://github.com/caolan/async/#cargo)
* [auto](https://github.com/caolan/async/#auto)
* [iterator](https://github.com/caolan/async/#iterator)
* [apply](https://github.com/caolan/async/#apply)
* [nextTick](https://github.com/caolan/async/#nextTick)
* [times](https://github.com/caolan/async/#times)
* [timesSeries](https://github.com/caolan/async/#timesSeries)

### Utils

* [memoize](https://github.com/caolan/async/#memoize)
* [unmemoize](https://github.com/caolan/async/#unmemoize)
* [log](https://github.com/caolan/async/#log)
* [dir](https://github.com/caolan/async/#dir)
* info
* warn
* error

