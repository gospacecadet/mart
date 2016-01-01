Meteor.publish("mart/storefronts", function() {
  // No role or user required to view published stores stores
  return Mart.Storefronts.find(
    {isPublished: true, isDeleted: false},
    {fields: {
      _id: 1,
      name: 1,
      description: 1
    }})
});

Meteor.publish("mart/storefront", function(storefrontId) {
  check(storefrontId, String)

  if(Roles.userIsInRole(
    this.userId,
    [Mart.ROLES.GLOBAL.ADMIN],
    Mart.ROLES.GROUPS.GLOBAL)) {
      // Admins can view everything
      return [
        Mart.Storefronts.find({_id: storefrontId}),
        Mart.Products.find({storefrontId: storefrontId}),
        Mart.Images.find({objectId: storefrontId, objectCollection: "Storefronts"})
      ]
  } else if(Roles.userIsInRole(
    this.userId,
    [Mart.ROLES.GLOBAL.MERCHANT],
    Mart.ROLES.GROUPS.GLOBAL)) {
      // Merchants can view everything they created that hasn't been deleted
      return [
        Mart.Storefronts.find({userId: this.userId, isDeleted: false, _id: storefrontId}),
        Mart.Products.find({storefrontId: storefrontId}),
        Mart.Images.find({objectId: storefrontId, objectCollection: "Storefronts"})
      ]
  } else if(Roles.userIsInRole(
    this.userId,
    [Mart.ROLES.GLOBAL.REP],
    Mart.ROLES.GROUPS.GLOBAL)) {
      // Merchants can view everything they created that hasn't been deleted
      return [
        Mart.Storefronts.find({repId: this.userId, isDeleted: false, _id: storefrontId}),
        Mart.Products.find({storefrontId: storefrontId}),
        Mart.Images.find({objectId: storefrontId, objectCollection: "Storefronts"})
      ]
  } else {
    return [
      Mart.Storefronts.find(
        {isPublished: true, isDeleted: false, _id: storefrontId},
        {fields: {
          _id: 1,
          name: 1,
          description: 1
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
          unitPrice: 1,
          storefrontId: 1
        }}),
      Mart.Images.find({objectId: storefrontId, objectCollection: "Storefronts"})
    ]
  }
});
