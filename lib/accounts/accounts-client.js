Handlebars.registerHelper("loggedIn", function() {
  return !!Meteor.userId()
});


Handlebars.registerHelper("currentUsername", function() {
  if(!!Meteor.user()) {
    return Meteor.user().emails[0].address + " " + currentRoles()
  } else {
    return "Not logged in"
  }
});

var currentRoles = function() {
  var allRoles = Mart.ROLES.GLOBAL
  var userRoles = Meteor.user().roles[Mart.ROLES.GROUPS.GLOBAL]

  var role = _.find(_.invert(allRoles), function(friendlyName, name) {
    return _.contains(userRoles, name)
  })

  return "(" + role + ")"
}
