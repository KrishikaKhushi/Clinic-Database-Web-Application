import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { dashboardAPI } from '../services/api'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Fetch dashboard statistics
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  })

  // Fetch recent activities
  const { 
    data: activitiesData, 
    isLoading: activitiesLoading,
    refetch: refetchActivities
  } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: () => dashboardAPI.getRecentActivities(5),
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    staleTime: 1 * 60 * 1000, // Consider data stale after 1 minute
  })

  // Fetch today's appointments
  const { 
    data: appointmentsData, 
    isLoading: appointmentsLoading,
    refetch: refetchAppointments
  } = useQuery({
    queryKey: ['dashboard-appointments'],
    queryFn: dashboardAPI.getTodaysAppointments,
    refetchInterval: 3 * 60 * 1000, // Refetch every 3 minutes
    staleTime: 1 * 60 * 1000,
  })

  // Fetch summary data
  const { 
    data: summaryData, 
    isLoading: summaryLoading,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardAPI.getSummary,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000,
  })

  // Manual refresh all data
  const handleRefreshAll = () => {
    refetchStats()
    refetchActivities()
    refetchAppointments()
    refetchSummary()
  }

  // Extract data safely
  const stats = statsData?.data?.stats || {}
  const activities = activitiesData?.data?.activities || []
  const appointments = appointmentsData?.data?.appointments || []
  const summary = summaryData?.data?.summary || {}

  // Create stats cards with real data
  const statsCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients?.value?.toString() || '0',
      icon: Users,
      color: '#667eea',
      trend: stats.totalPatients?.trend || '+0%',
      onClick: () => navigate('/patients'),
      loading: statsLoading
    },
    {
      title: 'Active Doctors',
      value: stats.activeDoctors?.value?.toString() || '0',
      icon: UserCheck,
      color: '#f093fb',
      trend: stats.activeDoctors?.trend || '+0%',
      onClick: () => navigate('/doctors'),
      loading: statsLoading
    },
    {
      title: "Today's Appointments",
      value: stats.todaysAppointments?.value?.toString() || '0',
      icon: Calendar,
      color: '#4facfe',
      trend: stats.todaysAppointments?.trend || '+0%',
      onClick: () => navigate('/appointments'),
      loading: statsLoading
    },
    {
      title: 'Medical Records',
      value: stats.medicalRecords?.value?.toString() || '0',
      icon: FileText,
      color: '#43e97b',
      trend: stats.medicalRecords?.trend || '+0%',
      onClick: () => navigate('/records'),
      loading: statsLoading
    }
  ]

  // Quick action handlers
  const handleQuickAction = (action) => {
    switch(action) {
      case 'add-patient':
        navigate('/patients?action=add')
        break
      case 'schedule-appointment':
        navigate('/appointments?action=add')
        break
      case 'create-record':
        navigate('/records?action=add')
        break
      case 'add-doctor':
        navigate('/doctors?action=add')
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'appointment': return Calendar
      case 'patient': return Users
      case 'record': return FileText
      default: return Activity
    }
  }

  // Loading state for initial load
  if (statsLoading && activitiesLoading && appointmentsLoading) {
    return (
      <div className="dashboard loading-dashboard">
        <div className="loading-content">
          <Loader2 size={48} className="animate-spin" />
          <h2>Loading Dashboard...</h2>
          <p>Fetching the latest clinic data</p>
        </div>
      </div>
    )
  }

  // Error state
  if (statsError) {
    return (
      <div className="dashboard error-dashboard">
        <div className="error-content">
          <AlertCircle size={48} color="#ff4757" />
          <h2>Error Loading Dashboard</h2>
          <p>{statsError?.response?.data?.message || 'Failed to load dashboard data'}</p>
          <button className="btn btn-primary" onClick={handleRefreshAll}>
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Enhanced Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>{getGreeting()}, {user?.name || 'Admin'}! 👋</h1>
            <p>Here's what's happening at your clinic today.</p>
          </div>
          <div className="header-info">
            <div className="current-time">
              <Clock size={16} />
              <span>{formatTime(currentTime)}</span>
            </div>
            <button className="refresh-btn" onClick={handleRefreshAll} title="Refresh Data">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards with Real Data */}
      <div className="stats-grid">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div 
              key={index} 
              className="stat-card clickable" 
              onClick={stat.onClick}
              role="button"
              tabIndex={0}
            >
              <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                {stat.loading ? <Loader2 size={24} className="animate-spin" /> : <Icon size={24} />}
              </div>
              <div className="stat-content">
                <h3>{stat.loading ? '...' : stat.value}</h3>
                <p>{stat.title}</p>
                <div className="stat-trend">
                  <TrendingUp size={16} />
                  <span>{stat.loading ? 'Loading...' : stat.trend}</span>
                </div>
              </div>
              <ArrowRight size={16} className="stat-arrow" />
            </div>
          )
        })}
      </div>

      <div className="dashboard-grid">
        {/* Real-time Recent Activities */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Activities</h2>
            <div className="header-actions">
              <Activity size={20} />
              {activitiesLoading && <Loader2 size={16} className="animate-spin" />}
            </div>
          </div>
          <div className="activities-list">
            {activitiesLoading ? (
              <div className="loading-placeholder">
                <Loader2 size={24} className="animate-spin" />
                <span>Loading activities...</span>
              </div>
            ) : activities.length === 0 ? (
              <div className="empty-state">
                <Activity size={32} style={{ opacity: 0.5 }} />
                <p>No recent activities</p>
              </div>
            ) : (
              activities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type} ${activity.priority}`}>
                      <IconComponent size={16} />
                    </div>
                    <div className="activity-content">
                      <p>{activity.message}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                    {activity.priority === 'high' && (
                      <div className="priority-indicator">!</div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Real-time Today's Appointments */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Today's Appointments</h2>
            <div className="header-actions">
              <Clock size={20} />
              {appointmentsLoading && <Loader2 size={16} className="animate-spin" />}
              <span className="appointment-count">{appointments.length}</span>
            </div>
          </div>
          <div className="appointments-list">
            {appointmentsLoading ? (
              <div className="loading-placeholder">
                <Loader2 size={24} className="animate-spin" />
                <span>Loading appointments...</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="empty-state">
                <Calendar size={32} style={{ opacity: 0.5 }} />
                <p>No appointments today</p>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleQuickAction('schedule-appointment')}
                >
                  Schedule First Appointment
                </button>
              </div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-item">
                  <div className="appointment-time">
                    {appointment.time}
                  </div>
                  <div className="appointment-details">
                    <h4>{appointment.patient}</h4>
                    <p>{appointment.doctor}</p>
                    <div className="appointment-meta">
                      <span className="appointment-type">{appointment.type}</span>
                      <span className={`appointment-status ${appointment.status}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            className="view-all-btn"
            onClick={() => navigate('/appointments')}
          >
            View All Appointments
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="dashboard-card quick-actions">
        <div className="card-header">
          <h2>Quick Actions</h2>
          <Plus size={20} />
        </div>
        <div className="actions-grid">
          <button 
            className="action-btn" 
            onClick={() => handleQuickAction('add-patient')}
          >
            <Users size={20} />
            Add New Patient
          </button>
          <button 
            className="action-btn"
            onClick={() => handleQuickAction('schedule-appointment')}
          >
            <Calendar size={20} />
            Schedule Appointment
          </button>
          <button 
            className="action-btn"
            onClick={() => handleQuickAction('create-record')}
          >
            <FileText size={20} />
            Create Medical Record
          </button>
          <button 
            className="action-btn"
            onClick={() => handleQuickAction('add-doctor')}
          >
            <UserCheck size={20} />
            Add Doctor
          </button>
        </div>
      </div>

      {/* Real-time Today's Summary */}
      <div className="dashboard-card summary-card">
        <div className="card-header">
          <h2>Today's Summary</h2>
          <div className="header-actions">
            <Activity size={20} />
            {summaryLoading && <Loader2 size={16} className="animate-spin" />}
          </div>
        </div>
        <div className="summary-content">
          {summaryLoading ? (
            <div className="loading-placeholder">
              <Loader2 size={24} className="animate-spin" />
              <span>Loading summary...</span>
            </div>
          ) : (
            <>
              <div className="summary-item">
                <div className="summary-icon completed">
                  <Calendar size={16} />
                </div>
                <div>
                  <h4>Appointments Status</h4>
                  <p>{summary.appointmentsCompleted || 'No data available'}</p>
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-icon pending">
                  <Clock size={16} />
                </div>
                <div>
                  <h4>Pending Tasks</h4>
                  <p>{summary.pendingTasks || 'No pending tasks'}</p>
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-icon revenue">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h4>Today's Revenue</h4>
                  <p>{summary.todaysRevenue || '$0'}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard