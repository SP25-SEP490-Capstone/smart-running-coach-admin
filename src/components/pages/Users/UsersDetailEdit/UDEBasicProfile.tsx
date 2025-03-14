import { useState } from "react";
import { Button } from "@mui/material";
import CommonDialog from "@components/commons/CommonDialog";
import PersonIcon from "@mui/icons-material/Person";
import CakeIcon from "@mui/icons-material/Cake";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import BadgeIcon from "@mui/icons-material/Badge";
import CircleIcon from "@mui/icons-material/Circle";
import EventIcon from "@mui/icons-material/Event";
import TextField from "@mui/material/TextField";
import { MenuItem, Select } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import './UDEBasicProfile.scss'

function PersonalDetails() {
  const [name, setName] = useState("Sarah Wilson");
  const [birthDate, setBirthDate] = useState("1995-01-15");
  const [email, setEmail] = useState("sarah.wilson@example.com");
  const [phone, setPhone] = useState("123-456-7890");
  const [address, setAddress] = useState("123 Main St, Anytown, USA 12345");
  const [role, setRole] = useState("Premium Member");
  const [status, setStatus] = useState("Active");
  const [created, setCreated] = useState("2024-01-15 09:30 AM");

  const roles = [
    { value: "Basic Member", label: "Basic Member" },
    { value: "Premium Member", label: "Premium Member" },
    { value: "Expert", label: "Expert" },
    { value: "Admin", label: "Admin" },
  ];

  const statuses = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  return (
    <div className='ude-basic-profile-personal-details'>
      <div className='label'>
        <p>Personal Details</p>
      </div>
      <div className='items'>
        <div className='item'>
          <PersonIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Full name</p>
            <TextField
              variant="standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div className='item'>
          <CakeIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Birth Date</p>
            <TextField
              variant="standard"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>
        </div>
        <div className='item'>
          <EmailIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Email</p>
            <TextField
              variant="standard"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className='item'>
          <PhoneIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Phone</p>
            <TextField
              variant="standard"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div className='item'>
          <HomeIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Address</p>
            <TextField
              variant="standard"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
        <div className='item'>
          <BadgeIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Role</p>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              variant="standard"
            >
              {roles.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>
        <div className='item'>
          <CircleIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Status</p>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              variant="standard"
            >
              {statuses.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>
        <div className='item'>
          <EventIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Created</p>
            <p className="created-date">{created}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UDEBasicProfile({open, onClose}: any) {
  return (
    <div className='ude-basic-profile'>
      <CommonDialog
        className="custom-dialog"
        title="User Details"
        maxWidth="sm"
        minHeight="400px"
        open={open}
        onClose={onClose}
        footer={
          <div className="ude-basic-profile-footer">
            <Button className="btn-cancel" startIcon={<CloseIcon />} onClick={() => console.log("Cancel clicked")}>
              Cancel
            </Button>
            <Button variant="outlined" className="btn-reset" startIcon={<RefreshIcon />} onClick={() => console.log("Reset clicked")}>
              Reset
            </Button>
            <Button variant="contained" className="btn-save" startIcon={<SaveIcon />} onClick={() => console.log("Save clicked")}>
              Save
            </Button>
          </div>
        }
      >
        <PersonalDetails />
      </CommonDialog>
    </div>
  );
}

