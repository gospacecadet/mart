Meteor.methods({
  'mart/report': function(startDate, endDate) {
    check(startDate, Date)
    check(endDate, Date)

    if(!Mart.isAdmin()) {
      throw new Meteor.Error('invalid-permission', 'you dont have permission to do that')
    }

    var collection = Mart.Carts.find({$and: [
      {submittedAt: {$gt: startDate}},
      {submittedAt: {$lt: endDate}},
    ]}).fetch();

    var heading = true; // Optional, defaults to true
    var delimiter = ";" // Optional, defaults to ",";
    return exportcsv.exportToCSV(collection, heading, delimiter);
  }
})
