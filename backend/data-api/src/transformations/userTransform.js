const { default: mongoose } = require('mongoose');

const UserRegistration = (companyId, payload) => ({
  fullname: payload.name.trim(),
  email: payload.email,
  companyId,
  password: payload.password || undefined,
});

module.exports = {
  UserRegistration,
};
