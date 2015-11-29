Mart.Cards = new Mongo.Collection("MartCards");
Mart.Card = {
  card: function(cardId) {
    return Mart.Cards.findOne(cardId)
  },
  gateway: function(cardId) {
    return Mart.Gateways.findOne(this.card(cardId).gatewayId)
  },
  fieldsMatcher: {
    number: Number,
    expMonth: Number,
    expYear: Number,
    nameOnCard: String,
    cvc: Number
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
  gatewayToken: {
    type: String
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
