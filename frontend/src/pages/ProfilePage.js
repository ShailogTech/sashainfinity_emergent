import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, updateUser, logout, isAuthenticated, API_BASE } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Profile update failed");
      }

      // Update user context
      updateUser(data);
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "An error occurred during profile update");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const updateData = {
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      };

      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Password update failed");
      }

      setSuccessMessage("Password updated successfully!");
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    } catch (err) {
      setError(err.message || "An error occurred during password update");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="sasha-profile-page" style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fafafa 0%, #ffffff 100%)",
      paddingTop: "100px",
      paddingBottom: "60px"
    }}>
      <div className="sasha-container">
        <div style={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.5)"
        }}>
          {/* Profile Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "40px",
            paddingBottom: "24px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f4911a 0%, #ffaa44 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: "800",
                color: "#fff"
              }}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1 style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "#1a1a2e",
                  marginBottom: "4px"
                }}>
                  {user?.name || "User"}
                </h1>
                <p style={{
                  fontSize: "14px",
                  color: "#6b7280"
                }}>
                  {user?.email || "user@example.com"}
                </p>
                <div style={{
                  display: "inline-block",
                  marginTop: "8px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  background: "rgba(244, 145, 26, 0.1)",
                  color: "#f4911a",
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "capitalize"
                }}>
                  {user?.role || "student"}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                border: "1px solid rgba(245, 87, 108, 0.2)",
                background: "rgba(245, 87, 108, 0.1)",
                color: "#f5576c",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(245, 87, 108, 0.2)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(245, 87, 108, 0.1)"}
            >
              <i className="fa-solid fa-sign-out-alt" style={{ marginRight: "8px" }}></i>
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div style={{
            display: "flex",
            gap: "8px",
            marginBottom: "32px",
            borderBottom: "2px solid rgba(0, 0, 0, 0.06)"
          }}>
            <button
              onClick={() => setActiveTab("profile")}
              style={{
                padding: "12px 24px",
                borderRadius: "12px 12px 0 0",
                border: "none",
                background: activeTab === "profile" ? "rgba(244, 145, 26, 0.1)" : "transparent",
                color: activeTab === "profile" ? "#f4911a" : "#6b7280",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                borderBottom: activeTab === "profile" ? "2px solid #f4911a" : "2px solid transparent"
              }}
            >
              <i className="fa-solid fa-user" style={{ marginRight: "8px" }}></i>
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("security")}
              style={{
                padding: "12px 24px",
                borderRadius: "12px 12px 0 0",
                border: "none",
                background: activeTab === "security" ? "rgba(244, 145, 26, 0.1)" : "transparent",
                color: activeTab === "security" ? "#f4911a" : "#6b7280",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                borderBottom: activeTab === "security" ? "2px solid #f4911a" : "2px solid transparent"
              }}
            >
              <i className="fa-solid fa-lock" style={{ marginRight: "8px" }}></i>
              Security
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              background: "rgba(245, 87, 108, 0.1)",
              color: "#f5576c",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "24px",
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid rgba(245, 87, 108, 0.2)"
            }}>
              <i className="fa-solid fa-exclamation-circle" style={{ marginRight: "8px" }}></i>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{
              background: "rgba(34, 197, 94, 0.1)",
              color: "#22c55e",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "24px",
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid rgba(34, 197, 94, 0.2)"
            }}>
              <i className="fa-solid fa-check-circle" style={{ marginRight: "8px" }}></i>
              {successMessage}
            </div>
          )}

          {/* Profile Information Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileUpdate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1a1a2e",
                    marginBottom: "8px"
                  }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      fontSize: "14px",
                      background: "rgba(255, 255, 255, 0.8)",
                      transition: "all 0.3s ease"
                    }}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1a1a2e",
                    marginBottom: "8px"
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      fontSize: "14px",
                      background: "rgba(255, 255, 255, 0.8)",
                      transition: "all 0.3s ease"
                    }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={{
                padding: "20px",
                borderRadius: "12px",
                background: "rgba(244, 145, 26, 0.05)",
                border: "1px solid rgba(244, 145, 26, 0.1)",
                marginBottom: "24px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <i className="fa-solid fa-info-circle" style={{ color: "#f4911a" }}></i>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a2e" }}>
                    Account Information
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Role</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a2e", textTransform: "capitalize" }}>
                      {user?.role || "student"}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Member Since</span>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a2e" }}>
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "14px 32px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #f4911a 0%, #ffaa44 100%)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  transition: "all 0.3s ease"
                }}
              >
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "8px" }}></i>
                    Updating Profile...</>
                ) : (
                  <><i className="fa-solid fa-save" style={{ marginRight: "8px" }}></i>
                    Save Changes</>
                )}
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <form onSubmit={handlePasswordUpdate}>
              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#1a1a2e",
                  marginBottom: "8px"
                }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    fontSize: "14px",
                    background: "rgba(255, 255, 255, 0.8)",
                    transition: "all 0.3s ease"
                  }}
                  required
                  disabled={loading}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1a1a2e",
                    marginBottom: "8px"
                  }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      fontSize: "14px",
                      background: "rgba(255, 255, 255, 0.8)",
                      transition: "all 0.3s ease"
                    }}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1a1a2e",
                    marginBottom: "8px"
                  }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      fontSize: "14px",
                      background: "rgba(255, 255, 255, 0.8)",
                      transition: "all 0.3s ease"
                    }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={{
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(59, 130, 246, 0.05)",
                border: "1px solid rgba(59, 130, 246, 0.1)",
                marginBottom: "24px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <i className="fa-solid fa-shield-alt" style={{ color: "#3b82f6" }}></i>
                  <span style={{ fontSize: "13px", color: "#3b82f6" }}>
                    Password must be at least 6 characters long
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "14px 32px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #f4911a 0%, #ffaa44 100%)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  transition: "all 0.3s ease"
                }}
              >
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "8px" }}></i>
                    Updating Password...</>
                ) : (
                  <><i className="fa-solid fa-key" style={{ marginRight: "8px" }}></i>
                    Update Password</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}