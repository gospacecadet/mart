var expectedUnits = ['hour', 'day', 'month']
Tinytest.add('Products - Units - _UNITS returns supported units', function(test) {

  test.equal(_.difference(Mart.Product._UNITS(), expectedUnits).length, 0)
  test.equal(_.intersection(Mart.Product._UNITS(), expectedUnits).length, 3)
})
