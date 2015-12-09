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
    'random'
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
    'momentjs:moment@2.10.6',
    'alanning:roles@1.2.14',
    // 'matb33:collection-hooks@0.7.5',
  ]);

  api.use([
    'blueimp:javascript-load-image@1.13.1'
  ], 'client')

  api.add_files([
    "lib/mart.js",
    'lib/accounts/accounts.js',
    'lib/security-helpers.js',
    'lib/storefront/storefront.js', 'lib/storefront/storefronts.js',
    "lib/images/images.js",
    // 'lib/gateways/gateways.js',
    // 'lib/gateways/test/test.js',
    // 'lib/payment_methods/cards/cards.js',
    // "lib/gateways/stripe/stripe.js",
    // 'lib/storefronts/storefronts.js',
    // 'lib/products/products.js',
    // 'lib/line_items/line_items.js',
    // 'lib/carts/carts.js',
  ])

  api.add_files([
    'lib/storefront/server/storefronts-publications.js',
    'lib/storefront/server/storefronts-security.js',
    'lib/accounts/accounts-server.js'
    // "lib/payment_methods/cards/cards_server.js",
    // 'lib/gateways/gateways_server.js',
    // "lib/gateways/stripe/stripe_server.js",
    // 'lib/storefronts/storefronts_server.js',
    // 'lib/products/products_server.js',
    // 'lib/line_items/line_items_server.js',
    // 'lib/carts/carts_server.js'
  ], "server")

  api.add_files([
    'lib/images/images-client.js',
    'lib/accounts/accounts-client.js'
    // "lib/gateways/test/test_client.js",
    // "lib/gateways/stripe/stripe_client.js",
    // 'lib/carts/carts_client.js'
  ], "client")

  api.export("Mart")
  api.imply('edgee:slingshot@0.7.1')
});

Package.onTest(function(api) {
  api.use([
    'tinytest', 'ecmascript', 'underscore', 'random',
    'test-helpers', 'marvin:mart', 'accounts-base', 'accounts-password',
  ]);

  api.use([
    'alanning:roles@1.2.14'
  ])

  api.addFiles([
    'test/helpers.js',
    // 'test/gateways/test-tests.js',
    // 'test/card-tests.js',
    // 'test/gateways/stripe-tests.js',
    // 'test/line-item-tests.js',
    // 'test/cart-tests.js'
  ]);

  api.addFiles([
    // 'test/gateways/test-tests.js',
    // 'test/card-tests.js',
    // 'test/gateways/stripe-tests.js',
    'test/accounts/accounts-validation-tests.js',
    'test/accounts/accounts-creation-tests.js',
    'test/storefront/storefronts-publications-tests.js',
    'test/storefront/storefronts-security-tests.js',
    'test/images/image-tests.js',
    // 'test/line-item-tests.js',
    // 'test/cart-tests.js'
  ], "client");
});
