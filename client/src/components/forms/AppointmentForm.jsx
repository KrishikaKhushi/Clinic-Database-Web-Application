import React, { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { appointmentsAPI, patientsAPI, doctorsAPI } from '../../services/api'
import { X, Calendar, Clock, User, UserCheck, FileText, AlertTriangle } from 'lucide-react'

const AppointmentForm = ({ onClose, appointment = null }) => {
  const queryClient = useQueryClient()
  const isEditMode = !!appointment

  const [formData, setFormData] = useState({
    patient: appointment?.patient?._id || '',
    doctor: appointment?.doctor?._id || '',
    appointmentDate: appointment?.appointmentDate?.split('T')[0] || '',
    appointmentTime: appointment?.appointmentTime || '',
    duration: appointment?.duration || 30,
    type: appointment?.type || 'consultation',
    priority: appointment?.priority || 'medium',
    symptoms: appointment?.symptoms || '',
    notes: appointment?.notes || ''
  })

  const [errors, setErrors] = useState({})

  // Fetch patients and doctors for dropdowns
  const { data: patientsData } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => patientsAPI.getAll({ limit: 100 })
  })

  const { data: doctorsData } = useQuery({
    queryKey: ['doctors', 'all'],
    queryFn: () => doctorsAPI.getAll({ limit: 100 })
  })

  const patients = patientsData?.data?.patients || []
  const doctors = doctorsData?.data?.doctors || []

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (data) => {
      const appointmentData = {
        patient: data.patient,
        doctor: data.doctor,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        duration: parseInt(data.duration) || 30,
        type: data.type,
        priority: data.priority,
        symptoms: data.symptoms,
        notes: data.notes
      }

      if (isEditMode) {
        return appointmentsAPI.update(appointment._id, appointmentData)
      } else {
        return appointmentsAPI.create(appointmentData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments'])
      alert(isEditMode ? 'Appointment updated successfully!' : 'Appointment scheduled successfully!')
      onClose()
    },
    onError: (error) => {
      console.error('Error:', error)
      alert('Error: ' + (error.response?.data?.message || 'Something went wrong'))
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.patient) newErrors.patient = 'Patient is required'
    if (!formData.doctor) newErrors.doctor = 'Doctor is required'
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Appointment date is required'
    if (!formData.appointmentTime) newErrors.appointmentTime = 'Appointment time is required'
    if (!formData.duration || formData.duration < 15) newErrors.duration = 'Duration must be at least 15 minutes'

    // Check if appointment date is not in the past
    const selectedDate = new Date(formData.appointmentDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      newErrors.appointmentDate = 'Appointment date cannot be in the past'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      mutation.mutate(formData)
    }
  }

  // Get patient and doctor names for display
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p._id === patientId)
    return patient ? `${patient.personalInfo.firstName} ${patient.personalInfo.lastName} (${patient.patientId})` : ''
  }

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId)
    return doctor ? `Dr. ${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName} - ${doctor.professionalInfo.specialization}` : ''
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content patient-form-modal">
        <div className="modal-header">
          <h3>
            <Calendar size={24} />
            {isEditMode ? 'Edit Appointment' : 'Schedule New Appointment'}
          </h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="patient-form">
          {/* Patient and Doctor Selection */}
          <div className="form-section">
            <h4><User size={18} /> Patient & Doctor</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="patient">Patient *</label>
                <select
                  id="patient"
                  name="patient"
                  value={formData.patient}
                  onChange={handleChange}
                  className={errors.patient ? 'error' : ''}
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.personalInfo.firstName} {patient.personalInfo.lastName} ({patient.patientId})
                    </option>
                  ))}
                </select>
                {errors.patient && <span className="error-text">{errors.patient}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="doctor">Doctor *</label>
                <select
                  id="doctor"
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  className={errors.doctor ? 'error' : ''}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.personalInfo.firstName} {doctor.personalInfo.lastName} - {doctor.professionalInfo.specialization}
                    </option>
                  ))}
                </select>
                {errors.doctor && <span className="error-text">{errors.doctor}</span>}
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="form-section">
            <h4><Clock size={18} /> Schedule Details</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="appointmentDate">Appointment Date *</label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.appointmentDate ? 'error' : ''}
                />
                {errors.appointmentDate && <span className="error-text">{errors.appointmentDate}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="appointmentTime">Appointment Time *</label>
                <input
                  type="time"
                  id="appointmentTime"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className={errors.appointmentTime ? 'error' : ''}
                />
                {errors.appointmentTime && <span className="error-text">{errors.appointmentTime}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duration">Duration (minutes) *</label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className={errors.duration ? 'error' : ''}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
                {errors.duration && <span className="error-text">{errors.duration}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Appointment Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="routine-checkup">Routine Checkup</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="form-section">
            <h4><FileText size={18} /> Additional Information</h4>
            
            <div className="form-group">
              <label htmlFor="priority">Priority Level</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="symptoms">Symptoms / Reason for Visit</label>
              <textarea
                id="symptoms"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                rows="3"
                placeholder="Describe the patient's symptoms or reason for the appointment..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                placeholder="Any additional notes or special instructions..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={mutation.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading 
                ? (isEditMode ? 'Updating...' : 'Scheduling...') 
                : (isEditMode ? 'Update Appointment' : 'Schedule Appointment')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AppointmentForm