const ChildRouter = require('express').Router();
const CONTROLLER = require('../../controllers/userController');
const validate = require('../../middlewares/middlewareValidation');
const schema = require('../../joiSchema/userSchema');
const { authentication, authorizationByRole } = require('../../middlewares/middlewareAuth');
const { USER_ROLE } = require('../../utils/constants');

const userRoutes = () => {
  ChildRouter.get('/healthz', CONTROLLER.ping);
  ChildRouter.post('/login', validate.validate(schema.schemaLogin), CONTROLLER.login);
  ChildRouter.post('/register', validate.validate(schema.schemaRegister), CONTROLLER.register);
  ChildRouter.post('/change-password', validate.validate(schema.schemaChangePassword), CONTROLLER.changePassword);
  ChildRouter.use(authentication);
  return ChildRouter;
};

module.exports = userRoutes();
