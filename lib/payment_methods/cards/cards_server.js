Mart.Cards.permit(['insert']).apply()

Meteor.publish("mart/cards", function(guestId) {
  check(guestId, Match.OneOf(String, null, undefined))

  var selector
  if(this.userId) {
    selector = {userId: this.userId}
  } else {
    selector = {guestId: guestId}
  }

  return Mart.Cards.find(selector, {fields: {
    _id: 1,
    last4: 1,
    expMonth: 1,
    expYear: 1,
    nameOnCard: 1,
    brand: 1
  }})
});
