'use strict';

/*!
______K = 3000:_________
each            : +19.3%
eachSeries      : - 9.8%
eachLimit       : +43.1%
map             : +46.2%
mapSeries       : - 0.4%
mapLimit        : +22.8%
filter          : +22.8%
filterSeries    : + 7.4%
reject          : +29.2%
rejectSeries    : +10.1%
detect          : +11.4%
detectSeries    : - 5.7%
reduce          : -19.4%
reduceRight     : + 9.0%
sortBy          : +17.1%
some            : +12.7%
every           : + 0.7%
concat          : - 0.1%
concatSeries    : - 2.8%
series          : + 9.9%
parallel        : +35.3%
parallelLimit   : +11.5%
whilst          : - 7.0%
until           : - 9.5%
forever         : - 7.3%
waterfall       : - 9.0%
iterator        : + 0.3%
________________________
average         : + 8.8%

*/


let nasync = require( '../lib/node-async' );
let oasync = require( './async' ); // original async

function time( label ) {
	time[label] = Date.now();
}
function timeEnd( label ) {
	let t = time[label];
	if( ! t ) {
		throw new Error( 'No such label: ' + label );
	}
	t = Date.now() - t;
	delete time[label];
	console.log( '%s: %dms', label, t );
	return t;
}

nasync.hits = [];
oasync.hits = [];
let methods = [];
const K = 1000;

