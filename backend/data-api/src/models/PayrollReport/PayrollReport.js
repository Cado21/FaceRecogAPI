const mongoose = require('mongoose');
const Organization = require('../Organization/Organization');
const User = require('../User/User');
const IndividualReport = require('./IndividualReport');
const { PAYROLL_REPORT_STATUS } = require('../../utils/constants');

const PayrollReportSchema = new mongoose.Schema({
  // owned by which orgs
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Organization,
    required: true,
  },
  // created by which userId
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  from: {
    type: Date,
    required: true,
  },
  to: {
    type: Date,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(PAYROLL_REPORT_STATUS),
    default: PAYROLL_REPORT_STATUS.DRAFT,
  },
  individualReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: IndividualReport,
  }],
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const PayrollReport = mongoose.model('PayrollReport', PayrollReportSchema, 'payrollReport');

module.exports = PayrollReport;
