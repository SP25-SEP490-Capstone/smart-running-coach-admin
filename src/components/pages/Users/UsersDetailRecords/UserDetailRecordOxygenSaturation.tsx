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
import './UserDetailRecordOxygenSaturation.scss';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

interface OxygenSaturationRecord {
  id: string;
  percentage: number;
  time: string | null;
  start_time: string | null;
  end_time: string | null;
  data_origin: string | null;
}

interface OxygenSaturationResponse {
  data: OxygenSaturationRecord[];
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
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return `${context.dataset.label}: ${context.raw}%`;
        }
      }
    }
  },
  scales: {
    y: {
      min: 80,
      max: 100,
      title: {
        display: true,
        text: 'Oxygen Saturation (%)'
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

interface UserDetailRecordOxygenSaturationProps {
  userId: string;
}

export default function UserDetailRecordOxygenSaturation({ userId }: UserDetailRecordOxygenSaturationProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<OxygenSaturationRecord[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [summary, setSummary] = useState<{
    average: number;
    max: number;
    min: number;
    latest: number | null;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOxygenSaturationData();
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

  const fetchOxygenSaturationData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = getStartDate();
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await aget<OxygenSaturationResponse>(
        `/record-oxygen-saturation/admin/${userId}?startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`
      );

      if (response.data && Array.isArray(response.data.data)) {
        const validRecords = response.data.data.filter(record => 
          record.percentage !== null && record.percentage >= 0 && record.percentage <= 100
        );
        setRecords(validRecords);
        processChartData(validRecords);
        calculateSummary(validRecords);
      } else {
        setRecords([]);
        setChartData(null);
        setSummary(null);
      }
    } catch (err: any) {
      console.error('Error fetching oxygen saturation data:', err);
      setError(err.message || 'Failed to fetch oxygen saturation data');
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

  const processChartData = (data: OxygenSaturationRecord[]) => {
    if (!data.length) {
      setChartData(null);
      return;
    }

    const startDate = getStartDate();
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);

    // Sort records by time
    const sortedData = [...data].sort((a, b) => {
      const timeA = a.time ? new Date(a.time) : a.start_time ? new Date(a.start_time) : new Date(0);
      const timeB = b.time ? new Date(b.time) : b.start_time ? new Date(b.start_time) : new Date(0);
      return timeA.getTime() - timeB.getTime();
    });

    let labels: string[] = [];
    let dataPoints: number[] = [];

    switch (timeRange) {
      case 'day':
        // For day view, show all readings with time labels
        labels = sortedData.map(record => {
          const recordTime = record.time ? new Date(record.time) : 
                           record.start_time ? new Date(record.start_time) : 
                           new Date(0);
          return format(recordTime, 'HH:mm');
        });
        dataPoints = sortedData.map(record => record.percentage);
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
            const recordTime = record.time ? new Date(record.time) : 
                             record.start_time ? new Date(record.start_time) : 
                             new Date(0);
            return recordTime >= dayStart && recordTime < dayEnd;
          });
          
          if (dayRecords.length === 0) return 0;
          const sum = dayRecords.reduce((sum, record) => sum + record.percentage, 0);
          return sum / dayRecords.length;
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
            const recordTime = record.time ? new Date(record.time) : 
                             record.start_time ? new Date(record.start_time) : 
                             new Date(0);
            return recordTime >= dayStart && recordTime < dayEnd;
          });
          
          if (dayRecords.length === 0) return 0;
          const sum = dayRecords.reduce((sum, record) => sum + record.percentage, 0);
          return sum / dayRecords.length;
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
            const recordTime = record.time ? new Date(record.time) : 
                             record.start_time ? new Date(record.start_time) : 
                             new Date(0);
            return recordTime >= monthStart && recordTime < monthEnd;
          });
          
          if (monthRecords.length === 0) return 0;
          const sum = monthRecords.reduce((sum, record) => sum + record.percentage, 0);
          return sum / monthRecords.length;
        });
        break;
    }

    setChartData({
      labels,
      datasets: [{
        label: 'Oxygen Saturation',
        data: dataPoints,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    });
  };

  const calculateSummary = (data: OxygenSaturationRecord[]) => {
    if (!data.length) {
      setSummary(null);
      return;
    }

    const percentages = data.map(record => record.percentage);
    const average = percentages.reduce((sum, perc) => sum + perc, 0) / percentages.length;
    const max = Math.max(...percentages);
    const min = Math.min(...percentages);
    const latest = data[data.length - 1].percentage;

    setSummary({
      average: parseFloat(average.toFixed(1)),
      max: parseFloat(max.toFixed(1)),
      min: parseFloat(min.toFixed(1)),
      latest: parseFloat(latest.toFixed(1))
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
    <Box className="user-detail-record-oxygen-saturation">
      <Typography variant="h5" gutterBottom>
        Oxygen Saturation Records
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
            Loading oxygen saturation data...
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
                  <Typography variant="h4">{summary.average}%</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2">Max</Typography>
                  <Typography variant="h4">{summary.max}%</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2">Min</Typography>
                  <Typography variant="h4">{summary.min}%</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2">Latest</Typography>
                  <Typography variant="h4">{summary.latest}%</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {chartData ? (
            <Box className="chart-container" sx={{ mt: 3 }}>
              <div className="chart-wrapper">
                <Line data={chartData} options={chartOptions} />
              </div>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ mt: 3 }}>
              No oxygen saturation data available for the selected period.
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
                      <th>Time</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Oxygen Saturation (%)</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map(record => (
                      <tr key={record.id}>
                        <td>{record.time ? format(new Date(record.time), 'MMM dd, yyyy HH:mm') : 'N/A'}</td>
                        <td>{record.start_time ? format(new Date(record.start_time), 'MMM dd, yyyy HH:mm') : 'N/A'}</td>
                        <td>{record.end_time ? format(new Date(record.end_time), 'MMM dd, yyyy HH:mm') : 'N/A'}</td>
                        <td>{record.percentage}</td>
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