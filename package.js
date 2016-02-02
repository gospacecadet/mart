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
    'random',
    'amplify',
    'tracker',
    'http'
  ]);

  // Meteor regulars
  api.use([
    "underscore",
  ]);

  // Community packages
  api.use([
    'mrgalaxy:stripe@2.2.0',
    'aldeed:collection2@2.8.0',
    'aldeed:simple-schema@1.5.3',
    'ongoworks:security@1.3.0',
    'momentjs:moment@2.11.1',
    'alanning:roles@1.2.14',
    'marvin:machina@0.1.2',
    'matb33:collection-hooks@0.8.1',
  ]);

  api.use([
    'blueimp:javascript-load-image@1.13.1',
  ], 'client')

  api.add_files([
    'lib/mart.js',
  ])

  api.add_files([
    'lib/subscriptions/subscription.js',
  ])

  api.add_files([
    'lib/subscriptions/subscriptions-methods.js',
    'lib/subscriptions/subscriptions-publications.js',
  ], 'server')

  api.add_files([
    'lib/errors.js',
    'lib/accounts/accounts.js',
    'lib/security-helpers.js',
    'lib/products/products.js',
    'lib/storefronts/storefronts.js',
    "lib/images/images.js",
    'lib/gateways/gateways.js',
    'lib/payment_methods/cards/cards.js',
    "lib/gateways/stripe/stripe.js",
    'lib/gateways/test/test.js',
    'lib/prices/prices.js',
    'lib/line_items/line_items.js',
    'lib/bank-accounts/bank-accounts.js',
    'lib/subscriptions/subscriptions.js',
    'lib/carts/carts.js',
  ])

  api.add_files([
    'lib/storefronts/server/storefronts-publications.js',
    'lib/storefronts/server/storefronts-security.js',
    'lib/accounts/accounts-server.js',
    'lib/accounts/accounts-publications.js',
    "lib/payment_methods/cards/cards_server.js",
    'lib/products/products-publications.js',
    'lib/products/products-security.js',
    'lib/prices/prices-security.js',
    'lib/gateways/gateways_server.js',
    "lib/gateways/stripe/stripe_server.js",
    'lib/line_items/line_items_server.js',
    'lib/carts/carts-publications.js',
    'lib/carts/carts-security.js',
    'lib/carts/carts-machina.js',
    'lib/bank-accounts/bank-accounts-server.js',
    'lib/gateways/stripe/stripe-customers.js',
    'lib/gateways/stripe/stripe-managed-accounts.js',
    'lib/carts/carts-methods.js',
    'lib/images/images-publications.js',
    'lib/images/images-security.js',
    'lib/images/images-methods.js',
    'lib/storefronts/server/storefronts-methods.js',
    'lib/products/products-methods.js',
    'lib/prices/prices-publications.js'
  ], "server")

  api.add_files([
    'lib/images/images-client.js',
    'lib/accounts/accounts-client.js',
    'lib/payment_methods/cards/cards_client.js',
    "lib/gateways/test/test_client.js",
    "lib/gateways/stripe/stripe_client.js",
    'lib/carts/carts_client.js',
    'lib/bank-accounts/bank-accounts-client.js',
  ], "client")

  api.imply([
    'edgee:slingshot@0.7.1',
    'alanning:roles@1.2.14',
    'ongoworks:security@1.3.0',
  ])

  api.imply([
    'accounts-base',
    'accounts-password'
  ])

  api.export("Mart")
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
    'test/gateways/test-tests.js',
    'test/gateways/stripe-tests.js',
    'test/prices/prices-tests.js',
    'test/products/products-tests.js',
    'test/bank-accounts/bank-accounts-tests.js'
  ]);

  api.addFiles([
  ], 'server')

  api.addFiles([
    'test/accounts/accounts-validation-tests.js',
    'test/accounts/accounts-creation-tests.js',
    'test/storefront/storefronts-publications-tests.js',
    'test/storefront/storefronts-security-tests.js',
    'test/images/image-tests.js',
    'test/payment_methods/card-tests.js',
    'test/products/products-security-tests.js',
    'test/carts/guest-cart-settled-test.js',
    'test/carts/cart-settled-test.js',
    'test/line-items/line-item-tests.js',
  ], "client");
});
