import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import api from "../../api";

import MenuIcon from "@mui/icons-material/Menu";
import YouTubeIcon from "@mui/icons-material/YouTube";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import PersonIcon from "@mui/icons-material/Person";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import NotificationsIcon from "@mui/icons-material/Notifications";

const Navbar = ({ sideNavbar, setSideNavbarFunc, isLoggedIn, setIsLoggedIn, darkMode, toggleTheme }) => {
  const [showProfileMenu,  setShowProfileMenu]  = useState(false);
  const [showNotifications,setShowNotifications]= useState(false);
  const [notifications,    setNotifications]    = useState([]);
  const [unreadCount,      setUnreadCount]      = useState(0);
  const [userPic,          setUserPic]          = useState(null);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [listening,        setListening]        = useState(false);

  const navigate      = useNavigate();
  const notifRef      = useRef(null);
  const profileRef    = useRef(null);

  useEffect(() => {
    const pic = localStorage.getItem("userProfilePic");
    if (pic) setUserPic(pic);
  }, [isLoggedIn]);

  // Fetch notifications when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchNotifs = async () => {
      try {
        const res = await api.get("/api/notification");
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (e) { console.error(e); }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
    if (!showNotifications && unreadCount > 0) {
      try {
        await api.put("/api/notification/read/all");
        setUnreadCount(0);
        setNotifications(p => p.map(n => ({ ...n, read: true })));
      } catch (e) { console.error(e); }
    }
  };

  const handleNotifClick = async (notif) => {
    setShowNotifications(false);
    if (notif.video?._id) navigate(`/video/${notif.video._id}`);
    else if (notif.type === "new_subscriber") navigate(`/profile/${notif.sender._id}`);
  };

  const handleSearch = () => { if (searchQuery.trim()) navigate(`/?search=${searchQuery}`); };

  const handleVoiceSearch = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech recognition not supported");
    const r = new SR(); r.lang = "en-US"; r.start(); setListening(true);
    r.onresult = (e) => { const t = e.results[0][0].transcript; setSearchQuery(t); setListening(false); navigate(`/?search=${t}`); };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false); setUserPic(null); setUnreadCount(0);
    setShowProfileMenu(false); navigate("/");
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  };

  return (
    <div className="navbar">

      {/* LEFT */}
      <div className="navbar-left">
        <div className="navbarHamburger" onClick={() => setSideNavbarFunc(!sideNavbar)}>
          <MenuIcon />
        </div>
        <Link to="/" className="youtube_link">
          <div className="youtube_img">
            <YouTubeIcon className="youtube_image" />
            <span className="navbar_youtubetitle">YouTube</span>
          </div>
        </Link>
      </div>

      {/* CENTER */}
      <div className="navbar-center">
        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search"
            className="search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <div className="search-icon" onClick={handleSearch}><SearchIcon /></div>
        </div>
        <div className={`navbar-mic ${listening ? "mic-active" : ""}`} onClick={handleVoiceSearch}>
          <KeyboardVoiceIcon />
        </div>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">

        {/* Theme toggle */}
        <div className="theme-toggle" onClick={toggleTheme}>
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </div>

        <VideoCallIcon className="navbar-icon" onClick={() => navigate("/upload")} />

        {/* ===== NOTIFICATION BELL ===== */}
        {isLoggedIn && (
          <div className="notif-wrapper" ref={notifRef}>
            <div className="notif-bell" onClick={handleOpenNotifications}>
              <NotificationsIcon />
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </div>

            {showNotifications && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <span>Notifications</span>
                  {notifications.some(n => !n.read) && (
                    <button onClick={async () => {
                      await api.put("/api/notification/read/all");
                      setUnreadCount(0);
                      setNotifications(p => p.map(n => ({ ...n, read: true })));
                    }}>Mark all read</button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications yet</div>
                ) : (
                  <div className="notif-list">
                    {notifications.map(n => (
                      <div
                        key={n._id}
                        className={`notif-item ${!n.read ? "unread" : ""}`}
                        onClick={() => handleNotifClick(n)}
                      >
                        <img
                          src={n.sender?.profilePic || "https://via.placeholder.com/36"}
                          alt={n.sender?.channelName}
                          className="notif-avatar"
                        />
                        <div className="notif-body">
                          <p className="notif-message">{n.message}</p>
                          <span className="notif-time">{timeAgo(n.createdAt)}</span>
                        </div>
                        {!n.read && <div className="notif-dot" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        <div className="profile-wrapper" ref={profileRef}>
          {!isLoggedIn ? (
            <PersonIcon className="navbar-icon" onClick={() => navigate("/login")} />
          ) : (
            <img
              src={userPic || "https://via.placeholder.com/35"}
              alt="profile"
              className="navbar-profile-pic"
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            />
          )}
          {showProfileMenu && isLoggedIn && (
            <div className="navbar-model">
              <div className="navbar-model-item" onClick={() => { navigate("/your-channel"); setShowProfileMenu(false); }}>Your Channel</div>
              <div className="navbar-model-item" onClick={() => { navigate(`/profile/${localStorage.getItem("userId")}`); setShowProfileMenu(false); }}>Profile</div>
              <div className="navbar-model-item" onClick={() => { navigate("/upload"); setShowProfileMenu(false); }}>Upload</div>
              <div className="navbar-model-divider" />
              <div className="navbar-model-item" onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;