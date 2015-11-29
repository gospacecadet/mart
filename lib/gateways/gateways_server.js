Meteor.publish("mart/gateways", function() {
  return Mart.Gateways.find({})
});
