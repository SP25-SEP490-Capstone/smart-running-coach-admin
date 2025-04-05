import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  MenuItem,
  Select,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  IconButton,
  Pagination,
  CircularProgress
} from "@mui/material";
import { 
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage 
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, subDays, subMonths, subYears, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { aget } from '@components/utils/util_axios';
import './UserDetailRecordHeartRate.scss';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

interface HeartRateRecord {
  id: string;
  beats_per_minute: number;
  start_time: string;
  end_time: string;
  data_origin: string | null;
}

interface HeartRateResponse {
  data: HeartRateRecord[];
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    pointRadius: number;
  }[];
}

const timeRanges = {
  day: 1,
  week: 7,
  month: 30,
  year: 365
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return `${context.dataset.label}: ${context.raw} bpm`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: 'Heart Rate (bpm)'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Time Period'
      }
    }
  }
};

const RECORDS_PER_PAGE = 10;

interface HeartRateRecordProps {
  userId: string;
}

export default function UserDetailRecordHeartRate({ userId }: HeartRateRecordProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<HeartRateRecord[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [summary, setSummary] = useState<{
    average: number;
    max: number;
    min: number;
    resting: number | null;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHeartRateData();
  }, [userId, timeRange, selectedDate]);

  useEffect(() => {
    if (records.length > 0) {
      const pages = Math.ceil(records.length / RECORDS_PER_PAGE);
      setTotalPages(pages);
      if (currentPage > pages) {
        setCurrentPage(1);
      }
    }
  }, [records, currentPage]);

  const fetchHeartRateData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = getStartDate();
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await aget<HeartRateResponse>(
        `/record-heart-rate/admin/${userId}?startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`
      );

      if (response.data && Array.isArray(response.data.data)) {
        setRecords(response.data.data);
        processChartData(response.data.data);
        calculateSummary(response.data.data);
      } else {
        setRecords([]);
        setChartData(null);
        setSummary(null);
      }
    } catch (err: any) {
      console.error('Error fetching heart rate data:', err);
      setError(err.message || 'Failed to fetch heart rate data');
      setRecords([]);
      setChartData(null);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (): Date => {
    const date = new Date(selectedDate);
    switch (timeRange) {
      case 'day':
        return subDays(date, 1);
      case 'week':
        return subDays(date, 7);
      case 'month':
        return subMonths(date, 1);
      case 'year':
        return subYears(date, 1);
      default:
        return subDays(date, 1);
    }
  };

  const processChartData = (data: HeartRateRecord[]) => {
    if (!data.length) {
      setChartData(null);
      return;
    }
  
    const startDate = getStartDate();
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);
  
    // Sort records by time
    const sortedData = [...data].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  
    let labels: string[] = [];
    let dataPoints: number[] = [];
  
    switch (timeRange) {
      case 'day':
        // For day view, show hourly data points
        labels = sortedData.map(record => format(new Date(record.start_time), 'HH:mm'));
        dataPoints = sortedData.map(record => record.beats_per_minute);
        break;
      case 'week':
        // Group by day for week view
        const daysOfWeek = eachDayOfInterval({ start: startDate, end: endDate });
        labels = daysOfWeek.map(date => format(date, 'EEE'));
        dataPoints = daysOfWeek.map(day => {
          const dayStart = new Date(day);
          const dayEnd = new Date(day);
          dayEnd.setDate(dayEnd.getDate() + 1);
          
          const dayRecords = sortedData.filter(record => {
            const recordDate = new Date(record.start_time);
            return recordDate >= dayStart && recordDate < dayEnd;
          });
          
          if (dayRecords.length === 0) return 0;
          const sum = dayRecords.reduce((sum, record) => sum + record.beats_per_minute, 0);
          return Math.round(sum / dayRecords.length);
        });
        break;
      case 'month':
        // Group by day for month view
        const daysOfMonth = eachDayOfInterval({ start: startDate, end: endDate });
        labels = daysOfMonth.map(date => format(date, 'MMM dd'));
        dataPoints = daysOfMonth.map(day => {
          const dayStart = new Date(day);
          const dayEnd = new Date(day);
          dayEnd.setDate(dayEnd.getDate() + 1);
          
          const dayRecords = sortedData.filter(record => {
            const recordDate = new Date(record.start_time);
            return recordDate >= dayStart && recordDate < dayEnd;
          });
          
          if (dayRecords.length === 0) return 0;
          const sum = dayRecords.reduce((sum, record) => sum + record.beats_per_minute, 0);
          return Math.round(sum / dayRecords.length);
        });
        break;
      case 'year':
        // Group by month for year view
        const monthsOfYear = eachMonthOfInterval({ start: startDate, end: endDate });
        labels = monthsOfYear.map(date => format(date, 'MMM yyyy'));
        dataPoints = monthsOfYear.map(month => {
          const monthStart = new Date(month);
          const monthEnd = new Date(month);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          
          const monthRecords = sortedData.filter(record => {
            const recordDate = new Date(record.start_time);
            return recordDate >= monthStart && recordDate < monthEnd;
          });
          
          if (monthRecords.length === 0) return 0;
          const sum = monthRecords.reduce((sum, record) => sum + record.beats_per_minute, 0);
          return Math.round(sum / monthRecords.length);
        });
        break;
    }
  
    setChartData({
      labels,
      datasets: [{
        label: 'Heart Rate',
        data: dataPoints,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    });
  };

  const calculateSummary = (data: HeartRateRecord[]) => {
    if (!data.length) {
      setSummary(null);
      return;
    }

    const rates = data.map(record => record.beats_per_minute);
    const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const max = Math.max(...rates);
    const min = Math.min(...rates);

    // In a real app, you might fetch resting heart rate separately
    const resting = null; // This would come from RecordRestingHeartRate table

    setSummary({
      average: Math.round(average),
      max: Math.round(max),
      min: Math.round(min),
      resting
    });
  };

  const handleTimeRangeChange = (event: SelectChangeEvent<'day' | 'week' | 'month' | 'year'>) => {
    setTimeRange(event.target.value as 'day' | 'week' | 'month' | 'year');
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const navigateDate = (direction: 'prev' | 'next' | 'first' | 'last') => {
    const newDate = new Date(selectedDate);
    switch (timeRange) {
      case 'day':
        if (direction === 'prev') newDate.setDate(newDate.getDate() - 1);
        if (direction === 'next') newDate.setDate(newDate.getDate() + 1);
        if (direction === 'first') newDate.setDate(1);
        if (direction === 'last') newDate.setDate(31);
        break;
      case 'week':
        if (direction === 'prev') newDate.setDate(newDate.getDate() - 7);
        if (direction === 'next') newDate.setDate(newDate.getDate() + 7);
        if (direction === 'first') newDate.setDate(1);
        if (direction === 'last') newDate.setDate(31);
        break;
      case 'month':
        if (direction === 'prev') newDate.setMonth(newDate.getMonth() - 1);
        if (direction === 'next') newDate.setMonth(newDate.getMonth() + 1);
        if (direction === 'first') newDate.setMonth(0);
        if (direction === 'last') newDate.setMonth(11);
        break;
      case 'year':
        if (direction === 'prev') newDate.setFullYear(newDate.getFullYear() - 1);
        if (direction === 'next') newDate.setFullYear(newDate.getFullYear() + 1);
        if (direction === 'first') newDate.setFullYear(2000);
        if (direction === 'last') newDate.setFullYear(2030);
        break;
    }
    setSelectedDate(newDate);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const paginatedRecords = records.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  return (
    <Box className="user-detail-record-heart-rate">
      <Typography variant="h5" gutterBottom>
        Heart Rate Records
      </Typography>

      <Paper elevation={2} className="controls-paper">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={handleTimeRangeChange}
                label="Time Range"
                disabled={loading}
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              disabled={loading}
              format={timeRange === 'year' ? 'yyyy' : timeRange === 'month' ? 'MMM yyyy' : 'MMM dd, yyyy'}
              views={
                timeRange === 'year' ? ['year'] : 
                timeRange === 'month' ? ['year', 'month'] : 
                ['year', 'month', 'day']
              }
              sx={{ width: '100%' }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box display="flex" justifyContent="space-between">
              <IconButton 
                onClick={() => navigateDate('first')}
                disabled={loading}
                size="small"
              >
                <FirstPage />
              </IconButton>
              <IconButton 
                onClick={() => navigateDate('prev')}
                disabled={loading}
                size="small"
              >
                <ChevronLeft />
              </IconButton>
              <IconButton 
                onClick={() => navigateDate('next')}
                disabled={loading}
                size="small"
              >
                <ChevronRight />
              </IconButton>
              <IconButton 
                onClick={() => navigateDate('last')}
                disabled={loading}
                size="small"
              >
                <LastPage />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box className="loading-container">
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading heart rate data...
          </Typography>
        </Box>
      ) : error ? (
        <Typography color="error" className="error-message">
          {error}
        </Typography>
      ) : (
        <>
          {summary && (
            <Paper elevation={2} className="summary-paper" sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2">Average</Typography>
                  <Typography variant="h4">{summary.average} bpm</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2">Max</Typography>
                  <Typography variant="h4">{summary.max} bpm</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2">Min</Typography>
                  <Typography variant="h4">{summary.min} bpm</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2">Resting</Typography>
                  <Typography variant="h4">
                    {summary.resting ? `${summary.resting} bpm` : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {chartData ? (
            <Box className="chart-container" sx={{ mt: 3 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          ) : (
            <Typography variant="body1" sx={{ mt: 3 }}>
              No heart rate data available for the selected period.
            </Typography>
          )}

          {records.length > 0 && (
            <Box className="records-table" sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Detailed Records
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Heart Rate (bpm)</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map(record => (
                      <tr key={record.id}>
                        <td>{format(new Date(record.start_time), 'MMM dd, yyyy HH:mm')}</td>
                        <td>{format(new Date(record.end_time), 'MMM dd, yyyy HH:mm')}</td>
                        <td>{record.beats_per_minute}</td>
                        <td>{record.data_origin || 'Unknown'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="small"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}