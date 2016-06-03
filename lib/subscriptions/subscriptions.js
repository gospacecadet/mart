Mart.Subscriptions = new Mongo.Collection("MartSubscriptions",{
  transform: function(doc) {return new Subscription(doc)}
});

var Subscription = function(doc) {
  _.extend(this, doc)
}

_.extend(Subscription.prototype, {
  cart() {
    return Mart.Carts.findOne(this.originalCartId);
  },
  nextChargeOn() {
    if(this.state === Mart.Subscription.STATES.SPAWNED)
      return this.startAt

    return moment(this.lastCartSpawnedAt).add(1, 'months').toDate();
  },
  process: function() {
    if(Meteor.isServer){
      var now = new Date().getTime()

      // Subscriptions are only billed once the start time hits
      if((now >= this.startAt.getTime()) && (this.state === Mart.Subscription.STATES.SPAWNED))
        this.activate()

      console.log('activated subscription');
      if(this.pastDue()) {
        console.log('subscription past due');
        var newCart = _.clone(this.cart())
        newCart.state = Mart.Cart.STATES.WAITING_TRANSFER_ACCEPTANCE
        newCart.subscriptionId = this._id

        Mart.Carts.insert(newCart)
        Mart.Subscriptions.update(this._id, {$set: {
          lastCartSpawnedAt: new Date()
        }})
      }
    }
  },
  activate: function() {
    if(Meteor.isServer){
      var plan, subscription
      var cart = this.cart()
      // console.log("Activate cart");
      // console.log(cart);
      if(cart) {
        var Stripe = StripeAPI(Meteor.settings.STRIPE_SECRET_KEY);

        var createPlan = Meteor.wrapAsync(Stripe.plans.create, Stripe.plans);
        var createSubscription = Meteor.wrapAsync(Stripe.customers.createSubscription, Stripe.customers);

        var customer = Mart.GatewayTypes.Stripe.Customers.findOne({userId: cart.userId})

        try {
          // Make the transfer
          const plan = {
            amount: cart.recurringTotal(),
            interval: "month",
            name: "Cart " + cart._id + " at " + cart.storefrontNameAtCheckout,
            currency: "usd",
            id: cart._id
          }
          console.log('creating plan');
          console.log(plan);
          createPlan(plan);

          subscription = createSubscription(customer.stripeToken, {plan: cart._id})

          Mart.Subscriptions.update(this._id, {$set: {
            gatewayToken: subscription.id,
            state: Mart.Subscription.STATES.ACTIVE,
          }})
        } catch (error) {
          throw new Meteor.Error("stripe-create-subscription-error", error.message);
        }
      }

    }
  },
  // Past due if subscription is active but
  pastDue: function() {
    var isActive = (this.state === Mart.Subscription.STATES.ACTIVE)
    var cartNeverSpawned = !this.lastCartSpawnedAt

    if(isActive) {
      if(cartNeverSpawned) {
        return true
      } else {
        var monthAgo = moment().subtract('months', 1).unix()
        return this.lastCartSpawnedAt.getTime() <= monthAgo
      }
    }

    return false
  }
})

Mart.Subscriptions.attachSchema(new SimpleSchema({
  originalCartId: {
    type: String
  },
  userId: {
    type: String
  },
  merchantId: {
    type: String
  },
  gatewayToken: {
    type: String,
    optional: true
  },
  lastCartSpawnedAt: {
    type: Date,
    optional: true
  },
  subtotal: {
    type: Number
  },
  serviceFee: {
    type: Number
  },
  tax: {
    type: Number
  },
  total: {
    type: Number
  },
  merchantCut: {
    type: Number
  },
  connectionFee: {
    type: Number
  },
  name: {
    type: String
  },
  startAt: {
    type: Date
  },
  state: {
    type: String
  },
  storefrontName: {
    type: String
  },
  productName: {
    type: String
  },
  createdAt: {
    type: Date
  }
}))
