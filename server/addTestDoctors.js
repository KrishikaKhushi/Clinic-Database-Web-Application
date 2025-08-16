const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const User = require('./models/User');
require('dotenv').config();

const addTestDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin user to use as addedBy
    const adminUser = await User.findOne({ email: 'admin@clinic.com' });
    if (!adminUser) {
      console.log('Admin user not found. Please create admin user first.');
      return;
    }

    // Sample doctors data
    const doctorsData = [
      {
        personalInfo: {
          firstName: 'John',
          lastName: 'Smith',
          phone: '+1-555-0101',
          email: 'john.smith@clinic.com',
          dateOfBirth: new Date('1975-03-15')
        },
        professionalInfo: {
          specialization: 'Cardiology',
          licenseNumber: 'MD-12345',
          experience: 15,
          qualification: ['MBBS', 'MD Cardiology'],
          department: 'Cardiology'
        },
        schedule: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true }
        ],
        consultationFee: 200,
        addedBy: adminUser._id
      },
      {
        personalInfo: {
          firstName: 'Sarah',
          lastName: 'Brown',
          phone: '+1-555-0102',
          email: 'sarah.brown@clinic.com',
          dateOfBirth: new Date('1980-07-22')
        },
        professionalInfo: {
          specialization: 'Pediatrics',
          licenseNumber: 'MD-23456',
          experience: 12,
          qualification: ['MBBS', 'MD Pediatrics'],
          department: 'Pediatrics'
        },
        schedule: [
          { day: 'Monday', startTime: '10:00', endTime: '18:00', isAvailable: true },
          { day: 'Tuesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
          { day: 'Wednesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
          { day: 'Thursday', startTime: '10:00', endTime: '18:00', isAvailable: true },
          { day: 'Saturday', startTime: '10:00', endTime: '18:00', isAvailable: true }
        ],
        consultationFee: 180,
        addedBy: adminUser._id
      },
      {
        personalInfo: {
          firstName: 'Michael',
          lastName: 'Johnson',
          phone: '+1-555-0103',
          email: 'michael.j@clinic.com',
          dateOfBirth: new Date('1970-11-08')
        },
        professionalInfo: {
          specialization: 'Orthopedics',
          licenseNumber: 'MD-34567',
          experience: 20,
          qualification: ['MBBS', 'MS Orthopedics'],
          department: 'Orthopedics'
        },
        schedule: [
          { day: 'Tuesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { day: 'Wednesday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { day: 'Thursday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { day: 'Friday', startTime: '08:00', endTime: '16:00', isAvailable: true },
          { day: 'Saturday', startTime: '08:00', endTime: '16:00', isAvailable: true }
        ],
        consultationFee: 250,
        addedBy: adminUser._id
      }
    ];

    // Add doctors to database
    for (const doctorData of doctorsData) {
      const existingDoctor = await Doctor.findOne({ 
        'personalInfo.email': doctorData.personalInfo.email 
      });
      
      if (!existingDoctor) {
        const doctor = new Doctor(doctorData);
        await doctor.save();
        console.log(`Added doctor: ${doctorData.personalInfo.firstName} ${doctorData.personalInfo.lastName}`);
      } else {
        console.log(`Doctor already exists: ${doctorData.personalInfo.firstName} ${doctorData.personalInfo.lastName}`);
      }
    }

    console.log('Test doctors added successfully!');

  } catch (error) {
    console.error('Error adding test doctors:', error);
  } finally {
    mongoose.connection.close();
  }
};

addTestDoctors();