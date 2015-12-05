Meteor.publish("mart/storefronts", function() {
  return Mart.Storefronts.find(getDefaultSelector(this.userId), publicFields);
});

Meteor.publish("mart/storefront", function(storefrontId) {
  check(storefrontId, String)
  let selector = _.extend({_id: storefrontId}, getDefaultSelector(this.userId))
  return Mart.Storefronts.find(selector)
});

var getDefaultSelector = function(currentUserId) {
  return {$or: [
    {isPublished: true, isDeleted: false},
    {userId: currentUserId}
  ]}
}

var publicFields = {fields: {
    name: 1,
    description: 1
}}
