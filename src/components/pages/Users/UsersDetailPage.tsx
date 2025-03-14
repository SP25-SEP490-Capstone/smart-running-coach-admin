import { Avatar, Button, IconButton } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Person as PersonIcon,
  Cake as CakeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Circle as CircleIcon,
  Event as EventIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDownOffAltOutlined as ThumbDownOffAltOutlinedIcon,
  ModeCommentOutlined as ModeCommentOutlinedIcon,
  DoNotDisturbAlt as DoNotDisturbAltIcon,
  DeleteOutline as DeleteOutlineIcon,
  EditOutlined as EditOutlinedIcon,
  WatchOutlined as WatchOutlinedIcon,
  Google as GoogleIcon,
  LockClockOutlined as LockClockOutlinedIcon
} from '@mui/icons-material';
import 'chart.js/auto';
import './UsersDetailPage.scss';
//@ts-ignore
import logo from '@assets/avatar.jpg';
//@ts-ignore
import googlefiticon from '@assets/googlefit.png';
import CommonBreadcrumb from '@components/commons/CommonBreadcrumb';
import { Link } from 'react-router-dom';
import UDEBasicProfile from './UsersDetailEdit/UDEBasicProfile';
import { useState } from 'react';

function PersonalDetails({ onUdeBasicProfile }: any) {
  return (
    <div className='personal-details'>
      <div className='label'>
        <p>Personal Details</p>
        <IconButton className='btn-edit'>
          <EditOutlinedIcon onClick={onUdeBasicProfile} />
        </IconButton>
      </div>
      <div className='items'>
        <div className='item'>
          <PersonIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Full name</p>
            <p className='value'>Sarah Wilson</p>
          </div>
        </div>
        <div className='item'>
          <CakeIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Birth Date</p>
            <p className='value'>1995-01-15</p>
          </div>
        </div>
        <div className='item'>
          <EmailIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Email</p>
            <p className='value'>sarah.wilson@example.com</p>
          </div>
        </div>
        <div className='item'>
          <PhoneIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Phone</p>
            <p className='value'>123-456-7890</p>
          </div>
        </div>
        <div className='item'>
          <HomeIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Address</p>
            <p className='value'>123 Main St, Anytown, USA 12345</p>
          </div>
        </div>
        <div className='item'>
          <BadgeIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Role</p>
            <p className='value'>Premium Member</p>
          </div>
        </div>
        <div className='item'>
          <CircleIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Status</p>
            <p className='value'>Active</p>
          </div>
        </div>
        <div className='item'>
          <EventIcon className='item-icon' />
          <div className='item-meta'>
            <p className='label'>Created</p>
            <p className='value'>2024-01-15 09:30 AM</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommunityActivity() {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Posts',
        data: [5, 10, 15, 8, 20, 25, 30],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className='community-activity'>
      <p className='label'>Community Activity</p>
      <div className='stats'>
        <div className='stat'>
          <ThumbUpOutlinedIcon className='stat-icon' />
          <p className='stat-value'>100</p>
          <p className='stat-label'>Upvotes</p>
        </div>
        <div className='stat'>
          <ThumbDownOffAltOutlinedIcon className='stat-icon' />
          <p className='stat-value'>50</p>
          <p className='stat-label'>Downvotes</p>
        </div>
        <div className='stat'>
          <ModeCommentOutlinedIcon className='stat-icon' />
          <p className='stat-value'>50</p>
          <p className='stat-label'>Comments</p>
        </div>
      </div>
      <div className='activity-graph'>
        <p className='label'>Posting Activity</p>
        <div className='graph'>
          <Bar data={data} options={options} />
        </div>
      </div>
      <Link to='/posts'>
        <p className='btn-view-all'>View all</p>
      </Link>
    </div>
  );
}

function ConnectedDevices() {
  return (
    <div className='connected-devices'>
      <p className='label'>Connected Devices</p>
      <div className='device-meta'>
        <p className='device-meta-label'>Connected devices</p>
        <p className='device-meta-value'>4 devices</p>
      </div>
      <div className='device-list'>
        <div className='device-item'>
          <div className='device-item-meta'>
            <WatchOutlinedIcon className='device-icon' />
            <p>Xiaomi Watch 2</p>
          </div>
          <div>
            <p className='device-item-status active'>Active</p>
          </div>
        </div>
        <div className='device-item'>
          <div className='device-item-meta'>
            <WatchOutlinedIcon className='device-icon' />
            <p>Xiaomi Watch 2</p>
          </div>
          <div>
            <p className='device-item-status active'>Active</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginInformation() {
  return (
    <div className='login-information'>
      <p className='label'>Login Information</p>
      <div className='login-information-content'>
        <div className='login-method'>
          <p className='label'>Primary Login Method</p>
          <div className='login-method-content'>
            <GoogleIcon className='logo-google' />
            <div className='meta'>
              <p className='meta-label'>Google Account</p>
              <p className='meta-email'>sarah.wilson@example.com</p>
            </div>
          </div>
        </div>
        <div className='connected-method'>
          <p className='label'>Connected Accounts</p>
          <div className='login-method-content'>
            <img src={googlefiticon} alt="Google Fit Icon" className='logo-google-fit' />
            <div className='meta'>
              <p className='meta-label'>Google Fit Account</p>
              <p className='meta-email'>sarah.wilson@example.com</p>
            </div>
          </div>
        </div>
        <div className='security-method'>
          <p className='label'>Security Accounts</p>
          <div className='security-method-content'>
            <div className='item'>
              <div className='item-meta'>
                <LockClockOutlinedIcon className='logo-lock' />
                <p className='meta-label'>Password Reset Required</p>
              </div>
              <p className='item-active active'>Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatHistoryLog() {
  return (
    <div className='chat-history-log'>
      <p className='label'>Chat History</p>
      <div className='chat-history-log-content'>
        <div className='session-item'>
          <p className='session-value session-value-expert'>200</p>
          <p className='session-label'>with Experts</p>
          <p className='session-viewmore'>View more</p>
        </div>
        <div className='session-item'>
          <p className='session-value session-value-ai'>200</p>
          <p className='session-label'>with AI</p>
          <p className='session-viewmore'>View more</p>
        </div>
      </div>
    </div>
  )
}

export default function UsersDetailPage() {

  const [udeBasicProfile, setUdeBasicProfile] = useState(false)

  return (
    <div className="users-detail-page">
      <CommonBreadcrumb items={[
        { name: 'Dashboard', link: '/dashboard' },
        { name: 'Users', link: '/users' },
        { name: 'Sarah Wilson' }
      ]} />
      <div className='profile-card'>
        <div className='left'>
          <Avatar src={logo} className='avatar' />
          <div>
            <div className='name'>Sarah Wilson<span className='status'>Active</span></div>
            <div className='role'>Premium Member</div>
            <div className='id'>ID: 12345</div>
          </div>
        </div>
        <div className='right'>
          <Button variant='contained' startIcon={<DoNotDisturbAltIcon />} className='btn-suspend'>Suspend</Button>
          <Button variant='contained' startIcon={<DeleteOutlineIcon />} className='btn-delete'>Delete</Button>
        </div>
      </div>
      <div className='rows'>
        <div className='row'>
          <PersonalDetails onUdeBasicProfile={() => setUdeBasicProfile(true)} />
          <CommunityActivity />
          <ChatHistoryLog />
        </div>
        <div className='row'>
          <ConnectedDevices />
          <LoginInformation />
        </div>
      </div>
      <UDEBasicProfile open={udeBasicProfile} onClose={() => setUdeBasicProfile(false)} />
    </div>
  );
}
