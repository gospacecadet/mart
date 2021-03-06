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
        let price = Mart.Prices.findOne({
          productId: productId,
        })

        if(!price) {
          throw new Meteor.Error(Mart.Errors.CANNOT_PUBLISH, "You must give this product a price in at least one unit.")
        }

      var productUpdate = Mart.Products.update(productId,
        {$set: {isPublished: true}},
        {getAutoValues: false}
      )

      updateLowestProductPrice(productId)

      return productUpdate
    } else {
      throw new Meteor.Error(Mart.Errors.UNAUTHORIZED, "You are not allowed to do that.")
    }
  },
  'mart/product/unpublish': function(productId) {
    check(productId, String)

    var product = Mart.Products.findOne({_id: productId})
    console.log(product);
    if(!product)
      throw new Meteor.Error('unauthorized', "You are not allowed to do that.")

    var storefront = Mart.Storefronts.findOne({userId: Meteor.userId(), _id: product.storefrontId})
    if(!storefront)
      throw new Meteor.Error('unauthorized', "You are not allowed to do that.")

    var productUpdate = Mart.Products.update(productId,
      {$set: {isPublished: false}},
      {getAutoValues: false})

    updateLowestProductPrice(productId)
    enforceStorefrontPublicationRules(productId)

    return productUpdate;
  }
});

var enforceStorefrontPublicationRules = function(productId) {
  console.log('enforceStorefrontPublicationRules');
  var product = Mart.Products.findOne(productId)
  if(product) {
    console.log('isProduct');
    var publishedProducts = Mart.Products.find({storefrontId: product.storefrontId, isPublished: true})
    console.log(productId);
    if(publishedProducts.count() < 1)
      Mart.Storefronts.update(product.storefrontId,
        {$set: {isPublished: false}},
        {getAutoValues: false})

  }
}

touchProductUpdatedAt = function(productId) {
  var product = Mart.Products.findOne(productId)
  if(product) {
    Mart.Products.update(productId, {$set: {updatedAt: new Date()}})
  }
}
