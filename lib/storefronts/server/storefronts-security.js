Mart.Storefronts.permit(['insert', 'update'])
.ifRoles([
  Mart.ROLES.GLOBAL.MERCHANT,
  Mart.ROLES.GLOBAL.ADMIN,
  Mart.ROLES.GLOBAL.REP
])
.apply()
