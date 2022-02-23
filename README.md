[![Build Status](https://github.com/larvit/larvitmail/actions/workflows/action.yml/badge.svg)](https://github.com/larvit/larvitmail/actions)

# larvitmail

Mailer wrapper for nodejs

## Installation

```bash
npm i larvitmail
```

## Usage

### Basic usage

Defaults to SMTP localhost without any options.

```send()``` returns ```SentMessageInfo``` from nodemailer (https://nodemailer.com/usage/)
where messageId, envelope, acceppted, rejected etc. can be found.

```javascript
const Mail = require('larvitmail');
const mail = new Mail();

await mail.send({
	'from':	'foo@bar.com',
	'to':	'someone@someplace.com',
	'subject':	'test',
	'text':	'BAM!'
}; // throws on error
console.log('Mail sent');
```

### Custom configuration

```javascript
const Mail = require('larvitmail');
const mail = new Mail({
	'log': new require('larvitutils').Log('verbose'),
	'transportConf': 'smtps://user%40gmail.com:pass@smtp.gmail.com',
	'mailDefaults': {
		'from': 'foo@bar.com'
	}
});

await mail.send({
	'to':	'someone@someplace.com',
	'subject':	'test',
	'text':	'BAM!'
};
console.log('Mail sent');
```

### Templates

Set "isHtml" to true to use templates to send html emails.

```javascript
const Mail = require('larvitmail');
const mail = new Mail();

await mail.send({
	to:	'someone@someplace.com',
	subject:	'test',
	template:	'<h1>Hello <%= name %>!</h1>',
	templateData:	{ 'name': 'bar' },
	isHtml:	true
};
console.log('Mail sent');
```

## Changelog
### 3.0.0
- Replaced callback with promises
- Upped lib versions