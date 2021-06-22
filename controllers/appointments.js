const Appointment = require('../models/apptmn');
const Slot=require('../models/slot');
console.log(handle);


const Nexmo = require("nexmo");
const appointmentController = {
  all(req, res) {
    
    Appointment.find({}).exec((err, appointments) => res.json(appointments));
  },
  create(req, res) {
    var requestBody = req.body;
    var newslot = new Slot({
      slot_time: requestBody.slot_time,
      slot_date: requestBody.slot_date,
      created_at: Date.now()
    });
    newslot.save();
    // Creates a new record from a submitted form
    var newappointment = new Appointment({
      name: requestBody.name,
      email: requestBody.email,
      phone: requestBody.phone,
      slots: newslot._id
    });
    const nexmo = new Nexmo({
      apiKey: "fb3bee68",
      apiSecret: "AD55FeNvf8eCPKDt"
    });
    let msg =
      requestBody.name +
      " " +
      "Veuillez confirmer votre rendez-vous à" +
      " " +
      requestBody.appointment;
    // and saves the record to
    // the data base
    newappointment.save((err, saved) => {
      // Returns the saved appointment
      // after a successful save
      Appointment.find({ _id: saved._id })
        .populate("slots")
        .exec((err, appointment) => res.json(appointment));
      const from = VIRTUAL_NUMBER;
      const to = RECIPIENT_NUMBER;
      nexmo.message.sendSms(from, to, msg, (err, responseData) => {
        if (err) {
          console.log(err);
        } else {
          console.dir(responseData);
        }
      });
    });
  }
};
module.exports = appointmentController;