Mart.Storefronts.permit(['insert', 'update']).ifRoles([
  Mart.ROLES.GLOBAL.MERCHANT,
  Mart.ROLES.GLOBAL.REP,
  Mart.ROLES.GLOBAL.ADMIN,
]).apply()
