_.extend(Mart.Card, {
  createCard: function(gatewayTypeName, card, options, callback) {
    console.log("cardsclient#createCard " + gatewayTypeName);
    Mart.GatewayTypes[gatewayTypeName].createCard(card, options, callback)
  },
})
