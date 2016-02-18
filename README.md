Mart
====
// stuck http://stackoverflow.com/questions/33964967/canvas-toblob-is-not-recognized-as-a-function-in-chrome-or-ie
Meteor based platform that creates marketplaces where shoppers can buy from multiple vendors.

Installation
------------

```
meteor add marvin:mart
```

Assumes using FlowRouter

Usage
-----

See a live demo [here](http://betaspacecadetio-55593.onmodulus.net/), OR
see the source [here](https://github.com/marvinmarnold/beta.spacecadet.io/)

### Add a Stripe account

In `server/stripe.js`:

```
Mart.createContract(CONTRACT_NAME, Mart.Stripe)
```

Set Stripe keys:

In settings.json

```
{
  "MartStripePublicKey": PUBLIC_KEY,
  "MartStripeSecretKey": PRIVATE_KEY
}    
```

Mart.Stripe.setPublishableKey("pk_test_cUA2GkVEAZpwSRZk3DilRcTR")

### API

#### Mart.Accounts
Must use Mart.Accounts.createUser in order to create with roles. This means that accounts-ui packages will not work.

#### Mart.Storefront
##### Publications

- **mart/storefronts** - Public fields* for all published, non-deleted Storefronts.
- **mart/storefronts** - If Admin, returns all. If Merchant, all that are not deleted. If Rep, all that are not deleted. Otherwise none.

\* public fields = [name, description]
#### Mart.Stripe

-	Mart.Stripe.**setPublishableKey**(PUBLISHABLE_KEY): sets the PUBLISHABLE_KEY for Stripe
	-	PUBLISHABLE_KEY: String

#### Mart.LineItem

-	Mart.LineItem.**subtotal**(lineItemId): return the subtotal for a specific Line Item

#### Mart.Cart

-	Mart.Cart.**subtotal**(cartId): return the subtotal for a specific cart
