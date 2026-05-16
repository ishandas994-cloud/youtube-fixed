import React from "react";
import "./sideNavbar.css";
import { NavLink, useNavigate } from "react-router-dom";

import HomeIcon from "@mui/icons-material/Home";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import HistoryIcon from "@mui/icons-material/History";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import PersonIcon from "@mui/icons-material/Person";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import VideoCallIcon from "@mui/icons-material/VideoCall";

const SideNavbar = ({ sideNavbar, isLoggedIn }) => {
  const navigate = useNavigate();
  const sidebarClass = `home-sideNavbar ${sideNavbar ? "home-sideNavbarOpen" : "home-sideNavbarHide"}`;

  return (
    <div className={sidebarClass}>

      {/* ===== MAIN ===== */}
      <div className="home-sideNavbarTop">
        <NavLink to="/" end className="home_sideNavbarTopOption">
          <HomeIcon /><span>Home</span>
        </NavLink>
        <NavLink to="/trending" className="home_sideNavbarTopOption">
          <WhatshotIcon /><span>Trending</span>
        </NavLink>
        <NavLink to="/subscriptions" className="home_sideNavbarTopOption">
          <SubscriptionsIcon /><span>Subscriptions</span>
        </NavLink>
      </div>

      <hr />

      {/* ===== YOU ===== */}
      <div className="home_sideNavbarSectionTitle">YOU</div>
      <div className="home-sideNavbarTop">
        <NavLink to="/your-channel" className="home_sideNavbarTopOption">
          <PersonIcon /><span>Your Channel</span>
        </NavLink>
        <NavLink to="/history" className="home_sideNavbarTopOption">
          <HistoryIcon /><span>History</span>
        </NavLink>
        <NavLink to="/your-videos" className="home_sideNavbarTopOption">
          <VideoLibraryIcon /><span>Your Videos</span>
        </NavLink>
        <NavLink to="/watchlater" className="home_sideNavbarTopOption">
          <WatchLaterIcon /><span>Watch Later</span>
        </NavLink>
        <NavLink to="/liked" className="home_sideNavbarTopOption">
          <ThumbUpAltIcon /><span>Liked Videos</span>
        </NavLink>
      </div>

      <hr />

      {/* ===== UPLOAD ===== */}
      <div className="home-sideNavbarTop">
        <div className="home_sideNavbarTopOption" onClick={() => navigate("/upload")} style={{ cursor: "pointer" }}>
          <VideoCallIcon /><span>Upload Video</span>
        </div>
      </div>

      <hr />

      {/* ===== SIGN IN PROMPT ===== */}
      {!isLoggedIn && (
        <div className="sidebar_signin_box">
          <p>Sign in to like videos, comment and subscribe.</p>
          <button onClick={() => navigate("/login")} className="sidebar_signin_btn">
            <PersonIcon style={{ fontSize: 18 }} /> Sign In
          </button>
        </div>
      )}

    </div>
  );
};

export default SideNavbar;
