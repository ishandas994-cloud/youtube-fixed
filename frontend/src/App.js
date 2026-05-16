import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Navbar from "./component/navbar/navbar";
import SideNavbar from "./component/sideNavbar/sideNavbar";

import Home from "./pages/home";
import Profile from "./pages/profile/profile";
import Video from "./pages/Video/video";
import Videoupload from "./pages/videouplode/videouplode";
import Signup from "./pages/signup/signup";
import Login from "./component/login/login";
import Search from "./pages/search/search";
import Trending from "./pages/trending/trending";
import History from "./pages/history/History";
import WatchLater from "./pages/watchLater/WatchLater";
import LikedVideos from "./pages/LikedVideos/LikedVideos";
import Subscriptions from "./pages/subscriptions/Subscriptions";
import YourVideos from "./pages/yourVideos/YourVideos";
import YourChannel from "./pages/yourChannel/YourChannel";

function App() {
  const [sideNavbar, setSideNavbar] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <>
      <Navbar
        sideNavbar={sideNavbar}
        setSideNavbarFunc={setSideNavbar}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      <div className="app-layout">
        <SideNavbar sideNavbar={sideNavbar} isLoggedIn={isLoggedIn} />

        <div className={`app-content ${sideNavbar ? "shift-content" : ""}`}>
          <Routes>
            <Route path="/"              element={<Home sideNavbar={sideNavbar} />} />
            <Route path="/trending"      element={<Trending />} />
            <Route path="/profile/:id"   element={<Profile sideNavbar={sideNavbar} />} />
            <Route path="/video/:id"     element={<Video sideNavbar={sideNavbar} />} />
            <Route path="/upload"        element={<Videoupload />} />
            <Route path="/search/:query" element={<Search />} />
            <Route path="/signup"        element={<Signup />} />
            <Route path="/login"         element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/history"       element={<History sideNavbar={sideNavbar} />} />
            <Route path="/watchlater"    element={<WatchLater sideNavbar={sideNavbar} />} />
            <Route path="/liked"         element={<LikedVideos sideNavbar={sideNavbar} />} />
            <Route path="/subscriptions" element={<Subscriptions sideNavbar={sideNavbar} />} />
            <Route path="/your-videos"   element={<YourVideos sideNavbar={sideNavbar} />} />
            <Route path="/your-channel"  element={<YourChannel sideNavbar={sideNavbar} />} />
            <Route path="*"              element={<div style={{ color: "white", padding: 40, fontSize: 24 }}>404 - Page Not Found</div>} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
