const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: String,
  location: String,
});

module.exports = mongoose.model('Company', CompanySchema);
