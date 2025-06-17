import { useState, useEffect } from "react";
import { 
  Button,
  Chip,
  Grid,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton
} from "@mui/material";
import CommonDialog from "@components/commons/CommonDialog";
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Event as EventIcon,
  Paid as PointsIcon,
  Info as ReasonIcon
} from "@mui/icons-material";
import { format } from 'date-fns';
import { aget } from '@components/utils/util_axios';
import './UDEPointsHistory.scss';

interface PointsHistoryItem {
  id: string;
  user_id: string;
  point_earn: number;
  reason: string;
  created_at: string;
  PointReason: {
    type: string;
    description: string;
  };
}

interface PointsHistoryResponse {
  data: PointsHistoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UDEPointsHistoryProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

function PointsHistoryTable({ data }: { data: PointsHistoryItem[] }) {
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd hh:mm a');
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'signup':
        return 'primary';
      case 'purchase':
        return 'secondary';
      case 'referral':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell align="right">Points</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <EventIcon color="action" sx={{ mr: 1, fontSize: '1rem' }} />
                  {formatDateTime(item.created_at)}
                </Box>
              </TableCell>
              <TableCell align="right">
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  <PointsIcon color="action" sx={{ mr: 1, fontSize: '1rem' }} />
                  {item.point_earn}
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={item.reason} 
                  size="small" 
                  color={getReasonColor(item.reason)}
                />
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <ReasonIcon color="action" sx={{ mr: 1, fontSize: '1rem' }} />
                  {item.PointReason.description}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function UDEPointsHistory({ 
  open, 
  onClose, 
  userId 
}: UDEPointsHistoryProps) {
  const [history, setHistory] = useState<PointsHistoryItem[]>([]);
  const [meta, setMeta] = useState<PointsHistoryResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPointsHistory = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await aget<{ data: PointsHistoryResponse }>(
        `/user-points/user/${userId}/history?limit=100`
      );
      
      if (response.data.status === 'success') {
        setHistory(response.data.data.data);
        setMeta(response.data.data.meta);
      } else {
        setError(response.data.message || 'Failed to fetch point history');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch point history. Please try again.');
      console.error('Error fetching point history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && userId) {
      fetchPointsHistory();
    }
  }, [open, userId]);

  const handleRefresh = () => {
    fetchPointsHistory();
  };

  return (
    <CommonDialog
      className="ude-point-history-dialog"
      title="User Point History"
      maxWidth="lg"
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
            Close
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      }
    >
      {error && (
        <Box className="error-message">
          {error}
        </Box>
      )}

      <Box className="section-header">
        <PointsIcon className="section-icon" />
        <h3>Point History</h3>
        {meta && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            Total: {meta.total} records
          </Typography>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <Typography>Loading point history...</Typography>
        </Box>
      ) : history.length > 0 ? (
        <PointsHistoryTable data={history} />
      ) : (
        <Box display="flex" justifyContent="center" py={4}>
          <Typography>No point history found</Typography>
        </Box>
      )}
    </CommonDialog>
  );
}