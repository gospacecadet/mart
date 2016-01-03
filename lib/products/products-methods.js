Meteor.methods({
  'mart/product/publish': function(productId) {
    check(productId, String)

    var product = Mart.Products.findOne(productId)
    if(!product)
      throw new Meteor.Error(Mart.Errors.UNAUTHORIZED, "You are not allowed to do that.")

    // make sure user has edit permission
    var operationAllowed = Security.can(Meteor.userId())
      .update(product, {$set: {isPublished: true}})
      .for(Mart.Products).check()

    if (operationAllowed) {
      // all prices set
      _.each(Mart.Product._UNITS(), function(unit) {
        let price = Mart.Prices.findOne({
          productId: productId,
          unit: unit
        })

        if(!price) {
          throw new Meteor.Error(Mart.Errors.CANNOT_PUBLISH, "You must give this product prices in all units.")
        }
      })

      return Mart.Products.update(productId,
        {$set: {isPublished: true}},
        {getAutoValues: false}
      )
    } else {
      throw new Meteor.Error(Mart.Errors.UNAUTHORIZED, "You are not allowed to do that.")
    }
  }
});
