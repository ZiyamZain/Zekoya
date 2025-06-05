import adminAxios from "../../utils/adminAxiosConfig"; // Use the configured adminAxios instance

export const login = async (adminData) => {
  // Use relative path; adminAxios prepends '/api/admin'
  const response = await adminAxios.post("/login", adminData);
  // Store both tokens and admin info
  if (response.data.accessToken && response.data.refreshToken) {
    localStorage.setItem("adminInfo", JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = async (refreshToken) => {
  // Use relative path
  await adminAxios.post("/logout", { refreshToken });
  localStorage.removeItem("adminInfo");
};

export const refreshAdminToken = async (refreshToken) => {
  // Use relative path
  const response = await adminAxios.post("/refresh-token", { refreshToken });
  return response.data;
};
