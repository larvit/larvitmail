'use strict';

const	larvitmail	= require(__dirname + '/../index.js'),
	test	= require('tape'),
	log	= require('winston'),
	ms	= require('smtp-tester'),
	mailConf	= {
		'mailDefaults': {
			'from': 'foo@bar.com'
		},
		'transportConf': 'smtp://localhost:2525'
	};

log.remove(log.transports.Console);

test('should send a text email', function (t) {
	const mailServer = ms.init(2525);
	
	let mailOptions = {
			to: 'bar@foo.com',
			subject: 'Hello',
			text: 'Hello world'
		},
		mailRecieved	= false;

	mailServer.bind('bar@foo.com', function (add, id, mail) {
		t.equal(add, 'bar@foo.com');
		t.equal(mail.sender, 'foo@bar.com');
		t.equal(mail.receivers['bar@foo.com'], true);
		t.equal(mail.headers['content-type'].value, 'text/plain');
		mailRecieved = true;
	});

	larvitmail.setup(mailConf);
	
	larvitmail.getInstance().send(mailOptions, function (err, response) {
		if (err) throw err;
		t.equal(response.accepted.length, 1);
		t.equal(response.rejected.length, 0);
		t.equal(response.envelope.from, 'foo@bar.com');
		t.equal(response.envelope.to[0], 'bar@foo.com');

		t.equal(mailRecieved, true);

		mailServer.stop();
		t.end();
	});
});

test('should send a html email', function (t) {
	const mailServer = ms.init(2525);

	let mailOptions = {
			from: 'untz@example.com',
			to: 'bar@foo.com',
			subject: 'Hello',
			html: '<html><body><h1>Hello Cleveland!</h1></body></html>',
			isHtml: true
		},
		mailRecieved = false;

	mailServer.bind('bar@foo.com', function (add, id, mail) {
		t.equal(add, 'bar@foo.com');
		t.equal(mail.sender, 'untz@example.com');
		t.equal(mail.receivers['bar@foo.com'], true);
		t.equal(mail.headers['content-type'].value, 'text/html');
		mailRecieved = true;
	});

	larvitmail.setup(mailConf);
	
	larvitmail.getInstance().send(mailOptions, function (err, response) {
		if (err) throw err;
		t.equal(response.accepted.length, 1);
		t.equal(response.rejected.length, 0);
		t.equal(response.envelope.from, 'untz@example.com');
		t.equal(response.envelope.to[0], 'bar@foo.com');
		t.equal(mailRecieved, true);

		mailServer.stop();
		t.end();
	});
});