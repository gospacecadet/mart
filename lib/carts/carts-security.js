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

Security.defineMethod("validStateChange", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc, fields, modifier) {
    var newState, oldState
    if(type === "update") {
      newState = modifier.$set.state
      oldState = doc.state
    } else if (type === "insert") {
      newState = doc.state
    } else {
      return true
    }
    // console.log("switching from " + oldState + " to " + newState);
    return !validStateTransition(oldState, newState)
  }
});

function validStateTransition(oldState, newState) {
  if(oldState === undefined) {
    if(newState === Mart.Cart.STATES.SHOPPING) {
      return true
    }
  } else if(oldState === Mart.Cart.STATES.SHOPPING) {
    if(newState === Mart.Cart.STATES.SHOPPING) { // use upserts for creation
      return true
    } else if(newState === Mart.Cart.STATES.AWAITING_PAYMENT) {
      return true
    }
  }
  return false
}

Mart.Carts.permit(['update'])
  .inShoppingState()
  .ownsCreditCard()
  .validStateChange()
  .apply()
