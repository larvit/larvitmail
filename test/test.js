'use strict';

const	//larvitMail	= require(__dirname + '/../index.js'),
	assert	= require('assert'),
	log	= require('winston');

log.remove(log.transports.Console);

describe('dummy', function() {
	it('is dumb', function(done) {
		assert(true);
		done();
	});
});

/* Older tests
describe('Mail', function() {

	it('should instantiate a new plain mail object', function(done) {
		const mail = new larvitmail.Mail();

		assert.deepEqual(toString.call(mail), '[object Object]');
		assert.deepEqual(toString.call(mail.mailOptions), '[object Object]');

		done();
	});

	it('should instantiate a new plain mail object, with object as option', function(done) {
		const mail = new larvitmail.Mail({});

		assert.deepEqual(toString.call(mail), '[object Object]');
		assert.deepEqual(toString.call(mail.transporter), '[object Object]');
		assert.deepEqual(toString.call(mail.mailOptions), '[object Object]');

		done();
	});

	it('should instantiate a new plain mail object, with a default config', function(done) {
		const mail = new larvitmail.Mail();

		assert.deepEqual(toString.call(mail.mailConf), '[object Object]');
		assert.deepEqual(mail.mailConf.host, 'localhost');
		assert.deepEqual(mail.mailConf.port, 25);
		assert.deepEqual(mail.mailConf.ignoreTLS, true);
		assert.deepEqual(mail.mailConf.defaultFrom, 'gagge@larvit.se');

		done();
	});

	it('should instantiate a new plain mail object, with a ready transporter', function(done) {
		const mail = new larvitmail.Mail();

		assert.deepEqual(toString.call(mail.transporter), '[object Object]');
		assert(mail.transporter.transporter);

		done();
	});

	it('should send an email', function(done) {

		let mailOptions = {
			from: 'foo@example.com',
			to: 'bar@example.com',
			subject: 'Hello',
			text: 'Hello world',
			html: '<b>Hello world</b>'
		};

		const mail = new larvitmail.Mail(mailOptions);

		mail.send(function(err, response) {
			assert( ! err, 'err should be negative');
			assert.deepEqual(response.accepted.length, 1);
			assert.deepEqual(response.rejected.length, 0);
			assert.deepEqual(response.envelope.from, 'foo@example.com');
			assert.deepEqual(response.envelope.to[0], 'bar@example.com');

			done();
		});

	});

});*/
