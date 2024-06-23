const mongoose = require('mongoose');
const { MARITAL_STATUS, EMPLOYMENT_STATUS, DEFAULT_DETAIL_PROFILE_DATA } = require('../../utils/constants');
const Compensation = require('../Compensation/Compensation');

const DetailProfileSchema = new mongoose.Schema({
  compensationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Compensation,
    required: true,
    immutable: true,
  },
  maritalStatus: {
    type: String,
    enum: Object.values(MARITAL_STATUS),
    default: DEFAULT_DETAIL_PROFILE_DATA.maritalStatus,
  },
  numberOfDependents: {
    type: Number,
    default: DEFAULT_DETAIL_PROFILE_DATA.numberOfDependents,
  },
  hasNpwp: {
    type: Boolean,
    default: DEFAULT_DETAIL_PROFILE_DATA.hasNpwp,
  },
  employmentStatus: {
    type: String,
    enum: Object.values(EMPLOYMENT_STATUS),
    default: DEFAULT_DETAIL_PROFILE_DATA.employmentStatus,
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const DetailProfile = mongoose.model('DetailProfile', DetailProfileSchema, 'detailProfile');
module.exports = DetailProfile;
