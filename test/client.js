var assert = require('assert');
var lib = require('../');
var Client = lib.Client;
var Worker = lib.Worker;

describe('Client', function() {
  describe('#connect()', function() {
    it('should connect', function(done) {
      var client = new Client('amqp://localhost');
      client.connect(done);
    });
  });
});
