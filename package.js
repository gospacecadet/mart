Package.describe({
  name: 'marvin:mart',
  version: '0.0.2',
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
    'accounts-base',
    'accounts-password',
    'blaze-html-templates',
  ]);

  // Meteor regulars
  api.use([
    "underscore",
  ]);

  // Community packages
  api.use([
    'mrgalaxy:stripe@2.2.0',
    'aldeed:collection2@2.5.0',
    'aldeed:simple-schema@1.4.0',
    'ongoworks:security@1.3.0',
  ]);

  api.add_files([
    "lib/mart.js",
    'lib/gateways/gateways.js',
    'lib/gateways/test/test.js',
    'lib/payment_methods/cards/cards.js',
    "lib/gateways/stripe/stripe.js",
    // 'lib/storefronts/storefronts.js',
    // 'lib/products/products.js',
    // 'lib/line-items/line-items.js',
    // 'lib/carts/carts.js',
  ])

  api.add_files([
    "lib/payment_methods/cards/cards_server.js",
    'lib/gateways/gateways_server.js',
    "lib/gateways/stripe/stripe_server.js",
    // 'lib/storefronts/storefronts_server.js',
    // 'lib/products/products_server.js',
    // 'lib/line-items/line-items-server.js',
    // 'lib/carts/carts_server.js'
  ], "server")

  api.add_files([
    "lib/payment_methods/cards/cards_client.js",
    "lib/gateways/test/test_client.js",
    "lib/gateways/stripe/stripe_client.js",
    // 'lib/carts/carts_client.js'
  ], "client")

  api.export("Mart")
});

Package.onTest(function(api) {
  api.use([
    'tinytest', 'underscore', 'random',
    'test-helpers', 'marvin:mart',
    'accounts-base', 'accounts-password',
  ]);

  api.addFiles([
    'test/helpers.js',
    'test/gateways/test-tests.js',
    'test/card-tests.js',
    'test/gateways/stripe-tests.js',
    // 'test/storefront-tests.js',
    // 'test/line-item-tests.js',
    // 'test/cart-tests.js'
  ]);
});
