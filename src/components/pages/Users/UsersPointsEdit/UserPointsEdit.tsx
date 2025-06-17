import { useState, useEffect } from "react";
import {
  Button,
  Grid,
  Box,
  Divider,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert,
  CircularProgress
} from "@mui/material";
import CommonDialog from "@components/commons/CommonDialog";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon
} from "@mui/icons-material";
import { aget, apost } from '@components/utils/util_axios';
import './UserPointsEdit.scss';

interface PointReason {
  type: string;
  description: string;
}

interface PointReasonsResponse {
  data: PointReason[];
}

interface UserPointsEditProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onPointsUpdated: () => void;
}

export default function UserPointsEdit({ 
  open, 
  onClose, 
  userId,
  onPointsUpdated
}: UserPointsEditProps) {
  const [pointReasons, setPointReasons] = useState<PointReason[]>([]);
  const [action, setAction] = useState<'add' | 'remove'>('add');
  const [points, setPoints] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchPointReasons();
      resetForm();
    }
  }, [open]);

  const fetchPointReasons = async () => {
    try {
      setPointReasons([
        { type: 'daily_login', description: 'Points for daily login' },
        { type: 'completed_run', description: 'Points for completing a run' },
        { type: 'personal_record', description: 'Points for setting a personal record' },
        { type: 'social_share', description: 'Points for sharing on social media' },
        { type: 'challenge_completed', description: 'Points for completing a challenge' },
        { type: 'other', description: 'Points for miscellaneous activities' },
      ]);
    } catch (err) {
      console.error('Error fetching point reasons:', err);
    }
  };

  const resetForm = () => {
    setAction('add');
    setPoints('');
    setReason('');
    setDescription('');
    setError(null);
    setSuccess(null);
  };

  const handleActionChange = (e: SelectChangeEvent<'add' | 'remove'>) => {
    setAction(e.target.value as 'add' | 'remove');
  };

  const handleReasonChange = (e: SelectChangeEvent<string>) => {
    const selectedReason = e.target.value;
    setReason(selectedReason);
    
    const foundReason = pointReasons.find(r => r.type === selectedReason);
    setDescription(foundReason?.description || '');
  };

  const validatePoints = (value: string) => {
    if (!value) return 'Points are required';
    const num = parseInt(value);
    if (isNaN(num)) return 'Must be a valid number';
    if (num <= 0) return 'Must be greater than 0';
    return null;
  };

  const handleSubmit = async () => {
    const pointsError = validatePoints(points);
    if (pointsError) {
      setError(pointsError);
      return;
    }

    if (!reason) {
      setError('Please select a reason');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = action === 'add' ? 'add' : 'remove';
      const response = await apost<{ data: any }>(
        `/user-points/user/${userId}/${endpoint}`,
        {
          points: parseInt(points),
          reasonType: reason
        }
      );

      if (response.data.status === 'success') {
        setSuccess(`Points ${action === 'add' ? 'added' : 'removed'} successfully!`);
        onPointsUpdated();
        resetForm();
      } else {
        setError(response.data.message || `Failed to ${action} points`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} points. Please try again.`);
      console.error(`Error ${action}ing points:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommonDialog
      className="user-points-edit-dialog"
      title="Edit User Points"
      maxWidth="sm"
      open={open}
      onClose={onClose}
      footer={
        <Box className="dialog-footer">
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<CloseIcon />} 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color={action === 'add' ? 'success' : 'error'}
            startIcon={action === 'add' ? <AddIcon /> : <RemoveIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : action === 'add' ? 'Add Points' : 'Remove Points'}
          </Button>
        </Box>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Action</InputLabel>
            <Select
              value={action}
              onChange={handleActionChange}
              label="Action"
              disabled={loading}
            >
              <MenuItem value="add">Add Points</MenuItem>
              <MenuItem value="remove">Remove Points</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Points"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            disabled={loading}
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Reason</InputLabel>
            <Select
              value={reason}
              onChange={handleReasonChange}
              label="Reason"
              disabled={loading}
            >
              {pointReasons.map((reason) => (
                <MenuItem key={reason.type} value={reason.type}>
                  {`${reason.type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())} - ${reason.description}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {description && (
          <Grid item xs={12}>
            <Box className="description-box">
              <InfoIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="body2">{description}</Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </CommonDialog>
  );
}