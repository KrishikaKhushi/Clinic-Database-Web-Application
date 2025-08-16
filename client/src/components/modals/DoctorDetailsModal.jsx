import React from 'react'
import { 
  X, 
  UserCheck, 
  Mail, 
  Phone, 
  Calendar, 
  Stethoscope,
  GraduationCap,
  DollarSign,
  Clock,
  MapPin,
  FileText
} from 'lucide-react'
import './ModalStyles.css'

const DoctorDetailsModal = ({ doctor, onClose }) => {
  if (!doctor) return null

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Not specified'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return `${age} years old`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return 'Not set'
    
    return schedule.map(s => 
      `${s.day}: ${s.startTime} - ${s.endTime} ${s.isAvailable ? '✓' : '✗'}`
    ).join(', ')
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content patient-details-modal">
        <div className="modal-header">
          <h3>
            <UserCheck size={24} />
            Doctor Details
          </h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="patient-details-content">
          {/* Doctor ID and Status */}
          <div className="patient-header">
            <div className="patient-id-badge">
              <FileText size={16} />
              {doctor.doctorId}
            </div>
            <div className={`status-badge ${doctor.isActive ? 'active' : 'inactive'}`}>
              {doctor.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Personal Information */}
          <div className="details-section">
            <h4><UserCheck size={18} /> Personal Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Full Name</label>
                <span>Dr. {doctor.personalInfo.firstName} {doctor.personalInfo.lastName}</span>
              </div>
              
              {doctor.personalInfo.dateOfBirth && (
                <div className="detail-item">
                  <label>Age</label>
                  <span>{calculateAge(doctor.personalInfo.dateOfBirth)}</span>
                </div>
              )}
              
              {doctor.personalInfo.dateOfBirth && (
                <div className="detail-item">
                  <label>Date of Birth</label>
                  <span>{formatDate(doctor.personalInfo.dateOfBirth)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="details-section">
            <h4><Phone size={18} /> Contact Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label><Phone size={14} /> Phone</label>
                <span>{doctor.personalInfo.phone}</span>
              </div>
              
              <div className="detail-item">
                <label><Mail size={14} /> Email</label>
                <span>{doctor.personalInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="details-section">
            <h4><Stethoscope size={18} /> Professional Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Specialization</label>
                <span className="specialization-badge">
                  {doctor.professionalInfo?.specialization || 'Not specified'}
                </span>
              </div>
              
              <div className="detail-item">
                <label>Department</label>
                <span>{doctor.professionalInfo?.department || 'Not specified'}</span>
              </div>
              
              <div className="detail-item">
                <label>License Number</label>
                <span>{doctor.professionalInfo?.licenseNumber || 'Not specified'}</span>
              </div>
              
              <div className="detail-item">
                <label>Experience</label>
                <span>{doctor.professionalInfo?.experience || 0} years</span>
              </div>
              
              <div className="detail-item full-width">
                <label><GraduationCap size={14} /> Qualifications</label>
                <div className="tags-container">
                  {doctor.professionalInfo?.qualification && doctor.professionalInfo.qualification.length > 0 ? (
                    doctor.professionalInfo.qualification.map((qual, index) => (
                      <span key={index} className="tag qualification-tag">{qual}</span>
                    ))
                  ) : (
                    <span className="no-data">No qualifications listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="details-section">
            <h4><DollarSign size={18} /> Consultation Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Consultation Fee</label>
                <span className="fee-badge">
                  ${doctor.consultationFee || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="details-section">
            <h4><Clock size={18} /> Schedule</h4>
            <div className="schedule-display">
              {doctor.schedule && doctor.schedule.length > 0 ? (
                <div className="schedule-grid">
                  {doctor.schedule.map((scheduleItem, index) => (
                    <div key={index} className="schedule-item">
                      <div className="schedule-day">{scheduleItem.day}</div>
                      <div className="schedule-time">
                        {scheduleItem.startTime} - {scheduleItem.endTime}
                      </div>
                      <div className={`schedule-status ${scheduleItem.isAvailable ? 'available' : 'unavailable'}`}>
                        {scheduleItem.isAvailable ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No schedule set</div>
              )}
            </div>
          </div>

          {/* Registration Information */}
          <div className="details-section">
            <h4><Calendar size={18} /> Registration Details</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Added On</label>
                <span>{formatDate(doctor.createdAt)}</span>
              </div>
              
              <div className="detail-item">
                <label>Last Updated</label>
                <span>{formatDate(doctor.updatedAt)}</span>
              </div>
              
              {doctor.addedBy && (
                <div className="detail-item">
                  <label>Added By</label>
                  <span>{doctor.addedBy.name || 'System Admin'}</span>
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

export default DoctorDetailsModal