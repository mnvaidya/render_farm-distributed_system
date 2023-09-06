const multer = require("multer"); // for uploading images to the API album
const path = require("path");
const fs = require("fs");


// multer setup
const storage = multer.diskStorage({
  destination: `../server/scenes/`,
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});



function checkFileType(file, cb) {
  const filetypes = /blend/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error! Only blend files are valid.");
  }
}


module.exports = upload;