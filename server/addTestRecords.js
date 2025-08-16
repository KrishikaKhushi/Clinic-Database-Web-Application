const mongoose = require('mongoose');
const MedicalRecord = require('./models/MedicalRecord');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
require('dotenv').config();

const addTestRecords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get some patients, doctors, and appointments
    const patients = await Patient.find({ isActive: true }).limit(3);
    const doctors = await Doctor.find({ isActive: true }).limit(3);
    const appointments = await Appointment.find({}).limit(3);

    if (patients.length === 0 || doctors.length === 0) {
      console.log('Need at least some patients and doctors. Please add them first.');
      return;
    }

    console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);

    // Sample medical records data
    const recordsData = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        appointment: appointments[0]?._id,
        visitType: 'consultation',
        chiefComplaint: 'Chest pain and shortness of breath',
        symptoms: ['Chest pain', 'Shortness of breath', 'Fatigue'],
        diagnosis: 'Hypertension Stage 1',
        treatment: 'Prescribed ACE inhibitor, recommended dietary changes and regular exercise',
        prescriptions: [
          {
            medication: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take with food in the morning'
          },
          {
            medication: 'Aspirin',
            dosage: '81mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take with food to prevent stomach upset'
          }
        ],
        vitals: {
          temperature: 98.6,
          bloodPressure: {
            systolic: 145,
            diastolic: 92
          },
          heartRate: 78,
          weight: 180,
          height: 70
        },
        followUpDate: new Date('2024-09-15'),
        notes: 'Patient advised to monitor blood pressure daily and return in 4 weeks. Lifestyle modifications discussed.'
      },
      {
        patient: patients[1]._id,
        doctor: doctors[1]._id,
        appointment: appointments[1]?._id,
        visitType: 'follow-up',
        chiefComplaint: 'Follow-up for respiratory infection',
        symptoms: ['Improved cough', 'Less congestion'],
        diagnosis: 'Upper respiratory infection - resolving',
        treatment: 'Continue current medications, increase fluid intake',
        prescriptions: [
          {
            medication: 'Dextromethorphan',
            dosage: '15mg',
            frequency: 'Every 4 hours as needed',
            duration: '7 days',
            instructions: 'For cough suppression'
          }
        ],
        vitals: {
          temperature: 98.4,
          bloodPressure: {
            systolic: 120,
            diastolic: 78
          },
          heartRate: 72,
          weight: 125,
          height: 64
        },
        followUpDate: null,
        notes: 'Patient showing good improvement. No follow-up needed unless symptoms worsen.'
      },
      {
        patient: patients[2]._id,
        doctor: doctors[2]._id,
        appointment: appointments[2]?._id,
        visitType: 'emergency',
        chiefComplaint: 'Severe lower back pain after lifting',
        symptoms: ['Severe lower back pain', 'Muscle spasms', 'Limited mobility'],
        diagnosis: 'Acute lumbar strain with muscle spasms',
        treatment: 'Pain management, muscle relaxants, physical therapy referral',
        prescriptions: [
          {
            medication: 'Ibuprofen',
            dosage: '600mg',
            frequency: 'Every 6 hours',
            duration: '7 days',
            instructions: 'Take with food to prevent stomach irritation'
          },
          {
            medication: 'Cyclobenzaprine',
            dosage: '10mg',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: 'May cause drowsiness, avoid driving'
          }
        ],
        vitals: {
          temperature: 98.8,
          bloodPressure: {
            systolic: 135,
            diastolic: 85
          },
          heartRate: 80,
          weight: 195,
          height: 72
        },
        tests: [
          {
            testName: 'Lumbar X-ray',
            result: 'No fractures or disc displacement visible',
            date: new Date(),
            attachments: []
          }
        ],
        followUpDate: new Date('2024-08-22'),
        notes: 'Patient referred to physical therapy. Return if pain worsens or no improvement in 1 week.'
      }
    ];

    // Add records to database
    for (const recordData of recordsData) {
      const existingRecord = await MedicalRecord.findOne({ 
        patient: recordData.patient,
        doctor: recordData.doctor,
        diagnosis: recordData.diagnosis
      });
      
      if (!existingRecord) {
        const record = new MedicalRecord(recordData);
        await record.save();
        
        // Populate to get patient and doctor names for logging
        await record.populate([
          { path: 'patient', select: 'personalInfo' },
          { path: 'doctor', select: 'personalInfo' }
        ]);
        
        console.log(`Added medical record: ${record.patient.personalInfo.firstName} treated by Dr. ${record.doctor.personalInfo.lastName}`);
      } else {
        console.log(`Similar medical record already exists`);
      }
    }

    console.log('Test medical records added successfully!');

  } catch (error) {
    console.error('Error adding test medical records:', error);
  } finally {
    mongoose.connection.close();
  }
};

addTestRecords();