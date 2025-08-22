const express = require('express');
const Appointment = require('../models/Appointment');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes
// Move '/today/all' route BEFORE '/:id' route

// @route   GET /api/appointments/today/all
// @desc    Get today's appointments
// @access  Private
router.get('/today/all', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
    .populate('patient', 'patientId personalInfo')
    .populate('doctor', 'doctorId personalInfo professionalInfo')
    .sort({ appointmentTime: 1 });

    res.json({
      success: true,
      appointments,
      count: appointments.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', date = '', doctorId = '' } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    if (doctorId) {
      query.doctor = doctorId;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'patientId personalInfo')
      .populate('doctor', 'doctorId personalInfo professionalInfo')
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
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

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
// IMPORTANT: This parameterized route comes AFTER specific routes
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'patientId personalInfo medicalInfo')
      .populate('doctor', 'doctorId personalInfo professionalInfo')
      .populate('createdBy', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      createdBy: req.user._id
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    await appointment.populate([
      { path: 'patient', select: 'patientId personalInfo' },
      { path: 'doctor', select: 'doctorId personalInfo professionalInfo' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', select: 'patientId personalInfo' },
      { path: 'doctor', select: 'doctorId personalInfo professionalInfo' },
      { path: 'createdBy', select: 'name email' }
    ]);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;