_.extend(Mart.GatewayTypes.Test, {
  // {
  //   number: Number,
  //   expMonth: Number,
  //   expYear: Number,
  //   nameOnCard: String,
  //   cvc: String
  // }
  createCard: function(card, callback) {
    var testCard = {
      last4: parseInt(card.number.toString().slice(-4)),
      expMonth: card.expMonth,
      expYear: card.expYear,
      nameOnCard: card.nameOnCard,
      brand: "Visa",
      gatewayToken: "Test token",
    }

    Mart.Cards.insert(testCard, callback)
  },
})
