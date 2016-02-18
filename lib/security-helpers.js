Security.defineMethod('ifRoles', {
  fetch: [],
  deny: function (type, roles, userId, doc) {
    return !userId ||
      !Roles.userIsInRole(userId, roles, Mart.ROLES.GROUPS.GLOBAL)
  }
});
