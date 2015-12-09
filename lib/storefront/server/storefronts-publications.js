var publicSelector = {isPublished: true, isDeleted: false}
var publicFields = {fields: {
  name: 1,
  description: 1
}}

Meteor.publish("mart/storefronts", function() {
  // No role or user required to view published stores stores
  return Mart.Storefronts.find(publicSelector, publicFields)
});

Meteor.publish("mart/storefront", function(storefrontId) {
  check(storefrontId, String)

  if(Roles.userIsInRole(
    this.userId,
    [Mart.ROLES.GLOBAL.ADMIN],
    Mart.ROLES.GROUPS.GLOBAL)) {
      // Admins can view everything
      return Mart.Storefronts.find({})
  } else if(Roles.userIsInRole(
    this.userId,
    [Mart.ROLES.GLOBAL.MERCHANT],
    Mart.ROLES.GROUPS.GLOBAL)) {
      // Merchants can view everything they created that hasn't been deleted
      return Mart.Storefronts.find(
        {userId: this.userId, isDeleted: false})
  } else if(Roles.userIsInRole(
    this.userId,
    [Mart.ROLES.GLOBAL.REP],
    Mart.ROLES.GROUPS.GLOBAL)) {
      // Merchants can view everything they created that hasn't been deleted
      return Mart.Storefronts.find(
        {repId: this.userId, isDeleted: false})
  } else {
    return Mart.Storefronts.find(
      _.extend(publicSelector, {_id: storefrontId}), 
      publicFields)
  }
});
