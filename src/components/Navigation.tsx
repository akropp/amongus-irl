import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="absolute top-4 right-4">
      <Link 
        to="/admin" 
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Shield className="w-4 h-4" />
        Admin Panel
      </Link>
    </nav>
  );
}