'use strict';

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var lib = require('../');
var Client = lib.Client;
var Worker = lib.Worker;

lab.experiment('Client', function() {
  lab.experiment('#connect()', function() {

    lab.test('should connect', function(done) {
      var client = new Client('amqp://localhost', {});
      client.connect(function() {
        client.close(done);
      });
    });

    lab.test('should error on wrong config', function(done) {
      var client = new Client('amqp://wrong:user@localhost');
      client.connect(function(err) {
        if (err) {
          return client.close(done);
        }
        done(new Error('should have error\'ed'));
      });
    });

  });
  lab.experiment('#close()', function() {

    lab.test('can be called multiple times', function(done) {
      var client = new Client();
      client.connect(function() {
        client.close();
        client.close(done);
      });
    });

  });
  lab.experiment('#addWorker()', function() {

    lab.test('emit complete on worker message completion', function(done) {
      var client = new Client();
      var worker = new Worker('clienttest1',
                              function(msg, callback) { callback(); },
                              { queue: { exclusive: true } });
      client.addWorker(worker);
      client.on('complete', function() {
        client.close(done);
      });
      client.connect(function() {
        worker.channel.sendToQueue('clienttest1', new Buffer(1));
      });
    });
    /*
    lab.test('should error on worker start error', function(done) {
      var client = new Client();
      var worker = new Worker('clienttest2',
                              function() {},
                              { queue: { exclusive: true } });
      var worker2 = new Worker('clienttest2',
                              function() {},
                              { queue: { exclusive: false } });
      client.addWorker(worker);
      client.addWorker(worker2);
      client.connect(function(err) {
//        if (err && err.toString().indexOf('PRECONDITION_FAILED') !== -1) {
//          return client.close(done);
//          return done();
//        }
//        done(new Error('should give error'));
      });
    });
    */
  });
});
