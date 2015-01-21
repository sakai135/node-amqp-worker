'use strict';

var util = require('util');
var events = require('events');
var amqp = require('amqplib/callback_api');
var async = require('async');

function Client(url, options) {
  events.EventEmitter.call(this);

  this.url = url || null;
  this.options = options || {};

  this.connection = null;
  this.workers = [];
}

util.inherits(Client, events.EventEmitter);

Client.prototype.addWorker = function addWorker(worker) {
  worker.on('complete', function(data) {
    this.emit('complete', data);
  }.bind(this));
  this.workers.push(worker);
};

Client.prototype.connect = function connect(callback) {
  var onConnect = function onConnect(err, conn) {
    if (err) {
      return callback(err);
    }
    conn.on('close', function(err) {
      this.connection = null;
      this.emit('close', {
        err: err
      });
    }.bind(this));
    conn.on('error', function(err) {
      this.emit('error', err);
    }.bind(this));
    this.connection = conn;
    async.series(this.workers.map(function(worker) {
      return function(cb) {
        worker.start(conn, cb);
      };
    }), callback);
  }.bind(this);
  amqp.connect(this.url, this.options, onConnect);
};
Client.prototype.close = function close(callback) {
  callback = callback || function() {};
  if (this.connection) {
    try {
      this.connection.close(function() {
        callback();
      });
    } catch(ex) {
      callback();
    }
    return;
  }
  callback();
};

module.exports = Client;
