const mongoose = require('mongoose');

const galleryPage = new mongoose.Schema({
  title: {
    required: true,
    type: String
  },
  subTitle: {
    type: String
  },
  route: {
    required: true,
    type: String
  },
  keywords: {
    type: [String]
  },
  description: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  entries: {
    type: [
      {
        imageUrl: {
          type: String
        },
        text: {
          type: String
        },
        verticalImage: {
          type: Boolean
        }
      }
    ]
  }
});

module.exports = mongoose.model('Page', galleryPage);