nasync.series([
	function( cb ) {
		console.log( "Waiting 3 seconds" );
		setTimeout( cb, 3000 );
	},
	/*!
	 * Each
	 */
	function( cb ) {
		gc();
		const N = 10000*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let cnt = 0;
			function iterator( it, cb ) {
				cnt += it;
				cb();
			}
			setImmediate( function() {
				time( caption );
				lib.each( arr, iterator, function onDone() {
					lib.hits.push( timeEnd(caption) );
					cb();
				});
			});
		}
		
		methods.push( "each" );
		test( "each node-async", nasync, function() {
			test( "each original  ", oasync, cb );
		});
	},
	/*!
	 * Each series
	 */
	function( cb ) {
		gc();
		const N = 4000;
		const M = 4*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let cnt = 0, m = M;
			function iterator( it, cb ) {
				cnt += it;
				cb();
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.eachSeries( arr, iterator, cb );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "eachSeries" );
		test( "eachSeries node-async", nasync, function() {
			test( "eachSeries original  ", oasync, cb );
		});
	},
	/*!
	 * Each limit 1
	 */
	function( cb ) {
		gc();
		const N = 3000;
		const M = 3*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let cnt = 0, m = M;
			function iterator( it, cb ) {
				cnt += it;
				cb();
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.eachLimit( arr, 1, iterator, cb );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "eachLimit" );
		test( "eachLimit   1 node-async", nasync, function() {
			test( "eachLimit   1 original  ", oasync, cb );
		});
	},
	/*!
	 * Each limit 10
	 */
	function( cb ) {
		gc();
		const N = 3000;
		const M = 3*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let cnt = 0, m = M;
			function iterator( it, cb ) {
				cnt += it;
				cb();
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.eachLimit( arr, 10, iterator, cb );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "eachLimit" );
		test( "eachLimit  10 node-async", nasync, function() {
			test( "eachLimit  10 original  ", oasync, cb );
		});
	},
	/*!
	 * Each limit 100
	 */
	function( cb ) {
		gc();
		const N = 3000;
		const M = 3*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let cnt = 0, m = M;
			function iterator( it, cb ) {
				cnt += it;
				cb();
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.eachLimit( arr, 100, iterator, cb );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "eachLimit" );
		test( "eachLimit 100 node-async", nasync, function() {
			test( "eachLimit 100 original  ", oasync, cb );
		});
	},
	/*!
	 * Map
	 */
	function( cb ) {
		gc();
		const N = 5000*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let cnt = 0;
			function iterator( it, cb ) {
				cnt += it;
				cb( undefined, it );
			}
			setImmediate( function() {
				time( caption );
				lib.map( arr, iterator, function onDone() {
					lib.hits.push( timeEnd(caption) );
					cb();
				});
			});
		}
	
		methods.push( "map" );
		test( "map node-async", nasync, function() {
			test( "map original  ", oasync, cb );
		});
	},
	/*!
	 * Map series
	 */
	function( cb ) {
		gc();
		const N = 2000;
		const M = 4*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let cnt = 0, m = M;
			function iterator( it, cb ) {
				cnt += it;
				cb();
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.mapSeries( arr, iterator, cb );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "mapSeries" );
		test( "mapSeries node-async", nasync, function() {
			test( "mapSeries original  ", oasync, cb );
		});
	},
	/*!
	 * Map limit 1
	 */
	function( cb ) {
		gc();
		const N = 2000;
		const M = 3*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let cnt = 0, m = M;
			function iterator( it, cb ) {
				cnt += it;
				cb();
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.mapLimit( arr, 1, iterator, cb );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "mapLimit" );
		test( "mapLimit   1 node-async", nasync, function() {
			test( "mapLimit   1 original  ", oasync, cb );
		});
	},
	/*!
	 * Map limit 10
	 */
	function( cb ) {
		gc();
		const N = 2000;
		const M = 3*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let cnt = 0, m = M;
			function iterator( it, cb ) {
				cnt += it;
				cb();
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.mapLimit( arr, 10, iterator, cb );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "mapLimit" );
		test( "mapLimit  10 node-async", nasync, function() {
			test( "mapLimit  10 original  ", oasync, cb );
		});
	},
	/*!
	 * Map limit 100
	 */
	function( cb ) {
		gc();
		const N = 2000;
		const M = 3*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let cnt = 0, m = M;
			function iterator( it, cb ) {
				cnt += it;
				cb();
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.mapLimit( arr, 100, iterator, cb );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "mapLimit" );
		test( "mapLimit 100 node-async", nasync, function() {
			test( "mapLimit 100 original  ", oasync, cb );
		});
	},
	/*!
	 * Filter
	 */
	function( cb ) {
		gc();
		const N = 2000*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			function iterator( it, cb ) {
				cb( it % 2 );
			}
			setImmediate( function() {
				time( caption );
				lib.filter( arr, iterator, function onDone() {
					lib.hits.push( timeEnd(caption) );
					cb();
				});
			});
		}
	
		methods.push( "filter" );
		test( "filter node-async", nasync, function() {
			test( "filter original  ", oasync, cb );
		});
	},
	/*!
	 * Filter series
	 */
	function( cb ) {
		gc();
		const N = 2000;
		const M = 3*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let m = M;
			function iterator( it, cb ) {
				cb( it % 2 );
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.filterSeries( arr, iterator, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "filterSeries" );
		test( "filterSeries node-async", nasync, function() {
			test( "filterSeries original  ", oasync, cb );
		});
	},
	/*!
	 * Reject
	 */
	function( cb ) {
		gc();
		const N = 2000*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			function iterator( it, cb ) {
				cb( it % 2 );
			}
			setImmediate( function() {
				time( caption );
				lib.reject( arr, iterator, function onDone() {
					lib.hits.push( timeEnd(caption) );
					cb();
				});
			});
		}
	
		methods.push( "reject" );
		test( "reject node-async", nasync, function() {
			test( "reject original  ", oasync, cb );
		});
	},
	/*!
	 * Reject series
	 */
	function( cb ) {
		gc();
		const N = 2000;
		const M = 3*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let m = M;
			function iterator( it, cb ) {
				cb( it % 2 );
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.rejectSeries( arr, iterator, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "rejectSeries" );
		test( "rejectSeries node-async", nasync, function() {
			test( "rejectSeries original  ", oasync, cb );
		});
	},
	/*!
	 * Detect
	 */
	function( cb ) {
		gc();
		const N = 10000*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			function iterator( it, cb ) {
				cb( it === N-1 );
			}
			setImmediate( function() {
				time( caption );
				lib.detect( arr, iterator, function onDone() {
					lib.hits.push( timeEnd(caption) );
					cb();
				});
			});
		}
	
		methods.push( "detect" );
		test( "detect node-async", nasync, function() {
			test( "detect original  ", oasync, cb );
		});
	},
	/*!
	 * Detect series
	 */
	function( cb ) {
		gc();
		const N = 2000;
		const M = 6*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let m = M;
			function iterator( it, cb ) {
				cb( it === N-1 );
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.detectSeries( arr, iterator, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "detectSeries" );
		test( "detectSeries node-async", nasync, function() {
			test( "detectSeries original  ", oasync, cb );
		});
	},
	/*!
	 * Reduce
	 */
	function( cb ) {
		gc();
		const N = 2000;
		const M = 6*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let m = M;
			function iterator( memo, it, cb ) {
				cb( undefined, memo+it );
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.reduce( arr, 0, iterator, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "reduce" );
		test( "reduce node-async", nasync, function() {
			test( "reduce original  ", oasync, cb );
		});
	},
	/*!
	 * Reduce right
	 */
	function( cb ) {
		gc();
		const N = 2000;
		const M = 6*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let m = M;
			function iterator( memo, it, cb ) {
				cb( undefined, memo+it );
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.reduceRight( arr, 0, iterator, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "reduceRight" );
		test( "reduceRight node-async", nasync, function() {
			test( "reduceRight original  ", oasync, cb );
		});
	},
	/*!
	 * SortBy
	 */
	function( cb ) {
		gc();
		const N = 2000;
		const M = 1*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let m = M;
			function iterator( it, cb ) {
				cb( undefined, N-it );
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.sortBy( arr, iterator, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "sortBy" );
		test( "sortBy node-async", nasync, function() {
			test( "sortBy original  ", oasync, cb );
		});
	},
	/*!
	 * Some
	 */
	function( cb ) {
		gc();
		const N = 10000*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			function iterator( it, cb ) {
				cb( it===N-1 );
			}
			setImmediate( function() {
				time( caption );
				lib.some( arr, iterator, function onDone() {
					lib.hits.push( timeEnd(caption) );
					cb();
				});
			});
		}
	
		methods.push( "some" );
		test( "some node-async", nasync, function() {
			test( "some original  ", oasync, cb );
		});
	},
	/*!
	 * Every
	 */
	function( cb ) {
		gc();
		const N = 10000*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			function iterator( it, cb ) {
				cb( it<N );
			}
			setImmediate( function() {
				time( caption );
				lib.every( arr, iterator, function onDone() {
					lib.hits.push( timeEnd(caption) );
					cb();
				});
			});
		}
	
		methods.push( "every" );
		test( "every node-async", nasync, function() {
			test( "every original  ", oasync, cb );
		});
	},
	/*!
	 * Concat
	 */
	function( cb ) {
		gc();
		const N = 50*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			function iterator( it, cb ) {
				cb( undefined, [it*2] );
			}
			setImmediate( function() {
				time( caption );
				lib.concat( arr, iterator, function onDone() {
					lib.hits.push( timeEnd(caption) );
					cb();
				});
			});
		}
	
		methods.push( "concat" );
		test( "concat node-async", nasync, function() {
			test( "concat original  ", oasync, cb );
		});
	},
	/*!
	 * Concat series
	 */
	function( cb ) {
		gc();
		const N = 1500;
		const M = 1*K;
		let arr = [];
		for( let i=0; i<N; i++ ) { arr.push(i); }
	
		function test( caption, lib, cb ) {
			let m = M;
			function iterator( it, cb ) {
				cb( undefined, [it*2] );
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.concatSeries( arr, iterator, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "concatSeries" );
		test( "concatSeries node-async", nasync, function() {
			test( "concatSeries original  ", oasync, cb );
		});
	},
	/*!
	 * Series
	 */
	function( cb ) {
		gc();
		const N = 1000;
		const M = 2*K;
		let arr = [];
		function iterator( cb ) {
			cb( undefined, 2*10 );
		}
		for( let i=0; i<N; i++ ) { arr.push(iterator); }
	
		function test( caption, lib, cb ) {
			let m = M;
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.series( arr, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "series" );
		test( "series node-async", nasync, function() {
			test( "series original  ", oasync, cb );
		});
	},
	/*!
	 * Parallel
	 */
	function( cb ) {
		gc();
		const N = 1000;
		const M = 2*K;
		let arr = [];
		function iterator( cb ) {
			cb( undefined, 2*10 );
		}
		for( let i=0; i<N; i++ ) { arr.push(iterator); }
	
		function test( caption, lib, cb ) {
			let m = M;
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.parallel( arr, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "parallel" );
		test( "parallel node-async", nasync, function() {
			test( "parallel original  ", oasync, cb );
		});
	},
	/*!
	 * Parallel limit 1
	 */
	function( cb ) {
		gc();
		const N = 1000;
		const M = 2*K;
		let arr = [];
		function iterator( cb ) {
			cb( undefined, 2*10 );
		}
		for( let i=0; i<N; i++ ) { arr.push(iterator); }
	
		function test( caption, lib, cb ) {
			let m = M;
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.parallelLimit( arr, 1, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "parallelLimit" );
		test( "parallelLimit   1 node-async", nasync, function() {
			test( "parallelLimit   1 original  ", oasync, cb );
		});
	},
	/*!
	 * Parallel limit 10
	 */
	function( cb ) {
		gc();
		const N = 1000;
		const M = 2*K;
		let arr = [];
		function iterator( cb ) {
			cb( undefined, 2*10 );
		}
		for( let i=0; i<N; i++ ) { arr.push(iterator); }
	
		function test( caption, lib, cb ) {
			let m = M;
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.parallelLimit( arr, 10, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "parallelLimit" );
		test( "parallelLimit  10 node-async", nasync, function() {
			test( "parallelLimit  10 original  ", oasync, cb );
		});
	},
	/*!
	 * Parallel limit 100
	 */
	function( cb ) {
		gc();
		const N = 1000;
		const M = 2*K;
		let arr = [];
		function iterator( cb ) {
			cb( undefined, 2*10 );
		}
		for( let i=0; i<N; i++ ) { arr.push(iterator); }
	
		function test( caption, lib, cb ) {
			let m = M;
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.parallelLimit( arr, 100, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "parallelLimit" );
		test( "parallelLimit 100 node-async", nasync, function() {
			test( "parallelLimit 100 original  ", oasync, cb );
		});
	},
	/*!
	 * Whilst
	 */
	function( cb ) {
		gc();
		const N = 1000;
		const M = 20*K;
	
		function test( caption, lib, cb ) {
			let m = M, cnt = 0;
			function iterator( cb ) {
				cb();
			}
			function condition() {
				cnt++;
				return cnt < N;
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						cnt = 0;
						setImmediate( function() {
							lib.whilst( condition, iterator, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "whilst" );
		test( "whilst node-async", nasync, function() {
			test( "whilst original  ", oasync, cb );
		});
	},
	/*!
	 * Until
	 */
	function( cb ) {
		gc();
		const N = 1000;
		const M = 20*K;
	
		function test( caption, lib, cb ) {
			let m = M, cnt = 0;
			function iterator( cb ) {
				cb();
			}
			function condition() {
				cnt++;
				return cnt === N;
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						cnt = 0;
						setImmediate( function() {
							lib.until( condition, iterator, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "until" );
		test( "until node-async", nasync, function() {
			test( "until original  ", oasync, cb );
		});
	},
	/*!
	 * Forever
	 */
	function( cb ) {
		gc();
		const N = 1000;
		const M = 20*K;
	
		function test( caption, lib, cb ) {
			let m = M, cnt = 0;
			function iterator( cb ) {
				cnt++;
				if( cnt==N ) {
					cb( new Error('') );
				}
				else {
					cb();
				}
			}
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						cnt = 0;
						setImmediate( function() {
							lib.forever( iterator, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "forever" );
		test( "forever node-async", nasync, function() {
			test( "forever original  ", oasync, cb );
		});
	},
	/*!
	 * Waterfall no args
	 */
	function( cb ) {
		gc();
		const N = 100;
		const M = 2*K;
		let arr = [];
		function iterator( cb ) {
			cb();
		}
		for( let i=0; i<N; i++ ) { arr.push(iterator); }
	
		function test( caption, lib, cb ) {
			let m = M;
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.waterfall( arr, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "waterfall" );
		test( "waterfall no args node-async", nasync, function() {
			test( "waterfall no args original  ", oasync, cb );
		});
	},
	/*!
	 * Waterfall 1 arg
	 */
	function( cb ) {
		gc();
		const N = 100;
		const M = 2*K;
		let arr = [
			function( cb ) { cb( undefined, 1 ); }
		];
		function iterator( it, cb ) {
			cb( undefined, it+1 );
		}
		for( let i=0; i<N; i++ ) { arr.push(iterator); }
	
		function test( caption, lib, cb ) {
			let m = M;
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.waterfall( arr, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "waterfall" );
		test( "waterfall  1 arg node-async", nasync, function() {
			test( "waterfall  1 arg original  ", oasync, cb );
		});
	},
	/*!
	 * Waterfall 5 arg
	 */
	function( cb ) {
		gc();
		const N = 100;
		const M = 2*K;
		let arr = [
			function( cb ) { cb( undefined, 1, 2, 3, 4, 5 ); }
		];
		function iterator( it1, it2, it3, it4, it5, cb ) {
			cb( undefined, it1+1, it2+1, it3+1, it4+1, it5+1 );
		}
		for( let i=0; i<N; i++ ) { arr.push(iterator); }
	
		function test( caption, lib, cb ) {
			let m = M;
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						setImmediate( function() {
							lib.waterfall( arr, function(){ cb(); } );
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "waterfall" );
		test( "waterfall  5 arg node-async", nasync, function() {
			test( "waterfall  5 arg original  ", oasync, cb );
		});
	},
	/*!
	 * Iterator
	 */
	function( cb ) {
		gc();
		const N = 100;
		const M = 500*K;
		let arr = [];
		function iterator( cb ) {
			cb();
		}
		for( let i=0; i<N; i++ ) { arr.push(iterator); }
	
		function test( caption, lib, cb ) {
			let m = M;
			setImmediate( function() {
				time( caption );
				nasync.whilst(
					function(){ return m>0; },
					function( cb ) {
						m--;
						function wrapIterator( iterator ) {
							return function ( err ) {
								let next = iterator.next();
								if( ! next ) {
									args.push( wrapIterator(next) );
									setImmediate( function () {
										iterator( wrapIterator(next) );
									});
								}
								else {
									cb();
								}
							};
						}
						setImmediate( function() {
							wrapIterator( lib.iterator(arr) )();
							
						});
					},
					function onDone() {
						lib.hits.push( timeEnd(caption) );
						cb();
					}
				);
			});
		}
	
		methods.push( "iterator" );
		test( "iterator  arg node-async", nasync, function() {
			test( "iterator  arg original  ", oasync, cb );
		});
	},

	
	/*!
	 * Statistics
	 */
	function( cb ) {
		let cnt = nasync.hits.length, sum = 0, rat;
		let subsum = 0, subcnt = 0, dup = 0;
		if( cnt ) {
			console.log( "________________" );
			for( let i=0; i<cnt; i++ ) {
				rat = -1 + oasync.hits[i]/nasync.hits[i];
				if( methods[i+1] && methods[i]===methods[i+1] ) {
					subsum += rat;
					subcnt++;
					continue;
				}
				else if( subcnt > 0 ) {
					dup += subcnt;
					subsum += rat;
					subcnt++;
					rat = subsum/subcnt;
					subsum = 0;
					subcnt = 0;
				}
				console.log( "%s: %s%s%%", methods[i], (rat>0?'+':''), (rat*100).toFixed(1) );
				
				sum += rat;
			}
			rat = sum/(cnt-dup);
			console.log( "________________" );
			console.log( "average: %s%d%%", (rat>0?'+':''), (rat*100).toFixed(1) );
		}
	}
]);