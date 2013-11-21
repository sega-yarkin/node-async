'use strict';

let Async = require( '../lib/node-async' );


function TestClass( arg ) {
	this.arg = arg;
	this.two = 2;
	this.param1 = 10;
	this.arr = [];
	this.str = 'hello';
	this.slice = Array.prototype.slice;
}
TestClass.prototype.func1 = function func1( p ) {
	this.param1 = p;
};
TestClass.prototype.func2 = function func2( callback ) {
	callback( undefined, this.arg );
};
TestClass.prototype.addToArr = function addToArr( item, callback ) {
	this.arr.push( item );
	callback();
};
TestClass.prototype.getError = function getError() {
	var callback = arguments[ arguments.length-1 ];
	callback( 'error' );
};
TestClass.prototype.mul2 = function mul2( val, callback ) {
	this.arr.push( val );
	callback( undefined, val*2 );
};
TestClass.prototype.odd = function odd( val, callback ) {
	callback( val % this.two );
};
TestClass.prototype.eqParam1 = function eqParam1( val, callback ) {
	this.arr.push( val );
	callback( val === this.param1 );
};
TestClass.prototype.getTrue = function getTrue( val, callback ) {
	callback( true );
};

let T = new TestClass( {a: 'abc'} );
let async = Async.get( T );

exports['each'] = function(test) {
	T.arr = [];
	async.each( [1,2,3], T.addToArr, function( err ) {
		test.same( this.arr, [1,2,3] );
		test.done();
	});
};
exports['each error'] = function(test){
	test.expect( 2 );
	async.each( [1,2,3], T.getError, function( err ) {
		test.equals( err, 'error' );
		test.equals( this.str, 'hello' );
	});
	setTimeout(test.done, 50);
};
exports['eachSeries'] = function(test){
	T.arr = [];
	async.eachSeries( [1,3,2], T.addToArr, function(err) {
		test.same( T.arr, [1,3,2] );
		test.done();
	});
};
exports['eachSeries error'] = function(test){
	test.expect( 3 );
	T.arr = [];
	async.eachSeries([1,2,3], function(x, callback) {
		this.arr.push(x);
		callback('error');
	}, function(err){
		test.same( this.arr, [1]);
		test.equals( err, 'error' );
		test.equals( this.str, 'hello' );
	});
	setTimeout(test.done, 50);
};

exports['eachLimit'] = function(test){
	T.arr = [];
	var arr = [0,1,2,3,4,5,6,7,8,9];
	async.eachLimit( arr, 2, function(x,callback) {
		var obj = this;
		setTimeout(function(){
			obj.arr.push(x);
			callback();
		}, x*5);
	}, function(err){
		test.same( this.arr, arr );
		test.done();
	});
};
exports['eachLimit error'] = function(test){
	test.expect( 3 );
	T.arr = [];
	var arr = [0,1,2,3,4,5,6,7,8,9];

	async.eachLimit( arr, 3, function(x, callback) {
		this.arr.push(x);
		if (x === 2) {
			callback('error');
		}
	}, function(err){
		test.same( this.arr, [0,1,2] );
		test.equals( err, 'error' );
		test.equals( this.str, 'hello' );
	});
	setTimeout(test.done, 25);
};

exports['map'] = function(test){
	T.arr = [];
	async.map( [1,3,2], T.mul2, function(err, results) {
		test.same( T.arr, [1,3,2] );
		test.same( results, [2,6,4] );
		test.done();
	});
};
exports['map original untouched'] = function(test){
	var a = [1,2,3];
	async.map( a, T.mul2, function(err, results){
		test.same( results, [2,4,6] );
		test.same( a, [1,2,3] );
		test.done();
	});
};
exports['map error'] = function(test){
	test.expect( 2 );
	async.map( [1,2,3], T.getError, function(err, results) {
		test.equals( err, 'error' );
		test.equals( this.str, 'hello' );
	});
	setTimeout(test.done, 50);
};

exports['mapSeries'] = function(test){
	T.arr = [];
	async.mapSeries( [1,3,2], T.mul2, function(err, results) {
		test.same( this.arr, [1,3,2] );
		test.same( results, [2,6,4] );
		test.done();
	});
};
exports['mapSeries error'] = function(test){
	test.expect( 2 );
	async.mapSeries( [1,2,3], T.getError, function(err, results) {
		test.equals( err, 'error' );
		test.equals( this.str, 'hello' );
	});
	setTimeout(test.done, 50);
};

exports['mapLimit'] = function(test){
	T.arr = [];
	async.mapLimit( [2,4,3], 2, T.mul2, function(err, results) {
		test.same( this.arr, [2,4,3] );
		test.same( results, [4,8,6] );
		test.done();
	});
};
exports['mapLimit error'] = function(test){
	test.expect( 3 );
	var arr = [0,1,2,3,4,5,6,7,8,9];
	T.arr = [];

	async.mapLimit(arr, 3, function(x, callback) {
		this.arr.push(x);
		if (x === 2) {
			callback('error');
		}
	}, function(err){
		test.same( this.arr, [0,1,2] );
		test.equals( err, 'error' );
		test.equals( this.str, 'hello' );
	});
	setTimeout(test.done, 25);
};

exports['reduce'] = function(test){
	T.arr = [];
	async.reduce( [1,2,3], 0, function(a, x, callback) {
		this.arr.push(x);
		callback( null, a + x );
	}, function(err, result){
		test.equals( result, 6 );
		test.same( this.arr, [1,2,3] );
		test.done();
	});
};

exports['reduce error'] = function(test){
	test.expect( 2 );
	async.reduce( [1,2,3], 0, T.getError, function(err, result){
		test.equals( err, 'error' );
		test.equals( this.str, 'hello' );
	});
	setTimeout(test.done, 50);
};

exports['reduceRight'] = function(test){
	T.arr = [];
	var a = [1,2,3];
	async.reduceRight(a, 0, function(a, x, callback){
		this.arr.push(x);
		callback( null, a + x );
	}, function(err, result){
		test.equals( result, 6 );
		test.same( this.arr, [3,2,1] );
		test.same( a, [1,2,3] );
		test.done();
	});
};

exports['filter'] = function(test){
	async.filter( [3,1,2], T.odd, function(results) {
		test.same( results, [3,1] );
		test.done();
	});
};
exports['filterSeries'] = function(test){
	async.filterSeries( [3,1,2], T.odd, function(results) {
		test.same( results, [3,1] );
		test.done();
	});
};

exports['reject'] = function(test){
	async.reject( [3,1,2], T.odd, function(results) {
		test.same( results, [2] );
		test.done();
	});
};exports['rejectSeries'] = function(test){
	async.rejectSeries( [3,1,2], T.odd, function(results) {
		test.same( results, [2] );
		test.done();
	});
};

exports['some true'] = function(test){
	T.param1 = 1;
	async.some( [3,1,2], T.eqParam1, function( result ){
		test.equals( result, true );
		test.done();
	});
};
exports['some false'] = function(test){
	T.param1 = 10;
	async.some( [3,1,2], T.eqParam1, function( result ){
		test.equals( result, false );
		test.done();
	});
};

exports['every true'] = function(test){
	async.every( [1,2,3], T.getTrue, function(result) {
		test.equals( result, true );
		test.done();
	});
};
exports['every false'] = function(test){
	async.every( [1,2,3], T.odd, function(result) {
		test.equals( result, false );
		test.done();
	});
};

exports['detect'] = function(test){
	T.arr = [];
	T.param1 = 2;
	async.detect( [1,2,3], T.eqParam1, function(result) {
		this.arr.push( 'callback' );
		test.equals( result, 2 );
	});
	setTimeout(function(){
		test.same( T.arr, [1,2,'callback',3] );
		test.done();
	}, 100);
};
exports['detect - mulitple matches'] = function(test){
	T.arr = [];
	T.param1 = 2;
	async.detect( [1,2,2,2,3], T.eqParam1, function(result) {
		this.arr.push( 'callback' );
		test.equals( result, 2 );
	});
	setTimeout(function(){
		test.same( T.arr, [1,2,'callback',2,2,3] );
		test.done();
	}, 100);
};
exports['detectSeries'] = function(test){
	T.arr = [];
	T.param1 = 2;
	async.detectSeries([3,2,1], T.eqParam1, function(result) {
		this.arr.push( 'callback' );
		test.equals( result, 2 );
	});
	setTimeout(function(){
		test.same( T.arr, [3,2,'callback'] );
		test.done();
	}, 200);
};

