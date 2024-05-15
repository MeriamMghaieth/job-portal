const mongoose = require('mongoose');
const { Schema } = mongoose;

const JobSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
});

module.exports = mongoose.model('Job', JobSchema);