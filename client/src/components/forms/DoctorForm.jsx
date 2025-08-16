import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { doctorsAPI } from '../../services/api'
import { X, UserCheck, Mail, Phone, Calendar, Stethoscope, Clock, DollarSign } from 'lucide-react'

const DoctorForm = ({ onClose, doctor = null }) => {
  const queryClient = useQueryClient()
  const isEditMode = !!doctor

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: doctor?.personalInfo?.firstName || '',
    lastName: doctor?.personalInfo?.lastName || '',
    phone: doctor?.personalInfo?.phone || '',
    email: doctor?.personalInfo?.email || '',
    dateOfBirth: doctor?.personalInfo?.dateOfBirth?.split('T')[0] || '',
    
    // Professional Info
    specialization: doctor?.professionalInfo?.specialization || '',
    licenseNumber: doctor?.professionalInfo?.licenseNumber || '',
    experience: doctor?.professionalInfo?.experience || '',
    qualification: doctor?.professionalInfo?.qualification?.join(', ') || '',
    department: doctor?.professionalInfo?.department || '',
    
    // Fee
    consultationFee: doctor?.consultationFee || '',
    
    // Schedule - simplified for now
    scheduleNotes: doctor?.schedule?.map(s => `${s.day}: ${s.startTime}-${s.endTime}`).join(', ') || ''
  })

  const [errors, setErrors] = useState({})

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (data) => {
      const doctorData = {
        personalInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          dateOfBirth: data.dateOfBirth
        },
        professionalInfo: {
          specialization: data.specialization,
          licenseNumber: data.licenseNumber,
          experience: parseInt(data.experience) || 0,
          qualification: data.qualification ? data.qualification.split(',').map(item => item.trim()) : [],
          department: data.department
        },
        consultationFee: parseFloat(data.consultationFee) || 0,
        // For now, we'll skip the complex schedule and just use a simple note
        schedule: []
      }

      if (isEditMode) {
        return doctorsAPI.update(doctor._id, doctorData)
      } else {
        return doctorsAPI.create(doctorData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['doctors'])
      alert(isEditMode ? 'Doctor updated successfully!' : 'Doctor created successfully!')
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
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required'
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required'
    if (!formData.experience || formData.experience < 0) newErrors.experience = 'Valid experience is required'
    if (!formData.consultationFee || formData.consultationFee < 0) newErrors.consultationFee = 'Valid consultation fee is required'
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
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

  return (
    <div className="modal-overlay">
      <div className="modal-content patient-form-modal">
        <div className="modal-header">
          <h3>
            <UserCheck size={24} />
            {isEditMode ? 'Edit Doctor' : 'Add New Doctor'}
          </h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="patient-form">
          {/* Personal Information */}
          <div className="form-section">
            <h4><UserCheck size={18} /> Personal Information</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1-555-0123"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@clinic.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="form-section">
            <h4><Stethoscope size={18} /> Professional Information</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="specialization">Specialization *</label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="Cardiology, Pediatrics, etc."
                  className={errors.specialization ? 'error' : ''}
                />
                {errors.specialization && <span className="error-text">{errors.specialization}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Internal Medicine"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="licenseNumber">License Number *</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="MD-12345"
                  className={errors.licenseNumber ? 'error' : ''}
                />
                {errors.licenseNumber && <span className="error-text">{errors.licenseNumber}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="experience">Experience (Years) *</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  placeholder="5"
                  className={errors.experience ? 'error' : ''}
                />
                {errors.experience && <span className="error-text">{errors.experience}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="qualification">Qualifications</label>
              <input
                type="text"
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="MBBS, MD (separate with commas)"
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="form-section">
            <h4><DollarSign size={18} /> Consultation Fee</h4>
            
            <div className="form-group">
              <label htmlFor="consultationFee">Consultation Fee ($) *</label>
              <input
                type="number"
                id="consultationFee"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="150.00"
                className={errors.consultationFee ? 'error' : ''}
              />
              {errors.consultationFee && <span className="error-text">{errors.consultationFee}</span>}
            </div>
          </div>

          {/* Schedule Information */}
          <div className="form-section">
            <h4><Clock size={18} /> Schedule Notes</h4>
            
            <div className="form-group">
              <label htmlFor="scheduleNotes">Schedule (Optional)</label>
              <input
                type="text"
                id="scheduleNotes"
                name="scheduleNotes"
                value={formData.scheduleNotes}
                onChange={handleChange}
                placeholder="Mon-Fri 9AM-5PM"
                disabled
              />
              <small style={{ color: '#666', fontSize: '0.8rem' }}>
                Detailed schedule management coming soon
              </small>
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
                ? (isEditMode ? 'Updating...' : 'Creating...') 
                : (isEditMode ? 'Update Doctor' : 'Create Doctor')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DoctorForm