
const mongoose = require('mongoose')

module.exports = mongoose.connect(process.env.DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})