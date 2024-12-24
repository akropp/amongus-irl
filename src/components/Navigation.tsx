import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Navigation() {
  const navigate = useNavigate();

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/admin');
  };

  return (
    <nav className="absolute top-4 right-4">
      <button 
        onClick={handleAdminClick}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Shield className="w-4 h-4" />
        Admin Panel
      </button>
    </nav>
  );
}