exports['sortBy'] = function(test){
	T.param1 = 'a';
	async.sortBy( [{a:1},{a:15},{a:6}], function(x, callback) {
		var p = this.param1;
		setTimeout(function(){callback(null, x[p]);}, 0);
	}, function(err, result){
		test.same( result, [{a:1},{a:6},{a:15}] );
		test.done();
	});
};

exports['apply'] = function(test){
	test.expect( 6 );
	var fn = function(){
		test.same( this.slice.call(arguments), [1,2,3,4] )
	};
	async.apply(fn, 1, 2, 3, 4)();
	async.apply(fn, 1, 2, 3)(4);
	async.apply(fn, 1, 2)(3, 4);
	async.apply(fn, 1)(2, 3, 4);
	async.apply(fn)(1, 2, 3, 4);
	test.equals(
		async.apply(function(name){return 'hello ' + name}, 'world')(),
		'hello world'
	);
	test.done();
};

exports['times'] = function(test){
	T.arr = [];
	async.times( 3, T.addToArr, function(err) {
		test.same( T.arr, [0,1,2] );
		test.done();
	});
};
exports['times 0'] = function(test){
	test.expect( 1 );
	async.times( 0, function(n, callback) {
		test.ok(false, 'iterator should not be called');
		callback();
	}, function( err ){
		test.ok(true, 'should call callback');
	});
	setTimeout( test.done, 25 );
};
exports['times error'] = function(test){
	test.expect( 2 );
	async.times( 3, T.getError, function(err) {
		test.equals( err, 'error' );
		test.equals( this.str, 'hello' );
	});
	setTimeout( test.done, 50 );
};
exports['timesSeries'] = function(test){
	T.arr = [];
	async.timesSeries( 5, function(n, callback) {
		var o = this;
		setTimeout(function(){
			o.arr.push(n);
			callback( null, n );
		}, 100 - n * 10);
	}, function(err, results){
		test.same( this.arr, [0,1,2,3,4] );
		test.same( results, [0,1,2,3,4] );
		test.done();
	});
};
exports['timesSeries error'] = function(test){
	test.expect( 2 );
	async.timesSeries( 5, T.getError, function(err, results){
		test.equals( err, 'error' );
		test.equals( this.str, 'hello' );
	});
	setTimeout(test.done, 50);
};

exports['concat'] = function(test){
	T.arr = [];
	var iterator = function (x, cb) {
		var o = this;
		setTimeout( function(){
			o.arr.push(x);
			var r = [];
			while( x > 0 ) {
				r.push(x);
				x--;
			}
			cb( null, r );
		}, x*25 );
	};
	async.concat( [1,3,2], iterator, function(err, results) {
		test.same( results, [1,2,1,3,2,1] );
		test.same( this.arr, [1,2,3] );
		test.ok( !err );
		test.done();
	});
};

exports['concat error'] = function(test){
	var iterator = function (x, cb) {
		cb( new Error('test error') );
	};
	async.concat( [1,2,3], iterator, function(err, results) {
		test.ok( err );
		test.equals( this.str, 'hello' );
		test.done();
	});
};

exports['concatSeries'] = function(test){
	T.arr = [];
	var iterator = function (x, cb) {
		var o = this;
		setTimeout( function(){
			o.arr.push(x);
			var r = [];
			while( x > 0 ) {
				r.push(x);
				x--;
			}
			cb( null, r );
		}, x*25 );
	};
	async.concatSeries( [1,3,2], iterator, function(err, results){
		test.same( results, [1,3,2,1,2,1] );
		test.same( this.arr, [1,3,2] );
		test.ok( !err );
		test.done();
	});
};

exports['until'] = function (test) {
	T.arr = [];
	T.param1 = 5;
	var count = 0;
	async.until(
		function () {
			this.arr.push(['test', count]);
			return (count == this.param1);
		},
		function (cb) {
			this.arr.push(['iterator', count]);
			count++;
			cb();
		},
		function (err) {
			test.same( this.arr, [
				['test', 0],
				['iterator', 0], ['test', 1],
				['iterator', 1], ['test', 2],
				['iterator', 2], ['test', 3],
				['iterator', 3], ['test', 4],
				['iterator', 4], ['test', 5],
			]);
			test.equals( count, this.param1 );
			test.done();
		}
	);
};

