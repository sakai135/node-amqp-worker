var config = require('./config');
var manager = require('../lib');

var config = {
  connection: {
    url: 'amqp://localhost',

    // socketOptions on amqplib connect
    options: {}
  },
  queues: [
    {
      queue: {
        // queue parameter on amqplib Channel#assertQueue
        name: 'demo',

        // options parameter on amqplib Channel#assertQueue
        options: {
          durable: true
        }
      },
      worker: {
        // msg as described in amqplib Channel#consume
        handler: function(msg) {
          console.log(JSON.parse(msg.content.toString()));

          // must return promise
          return Promise.resolve('hi');
        },

        // options parameter on amqplib Channel#consume
        options: {
          noAck: false
        },

        // count parameter on amqplib Channel#prefetch
        count: 5
      }
    }
  ]
};

manager.start(config);
