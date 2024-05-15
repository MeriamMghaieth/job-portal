const mongoose = require('mongoose');

const ApplicantSchema = new mongoose.Schema({
  name: String,
  resume: String,
});

module.exports = mongoose.model('Applicant', ApplicantSchema);
