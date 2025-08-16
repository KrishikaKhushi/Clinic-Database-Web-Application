const express = require('express');
const MedicalRecord = require('../models/MedicalRecord');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/records
// @desc    Get all medical records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, patientId = '', doctorId = '' } = req.query;
    
    let query = {};
    
    if (patientId) {
      query.patient = patientId;
    }
    
    if (doctorId) {
      query.doctor = doctorId;
    }

    const records = await MedicalRecord.find(query)
      .populate('patient', 'patientId personalInfo')
      .populate('doctor', 'doctorId personalInfo professionalInfo')
      .populate('appointment', 'appointmentId appointmentDate')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await MedicalRecord.countDocuments(query);

    res.json({
      success: true,
      records,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/records/:id
// @desc    Get medical record by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'patientId personalInfo medicalInfo')
      .populate('doctor', 'doctorId personalInfo professionalInfo')
      .populate('appointment', 'appointmentId appointmentDate appointmentTime');
    
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/records
// @desc    Create new medical record
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const record = new MedicalRecord(req.body);
    await record.save();

    await record.populate([
      { path: 'patient', select: 'patientId personalInfo' },
      { path: 'doctor', select: 'doctorId personalInfo professionalInfo' },
      { path: 'appointment', select: 'appointmentId appointmentDate' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      record
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/records/:id
// @desc    Update medical record
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', select: 'patientId personalInfo' },
      { path: 'doctor', select: 'doctorId personalInfo professionalInfo' },
      { path: 'appointment', select: 'appointmentId appointmentDate' }
    ]);

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json({
      success: true,
      message: 'Medical record updated successfully',
      record
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/records/:id
// @desc    Delete medical record
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    res.json({
      success: true,
      message: 'Medical record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/records/patient/:patientId
// @desc    Get patient's medical history
// @access  Private
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate('doctor', 'doctorId personalInfo professionalInfo')
      .populate('appointment', 'appointmentId appointmentDate appointmentTime')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      records,
      count: records.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;