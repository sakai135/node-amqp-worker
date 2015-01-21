# node-amqp-worker

[ ![Codeship Status for sakai135/node-amqp-worker](https://codeship.com/projects/fac690a0-831b-0132-7b7b-366b1854f7f3/status?branch=master)](https://codeship.com/projects/58062) [![Code Climate](https://codeclimate.com/github/sakai135/node-amqp-worker/badges/gpa.svg)](https://codeclimate.com/github/sakai135/node-amqp-worker) [![Test Coverage](https://codeclimate.com/github/sakai135/node-amqp-worker/badges/coverage.svg)](https://codeclimate.com/github/sakai135/node-amqp-worker) ![David](https://david-dm.org/sakai135/node-amqp-worker.svg)

## Quick Start

```javascript
var lib = require('amqp-worker');
var Client = lib.Client;
var Worker = lib.Worker;

var client = new Client('amqp://localhost');

var worker = new Worker('queue_name', function(msg, callback) {
  // do stuff with msg
  if (err) {
    // nack the message
    return callback(err);
  }

  // ack the message
  callback(null, result);
});

worker.on('complete', function(data) {
  // this worker's handler completed a message
  console.log(data);
});

client.addWorker(worker);

client.on('complete', function(data) {
  // a worker handler completed a message
  console.log(data);
});

client.connect(function() {
  console.log('workers started');
});
```
