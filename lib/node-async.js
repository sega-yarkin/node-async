/*!
 * Needs a Harmony flags.
 */
'use strict';

let noop  = function () {};
let slice = Array.prototype.slice;


function Async( object ) {
	this.ctx = object || {};
}

Async.prototype.get = function getNew( object ) {
	return new Async( object );
};

Async.prototype.setImmediate = setImmediate;
Async.prototype.nextTick     = process.nextTick;

Async.prototype.each = function each( arr, iterator, callback ) {
	callback = callback || noop;
	let context = this.ctx;
	if( ! arr.length ) {
		callback.call( context );
		return;
	}
	let completed = 0;
	for( let i=0, len=arr.length; i<len; i++ ) {
		iterator.call( context, arr[i], onResult );
	};
	function onResult( err ) {
		if( err ) {
			callback.call( context, err );
			callback = noop;
		}
		else {
			completed += 1;
			if( completed >= arr.length ) {
				callback.call( context );
			}
		}
	}
};
Async.prototype.forEach = Async.prototype.each;

Async.prototype.eachSeries = function eachSeries( arr, iterator, callback ) {
	callback = callback || noop;
	let context = this.ctx;
	if( ! arr.length ) {
		callback.call( context );
		return;
	}
	let completed = 0;
	function iterate() {
		iterator.call( context, arr[completed], function onResult( err ) {
			if( err ) {
				callback.call( context, err );
				callback = noop;
			}
			else {
				completed += 1;
				if( completed >= arr.length ) {
					callback.call( context );
				}
				else {
					iterate();
				}
			}
		});
	};
	iterate();
};
Async.prototype.forEachSeries = Async.prototype.eachSeries;

function _eachLimit( limit ) {
	return function ( arr, iterator, callback ) {
		callback  = callback || noop;
		let context = this.ctx;
		let count = arr.length;
		if( !count || limit<=0 ) {
			callback.call( context );
			return;
		}
		let completed = 0
		  , started   = 0
		  , running   = 0;

		(function replenish () {
			if( completed >= count ) {
				callback.call( context );
				return;
			}
			while( running<limit && started<count ) {
				started += 1;
				running += 1;
				iterator.call( context, arr[started-1], function onResult( err ) {
					if( err ) {
						callback.call( context, err );
						callback = noop;
					}
					else {
						completed += 1;
						running   -= 1;
						replenish();
					}
				});
			}
		})();
	};
}

Async.prototype.eachLimit = function eachLimit( arr, limit, iterator, callback ) {
	(_eachLimit( limit )).call( this, arr, iterator, callback );
};
Async.prototype.forEachLimit = Async.prototype.eachLimit;


function doParallel( fn ) {
	return function () {
		let args = slice.call( arguments );
		return fn.apply( this, [Async.prototype.each].concat(args) );
	};
}
function doParallelLimit( limit, fn ) {
	return function () {
		let args = slice.call( arguments );
		return fn.apply( this, [_eachLimit(limit)].concat(args) );
	};
}
function doSeries( fn ) {
	return function () {
		let args = slice.call( arguments );
		return fn.apply( this, [Async.prototype.eachSeries].concat(args) );
	};
}
function _asyncMap( eachfn, arr, iterator, callback ) {
	let results = [], arr2 = [];
	for( let i=0, len=arr.length; i<len; i++ ) {
		arr2.push({ index: i, value: arr[i] });
	}
	eachfn.call( this, arr2, function ( x, callback ) {
		iterator.call( this, x.value, function onResult( err, v ) {
			results[ x.index ] = v;
			callback( err );
		});
        }, function onDone( err ) {
		callback.call( this, err, results );
        });
}
function _mapLimit( limit ) {
	return doParallelLimit.call( this, limit, _asyncMap );
}

Async.prototype.map       = doParallel( _asyncMap );
Async.prototype.mapSeries = doSeries  ( _asyncMap );
Async.prototype.mapLimit  = function mapLimit( arr, limit, iterator, callback ) {
	return _mapLimit(limit).call( this, arr, iterator, callback );
};

