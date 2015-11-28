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
    'accounts-password',
    'blaze-html-templates'
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
    'ongoworks:security@1.3.0'
  ]);

  api.add_files([
    "lib/mart.js",
    "lib/gateways/gateway.js",
    'lib/gateways/test/test.js'
    // "lib/gateways/stripe/stripe.js",
    // 'lib/storefronts/storefronts.js',
    // 'lib/products/products.js',
    // 'lib/line-items/line-items.js',
    // 'lib/carts/carts.js',
  ])

  api.add_files([
    "lib/gateways/gateway_server.js"
    // "lib/contract.js",
    // "lib/gateways/stripe/stripe_server.js",
    // 'lib/storefronts/storefronts_server.js',
    // 'lib/products/products_server.js',
    // 'lib/line-items/line-items-server.js',
    // 'lib/carts/carts_server.js'
  ], "server")

  api.add_files([
    // "lib/actions/account-info.js",
    // "lib/gateways/stripe/stripe_client.js",
    // 'lib/carts/carts_client.js'
  ], "client")

  api.export("Mart")
});

Package.onTest(function(api) {
  api.use([
    'tinytest', 'underscore',
    'test-helpers', 'marvin:mart'
  ]);

  api.addFiles([
    'test/gateways/gateway-tests.js',
    'test/gateways/test-gateway-tests.js'
    // 'test/contract-tests.js',
    // 'test/stripe-tests.js',
    // 'test/storefront-tests.js',
    // 'test/line-item-tests.js',
    // 'test/cart-tests.js'
  ]);
});
