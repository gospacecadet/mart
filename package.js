Package.describe({
  name: 'marvin:mart',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Meteor based platform that creates marketplaces where shoppers can buy from multiple vendors.',
  // URL to the Git repository containing the source code for this package.
  git: 'git@github.com:marvinmarnold/mart.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.2.1');

  // Core packages
  api.use([
    'ecmascript',
    "check",
    'mongo',
    'accounts-password'
  ]);

  // Meteor regulars
  api.use([
    "underscore",
  ]);

  // Community packages
  api.use([
    'mrgalaxy:stripe@2.2.0',
    'aldeed:collection2@2.5.0',
    'aldeed:simple-schema@1.3.3',
    'ongoworks:security@1.1.0'
  ]);

  api.add_files([
    "lib/mart.js",
    "lib/gateways/stripe/stripe_common.js",
    'lib/storefronts/storefronts.js'
  ])

  api.add_files([
    "lib/contract.js",
    "lib/gateways/stripe/stripe_server.js",
    'lib/storefronts/storefronts_server.js'
  ], "server")

  api.add_files([
    "lib/actions/account-info.js",
    "lib/gateways/stripe/stripe_client.js"
  ], "client")

  api.export("Mart")
});

Package.onTest(function(api) {
  api.use([
    'tinytest',
    'underscore',
    'test-helpers',
    'marvin:mart'
  ]);

  api.addFiles([
    'test/contract-tests.js',
    'test/stripe-tests.js',
    'test/storefront-tests.js'
  ]);
});
