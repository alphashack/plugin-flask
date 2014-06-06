var _ = require('underscore');
var _request = require('request');

var args = process.argv;
if (args.length !== 5) {
    console.log("Usage: node upload-stats.js [api] [email] [apikey]");
    process.exit(0);
}

var _endpoint = args[2];
var _user = args[3];
var _apiKey = args[4];

var _projectId = _apiKey.split('-')[1];

var stats = [
  { name: 'FLASK_BLOCKS',
    displayName: 'Flask Blocks',
    description: 'The number of blocks cached',
    unit: 'number',
    displayNameShort: 'flask-blocks',
    defaultAggregate: 'MAX' },
  { name: 'FLASK_BLOCKS_MEMORY',
    displayName: 'Flask Blocks Memory',
    description: 'the amount of memory currently allocated',
    unit: 'bytes',
    displayNameShort: 'flask-memory',
    defaultAggregate: 'AVG' },
  { name: 'FLASK_BLOCKS_FILES',
    displayName: 'Flask Block File Count',
    description: 'the number of files',
    unit: 'number',
    displayNameShort: 'flask-files',
    defaultAggregate: 'MAX' },
  { name: 'FLASK_BLOCKS_WRITTEN',
    displayName: 'Flask Blocks Written',
    description: 'the number of blocks written',
    unit: 'number',
    displayNameShort: 'flask-writes',
    defaultAggregate: 'SUM' },
  { name: 'FLASK_BLOCKS_TOSSED',
    displayName: 'Flask Cache Removals',
    description: 'the number of blocks removed from the cache',
    unit: 'number',
    displayNameShort: 'flask-cache-removals',
    defaultAggregate: 'SUM' },
  { name: 'FLASK_CONNECTIONS',
    displayName: 'Flask Connections',
    description: 'the number of flask connects',
    unit: 'number',
    displayNameShort: 'flask-conn',
    defaultAggregate: 'MAX' },
  { name: 'FLASK_CURRENT_CONNECTIONS',
    displayName: 'Flask Current Connections',
    description: 'the number of flask current connects',
    unit: 'number',
    displayNameShort: 'flask-current-conn',
    defaultAggregate: 'MAX' },
  { name: 'FLASK_DISCONNECTIONS',
    displayName: 'Flask Disconnections',
    description: 'the number of flask disconnections',
    unit: 'number',
    displayNameShort: 'flask-disconnects',
    defaultAggregate: 'MAX' },
  { name: 'FLASK_MEMORY',
    displayName: 'Flask Memory',
    description: 'the amount of memory allocated to Flask',
    unit: 'bytes',
    displayNameShort: 'flask-memory',
    defaultAggregate: 'SUM' },
  { name: 'FLASK_MEMORY_ALLOCS',
    displayName: 'Flask Memory Allocations',
    description: 'the number of memory allocations',
    unit: 'number',
    displayNameShort: 'flask-mem-allocs',
    defaultAggregate: 'SUM' },
  { name: 'FLASK_MEMORY_CURRENT_ALLOCS',
    displayName: 'Flask Memory Current Allocations',
    description: 'the number of outstanding memory allocations',
    unit: 'number',
    displayNameShort: 'flask-mem-curr-alloc',
    defaultAggregate: 'SUM' },
  { name: 'FLASK_MEMORY_HIGHWATER',
    displayName: 'Flask High Water Mark',
    description: 'the Flask Memory Limit',
    unit: 'bytes',
    displayNameShort: 'flask-memory-limit',
    defaultAggregate: 'MAX' },
  { name: 'FLASK_MEMORY_LARGEST',
    displayName: 'Flask Memory Largest Allocation',
    description: 'the largest memory allocation',
    unit: 'bytes',
    displayNameShort: 'flask-large-alloc',
    defaultAggregate: 'MAX' },
  { name: 'FLASK_REQUESTS',
    displayName: 'Flask Requests',
    description: 'the number of server requests',
    unit: 'number',
    displayNameShort: 'flask-requests',
    defaultAggregate: 'SUM' },
  { name: 'FLASK_QUEUE_BACKLOG',
    displayName: 'Flask Queue Backlog',
    description: 'the number of operations in the backlog',
    unit: 'number',
    displayNameShort: 'flask-queue-backlog',
    defaultAggregate: 'SUM' }
];

//verify these stats are the same as the plugin.json
var plugin = require('./plugin.json');
var pluginMetrics = plugin.metrics;
var uploadMetrics = stats.map(function(stat) { return stat.name; });

var pDiff = _.difference(pluginMetrics, uploadMetrics);
if (pDiff.length > 0)
{
	console.log('The following metrics are missing from the upload metrics list');
	console.log(pDiff);
	process.exit(-1);
}
var uDiff = _.difference(uploadMetrics, pluginMetrics);
if (uDiff.length > 0)
{
	console.log('The following metrics are missing from the plugin metrics list');
	console.log(uDiff);
	process.exit(-1);
}

// add the projectId to the stats
stats.forEach(function(stat)
{
	stat.projectId = _projectId;
	_request(
		{
			auth: { 'user': _user, 'pass': _apiKey, sendImmediately: true },
			method: 'PUT',
			uri: 'https://' + _endpoint + '/v1/metrics/' + stat.name,
			json: stat
		},
		function(err, resp, body)
		{
			if (err)
			{
				console.error(err);
				process.exit(-1);
			}
			if (resp.statusCode !== 200)
			{
				console.error('The status code for the HTTP request %s was %s', stat.name, resp.statusCode);
				process.exit(-1);
			}

			console.log('Successfully saved ' + stat.name);
		}
	);
});
