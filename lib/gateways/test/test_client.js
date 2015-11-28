_.extend(Mart.GatewayTypes.Test, {
  // {
  //   number: Number,
  //   expMonth: Number,
  //   expYear: Number,
  //   nameOnCard: String,
  //   cvc: String
  // }
  createCard: function(card, callback) {
    console.log("Mart.GatewayTypes.Test");
    // check(card, Mart.Card.fieldsMatcher)
    console.log("Mart.GatewayTypes.Test " + parseInt(card.number.toString().slice(-4)));
    console.log("Mart.GatewayTypes.Test " + card.expMonth);
    console.log("Mart.GatewayTypes.Test " + card.expYear);
    console.log("Mart.GatewayTypes.Test " + card.nameOnCard);
    var testCard = {
      last4: parseInt(card.number.toString().slice(-4)),
      expMonth: card.expMonth,
      expYear: card.expYear,
      nameOnCard: card.nameOnCard,
      brand: "Visa"
    }
    console.log("Mart.GatewayTypes.Test#createCard");
    Mart.Cards.insert(testCard, function(error, result) {
      console.log("Mart.GatewayTypes.Test#error " + error);
      console.log("Mart.GatewayTypes.Test#callback " + result);
      return callback(error, result)
    })
  },
})
