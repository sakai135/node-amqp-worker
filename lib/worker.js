function Worker(name, handler, options) {
  options = options || {};
  this.name = name;
  this.options = options.queue;
  this.handler = handler;
  this.handlerOptions = options.consumer;
  this.prefetchCount = options.count || 0;
  this.requeue = options.requeue;

  this.channel = null;
  this.status = {};
  this.consumer = {};
}
Worker.prototype.start = function(conn, callback) {
  var work = function(msg) {
    this.handler(msg, function(err, result) {
      if (err) {
        console.warn({
          id: msg.fields.deliveryTag,
          err: err
        });
        if (!this.handlerOptions.noAck) {
          this.channel.nack(msg, false, this.requeue);
        }
        return;
      }
      console.info({
        id: msg.fields.deliveryTag,
        status: 'success',
        result: result
      });
      if (!this.handlerOptions.noAck) {
        this.channel.ack(msg);
      }
    });
  }.bind(this);
  var consume = function onUpdate(err) {
    if (err) {
      return callback(err);
    }
    this.channel.consume(this.name, work, this.handlerOptions, callback);
  }.bind(this);
  var assert = function onCreateChannel(err, chan) {
    if (err) {
      return callback(err);
    }
    this.channel = chan;
    this.channel.prefetch(this.prefetchCount);
    this.assert(consume);
  }.bind(this);
  conn.createChannel(assert);
};
Worker.prototype.assert = function(callback) {
  var onAssertQueue = function onAssertQueue(err, status) {
    if (err) {
      return callback(err);
    }
    this.status = status;
    callback(null, status);
  }.bind(this);
  this.channel.assertQueue(this.name, this.options, onAssertQueue);
};

module.exports = Worker;
