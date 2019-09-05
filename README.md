# larvitmail

Mailer wrapper for nodejs

## Installation

```bash
npm i larvitmail
```

## Usage

### Basic usage

Defaults to SMTP localhost

```javascript
const Mail = require('larvitmail');
const mail = new Mail();

mail.send({
	'from':	'foo@bar.com',
	'to':	'someone@someplace.com',
	'subject':	'test',
	'text':	'BAM!'
}, function(err) {
	if (err) throw err;
	console.log('Mail sent');
});
```

### Custom configuration

```javascript
const Mail = require('larvitmail');
const mail = new Mail({
	'log':           new (new (require('larvitutils'))()).Log('verbose'),
	'transportConf': 'smtps://user%40gmail.com:pass@smtp.gmail.com',
	'mailDefaults': {
		'from': 'foo@bar.com'
	}
});

mail.send({
	'to':	'someone@someplace.com',
	'subject':	'test',
	'text':	'BAM!'
}, function(err) {
	if (err) throw err;
	console.log('Mail sent');
});
```

### Templates

Set "isHtml" to true to use templates to send html emails.

```javascript
const Mail = require('larvitmail');
const mail = new Mail({
	'log':           new (new (require('larvitutils'))()).Log('verbose'),
	'transportConf': 'smtps://user%40gmail.com:pass@smtp.gmail.com',
	'mailDefaults': {
		'from': 'foo@bar.com'
	}
});

mail.send({
	'to':	'someone@someplace.com',
	'subject':	'test',
	'template':	'Hello <%= name %>!',
	'templateData': { 'name': 'bar' }
}, function(err) {
	if (err) throw err;
	console.log('Mail sent');
});
```