exports['doUntil'] = function (test) {
	T.arr = [];
	T.param1 = 5;
	var count = 0;
	async.doUntil(
		function (cb) {
			this.arr.push(['iterator', count]);
			count++;
			cb();
		},
		function () {
			this.arr.push(['test', count]);
			return (count == this.param1);
		},
		function (err) {
			test.same( this.arr, [
				['iterator', 0], ['test', 1],
				['iterator', 1], ['test', 2],
				['iterator', 2], ['test', 3],
				['iterator', 3], ['test', 4],
				['iterator', 4], ['test', 5]
			]);
			test.equals( count, this.param1 );
			test.done();
		}
	);
};

exports['whilst'] = function (test) {
	T.arr = [];
	T.param1 = 5;
	var count = 0;
	async.whilst(
		function () {
			this.arr.push(['test', count]);
			return (count < this.param1);
		},
		function (cb) {
			this.arr.push(['iterator', count]);
			count++;
			cb();
		},
		function (err) {
			test.same( this.arr, [
				['test', 0],
				['iterator', 0], ['test', 1],
				['iterator', 1], ['test', 2],
				['iterator', 2], ['test', 3],
				['iterator', 3], ['test', 4],
				['iterator', 4], ['test', 5],
			]);
			test.equals( count, this.param1 );
			test.done();
		}
	);
};

exports['doWhilst'] = function (test) {
	T.arr = [];
	T.param1 = 5;
	var count = 0;
	async.doWhilst(
		function (cb) {
			this.arr.push(['iterator', count]);
			count++;
			cb();
		},
		function () {
			this.arr.push(['test', count]);
			return (count < this.param1);
		},
		function (err) {
			debugger
			test.same( this.arr, [
				['iterator', 0], ['test', 1],
				['iterator', 1], ['test', 2],
				['iterator', 2], ['test', 3],
				['iterator', 3], ['test', 4],
				['iterator', 4], ['test', 5]
			]);
			test.equals( count, this.param1 );
			test.done();
		}
	);
};

exports['queue'] = function (test) {
	T.arr = [];
	var delays = [160,80,240,80];

	// worker1: --1-4
	// worker2: -2---3
	// order of completion: 2,1,4,3

	var q = async.queue( function (task, callback) {
		var o = this;
		setTimeout( function () {
			o.arr.push( 'process ' + task );
			callback( 'error', 'arg' );
		}, delays.splice(0,1)[0] );
	}, 2 );

	q.push( 1, function (err, arg) {
		test.equal( err, 'error' );
		test.equal( arg, 'arg' );
		test.equal( q.length(), 1 );
		this.arr.push( 'callback ' + 1 );
	});
	q.push( 2, function (err, arg) {
		test.equal( err, 'error' );
		test.equal( arg, 'arg' );
		test.equal( q.length(), 2 );
		this.arr.push( 'callback ' + 2 );
	});
	q.push( 3, function (err, arg) {
		test.equal( err, 'error' );
		test.equal( arg, 'arg' );
		test.equal( q.length(), 0 );
		this.arr.push( 'callback ' + 3 );
	});
	q.push( 4, function (err, arg) {
		test.equal( err, 'error' );
		test.equal( arg, 'arg' );
		test.equal( q.length(), 0 );
		this.arr.push( 'callback ' + 4 );
	});
	test.equal( q.length(), 4 );
	test.equal( q.concurrency, 2 );

	q.drain = function () {
		test.same( this.arr, [
			'process 2', 'callback 2',
			'process 1', 'callback 1',
			'process 4', 'callback 4',
			'process 3', 'callback 3'
		]);
		test.equal( q.concurrency, 2 );
		test.equal( q.length(), 0 );
		test.done();
	};
};
exports['queue error propagation'] = function(test){
	T.arr = [];
	T.param1 = 'foo';

	var q = async.queue( function (task, callback) {
		callback( task.name === this.param1 ? new Error('fooError') : null);
	}, 2 );

	q.drain = function() {
		test.deepEqual( this.arr, ['bar', 'fooError'] );
		test.done();
	};

	q.push({name: 'bar'}, function (err) {
		if(err) {
			this.arr.push('barError');
			return;
		}

		this.arr.push('bar');
	});

	q.push({name: 'foo'}, function (err) {
		if(err) {
			this.arr.push('fooError');
			return;
		}

		this.arr.push('foo');
	});
};

