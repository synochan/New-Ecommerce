import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';

const Profile: React.FC = () => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return null;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1">
              <p className="text-lg">{user.name}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1">
              <p className="text-lg">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 