'use strict';

const mailer = require('nodemailer'),
      lfs    = require('larvitfs');

function Mail(mailOptions) {
	this.mailConf = {};
	this.transporter = {};
	this.mailOptions = mailOptions;

	if (mailOptions === undefined)
		this.mailOptions = {};

	if (lfs.getPathSync(process.cwd() + '/config/mailConf.json') === false) {
		this.mailConf = {
			'port': 25,
			'host': 'localhost',
			'ignoreTLS': true,
			'defaultFrom': 'gagge@larvit.se'
		};
	} else {
		this.mailConf = require(process.cwd() + '/config/mailConf.json');
	}

	if (this.mailOptions.from === undefined)
		this.mailOptions.from = this.mailConf.defaultFrom;

	this.transporter = mailer.createTransport(this.mailConf);
}

Mail.prototype.send = function(cb) {

	this.transporter.sendMail(this.mailOptions, function(err, response) {
		if (err) {
			cb(err);
			return;
		}

		cb(null, response);
	});
};

exports.Mail = Mail;