exports['cargo'] = function (test) {
	T.arr = [];
	var delays = [ 160, 160, 80 ];

	// worker: --12--34--5-
	// order of completion: 1,2,3,4,5

	var c = async.cargo( function (tasks, callback) {
		var o = this;
		setTimeout( function () {
			o.arr.push( 'process ' + tasks.join(' ') );
			callback( 'error', 'arg' );
		}, delays.shift() );
	}, 2 );

	c.push( 1, function (err, arg) {
		test.equal( err, 'error' );
		test.equal( arg, 'arg' );
		test.equal( c.length(), 3 );
		this.arr.push( 'callback ' + 1 );
	});
	c.push( 2, function (err, arg) {
		test.equal( err, 'error' );
		test.equal( arg, 'arg' );
		test.equal( c.length(), 3 );
		this.arr.push( 'callback ' + 2 );
	});

	test.equal( c.length(), 2 );

	// async push
	setTimeout( function () {
		c.push( 3, function (err, arg) {
			test.equal( err, 'error' );
			test.equal( arg, 'arg' );
			test.equal( c.length(), 1 );
			this.arr.push( 'callback ' + 3 );
		});
	}, 60 );
	setTimeout( function () {
		c.push( 4, function (err, arg) {
			test.equal( err, 'error' );
			test.equal( arg, 'arg' );
			test.equal( c.length(), 1 );
			this.arr.push( 'callback ' + 4 );
		});
		test.equal( c.length(), 2 );
		c.push( 5, function (err, arg) {
			test.equal( err, 'error' );
			test.equal( arg, 'arg' );
			test.equal( c.length(), 0 );
			this.arr.push( 'callback ' + 5 );
		});
	}, 120 );


	setTimeout( function () {
		test.same( T.arr, [
			'process 1 2', 'callback 1', 'callback 2',
			'process 3 4', 'callback 3', 'callback 4',
			'process 5'  , 'callback 5'
		]);
		test.equal( c.length(), 0 );
		test.done();
	}, 800 );
};

exports['memoize'] = function (test) {
	test.expect( 4 );
	T.arr = [];

	var fn = function ( arg1, arg2, callback ) {
		this.arr.push(['fn', arg1, arg2]);
		callback( null, arg1 + arg2 );
	};

	var fn2 = async.memoize(fn);
	fn2( 1, 2, function (err, result) {
		test.equal( result, 3 );
	});
	fn2( 1, 2, function (err, result) {
		test.equal( result, 3 );
	});
	fn2( 2, 2, function (err, result) {
		test.equal( result, 4 );
	});

	test.same( T.arr, [['fn',1,2], ['fn',2,2]] );
	test.done();
};

exports['unmemoize'] = function(test) {
	test.expect( 4 );
	T.arr = [];

	var fn = function ( arg1, arg2, callback ) {
		this.arr.push(['fn', arg1, arg2]);
		callback( null, arg1 + arg2 );
	};

	var fn2 = async.memoize(fn);
	var fn3 = async.unmemoize(fn2);
	fn3( 1, 2, function (err, result) {
		test.equal( result, 3 );
	});
	fn3( 1, 2, function (err, result) {
		test.equal( result, 3 );
	});
	fn3( 2, 2, function (err, result) {
		test.equal( result, 4 );
	});

	test.same( T.arr, [['fn',1,2], ['fn',1,2], ['fn',2,2]]);

	test.done();
}

exports['forever'] = function (test) {
	test.expect( 1 );
	var counter = 0;
	T.param1 = 50;
	function addOne(callback) {
		counter++;
		if (counter === this.param1) {
			return callback( 'too big!' );
		}
		async.setImmediate(function () {
			callback();
		});
	}
	async.forever( addOne, function (err) {
		test.equal( err, 'too big!' );
		test.done();
	});
};

