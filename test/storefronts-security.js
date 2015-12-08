let commonProps = [
  'name',
  'description',
  'isDeleted',
  'isPublished',
  'userId',
  'repId'
]

Security.defineMethod('ifHasRepId', {
  fetch: [],
  deny: function (type, roles, userId, doc) {
    return !userId || doc.repId !== userId
  }
});

Mart.Storefronts.permit(['insert', 'update'])
.ifRoles([
  Mart.ROLES.GLOBAL.MERCHANT,
  Mart.ROLES.GLOBAL.ADMIN,
  Mart.ROLES.GLOBAL.REP
])
.onlyProps(commonProps)
.apply()
