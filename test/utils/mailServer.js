'use strict';

const { simpleParser } = require('mailparser');
const { SMTPServer } = require('smtp-server');

async function parseEmail(envelope, data) {
	data = data.replace(/\r\n$/, '');

	const parsedData = await simpleParser(data);
	const sender = envelope.mailFrom.address;
	const receivers = envelope.rcptTo.map(x => x.address);
	const headers = Object.fromEntries(parsedData.headers);
	const email = {
		sender,
		receivers,
		data,
		headers,
		body: parsedData.text,
		html: parsedData.html,
		attachments: parsedData.attachments,
	};

	return email;
}

class MailServer {
	constructor() {
		this.handler = () => {};
	}

	start(port) {
		const that = this;

		this.smtpServer = new SMTPServer({
			disabledCommands: ['AUTH', 'STARTTLS'],
			onAuth(auth, session, callback) {
				callback(null);
			},
			onRcptTo(addr, session, callback) {
				if (that.isNextMailRejected) {
					that.isNextMailRejected = undefined;

					return callback(new Error(`Rejected email from ${addr.address}`));
				}

				callback(null);
			},
			onData(stream, session, callback) {
				const chunks = [];

				stream.on('data', buffer => {
					chunks.push(buffer);
				});

				stream.on('end', async () => {
					const data = Buffer
						.concat(chunks)
						.toString();

					let email;
					try {
						email = await parseEmail(session.envelope, data);
					} catch (err) {
						return callback(err);
					}

					that.handleEmail(email);

					return callback(null, 'OK');
				});
			},
		});

		this.smtpServer.listen(port);
	}

	stop(cb) {
		this.smtpServer.close(cb);
	}

	handleEmail(email) {
		this.handler(email);
	}

	setHandler(handler) {
		this.handler = handler;
	}

	rejectNextEmail() {
		this.isNextMailRejected = true;
	}
}

module.exports = MailServer;