exports['applyEach'] = function (test) {
	test.expect( 4 );
	T.arr = [];
	var one = function (val, cb) {
		test.equal( val, 5 );
		var o = this;
		setTimeout(function () {
			o.arr.push('one');
			cb(null, 1);
		}, 100);
	};
	var two = function (val, cb) {
		test.equal(val, 5);
		var o = this;
		setTimeout(function () {
			o.arr.push('two');
			cb(null, 2);
		}, 50);
	};
	var three = function (val, cb) {
		test.equal(val, 5);
		var o = this;
		setTimeout(function () {
			o.arr.push('three');
			cb(null, 3);
		}, 150);
	};
	async.applyEach( [one, two, three], 5, function (err) {
		test.same( this.arr, ['two', 'one', 'three'] );
		test.done();
	});
};

exports['applyEachSeries'] = function (test) {
	test.expect( 4 );
	T.arr = [];
	var one = function (val, cb) {
		test.equal(val, 5);
		var o = this;
		setTimeout(function () {
			o.arr.push('one');
			cb(null, 1);
		}, 100);
	};
	var two = function (val, cb) {
		test.equal(val, 5);
		var o = this;
		setTimeout(function () {
			o.arr.push('two');
			cb(null, 2);
		}, 50);
	};
	var three = function (val, cb) {
		test.equal(val, 5);
		var o = this;
		setTimeout(function () {
			o.arr.push('three');
			cb(null, 3);
		}, 150);
	};
	async.applyEachSeries( [one, two, three], 5, function (err) {
		test.same( this.arr, ['one', 'two', 'three'] );
		test.done();
	});
};

exports['applyEach partial application'] = function (test) {
	test.expect( 4 );
	T.arr = [];
	var one = function (val, cb) {
		test.equal(val, 5);
		var o = this;
		setTimeout(function () {
			o.arr.push('one');
			cb(null, 1);
		}, 100);
	};
	var two = function (val, cb) {
		test.equal(val, 5);
		var o = this;
		setTimeout(function () {
			o.arr.push('two');
			cb(null, 2);
		}, 50);
	};
	var three = function (val, cb) {
		test.equal(val, 5);
		var o = this;
		setTimeout(function () {
			o.arr.push('three');
			cb(null, 3);
		}, 150);
	};
	async.applyEach( [one, two, three])(5, function (err) {
		test.same( this.arr, ['two', 'one', 'three'] );
		test.done();
	});
};

exports['compose'] = function (test) {
	test.expect( 8 );
	var add2 = function (n, cb) {
		test.equal( n, 3 );
		test.equal( this.str, 'hello' );
		setTimeout(function () {
			cb( null, n + 2 );
		}, 50 );
	};
	var mul3 = function (n, cb) {
		test.equal (n, 5 );
		test.equal( this.str, 'hello' );
		setTimeout(function () {
			cb( null, n * 3 );
		}, 15 );
	};
	var add1 = function (n, cb) {
		test.equal( n, 15 );
		test.equal( this.str, 'hello' );
		setTimeout(function () {
			cb( null, n + 1 );
		}, 100 );
	};
	var add2mul3add1 = async.compose( add1, mul3, add2 );
	add2mul3add1( 3, function (err, result) {
		if (err) {
			return test.done(err);
		}
		test.equal( result, 16 );
		test.equal( this.str, 'hello' );
		test.done();
	});
};

exports['compose error'] = function (test) {
	test.expect( 4 );
	var testerr = new Error('test');

	var add2 = function (n, cb) {
		test.equal( n, 3 );
		setTimeout(function () {
			cb( null, n + 2 );
		}, 50 );
	};
	var mul3 = function (n, cb) {
		test.equal( n, 5 );
		setTimeout(function () {
			cb( testerr );
		}, 15 );
	};
	var add1 = function (n, cb) {
		test.ok( false, 'add1 should not get called' );
		setTimeout( function () {
			cb( null, n + 1 );
		}, 100 );
	};
	var add2mul3add1 = async.compose(add1, mul3, add2);
	add2mul3add1( 3, function (err, result) {
		test.equal( err, testerr );
		test.equal( this.str, 'hello' );
		test.done();
	});
};

