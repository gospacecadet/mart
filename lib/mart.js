Mart = {
  SERVICE_FEE_PCT: parseFloat(Meteor.settings.public.SERVICE_FEE_PCT),
  HOUR_CONNECTION_FEE_PCT: parseFloat(Meteor.settings.public.HOUR_CONNECTION_FEE_PCT),
  DAY_CONNECTION_FEE_PCT: parseFloat(Meteor.settings.public.DAY_CONNECTION_FEE_PCT),
  MONTH_CONNECTION_FEE_PCT: parseFloat(Meteor.settings.public.MONTH_CONNECTION_FEE_PCT),
  TAX_PCT: parseFloat(Meteor.settings.public.TAX_PCT),
  STRIPE_PUBLIC_KEY: Meteor.settings.public.STRIPE_PUBLIC_KEY,
}

if(Meteor.isServer){
  _.extend(Mart, {
    STRIPE_SECRET_KEY: Meteor.settings.STRIPE_SECRET_KEY,
  })
}
