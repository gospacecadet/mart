Mart.Cards = new Mongo.Collection("MartCards");
Mart.Card = {
  charge: function(contractName, card, callback) {

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
  last4: {
    type: String,
    denyUpdate: true
  },
  expMonth: {
    type: String,
    denyUpdate: true
  },
  expYear: {
    type: String,
    denyUpdate: true
  },
  nameOnCard: {
    type: String,
    denyUpdate: true
  },
  brand: {
    type: String,
    denyUpdate: true
  },
}));
