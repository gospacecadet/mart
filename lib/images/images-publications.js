Meteor.publish("mart/images/product", function(productId) {
  var product = Mart.Products.findOne({
    productId: productId,
    isPublished: true,
    isDeleted: false
  })

  if(product)
    return Mart.Images.find({productId: productId})
});
