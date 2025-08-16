import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { patientsAPI } from '../../services/api'
import { X, User, Mail, Phone, Calendar, MapPin, Heart, Users2 } from 'lucide-react'

const PatientForm = ({ onClose, patient = null }) => {
  const queryClient = useQueryClient()
  const isEditMode = !!patient

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: patient?.personalInfo?.firstName || '',
    lastName: patient?.personalInfo?.lastName || '',
    dateOfBirth: patient?.personalInfo?.dateOfBirth?.split('T')[0] || '',
    gender: patient?.personalInfo?.gender || '',
    phone: patient?.personalInfo?.phone || '',
    email: patient?.personalInfo?.email || '',
    
    // Address
    street: patient?.personalInfo?.address?.street || '',
    city: patient?.personalInfo?.address?.city || '',
    state: patient?.personalInfo?.address?.state || '',
    zipCode: patient?.personalInfo?.address?.zipCode || '',
    country: patient?.personalInfo?.address?.country || 'India',
    
    // Medical Info
    bloodType: patient?.medicalInfo?.bloodType || '',
    allergies: patient?.medicalInfo?.allergies?.join(', ') || '',
    chronicConditions: patient?.medicalInfo?.chronicConditions?.join(', ') || '',
    
    // Emergency Contact
    emergencyName: patient?.medicalInfo?.emergencyContact?.name || '',
    emergencyRelationship: patient?.medicalInfo?.emergencyContact?.relationship || '',
    emergencyPhone: patient?.medicalInfo?.emergencyContact?.phone || ''
  })

  const [errors, setErrors] = useState({})

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (data) => {
      const patientData = {
        personalInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          phone: data.phone,
          email: data.email,
          address: {
            street: data.street,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country
          }
        },
        medicalInfo: {
          bloodType: data.bloodType,
          allergies: data.allergies ? data.allergies.split(',').map(item => item.trim()) : [],
          chronicConditions: data.chronicConditions ? data.chronicConditions.split(',').map(item => item.trim()) : [],
          emergencyContact: {
            name: data.emergencyName,
            relationship: data.emergencyRelationship,
            phone: data.emergencyPhone
          }
        }
      }

      if (isEditMode) {
        return patientsAPI.update(patient._id, patientData)
      } else {
        return patientsAPI.create(patientData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['patients'])
      alert(isEditMode ? 'Patient updated successfully!' : 'Patient created successfully!')
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
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    
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
            <User size={24} />
            {isEditMode ? 'Edit Patient' : 'Add New Patient'}
          </h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="patient-form">
          {/* Personal Information */}
          <div className="form-section">
            <h4><User size={18} /> Personal Information</h4>
            
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
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={errors.dateOfBirth ? 'error' : ''}
                />
                {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={errors.gender ? 'error' : ''}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
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
                  placeholder="+1-234-567-8901"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patient@email.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="form-section">
            <h4><MapPin size={18} /> Address Information</h4>
            
            <div className="form-group">
              <label htmlFor="street">Street Address</label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="123 Main Street"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="form-section">
            <h4><Heart size={18} /> Medical Information</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bloodType">Blood Type</label>
                <select
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="allergies">Allergies</label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="Penicillin, Shellfish (separate with commas)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="chronicConditions">Chronic Conditions</label>
              <input
                type="text"
                id="chronicConditions"
                name="chronicConditions"
                value={formData.chronicConditions}
                onChange={handleChange}
                placeholder="Diabetes, Hypertension (separate with commas)"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="form-section">
            <h4><Users2 size={18} /> Emergency Contact</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyName">Contact Name</label>
                <input
                  type="text"
                  id="emergencyName"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="emergencyRelationship">Relationship</label>
                <input
                  type="text"
                  id="emergencyRelationship"
                  name="emergencyRelationship"
                  value={formData.emergencyRelationship}
                  onChange={handleChange}
                  placeholder="Spouse, Parent, Sibling"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="emergencyPhone">Emergency Phone</label>
              <input
                type="tel"
                id="emergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                placeholder="+1-234-567-8901"
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
                ? (isEditMode ? 'Updating...' : 'Creating...') 
                : (isEditMode ? 'Update Patient' : 'Create Patient')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PatientForm