const mongoose = require('mongoose');
const Organization = require('../Organization/Organization');

const { generateUserIdByNameAndIndex } = require('../../utils/common');
const DetailProfile = require('./DetailProfile');
const {
  DEFAULT_COMPENSATION,
  DEFAULT_DETAIL_PROFILE_DATA,
} = require('../../utils/constants');

const Compensation = require('../Compensation/Compensation');
const Role = require('../Role/Role');

const UserOrganizationSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uniqueUserId: {
    type: 'string',
    unique: true,
    immutable: true,
  },
  detailProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DetailProfile,
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Role,
    required: true,
  },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' } });

async function userOrgIdPreSaveHook(next) {
  try {
    if (!this.uniqueUserId) {
      const organization = await Organization.findById(this.organizationId);
      if (!organization) {
        throw new Error('Organization not found.');
      }
      const userCountInOrg = await this.constructor.countDocuments({
        organizationId: this.organizationId,
      });
      const uniqueId = generateUserIdByNameAndIndex(organization.name, userCountInOrg);
      this.uniqueUserId = uniqueId;
    }

    if (!this.detailProfileId) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const userCompensation = new Compensation(DEFAULT_COMPENSATION);
        const savedCompensation = await userCompensation.save({ session });
        const detailProfile = new DetailProfile({
          ...DEFAULT_DETAIL_PROFILE_DATA,
          compensationId :savedCompensation._id,
        });
        await detailProfile.save({ session });
        this.detailProfileId = detailProfile._id;
        await session.commitTransaction();
        session.endSession();
        console.log(this.detailProfileId)
        next();
      } catch (error) {
        console.log(error)
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }
    next();
  } catch (error) {
    next(error); 
  }
}
UserOrganizationSchema.pre('save', userOrgIdPreSaveHook);

const UserOrganization = mongoose.model('UserOrganization', UserOrganizationSchema, 'userOrganization');
module.exports = UserOrganization;