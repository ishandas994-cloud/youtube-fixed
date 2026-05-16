import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import api from "./api";
import "./App.css";

/* ================= COMPONENTS ================= */

import Navbar from "./component/navbar/navbar";
import SideNavbar from "./component/sideNavbar/sideNavbar";

/* ================= PAGES ================= */

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

function App() {

  // ================= STATES =================

  const [sideNavbar, setSideNavbar] = useState(true);

  // LOGIN STATE PERSIST AFTER REFRESH
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  // ================= INITIAL API TEST =================

  useEffect(() => {

    const fetchVideos = async () => {

      try {

        const res = await api.get("/api/video");

        console.log("Videos:", res.data);

      } catch (error) {

        console.log(
          "Fetch Video Error:",
          error.response?.data || error.message
        );
      }
    };

    fetchVideos();

  }, []);

  // ================= APP =================

  return (
    <>

      {/* ================= NAVBAR ================= */}

      <Navbar
        sideNavbar={sideNavbar}
        setSideNavbarFunc={setSideNavbar}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      {/* ================= MAIN LAYOUT ================= */}

      <div className="app-layout">

        {/* ================= SIDEBAR ================= */}

        <SideNavbar sideNavbar={sideNavbar} />

        {/* ================= CONTENT ================= */}

        <div
          className={`app-content ${
            sideNavbar ? "shift-content" : ""
          }`}
        >

          <Routes>

            {/* ================= HOME ================= */}

            <Route
              path="/"
              element={
                <Home sideNavbar={sideNavbar} />
              }
            />

            {/* ================= TRENDING ================= */}

            <Route
              path="/trending"
              element={<Trending />}
            />

            {/* ================= PROFILE ================= */}

            <Route
              path="/profile/:id"
              element={
                <Profile sideNavbar={sideNavbar} />
              }
            />

            {/* ================= VIDEO PAGE ================= */}

            <Route
              path="/video/:id"
              element={
                <Video sideNavbar={sideNavbar} />
              }
            />

            {/* ================= UPLOAD ================= */}

            <Route
              path="/upload"
              element={<Videoupload />}
            />

            {/* ================= SEARCH ================= */}

            <Route
              path="/search/:query"
              element={<Search />}
            />

            {/* ================= SIGNUP ================= */}

            <Route
              path="/signup"
              element={<Signup />}
            />

            {/* ================= LOGIN ================= */}

            <Route
              path="/login"
              element={
                <Login
                  setIsLoggedIn={setIsLoggedIn}
                />
              }
            />

            {/* ================= HISTORY ================= */}

            <Route
              path="/history"
              element={
                <History
                  sideNavbar={sideNavbar}
                />
              }
            />

            {/* ================= WATCH LATER ================= */}

            <Route
              path="/watchlater"
              element={
                <WatchLater
                  sideNavbar={sideNavbar}
                />
              }
            />

            {/* ================= LIKED VIDEOS ================= */}

            <Route
              path="/liked"
              element={
                <LikedVideos
                  sideNavbar={sideNavbar}
                />
              }
            />

            {/* ================= 404 PAGE ================= */}

            <Route
              path="*"
              element={
                <div
                  style={{
                    color: "white",
                    padding: "40px",
                    fontSize: "24px",
                  }}
                >
                  404 - Page Not Found
                </div>
              }
            />

          </Routes>

        </div>

      </div>
    </>
  );
}

export default App;