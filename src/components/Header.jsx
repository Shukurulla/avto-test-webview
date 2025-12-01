import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";
import "../styles/Header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setShowDropdown(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <h1 onClick={() => navigate("/test/select")} style={{ cursor: "pointer" }}>
            Avto Test Nukus
          </h1>
        </div>

        <div className="header-right">
          <button
            onClick={() => navigate("/test/history")}
            className="btn-history"
          >
            Natijalar tarixi
          </button>

          <div className="profile-section" ref={dropdownRef}>
            <button
              className="profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="profile-avatar">
                {user?.login?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="profile-info">
                <span className="profile-name">{user?.login || "Foydalanuvchi"}</span>
                <span className="profile-computer">Kompyuter: {user?.computerNumber || "-"}</span>
              </div>
              <span className={`dropdown-arrow ${showDropdown ? "open" : ""}`}>
                ▼
              </span>
            </button>

            {showDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {user?.login?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-name">{user?.login}</span>
                    <span className="dropdown-computer">Kompyuter: {user?.computerNumber}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/test/history");
                  }}
                >
                  <span className="dropdown-icon">📋</span>
                  Natijalar tarixi
                </button>
                <button className="dropdown-item logout" onClick={handleLogoutClick}>
                  <span className="dropdown-icon">🚪</span>
                  Chiqish
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Chiqishni tasdiqlang"
        message="Chiqish uchun parolni kiriting"
        confirmText="Chiqish"
        cancelText="Bekor qilish"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
        type="danger"
        requirePassword={true}
      />
    </>
  );
};

export default Header;
