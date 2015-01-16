var amqp = require('amqplib');
var Promise = require('bluebird');

function setupChannel(conn, config) {
  return conn.createChannel().then(function(chan) {
    return chan.assertQueue(
      config.queue.name,
      config.queue.options
    ).then(function() {
      chan.prefetch(config.count);
    }).then(function() {
      setupWorker(chan, config);
    });
  })
}

function setupConsumer(chan, config) {
  return chan.consume(assertion.queue, function(msg) {
    Promise.resolve(config.worker.handler(msg))
      .then(function(res) {
        console.log(res);
        return chan.ack(msg);
      }, function(err) {
        console.log(err);
        return chan.reject(msg);
      });
  }, config.worker.options);
}

function start(config) {
  amqp.connect(
    config.connection.url,
    config.connection.options
  ).then(function(conn) {
    return Promise.all(config.queues.map(function(queueConfig) {
      return setupChannel(conn, queueConfig)
        .then(function(chan) {
          setupConsumer(chan, queueConfig);
        });
    }));
  }).then(function(consumers) {
    console.log('consumers started');
  }, function(err) {
    console.log(err);
  });
}

module.exports = {
  start: start
};
