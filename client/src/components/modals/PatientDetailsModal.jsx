import React from 'react'
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Heart, 
  Users2,
  FileText,
  Shield
} from 'lucide-react'
import './ModalStyles.css'

const PatientDetailsModal = ({ patient, onClose }) => {
  if (!patient) return null

  const calculateAge = (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content patient-details-modal">
        <div className="modal-header">
          <h3>
            <User size={24} />
            Patient Details
          </h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="patient-details-content">
          {/* Patient ID and Status */}
          <div className="patient-header">
            <div className="patient-id-badge">
              <FileText size={16} />
              {patient.patientId}
            </div>
            <div className={`status-badge ${patient.isActive ? 'active' : 'inactive'}`}>
              {patient.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Personal Information */}
          <div className="details-section">
            <h4><User size={18} /> Personal Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Full Name</label>
                <span>{patient.personalInfo.firstName} {patient.personalInfo.lastName}</span>
              </div>
              
              <div className="detail-item">
                <label>Age</label>
                <span>{calculateAge(patient.personalInfo.dateOfBirth)} years old</span>
              </div>
              
              <div className="detail-item">
                <label>Date of Birth</label>
                <span>{formatDate(patient.personalInfo.dateOfBirth)}</span>
              </div>
              
              <div className="detail-item">
                <label>Gender</label>
                <span className="capitalize">{patient.personalInfo.gender}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="details-section">
            <h4><Phone size={18} /> Contact Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label><Phone size={14} /> Phone</label>
                <span>{patient.personalInfo.phone}</span>
              </div>
              
              <div className="detail-item">
                <label><Mail size={14} /> Email</label>
                <span>{patient.personalInfo.email || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Address Information */}
          {patient.personalInfo.address && (
            <div className="details-section">
              <h4><MapPin size={18} /> Address</h4>
              <div className="address-block">
                <p>
                  {patient.personalInfo.address.street && `${patient.personalInfo.address.street}, `}
                  {patient.personalInfo.address.city && `${patient.personalInfo.address.city}, `}
                  {patient.personalInfo.address.state && `${patient.personalInfo.address.state} `}
                  {patient.personalInfo.address.zipCode && `${patient.personalInfo.address.zipCode}, `}
                  {patient.personalInfo.address.country}
                </p>
              </div>
            </div>
          )}

          {/* Medical Information */}
          <div className="details-section">
            <h4><Heart size={18} /> Medical Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Blood Type</label>
                <span className="blood-type-badge">
                  {patient.medicalInfo?.bloodType || 'Not specified'}
                </span>
              </div>
              
              <div className="detail-item full-width">
                <label>Allergies</label>
                <div className="tags-container">
                  {patient.medicalInfo?.allergies && patient.medicalInfo.allergies.length > 0 ? (
                    patient.medicalInfo.allergies.map((allergy, index) => (
                      <span key={index} className="tag allergy-tag">{allergy}</span>
                    ))
                  ) : (
                    <span className="no-data">No known allergies</span>
                  )}
                </div>
              </div>
              
              <div className="detail-item full-width">
                <label>Chronic Conditions</label>
                <div className="tags-container">
                  {patient.medicalInfo?.chronicConditions && patient.medicalInfo.chronicConditions.length > 0 ? (
                    patient.medicalInfo.chronicConditions.map((condition, index) => (
                      <span key={index} className="tag condition-tag">{condition}</span>
                    ))
                  ) : (
                    <span className="no-data">No chronic conditions</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {patient.medicalInfo?.emergencyContact && (
            <div className="details-section">
              <h4><Users2 size={18} /> Emergency Contact</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Name</label>
                  <span>{patient.medicalInfo.emergencyContact.name || 'Not provided'}</span>
                </div>
                
                <div className="detail-item">
                  <label>Relationship</label>
                  <span>{patient.medicalInfo.emergencyContact.relationship || 'Not specified'}</span>
                </div>
                
                <div className="detail-item">
                  <label>Phone</label>
                  <span>{patient.medicalInfo.emergencyContact.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Insurance Information */}
          {patient.insurance && (Object.values(patient.insurance).some(val => val)) && (
            <div className="details-section">
              <h4><Shield size={18} /> Insurance Information</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Provider</label>
                  <span>{patient.insurance.provider || 'Not provided'}</span>
                </div>
                
                <div className="detail-item">
                  <label>Policy Number</label>
                  <span>{patient.insurance.policyNumber || 'Not provided'}</span>
                </div>
                
                <div className="detail-item">
                  <label>Group Number</label>
                  <span>{patient.insurance.groupNumber || 'Not provided'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Registration Information */}
          <div className="details-section">
            <h4><Calendar size={18} /> Registration Details</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Registered On</label>
                <span>{formatDate(patient.createdAt)}</span>
              </div>
              
              <div className="detail-item">
                <label>Last Updated</label>
                <span>{formatDate(patient.updatedAt)}</span>
              </div>
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

export default PatientDetailsModal