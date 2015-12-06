Security.defineMethod('ifRoles', {
  fetch: [],
  deny: function (type, roles, userId, doc) {
    return !userId ||
      !Roles.userIsInRole(userId, roles, Mart.ROLES.GROUPS.GLOBAL)
  }
});

// Security.defineMethod('onlyForProps', {
//   fetch: [],
//   transform: null,
//   deny: function (type, props, userId, doc) {
//     var fieldNames = _.keys(doc)
//
//     return !_.every(props, function(prop) {
//       return _.contains(fieldNames, prop)
//     })
//   }
// });
