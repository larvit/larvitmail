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
const mailer = require('larvitmail')();

mailer.send('someone@someplace.com', 'This is a subject', 'This is a body', function(err) {
  if (err) throw err;
  console.log('Mail sent');
});
```

### Custom configuration

```javascript
const mailer = require('larvitmail')({
  'hostname': 'smtp.foobar.com',
  'port': 25
});

mailer.send('someone@someplace.com', 'This is a subject', 'This is a body', function(err) {
  if (err) throw err;
  console.log('Mail sent');
});
```
