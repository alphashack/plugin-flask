var _fs = require('fs');
var _os = require('os');
var _param = require('./param.json');
var _tools = require('graphdat-plugin-tools');
var _Tail = require('always-tail');

/*
E|5000ms STC|161 SC|4 SD|6 SR|911 MT|591.2mb MH|629.9mb MTA|1791186124 MO|308914
BC|7406 BM|462.8mb BFC|8214 BCO|37267 BBT|0 QBL|0 ML|383.9kb ../../../../lib/libc/stringmap.c @ 34
TQ0|0/803 TQ1|0/812 TQ2|0/802 TQ3|0/802 TCW|54/4 TSY|0/0 TSA|0/8
*/

var _map = {
    "BC":  { name: "FLASK_BLOCKS",                type: "number" }, // Blocks Caches
    "BM":  { name: "FLASK_BLOCKS_MEMORY",         type: "bytes" },  // Blocks of Memory Currently Allocated
    "BFC": { name: "FLASK_BLOCKS_FILES",          type: "number" }, // Block File Count
    "BCO": { name: "FLASK_BLOCKS_WRITTEN",        type: "number" }, // Block Chunks Written Out
    "BBT": { name: "FLASK_BLOCKS_TOSSED",         type: "number" }, // Blocks Tossed out of Cache
    "SC":  { name: "FLASK_CONNECTIONS",           type: "number" }, // Server Connects
    "STC": { name: "FLASK_CURRENT_CONNECTIONS",   type: "number" }, // Server Total Current Connections
    "SD":  { name: "FLASK_DISCONNECTIONS",        type: "number" }, // Server Disconnects
    "MT":  { name: "FLASK_MEMORY",                type: "bytes" },  // Memory Total Allocated
    "MTA": { name: "FLASK_MEMORY_ALLOCS",         type: "number" }, // Memory Total Number of Allocations
    "MO":  { name: "FLASK_MEMORY_CURRENT_ALLOCS", type: "number" }, // Memory Outstanding Allocations
    "MH":  { name: "FLASK_MEMORY_HIGHWATER",      type: "bytes" },  // Memory High Water Mark
    "ML":  { name: "FLASK_MEMORY_LARGEST",        type: "bytes" },  // Memory Largest Allocation
    "SR":  { name: "FLASK_REQUESTS",              type: "number" }, // Server Requests
    "QBL": { name: "FLASK_QUEUE_BACKLOG",         type: "number" }  // Queue Backlog
};

var _source; // what name do we show in the legend;
var _tail; // tailing the log file
var _ts; // the last time we polled

// check the location of the log file
if (!_param.logPath) {
    console.error('The flask log path is not set, please set the path and run the plugin again');
    process.exit(1);
}
if (!_fs.existsSync(_param.logPath)) {
    console.error('The flask log file was not found, please check that %s exists and the correct permissions are set', _param.logPath);
    process.exit(1);
}

// tail the log file.  Tail can handle the log rotation
var file = _fs.statSync(_param.logPath);
_tail = new _Tail(_param.logPath, '\n', { interval: 1000, start: file.size });

// If we do not have a source, we prefix everything with the servers hostname
_source = (_param.source || _os.hostname()).trim();

// convert the flask mb value into bytes
function toBytes(value) {
    if (!value)
        return 0;

    if (value.indexOf('gb') !== -1) {
        value = value.replace('gb', '');
        value = value * 1024 * 1024 * 1024;
    }
    else if (value.indexOf('mb') !== -1) {
        value = value.replace('mb','');
        value = value * 1024 * 1024;
    }
    else if (value.indexOf('kb') !== -1) {
        value = value.replace('kb', '');
        value = value * 1024;
    }
    else
        return 0;

    return value;
}

// there was an error reading from the file
function gotError(error) {
    console.error(error);
}

// get the stats, format the output and send to stdout
function gotData(data)
{
    if (data === '')
        return;
    if (data.indexOf('|') === -1)
        return;

    var now = Date.now();
    var kvps = data.split(' ');

    kvps.forEach(function(kvp) {
        var kv = kvp.split('|');
        if (kv.length !== 2)
            return;

        var key = kv[0];
        var value = kv[1];
        var mapped = _map[key];
        if (!mapped)
            return;

        if (mapped.type === 'bytes')
            value = toBytes(value);

        console.log('%s %s %s', mapped.name, value, _source);
    });
}

_tail.on('line', gotData);
_tail.on('error', gotError);
_tail.watch();
