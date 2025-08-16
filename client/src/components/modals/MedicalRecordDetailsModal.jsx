import React from 'react'
import { 
  X, 
  FileText, 
  User, 
  UserCheck, 
  Calendar, 
  Activity,
  Heart,
  Pill,
  TestTube,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react'
import './ModalStyles.css'

const MedicalRecordDetailsModal = ({ record, onClose }) => {
  if (!record) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getVisitTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'emergency': return '#ff4757'
      case 'consultation': return '#3742fa'
      case 'follow-up': return '#2ed573'
      case 'routine-checkup': return '#ffa502'
      default: return '#747d8c'
    }
  }

  const formatVitals = (vitals) => {
    if (!vitals) return 'Not recorded'
    
    const parts = []
    if (vitals.temperature) parts.push(`Temp: ${vitals.temperature}°F`)
    if (vitals.bloodPressure?.systolic && vitals.bloodPressure?.diastolic) {
      parts.push(`BP: ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`)
    }
    if (vitals.heartRate) parts.push(`HR: ${vitals.heartRate} bpm`)
    if (vitals.weight) parts.push(`Weight: ${vitals.weight} lbs`)
    if (vitals.height) parts.push(`Height: ${vitals.height} in`)
    
    return parts.length > 0 ? parts.join(' | ') : 'Not recorded'
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content patient-details-modal" style={{ maxWidth: '1000px' }}>
        <div className="modal-header">
          <h3>
            <FileText size={24} />
            Medical Record Details
          </h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="patient-details-content">
          {/* Record Header */}
          <div className="patient-header">
            <div className="patient-id-badge">
              <FileText size={16} />
              {record.recordId}
            </div>
            <div 
              className="status-badge"
              style={{ 
                backgroundColor: getVisitTypeColor(record.visitType),
                color: 'white'
              }}
            >
              {record.visitType?.replace('-', ' ')}
            </div>
          </div>

          {/* Patient Information */}
          <div className="details-section">
            <h4><User size={18} /> Patient Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Patient Name</label>
                <span>
                  {record.patient?.personalInfo?.firstName} {record.patient?.personalInfo?.lastName}
                </span>
              </div>
              
              <div className="detail-item">
                <label>Patient ID</label>
                <span className="patient-id">{record.patient?.patientId}</span>
              </div>
              
              {record.patient?.personalInfo?.phone && (
                <div className="detail-item">
                  <label><Phone size={14} /> Phone</label>
                  <span>{record.patient.personalInfo.phone}</span>
                </div>
              )}
              
              {record.patient?.personalInfo?.email && (
                <div className="detail-item">
                  <label><Mail size={14} /> Email</label>
                  <span>{record.patient.personalInfo.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Information */}
          <div className="details-section">
            <h4><UserCheck size={18} /> Attending Physician</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Doctor Name</label>
                <span>
                  Dr. {record.doctor?.personalInfo?.firstName} {record.doctor?.personalInfo?.lastName}
                </span>
              </div>
              
              <div className="detail-item">
                <label>Doctor ID</label>
                <span className="patient-id">{record.doctor?.doctorId}</span>
              </div>
              
              <div className="detail-item">
                <label><Stethoscope size={14} /> Specialization</label>
                <span className="specialization-badge">
                  {record.doctor?.professionalInfo?.specialization}
                </span>
              </div>
              
              <div className="detail-item">
                <label>Experience</label>
                <span>{record.doctor?.professionalInfo?.experience || 0} years</span>
              </div>
            </div>
          </div>

          {/* Visit Information */}
          <div className="details-section">
            <h4><Calendar size={18} /> Visit Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Visit Date</label>
                <span style={{ fontWeight: '600' }}>
                  {formatDate(record.createdAt)}
                </span>
              </div>
              
              <div className="detail-item">
                <label>Visit Type</label>
                <span 
                  className="tag"
                  style={{
                    backgroundColor: `${getVisitTypeColor(record.visitType)}20`,
                    color: getVisitTypeColor(record.visitType)
                  }}
                >
                  {record.visitType?.replace('-', ' ')}
                </span>
              </div>
              
              {record.appointment && (
                <div className="detail-item">
                  <label>Related Appointment</label>
                  <span className="patient-id">{record.appointment.appointmentId}</span>
                </div>
              )}
              
              {record.followUpDate && (
                <div className="detail-item">
                  <label>Follow-up Scheduled</label>
                  <span style={{ fontWeight: '600', color: '#667eea' }}>
                    {formatDate(record.followUpDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Information */}
          <div className="details-section">
            <h4><Activity size={18} /> Clinical Assessment</h4>
            
            {record.chiefComplaint && (
              <div className="detail-item full-width">
                <label>Chief Complaint</label>
                <div className="symptoms-block">
                  <p>{record.chiefComplaint}</p>
                </div>
              </div>
            )}

            {record.symptoms && record.symptoms.length > 0 && (
              <div className="detail-item full-width">
                <label>Symptoms</label>
                <div className="tags-container">
                  {record.symptoms.map((symptom, index) => (
                    <span key={index} className="tag" style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}>
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {record.diagnosis && (
              <div className="detail-item full-width">
                <label>Diagnosis</label>
                <div className="symptoms-block" style={{ borderLeftColor: '#2ed573' }}>
                  <p style={{ fontWeight: '600', color: '#2e7d2e' }}>{record.diagnosis}</p>
                </div>
              </div>
            )}

            {record.treatment && (
              <div className="detail-item full-width">
                <label>Treatment Plan</label>
                <div className="notes-block">
                  <p>{record.treatment}</p>
                </div>
              </div>
            )}
          </div>

          {/* Vital Signs */}
          {record.vitals && (
            <div className="details-section">
              <h4><Heart size={18} /> Vital Signs</h4>
              <div className="vitals-display" style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <div className="details-grid">
                  {record.vitals.temperature && (
                    <div className="detail-item">
                      <label>Temperature</label>
                      <span className="vital-value">{record.vitals.temperature}°F</span>
                    </div>
                  )}
                  
                  {record.vitals.bloodPressure?.systolic && record.vitals.bloodPressure?.diastolic && (
                    <div className="detail-item">
                      <label>Blood Pressure</label>
                      <span className="vital-value">
                        {record.vitals.bloodPressure.systolic}/{record.vitals.bloodPressure.diastolic} mmHg
                      </span>
                    </div>
                  )}
                  
                  {record.vitals.heartRate && (
                    <div className="detail-item">
                      <label>Heart Rate</label>
                      <span className="vital-value">{record.vitals.heartRate} bpm</span>
                    </div>
                  )}
                  
                  {record.vitals.weight && (
                    <div className="detail-item">
                      <label>Weight</label>
                      <span className="vital-value">{record.vitals.weight} lbs</span>
                    </div>
                  )}
                  
                  {record.vitals.height && (
                    <div className="detail-item">
                      <label>Height</label>
                      <span className="vital-value">{record.vitals.height} inches</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Prescriptions */}
          {record.prescriptions && record.prescriptions.length > 0 && (
            <div className="details-section">
              <h4><Pill size={18} /> Prescriptions ({record.prescriptions.length})</h4>
              <div className="prescriptions-list">
                {record.prescriptions.map((prescription, index) => (
                  <div key={index} className="prescription-item" style={{
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '10px'
                  }}>
                    <div className="prescription-header" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <h5 style={{ 
                        margin: 0, 
                        color: '#667eea', 
                        fontSize: '1rem',
                        fontWeight: '600'
                      }}>
                        {prescription.medication}
                      </h5>
                      <span style={{
                        background: '#e3f2fd',
                        color: '#1565c0',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {prescription.dosage}
                      </span>
                    </div>
                    
                    <div className="prescription-details" style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      fontSize: '0.9rem'
                    }}>
                      <div>
                        <strong>Frequency:</strong> {prescription.frequency}
                      </div>
                      <div>
                        <strong>Duration:</strong> {prescription.duration}
                      </div>
                    </div>
                    
                    {prescription.instructions && (
                      <div className="prescription-instructions" style={{
                        marginTop: '10px',
                        padding: '8px',
                        background: '#f8f9fa',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        color: '#666'
                      }}>
                        <strong>Instructions:</strong> {prescription.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tests */}
          {record.tests && record.tests.length > 0 && (
            <div className="details-section">
              <h4><TestTube size={18} /> Tests & Results</h4>
              <div className="tests-list">
                {record.tests.map((test, index) => (
                  <div key={index} className="test-item" style={{
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '10px'
                  }}>
                    <div className="test-header">
                      <h5 style={{ margin: '0 0 10px 0', color: '#667eea' }}>
                        {test.testName}
                      </h5>
                      {test.date && (
                        <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>
                          Date: {formatDate(test.date)}
                        </div>
                      )}
                    </div>
                    <div className="test-result" style={{
                      background: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '4px',
                      borderLeft: '4px solid #2ed573'
                    }}>
                      <strong>Result:</strong> {test.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {record.notes && (
            <div className="details-section">
              <h4><FileText size={18} /> Additional Notes</h4>
              <div className="notes-block">
                <p>{record.notes}</p>
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="details-section">
            <h4><Clock size={18} /> System Information</h4>
            <div className="details-grid">
              <div className="detail-item">
                <label>Record Created</label>
                <span>{formatDate(record.createdAt)}</span>
              </div>
              
              <div className="detail-item">
                <label>Last Updated</label>
                <span>{formatDate(record.updatedAt)}</span>
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

export default MedicalRecordDetailsModal