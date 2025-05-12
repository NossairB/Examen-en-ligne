const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: String,
  answers: [Number],
  score: Number,
  geolocation: {
    lat: Number,
    lon: Number
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', resultSchema);
