'use strict';

const Larvitmail = require(__dirname + '/../index.js');
const LUtils     = require('larvitutils');
const lUtils     = new LUtils();
const test       = require('tape');
const log        = new lUtils.Log('warn');
const ms         = require('smtp-tester');
const mailConf   = {
	'log':          log,
	'mailDefaults': {
		'from': 'foo@bar.com'
	},
	'transportConf': 'smtp://localhost:2525'
};

test('should send a text email', function (t) {
	const mailServer = ms.init(2525);

	let mailOptions = {
		'to':      'bar@foo.com',
		'subject': 'Hello',
		'text':    'Hello world'
	};
	let mailRecieved = false;

	mailServer.bind('bar@foo.com', function (add, id, mail) {
		t.equal(add,                                'bar@foo.com');
		t.equal(mail.sender,                        'foo@bar.com');
		t.equal(mail.receivers['bar@foo.com'],      true);
		t.equal(mail.headers['content-type'].value, 'text/plain');
		mailRecieved = true;
	});

	const larvitmail = new Larvitmail(mailConf);

	larvitmail.send(mailOptions, function (err, response) {
		if (err) throw err;
		t.equal(response.accepted.length, 1);
		t.equal(response.rejected.length, 0);
		t.equal(response.envelope.from,   'foo@bar.com');
		t.equal(response.envelope.to[0],  'bar@foo.com');
		t.equal(mailRecieved,             true);

		mailServer.stop();
		t.end();
	});
});

test('should send an html email', function (t) {
	const mailServer = ms.init(2525);

	let mailOptions = {
		'from':    'untz@example.com',
		'to':      'bar@foo.com',
		'subject': 'Hello',
		'html':    '<html><body><h1>Hello Cleveland!</h1></body></html>',
		'isHtml':  true
	};
	let mailRecieved = false;

	mailServer.bind('bar@foo.com', function (add, id, mail) {
		t.equal(add,                                'bar@foo.com');
		t.equal(mail.sender,                        'untz@example.com');
		t.equal(mail.receivers['bar@foo.com'],      true);
		t.equal(mail.headers['content-type'].value, 'text/html');
		mailRecieved = true;
	});

	const larvitmail = new Larvitmail(mailConf);

	larvitmail.send(mailOptions, function (err, response) {
		if (err) throw err;
		t.equal(response.accepted.length, 1);
		t.equal(response.rejected.length, 0);
		t.equal(response.envelope.from,   'untz@example.com');
		t.equal(response.envelope.to[0],  'bar@foo.com');
		t.equal(mailRecieved,             true);

		mailServer.stop();
		t.end();
	});
});

test('should send a text email based on template', function (t) {
	const mailServer = ms.init(2525);

	let mailOptions = {
		'to':           'bar@foo.com',
		'subject':      'Hello',
		'template':     'Hello <%= name %>!',
		'templateData':	{'name': 'bar'}
	};
	let mailRecieved = false;

	mailServer.bind('bar@foo.com', function (add, id, mail) {
		t.equal(add,                                'bar@foo.com');
		t.equal(mail.sender,                        'foo@bar.com');
		t.equal(mail.receivers['bar@foo.com'],      true);
		t.equal(mail.headers['content-type'].value, 'text/plain');
		t.equal(mail.body, 'Hello bar!');
		mailRecieved = true;
	});

	const larvitmail = new Larvitmail(mailConf);

	larvitmail.send(mailOptions, function (err, response) {
		if (err) throw err;
		t.equal(response.accepted.length, 1);
		t.equal(response.rejected.length, 0);
		t.equal(response.envelope.from,   'foo@bar.com');
		t.equal(response.envelope.to[0],  'bar@foo.com');
		t.equal(mailRecieved,             true);

		mailServer.stop();
		t.end();
	});
});

test('should send an html email based on template', function (t) {
	const mailServer = ms.init(2525);

	let mailOptions = {
		'from':         'untz@example.com',
		'to':           'bar@foo.com',
		'subject':      'Hello',
		'template':     '<html><body><h1>Hello <%= name %>!</h1></body></html>',
		'templateData': {'name': 'bar'},
		'isHtml':       true
	};

	let mailRecieved = false;

	mailServer.bind('bar@foo.com', function (add, id, mail) {
		t.equal(add,                                'bar@foo.com');
		t.equal(mail.sender,                        'untz@example.com');
		t.equal(mail.receivers['bar@foo.com'],      true);
		t.equal(mail.headers['content-type'].value, 'text/html');
		t.equal(mail.html, '<html><body><h1>Hello bar!</h1></body></html>');
		t.equal(mail.body, 'HELLO BAR!');
		mailRecieved = true;
	});

	const larvitmail = new Larvitmail(mailConf);

	larvitmail.send(mailOptions, function (err, response) {
		if (err) throw err;
		t.equal(response.accepted.length, 1);
		t.equal(response.rejected.length, 0);
		t.equal(response.envelope.from,   'untz@example.com');
		t.equal(response.envelope.to[0],  'bar@foo.com');
		t.equal(mailRecieved,             true);

		mailServer.stop();
		t.end();
	});
});
