Meteor.publish("mart/images/product", function(productId) {
  // console.log("mart/images/product");
  var product = Mart.Products.findOne({
    _id: productId,
    isPublished: true,
    isDeleted: false
  })

  if(product)
    return Mart.Images.find({objectId: productId, objectCollection: "Products"})
});
