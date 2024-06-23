const User = require('./User/User');
const Organization = require('./Organization/Organization');
const Attendance = require('./Attendance/Attendance');
const Role = require('./Role/Role');
const AttendanceAuditLog = require('./AttendanceAuditLog/AttendanceAuditLog');
const Location = require('./Location/Location');
const Schedule = require('./Schedule/Schedule');
const Shift = require('./Shift/Shift');
const Compensation = require('./Compensation/Compensation');

const PayrollReport = require('./PayrollReport/PayrollReport');
const IndividualReport = require('./PayrollReport/IndividualReport');

const UserOrganizationLocation = require('./Relationship/UserOrganizationLocation');
const DetailProfile = require('./Relationship/DetailProfile');
const UserOrganization = require('./Relationship/UserOrganization');

const Model = {
  Organization,
  User,
  UserOrganization,
  UserOrganizationLocation,
  Attendance,
  Role,
  AttendanceAuditLog,
  Location,
  Schedule,
  Shift,
  DetailProfile,
  Compensation,
  PayrollReport,
  IndividualReport,
};

module.exports = Model;
