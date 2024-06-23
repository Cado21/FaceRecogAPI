const express = require('express');

const UsersRoutes = require('./UsersRoutes');

const Routes = express.Router();

Routes.use('/users', UsersRoutes);

module.exports = Routes;
