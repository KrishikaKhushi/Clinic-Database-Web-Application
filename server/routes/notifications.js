const express = require('express');
const Notification = require('../models/Notification');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;
    
    let query = { userId: req.user._id };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/notifications/generate-sample
// @desc    Generate sample notifications (for testing)
// @access  Private
router.post('/generate-sample', auth, async (req, res) => {
  try {
    const sampleNotifications = [
      {
        userId: req.user._id,
        type: 'appointment',
        title: 'New Appointment Scheduled',
        message: 'A new appointment has been scheduled for tomorrow at 10:00 AM',
        priority: 'medium',
        actionUrl: '/appointments'
      },
      {
        userId: req.user._id,
        type: 'patient',
        title: 'New Patient Registration',
        message: 'Sarah Johnson has been registered as a new patient',
        priority: 'low',
        actionUrl: '/patients'
      },
      {
        userId: req.user._id,
        type: 'urgent',
        title: 'Emergency Appointment Request',
        message: 'Emergency appointment requested by John Doe - requires immediate attention',
        priority: 'high',
        actionUrl: '/appointments'
      },
      {
        userId: req.user._id,
        type: 'reminder',
        title: 'Daily Report Pending',
        message: 'Please review and submit today\'s clinical report',
        priority: 'medium',
        actionUrl: '/reports'
      },
      {
        userId: req.user._id,
        type: 'system',
        title: 'System Maintenance Scheduled',
        message: 'Routine system maintenance scheduled for tonight at 2:00 AM',
        priority: 'low',
        actionUrl: null
      }
    ];

    await Notification.insertMany(sampleNotifications);

    res.json({
      success: true,
      message: 'Sample notifications generated',
      count: sampleNotifications.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to create notifications (can be used by other routes)
const createNotification = async (userId, type, title, message, priority = 'medium', actionUrl = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      priority,
      actionUrl
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Auto-generate notifications based on recent activities
// @route   POST /api/notifications/generate-from-activities
// @desc    Generate notifications from recent activities
// @access  Private
router.post('/generate-from-activities', auth, async (req, res) => {
  try {
    const notifications = [];
    const userId = req.user._id;
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Check for recent appointments
    const recentAppointments = await Appointment.find({
      createdAt: { $gte: last24Hours }
    }).populate('patient', 'personalInfo');

    for (const appointment of recentAppointments) {
      const notification = await createNotification(
        userId,
        'appointment',
        'New Appointment Scheduled',
        `Appointment scheduled for ${appointment.patient?.personalInfo?.firstName} ${appointment.patient?.personalInfo?.lastName}`,
        'medium',
        '/appointments'
      );
      if (notification) notifications.push(notification);
    }

    // Check for recent patients
    const recentPatients = await Patient.find({
      createdAt: { $gte: last24Hours }
    });

    for (const patient of recentPatients) {
      const notification = await createNotification(
        userId,
        'patient',
        'New Patient Registered',
        `${patient.personalInfo?.firstName} ${patient.personalInfo?.lastName} has been registered`,
        'low',
        '/patients'
      );
      if (notification) notifications.push(notification);
    }

    // Check for urgent appointments
    const urgentAppointments = await Appointment.find({
      priority: { $in: ['urgent', 'high'] },
      status: { $in: ['scheduled', 'confirmed'] }
    }).populate('patient', 'personalInfo');

    for (const appointment of urgentAppointments.slice(0, 3)) { // Limit to 3
      const notification = await createNotification(
        userId,
        'urgent',
        'Urgent Appointment',
        `High priority appointment for ${appointment.patient?.personalInfo?.firstName} ${appointment.patient?.personalInfo?.lastName}`,
        'high',
        '/appointments'
      );
      if (notification) notifications.push(notification);
    }

    res.json({
      success: true,
      message: 'Notifications generated from recent activities',
      count: notifications.length,
      notifications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;