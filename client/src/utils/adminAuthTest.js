// This file is for testing admin authentication

// Function to check if admin is logged in
export const checkAdminAuth = () => {
  try {
    // Get admin info from localStorage
    const adminInfoStr = localStorage.getItem('adminInfo');
    console.log('Admin info from localStorage:', adminInfoStr);
    
    if (!adminInfoStr) {
      console.error('No admin info found in localStorage');
      return false;
    }
    
    // Parse admin info
    const adminInfo = JSON.parse(adminInfoStr);
    console.log('Parsed admin info:', adminInfo);
    
    // Check if admin token exists
    if (!adminInfo || !adminInfo.token) {
      console.error('Admin token not found in adminInfo');
      return false;
    }
    
    console.log('Admin is authenticated with token:', adminInfo.token);
    return true;
  } catch (error) {
    console.error('Error checking admin authentication:', error);
    return false;
  }
};

// Function to manually set admin token for testing
export const setTestAdminToken = (token) => {
  try {
    const testAdminInfo = {
      _id: 'test-admin-id',
      email: 'admin@example.com',
      token: token
    };
    
    localStorage.setItem('adminInfo', JSON.stringify(testAdminInfo));
    console.log('Test admin token set successfully');
    return true;
  } catch (error) {
    console.error('Error setting test admin token:', error);
    return false;
  }
};
