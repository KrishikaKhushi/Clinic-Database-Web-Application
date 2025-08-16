const mongoose = require('mongoose');
const Patient = require('./models/Patient');
const User = require('./models/User');
require('dotenv').config();

const addTestPatients = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin user to use as registeredBy
    const adminUser = await User.findOne({ email: 'admin@clinic.com' });
    if (!adminUser) {
      console.log('Admin user not found. Please create admin user first.');
      return;
    }

    // Sample patients data
    const patientsData = [
      {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1985-06-15'),
          gender: 'male',
          phone: '+1-234-567-8901',
          email: 'john.doe@email.com',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          }
        },
        medicalInfo: {
          bloodType: 'O+',
          allergies: ['Penicillin'],
          chronicConditions: ['Hypertension'],
          emergencyContact: {
            name: 'Jane Doe',
            relationship: 'Spouse',
            phone: '+1-234-567-8902'
          }
        },
        registeredBy: adminUser._id
      },
      {
        personalInfo: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          dateOfBirth: new Date('1990-03-22'),
          gender: 'female',
          phone: '+1-234-567-8903',
          email: 'sarah.j@email.com',
          address: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          }
        },
        medicalInfo: {
          bloodType: 'A+',
          allergies: [],
          chronicConditions: [],
          emergencyContact: {
            name: 'Mike Johnson',
            relationship: 'Brother',
            phone: '+1-234-567-8904'
          }
        },
        registeredBy: adminUser._id
      },
      {
        personalInfo: {
          firstName: 'Mike',
          lastName: 'Wilson',
          dateOfBirth: new Date('1978-11-08'),
          gender: 'male',
          phone: '+1-234-567-8905',
          email: 'mike.w@email.com',
          address: {
            street: '789 Pine St',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          }
        },
        medicalInfo: {
          bloodType: 'B+',
          allergies: ['Shellfish'],
          chronicConditions: ['Diabetes Type 2'],
          emergencyContact: {
            name: 'Lisa Wilson',
            relationship: 'Wife',
            phone: '+1-234-567-8906'
          }
        },
        registeredBy: adminUser._id
      }
    ];

    // Add patients to database
    for (const patientData of patientsData) {
      const existingPatient = await Patient.findOne({ 
        'personalInfo.email': patientData.personalInfo.email 
      });
      
      if (!existingPatient) {
        const patient = new Patient(patientData);
        await patient.save();
        console.log(`Added patient: ${patientData.personalInfo.firstName} ${patientData.personalInfo.lastName}`);
      } else {
        console.log(`Patient already exists: ${patientData.personalInfo.firstName} ${patientData.personalInfo.lastName}`);
      }
    }

    console.log('Test patients added successfully!');

  } catch (error) {
    console.error('Error adding test patients:', error);
  } finally {
    mongoose.connection.close();
  }
};

addTestPatients();