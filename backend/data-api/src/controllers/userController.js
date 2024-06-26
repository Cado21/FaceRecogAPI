const { StatusCodes, ReasonPhrases } = require('http-status-codes');
const mongoose = require('mongoose');
const jwt = require('../helpers/jwt');
const userStruct = require('../struct/userStruct');
const userService = require('../services/userService');
const { ResponseError } = require('../helpers/response');
const { hash, compare } = require('../helpers/bcryptjs');

exports.ping = async (req, res) => {
  res.status(StatusCodes.OK).send({
    message: ReasonPhrases.OK,
    env_setting: process.env.NODE_ENV,
    code: StatusCodes.OK,
  });
};

exports.login = async (req, res, next) => {
  try {
    const {
      token: googleToken, email, password,
    } = req.body;
    const isExistOrg = await userService.checkInvitationCodeExists(companyId);
    if (isExistOrg === null || isExistOrg.name === undefined) throw new ResponseError(StatusCodes.BAD_REQUEST, 'Company ID Not Exists!');

    let userData;
    if (!googleToken) {
      userData = await userService.findUserByCompanyAndRole(email, companyId, role);
    } else {
      const googlePayload = await jwt.decodeToken(googleToken);
      if (!googlePayload?.email) throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Invalid Token');
      userData = await userService.findUserByCompanyAndRole(googlePayload.email, companyId, role);
    }
    if (!userData?.userId) throw new ResponseError(StatusCodes.BAD_REQUEST, 'User is not Exist');

    if (!googleToken) {
      const hashedPassword = userData.userId.password;
      if (!hashedPassword) throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Invalid Email/Password');
      const isValidPassword = compare(password, hashedPassword);
      if (!isValidPassword) throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Invalid Email/Password');
    }
    const jwtToken = jwt.generateJwtToken({
      userId: userData.userId._id,
      organizationId: userData.organizationId._id,
    });

    const user = userStruct.UserData(
      userData.userId,
      userData.organizationId,
      userData.uniqueUserId,
    );
    const responseData = {
      ...user,
      token: jwtToken,
    };
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: responseData,
      code: StatusCodes.OK,
    });
  } catch (e) {
    next(e);
  }
};

exports.register = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      companyId, role, token, name, email, password,
    } = req.body;
    const organization = await userService.checkInvitationCodeExists(companyId, session);
    if (organization === null || organization.name === undefined) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Company ID Not Exists!');
    }
    let registeredUser = null;
    const roleData = await userService.getDataRole(role, session);
    if (!token) {
      registeredUser = await userService.getUserExists(email, companyId, session);
      if (registeredUser) {
        throw new ResponseError(StatusCodes.BAD_REQUEST, 'Account is already registered!');
      }
      const user = userStruct.UserRegistration(companyId, {
        name,
        email,
        password: hash(password),
      });
      user.roleId = roleData._id;
      const newUser = await userService.createOrUpdateExistingUser(user, session);
      await userService.insertUserOrganization(newUser, organization, session);
      registeredUser = await userService.findUserByCompanyAndRole(
        newUser.email,
        companyId,
        roleData.name,
        session,
      );
    } else {
      const googlePayload = await jwt.decodeToken(req.body.token);
      registeredUser = await userService.getUserExists(
        googlePayload.email,
        companyId,
        session,
      );
      if (registeredUser) {
        throw new ResponseError(StatusCodes.BAD_REQUEST, 'Account is already registered!');
      }
      const user = userStruct.UserRegistration(companyId, {
        name: googlePayload.name,
        email: googlePayload.email,
      });
      user.roleId = roleData._id;
      const existingOrNewUser = await userService.createOrUpdateExistingUser(user, session);
      await userService.insertUserOrganization(
        existingOrNewUser,
        organization,
        session,
      );
      registeredUser = await userService.findUserByCompanyAndRole(
        existingOrNewUser.email,
        companyId,
        roleData.name,
        session,
      );
    }
    const userOrgData = await userService.getDataUser(
      registeredUser.userId._id,
      registeredUser.organizationId._id,
      session,
    );
    const userRes = userStruct.UserRegistrationResponse(userOrgData);
    await session.commitTransaction();
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: userRes,
      code: StatusCodes.OK,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

exports.changePassword = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      email, role, password, newPassword,
    } = req.body;
    const userExist = await userService.findUserByEmail(
      {
        email,
        role,
      },
      session,
    );

    if (!userExist) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'User is not exist!');
    }
    let user = null;
    const isGoogleSSO = userExist?.password === undefined;
    if (isGoogleSSO) {
      user = await userService.changePasswordByUserId(
        userExist._id,
        hash(newPassword),
        session,
      );
    } else {
      const isValidPreviousPassword = compare(password, userExist.password);
      if (!isValidPreviousPassword) throw new ResponseError(StatusCodes.UNAUTHORIZED, 'Invalid Password');
      user = await userService.changePasswordByUserId(
        userExist._id,
        hash(newPassword),
        session,
      );
    }
    await session.commitTransaction();

    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: user,
      code: StatusCodes.OK,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

exports.registerCompany = async (req, res, next) => {
  try {
    const { companyName } = req.body;
    const isExistOrg = await userService.getOrganization(companyName);
    if (isExistOrg) {
      const existOrg = userStruct.Organization(isExistOrg);
      res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        data: existOrg,
        code: StatusCodes.OK,
      });
    } else {
      const newOrganization = await userService.insertOrganization(companyName);
      const organization = userStruct.Organization(newOrganization);
      res.status(StatusCodes.OK).json({
        message: ReasonPhrases.OK,
        data: organization,
        code: StatusCodes.OK,
      });
    }
  } catch (e) {
    next(e);
  }
};

exports.employeeList = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const allUsers = await userService.getAllUserOnOrganization(organizationId);
    const allEmployee = allUsers.filter((eachUser) => eachUser.userId.roleId.name === 'employee');
    const userList = allEmployee.map((userOrg) => userStruct.UserRegistrationResponse(userOrg));
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: userList,
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeEmployeesFromOrganization = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { employeeIds, organizationId } = req.body;
    const deletedUsers = await userService.removeEmployeesFromOrganization(
      employeeIds,
      organizationId,
      session,
    );
    await session.commitTransaction();
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: deletedUsers,
      code: StatusCodes.OK,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};

exports.employeeProfileByUserId = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const { userId } = req.params;
    const employeeProfile = await userService.employeeProfileById({ userId, organizationId });
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: userStruct.UserOrganizationWithProfiles(employeeProfile),
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};
exports.employeeProfiles = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const { list, pagination } = await userService.employeeProfileList(organizationId, req.query);
    const userProfiles = list.map(userStruct.UserOrganizationWithProfiles);
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: {
        list: userProfiles,
        pagination,
      },
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEmployeeProfileById = async (req, res, next) => {
  try {
    const { userId, ...updatePayload } = req.body;
    const { organizationId } = req.user;
    const updateUserProfile = await userService.updateUserProfileById(
      {
        userId,
        organizationId,
      },
      updatePayload,
    );
    res.status(StatusCodes.OK).json({
      message: ReasonPhrases.OK,
      data: userStruct.UserOrganizationWithProfiles(updateUserProfile),
      code: StatusCodes.OK,
    });
  } catch (error) {
    next(error);
  }
};
