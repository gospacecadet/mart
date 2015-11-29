Mart.Cards.permit(['insert']).ifLoggedIn().apply()

Meteor.publish("mart/cards", function() {
  return Mart.Cards.find({userId: this.userId})
});
