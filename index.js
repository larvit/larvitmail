'use strict';

const	nodeMailer	= require('nodemailer'),
	uuidLib	= require('node-uuid'),
	util	= require('util'),
	log	= require('winston');

/**
 * Get mailer Instance
 *
 * @param str instanceName - Defaults to "default"
 *
 * @return obj or undefined - obj being an instance of new Instance()
 */
function getInstance(instanceName) {
	if (instanceName === undefined) {
		instanceName = 'default';
		log.debug('larvitmail: getInstance() - No instanceName given, falling back to "' + instanceName + '"');
	} else {
		log.debug('larvitmail: getInstance() - Ran with instanceName "' + instanceName + '"');
	}

	if (exports.instances[instanceName] === undefined) {
		log.warn('larvitmail: getInstance() - Trying to get an undefined instance "' + instanceName + '"');
	} else {
		log.debug('larvitmail: getInstance() - Instance "' + instanceName + '" found');
	}

	return exports.instances[instanceName];
}

function Instance() {
}

/**
 * Wrapper for https://github.com/nodemailer/nodemailer#sending-mail
 *
 * @param obj mailOptions	https://github.com/nodemailer/nodemailer#sending-mail for details
 * @param func cb(err, info)	https://github.com/nodemailer/nodemailer#sending-mail for details
 */
Instance.prototype.send = function send(mailOptions, cb) {
	const uuid = uuidLib.v4();

	log.verbose('larvitmail: Instance.send() - uuid: ' + uuid + ' To: "' + mailOptions.to + '" Subject: "' + mailOptions.subject + '"');

	if (typeof cb !== 'function') {
		cb = function(){};
	}

	if (this.transport === undefined) {
		const err = new Error('this.transport is not defined');
		log.warn('larvitmail: Instance.send() - uuid: ' + uuid + ' ' + err.message);
		cb(err);
		return;
	}

	if (typeof this.transport.sendMail !== 'function') {
		const err = new Error('this.transport.sendMail is not a function');
		log.warn('larvitmail: Instance.send() - uuid: ' + uuid + ' ' + err.message);
		cb(err);
		return;
	}

	if (mailOptions.from === undefined) {
		mailOptions.from = this.options.mailDefaults.from;
	}

	this.transport.sendMail(mailOptions, function(err, info) {
		if (err) {
			log.warn('larvitmail: Instance.send() - uuid: ' + uuid + ' err: ' + err.message);
			cb(err, info);
			return;
		}

		if (info && info.messageId !== undefined) {
			log.verbose('larvitmail: Instance.send() - uuid: ' + uuid + ' To: "' + mailOptions.to + '" messageId: ' + info.messageId);
		} else {
			log.verbose('larvitmail: Instance.send() - uuid: ' + uuid + ' To: "' + mailOptions.to + '" no messageId obtained');
		}

		if (info && info.accepted && info.accepted.length) {
			log.verbose('larvitmail: Instance.send() - uuid: ' + uuid + ' Accepted to: ' + info.accepted.join(', '));
		}

		if (info && info.rejected && info.rejected.length) {
			log.verbose('larvitmail: Instance.send() - uuid: ' + uuid + ' Rejected to: ' + info.rejected.join(', '));
		}

		if (info && info.pending && info.pending.length) {
			log.verbose('larvitmail: Instance.send() - uuid: ' + uuid + ' Pending to: ' + info.pending.join(', '));
		}

		if (info && info.response) {
			log.debug('larvitmail: Instance.send() - uuid: ' + uuid + ' SMTP response: ' + info.response);
		}

		cb(err, info);
	});
};

/**
 * Setup an instance
 *
 * @param obj	{
 *		'transportConf': str or obj - Directly forwarded to nodeMailer.createTransport() see docs at https://github.com/nodemailer/nodemailer
 *		'mailDefaults': {
 *			'from': 'foo@bar.com', // Defaults to 'node@ + require('os').hostname() + '.local'
 *		},
 *		'instanceName': str // Defaults to "default"
 *	}
 * @param str - instanceName (defaults to "default")
 *
 * @return bol
 */
function setup(options) {
	if (options === undefined) {
		options = {};
	}

	if (options.transportConf	=== undefined) {	options.transportConf	= {'port': 25, 'host': 'localhost', 'ignoreTLS': true};	}
	if (options.instanceName 	=== undefined) {	options.instanceName	= 'default';	}
	if (options.mailDefaults 	=== undefined) {	options.mailDefaults	= {};	}
	if (options.mailDefaults.from	=== undefined) {	options.mailDefaults.from	= 'node@' + require('os').hostname() + '.local';	}

	log.info('larvitmail: setup() - Running with options: ' + util.inspect(options));

	if (exports.instances[options.instanceName]	=== undefined) {	exports.instances[options.instanceName]	= new Instance();	}

	exports.instances[options.instanceName].options = options;

	try {
		exports.instances[options.instanceName].transport = nodeMailer.createTransport(options.transportConf);
		return true;
	} catch(err) {
		log.warn('larvitmail: setup() - Could not configure transport: ' + err.message + ' transporConf: ' + util.inspect(options.transportConf));
		return false;
	}
}

exports.getInstance	= getInstance;
exports.instances	= {};
exports.setup	= setup;
