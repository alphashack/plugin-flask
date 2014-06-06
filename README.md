# Flask Graphdat Plugin

## Tracks the following metrics for [flask](https://github.com/alphashack/graphdat.cube)

* FLASK_BLOCKS (BC) - Blocks Cached
* FLASK_BLOCKS_MEMORY (BM) - Blocks of Memory Currently Allocated
* FLASK_BLOCKS_FILES (BFC) - Block File Count
* FLASK_BLOCKS_WRITTEN (BCO) - Block Chunks Written Out
* FLASK_BLOCKS_TOSSED - (BBT) - Blocks Tossed out of Cache
* FLASK_CONNECTIONS - (SC) - Server Connects
* FLASK_CURRENT_CONNECTIONS - (STC) - Server Total Current Connections
* FLASK_DISCONNECTIONS - (SD) - Server Disconnects
* FLASK_MEMORY (MT) - Memory Total Allocated
* FLASK_MEMORY_ALLOCS - (MTA) - Memory Total Number of Allocations
* FLASK_MEMORY_CURRENT_ALLOCS - (MO) - Memory Outstanding Allocations
* FLASK_MEMORY_HIGHWATER - (MH) - Memory High Water Mark
* FLASK_MEMORY_LARGEST - (ML) - Memory Largest Allocation
* FLASK_REQUESTS - (SR) - Server Requests
* FLASK_QUEUE_BACKLOG - (QBL) - Queue Backlog

## Pre Reqs

To get statistics from flask, you need to be running flask.

### Installation & Configuration

* The `source` to prefix the display in the legend for the flask data.
  * It will default to the hostname of the server.
* The LogPath is the location of the flask log file and is a required value.
  * It will default to /home/ubuntu/projects/graphdat.cube/shared/log/flask.log
