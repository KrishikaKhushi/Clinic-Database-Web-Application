import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Bell, User, LogOut } from 'lucide-react'

const Header = () => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="header">
      <div className="header-left">
        <h1>Clinic Management System</h1>
      </div>
      
      <div className="header-right">
        <div className="notification-icon">
          <Bell size={20} />
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