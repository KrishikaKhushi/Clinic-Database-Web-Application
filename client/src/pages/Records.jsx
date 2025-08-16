import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  FileText, 
  Search, 
  Plus, 
  Edit, 
  Eye, 
  Trash2,
  Filter,
  Download,
  User,
  Calendar,
  Stethoscope,
  Pill,
  Loader2
} from 'lucide-react'
import { recordsAPI } from '../services/api'
import './Pages.css'
import '../components/forms/FormStyles.css'
import MedicalRecordForm from '../components/forms/MedicalRecordForm'
import MedicalRecordDetailsModal from '../components/modals/MedicalRecordDetailsModal'

const Records = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [viewingRecord, setViewingRecord] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  const queryClient = useQueryClient()

  // Fetch medical records with React Query
  const { 
    data: recordsData, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['records', currentPage, searchTerm, filterType, filterDate],
    queryFn: () => recordsAPI.getAll({
      page: currentPage,
      limit: 10
    }),
    keepPreviousData: true
  })

  // Delete record mutation
  const deleteMutation = useMutation({
    mutationFn: recordsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['records'])
      alert('Medical record deleted successfully!')
    },
    onError: (error) => {
      alert('Error deleting record: ' + (error.response?.data?.message || 'Unknown error'))
    }
  })

  const handleDeleteRecord = (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      deleteMutation.mutate(recordId)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading">
          <Loader2 size={24} className="animate-spin" />
          Loading medical records...
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="page-container">
        <div className="error">
          <h3>Error loading medical records</h3>
          <p>{error?.response?.data?.message || 'Something went wrong'}</p>
          <button 
            onClick={() => queryClient.invalidateQueries(['records'])}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const records = recordsData?.data?.records || []
  const pagination = recordsData?.data?.pagination || {}

  const visitTypes = ['consultation', 'follow-up', 'emergency', 'routine-checkup']

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.patient?.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patient?.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.recordId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctor?.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctor?.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || record.visitType?.toLowerCase() === filterType.toLowerCase()
    const matchesDate = filterDate === '' || record.createdAt?.includes(filterDate)
    
    return matchesSearch && matchesType && matchesDate
  })

  const getVisitTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'emergency': return '#ff4757'
      case 'consultation': return '#3742fa'
      case 'follow-up': return '#2ed573'
      case 'routine-checkup': return '#ffa502'
      default: return '#747d8c'
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <h1>
            <FileText size={28} />
            Medical Records
          </h1>
          <p>Manage patient medical records and treatment history</p>
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
            Create Record
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
              placeholder="Search by patient name, record ID, diagnosis, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="filter-group">
              <Filter size={18} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Visit Types</option>
                {visitTypes.map(type => (
                  <option key={type} value={type}>{type.replace('-', ' ')}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <Calendar size={18} />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="filter-select"
                style={{ width: '150px' }}
              />
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="table-container">
          {filteredRecords.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <h3>No medical records found</h3>
              <p>Start by creating your first medical record.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
                style={{ marginTop: '16px' }}
              >
                <Plus size={18} />
                Create First Record
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Visit Date</th>
                  <th>Visit Type</th>
                  <th>Diagnosis</th>
                  <th>Prescriptions</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <span className="patient-id">{record.recordId}</span>
                    </td>
                    <td>
                      <div className="patient-info">
                        <strong>
                          {record.patient?.personalInfo?.firstName} {record.patient?.personalInfo?.lastName}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {record.patient?.patientId}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="doctor-info">
                        <strong>
                          Dr. {record.doctor?.personalInfo?.firstName} {record.doctor?.personalInfo?.lastName}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Stethoscope size={12} />
                          {record.doctor?.professionalInfo?.specialization}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span 
                        className="visit-type"
                        style={{
                          backgroundColor: `${getVisitTypeColor(record.visitType)}20`,
                          color: getVisitTypeColor(record.visitType),
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}
                      >
                        {record.visitType?.replace('-', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="diagnosis-info">
                        <strong>{record.diagnosis || 'Not specified'}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                          {record.treatment && record.treatment.length > 50 
                            ? record.treatment.substring(0, 50) + '...' 
                            : record.treatment || 'No treatment notes'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="prescriptions-info">
                        {record.prescriptions && record.prescriptions.length > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Pill size={14} />
                            <span>{record.prescriptions.length} medication(s)</span>
                          </div>
                        ) : (
                          <span style={{ color: '#999', fontSize: '0.85rem' }}>No prescriptions</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {record.followUpDate ? (
                        <div style={{ fontSize: '0.85rem' }}>
                          {new Date(record.followUpDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span style={{ color: '#999', fontSize: '0.85rem' }}>Not scheduled</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view" 
                          title="View Details"
                          onClick={() => setViewingRecord(record)}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="action-btn edit" 
                          title="Edit Record"
                          onClick={() => {
                            setEditingRecord(record)
                            setShowAddModal(true)
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="action-btn delete" 
                          title="Delete Record"
                          onClick={() => handleDeleteRecord(record._id)}
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
            <span className="stat-label">Total Records</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {records.filter(r => {
                const today = new Date().toISOString().split('T')[0]
                return r.createdAt?.includes(today)
              }).length}
            </span>
            <span className="stat-label">Today's Records</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {records.filter(r => r.followUpDate && new Date(r.followUpDate) > new Date()).length}
            </span>
            <span className="stat-label">Pending Follow-ups</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {records.reduce((total, record) => total + (record.prescriptions?.length || 0), 0)}
            </span>
            <span className="stat-label">Total Prescriptions</span>
          </div>
        </div>
      </div>

      {/* Add/Edit Record Modal */}
      {showAddModal && (
        <MedicalRecordForm 
          record={editingRecord}
          onClose={() => {
            setShowAddModal(false)
            setEditingRecord(null)
          }}
        />
      )}

      {/* View Record Details Modal */}
      {viewingRecord && (
        <MedicalRecordDetailsModal 
          record={viewingRecord}
          onClose={() => setViewingRecord(null)}
        />
      )}
    </div>
  )
}

export default Records