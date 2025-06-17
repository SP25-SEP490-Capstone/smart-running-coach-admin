import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  CircularProgress,
  Paper,
  Grid,
  Divider,
  MenuItem,
  Select,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  IconButton,
  Pagination
} from "@mui/material";
import { 
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage 
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, subDays, subMonths, subYears, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { aget } from '@components/utils/util_axios';
import './UserDetailRecordActiveCalories.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ActiveCaloriesRecord {
  id: string;
  calories: number;
  start_time: string;
  end_time: string;
  data_origin: string | null;
}

interface ActiveCaloriesResponse {
  data: ActiveCaloriesRecord[];
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
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
          return `${context.dataset.label}: ${context.raw.toFixed(2)} kcal`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Calories (kcal)'
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

interface UserDetailRecordActiveCaloriesProps {
  userId: string;
}

export default function UserDetailRecordActiveCalories({ userId }: UserDetailRecordActiveCaloriesProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<ActiveCaloriesRecord[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [summary, setSummary] = useState<{
    total: number;
    average: number;
    max: number;
    min: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchActiveCaloriesData();
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

  const fetchActiveCaloriesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = getStartDate();
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await aget<ActiveCaloriesResponse>(
        `/record-active-calories/admin/${userId}?startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`
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
      console.error('Error fetching active calories data:', err);
      setError(err.message || 'Failed to fetch active calories data');
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
        return subDays(date, 7);
    }
  };

  const processChartData = (data: ActiveCaloriesRecord[]) => {
    if (!data.length) {
      setChartData(null);
      return;
    }

    const startDate = getStartDate();
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);

    let labels: string[] = [];
    let periods: Date[] = [];

    switch (timeRange) {
      case 'day':
        periods = eachDayOfInterval({ start: startDate, end: endDate });
        labels = periods.map(date => format(date, 'HH:mm'));
        break;
      case 'week':
        periods = eachDayOfInterval({ start: startDate, end: endDate });
        labels = periods.map(date => format(date, 'EEE'));
        break;
      case 'month':
        periods = eachDayOfInterval({ start: startDate, end: endDate });
        labels = periods.map(date => format(date, 'MMM dd'));
        break;
      case 'year':
        periods = eachMonthOfInterval({ start: startDate, end: endDate });
        labels = periods.map(date => format(date, 'MMM yyyy'));
        break;
    }

    const dataPoints = periods.map(period => {
      const periodStart = new Date(period);
      const periodEnd = new Date(period);

      if (timeRange === 'day') {
        periodEnd.setHours(period.getHours() + 1);
      } else if (timeRange === 'week' || timeRange === 'month') {
        periodEnd.setDate(period.getDate() + 1);
      } else if (timeRange === 'year') {
        periodEnd.setMonth(period.getMonth() + 1);
      }

      const recordsInPeriod = data.filter(record => {
        const recordDate = new Date(record.start_time);
        return recordDate >= periodStart && recordDate < periodEnd;
      });

      return recordsInPeriod.reduce((sum, record) => sum + record.calories, 0);
    });

    setChartData({
      labels,
      datasets: [{
        label: 'Active Calories Burned',
        data: dataPoints,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    });
  };

  const calculateSummary = (data: ActiveCaloriesRecord[]) => {
    if (!data.length) {
      setSummary(null);
      return;
    }

    const calories = data.map(record => record.calories);
    const total = calories.reduce((sum, cal) => sum + cal, 0);
    const average = total / calories.length;
    const max = Math.max(...calories);
    const min = Math.min(...calories);

    setSummary({
      total: parseFloat(total.toFixed(2)),
      average: parseFloat(average.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      min: parseFloat(min.toFixed(2))
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
        if (direction === 'last') newDate.setDate(31); // Simplistic approach
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
        if (direction === 'first') newDate.setFullYear(2000); // Adjust as needed
        if (direction === 'last') newDate.setFullYear(2030); // Adjust as needed
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
    <Box className="user-detail-active-calories">
      <Typography variant="h5" gutterBottom>
        Active Calories Burned
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
            Loading active calories data...
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
                  <Typography variant="subtitle2">Total Calories</Typography>
                  <Typography variant="h4">{summary.total} kcal</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2">Average</Typography>
                  <Typography variant="h4">{summary.average} kcal</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2">Max</Typography>
                  <Typography variant="h4">{summary.max} kcal</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2">Min</Typography>
                  <Typography variant="h4">{summary.min} kcal</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {chartData ? (
            <Box className="chart-container" sx={{ mt: 3 }}>
              <Bar data={chartData} options={chartOptions} />
            </Box>
          ) : (
            <Typography variant="body1" sx={{ mt: 3 }}>
              No active calories data available for the selected period.
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
                      <th>Calories (kcal)</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map(record => (
                      <tr key={record.id}>
                        <td>{format(new Date(record.start_time), 'MMM dd, yyyy HH:mm')}</td>
                        <td>{format(new Date(record.end_time), 'MMM dd, yyyy HH:mm')}</td>
                        <td>{record.calories.toFixed(2)}</td>
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