_.extend(Mart.Card, {
  createCard: function(gatewayType, card, callback) {
    check(card, Mart.Card.fieldsMatcher)
    gatewayType.createCard(card, callback)
  },
})
