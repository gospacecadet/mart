Mart.Cards = new Mongo.Collection("MartCards");
Mart.Card = {
  card: function(cardId) {
    return Mart.Cards.findOne(cardId)
  },
  gateway: function(cardId) {
    return Mart.Gateways.findOne(this.card(cardId).gatewayId)
  }
}

Mart.Cards.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    autoValue: function() {
      return this.userId;
    },
    denyUpdate: true
  },
  gateway: {
    type: String,
    denyUpdate: true,
    allowedValues: ['Test', 'Stripe']
  },
  gatewayToken: {
    type: String,
    denyUpdate: true,
  },
  last4: {
    type: Number,
    min: 1000,
    max: 9999,
    denyUpdate: true
  },
  expMonth: {
    type: Number,
    min: 0,
    max: 12,
    denyUpdate: true
  },
  expYear: {
    type: Number,
    min: 2015,
    denyUpdate: true
  },
  nameOnCard: {
    type: String,
    denyUpdate: true,
    max: 100
  },
  brand: {
    type: String,
    denyUpdate: true,
    allowedValues: ['Visa', 'Mastercard']
  },
}));
