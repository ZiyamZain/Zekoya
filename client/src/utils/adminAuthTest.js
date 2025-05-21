
export const checkAdminAuth = () => {
  try {
    // Get admin info from localStorage
    const adminInfoStr = localStorage.getItem('adminInfo');

    
    if (!adminInfoStr) {
      console.error('No admin info found in localStorage');
      return false;
    }
    
    // Parse admin info
    const adminInfo = JSON.parse(adminInfoStr);

    // Check if admin token exists
    if (!adminInfo || !adminInfo.token) {
      console.error('Admin token not found in adminInfo');
      return false;
    }
    

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

    return true;
  } catch (error) {
    console.error('Error setting test admin token:', error);
    return false;
  }
};
