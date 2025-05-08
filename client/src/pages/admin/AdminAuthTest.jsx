import React, { useEffect, useState } from 'react';
import { checkAdminAuth, setTestAdminToken } from '../../utils/adminAuthTest';
import API from '../../utils/axiosConfig';

const AdminAuthTest = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [testToken, setTestToken] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if admin is logged in on component mount
    const adminAuth = checkAdminAuth();
    setIsAdminLoggedIn(adminAuth);
  }, []);

  const handleSetTestToken = () => {
    if (testToken) {
      const success = setTestAdminToken(testToken);
      if (success) {
        setIsAdminLoggedIn(checkAdminAuth());
      }
    }
  };

  const handleTestAdminApi = async () => {
    try {
      setError(null);
      // Test the admin orders API endpoint
      const response = await API.get('/api/orders/admin', {
        params: { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }
      });
      setApiResponse(response.data);
    } catch (error) {
      console.error('API Error:', error.response || error);
      setError(error.response?.data?.message || error.message || 'Unknown error');
    }
  };

  const handleClearAdminInfo = () => {
    localStorage.removeItem('adminInfo');
    setIsAdminLoggedIn(false);
    setApiResponse(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Admin Authentication Test</h1>
        
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          <p className={`font-medium ${isAdminLoggedIn ? 'text-green-600' : 'text-red-600'}`}>
            {isAdminLoggedIn ? 'Admin is authenticated' : 'Admin is not authenticated'}
          </p>
        </div>

        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Set Test Admin Token</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={testToken}
              onChange={(e) => setTestToken(e.target.value)}
              placeholder="Enter admin token"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleSetTestToken}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Set Token
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={handleTestAdminApi}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Test Admin API
          </button>
          <button
            onClick={handleClearAdminInfo}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Clear Admin Info
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-300 rounded-lg bg-red-50">
            <h2 className="text-lg font-semibold mb-2 text-red-700">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {apiResponse && (
          <div className="mb-6 p-4 border rounded-lg bg-green-50">
            <h2 className="text-lg font-semibold mb-2">API Response</h2>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuthTest;
