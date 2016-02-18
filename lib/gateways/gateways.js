Mart.Gateways = new Mongo.Collection("MartGateways");
Mart.GatewayTypes = {}

Mart.Gateways.attachSchema(new SimpleSchema({
  gatewayType: {
    type: String,
    allowedValues: ['Test', 'Stripe']
  },
  businessName: {
    type: String,
  },
  businessURL: {
    type: String,
  },
  detailsSubmitted: {
    type: Boolean,
  },
  chargesEnabled: {
    type: Boolean,
  },
  transfersEnabled: {
    type: Boolean,
  },
}));