// reduce only has a series version, as doing reduce in parallel won't work in many situations.
Async.prototype.reduce = function reduce( arr, memo, iterator, callback ) {
	this.eachSeries( arr, function ( x, callback ) {
		iterator.call( this, memo, x, function onResult( err, v ) {
			memo = v;
			callback( err );
		});
	}, function onDone( err ) {
		callback.call( this, err, memo );
	});
};
Async.prototype.inject = Async.prototype.reduce;
Async.prototype.foldl  = Async.prototype.reduce;

Async.prototype.reduceRight = function reduceRight( arr, memo, iterator, callback ) {
	let reversed = arr.slice(0).reverse();
        this.reduce( reversed, memo, iterator, callback );
};
Async.prototype.foldr = Async.prototype.reduceRight;

function _filter( eachfn, arr, iterator, callback ) {
	let results = [], arr2 = [];
	for( let i=0, len=arr.length; i<len; i++ ) {
		arr2.push({ index: i, value: arr[i] });
	}
	eachfn.call( this, arr2, function ( x, callback ) {
		iterator.call( this, x.value, function onResult( v ) {
			if( v ) {
				results.push( x );
			}
			callback();
		});
	}, function onDone( err ) {
		function sortFunc( a, b ) {
			return a.index - b.index;
		}
		results = results.sort( sortFunc );
		let ret = [];
		for( let i=0, len=results.length; i<len; i++ ) {
			ret.push( results[i].value );
		}
		callback.call( this, ret );
        });
}

Async.prototype.filter       = doParallel( _filter );
Async.prototype.filterSeries = doSeries  ( _filter );
Async.prototype.select       = Async.prototype.filter;
Async.prototype.selectSeries = Async.prototype.filterSeries;

function _reject( eachfn, arr, iterator, callback ) {
	let results = [], arr2 = [];
	for( let i=0, len=arr.length; i<len; i++ ) {
		arr2.push({ index: i, value: arr[i] });
	}
	eachfn.call( this, arr2, function ( x, callback ) {
		iterator.call( this, x.value, function onResult( v ) {
			if( ! v ) {
				results.push( x );
			}
			callback();
		});
	}, function onDone( err ) {
		function sortFunc( a, b ) {
			return a.index - b.index;
		}
		results = results.sort( sortFunc );
		let ret = [];
		for( let i=0, len=results.length; i<len; i++ ) {
			ret.push( results[i].value );
		}
		callback.call( this, ret );
	});
}
Async.prototype.reject       = doParallel( _reject );
Async.prototype.rejectSeries = doSeries  ( _reject );

function _detect( eachfn, arr, iterator, main_callback ) {
	let context = this.ctx;
	eachfn.call( this, arr, function ( x, callback ) {
		iterator.call( this, x, function onResult( result ) {
			if( result ) {
				main_callback.call( context, x );
				main_callback = noop;
			}
			else {
				callback();
			}
		});
	}, function onDone( err ) {
		main_callback.call( context );
	});
}
Async.prototype.detect       = doParallel( _detect );
Async.prototype.detectSeries = doSeries  ( _detect );



Async.prototype.some = function some( arr, iterator, main_callback ) {
	this.each( arr, function ( x, callback ) {
		iterator.call( this, x, function onResult( v ) {
			if( v ) {
				main_callback.call( this, true );
				main_callback = noop;
			}
			callback();
		});
	}, function onDone( err ) {
		main_callback.call( this, false );
	});
};
Async.prototype.any = Async.prototype.some;

Async.prototype.every = function every( arr, iterator, main_callback ) {
	this.each( arr, function ( x, callback ) {
		iterator.call( this, x, function onResult( v ) {
			if( !v ) {
				main_callback.call( this, false );
				main_callback = noop;
			}
			callback();
		});
	}, function onDone( err ) {
		main_callback.call( this, true );
        });
};
Async.prototype.all = Async.prototype.every;

