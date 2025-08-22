import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Bell, User, LogOut, X, Check, CheckCheck, Trash2, Settings } from 'lucide-react'
import { notificationsAPI } from '../../services/api'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

  const handleLogout = () => {
    logout()
  }

  // Fetch notifications
  const { 
    data: notificationsData, 
    isLoading: notificationsLoading,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getAll(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  })

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationsAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    }
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsAPI.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    }
  })

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    }
  })

  // Generate sample notifications (for testing)
  const generateSampleMutation = useMutation({
    mutationFn: notificationsAPI.generateSample,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    }
  })

  const notifications = notificationsData?.data?.notifications || []
  const unreadCount = notificationsData?.data?.unreadCount || 0

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id)
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
      setShowNotifications(false)
    }
  }

  const handleMarkAsRead = (e, notificationId) => {
    e.stopPropagation()
    markAsReadMutation.mutate(notificationId)
  }

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation()
    deleteNotificationMutation.mutate(notificationId)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent': return '🚨'
      case 'appointment': return '📅'
      case 'patient': return '👤'
      case 'doctor': return '👨‍⚕️'
      case 'record': return '📋'
      case 'reminder': return '⏰'
      case 'system': return '⚙️'
      default: return '📢'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4757'
      case 'medium': return '#ffa502'
      case 'low': return '#26de81'
      default: return '#74b9ff'
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <header className="header">
      <div className="header-left">
        <h1>Clinic Management System</h1>
      </div>
      
      <div className="header-right">
        <div 
          className="notification-wrapper" 
          ref={notificationRef}
        >
          <div 
            className="notification-icon"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </div>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                <div className="notifications-actions">
                  {unreadCount > 0 && (
                    <button
                      className="mark-all-read-btn"
                      onClick={() => markAllAsReadMutation.mutate()}
                      title="Mark all as read"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button
                    className="generate-sample-btn"
                    onClick={() => generateSampleMutation.mutate()}
                    title="Generate sample notifications"
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    className="close-notifications-btn"
                    onClick={() => setShowNotifications(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="notifications-list">
                {notificationsLoading ? (
                  <div className="notifications-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="no-notifications">
                    <Bell size={48} style={{ opacity: 0.3 }} />
                    <p>No notifications yet</p>
                    <button
                      className="generate-sample-btn-large"
                      onClick={() => generateSampleMutation.mutate()}
                    >
                      Generate Sample Notifications
                    </button>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-content">
                        <div className="notification-header">
                          <span className="notification-emoji">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <span className="notification-title">
                            {notification.title}
                          </span>
                          <div
                            className="notification-priority"
                            style={{ backgroundColor: getPriorityColor(notification.priority) }}
                          ></div>
                        </div>
                        <p className="notification-message">
                          {notification.message}
                        </p>
                        <div className="notification-footer">
                          <span className="notification-time">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          <div className="notification-actions">
                            {!notification.isRead && (
                              <button
                                className="mark-read-btn"
                                onClick={(e) => handleMarkAsRead(e, notification._id)}
                                title="Mark as read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              className="delete-btn"
                              onClick={(e) => handleDeleteNotification(e, notification._id)}
                              title="Delete notification"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="notifications-footer">
                <button
                  className="view-all-btn"
                  onClick={() => {
                    setShowNotifications(false)
                    // Could navigate to a full notifications page
                  }}
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="user-menu">
          <div className="user-info">
            <User size={20} />
            <span>{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header