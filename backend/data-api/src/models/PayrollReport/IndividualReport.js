const mongoose = require('mongoose');
const { COST_VARIABLE, EDITABLE_COST_VARIABLE } = require('../../utils/constants');
const payrollStruct = require('../../struct/payrollStruct');
const {
  getPayrollReport,
  statutoryBenefit,
  taxReportCalculation,
} = require('../../helpers/payrollCalculation');

const individualReportSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    immutable: true,
  },
  year: { type: Number, required: true, immutable: true },
  payrollReportId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  // Mutable Variable
  enabledCostCode: {
    type: [{
      type: String,
      enum: Object.keys(COST_VARIABLE),
    }],
    required: true,
    default: () => Object.keys(COST_VARIABLE),
  },
  overrideCost: [{
    code: {
      type: String,
      enum: EDITABLE_COST_VARIABLE,
      required: true,
    },
    employeeRate: {
      type: Number,
      default: 0,
    },
    employerRate: {
      type: Number,
      default: 0,
    },
  }],
  previousTax: {
    type: Number,
    default: 0,
    required: true,
  },
  previousGrossPayroll: {
    type: Number,
    default: 0,
    required: true,
  },
  userId: { type: String, required: true, immutable: true },
  uniqueUserId: { type: String, required: true, immutable: true },
  fullname: { type: String, required: true, immutable: true },
  role: { type: String, required: true, immutable: true },
  email: { type: String, required: true, immutable: true },
  // END OF TODO
  detailProfile: {
    maritalStatus: { type: String, required: true },
    numberOfDependents: { type: Number, required: true },
    hasNpwp: { type: Boolean, required: true },
    employmentStatus: { type: String, required: true },
    compensation: {
      component: { type: String, required: true },
      amount: { type: Number, required: true },
      percentAmount: { type: Number, required: true },
      unit: { type: String, required: true },
      overtimeRateMultiplier: { type: Number, required: true },
      supplementary: [{
        componentName: { type: String, required: true },
        amount: { type: Number, required: true },
        unit: { type: String, required: true },
      }],
      adhoc: [{
        componentName: { type: String, required: true },
        amount: { type: Number, required: true },
      }],
    },
  },
  attendanceDetail: {
    totalDuration: {
      days: { type: Number, required: true },
      hours: { type: Number, required: true },
      minutes: { type: Number, required: true },
      seconds: { type: Number, required: true },
    },
    totalSeconds: { type: Number, required: true },
    totalOvertimeSeconds: { type: Number, required: true },
    absentDay: { type: Number, required: true },
    attendanceDay: { type: Number, required: true },
  },
  // END OF MAKE IT IMMUTABLE

  // Auto Calculated Variable
  payroll: {
    baseCompensation: {
      type: Number,
      default: 0,
    },
    supplementaryCompensation: {
      type: Number,
      default: 0,
    },
    adHocCompensation: {
      type: Number,
      default: 0,
    },
    totalCompensation: {
      type: Number,
      default: 0,
    },
  },
  statutoryBenefitAndTax: {
    statutoryBenefit: {
      type: Number,
      default: 0,
    },
    grossPayroll: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    netPayroll: {
      type: Number,
      default: 0,
    },
  },
});

async function updateCalcultedDataHooks(next) {
  try {
    const payroll = getPayrollReport(
      this.attendanceDetail,
      this.detailProfile,
    );
    const statutoryBenefitReport = statutoryBenefit(
      this.month,
      payroll.totalCompensation,
      this.enabledCostCode,
    );
    const taxReportCalc = taxReportCalculation(
      {
        month: this.month,
        previousTax: this.previousTax,
        totalCompensation: payroll.totalCompensation,
      },
      this.detailProfile,
      statutoryBenefitReport,
    );
    const calculatedReport = payrollStruct.CalculatedReportData(
      payroll,
      statutoryBenefitReport,
      taxReportCalc,
    );
    Object.assign(this, calculatedReport);

    next();
  } catch (error) {
    next(error);
  }
}

individualReportSchema.pre('save', updateCalcultedDataHooks);
individualReportSchema.post('updateOne', updateCalcultedDataHooks);

const IndividualReport = mongoose.model('IndividualReport', individualReportSchema, 'individualReport');

module.exports = IndividualReport;
