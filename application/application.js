const mongoose = require('mongoose');
const { Schema } = mongoose;

const ApplicationSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  applicantId: { type: Schema.Types.ObjectId, ref: 'Applicant', required: true },
  status: { type: String, required: true }
});

module.exports = mongoose.model('Application', ApplicationSchema);