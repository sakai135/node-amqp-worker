var util = require('util');
var events = require('events');
var amqp = require('amqplib/callback_api');
var async = require('async');

function Client(url, options) {
  events.EventEmitter.call(this);

  this.url = url;
  this.options = {} || options;

  this.connection = null;
  this.workers = [];
}

util.inherits(Client, events.EventEmitter);

Client.prototype.addWorker = function addWorker(worker) {
  worker.on('complete', function(data) {
    this.emit('complete', data);
  }.bind(this));
  worker.on('close', function(data) {
    this.emit('close', data);
  }.bind(this));
  this.workers.push(worker);
};

Client.prototype.connect = function connect(callback) {
  var onConnect = function onConnect(err, conn) {
    if (err) {
      return callback(err);
    }
    this.connection = conn;
    async.parallel(this.workers.map(function(worker) {
      return function(cb) {
        worker.start(conn, cb);
      };
    }), function(err) {
      if (err) {
        return conn.close(function() {
          callback(err);
        });
      }
      callback(null);
    });
  }.bind(this);
  amqp.connect(this.url, this.options, onConnect);
};

module.exports = Client;
