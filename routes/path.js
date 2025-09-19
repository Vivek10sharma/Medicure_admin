const express = require('express');
const authController = require('../controllers/auth')

const routes = express();
routes.post('/login',authController.login);
routes.post('/updateAppointment',authController.updateAppointment);
routes.post('/addDoctor',authController.addDoctor);
routes.post('/editDoctor',authController.editDoctor);
routes.post('/editPatient',authController.editPatient);



  module.exports = routes;
  