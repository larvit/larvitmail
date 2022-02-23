'use strict';

const { Log } = require('larvitutils');
const ejs = require('ejs');
const nodeMailer = require('nodemailer');
const os = require('os');
const util = require('util');
const uuidLib = require('uuid');

const topLogPrefix = 'larvitmail: ./index.js:';

class Mail {

	/**
	 * Module main constructor
	 *
	 * @param {obj} options {
	 * 'transportConf': str or obj - Directly forwarded to nodeMailer.createTransport() see docs at https://github.com/nodemailer/nodemailer
	 * 'mailDefaults': {
	 * 'from': 'foo@bar.com', // Defaults to 'node@ + require('os').hostname() + '.local'
	 * }
	 * }
	 */
	constructor(options) {
		const logPrefix = `${topLogPrefix} Mail() -`;

		this.options = options || {};

		this.log = this.options.log || new Log();

		if (this.options.transportConf === undefined) { this.options.transportConf = { port: 25, host: 'localhost', ignoreTLS: true}; }
		if (this.options.mailDefaults === undefined) { this.options.mailDefaults = {}; }
		if (this.options.mailDefaults.from === undefined) { this.options.mailDefaults.from = 'node@' + os.hostname() + '.local'; }

		this.log.info(`${logPrefix} Running with options: ${util.inspect(options)}`);

		for (const key of Object.keys(this.options)) {
			this[key] = this.options[key];
		}

		try {
			this.transport = nodeMailer.createTransport(this.options.transportConf);
		} catch (err) {
			this.log.error(`${logPrefix} Could not configure transport: ${err.message} transporConf: ${util.inspect(this.options.transportConf)}`);
			throw err;
		}
	}

	/**
	 * Wrapper for https://github.com/nodemailer/nodemailer#sending-mail
	 *
	 * @param {obj}   mailOptions - https://github.com/nodemailer/nodemailer#sending-mail for details
	 * @returns {obj}             - Send mail info, https://github.com/nodemailer/nodemailer#sending-mail for details
	 */
	async send(mailOptions) {
		const uuid = uuidLib.v4();
		const logPrefix = `${topLogPrefix} send() - uuid: ${uuid}`;

		this.log.verbose(`${logPrefix} Sending To: "${mailOptions.to}", Bcc: "${mailOptions.bcc}" Subject: "${mailOptions.subject}"`);

		if (mailOptions.from === undefined) {
			mailOptions.from = this.options.mailDefaults.from;
		}

		if (mailOptions.template !== undefined && mailOptions.templateData !== undefined) {
			try {
				const body = ejs.render(mailOptions.template, mailOptions.templateData);

				if (mailOptions.isHtml) {
					mailOptions.html = body;
				} else {
					mailOptions.text = body;
				}
			} catch (err) {
				this.log.error(`${logPrefix} Failed to compile template: ${err.message}`);

				throw err;
			}
		}

		let info;
		try {
			info = await this.transport.sendMail(mailOptions);
		} catch (err) {
			this.log.warn(`${logPrefix} err: ${err.message}`);

			throw err;
		}

		if (info && info.messageId !== undefined) {
			this.log.verbose(`${logPrefix} Sent, messageId: ${info.messageId}`);
		} else /* istanbul ignore next */ {
			this.log.verbose(`${logPrefix} Sent, no messageId obtained`);
		}

		if (info && info.accepted && info.accepted.length) {
			this.log.verbose(`${logPrefix} Accepted to: ${info.accepted.join(', ')}`);
		}

		if (info && info.rejected && info.rejected.length) {
			this.log.verbose(`${logPrefix} Rejected to: ${info.rejected.join(', ')}`);
		}

		if (info && info.pending && info.pending.length) {
			this.log.verbose(`${logPrefix} Pending to: ${info.pending.join(', ')}`);
		}

		if (info && info.response) {
			this.log.verbose(`${logPrefix} SMTP response: ${info.response}`);
		}

		return info;
	};
};

exports = module.exports = Mail;
