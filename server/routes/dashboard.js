const express = require('express');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Get today's date boundaries
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    // Get yesterday's date boundaries for comparison
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));
    
    // Get last month's date for trend calculation
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Parallel database queries for better performance
    const [
      totalPatientsCount,
      lastMonthPatientsCount,
      activeDoctorsCount,
      totalDoctorsCount,
      todaysAppointmentsCount,
      yesterdaysAppointmentsCount,
      totalAppointmentsCount,
      totalRecordsCount,
      todaysRecordsCount
    ] = await Promise.all([
      // Total Patients
      Patient.countDocuments({ isActive: true }),
      
      // Last month patients for trend
      Patient.countDocuments({ 
        isActive: true,
        createdAt: { $lt: lastMonth }
      }),
      
      // Active Doctors
      Doctor.countDocuments({ isActive: true }),
      
      // Total Doctors (for comparison)
      Doctor.countDocuments({}),
      
      // Today's Appointments
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfDay, $lte: endOfDay }
      }),
      
      // Yesterday's Appointments for comparison
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfYesterday, $lte: endOfYesterday }
      }),
      
      // Total Appointments
      Appointment.countDocuments({}),
      
      // Total Medical Records
      MedicalRecord.countDocuments({}),
      
      // Today's Records
      MedicalRecord.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      })
    ]);

    // Calculate trends
    const patientsTrend = lastMonthPatientsCount > 0 
      ? Math.round(((totalPatientsCount - lastMonthPatientsCount) / lastMonthPatientsCount) * 100)
      : 100;
    
    const appointmentsTrend = yesterdaysAppointmentsCount > 0
      ? Math.round(((todaysAppointmentsCount - yesterdaysAppointmentsCount) / yesterdaysAppointmentsCount) * 100)
      : todaysAppointmentsCount > 0 ? 100 : 0;

    res.json({
      success: true,
      stats: {
        totalPatients: {
          value: totalPatientsCount,
          trend: patientsTrend >= 0 ? `+${patientsTrend}%` : `${patientsTrend}%`
        },
        activeDoctors: {
          value: activeDoctorsCount,
          trend: totalDoctorsCount > 0 ? `${Math.round((activeDoctorsCount / totalDoctorsCount) * 100)}% active` : '+0%'
        },
        todaysAppointments: {
          value: todaysAppointmentsCount,
          trend: appointmentsTrend >= 0 ? `+${appointmentsTrend}%` : `${appointmentsTrend}%`
        },
        medicalRecords: {
          value: totalRecordsCount,
          trend: todaysRecordsCount > 0 ? `+${todaysRecordsCount} today` : 'No records today'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/recent-activities
// @desc    Get recent activities for dashboard
// @access  Private
router.get('/recent-activities', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent appointments (last 24 hours)
    const recentAppointments = await Appointment.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    .populate('patient', 'personalInfo patientId')
    .populate('doctor', 'personalInfo')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get recent patients (last 24 hours)
    const recentPatients = await Patient.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    .populate('registeredBy', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get recent records (last 24 hours)
    const recentRecords = await MedicalRecord.find({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
    .populate('patient', 'personalInfo patientId')
    .populate('doctor', 'personalInfo')
    .sort({ createdAt: -1 })
    .limit(5);

    // Combine and format activities
    const activities = [];

    // Add appointment activities
    recentAppointments.forEach(appointment => {
      activities.push({
        id: `apt_${appointment._id}`,
        type: 'appointment',
        message: `New appointment scheduled with Dr. ${appointment.doctor?.personalInfo?.firstName} ${appointment.doctor?.personalInfo?.lastName}`,
        time: getTimeAgo(appointment.createdAt),
        priority: appointment.priority === 'urgent' ? 'high' : 'normal',
        createdAt: appointment.createdAt
      });
    });

    // Add patient activities
    recentPatients.forEach(patient => {
      activities.push({
        id: `pat_${patient._id}`,
        type: 'patient',
        message: `New patient ${patient.personalInfo?.firstName} ${patient.personalInfo?.lastName} registered`,
        time: getTimeAgo(patient.createdAt),
        priority: 'normal',
        createdAt: patient.createdAt
      });
    });

    // Add record activities
    recentRecords.forEach(record => {
      activities.push({
        id: `rec_${record._id}`,
        type: 'record',
        message: `Medical record updated for ${record.patient?.personalInfo?.firstName} ${record.patient?.personalInfo?.lastName}`,
        time: getTimeAgo(record.createdAt),
        priority: 'normal',
        createdAt: record.createdAt
      });
    });

    // Sort by creation time and limit
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const limitedActivities = activities.slice(0, limit);

    res.json({
      success: true,
      activities: limitedActivities
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/todays-appointments
// @desc    Get today's appointments for dashboard
// @access  Private
router.get('/todays-appointments', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    })
    .populate('patient', 'personalInfo patientId')
    .populate('doctor', 'personalInfo professionalInfo')
    .sort({ appointmentTime: 1 })
    .limit(10);

    const formattedAppointments = appointments.map(appointment => ({
      id: appointment._id,
      patient: `${appointment.patient?.personalInfo?.firstName} ${appointment.patient?.personalInfo?.lastName}`,
      doctor: `Dr. ${appointment.doctor?.personalInfo?.firstName} ${appointment.doctor?.personalInfo?.lastName}`,
      time: appointment.appointmentTime,
      type: appointment.type || 'Consultation',
      status: appointment.status || 'scheduled'
    }));

    res.json({
      success: true,
      appointments: formattedAppointments,
      count: appointments.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/summary
// @desc    Get summary metrics for dashboard
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get various counts and metrics
    const [
      completedAppointments,
      totalTodaysAppointments,
      urgentAppointments,
      pendingFollowUps,
      todaysRevenue
    ] = await Promise.all([
      // Completed appointments today
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: 'completed'
      }),
      
      // Total appointments today
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfDay, $lte: endOfDay }
      }),
      
      // Urgent appointments
      Appointment.countDocuments({
        priority: { $in: ['urgent', 'high'] },
        status: { $in: ['scheduled', 'confirmed'] }
      }),
      
      // Pending follow-ups
      MedicalRecord.countDocuments({
        followUpDate: { $gte: today },
        followUpCompleted: { $ne: true }
      }),
      
      // Today's potential revenue (completed appointments * average fee)
      Appointment.aggregate([
        {
          $match: {
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: 'completed'
          }
        },
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctor',
            foreignField: '_id',
            as: 'doctorInfo'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $ifNull: [{ $arrayElemAt: ['$doctorInfo.consultationFee', 0] }, 0] } }
          }
        }
      ])
    ]);

    const revenue = todaysRevenue.length > 0 ? todaysRevenue[0].totalRevenue : 0;

    res.json({
      success: true,
      summary: {
        appointmentsCompleted: `${completedAppointments} out of ${totalTodaysAppointments} appointments`,
        pendingTasks: `${urgentAppointments} urgent, ${pendingFollowUps} follow-ups`,
        todaysRevenue: `$${revenue} ${completedAppointments > 0 ? '(+' + Math.round((completedAppointments / totalTodaysAppointments) * 100) + '% completion)' : ''}`
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}

module.exports = router;