import './Navbar.scss';
import { useState } from 'react';
import { Avatar, Badge, Divider, IconButton, Menu, MenuItem } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import Person2Icon from '@mui/icons-material/Person2';
//@ts-ignore
import avatarJpg from '@assets/avatar.jpg'
import { deleteCookie } from '@components/utils/util_cookie';
import { useAtom } from 'jotai';
import { userAtom } from '@components/atoms/userAtom';
import { getGravatarUrl } from '@components/utils/util_avatar';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, _] = useAtom(userAtom);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose()
    deleteCookie('token')
    window.location.href = '/login'
  }

  return (
    <div className="navbar">
      <div className="navbar-left"></div>
      <div className="navbar-right">
        <IconButton color="inherit">
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <IconButton onClick={handleClick} color="inherit">
          <Avatar alt="User" src={getGravatarUrl(user?.email)} />
        </IconButton>
        <Menu className='navbar-menu' anchorEl={anchorEl} open={open} onClose={handleClose}>
          <div className='profile-menu'>
            <p className='profile-menu-name'>{user?.username}</p>
            <p className='profile-menu-role'>Admin</p>
          </div>
          <Divider sx={{marginBottom: '10px'}} />
          <MenuItem onClick={handleClose}>
            <Person2Icon sx={{ marginRight: 1 }} /> Profile
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <SettingsIcon sx={{ marginRight: 1 }} /> Settings
          </MenuItem>
          <MenuItem className='btn-logout' onClick={handleLogout}>
            <LogoutIcon sx={{ marginRight: 1 }} /> Logout
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}