
const multer = require('multer');

const storage = multer.diskStorage({});

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only image files allowed'), false);
//   }
// };

const fileFilter = (req, file, cb) => {
  if (!file.mimetype) {
    cb(new Error("Invalid file"), false);
  }

  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;
