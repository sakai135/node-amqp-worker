'use strict';

var assert = require('assert');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var lib = require('../');
var Client = lib.Client;
var Worker = lib.Worker;

lab.experiment('Worker', function() {
  lab.experiment('constructor', function() {

    lab.test('default to requeue', function(done) {
      var worker = new Worker('workertest1', function() {});
      assert.equal(worker.requeue, true);
      done();
    });

    lab.test('requeue takes false', function(done) {
      var worker = new Worker('workertest2', function() {}, { requeue: false });
      assert.equal(worker.requeue, false);
      done();
    });

    lab.test('prefetch is set', function(done) {
      var worker = new Worker('workertest3', function() {}, { count: 5 });
      assert.equal(worker.prefetchCount, 5);
      done();
    });

  });
  lab.experiment('handler', function() {

    lab.test('should get message', function(done) {
      var client = new Client();
      var worker = new Worker('workertest4', function(msg, callback) {
        assert.equal(msg.content.toString(), 'hi');
        callback();
      }, { queue: { exclusive: true } });
      client.addWorker(worker);
      client.on('complete', function() {
        client.close(done);
      });
      client.connect(function() {
        worker.channel.sendToQueue('workertest4', new Buffer('hi'));
      });
    });

    lab.test('should call nack on error', function(done) {
      var retry = 0;
      var client = new Client();
      var worker = new Worker('workertest5', function(msg, callback) {
        retry++;
        if (retry > 1) {
          return client.close(done);
        }
        callback(new Error());
      }, { queue: { exclusive: true } });
      client.addWorker(worker);
      client.connect(function() {
        worker.channel.sendToQueue('workertest5', new Buffer('hi'));
      });
    });

    lab.test('should not call nack on error', function(done) {
      var client = new Client();
      var worker = new Worker('workertest6', function(msg, callback) {
        if (msg.content.toString() === '2') {
          return client.close(done);
        }
        callback(new Error());
      }, {
        queue: { exclusive: true },
        consumer: { noAck: true }
      });
      client.addWorker(worker);
      client.connect(function() {
        worker.channel.sendToQueue('workertest6', new Buffer('1'));
        worker.channel.sendToQueue('workertest6', new Buffer('2'));
      });
    });

  });
  lab.experiment('#start', function() {
    /* fails due to amqplib throwing an error instead of using the callback
    lab.test('error on createChannel failure', function(done) {
      var client = new Client('amqp://localhost?channelMax=1');
      var worker = new Worker('workertest7',
                              function() {},
                              { queue: { exclusive: true } });
      var worker2 = new Worker('workertest7',
                              function() {},
                              { queue: { exclusive: true } });
      client.addWorker(worker);
      client.addWorker(worker2);
      client.connect(function(err) {
        if (err) {
          return done();
        }
      });
    });
    */
  });
});
