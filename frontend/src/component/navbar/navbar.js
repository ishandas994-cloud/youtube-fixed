import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";

import MenuIcon from "@mui/icons-material/Menu";
import YouTubeIcon from "@mui/icons-material/YouTube";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import PersonIcon from "@mui/icons-material/Person";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

const Navbar = ({ sideNavbar, setSideNavbarFunc, isLoggedIn, setIsLoggedIn, darkMode, toggleTheme }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userPic, setUserPic] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [listening, setListening] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const pic = localStorage.getItem("userProfilePic");
    if (pic) setUserPic(pic);
  }, [isLoggedIn]);

  const handleSearch = () => {
    if (searchQuery.trim()) navigate(`/?search=${searchQuery}`);
  };

  const handleSearchEnter = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleVoiceSearch = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech recognition not supported");
    const r = new SR();
    r.lang = "en-US";
    r.start();
    setListening(true);
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setSearchQuery(t);
      setListening(false);
      navigate(`/?search=${t}`);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserPic(null);
    setShowProfileMenu(false);
    navigate("/");
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
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchEnter}
          />
          <div className="search-icon" onClick={handleSearch}>
            <SearchIcon />
          </div>
        </div>
        <div className={`navbar-mic ${listening ? "mic-active" : ""}`} onClick={handleVoiceSearch}>
          <KeyboardVoiceIcon />
        </div>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">

        {/* Theme Toggle */}
        <div className="theme-toggle" onClick={toggleTheme} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </div>

        <VideoCallIcon className="navbar-icon" onClick={() => navigate("/upload")} />

        <div className="profile-wrapper">
          {!isLoggedIn ? (
            <PersonIcon className="navbar-icon" onClick={() => navigate("/login")} />
          ) : (
            <img
              src={userPic || "https://via.placeholder.com/35?text=U"}
              alt="profile"
              className="navbar-profile-pic"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
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
