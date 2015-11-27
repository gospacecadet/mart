Mart
====

Meteor based platform that creates marketplaces where shoppers can buy from multiple vendors.

Installation
------------

```
meteor add marvin:mart
```

Assumes using FlowRouter

Usage
-----

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

#### Mart

-	Mart.**createContract**(CONTRACT_NAME, GATEWAY_TYPE): creates a new contract (payment processor)
	-	CONTRACT_NAME: String
	-	GATEWAY_TYPE: Mart.Stripe currently the only option

#### Mart.Stripe

-	Mart.Stripe.**setPublishableKey**(PUBLISHABLE_KEY): sets the PUBLISHABLE_KEY for Stripe
	-	PUBLISHABLE_KEY: String

#### Mart.LineItem

-	Mart.LineItem.**subtotal**(lineItemId): return the subtotal for a specific Line Item

#### Mart.Cart

-	Mart.Cart.**subtotal**(cartId): return the subtotal for a specific cart
