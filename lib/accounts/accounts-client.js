Handlebars.registerHelper("loggedIn", function() {
  return !!Meteor.userId()
});
