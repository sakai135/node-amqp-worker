var amqp = require('amqplib');

amqp.connect('amqp://guest:guest@localhost').then(function(conn) {
  return conn.createChannel();
}).then(function(chan) {
  for (var i=0; i < 100; i++) {
    chan.sendToQueue('demo', new Buffer(JSON.stringify({
      hi: i
    })));
    console.log(i);
  }
});
