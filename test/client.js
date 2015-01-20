var assert = require('assert');
var amqp = require('amqplib');
var lib = require('../');
var Client = lib.Client;
var Worker = lib.Worker;

describe('Client', function() {
  describe('#connect()', function() {

    it('should connect', function(done) {
      var client = new Client();
      client.connect(function(err) {
        if (err) {
          done(err);
        }
        client.close(done);
      });
    });

    it('should error on wrong config', function(done) {
      var client = new Client('amqp://wrong');
      client.connect(function(err) {
        if (err) {
          done();
        } else {
          done(new Error('should have error\'ed'));
        }
      });
    });

    it('should emit complete on worker message completion', function(done) {
      amqp.connect().then(function(conn) {
        return conn.createChannel();
      }).then(function(chan) {
        chan.sendToQueue('demo', new Buffer(JSON.stringify({
          hi: 'test'
        })));
        chan.close();
      });

      var client = new Client();
      client.addWorker(new Worker('demo', function(msg, callback) {
        callback();
      }));
      client.connect(function() {});
      client.on('complete', function(data) {
        if (data.err) {
          done(data.err);
        } else {
          client.close(done);
        }
      });
    });

  });
});
