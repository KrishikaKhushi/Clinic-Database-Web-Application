import React from 'react'
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  UserCheck, 
  FileText,
  AlertTriangle,
  Phone,
  Mail,
  Stethoscope,
  Activity,
  MapPin
} from 'lucide-react'
import './ModalStyles.css'

const AppointmentDetailsModal = ({ appointment, onClose }) => {
  if (!appointment) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return timeString || 'Not specified'
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return '#3742fa'
      case 'confirmed': return '#2ed573'
      case 'in-progress': return '#ffa502'
      case 'completed': return '#26de81'
      case 'cancelled': return '#ff4757'
      case 'no-show': return '#a4b0be'
      default: return '#747d8c'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return '#ff4757'
      case 'high': return '#ff6b6b'
      case 'medium': return '#ffa502'
      case 'low': return '#26de81'
      default: return '#74b9ff'
    }
  }

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'emergency': return '#ff4757'
      case 'consultation': return '#3742fa'
      case 'follow-up': return '#2ed573'
      case 'routine-checkup': return '#ffa502'
      default: return '#747d8c'
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content patient-details-modal">
        <div className="modal-header">
          <h3>
            <Calendar size={24} />
            Appointment Details
          </h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="patient-details-content">
          {/* Appointment Header */}
          <div className="patient-header">
            <div className="patient-id-badge">
              <FileText size={16} />
              {appointment.appointmentId}
            </div>
            <div 
              className="status-badge"
              style={{ 
                backgroundColor: getStatusColor(appointment.status),
                color: 'white'
              }}
            >
              {appointment.status?.replace('-', ' ')}
            </div>
          </div>

          {/* Patient Information */}
          <div className="details-section">
            <h4><User size={18} /> Patient Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Patient Name</label>
                <span>
                  {appointment.patient?.personalInfo?.firstName} {appointment.patient?.personalInfo?.lastName}
                </span>
              </div>
              
              <div className="detail-item">
                <label>Patient ID</label>
                <span className="patient-id">{appointment.patient?.patientId}</span>
              </div>
              
              {appointment.patient?.personalInfo?.phone && (
                <div className="detail-item">
                  <label><Phone size={14} /> Phone</label>
                  <span>{appointment.patient.personalInfo.phone}</span>
                </div>
              )}
              
              {appointment.patient?.personalInfo?.email && (
                <div className="detail-item">
                  <label><Mail size={14} /> Email</label>
                  <span>{appointment.patient.personalInfo.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Information */}
          <div className="details-section">
            <h4><UserCheck size={18} /> Doctor Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Doctor Name</label>
                <span>
                  Dr. {appointment.doctor?.personalInfo?.firstName} {appointment.doctor?.personalInfo?.lastName}
                </span>
              </div>
              
              <div className="detail-item">
                <label>Doctor ID</label>
                <span className="patient-id">{appointment.doctor?.doctorId}</span>
              </div>
              
              <div className="detail-item">
                <label><Stethoscope size={14} /> Specialization</label>
                <span className="specialization-badge">
                  {appointment.doctor?.professionalInfo?.specialization}
                </span>
              </div>
              
              {appointment.doctor?.personalInfo?.phone && (
                <div className="detail-item">
                  <label><Phone size={14} /> Phone</label>
                  <span>{appointment.doctor.personalInfo.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Schedule */}
          <div className="details-section">
            <h4><Clock size={18} /> Schedule Details</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Date</label>
                <span style={{ fontWeight: '600' }}>
                  {formatDate(appointment.appointmentDate)}
                </span>
              </div>
              
              <div className="detail-item">
                <label>Time</label>
                <span style={{ fontWeight: '600' }}>
                  {formatTime(appointment.appointmentTime)}
                </span>
              </div>
              
              <div className="detail-item">
                <label>Duration</label>
                <span>{appointment.duration || 30} minutes</span>
              </div>
              
              <div className="detail-item">
                <label>Type</label>
                <span 
                  className="tag"
                  style={{
                    backgroundColor: `${getTypeColor(appointment.type)}20`,
                    color: getTypeColor(appointment.type)
                  }}
                >
                  {appointment.type?.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="details-section">
            <h4><Activity size={18} /> Appointment Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Priority</label>
                <span 
                  className="tag"
                  style={{
                    backgroundColor: `${getPriorityColor(appointment.priority)}20`,
                    color: getPriorityColor(appointment.priority),
                    fontWeight: '600'
                  }}
                >
                  {appointment.priority?.toUpperCase() || 'MEDIUM'}
                </span>
              </div>
              
              <div className="detail-item">
                <label>Current Status</label>
                <span 
                  className="tag"
                  style={{
                    backgroundColor: getStatusColor(appointment.status),
                    color: 'white',
                    fontWeight: '600'
                  }}
                >
                  {appointment.status?.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {appointment.symptoms && (
              <div className="detail-item full-width">
                <label>Symptoms / Reason for Visit</label>
                <div className="symptoms-block">
                  <p>{appointment.symptoms}</p>
                </div>
              </div>
            )}

            {appointment.notes && (
              <div className="detail-item full-width">
                <label>Additional Notes</label>
                <div className="notes-block">
                  <p>{appointment.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* System Information */}
          <div className="details-section">
            <h4><FileText size={18} /> System Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Created On</label>
                <span>{formatDate(appointment.createdAt)}</span>
              </div>
              
              <div className="detail-item">
                <label>Last Updated</label>
                <span>{formatDate(appointment.updatedAt)}</span>
              </div>
              
              {appointment.createdBy && (
                <div className="detail-item">
                  <label>Created By</label>
                  <span>{appointment.createdBy.name || 'System Admin'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentDetailsModal