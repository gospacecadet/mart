Meteor.methods({
  'mart/report/carts': function(startDate, endDate) {
    check(startDate, Date)
    check(endDate, Date)

    if(!Mart.isAdmin()) {
      throw new Meteor.Error('invalid-permission', 'you dont have permission to do that')
    }

    var collection = Mart.Carts.find({$and: [
      {submittedAt: {$gt: startDate}},
      {submittedAt: {$lt: endDate}},
    ]}, {fields: {
      _id: 1,
      storefrontId: 1,
      merchantId: 1,
      state: 1,
      userId: 1,
      storefrontNameAtCheckout: 1,
      productNameAtCheckout: 1,
      storefrontIdAtCheckout: 1,
      addressAtCheckout: 1,
      cityAtCheckout: 1,
      stateAtCheckout: 1,
      zipAtCheckout: 1,
      contactFirstName: 1,
      contactLastName: 1,
      contactRentingOnBehalfBiz: 1,
      contactCity: 1,
      contactZIP: 1,
      cardId: 1,
      submittedAt: 1,
      connectionFeeAtCheckout: 1,
      merchantCutAtCheckout: 1,
      serviceFeeAtCheckout: 1,
      taxAtCheckout: 1,
      totalAtCheckout: 1,
      subtotalAtCheckout: 1,
      preTaxTotalAtCheckout: 1,
      netAtCheckout: 1,
      depositAtCheckout: 1
    }}).fetch();

    var heading = true; // Optional, defaults to true
    var delimiter = ";" // Optional, defaults to ",";
    return exportcsv.exportToCSV(collection, heading, delimiter);
  },

  'mart/report/storefronts': function() {
    if(!Mart.isAdmin()) {
      throw new Meteor.Error('invalid-permission', 'you dont have permission to do that')
    }

    var collection = Mart.Storefronts.find({}, {fields: {
      _id: 1,
      userId: 1,
      name: 1,
      isPublished: 1,
      isDeleted: 1,
      address: 1,
      city: 1,
      state: 1,
      zip: 1,
      createdAt: 1,
      updatedAt:1,
      lowestPriceCents: 1,
      lowestPriceUnit: 1
    }}).fetch();

    var heading = true; // Optional, defaults to true
    var delimiter = ";" // Optional, defaults to ",";
    return exportcsv.exportToCSV(collection, heading, delimiter);
  },

  'mart/report/products': function() {
    if(!Mart.isAdmin()) {
      throw new Meteor.Error('invalid-permission', 'you dont have permission to do that')
    }

    var collection = Mart.Products.find({}, {fields: {
      _id: 1,
      storefrontId: 1,
      name: 1,
      isPublished: 1,
      isDeleted: 1,
      createdAt: 1,
      updatedAt: 1,
      lowestPriceCents: 1,
      lowestPriceUnit: 1,
      occupancy: 1,
      size: 1
    }}).fetch();

    var heading = true; // Optional, defaults to true
    var delimiter = ";" // Optional, defaults to ",";
    return exportcsv.exportToCSV(collection, heading, delimiter);
  }
})
