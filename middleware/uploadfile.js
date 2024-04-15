const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `public/image`);
  },
  filename: function (req, file, cb) {
    const randomString = generateRandomString(1 + Math.floor(Math.random() * 10)); // Generate random string of length 1 to 10
    cb(null, file.fieldname + '-' + randomString + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage
});

function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = upload;
