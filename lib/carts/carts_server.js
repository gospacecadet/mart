Meteor.methods({
  'mart/cart/findCurrentOrCreate': function(guestId) {
    userId = Meteor.userId()
    if(userId) {
      return Mart.Carts.update({
        state: Mart.Cart.STATES.SHOPPING,
        userId: userId
      }, {$set: {state: Mart.Cart.STATES.SHOPPING, userId: userId}},
      {validate: false, upsert: true})
    } else if(guestId) {
      return Mart.Carts.update({
        state: Mart.Cart.STATES.SHOPPING,
        guestId: guestId
      }, {$set: {state: Mart.Cart.STATES.SHOPPING, guestId: guestId}},
      {validate: false, upsert: true})
    }
  }
});
