import React from "react";
import { NavLink } from "react-router-dom";
// @ts-ignore
import logo from "@assets/logo.png";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Article as ArticleIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import "./Sidebar.scss";

const menuItems = [
  { name: "Dashboard", icon: <HomeIcon />, link: "/dashboard" },
  { name: "Users", icon: <PeopleIcon />, link: "/users" },
  { name: "Posts", icon: <DescriptionIcon />, link: "/posts" },
  { name: "News/Articles", icon: <ArticleIcon />, link: "/news" },
  { name: "Tickets", icon: <ConfirmationNumberIcon />, link: "/tickets" },
  { name: "System Config", icon: <SettingsIcon />, link: "/config" },
];

const Sidebar: React.FC<{ isShrink: boolean; toggleShrink: () => void }> = ({ isShrink, toggleShrink }) => {
  return (
    <aside className={`sidebar ${isShrink ? "shrink" : ""}`}>
      <div className="sidebar-header" onClick={toggleShrink}>
        <MenuIcon className="menu-icon" />
      </div>
      <div className="sidebar-logo">
        <img src={logo} alt="Admin Dashboard" />
        {!isShrink && <p>Admin Dashboard</p>}
      </div>
      <nav className="sidebar-menu">
        <ul>
          {menuItems.map(({ name, icon, link }) => (
            <li key={name}>
              <NavLink to={link} className={({ isActive }) => (isActive ? "active" : "")}>
                {icon}
                {!isShrink && <span>{name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
