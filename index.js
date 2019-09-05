'use strict';

const topLogPrefix = 'larvitmail: ./index.js: ';
const nodeMailer   = require('nodemailer');
const uuidLib      = require('uuid');
const LUtils       = require('larvitutils');
const util         = require('util');
const ejs			= require('ejs');

/**
 * Module main constructor
 *
 * @param {obj} options {
 * 	'transportConf': str or obj - Directly forwarded to nodeMailer.createTransport() see docs at https://github.com/nodemailer/nodemailer
 * 	'mailDefaults': {
 * 		'from': 'foo@bar.com', // Defaults to 'node@ + require('os').hostname() + '.local'
 * 	},
 * 	'instanceName': str // Defaults to "default"
 * }
 */
function Mail(options) {
	const logPrefix = topLogPrefix + 'Mail() - ';
	const that      = this;

	that.options = options || {};

	if (! that.options.log) {
		const lUtils = new LUtils();

		that.options.log = new lUtils.Log();
	}
	that.log = that.options.log;

	if (that.options.transportConf     === undefined) { that.options.transportConf     = {'port': 25, 'host': 'localhost', 'ignoreTLS': true}; }
	if (that.options.instanceName      === undefined) { that.options.instanceName      = 'default';                                            }
	if (that.options.mailDefaults      === undefined) { that.options.mailDefaults      = {};                                                   }
	if (that.options.mailDefaults.from === undefined) { that.options.mailDefaults.from = 'node@' + require('os').hostname() + '.local';        }

	that.log.info(logPrefix + 'Running with options: ' + util.inspect(options));

	for (const key of Object.keys(that.options)) {
		that[key] = that.options[key];
	}

	try {
		that.transport = nodeMailer.createTransport(options.transportConf);
	} catch (err) {
		that.log.warn(logPrefix + 'Could not configure transport: ' + err.message + ' transporConf: ' + util.inspect(that.options.transportConf));
	}
}

/**
 * Wrapper for https://github.com/nodemailer/nodemailer#sending-mail
 *
 * @param {obj}   mailOptions - https://github.com/nodemailer/nodemailer#sending-mail for details
 * @param {func}  cb          - cb(err, info) https://github.com/nodemailer/nodemailer#sending-mail for details
 * @returns {obj}             - This instance
 */
Mail.prototype.send = function send(mailOptions, cb) {
	const uuid      = uuidLib.v4();
	const that      = this;
	const logPrefix = topLogPrefix + 'send() - uuid: ' + uuid + ' ';

	that.log.verbose(logPrefix + 'To: "' + mailOptions.to + '" Subject: "' + mailOptions.subject + '"');

	if (typeof cb !== 'function') {
		cb = function () {};
	}

	if (that.transport === undefined) {
		const err = new Error('this.transport is not defined');

		that.log.warn(logPrefix + err.message);

		return cb(err);
	}

	if (typeof that.transport.sendMail !== 'function') {
		const err = new Error('this.transport.sendMail is not a function');

		that.log.warn(logPrefix + err.message);

		return cb(err);
	}

	if (mailOptions.from === undefined) {
		mailOptions.from = that.options.mailDefaults.from;
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
			that.log.error(logPrefix + 'Failed to compile template: ' + err.message);

			return cb(err);
		}
	}

	that.transport.sendMail(mailOptions, function (err, info) {
		if (err) {
			that.log.warn(logPrefix + 'err: ' + err.message);
			cb(err, info);

			return that;
		}

		if (info && info.messageId !== undefined) {
			that.log.verbose(logPrefix + 'To: "' + mailOptions.to + '" messageId: ' + info.messageId);
		} else {
			that.log.verbose(logPrefix + 'To: "' + mailOptions.to + '" no messageId obtained');
		}

		if (info && info.accepted && info.accepted.length) {
			that.log.verbose(logPrefix + 'Accepted to: ' + info.accepted.join(', '));
		}

		if (info && info.rejected && info.rejected.length) {
			that.log.verbose(logPrefix + 'Rejected to: ' + info.rejected.join(', '));
		}

		if (info && info.pending && info.pending.length) {
			that.log.verbose(logPrefix + 'Pending to: ' + info.pending.join(', '));
		}

		if (info && info.response) {
			that.log.verbose(logPrefix + 'SMTP response: ' + info.response);
		}

		cb(err, info);

		return that;
	});
};

exports = module.exports = Mail;
