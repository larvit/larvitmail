'use strict';

const assert = require('assert');
const { Log } = require('larvitutils');
const Larvitmail = require(__dirname + '/../index.js');
const MailServer = require('./utils/mailServer');
const os = require('os');
const test = require('tape');

const log = new Log('error');
const mailConf = {
	log,
	mailDefaults: {
		from: 'foo@bar.com',
	},
	transportConf: 'smtp://localhost:2525',
};

const mailServer = new MailServer();
mailServer.start(2525);

test('should construct with default options', async t => {
	const larvitmail = new Larvitmail();

	t.deepEqual(larvitmail.transportConf, { port: 25, host: 'localhost', ignoreTLS: true });
	t.deepEqual(larvitmail.mailDefaults, { from: `node@${os.hostname()}.local`});
});

test('should throw error if constructed with bad transport config', async t => {
	t.throws(() => new Larvitmail({
		transportConf: 'asdf://neee',
	}), /Cannot create property \'mailer\' on string \'asdf:\/\/neee\'/, 'Did not get expected exception');
});

test('should send a text email', async t => {
	let mailOptions = {
		to: 'bar@foo.com',
		subject: 'Hello',
		text: 'Hello world',
	};
	let mailRecieved = false;

	mailServer.setHandler(function (mail) {
		t.equal(mail.sender, 'foo@bar.com');
		t.equal(mail.receivers[0], 'bar@foo.com');
		t.equal(mail.headers['content-type'].value, 'text/plain');
		mailRecieved = true;
	});

	const larvitmail = new Larvitmail(mailConf);

	const response = await larvitmail.send(mailOptions);
	t.equal(response.accepted.length, 1);
	t.equal(response.rejected.length, 0);
	t.equal(response.envelope.from, 'foo@bar.com');
	t.equal(response.envelope.to[0], 'bar@foo.com');
	t.equal(mailRecieved, true);
});

test('should send an html email', async t => {
	let mailOptions = {
		from: 'untz@example.com',
		to: 'bar@foo.com',
		subject: 'Hello',
		html: '<html><body><h1>Hello Cleveland!</h1></body></html>',
		isHtml: true,
	};
	let mailRecieved = false;

	mailServer.setHandler(function (mail) {
		t.equal(mail.sender, 'untz@example.com');
		t.equal(mail.receivers[0], 'bar@foo.com');
		t.equal(mail.headers['content-type'].value, 'text/html');
		mailRecieved = true;
	});

	const larvitmail = new Larvitmail(mailConf);

	const response = await larvitmail.send(mailOptions);
	t.equal(response.accepted.length, 1);
	t.equal(response.rejected.length, 0);
	t.equal(response.envelope.from, 'untz@example.com');
	t.equal(response.envelope.to[0], 'bar@foo.com');
	t.equal(mailRecieved, true);
});

test('should send a text email based on template', async t => {
	let mailOptions = {
		to: 'bar@foo.com',
		subject: 'Hello',
		template: 'Hello <%= name %>!',
		templateData: { name: 'bar' },
	};
	let mailRecieved = false;

	mailServer.setHandler(function (mail) {
		t.equal(mail.sender, 'foo@bar.com');
		t.equal(mail.receivers[0], 'bar@foo.com');
		t.equal(mail.headers['content-type'].value, 'text/plain');
		t.equal(mail.body, 'Hello bar!');
		mailRecieved = true;
	});

	const larvitmail = new Larvitmail(mailConf);

	const response = await larvitmail.send(mailOptions);
	t.equal(response.accepted.length, 1);
	t.equal(response.rejected.length, 0);
	t.equal(response.envelope.from, 'foo@bar.com');
	t.equal(response.envelope.to[0], 'bar@foo.com');
	t.equal(mailRecieved, true);
});

test('should throw an error on send if template has errors', async () => {
	const larvitmail = new Larvitmail(mailConf);

	mailServer.setHandler(() => {});

	await assert.rejects(async () => larvitmail.send({
		to: 'bar@foo.com',
		template: 'Hello <%= whops, missing percentage here >!',
		templateData: {},
	}), new Error('Could not find matching close tag for "<%=".'));
});

test('should send an html email based on template', async t => {
	let mailOptions = {
		from: 'untz@example.com',
		to: 'bar@foo.com',
		subject: 'Hello',
		template: '<html><body><h1>Hello <%= name %>!</h1></body></html>',
		templateData: { name: 'bar' },
		isHtml: true,
	};

	let mailRecieved = false;

	mailServer.setHandler(function (mail) {
		t.equal(mail.sender, 'untz@example.com');
		t.equal(mail.receivers[0], 'bar@foo.com');
		t.equal(mail.headers['content-type'].value, 'text/html');
		t.equal(mail.html, '<html><body><h1>Hello bar!</h1></body></html>');
		t.equal(mail.body, 'HELLO BAR!');
		mailRecieved = true;
	});

	const larvitmail = new Larvitmail(mailConf);

	const response = await larvitmail.send(mailOptions);
	t.equal(response.accepted.length, 1);
	t.equal(response.rejected.length, 0);
	t.equal(response.envelope.from, 'untz@example.com');
	t.equal(response.envelope.to[0], 'bar@foo.com');
	t.equal(mailRecieved, true);
});

test('should try and send a mail that gets rejected by server', async () => {
	const larvitmail = new Larvitmail(mailConf);

	mailServer.setHandler(() => {});
	mailServer.rejectNextEmail();

	await assert.rejects(async () => await larvitmail.send({
		to: 'bar@foo.com',
		text: 'Heya',
	}), new Error('Can\'t send mail - all recipients were rejected: 550 Rejected email from bar@foo.com'));
});

test('should try and send a mail to multiple recipients where not all gets rejected by server', async t => {
	const larvitmail = new Larvitmail(mailConf);

	mailServer.setHandler(() => {});
	mailServer.rejectNextEmail();

	const result = await await larvitmail.send({
		to: 'bar@foo.com, korv@nisse.com',
		text: 'Heya',
	});

	t.deepEqual(result.rejected, ['bar@foo.com']);
	t.deepEqual(result.accepted, ['korv@nisse.com']);
});

test('should send with bcc address', async t => {
	const larvitmail = new Larvitmail(mailConf);

	mailServer.setHandler(() => {});

	const result = await await larvitmail.send({
		to: 'bar@foo.com',
		bcc: 'korv@nisse.com',
		text: 'Heya',
	});

	t.deepEqual(result.accepted, ['bar@foo.com', 'korv@nisse.com']);
});

test('stop test SMTP server', (t) => {
	mailServer.stop(t.end);
});
