const connection = require('../db');
const validator = require('validator');

exports.login = (req,res) =>{
    const { email,password  } = req.body;
    connection.query('SELECT * FROM `admin` WHERE email = ?',[email],async(error,result)=>{
        if(error){
             console.log(error);
           return res.status(500).send("Internal server error");

        }
        if(result.length == 0){
          return res.redirect('/?message='+ encodeURIComponent('Email does not Match.'));

        }
        const isMatch = (password === result[0].password);
        if(isMatch){
            req.session.admin = {
                email: email
            };
            
            res.cookie('loggedIn', true, { maxAge: 14400000, httpOnly: true });

            return res.redirect('/dashboard');
        }
        else{
           return res.redirect('/?message='+ encodeURIComponent('Password does not Match.'));

        }
    });
}
// exports.updateAppointment = (req,res) =>{
//     const {appointmentId,updateDate,updateTime} = req.body;
//     // console.log(appointmentId,updateDate , updateTime);
//     const updateQuery = `UPDATE appointment SET date = ?, time = ? WHERE appointment_id = ?`;
//     connection.query(updateQuery, [updateDate, updateTime, appointmentId], (error, results) => {
//         if (error) {
//           console.error('Error updating appointment:', error);
//           return;
//         }
//         res.redirect('/appointment?message='+ encodeURIComponent('Appointment Update Successfully'));
//       });
// }

exports.updateAppointment = (req, res) => {
    const { appointmentId, updateDate, updateTime } = req.body;

    // Convert updated time to a Date object for comparison
    const selectedDateTime = new Date(`${updateDate}T${updateTime}`);
    const halfHourEarlier = new Date(selectedDateTime.getTime() - (30 * 60 * 1000)); // Half an hour earlier
    const halfHourLater = new Date(selectedDateTime.getTime() + (30 * 60 * 1000)); // Half an hour later

    // Check if any appointment exists within half an hour before or after the updated time slot
    connection.query(
        'SELECT * FROM `appointment` WHERE date = ? AND time BETWEEN ? AND ? AND appointment_id != ?',
        [updateDate, halfHourEarlier.toTimeString().split(' ')[0], halfHourLater.toTimeString().split(' ')[0], appointmentId],
        (error, results) => {
            if (error) {
                console.error('Error checking for conflicting appointments:', error);
                return res.status(500).send("Internal Server Error");
            }
            // If the query returns results, it means a conflicting appointment exists
            if (results.length > 0) {
                // Handle case where conflicting appointment exists
                res.redirect('/appointment?message1=' + encodeURIComponent('Another appointment exists in this time. Please choose another time.'));
            } else {
                // If no conflicting appointment exists, proceed with updating
                const updateQuery = `UPDATE appointment SET date = ?, time = ? WHERE appointment_id = ?`;
                connection.query(updateQuery, [updateDate, updateTime, appointmentId], (error, results) => {
                    if (error) {
                        console.error('Error updating appointment:', error);
                        return res.status(500).send("Internal Server Error");
                    }
                    res.redirect('/appointment?message=' + encodeURIComponent('Appointment Update Successfully'));
                });
            }
        }
    );
};

exports.addDoctor = (req,res) =>{
    const {DoctorName,contact,address,specialization,fee,med_lis} = req.body;
    if (!validator.matches(DoctorName, /^([A-Za-z]{1,20})\s+([A-Za-z]{1,20})(\s+[A-Za-z]{1,20})?$/)) {
        return res.redirect('/doctor?message1='+ encodeURIComponent('Please provide a valid Name'));
    }    
    else if (!validator.matches(contact, /^(97|98)\d{8}$/)) {
        return res.redirect('/doctor?message1=' + encodeURIComponent('Phone number must contain 10 digits & start with 97 or 98'));
    }else{
        connection.query('SELECT * FROM `doctor` WHERE contact = ? OR medical_license = ?', [contact, med_lis], async (error, result) => {
            if (error) { 
                console.log(error);
                return res.status(500).send("Internal server error");
            }

            if (result.length > 0) {
                if (result[0].contact === contact) {
                    return res.redirect('/doctor?message1=' + encodeURIComponent('The Phone Number is already Register'));
                }
                if (result[0].medical_license === med_lis) {
                    return res.redirect('/doctor?message1='+ encodeURIComponent('This Medical License is already register'));
                }
            } else{
                connection.query('INSERT INTO doctor(doctor_name,contact,address,specialization,Fee,medical_license) VALUES(?,?,?,?,?,?)',[DoctorName,contact,address,specialization,fee,med_lis],(error)=>{
                    if(error){
                        console.log(error);
                    }
                    res.redirect('/doctor?message='+ encodeURIComponent('Doctor Added Successfully'))
                });
            }

        });
}
}

exports.editDoctor = (req, res) => {
    const { doctorId, DoctorName, contact, address, specialization,fee, med_lis } = req.body;

    if (!validator.matches(DoctorName, /^([A-Za-z]{1,20})\s+([A-Za-z]{1,20})(\s+[A-Za-z]{1,20})?$/)) {
        return res.redirect('/doctor?message1='+ encodeURIComponent('Please provide a valid Name'));
    }    
    else if (!validator.matches(contact, /^(97|98)\d{8}$/)) {
        return res.redirect('/doctor?message1=' + encodeURIComponent('Phone number must contain 10 digits & start with 97 or 98'));
    }else{
        const updateDoctor = 'UPDATE doctor SET doctor_name = ?, contact = ?, address = ?, specialization = ?, Fee=?, medical_license = ? WHERE doctor_id = ?';
        connection.query(updateDoctor, [DoctorName, contact, address, specialization, fee, med_lis, doctorId], (error) => {
            if (error) {
                console.log(error);
            }
            res.redirect('/doctor?message=' + encodeURIComponent('Doctor Updated Successfully'));
        });
    }
    
};

exports.editPatient = (req,res) =>{
    const { patientId, patientName, contact, username } = req.body;
    if (!validator.matches(patientName, /^([A-Za-z]{1,20})\s+([A-Za-z]{1,20})(\s+[A-Za-z]{1,20})?$/)) {
        return res.redirect('/patient?message1='+ encodeURIComponent('Please provide a valid Full name'));
    }    
    else if (!validator.matches(contact, /^(97|98)\d{8}$/)) {
        return res.redirect('/patient?message1=' + encodeURIComponent('Phone number must contain 10 digits & start with 97 or 98'));
    }else {
        const updatePatient = 'UPDATE patient SET full_name = ?, phone_number = ?, username = ? WHERE patient_id = ?';
        connection.query(updatePatient, [patientName, contact, username, patientId], (error) => {
            if (error) {
                console.log(error);
            }
            res.redirect('/patient?message=' + encodeURIComponent('Patient Updated Successfully'));
        });
    }
    
}