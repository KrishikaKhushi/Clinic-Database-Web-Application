import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar, 
  FileText,
  Activity
} from 'lucide-react'

const Sidebar = () => {
  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
    },
    {
      path: '/patients',
      icon: Users,
      label: 'Patients'
    },
    {
      path: '/doctors',
      icon: UserCheck,
      label: 'Doctors'
    },
    {
      path: '/appointments',
      icon: Calendar,
      label: 'Appointments'
    },
    {
      path: '/records',
      icon: FileText,
      label: 'Medical Records'
    }
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Activity size={32} />
        <h2>ClinicCare</h2>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar