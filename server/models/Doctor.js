const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    unique: true
    // Removed required: true so it can be auto-generated
  },
  personalInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    dateOfBirth: Date
  },
  professionalInfo: {
    specialization: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    experience: { type: Number, required: true }, // years
    qualification: [String],
    department: String
  },
  schedule: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: String,
    endTime: String,
    isAvailable: { type: Boolean, default: true }
  }],
  consultationFee: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Generate doctor ID automatically
doctorSchema.pre('save', async function(next) {
  if (!this.doctorId) {
    const count = await mongoose.model('Doctor').countDocuments();
    this.doctorId = `DOC${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Export with duplicate check
module.exports = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);