Async.prototype.sortBy = function sortBy( arr, iterator, callback ) {
	this.map( arr, function ( x, callback ) {
		iterator.call( this, x, function onResult( err, criteria ) {
			if( err ) {
				callback( err );
			}
			else {
				callback( null, {value: x, criteria: criteria} );
			}
		});
	}, function onDone( err, results ) {
		if( err ) {
			callback.call( this, err );
		}
		else {
			function sortFunc( left, right ) {
				let a = left.criteria, b = right.criteria;
				return a < b ? -1 : (a > b ? 1 : 0);
			}
			results = results.sort( sortFunc );
			let ret = [];
			for( let i=0, len=results.length; i<len; i++ ) {
				ret.push( results[i].value );
			}
			callback.call( this, null, ret );
		}
	});
};

Async.prototype.auto = function auto( tasks, callback ) {
	callback = callback || noop;
	let keys = Object.keys( tasks );
	if( ! keys.length ) {
		callback.call( this, null );
		return;
	}

        let results   = {}
          , listeners = []
          , context   = this.ctx;
	
	function addListener( fn ) {
		listeners.unshift( fn );
	}
	function removeListener( fn ) {
		for( let i=0, len=listeners.length; i<len; i++ ) {
			if( listeners[i] === fn ) {
				listeners.splice( i, 1 );
				return;
			}
		}
        }
	function taskComplete() {
		let fns = listeners.slice(0);
		for( let i=0, len=fns.length; i<len; i++ ) {
			fns[i]();
		}
	}

        addListener( function onDone() {
            if( Object.keys(results).length === keys.length ) {
                let theCallback = callback;
                // prevent final callback from calling itself if it errors
                callback = noop;
                theCallback.call( context, null, results );
            }
        });
        
        for( let i=0, len=keys.length; i<len; i++ ) {
                let task_name = keys[i]
        	  , task      = (tasks[task_name] instanceof Function) ? [tasks[task_name]] : tasks[task_name];
		function taskCallback( err ) {
			let args = slice.call( arguments, 1 );
			if( args.length <= 1 ) {
				args = args[0];
			}
			if( err ) {
				let safeResults = {}
				  , res_keys    = Object.keys( results );

				for( let k=0, len=res_keys.length, rkey; k<len; k++ ) {
					rkey = res_keys[k];
					safeResults[rkey] = results[rkey];
				}
				safeResults[ task_name ] = args;
				callback.call( context, err, safeResults );
				callback = noop;
			}
			else {
				results[ task_name ] = args;
				setImmediate( taskComplete );
			}
		}
        	let requires  = task.slice( 0, Math.abs(task.length-1) ) || [];
        	let task_func = task[ task.length-1 ];
		function ready() {
			let ret = true;
			for( let j=0, len=requires.length; j<len; j++ ) {
				ret = ret && results.hasOwnProperty( requires[j] );
			}
			return ret && !results.hasOwnProperty( task_name );
		}
		if( ready() ) {
			task_func.call( context, taskCallback, results );
		}
		else {
			function listener() {
				if( ready() ) {
					removeListener( listener );
					task_func.call( context, taskCallback, results );
				}
			}
			addListener( listener );
		}
        }
};

Async.prototype.waterfall = function waterfall( tasks, callback ) {
	callback = callback || noop;
	let context = this.ctx;
	if( tasks.constructor !== Array ) {
		let err = new Error("First argument to waterfall must be an array of functions");
		callback.call( context, err );
		return;
	}
	if( ! tasks.length ) {
		callback.call( context );
		return;
	}
	function wrapCallback() {
		let args = slice.call( arguments );
		callback.apply( context, args );
	}
	function wrapIterator( iterator ) {
		return function ( err ) {
			if( err ) {
				callback.apply( context, arguments );
				callback = noop;
			}
			else {
				let args = slice.call( arguments, 1 )
				  , next = iterator.next();
				if( next ) {
					args.push( wrapIterator(next) );
				}
				else {
					args.push( wrapCallback );
				}
				setImmediate( function () {
					iterator.apply( context, args );
				});
			}
		};
	}
	wrapIterator( this.iterator(tasks) )();
};

