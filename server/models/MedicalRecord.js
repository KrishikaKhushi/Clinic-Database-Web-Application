const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    unique: true
    // Removed required: true so it can be auto-generated
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  visitType: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'],
    required: true
  },
  chiefComplaint: String,
  symptoms: [String],
  diagnosis: String,
  treatment: String,
  prescriptions: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  vitals: {
    temperature: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    weight: Number,
    height: Number
  },
  tests: [{
    testName: String,
    result: String,
    date: Date,
    attachments: [String]
  }],
  followUpDate: Date,
  notes: String,
  attachments: [String]
}, {
  timestamps: true
});

// Generate record ID automatically
medicalRecordSchema.pre('save', async function(next) {
  if (!this.recordId) {
    const count = await mongoose.model('MedicalRecord').countDocuments();
    this.recordId = `REC${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Export with duplicate check
module.exports = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', medicalRecordSchema);