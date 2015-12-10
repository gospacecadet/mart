Meteor.methods({
  'mart/cart/findCurrentOrCreate': function() {
    userId = Meteor.userId()
    if(userId) {
      return Mart.Carts.update({
        state: Mart.Cart.STATES.SHOPPING,
        userId: userId
      }, {$set: {state: Mart.Cart.STATES.SHOPPING, userId: userId}},
      {validate: false, upsert: true})
    }
  }
});
