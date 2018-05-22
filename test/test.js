'use strict';

const	larvitmail	= require(__dirname + '/../index.js'),
	mailConf	= require(__dirname + '/../config/mailConf_test.json'),
	test	= require('tape'),
	log	= require('winston');

log.remove(log.transports.Console);

test('should send a text email', function (t) {

	let mailOptions = {
		to: 'bar@example.com',
		subject: 'Hello',
		text: 'Hello world'
	};

	larvitmail.setup(mailConf);
	
	larvitmail.getInstance().send(mailOptions, function (err, response) {
		if (err) throw err;
		t.equal(response.accepted.length, 1);
		t.equal(response.rejected.length, 0);
		t.equal(response.envelope.from, 'foo@bar.com');
		t.equal(response.envelope.to[0], 'bar@example.com');

		t.end();
	});
});

test('should send a html email', function (t) {

	let mailOptions = {
		from: 'untz@example.com',
		to: 'bar@example.com',
		subject: 'Hello',
		html: '<html><body><h1>Hello Cleveland!</h1></body></html>',
		isHtml: true
	};

	larvitmail.setup(mailConf);
	
	larvitmail.getInstance().send(mailOptions, function (err, response) {
		if (err) throw err;
		t.equal(response.accepted.length, 1);
		t.equal(response.rejected.length, 0);
		t.equal(response.envelope.from, 'untz@example.com');
		t.equal(response.envelope.to[0], 'bar@example.com');

		t.end();
	});
});