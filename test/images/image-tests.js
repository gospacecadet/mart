// Tinytest.addAsync('Image - Upload', function(test, done) {
//
// })

Tinytest.addAsync('Image - Resize', function(test, done) {
  var img, blob

  function imgRetrieved(error) {
    if (this.status == 200) {
      var blob = new Blob([this.response], {type: 'image/jpg'})
      blob.name = 'blob.jpg'
      img = document.createElement('img');
      img.src = window.URL.createObjectURL(blob);
      img.style = 'display: none;'
      img.onload = imgLoaded

      document.body.appendChild(img)
    }
  }

  function imgLoaded() {
    var originalWidth = img.width
    var originalHeight = img.height
    Mart.Image.resize(img, {
      maxWidth: 500,
      quality: 0.2,
      outputFormat: 'jpg'
    }, function(error, file) {
      test.equal(file.width, 500)
      test.isTrue(originalHeight > file.height)
      done()
    })
  }

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", 'https://scontent-dfw1-1.xx.fbcdn.net/hphotos-xpt1/v/t1.0-9/12346343_871489722946736_5400293110848611387_n.jpg?oh=420c4ce953952c93b6d282898dd1061d&oe=56DBA4F4', true); // true for asynchronous
  xmlHttp.responseType = 'blob';
  xmlHttp.onload = imgRetrieved
  xmlHttp.send();
})

Tinytest.addAsync('Image - Compress', function(test, done) {
  var originalSize, newSize, img, resizedImg

  function imgRetrieved(error) {
    if (this.status == 200) {
      var blob = new Blob([this.response], {type: 'image/jpg'})
      originalSize = blob.size
      img = document.createElement('img');
      img.src = window.URL.createObjectURL(blob);
      img.style = 'display: none;'
      img.onload = imgLoaded

      document.body.appendChild(img)
    }
  }

  function imgLoaded() {
    resizedImg = document.createElement('img');
    resizedImg.src = Mart.Image.compress(img, 0.1, 'jpg').src
    resizedImg.style = 'display: none;'
    resizedImg.onload = resizedLoaded

    document.body.appendChild(resizedImg)
  }

  function resizedLoaded() {
    var cvs = document.createElement('canvas');
    var ctx = cvs.getContext("2d").drawImage(resizedImg, 0, 0);
    var type = "image/jpeg";
    var data = cvs.toDataURL(type);
    var blob = dataURLtoBlob(data)
    newSize = blob.size

    // Give a little buffer above specified compression level
    test.isTrue((originalSize * 0.2) >= newSize)
    done()
  }

  var xmlHttp = new XMLHttpRequest();

  xmlHttp.open("GET", 'https://scontent-dfw1-1.xx.fbcdn.net/hphotos-xpt1/v/t1.0-9/12346343_871489722946736_5400293110848611387_n.jpg?oh=420c4ce953952c93b6d282898dd1061d&oe=56DBA4F4', true); // true for asynchronous
  xmlHttp.responseType = 'blob';
  xmlHttp.onload = imgRetrieved
  xmlHttp.send();
})

var dataURLtoBlob = function(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

Tinytest.addAsync('Image - Compress', function(test, done) {
  var originalImg, resizedImg, originalBlob, resizedBlob
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", 'https://scontent-dfw1-1.xx.fbcdn.net/hphotos-xpt1/v/t1.0-9/12346343_871489722946736_5400293110848611387_n.jpg?oh=420c4ce953952c93b6d282898dd1061d&oe=56DBA4F4', true); // true for asynchronous
  xmlHttp.responseType = 'blob';
  xmlHttp.onload = originalImgRetrieved
  xmlHttp.send();

  function originalImgRetrieved(error) {
    if (this.status == 200) {
      originalBlob = new Blob([this.response], {type: 'image/jpg'})
      originalBlob.name = 'blob.jpg'

      originalImg = document.createElement('img');
      // originalImg.style = 'display: none;'
      originalImg.src = window.URL.createObjectURL(originalBlob);
      originalImg.onload = onOriginalImgLoaded

      document.body.appendChild(originalImg)
    }
  }

  function onOriginalImgLoaded() {
    Resizer.resize(originalBlob, {}, function(err, canvas) {
      resizedBlob = canvas.toBlob()
      resizedImg = document.createElement('img');
      // resizedImg.style = 'display: none;'
      resizedImg.src = window.URL.createObjectURL(canvas);
      resizedImg.onload = onResizedImgLoaded

      document.body.appendChild(resizedImg)
    })
  }

  function onResizedImgLoaded() {
    test.equal(resizedImg.height, originalImg.height, "Resized height different than original")
    test.equal(resizedImg.width, originalImg.width, "Resized width different than original")

    Resizer.resize(resizedBlob, {quality: 0.3}, function(err, canvas) {
      var finalBlob = canvas.toBlob()
      console.log(resizedBlob.size);
      console.log(finalBlob.size);
      test.isTrue(resizedBlob.size > finalBlob.size, "Resized image does not appear compressed.")

      done()
    })

  }
})
