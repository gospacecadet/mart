Mart.Cards.permit(['insert']).ifLoggedIn().apply()

Meteor.publish("cards", function() {
  return Mart.Cards.find({userId: this.userId})
});
