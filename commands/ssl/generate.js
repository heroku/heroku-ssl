'use strict';

let co      = require('co');
let cli     = require('heroku-cli-util');
let openssl = require('../../lib/openssl.js');

function valEmpty(val) {
  if (val) {
    return val.length === 0;
  } else {
    return true;
  }
}

function getSubject(context) {
  let domain = context.args.domain;

  var owner = context.flags.owner;
  var country = context.flags.country;
  var area = context.flags.area;
  var city = context.flags.city;

  var subject = context.flags.subject;

  if (valEmpty(subject)) {
    subject = '';
    if (! valEmpty(country)) {
      subject += `/C=${country}`;
    }

    if (! valEmpty(area)) {
      subject += `/ST=${area}`;
    }

    if (! valEmpty(city)) {
      subject += `/L=${city}`;
    }

    if (! valEmpty(owner)) {
      subject += `/O=${owner}`;
    }

    subject += `/CN=${domain}`;
  }

  return subject;
}

function requiresPrompt(context) {
  if (valEmpty(context.flags.subject)) {
    let args =[context.flags.owner, context.flags.country, context.flags.area, context.flags.city];
    if (! context.flags.now && args.every(function (v) { return valEmpty(v); })) {
      return true;
    }
  }
  return false;
}

function getCommand(certs, domain) {
  if (certs.find(function(f) {
    return f.ssl_cert.cert_domains.find(function(d) {
      return d === domain;
    });
  })) {
    return "update";
  } else {
    return "add";
  }
}

function* run(context, heroku) {
  if (requiresPrompt(context)) {
    context.flags.owner = yield cli.prompt('Owner of this certificate');
    context.flags.country = yield cli.prompt('Country of owner (two-letter ISO code)');
    context.flags.area = yield cli.prompt('State/province/etc. of owner');
    context.flags.city = yield cli.prompt('City of owner');
  }

  let subject = getSubject(context);

  let domain = context.args.domain;
  let keysize = context.flags.keysize || 2048;
  let keyfile = `${domain}.key`;

  let certs = yield heroku.request({
    path: `/apps/${context.app}/sni-endpoints`,
    headers: {'Accept': 'application/vnd.heroku+json; version=3.sni_ssl_cert'}
  });

  var command = getCommand(certs, domain);

  if (context.flags.selfsigned) {
    let crtfile = `${domain}.crt`;

    yield openssl.spawn(['req', '-new', '-newkey', `rsa:${keysize}`, '-nodes', '-keyout', keyfile, '-out', crtfile, '-subj', subject, '-x509']);

    cli.console.error('Your key and self-signed certificate have been generated.');
    cli.console.error('Next, run:');
    cli.console.error(`$ heroku _certs:${command} ${crtfile} ${keyfile}`);
  } else {
    let csrfile = `${domain}.csr`;

    yield openssl.spawn(['req', '-new', '-newkey', `rsa:${keysize}`, '-nodes', '-keyout', keyfile, '-out', csrfile, '-subj', subject]);

    cli.console.error('Your key and certificate signing request have been generated.');
    cli.console.error(`Submit the CSR in \'${csrfile}\' to your preferred certificate authority.`);
    cli.console.error('When you\'ve received your certificate, run:');
    cli.console.error(`$ heroku _certs:${command} CERTFILE ${keyfile}`);
  }
}

module.exports = {
  topic: '_certs',
  command: 'generate',
  args: [
    {name: 'domain', optional: false},
  ],
  flags: [
    {
      name: 'selfsigned',
      optional: true,
      hasValue: false,
      description: 'generate a self-signed certificate instead of a CSR'
    }, {
      name: 'keysize',
      optional: true,
      hasValue: true,
      description: 'RSA key size in bits (default: 2048)'
    }, {
      name: 'owner',
      optional: true,
      hasValue: true,
      description: 'name of organization certificate belongs to'
    }, {
      name: 'country',
      optional: true,
      hasValue: true,
      description: 'country of owner, as a two-letter ISO country code'
    }, {
      name: 'area',
      optional: true,
      hasValue: true,
      description: 'sub-country area (state, province, etc.) of owner'
    }, {
      name: 'city',
      optional: true,
      hasValue: true,
      description: 'city of owner'
    }, {
      name: 'subject',
      optional: true,
      hasValue: true,
      description: 'specify entire certificate subject'
    }, {
      name: 'now',
      optional: true,
      hasValue: false,
      description: 'do not prompt for any owner information'
    }
  ],
  description: 'Generate a key and certificate signing request (or self-signed certificate)',
  help: 'Generate a key and certificate signing request (or self-signed certificate)\nfor an app. Prompts for information to put in the certificate unless --now\nis used, or at least one of the --subject, --owner, --country, --area, or\n--city options is specified.',
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(run)),
};