exports['auto'] = function(test){
	T.arr = [];
	var testdata = [{test: 'test'}];
	async.auto({
		task1: ['task2', function(callback){
			var o = this;
			setTimeout(function(){
				o.arr.push('task1');
				callback();
			}, 25);
		}],
		task2: function(callback){
			var o = this;
			setTimeout(function(){
				o.arr.push('task2');
				callback();
			}, 50);
		},
		task3: ['task2', function(callback){
			this.arr.push('task3');
			callback();
		}],
		task4: ['task1', 'task2', function(callback){
			this.arr.push('task4');
			callback();
		}],
		task5: ['task2', function(callback){
			var o = this;
			setTimeout(function(){
			  o.arr.push('task5');
			  callback();
			}, 0);
		}],
		task6: ['task2', function(callback){
			this.arr.push('task6');
			callback();
		}]
	},
	function(err){
		test.same( this.arr, ['task2','task6','task3','task5','task1','task4'] );
		test.done();
	});
};

exports['auto error'] = function(test){
	test.expect( 2 );
	async.auto({
		task1: function(callback){
			callback('testerror');
		},
		task2: ['task1', function(callback){
			test.ok(false, 'task2 should not be called');
			callback();
		}],
		task3: function(callback){
			callback('testerror2');
		}
	},
	function(err){
		test.equals( err, 'testerror' );
		test.equal( this.str, 'hello' );
	});
	setTimeout(test.done, 100);
};

exports['auto error should pass partial results'] = function(test) {
	async.auto({
		task1: function(callback){
			callback( false, 'result1' );
		},
		task2: ['task1', function(callback){
			callback( 'testerror', 'result2' );
		}],
		task3: ['task2', function(callback){
			test.ok( false, 'task3 should not be called' );
		}]
	},
	function(err, results){
		test.equals( err, 'testerror' );
		test.equals( results.task1, 'result1' );
		test.equals( results.task2, 'result2' );
		test.equal( this.str, 'hello' );
		test.done();
	});
};

exports['waterfall'] = function(test){
	test.expect( 7 );
	T.arr = [];
	async.waterfall([
		function(callback){
			this.arr.push('fn1');
			setTimeout( function(){callback(null, 'one', 'two');}, 0 );
		},
		function(arg1, arg2, callback){
			this.arr.push('fn2');
			test.equals(arg1, 'one');
			test.equals(arg2, 'two');
			setTimeout( function(){callback(null, arg1, arg2, 'three');}, 25 );
		},
		function(arg1, arg2, arg3, callback){
			this.arr.push('fn3');
			test.equals(arg1, 'one');
			test.equals(arg2, 'two');
			test.equals(arg3, 'three');
			callback( null, 'four' );
		},
		function(arg4, callback){
			this.arr.push('fn4');
			test.same( this.arr, ['fn1','fn2','fn3','fn4'] );
			callback( null, 'test' );
		}
	], function(err){
		test.equal( this.str, 'hello' );
		test.done();
	});
};

exports['waterfall async'] = function(test){
	T.arr = [];
	async.waterfall([
		function( callback ){
			this.arr.push(1);
			callback();
			this.arr.push(2);
		},
		function( callback ){
			this.arr.push(3);
			callback();
		},
		function(){
			test.same( this.arr, [1,2,3] );
			test.done();
		}
	]);
};

exports['waterfall error'] = function(test){
	test.expect( 2 );
	async.waterfall([
		function(callback){
			callback( 'error' );
		},
		function(callback){
			test.ok( false, 'next function should not be called' );
			callback();
		}
	], function(err){
		test.equals( err, 'error' );
		test.equal( this.str, 'hello' );
	});
	setTimeout( test.done, 50 );
};

exports['parallel'] = function(test){
	T.arr = [];
	async.parallel([
		function(callback){
			let o = this;
			setTimeout(function(){
				o.arr.push(1);
				callback(null, 1);
			}, 50);
		},
		function(callback){
			let o = this;
			setTimeout(function(){
				o.arr.push(2);
				callback(null, 2);
			}, 100);
		},
		function(callback){
			let o = this;
			setTimeout(function(){
				o.arr.push(3);
				callback(null, 3,3);
			}, 25);
		}
	],
	function(err, results){
		test.equals( err, null );
		test.same( this.arr, [3,1,2] );
		test.same( results, [1,2,[3,3]] );
		test.done();
	});
};