function _parallel( eachfn, tasks, callback ) {
	callback = callback || noop;
	let context = this.ctx;
	if( tasks.constructor === Array ) {
		eachfn.map.call( this, tasks, function ( fn, callback ) {
			if( fn ) {
				fn.call( context, function onResult( err ) {
					let args = slice.call( arguments, 1);
					if( args.length <= 1 ) {
						args = args[0];
					}
					callback( err, args );
				});
			}
		}, function onDone( err, results ) {
			callback.call( context, err, results );
		});
	}
	else {
		let results = {};
		eachfn.each.call( this, Object.keys(tasks), function ( k, callback ) {
			tasks[k].call( context, function onResult( err ) {
				let args = slice.call( arguments, 1 );
				if( args.length <= 1 ) {
					args = args[0];
				}
				results[k] = args;
				callback(err);
			});
		}, function onDone( err ) {
			callback.call( context, err, results );
		});
	}
}

Async.prototype.parallel = function parallel( tasks, callback ) {
	_parallel.call( this, { map: this.map, each: this.each }, tasks, callback );
};

Async.prototype.parallelLimit = function parallelLimit( tasks, limit, callback ) {
	_parallel.call( this, { map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback );
};

Async.prototype.series = function series( tasks, callback ) {
	callback = callback || noop;
	let context = this.ctx;
	if( tasks.constructor === Array ) {
		this.mapSeries( tasks, function (fn, callback) {
			if( fn ) {
				fn.call( context, function onResult( err ) {
					let args = slice.call( arguments, 1 );
					if( args.length <= 1 ) {
						args = args[0];
					}
					callback( err, args );
				});
			}
		}, function onDone( err, results ) {
			callback.call( context, err, results );
		});
	}
	else {
		let results = {};
		this.eachSeries( Object.keys(tasks), function ( k, callback ) {
			tasks[k].call( context, function onResult( err ) {
				let args = slice.call( arguments, 1 );
				if( args.length <= 1 ) {
					args = args[0];
				}
				results[k] = args;
				callback( err );
			});
		}, function onDone( err ) {
			callback.call( context, err, results );
		});
	}
};

Async.prototype.iterator = function iterator( tasks ) {
	let context = this.ctx;
	function makeCallback( index ) {
		function fn() {
			if( tasks.length ) {
				tasks[index].apply( context, arguments );
			}
			return fn.next();
		};
		fn.next = function next() {
			return (index < tasks.length-1) ? makeCallback( index+1 ) : null;
		};
		return fn;
	}
	return makeCallback( 0 );
};

Async.prototype.apply = function apply( fn ) {
	let args = slice.call( arguments, 1 );
	let context = this.ctx;
	return function () {
		return fn.apply(
			context, args.concat(slice.call(arguments))
		);
	};
};

function _concat( eachfn, arr, fn, callback ) {
	let r = [];
	let context = this.ctx;
	eachfn.call( this, arr, function ( x, callback ) {
		fn.call( context, x, function ( err, y ) {
			r = r.concat(y || []);
			callback( err );
		});
	}, function onDone( err ) {
		callback.call( context, err, r );
	});
}
Async.prototype.concat       = doParallel( _concat );
Async.prototype.concatSeries = doSeries  ( _concat );

Async.prototype.whilst = function whilst( test, iterator, callback ) {
	let that = this;
	if( test.call(that.ctx) ) {
		iterator.call( that.ctx, function onResult( err ) {
			if( err ) {
				callback.call( that.ctx, err );
				return;
			}
			that.whilst( test, iterator, callback );
		});
	}
	else {
		callback.call( that.ctx );
	}
};

Async.prototype.doWhilst = function doWhilst( iterator, test, callback ) {
	let that = this;
	iterator.call( that.ctx, function onResult( err ) {
		if( err ) {
			callback.call( that.ctx, err );
			return;
		}
		let args = slice.call( arguments, 1 );
		if( test.apply(that.ctx, args) ) {
			that.doWhilst( iterator, test, callback );
		}
		else {
			callback.call( that.ctx );
		}
	});
};

Async.prototype.until = function until( test, iterator, callback ) {
	let that = this;
	if( ! test.call(that.ctx) ) {
		iterator.call( that.ctx, function onResult(err) {
			if( err ) {
				callback.call( that.ctx, err );
				return;
			}
			that.until( test, iterator, callback );
		});
	}
	else {
		callback.call( that.ctx );
	}
};

Async.prototype.doUntil = function doUntil( iterator, test, callback ) {
	let that = this;
	iterator.call( that.ctx, function onResult( err ) {
		if( err ) {
			callback.call( that.ctx, err );
			return;
		}
		let args = slice.call( arguments, 1 );
		if( ! test.apply(that.ctx, args) ) {
			that.doUntil( iterator, test, callback );
		}
		else {
			callback.call( that.ctx );
		}
	});
};

Async.prototype.queue = function queue( worker, concurrency ) {
	let context = this.ctx;
	function _insert( q, data, pos, callback ) {
		if( data.constructor !== Array ) {
			data = [ data ];
		}
		if( data.length === 0 ) {
			// call drain immediately if there are no tasks
			return setImmediate( function() {
				if( q.drain ) {
					q.drain();
				}
			});
		}
		for( let i=0, len=data.length, item; i<len; i++ ) {
			item = {
				data    : data[i],
				callback: typeof(callback)==='function' ? callback : undefined
			};
			if( pos ) {
				q.tasks.unshift( item );
			}
			else {
				q.tasks.push( item );
			}
			if( q.saturated && q.tasks.length===q.concurrency ) {
				q.saturated();
			}
			setImmediate( q.process );
		};
	}
	let workers = 0;
	let q = {
		tasks      : [],
		concurrency: concurrency || 1,
		saturated  : undefined,
		empty      : undefined,
		drain      : undefined,
		
		push: function push( data, callback ) {
			_insert( q, data, false, callback );
		},
		unshift: function unshift( data, callback ) {
			_insert( q, data, true, callback );
		},
		process: function process() {
			if( workers<q.concurrency && q.tasks.length ) {
				let task = q.tasks.shift();
				if( q.empty && q.tasks.length===0 ) {
					q.empty.call( context );
				}
				workers += 1;
				function next() {
					workers -= 1;
					if( task.callback ) {
						task.callback.apply( context, arguments );
					}
					if( q.drain && (q.tasks.length+workers)===0 ) {
						q.drain.call( context );
					}
					q.process();
				};
				worker.call( context, task.data, next );
			}
		},
		length: function length() {
			return q.tasks.length;
		},
		running: function running() {
			return workers;
		},
		idle: function() {
			return q.tasks.length + workers === 0;
		}
	};
	return q;
};

Async.prototype.cargo = function cargo( worker, payload ) {
	let context = this.ctx;
	let working = false
	  , tasks   = [];
	let cargo = {
		tasks    : tasks,
		payload  : payload,
		saturated: undefined,
		empty    : undefined,
		drain    : undefined,
		drained  : true,
		
		push: function push( data, callback ) {
			if( data.constructor !== Array ) {
				data = [ data ];
			}
			for( let i=0, len=data.length, item; i<len; i++ ) {
				tasks.push({
					data    : data[i],
					callback: typeof(callback)==='function' ? callback : undefined
				});
				cargo.drained = false;
				if( cargo.saturated && tasks.length===payload ) {
					cargo.saturated.call( context );
				}
			};
			setImmediate( cargo.process );
		},
		process: function process() {
			if( working ) {
				return;
			}
			if( tasks.length === 0 ) {
				if( cargo.drain && !cargo.drained ) {
					cargo.drain.call( context );
				}
				cargo.drained = true;
				return;
			}
			let ts = typeof payload === 'number'
			       ? tasks.splice( 0, payload )
			       : tasks.splice( 0 );

			let ds = [];
			for( let i=0, len=ts.length; i<len; i++ ) {
				ds.push( ts[i].data );
			}
			if( cargo.empty ) {
				cargo.empty.call( context );
			}
			working = true;
			worker.call( context, ds, function onResult() {
				working = false;
				let args = arguments;
				for( let i=0, len=ts.length; i<len; i++ ) {
					if( ts[i].callback ) {
						ts[i].callback.apply( context, args );
					}
				}
				process();
			});
		},
		length: function length() {
			return tasks.length;
		},
		running: function running() {
			return working;
		}
	};
	return cargo;
};

function _console_fn( name ) {
	return function ( fn ) {
		let context = this.ctx;
		let args = slice.call( arguments, 1 );
		fn.apply( context, args.concat([ function onResult( err ) {
			let args = slice.call( arguments, 1 );
			if( err ) {
				console.error( err );
			}
			else if( console[name] ) {
				for( let i=0, len=args.length; i<len; i++ ) {
					console[name]( args[i] );
				}
			}
		}]));
	};
}
Async.prototype.log   = _console_fn( 'log' );
Async.prototype.dir   = _console_fn( 'dir' );
Async.prototype.info  = _console_fn( 'info'  );
Async.prototype.warn  = _console_fn( 'warn'  );
Async.prototype.error = _console_fn( 'error' );




Async.prototype.memoize = function memoize( fn, hasher ) {
	let context = this.ctx;
	let memo    = {}
	  , queues  = {};
	hasher = hasher || function (x) { return x; };
	function memoized() {
		let args     = slice.call( arguments )
		  , callback = args.pop()
		  , key      = hasher.apply( context, args );
		if( key in memo ) {
			Async.prototype.nextTick( function () {
				callback.apply( context, memo[key] );
			});
		}
		else if( key in queues ) {
			queues[key].push( callback );
		}
		else {
			queues[key] = [ callback ];
			fn.apply( context, args.concat([ function onResult() {
				memo[key] = arguments;
				let q = queues[key];
				delete queues[key];
				for( let i=0, len=q.length; i<len; i++ ) {
					q[i].apply( context, arguments );
				}
			}]));
		}
	}
	memoized.memo       = memo;
	memoized.unmemoized = fn;
	return memoized;
};

Async.prototype.unmemoize = function unmemoize( fn ) {
	let context = this.ctx;
	return function () {
		return (fn.unmemoized || fn).apply( context, arguments );
	};
};

Async.prototype.times = function times( count, iterator, callback ) {
	let counter = [];
	for( let i=0; i<count; i++ ) {
		counter.push( i );
	}
	return this.map( counter, iterator, callback );
};

Async.prototype.timesSeries = function timesSeries( count, iterator, callback ) {
	let counter = [];
	for( let i=0; i<count; i++ ) {
		counter.push( i );
	}
	return this.mapSeries( counter, iterator, callback );
};

Async.prototype.seq = function seq(/* functions... */) {
        let that = this;
        let fns = arguments;
        return function () {
            let args     = slice.call( arguments )
              , callback = args.pop();
            that.reduce( fns, args, function( newargs, fn, cb ) {
                fn.apply( that.ctx, newargs.concat([function onResult() {
                    let err      = arguments[0]
                      , nextargs = slice.call( arguments, 1 );
                    cb( err, nextargs );
                }]))
            },
            function onDone( err, results ) {
                callback.apply( that.ctx, [err].concat(results) );
            });
        };
};

Async.prototype.compose = function compose(/* functions... */) {
	return Async.prototype.seq.apply( this, Array.prototype.reverse.call(arguments) );
};

function _applyEach( eachfn, fns /*args...*/ ) {
	let that = this;
	function go() {
		let args     = slice.call( arguments )
		  , callback = args.pop();
		
		return eachfn.call( that, fns, function onItem( fn, cb ) {
			fn.apply( that.ctx, args.concat([cb]) );
		}, function onDone( err, results ) {
			callback.call( that.ctx, err, results );
		});
	};
	if( arguments.length > 2 ) {
		let args = slice.call( arguments, 2 );
		return go.apply( this, args );
	}
	else {
		return go;
	}
}
Async.prototype.applyEach       = doParallel( _applyEach );
Async.prototype.applyEachSeries = doSeries  ( _applyEach );

Async.prototype.forever = function forever( fn, callback ) {
	let context = this.ctx;
	function next( err ) {
		if( err ) {
			if( callback ) {
				callback.call( context, err );
				return;
			}
			throw err;
		}
		fn.call( context, next );
	}
	next();
};

module.exports = new Async();