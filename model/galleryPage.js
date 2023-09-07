const mongoose = require('mongoose');

const galleryPage = new mongoose.Schema({
  title: {
    required: true,
    type: String
  },
  subTitle: {
    required: false,
    type: String
  },
  route: {
    required: false,
    type: String
  },
  entries: {
    required: false,
    type: [
      {
        imageUrl: {
          required: false,
          type: String
        },
        text: {
          required: false,
          type: String
        },
        verticalImage: {
          required: false,
          type: Boolean
        }
      }
    ]
  }
});

module.exports = mongoose.model('Page', galleryPage);
