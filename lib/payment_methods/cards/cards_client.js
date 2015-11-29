_.extend(Mart.Card, {
  createCard: function(gatewayType, card, callback) {
    check(gatewayType, String)
    check(card, {
      number: Number,
      expMonth: Number,
      expYear: Number,
      cvc: Number,
      nameOnCard: String
    })
    Mart.GatewayTypes[gatewayType].createCard(card, callback)
  },
})
