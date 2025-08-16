const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const User = require('./models/User');
require('dotenv').config();

const addTestAppointments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@clinic.com' });
    if (!adminUser) {
      console.log('Admin user not found. Please create admin user first.');
      return;
    }

    // Get some patients and doctors
    const patients = await Patient.find({ isActive: true }).limit(3);
    const doctors = await Doctor.find({ isActive: true }).limit(3);

    if (patients.length === 0 || doctors.length === 0) {
      console.log('Need at least some patients and doctors. Please add them first.');
      return;
    }

    console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);

    // Sample appointments data
    const appointmentsData = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        appointmentDate: new Date('2024-08-15'),
        appointmentTime: '10:00 AM',
        duration: 30,
        type: 'consultation',
        status: 'scheduled',
        symptoms: 'Regular checkup',
        notes: 'Annual health checkup',
        priority: 'medium',
        createdBy: adminUser._id
      },
      {
        patient: patients[1]._id,
        doctor: doctors[1]._id,
        appointmentDate: new Date('2024-08-15'),
        appointmentTime: '11:30 AM',
        duration: 45,
        type: 'follow-up',
        status: 'confirmed',
        symptoms: 'Follow-up for previous treatment',
        notes: 'Check progress on medication',
        priority: 'low',
        createdBy: adminUser._id
      },
      {
        patient: patients[2]._id,
        doctor: doctors[2]._id,
        appointmentDate: new Date('2024-08-16'),
        appointmentTime: '2:00 PM',
        duration: 60,
        type: 'emergency',
        status: 'in-progress',
        symptoms: 'Severe back pain',
        notes: 'Emergency consultation required',
        priority: 'urgent',
        createdBy: adminUser._id
      },
      {
        patient: patients[0]._id,
        doctor: doctors[1]._id,
        appointmentDate: new Date('2024-08-14'),
        appointmentTime: '3:30 PM',
        duration: 30,
        type: 'routine-checkup',
        status: 'completed',
        symptoms: 'Skin rash examination',
        notes: 'Prescribed topical cream',
        priority: 'low',
        createdBy: adminUser._id
      },
      {
        patient: patients[1]._id,
        doctor: doctors[0]._id,
        appointmentDate: new Date('2024-08-17'),
        appointmentTime: '9:00 AM',
        duration: 30,
        type: 'consultation',
        status: 'cancelled',
        symptoms: 'Headache consultation',
        notes: 'Patient cancelled due to schedule conflict',
        priority: 'medium',
        createdBy: adminUser._id
      }
    ];

    // Add appointments to database
    for (const appointmentData of appointmentsData) {
      const existingAppointment = await Appointment.findOne({ 
        patient: appointmentData.patient,
        doctor: appointmentData.doctor,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime
      });
      
      if (!existingAppointment) {
        const appointment = new Appointment(appointmentData);
        await appointment.save();
        
        // Populate to get patient and doctor names for logging
        await appointment.populate([
          { path: 'patient', select: 'personalInfo' },
          { path: 'doctor', select: 'personalInfo' }
        ]);
        
        console.log(`Added appointment: ${appointment.patient.personalInfo.firstName} with Dr. ${appointment.doctor.personalInfo.lastName} on ${appointment.appointmentDate.toDateString()}`);
      } else {
        console.log(`Appointment already exists for this time slot`);
      }
    }

    console.log('Test appointments added successfully!');

  } catch (error) {
    console.error('Error adding test appointments:', error);
  } finally {
    mongoose.connection.close();
  }
};

addTestAppointments();