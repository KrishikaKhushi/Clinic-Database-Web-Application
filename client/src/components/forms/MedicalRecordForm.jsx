import React, { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { recordsAPI, patientsAPI, doctorsAPI, appointmentsAPI } from '../../services/api'
import { 
  X, 
  FileText, 
  User, 
  UserCheck, 
  Calendar, 
  Activity,
  Pill,
  TestTube,
  Heart,
  Plus,
  Minus
} from 'lucide-react'

const MedicalRecordForm = ({ onClose, record = null }) => {
  const queryClient = useQueryClient()
  const isEditMode = !!record

  const [formData, setFormData] = useState({
    patient: record?.patient?._id || '',
    doctor: record?.doctor?._id || '',
    appointment: record?.appointment?._id || '',
    visitType: record?.visitType || 'consultation',
    chiefComplaint: record?.chiefComplaint || '',
    symptoms: record?.symptoms?.join(', ') || '',
    diagnosis: record?.diagnosis || '',
    treatment: record?.treatment || '',
    notes: record?.notes || '',
    followUpDate: record?.followUpDate?.split('T')[0] || '',
    
    // Vitals
    temperature: record?.vitals?.temperature || '',
    systolic: record?.vitals?.bloodPressure?.systolic || '',
    diastolic: record?.vitals?.bloodPressure?.diastolic || '',
    heartRate: record?.vitals?.heartRate || '',
    weight: record?.vitals?.weight || '',
    height: record?.vitals?.height || '',
    
    // Prescriptions (start with existing or one empty)
    prescriptions: record?.prescriptions?.length > 0 ? record.prescriptions : [
      { medication: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]
  })

  const [errors, setErrors] = useState({})

  // Fetch data for dropdowns
  const { data: patientsData } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => patientsAPI.getAll({ limit: 100 })
  })

  const { data: doctorsData } = useQuery({
    queryKey: ['doctors', 'all'],
    queryFn: () => doctorsAPI.getAll({ limit: 100 })
  })

  const { data: appointmentsData } = useQuery({
    queryKey: ['appointments', 'all'],
    queryFn: () => appointmentsAPI.getAll({ limit: 100 })
  })

  const patients = patientsData?.data?.patients || []
  const doctors = doctorsData?.data?.doctors || []
  const appointments = appointmentsData?.data?.appointments || []

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (data) => {
      const recordData = {
        patient: data.patient,
        doctor: data.doctor,
        appointment: data.appointment || undefined,
        visitType: data.visitType,
        chiefComplaint: data.chiefComplaint,
        symptoms: data.symptoms ? data.symptoms.split(',').map(s => s.trim()).filter(s => s) : [],
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        notes: data.notes,
        followUpDate: data.followUpDate || undefined,
        vitals: {
          temperature: parseFloat(data.temperature) || undefined,
          bloodPressure: {
            systolic: parseInt(data.systolic) || undefined,
            diastolic: parseInt(data.diastolic) || undefined
          },
          heartRate: parseInt(data.heartRate) || undefined,
          weight: parseFloat(data.weight) || undefined,
          height: parseFloat(data.height) || undefined
        },
        prescriptions: data.prescriptions.filter(p => p.medication.trim())
      }

      if (isEditMode) {
        return recordsAPI.update(record._id, recordData)
      } else {
        return recordsAPI.create(recordData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['records'])
      alert(isEditMode ? 'Medical record updated successfully!' : 'Medical record created successfully!')
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handlePrescriptionChange = (index, field, value) => {
    const newPrescriptions = [...formData.prescriptions]
    newPrescriptions[index] = { ...newPrescriptions[index], [field]: value }
    setFormData(prev => ({ ...prev, prescriptions: newPrescriptions }))
  }

  const addPrescription = () => {
    setFormData(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { medication: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }))
  }

  const removePrescription = (index) => {
    if (formData.prescriptions.length > 1) {
      setFormData(prev => ({
        ...prev,
        prescriptions: prev.prescriptions.filter((_, i) => i !== index)
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.patient) newErrors.patient = 'Patient is required'
    if (!formData.doctor) newErrors.doctor = 'Doctor is required'
    if (!formData.visitType) newErrors.visitType = 'Visit type is required'
    if (!formData.chiefComplaint.trim()) newErrors.chiefComplaint = 'Chief complaint is required'

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
      <div className="modal-content patient-form-modal" style={{ maxWidth: '1000px' }}>
        <div className="modal-header">
          <h3>
            <FileText size={24} />
            {isEditMode ? 'Edit Medical Record' : 'Create New Medical Record'}
          </h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="patient-form">
          {/* Patient, Doctor, and Appointment */}
          <div className="form-section">
            <h4><User size={18} /> Patient & Provider Information</h4>
            
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="appointment">Related Appointment (Optional)</label>
                <select
                  id="appointment"
                  name="appointment"
                  value={formData.appointment}
                  onChange={handleChange}
                >
                  <option value="">Select Appointment</option>
                  {appointments.map(appointment => (
                    <option key={appointment._id} value={appointment._id}>
                      {appointment.appointmentId} - {new Date(appointment.appointmentDate).toLocaleDateString()} 
                      ({appointment.patient?.personalInfo?.firstName} {appointment.patient?.personalInfo?.lastName})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="visitType">Visit Type *</label>
                <select
                  id="visitType"
                  name="visitType"
                  value={formData.visitType}
                  onChange={handleChange}
                  className={errors.visitType ? 'error' : ''}
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine-checkup">Routine Checkup</option>
                </select>
                {errors.visitType && <span className="error-text">{errors.visitType}</span>}
              </div>
            </div>
          </div>

          {/* Clinical Information */}
          <div className="form-section">
            <h4><Activity size={18} /> Clinical Information</h4>
            
            <div className="form-group">
              <label htmlFor="chiefComplaint">Chief Complaint *</label>
              <input
                type="text"
                id="chiefComplaint"
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleChange}
                placeholder="Main reason for the visit"
                className={errors.chiefComplaint ? 'error' : ''}
              />
              {errors.chiefComplaint && <span className="error-text">{errors.chiefComplaint}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="symptoms">Symptoms (comma-separated)</label>
              <input
                type="text"
                id="symptoms"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                placeholder="Fever, headache, cough"
              />
            </div>

            <div className="form-group">
              <label htmlFor="diagnosis">Diagnosis</label>
              <input
                type="text"
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Medical diagnosis"
              />
            </div>

            <div className="form-group">
              <label htmlFor="treatment">Treatment Plan</label>
              <textarea
                id="treatment"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                rows="3"
                placeholder="Treatment plan and recommendations"
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

          {/* Vital Signs */}
          <div className="form-section">
            <h4><Heart size={18} /> Vital Signs</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="temperature">Temperature (°F)</label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="98.6"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="heartRate">Heart Rate (bpm)</label>
                <input
                  type="number"
                  id="heartRate"
                  name="heartRate"
                  value={formData.heartRate}
                  onChange={handleChange}
                  placeholder="72"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="systolic">Blood Pressure - Systolic</label>
                <input
                  type="number"
                  id="systolic"
                  name="systolic"
                  value={formData.systolic}
                  onChange={handleChange}
                  placeholder="120"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="diastolic">Blood Pressure - Diastolic</label>
                <input
                  type="number"
                  id="diastolic"
                  name="diastolic"
                  value={formData.diastolic}
                  onChange={handleChange}
                  placeholder="80"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weight">Weight (lbs)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="150"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="height">Height (inches)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="68"
                />
              </div>
            </div>
          </div>

          {/* Prescriptions */}
          <div className="form-section">
            <h4>
              <Pill size={18} /> Prescriptions
              <button
                type="button"
                onClick={addPrescription}
                className="btn btn-secondary"
                style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
              >
                <Plus size={14} /> Add
              </button>
            </h4>
            
            {formData.prescriptions.map((prescription, index) => (
              <div key={index} className="prescription-item" style={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '6px', 
                padding: '15px', 
                marginBottom: '15px',
                backgroundColor: '#fafafa'
              }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Medication</label>
                    <input
                      type="text"
                      value={prescription.medication}
                      onChange={(e) => handlePrescriptionChange(index, 'medication', e.target.value)}
                      placeholder="Medication name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Dosage</label>
                    <input
                      type="text"
                      value={prescription.dosage}
                      onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                      placeholder="10mg"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Frequency</label>
                    <input
                      type="text"
                      value={prescription.frequency}
                      onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                      placeholder="Twice daily"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={prescription.duration}
                      onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                      placeholder="7 days"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Instructions</label>
                    <input
                      type="text"
                      value={prescription.instructions}
                      onChange={(e) => handlePrescriptionChange(index, 'instructions', e.target.value)}
                      placeholder="Take with food"
                    />
                  </div>
                  
                  {formData.prescriptions.length > 1 && (
                    <div className="form-group" style={{ display: 'flex', alignItems: 'end' }}>
                      <button
                        type="button"
                        onClick={() => removePrescription(index)}
                        className="btn btn-secondary"
                        style={{ padding: '8px', backgroundColor: '#ff4757', color: 'white' }}
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="form-section">
            <h4><Calendar size={18} /> Additional Information</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="followUpDate">Follow-up Date</label>
                <input
                  type="date"
                  id="followUpDate"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional notes or observations"
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
                ? (isEditMode ? 'Updating...' : 'Creating...') 
                : (isEditMode ? 'Update Record' : 'Create Record')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MedicalRecordForm