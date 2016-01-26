Meteor.publish("mart/storefronts", function() {
  // console.log("mart/storefronts");
  if(Mart._isAdmin(this.userId)) {
      // Admins can view everything
      return [
        Mart.Storefronts.find(),
        Mart.Images.find({objectCollection: "Storefronts"})
      ]
  } else if(Mart._isMerchant(this.userId)) {
      // Merchants can view everything they created that hasn't been deleted
      return [
        Mart.Storefronts.find({userId: this.userId, isDeleted: false}),
        Mart.Images.find({objectCollection: "Storefronts"})
      ]
  } else if(Mart._isRep(this.userId)) {
      // Merchants can view everything they created that hasn't been deleted
      return [
        Mart.Storefronts.find({repId: this.userId, isDeleted: false}),
        Mart.Images.find({objectCollection: "Storefronts"})
      ]
  } else {
    // No role or user required to view published stores stores
    return [
      Mart.Storefronts.find(
        {isPublished: true, isDeleted: false},
        {fields: {
          _id: 1,
          name: 1,
          description: 1,
          address: 1,
          address2: 1,
          city: 1,
          state: 1,
          zip: 1,
          userId: 1,
        }}),
      Mart.Images.find()
    ]
  }

});

Meteor.publish("mart/storefront", function(storefrontId) {
  check(storefrontId, String)
  var storefront = Mart.Storefronts.findOne(storefrontId)

  if(!storefront)
    return this.ready()

  if(Mart._isAdmin(this.userId)) {
      // Admins can view everything
      return [
        Mart.Storefronts.find({_id: storefrontId}),
        Mart.Products.find({storefrontId: storefrontId}),
        Mart.Images.find({objectId: storefrontId, objectCollection: "Storefronts"}),
        Meteor.users.find(storefront.userId, {fields: {
          profile: 1,
        }})
      ]
  } else if(Mart._isMerchant(this.userId)) {
    // Merchants can view everything they created that hasn't been deleted
    return [
      Mart.Storefronts.find({
        userId: this.userId, isDeleted: false, _id: storefrontId
      }),
      Mart.Products.find({storefrontId: storefrontId}),
      Mart.Images.find({objectId: storefrontId, objectCollection: "Storefronts"}),
      Meteor.users.find(storefront.userId, {fields: {
        profile: 1,
      }})
    ]
  } else if(Mart._isRep(this.userId)) {
      // Merchants can view everything they created that hasn't been deleted
      return [
        Mart.Storefronts.find({repId: this.userId, isDeleted: false, _id: storefrontId}),
        Mart.Products.find({storefrontId: storefrontId}),
        Mart.Images.find({objectId: storefrontId, objectCollection: "Storefronts"}),
        Meteor.users.find(storefront.userId, {fields: {
          profile: 1,
        }})
      ]
  } else {
    return [
      Mart.Storefronts.find(
        {isPublished: true, isDeleted: false, _id: storefrontId},
        {fields: {
          _id: 1,
          name: 1,
          description: 1,
          address: 1,
          address2: 1,
          city: 1,
          state: 1,
          zip: 1,
          userId: 1,
        }}),
      Mart.Products.find({
          isPublished: true,
          isDeleted: false,
          storefrontId: storefrontId
        },
        {fields: {
          _id: 1,
          name: 1,
          description: 1,
          storefrontId: 1,
          occupancy: 1,
          size: 1,
        }}),
      Mart.Images.find({objectId: storefrontId, objectCollection: "Storefronts"}),
      Meteor.users.find(storefront.userId, {fields: {
        profile: 1,
      }})
    ]
  }
});
