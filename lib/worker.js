'use strict';

var util = require('util');
var events = require('events');

function Worker(name, handler, options) {
  events.EventEmitter.call(this);

  options = options || {};
  this.name = name;
  this.options = options.queue || {};
  this.handler = handler;
  this.handlerOptions = options.consumer || {};
  this.prefetchCount = options.count || 0;
  this.requeue = (typeof options.requeue !== 'undefined') ?
    options.requeue : true;

  this.channel = null;
  this.status = {};
  this.consumer = {};
}

util.inherits(Worker, events.EventEmitter);

Worker.prototype.start = function(conn, callback) {
  var work = function(msg) {
    this.handler(msg, function(err, result) {
      if (!this.handlerOptions.noAck) {
        if (err) {
          this.channel.nack(msg, false, this.requeue);
        } else {
          this.channel.ack(msg);
        }
      }
      this.emit('complete', {
        err: err,
        result: result,
        msg: msg
      });
    }.bind(this));
  }.bind(this);
  var consume = function onUpdate(err, status) {
    if (err) {
      return callback(err);
    }
    this.status = status;
    this.channel.consume(this.name, work, this.handlerOptions, callback);
  }.bind(this);
  var assert = function onCreateChannel(err, chan) {
    if (err) {
      return callback(err);
    }
    this.channel = chan;
    this.channel.prefetch(this.prefetchCount);
    this.channel.assertQueue(this.name, this.options, consume);
  }.bind(this);
  conn.createChannel(assert);
};

module.exports = Worker;
