import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  Activity,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()

  const statsCards = [
    {
      title: 'Total Patients',
      value: '1,234',
      icon: Users,
      color: '#667eea',
      trend: '+12%'
    },
    {
      title: 'Active Doctors',
      value: '45',
      icon: UserCheck,
      color: '#f093fb',
      trend: '+3%'
    },
    {
      title: "Today's Appointments",
      value: '28',
      icon: Calendar,
      color: '#4facfe',
      trend: '+8%'
    },
    {
      title: 'Medical Records',
      value: '2,567',
      icon: FileText,
      color: '#43e97b',
      trend: '+15%'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'appointment',
      message: 'New appointment scheduled with Dr. Smith',
      time: '2 minutes ago',
      icon: Calendar
    },
    {
      id: 2,
      type: 'patient',
      message: 'New patient John Doe registered',
      time: '5 minutes ago',
      icon: Users
    },
    {
      id: 3,
      type: 'record',
      message: 'Medical record updated for Patient #PAT000123',
      time: '10 minutes ago',
      icon: FileText
    },
    {
      id: 4,
      type: 'urgent',
      message: 'Urgent: Emergency appointment requested',
      time: '15 minutes ago',
      icon: AlertCircle
    }
  ]

  const upcomingAppointments = [
    {
      id: 1,
      patient: 'Sarah Johnson',
      doctor: 'Dr. Smith',
      time: '10:00 AM',
      type: 'Consultation'
    },
    {
      id: 2,
      patient: 'Mike Wilson',
      doctor: 'Dr. Brown',
      time: '11:30 AM',
      type: 'Follow-up'
    },
    {
      id: 3,
      patient: 'Emma Davis',
      doctor: 'Dr. Johnson',
      time: '2:00 PM',
      type: 'Checkup'
    }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p>Here's what's happening at your clinic today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
                <div className="stat-trend">
                  <TrendingUp size={16} />
                  <span>{stat.trend} from last month</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="dashboard-grid">
        {/* Recent Activities */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Activities</h2>
            <Activity size={20} />
          </div>
          <div className="activities-list">
            {recentActivities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>
                    <Icon size={16} />
                  </div>
                  <div className="activity-content">
                    <p>{activity.message}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Today's Appointments</h2>
            <Clock size={20} />
          </div>
          <div className="appointments-list">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="appointment-item">
                <div className="appointment-time">
                  {appointment.time}
                </div>
                <div className="appointment-details">
                  <h4>{appointment.patient}</h4>
                  <p>{appointment.doctor}</p>
                  <span className="appointment-type">{appointment.type}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="view-all-btn">View All Appointments</button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card quick-actions">
        <div className="card-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="actions-grid">
          <button className="action-btn">
            <Users size={20} />
            Add New Patient
          </button>
          <button className="action-btn">
            <Calendar size={20} />
            Schedule Appointment
          </button>
          <button className="action-btn">
            <FileText size={20} />
            Create Medical Record
          </button>
          <button className="action-btn">
            <UserCheck size={20} />
            Add Doctor
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard