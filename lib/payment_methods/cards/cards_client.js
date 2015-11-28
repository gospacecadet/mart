_.extend(Mart.Card, {
  createCard: function(gatewayType, card, callback) {
    check(gatewayType, {
      currency: String,
      gatewayType: String,
      requiredFieldsMatch: Object,
      optionalFieldsMatch: Object,
      requiredFields: Object,
      retrieveAccountInfo: Function,
      createCard: Function
    })

    check(card, Mart.Card.fieldsMatcher)
    console.log("createCard " + card.number);
    gatewayType.createCard(card, callback)
  },
})