exports['parallel error'] = function(test){
	async.parallel([
		function(callback){
			callback( 'error', 1 );
		},
		function(callback){
			callback( 'error2', 2 );
		}
	],
	function( err, results ) {
		test.equals( err, 'error' );
		test.equal( this.str, 'hello' );
	});
	setTimeout( test.done, 100 );
};

exports['parallel limit'] = function(test){
	T.arr = [];
	async.parallelLimit([
		function(callback){
			let o = this;
			setTimeout(function(){
				o.arr.push(1);
				callback(null, 1);
			}, 50 );
		},
		function(callback){
			let o = this;
			setTimeout(function(){
				o.arr.push(2);
				callback(null, 2);
			}, 100 );
		},
		function(callback){
			let o = this;
			setTimeout(function(){
				o.arr.push(3);
				callback(null, 3,3);
			}, 25 );
		}
	],
	2,
	function( err, results ) {
		test.equals( err, null );
		test.same( this.arr, [1,3,2] );
		test.same( results, [1,2,[3,3]] );
		test.done();
	});
};

exports['parallel limit error'] = function(test){
	async.parallelLimit([
		function(callback){
			callback( 'error', 1 );
		},
		function(callback){
			callback( 'error2', 2 );
		}
	],
	1,
	function( err, results ){
		test.equals( err, 'error' );
		test.equal( this.str, 'hello' );
	});
	setTimeout( test.done, 100 );
};

exports['series'] = function(test){
	T.arr = [];
	async.series([
		function(callback){
			let o = this;
			setTimeout(function(){
				o.arr.push(1);
				callback(null, 1);
			}, 25);
		},
		function(callback){
			let o = this;
			setTimeout(function(){
				o.arr.push(2);
				callback(null, 2);
			}, 50);
		},
		function(callback){
			let o = this;
			setTimeout(function(){
				o.arr.push(3);
				callback(null, 3,3);
			}, 15);
		}
	],
	function( err, results ){
		test.equals( err, null );
		test.same( results, [1,2,[3,3]] );
		test.same( this.arr, [1,2,3] );
		test.done();
	});
};

exports['series error'] = function(test){
	test.expect( 2 );
	async.series([
		function(callback){
			callback( 'error', 1 );
		},
		function(callback){
			test.ok( false, 'should not be called ');
			callback( 'error2', 2 );
		}
	],
	function(err, results){
		test.equals( err, 'error' );
		test.equal( this.str, 'hello' );
	});
	setTimeout( test.done, 100 );
};

exports['iterator'] = function(test){
	T.arr = [];
	var iterator = async.iterator([
		function(){ this.arr.push(1); },
		function(arg1){
			test.equals( arg1, 'arg1' );
			this.arr.push(2);
		},
		function( arg1, arg2 ){
			test.equals( arg1, 'arg1' );
			test.equals( arg2, 'arg2' );
			this.arr.push(3);
		}
	]);
	iterator();
	test.same( T.arr, [1] );
	var iterator2 = iterator();
	test.same( T.arr, [1,1] );
	var iterator3 = iterator2( 'arg1' );
	test.same( T.arr, [1,1,2] );
	var iterator4 = iterator3( 'arg1', 'arg2' );
	test.same( T.arr, [1,1,2,3] );
	test.equals( iterator4, undefined );
	test.done();
};

exports['iterator.next'] = function(test){
	T.arr = [];
	var iterator = async.iterator([
		function(){ this.arr.push(1); },
		function(arg1){
			test.equals( arg1, 'arg1' );
			this.arr.push(2);
		},
		function(arg1, arg2){
			test.equals( arg1, 'arg1' );
			test.equals( arg2, 'arg2' );
			this.arr.push(3);
		}
	]);
	var fn = iterator.next();
	var iterator2 = fn( 'arg1' );
	test.same( T.arr, [2] );
	iterator2( 'arg1','arg2' );
	test.same( T.arr, [2,3]);
	test.equals( iterator2.next(), undefined );
	test.done();
};
