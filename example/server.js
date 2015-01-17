var lib = require('amqp-worker');
var Client = lib.Client;
var Worker = lib.Worker;

// create instance of Client for a connection
var client = new Client(

  // AMQP URL to connect to, same as url parameter on amqplib connect
  'amqp://localhost',

  // options to send on connect, same as socketOptions on amqplib connect
  {
    heartbeat: 580
  }
);

// create instance of Worker for channel and consume
var worker = new Worker(
  // queue name
  'demo',

  // message handler
  // msg will be the same object passed to message callback on amqplib Channel#consume
  function(msg, callback) {
    try {
      var data = JSON.parse(msg.content);

      // the message is ack'ed on success
      // second parameter is optional for logging
      callback(null, data);
    } catch(err) {

      // the message is nack'ed on error
      callback(err);
    }
  },

  {
    // queue options, same as options on amqplib Channel#assertQueue
    queue: {
      durable: true
    },

    // consumer options, same as options on amqplib Channel#consume
    consumer: {

      // if noAck is true, messages won't be ack/nack'ed upon completion
      noAck: true
    },

    // prefetch count
    count: 5,

    // requeue on nack
    requeue: true
  }
);

// you can add multiple workers to a client
client.addWorker(worker);

// connect starts the connection and starts the queue workers
client.connect(function(err, info) {
  if (err) {
    console.log(err);
    return process.exit(1);
  }

  console.log(info);
});
