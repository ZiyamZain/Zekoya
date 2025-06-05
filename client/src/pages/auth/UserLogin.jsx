import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userLogin, googleLogin } from "../../features/userAuth/userAuthSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const UserLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, error } = useSelector((state) => state.userAuth);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(userLogin(formData));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useCallback((response) => {
    dispatch(googleLogin({ token: response.credential }))
      .then((data) => {
        // Store the JWT token in localStorage after successful login
        localStorage.setItem("userInfo", JSON.stringify(data.payload));
        navigate("/home");
      })
      .catch((error) => {
        console.error("Google login failed:", error);
      });
  }, [dispatch, navigate]);



  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });
      google.accounts.id.renderButton(
        document.getElementById("google-login-btn"),
        {
          theme: "outline",
          size: "large",
          width: 300,
        }
      );
    }
  }, [handleGoogleLogin]);

  useEffect(() => {
    if (userInfo && userInfo.token) {
      try {
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        navigate("/home");
      } catch (error) {
        console.error("Error decoding token:", error);
        // Handle the error appropriately, maybe clear the invalid token
        localStorage.removeItem("userInfo");
      }
    }
  }, [userInfo, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-black tracking-tighter mb-2 font-['Bebas_Neue']">
            ZEKOYA
          </h1>
          <div className="w-16 h-1 bg-black mx-auto"></div>
        </div>

        <div className="space-y-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="EMAIL"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="PASSWORD"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-100 border-2 border-transparent rounded-none text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all duration-300 font-medium tracking-wide"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <a
                    href="/forgot-password"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 font-bold tracking-wider hover:bg-gray-900 transition-colors duration-300 disabled:bg-gray-400"
            >
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 uppercase tracking-wider font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <div id="google-login-btn" className="flex justify-center"></div>

          <p className="text-center text-black">
            Don't have an account?{" "}
            <a href="/register" className="font-bold hover:underline">
              Sign up now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
