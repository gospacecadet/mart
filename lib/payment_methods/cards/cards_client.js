_.extend(Mart.Card, {
  createCard: function(gatewayTypeName, card, options, callback) {
    Mart.GatewayTypes[gatewayTypeName].createCard(card, options, callback)
  },
  notStoredSchema: new SimpleSchema({
    number: {
      type: Number,
      label: "Credit card number",
      min: 1000000000000000,
      max: 9999999999999999
    },
    nameOnCard: {
      type: String,
      label: "Name on card",
    },
    expMonth: {
      type: Number,
      label: "Expiration month",
      min: 0,
      max: 12
    },
    expYear: {
      type: Number,
      label: "Expiration year",
      min: new Date().getFullYear(),
      max: new Date().getFullYear() + 100
    },
    cvc: {
      type: Number,
      label: "CVC",
      min: 100,
      max: 999
    }
  })
})
