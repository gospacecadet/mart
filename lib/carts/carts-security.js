Security.defineMethod("inShoppingState", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc, fields, modifier) {
    // console.log("inShoppingState " + doc.state + "  " + userId + "   " + doc.userId)
    return doc.state !== Mart.Cart.STATES.SHOPPING || userId !== doc.userId
  }
});

Security.defineMethod("ownsCreditCard", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc, fields, modifier) {
    if(type === "update") {
      var cardId = modifier.$set.cardId
      var card = Mart.Cards.findOne(cardId)
    }

    return card === undefined || (card.userId !== userId)
  }
});

Mart.Carts.permit(['update'])
  .inShoppingState()
  .ownsCreditCard()
  .onlyProps(['cardId', 'contactName', 'contactEmail', 'contactPhone', 'contactEntity', 'referer'])
  .apply()
