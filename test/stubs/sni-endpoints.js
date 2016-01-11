'use strict';

module.exports = {
  certificate_details:
`Common Name(s): example.org
Expires At:     2013-08-01 21:34 UTC
Issuer:         /C=US/ST=California/L=San Francisco/O=Heroku by Salesforce/CN=secure.example.org
Starts At:      2012-08-01 21:34 UTC
Subject:        /C=US/ST=California/L=San Francisco/O=Heroku by Salesforce/CN=secure.example.org
SSL certificate is self signed.`,
  endpoint:
    { 'name': 'tokyo-1050',
      'cname': 'tokyo-1050.herokussl.com',
      'ssl_cert': {
        'ca_signed?':   false,
        'cert_domains': [ 'example.org' ],
        'starts_at':    "2012-08-01T21:34:23Z",
        'expires_at':   "2013-08-01T21:34:23Z",
        'issuer':       '/C=US/ST=California/L=San Francisco/O=Heroku by Salesforce/CN=secure.example.org',
        'subject':      '/C=US/ST=California/L=San Francisco/O=Heroku by Salesforce/CN=secure.example.org',
      }
    },
  endpoint2: 
    { 'name': 'akita-7777',
      'cname': 'akita-7777.herokussl.com',
      'ssl_cert': {
        'ca_signed?':   true,
        'cert_domains': [ 'heroku.com' ],
        'starts_at':    "2012-08-01T21:34:23Z",
        'expires_at':   "2013-08-01T21:34:23Z",
        'issuer':       '/C=US/ST=California/L=San Francisco/O=Heroku by Salesforce/CN=secure.example.org',
        'subject':      '/C=US/ST=California/L=San Francisco/O=Heroku by Salesforce/CN=secure.example.org',
      }
    },
  endpoint_warning:
    { 'name': 'warning-7777',
      'cname': 'warning-7777.herokussl.com',
      'warnings' : {
        'ssl_cert': ['provides no domain(s) that are configured for this Heroku app']
      },
      'ssl_cert': {
        'ca_signed?':   true,
        'cert_domains': [ 'warning.com' ],
        'starts_at':    "2012-08-01T21:34:23Z",
        'expires_at':   "2013-08-01T21:34:23Z",
        'issuer':       '/C=US/ST=California/L=San Francisco/O=Heroku by Salesforce/CN=secure.warning.org',
        'subject':      '/C=US/ST=California/L=San Francisco/O=Heroku by Salesforce/CN=secure.warning.org',
      }
    }
};
