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
const mail = require('larvitmail');

mail.setup();

mail.getInstance().send({
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
const mail = require('larvitmail');

mail.setup({
	'transportConf': 'smtps://user%40gmail.com:pass@smtp.gmail.com',
	'mailDefaults': {
		'from': 'foo@bar.com'
	}
});

mail.getInstance().send({
	'to':	'someone@someplace.com',
	'subject':	'test',
	'text':	'BAM!'
}, function(err) {
	if (err) throw err;
	console.log('Mail sent');
});
```

## Wtf indention in the source code?

It is indented with [elastic tabstops](http://nickgravgaard.com/elastic-tabstops/). If you are using Atom you can use [this plugin](https://atom.io/packages/elastic-tabstops).
