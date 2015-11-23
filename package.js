Package.describe({
  name: 'marvin:mart',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Meteor based platform that create marketplaces where shoppers can buy from multiple vendors.',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.2.1');

  // Core packages
  api.use([
    'ecmascript',
    "check"
  ]);

  // Meteor regulars
  api.use([
    "underscore",
  ]);

  // Community packages
  api.use([
    'mrgalaxy:stripe@2.2.0',
  ]);

  api.add_files([
    "lib/mart.js",
    "lib/contract.js",
    "lib/gateways/stripe.js"
  ]);

  api.export("Mart");
});

Package.onTest(function(api) {
  api.use([
    'tinytest',
    'test-helpers',
    'marvin:mart'
  ]);

  api.addFiles([
    'tests/mart-tests.js',
    'tests/stripe-tests.js'
  ]);
});
