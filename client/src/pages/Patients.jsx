import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  Filter,
  Download,
  Loader2
} from 'lucide-react'
import { patientsAPI } from '../services/api'
import './Pages.css'
import PatientForm from '../components/forms/PatientForm'
import '../components/forms/FormStyles.css'
import PatientDetailsModal from '../components/modals/PatientDetailsModal'
import '../components/modals/ModalStyles.css'

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingPatient, setEditingPatient] = useState(null)
  const [viewingPatient, setViewingPatient] = useState(null)
  
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

  // Fetch patients with React Query
  const { 
    data: patientsData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['patients', currentPage, searchTerm, filterStatus],
    queryFn: () => patientsAPI.getAll({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      status: filterStatus === 'all' ? '' : filterStatus
    }),
    keepPreviousData: true
  })

  // Delete patient mutation
  const deleteMutation = useMutation({
    mutationFn: patientsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['patients'])
      alert('Patient deleted successfully!')
    },
    onError: (error) => {
      alert('Error deleting patient: ' + (error.response?.data?.message || 'Unknown error'))
    }
  })

  const handleDeletePatient = (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      deleteMutation.mutate(patientId)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading">
          <Loader2 size={24} className="animate-spin" />
          Loading patients...
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="page-container">
        <div className="error">
          <h3>Error loading patients</h3>
          <p>{error?.response?.data?.message || 'Something went wrong'}</p>
          <button 
            onClick={() => queryClient.invalidateQueries(['patients'])}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const patients = patientsData?.data?.patients || []
  const pagination = patientsData?.data?.pagination || {}

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <h1>
            <Users size={28} />
            Patients Management
          </h1>
          <p>Manage patient information and medical records</p>
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
            Add Patient
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
              placeholder="Search patients by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <Filter size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Patients</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Patients Table */}
        <div className="table-container">
          {patients.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <h3>No patients found</h3>
              <p>Start by adding your first patient to the system.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
                style={{ marginTop: '16px' }}
              >
                <Plus size={18} />
                Add First Patient
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Blood Type</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => {
                  const age = new Date().getFullYear() - new Date(patient.personalInfo.dateOfBirth).getFullYear()
                  return (
                    <tr key={patient._id}>
                      <td>
                        <span className="patient-id">{patient.patientId}</span>
                      </td>
                      <td>
                        <div className="patient-info">
                          <strong>
                            {patient.personalInfo.firstName} {patient.personalInfo.lastName}
                          </strong>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div>{patient.personalInfo.email || 'No email'}</div>
                          <div className="phone">{patient.personalInfo.phone}</div>
                        </div>
                      </td>
                      <td>{age}</td>
                      <td>{patient.personalInfo.gender}</td>
                      <td>
                        <span className="blood-type">
                          {patient.medicalInfo?.bloodType || 'Not specified'}
                        </span>
                      </td>
                      <td>{new Date(patient.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status ${patient.isActive ? 'active' : 'inactive'}`}>
                          {patient.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view" 
                            title="View Details"
                            onClick={() => setViewingPatient(patient)}
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="action-btn edit" 
                            title="Edit Patient"
                            onClick={() => {
                              setEditingPatient(patient)
                              setShowAddModal(true)
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="action-btn delete" 
                            title="Delete Patient"
                            onClick={() => handleDeletePatient(patient._id)}
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
                  )
                })}
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
            <span className="stat-label">Total Patients</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {patients.filter(p => p.isActive).length}
            </span>
            <span className="stat-label">Active Patients</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{patients.length}</span>
            <span className="stat-label">Current Page</span>
          </div>
        </div>
      </div>

      {/* Add/Edit Patient Modal */}
        {showAddModal && (
          <PatientForm 
            patient={editingPatient}
            onClose={() => {
              setShowAddModal(false)
              setEditingPatient(null)
            }}
          />
        )}

      {/* View Patient Details Modal */}
      {viewingPatient && (
        <PatientDetailsModal 
          patient={viewingPatient}
          onClose={() => setViewingPatient(null)}
        />
      )}
    </div>
  )
}

export default Patients