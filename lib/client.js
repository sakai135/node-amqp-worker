var amqp = require('amqplib/callback_api');
var async = require('async');

function Client(url, options) {
  this.url = url;
  this.options = options;

  this.connection = null;
  this.workers = [];
}
Client.prototype.addWorker = function addWorker(worker) {
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
    }), function(err, results) {
      if (err) {
        return conn.close(function() {
          callback(err);
        });
      }
      callback(null, {
        connection: conn,
        consumers: results
      });
    });
  }.bind(this);
  amqp.connect(this.url, this.options, onConnect);
};
Client.prototype.bail = function bail(err) {
  function exit() {
    this.connection = null;
    process.exit(1);
  }
  console.error(err);
  if (this.connection) {
    this.connection.close(exit);
  } else {
    exit();
  }
};

module.exports = Client;
