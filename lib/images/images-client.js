Mart.Image = {
  // options: objectId, objectType, tags, maxWidth, maxHeight, quality, outputFormat
  upload: function(file, options, callback) {
    this.resizeAndCompress(file, options, function(error, file) {
      if(error)
        return callback(error, file)

      var uploader = new Slingshot.Upload(options.directiveName)
      uploader.send(file, function(error, downloadUrl) {
        if(error)
          return callback(error, downloadUrl)

        Mart.Images.insert({
          objectId: options.objectId,
          objectType: options.objectType,
          url: downloadUrl,
          tags: options.tags
        }, callback)

      })
    })
  },
  resizeAndCompress: function(file, options, callback) {
    var compressedImg = this.compress(file, options.quality, options.outputFormat)
    this.resize(compressedImg, options, callback)
  },
  resize: function(file, options, callback) {
    var scaledImage = loadImage.scale(
        file, // img or canvas element
        options
    );

    callback(undefined, scaledImage)
  },
  /**
   * CREDIT: https://github.com/brunobar79/J-I-C
   * Receives an Image Object (can be JPG OR PNG) and returns a new Image Object compressed
   * @param {Image} source_img_obj The source Image Object
   * @param {Integer} quality The output quality of Image Object
   * @param {String} output format. Possible values are jpg and png
   * @return {Image} result_image_obj The compressed Image Object
   */
  compress: function(source_img_obj, quality, output_format){
       var mime_type = "image/jpeg";
       if(typeof output_format !== "undefined" && output_format == "png"){
          mime_type = "image/png";
       }

       var cvs = document.createElement('canvas');
       cvs.width = source_img_obj.naturalWidth;
       cvs.height = source_img_obj.naturalHeight;
       var ctx = cvs.getContext("2d").drawImage(source_img_obj, 0, 0);
       var newImageData = cvs.toDataURL(mime_type, quality);
       var result_image_obj = new Image();
       result_image_obj.src = newImageData;
       return result_image_obj;
  },
}
