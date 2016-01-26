Meteor.methods({
  'mart/storefront/publish': function(storefrontId) {
    // console.log('mart/storefront/publish');
    check(storefrontId, String)

    // make sure user has edit permission
    // var operationAllowed = Security.can(this.userId)
    //   .update(storefrontId, {$set: {isPublished: true}}).
    //   for(Mart.Storefronts).check()
    var storefront = Mart.Storefronts.findOne({
      _id: storefrontId, userId: this.userId
    })
    if(!storefront) {
      throw new Meteor.Error(Mart.Errors.UNAUTHORIZED, "You are not allowed to do that.")
    }

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
  }
});
