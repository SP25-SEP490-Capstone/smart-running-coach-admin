import { useState, useEffect } from "react";
import { 
  Button, 
  TextField, 
  MenuItem, 
  Select, 
  Chip, 
  FormControl, 
  InputLabel,
  Grid,
  Box,
  Divider
} from "@mui/material";
import CommonDialog from "@components/commons/CommonDialog";
import {
  Person as PersonIcon,
  Cake as CakeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Circle as CircleIcon,
  Event as EventIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Lock as LockIcon
} from "@mui/icons-material";
import { format } from 'date-fns';
import { aput } from '@components/utils/util_axios';
import './UDEBasicProfile.scss';

interface UserData {
  id: string;
  username: string;
  email: string;
  name: string;
  birth_date: string | null;
  gender: string | null;
  points: number;
  user_level: string;
  is_active: boolean;
  address1: string | null;
  address2: string | null;
  zip_code: string | null;
  phone_number: string | null;
  phone_code: string | null;
  verification_code: string | null;
  isResetPassAllowed: boolean;
  created_at: string;
  updated_at: string | null;
  roles: string[];
}

interface UDEBasicProfileProps {
  open: boolean;
  onClose: () => void;
  user: UserData | null;
  onSave: (updatedUser: UserData) => void;
  onResetPassword?: () => void;
}

function PersonalDetails({ 
  user, 
  onChange,
  onResetPassword
}: { 
  user: UserData, 
  onChange: (field: string, value: any) => void,
  onResetPassword?: () => void
}) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'yyyy-MM-dd');
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'yyyy-MM-dd hh:mm a');
  };

  return (
    <Box className='ude-basic-profile-personal-details'>
      <Box className="section-header">
        <PersonIcon className="section-icon" />
        <h3>Personal Details</h3>
      </Box>
      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={3}>
        {/* Row 1 */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={user.username || ''}
            onChange={(e) => onChange('username', e.target.value)}
            InputProps={{
              startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Full Name"
            variant="outlined"
            fullWidth
            value={user.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            InputProps={{
              startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Birth Date"
            type="date"
            variant="outlined"
            fullWidth
            value={formatDate(user.birth_date)}
            onChange={(e) => onChange('birth_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <CakeIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Gender</InputLabel>
            <Select
              label="Gender"
              value={user.gender?.toLowerCase() || ''}
              onChange={(e) => onChange('gender', e.target.value)}
              startAdornment={<CircleIcon color="action" sx={{ mr: 1 }} />}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Row 3 */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            value={user.email}
            onChange={(e) => onChange('email', e.target.value)}
            InputProps={{
              startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneIcon color="action" />
            <TextField
              label="Phone Code"
              variant="outlined"
              value={user.phone_code || ''}
              onChange={(e) => onChange('phone_code', e.target.value)}
              sx={{ width: '80px' }}
            />
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              value={user.phone_number || ''}
              onChange={(e) => onChange('phone_number', e.target.value)}
            />
          </Box>
        </Grid>

        {/* Address Section */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" mb={1}>
            <HomeIcon color="action" sx={{ mr: 1 }} />
            <h4>Address</h4>
          </Box>
          <TextField
            label="Address Line 1"
            variant="outlined"
            fullWidth
            value={user.address1 || ''}
            onChange={(e) => onChange('address1', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Address Line 2"
            variant="outlined"
            fullWidth
            value={user.address2 || ''}
            onChange={(e) => onChange('address2', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Zip Code"
            variant="outlined"
            value={user.zip_code || ''}
            onChange={(e) => onChange('zip_code', e.target.value)}
            sx={{ width: '150px' }}
          />
        </Grid>

        {/* Status and Roles */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={user.is_active ? 'active' : 'inactive'}
              onChange={(e) => onChange('is_active', e.target.value === 'active')}
              startAdornment={<CircleIcon color="action" sx={{ mr: 1 }} />}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
            <BadgeIcon color="action" sx={{ mr: 1 }} />
            {user.roles.map(role => (
              <Chip
                key={role}
                label={role.charAt(0).toUpperCase() + role.slice(1)}
                color={
                  role === 'admin' ? 'primary' : 
                  role === 'expert' ? 'secondary' : 
                  'default'
                }
                size="small"
              />
            ))}
          </Box>
        </Grid>

        {/* Read-only Fields */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Points"
            variant="outlined"
            type="number"
            fullWidth
            value={user.points || 0}
            disabled
            InputProps={{
              startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="User Level"
            variant="outlined"
            fullWidth
            value={user.user_level || ''}
            disabled
            InputProps={{
              startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>

        {/* Actions */}
        <Grid item xs={12} sm={6}>
          <Button 
            variant="outlined" 
            onClick={onResetPassword}
            startIcon={<LockIcon />}
            fullWidth
          >
            Reset Password
          </Button>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Created At"
            variant="outlined"
            fullWidth
            value={formatDateTime(user.created_at)}
            disabled
            InputProps={{
              startAdornment: <EventIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
        </Grid>
        
        {user.updated_at && (
          <Grid item xs={12}>
            <TextField
              label="Last Updated"
              variant="outlined"
              fullWidth
              value={formatDateTime(user.updated_at)}
              disabled
              InputProps={{
                startAdornment: <EventIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default function UDEBasicProfile({ 
  open, 
  onClose, 
  user, 
  onSave,
  onResetPassword 
}: UDEBasicProfileProps) {
  const [editedUser, setEditedUser] = useState<UserData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
    }
  }, [user]);

  const handleChange = (field: string, value: any) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [field]: value
      });
    }
  };

  const handleReset = () => {
    if (user) {
      setEditedUser({ ...user });
    }
    setError(null);
  };

  const handleSave = async () => {
    if (!editedUser) return;

    setIsSaving(true);
    setError(null);

    try {
      const updateData = {
        username: editedUser.username,
        email: editedUser.email,
        name: editedUser.name,
        birth_date: editedUser.birth_date,
        gender: editedUser.gender?.toLowerCase(),
        address1: editedUser.address1,
        address2: editedUser.address2,
        zip_code: editedUser.zip_code,
        phone_code: editedUser.phone_code,
        phone_number: editedUser.phone_number,
        is_active: editedUser.is_active,
      };

      const response = await aput(`/users/admin/${editedUser.id}`, updateData);
      
      console.log(response.data)
      if (response.data.status === 'success') {
        onSave(response.data.data);
        onClose();
      } else {
        setError(response.data.message || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user. Please try again.');
      console.error('Error updating user:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!editedUser) {
    return null;
  }

  return (
    <CommonDialog
      className="ude-basic-profile-dialog"
      title="Edit User Details"
      maxWidth="md"
      open={open}
      onClose={onClose}
      footer={
        <Box className="dialog-footer">
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<CloseIcon />} 
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleReset}
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      }
    >
      {error && (
        <Box className="error-message">
          {error}
        </Box>
      )}
      <PersonalDetails 
        user={editedUser} 
        onChange={handleChange}
        onResetPassword={onResetPassword}
      />
    </CommonDialog>
  );
}