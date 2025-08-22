import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { 
  Calendar, 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  Filter,
  Download,
  Clock,
  User,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { appointmentsAPI } from '../services/api'
import './Pages.css'
import '../components/forms/FormStyles.css'
import AppointmentForm from '../components/forms/AppointmentForm'
import AppointmentDetailsModal from '../components/modals/AppointmentDetailsModal'

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [viewingAppointment, setViewingAppointment] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  // Check if user came from dashboard with intent to add
  useEffect(() => {
    const fromDashboard = searchParams.get('action')
    if (fromDashboard === 'add') {
      setShowAddModal(true)
      // Clean up URL params
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  // Fetch appointments with React Query
  const { 
    data: appointmentsData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['appointments', currentPage, searchTerm, filterStatus, filterDate],
    queryFn: () => appointmentsAPI.getAll({
      page: currentPage,
      limit: 10,
      status: filterStatus === 'all' ? '' : filterStatus,
      date: filterDate
    }),
    keepPreviousData: true
  })

  // Delete/Cancel appointment mutation
  const deleteMutation = useMutation({
    mutationFn: appointmentsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments'])
      alert('Appointment cancelled successfully!')
    },
    onError: (error) => {
      alert('Error cancelling appointment: ' + (error.response?.data?.message || 'Unknown error'))
    }
  })

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      deleteMutation.mutate(appointmentId)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading">
          <Loader2 size={24} className="animate-spin" />
          Loading appointments...
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="page-container">
        <div className="error">
          <h3>Error loading appointments</h3>
          <p>{error?.response?.data?.message || 'Something went wrong'}</p>
          <button 
            onClick={() => queryClient.invalidateQueries(['appointments'])}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const appointments = appointmentsData?.data?.appointments || []
  const pagination = appointmentsData?.data?.pagination || {}

  const statuses = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient?.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patient?.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.appointmentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor?.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor?.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return '#ff4757'
      case 'high': return '#ff6b6b'
      case 'medium': return '#ffa502'
      case 'low': return '#26de81'
      default: return '#74b9ff'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return <Clock size={14} />
      case 'confirmed': return <Calendar size={14} />
      case 'in-progress': return <User size={14} />
      case 'urgent': return <AlertCircle size={14} />
      default: return <Calendar size={14} />
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <h1>
            <Calendar size={28} />
            Appointments Management
          </h1>
          <p>Schedule and manage patient appointments</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Download size={18} />
            Export
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={18} />
            Schedule Appointment
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by patient name, appointment ID, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="filter-group">
              <Filter size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <Calendar size={18} />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="filter-select"
                style={{ width: '150px' }}
              />
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="table-container">
          {filteredAppointments.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <h3>No appointments found</h3>
              <p>Start by scheduling your first appointment.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
                style={{ marginTop: '16px' }}
              >
                <Plus size={18} />
                Schedule First Appointment
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>
                      <span className="patient-id">{appointment.appointmentId}</span>
                    </td>
                    <td>
                      <div className="patient-info">
                        <strong>
                          {appointment.patient?.personalInfo?.firstName} {appointment.patient?.personalInfo?.lastName}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {appointment.patient?.patientId}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="doctor-info">
                        <strong>
                          Dr. {appointment.doctor?.personalInfo?.firstName} {appointment.doctor?.personalInfo?.lastName}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {appointment.doctor?.professionalInfo?.specialization}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="datetime-info">
                        <div style={{ fontWeight: '600' }}>
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          {appointment.appointmentTime}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="appointment-type">
                        {appointment.type?.replace('-', ' ')}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="priority-badge"
                        style={{ 
                          backgroundColor: `${getPriorityColor(appointment.priority)}20`,
                          color: getPriorityColor(appointment.priority),
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}
                      >
                        {appointment.priority || 'Medium'}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${appointment.status?.toLowerCase().replace('-', '')}`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status?.replace('-', ' ')}
                      </span>
                    </td>
                    <td>{appointment.duration || 30} min</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view" 
                          title="View Details"
                          onClick={() => setViewingAppointment(appointment)}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="action-btn edit" 
                          title="Edit Appointment"
                          onClick={() => {
                            setEditingAppointment(appointment)
                            setShowAddModal(true)
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="action-btn delete" 
                          title="Cancel Appointment"
                          onClick={() => handleCancelAppointment(appointment._id)}
                          disabled={deleteMutation.isLoading}
                        >
                          {deleteMutation.isLoading ? 
                            <Loader2 size={16} className="animate-spin" /> : 
                            <Trash2 size={16} />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {pagination.current} of {pagination.pages} ({pagination.total} total)
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
              disabled={currentPage === pagination.pages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        )}

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-number">{pagination.total || 0}</span>
            <span className="stat-label">Total Appointments</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {appointments.filter(a => {
                const today = new Date().toISOString().split('T')[0]
                return a.appointmentDate?.includes(today)
              }).length}
            </span>
            <span className="stat-label">Today's Appointments</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length}
            </span>
            <span className="stat-label">Upcoming</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {appointments.filter(a => a.priority === 'urgent' || a.priority === 'high').length}
            </span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </div>

      {/* Add/Edit Appointment Modal */}
      {showAddModal && (
        <AppointmentForm 
          appointment={editingAppointment}
          onClose={() => {
            setShowAddModal(false)
            setEditingAppointment(null)
          }}
        />
      )}

      {/* View Appointment Details Modal */}
      {viewingAppointment && (
        <AppointmentDetailsModal 
          appointment={viewingAppointment}
          onClose={() => setViewingAppointment(null)}
        />
      )}
    </div>
  )
}

export default Appointments