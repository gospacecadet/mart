Mart.Images.hookOptions.after.update = {fetchPrevious: false};

Mart.Images.after.insert(function (userId, doc) {
  if(doc.objectCollection === "Storefronts") {
    touchStorefrontUpdatedAt(doc.objectId)
  } else if(doc.objectCollection === "Products") {
    touchProductUpdatedAt(doc.objectId)
  }
});

Mart.Images.after.update(function (userId, doc, fieldNames, modifier, options) {
  if(doc.objectCollection === "Storefronts") {
    touchStorefrontUpdatedAt(doc.objectId)
  } else if(doc.objectCollection === "Products") {
    touchProductUpdatedAt(doc.objectId)
  }
});
