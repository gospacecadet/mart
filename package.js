Package.describe({
  name: 'marvin:mart',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Meteor based platform that create marketplaces where shoppers can buy from multiple vendors.',
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
  ])

  api.add_files([
    "lib/contract.js",
    "lib/gateways/stripe.js"
  ], "server")

  api.add_files([
    "lib/actions/account-info.js"
  ], "client")

  api.export("Mart")
});

Package.onTest(function(api) {
  api.use([
    'tinytest',
    'test-helpers',
    'marvin:mart'
  ]);

  api.addFiles([
    'test/contract-tests.js',
    'test/stripe-tests.js'
  ]);
});
