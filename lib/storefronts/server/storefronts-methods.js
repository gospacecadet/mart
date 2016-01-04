Meteor.methods({
  'mart/storefront/publish': function(storefrontId) {
    // console.log('mart/storefront/publish');
    check(storefrontId, String)

    // make sure user has edit permission
    var operationAllowed = Security.can(Meteor.userId())
      .update(storefrontId, {$set: {isPublished: true}}).
      for(Mart.Storefronts).check()

    if (operationAllowed) {
      // if store has at least one published product
      let publishedProduct = Mart.Products.findOne({
        storefrontId: storefrontId,
        isPublished: true,
        isDeleted: false
      })

      if(!!publishedProduct) {
        Mart.Storefronts.update(storefrontId,
          {$set: {isPublished: true}},
          {getAutoValues: false})
      } else {
        throw new Meteor.Error(Mart.Errors.CANNOT_PUBLISH, "There must be at least one published product first.")
      }
    } else {
      throw new Meteor.Error(Mart.Errors.UNAUTHORIZED, "You are not allowed to do that.")
    }
  }
});
