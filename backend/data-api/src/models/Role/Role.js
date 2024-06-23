const mongoose = require('mongoose');
const { USER_ROLE } = require('../../utils/constants');

const RoleSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: true,
    enum: Object.values(USER_ROLE),
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

const Role = mongoose.model('Role', RoleSchema, 'role');

module.exports = Role;
