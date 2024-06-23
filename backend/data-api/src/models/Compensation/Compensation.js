const mongoose = require('mongoose');
const {
  COMPENSATION_COMPONENT, COMPENSATION_UNIT, COMPENSATION_UNIT_BY_COMPONENT,
  DEFAULT_COMPENSATION,
  DEFAULT_SUPPLEMENTARY_DATA,
} = require('../../utils/constants');

const CompensationSchema = new mongoose.Schema({
  component: {
    type: String,
    enum: Object.values(COMPENSATION_COMPONENT),
    default: DEFAULT_COMPENSATION.component,
  },
  amount: {
    type: Number,
    default: DEFAULT_COMPENSATION.amount,
  },
  percentAmount: {
    type: Number,
    default: DEFAULT_COMPENSATION.percentAmount,
  },
  pieceAmount: {
    type: Number,
    default: DEFAULT_COMPENSATION.pieceAmount,
  },
  unit: {
    type: String,
    enum: Object.values(COMPENSATION_UNIT),
    validate: {
      validator: function validateUnit(unit) {
        const validUnits = COMPENSATION_UNIT_BY_COMPONENT[this.component];
        return validUnits.includes(unit);
      },
      message: (props) => `${props.value} is not a valid unit for the selected component`,
    },
    default: DEFAULT_COMPENSATION.unit,
  },
  overtimeRateMultiplier: {
    type: Number,
    default: DEFAULT_COMPENSATION.overtimeRateMultiplier,
  },
  supplementary: [{
    componentName: {
      type: String,
      default: DEFAULT_SUPPLEMENTARY_DATA.componentName,
    },
    amount: {
      type: Number,
      default: DEFAULT_SUPPLEMENTARY_DATA.amount,
    },
    unit: {
      type: String,
      default: DEFAULT_SUPPLEMENTARY_DATA.unit,
    },
  }],
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const Compensation = mongoose.model('Compensation', CompensationSchema, 'compensation');
module.exports = Compensation;
