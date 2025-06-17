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
  EmojiEvents as EmojiEventsIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import "./Sidebar.scss";

const menuItems = [
  { name: "Dashboard", icon: <HomeIcon />, link: "/dashboard" },
  { name: "Users", icon: <PeopleIcon />, link: "/users" },
  { name: "Posts", icon: <DescriptionIcon />, link: "/posts" },
  { name: "News/Articles", icon: <ArticleIcon />, link: "/news" },
  { name: "Certificates", icon: <EmojiEventsIcon />, link: "/certificates" },
  // { name: "Schedules", icon: <CalendarIcon />, link: "/schedules" },
  // {
  //   name: "Tickets",
  //   icon: <ConfirmationNumberIcon />,
  //   link: "/tickets",
  //   comingSoon: true,
  // },
  // { name: "System Logs", icon: <SettingsIcon />, link: "/system" },
];

const Sidebar: React.FC<{ isShrink: boolean; toggleShrink: () => void }> = ({
  isShrink,
  toggleShrink,
}) => {
  const handleComingSoonClick = (name: string) => {
    sendWarningToast(`${name} feature is coming soon!`);
  };

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
          {menuItems.map(({ name, icon, link, comingSoon }) => (
            <li key={name}>
              {comingSoon ? (
                <div
                  className="coming-soon"
                  onClick={() => handleComingSoonClick(name)}
                >
                  {icon}
                  {!isShrink && (
                    <>
                      <span>{name}</span>
                      <span className="coming-soon-badge">Soon</span>
                    </>
                  )}
                </div>
              ) : (
                <NavLink
                  to={link}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  {icon}
                  {!isShrink && <span>{name}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
