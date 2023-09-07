const mongoose = require('mongoose');

const user = new mongoose.Schema({
  username: {
    required: true,
    type: String
  },
  passwordHash: {
    required: true,
    type: String
  }
});

module.exports = mongoose.model('User', user);