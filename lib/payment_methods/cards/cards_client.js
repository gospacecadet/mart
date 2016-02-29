_.extend(Mart.Card, {
  createCard: function(gatewayTypeName, card, options, callback) {
    Mart.GatewayTypes[gatewayTypeName].createCard(card, options, callback)
  },
})
