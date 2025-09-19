const express = require('express');
const connection = require('../db');


const routes = express();

routes.get('/', (req, res) => {
    res.render('login');
});
routes.get('/dashboard',(req,res)=>{
    if( req.session.admin){
        connection.query('SELECT COUNT(appointment_id) AS total_appointments FROM appointment', (error, results) => {
            if (error) {
               console.log(error);
            }
            const totalAppointments = results[0].total_appointments;
            connection.query('SELECT COUNT(doctor_id) AS total_doctors FROM doctor', (error, results) => {
                if (error) {
                   console.log(error);
                }
                const totaldoctors = results[0].total_doctors;
    
                
                connection.query('SELECT COUNT(patient_id) AS total_patients FROM patient', (error, results) => {
                    if (error) {
                       console.log(error);
                    }
                    const totalpatients = results[0].total_patients;
        
                    
                    res.render('admin/dashboard', { totalAppointments ,totaldoctors , totalpatients});
                });
            });

        });
    }else{
        res.redirect('/');
    }
})

routes.get('/doctor',(req,res)=>{
    if( req.session.admin){
        connection.query('SELECT * FROM doctor',(error,result)=>{
            if(error){
                console.log(error);
            }
            const doctor = result;
            res.render('admin/doctor',{doctor});
        });
   
    }else{
        res.redirect('/');
    }
})
routes.get('/patient',(req,res)=>{
    if( req.session.admin){
        connection.query('SELECT * FROM patient',(error,result)=>{
            if(error){
                console.log(error);
            }
            const patient = result;
            res.render('admin/patient',{patient});
        });
    }else{
        res.redirect('/');
    }
})
routes.get('/appointment', (req, res) => {
    if (req.session.admin) {
        connection.query('SELECT appointment.*, doctor_name AS doctor_name, full_name AS patient_name FROM appointment INNER JOIN doctor ON appointment.doctor_id = doctor.doctor_id INNER JOIN patient ON appointment.patient_id = patient.patient_id', (error, result) => {
            if (error) {
                console.log(error);
            }
            const appointments = result.map(appointment => {
                const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                return { ...appointment, formattedDate };
            });

            res.render('admin/appointment', { appointments });
        });
    } else {
        res.redirect('/');
    }
});


routes.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/');
    
});

routes.get('/deleteAppointment/:appointmentId',(req,res)=>{
    const appointment_id = req.params.appointmentId;
    // console.log(appointment_id);

    connection.query('DELETE FROM `appointment` WHERE appointment_id = ?',[appointment_id],(error)=>{
        if(error){
            console.log(error);
        }
        res.redirect('/appointment?message='+ encodeURIComponent('Appointment Deleted Successfully'));

    });
});

routes.get('/deleteDoctor/:doctorId', (req, res) => {
    const doctor_id = req.params.doctorId;
    
    connection.query('DELETE FROM appointment WHERE doctor_id = ?', [doctor_id], (error) => {
        if (error) {
            console.log(error);
        }
        
        connection.query('DELETE FROM doctor WHERE doctor_id = ?', [doctor_id], (error) => {
            if (error) {
                console.log(error);
            }
            
            res.redirect('/doctor?message=' + encodeURIComponent('Doctor Deleted Successfully'));
        });
    });
});
routes.get('/deletePatient/:patientId', (req, res) => {
    const patient_id = req.params.patientId;
    
    connection.query('DELETE FROM appointment WHERE patient_id = ?', [patient_id], (error) => {
        if (error) {
            console.log(error);
        }
        
        connection.query('DELETE FROM patient WHERE patient_id = ?', [patient_id], (error) => {
            if (error) {
                console.log(error);
            }
            
            res.redirect('/patient?message=' + encodeURIComponent('Patient Deleted Successfully'));
        });
    });
});
module.exports = routes;