import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { 
  UserCheck, 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  Filter,
  Download,
  Stethoscope,
  Clock,
  Loader2
} from 'lucide-react'
import { doctorsAPI } from '../services/api'
import './Pages.css'
import '../components/forms/FormStyles.css'
import DoctorForm from '../components/forms/DoctorForm'
import DoctorDetailsModal from '../components/modals/DoctorDetailsModal'

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialization, setFilterSpecialization] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [viewingDoctor, setViewingDoctor] = useState(null)
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

  // Fetch doctors with React Query
  const { 
    data: doctorsData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['doctors', currentPage, searchTerm, filterSpecialization],
    queryFn: () => doctorsAPI.getAll({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      specialization: filterSpecialization === 'all' ? '' : filterSpecialization
    }),
    keepPreviousData: true
  })

  // Delete doctor mutation
  const deleteMutation = useMutation({
    mutationFn: doctorsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['doctors'])
      alert('Doctor deleted successfully!')
    },
    onError: (error) => {
      alert('Error deleting doctor: ' + (error.response?.data?.message || 'Unknown error'))
    }
  })

  const handleDeleteDoctor = (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      deleteMutation.mutate(doctorId)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading">
          <Loader2 size={24} className="animate-spin" />
          Loading doctors...
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="page-container">
        <div className="error">
          <h3>Error loading doctors</h3>
          <p>{error?.response?.data?.message || 'Something went wrong'}</p>
          <button 
            onClick={() => queryClient.invalidateQueries(['doctors'])}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const doctors = doctorsData?.data?.doctors || []
  const pagination = doctorsData?.data?.pagination || {}
  
  // Get unique specializations for filter
  const specializations = [...new Set(doctors.map(doctor => doctor.professionalInfo?.specialization).filter(Boolean))]

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <h1>
            <UserCheck size={28} />
            Doctors Management
          </h1>
          <p>Manage doctor profiles, schedules, and specializations</p>
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
            Add Doctor
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
              placeholder="Search doctors by name, ID, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <Filter size={18} />
            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="table-container">
          {doctors.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <UserCheck size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <h3>No doctors found</h3>
              <p>Start by adding your first doctor to the system.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
                style={{ marginTop: '16px' }}
              >
                <Plus size={18} />
                Add First Doctor
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>
                      <span className="patient-id">{doctor.doctorId}</span>
                    </td>
                    <td>
                      <div className="doctor-info">
                        <strong>
                          {doctor.personalInfo.firstName} {doctor.personalInfo.lastName}
                        </strong>
                        <div className="qualifications">
                          {doctor.professionalInfo?.qualification?.join(', ') || 'Not specified'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div>{doctor.personalInfo.email}</div>
                        <div className="phone">{doctor.personalInfo.phone}</div>
                      </div>
                    </td>
                    <td>
                      <div className="specialization">
                        <Stethoscope size={16} />
                        {doctor.professionalInfo?.specialization || 'Not specified'}
                      </div>
                    </td>
                    <td>{doctor.professionalInfo?.experience || 0} years</td>
                    <td>
                      <span className="fee">${doctor.consultationFee || 0}</span>
                    </td>
                    <td>
                      <div className="schedule">
                        <Clock size={14} />
                        {doctor.schedule?.length > 0 
                          ? `${doctor.schedule.length} day(s)` 
                          : 'Not set'
                        }
                      </div>
                    </td>
                    <td>
                      <span className={`status ${doctor.isActive ? 'active' : 'inactive'}`}>
                        {doctor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view" 
                          title="View Details"
                          onClick={() => setViewingDoctor(doctor)}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="action-btn edit" 
                          title="Edit Doctor"
                          onClick={() => {
                            setEditingDoctor(doctor)
                            setShowAddModal(true)
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="action-btn delete" 
                          title="Delete Doctor"
                          onClick={() => handleDeleteDoctor(doctor._id)}
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
            <span className="stat-label">Total Doctors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {doctors.filter(d => d.isActive).length}
            </span>
            <span className="stat-label">Active Doctors</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{specializations.length}</span>
            <span className="stat-label">Specializations</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              ${doctors.length > 0 ? Math.round(doctors.reduce((sum, d) => sum + (d.consultationFee || 0), 0) / doctors.length) : 0}
            </span>
            <span className="stat-label">Avg. Fee</span>
          </div>
        </div>
      </div>

      {/* Add/Edit Doctor Modal */}
      {showAddModal && (
        <DoctorForm 
          doctor={editingDoctor}
          onClose={() => {
            setShowAddModal(false)
            setEditingDoctor(null)
          }}
        />
      )}

      {/* View Doctor Details Modal */}
      {viewingDoctor && (
        <DoctorDetailsModal 
          doctor={viewingDoctor}
          onClose={() => setViewingDoctor(null)}
        />
      )}
    </div>
  )
}

export default Doctors