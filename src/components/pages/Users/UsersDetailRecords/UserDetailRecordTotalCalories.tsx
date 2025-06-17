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
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, subDays, subMonths, subYears, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import { aget } from '@components/utils/util_axios';
import './UserDetailRecordTotalCalories.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TotalCaloriesRecord {
  id: string;
  calories: number;
  start_time: string;
  end_time: string;
  data_origin: string | null;
}

interface TotalCaloriesResponse {
  data: TotalCaloriesRecord[];
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
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return `${context.dataset.label}: ${context.raw.toFixed(1)} kcal`;
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

interface UserDetailRecordTotalCaloriesProps {
  userId: string;
}

export default function UserDetailRecordTotalCalories({ userId }: UserDetailRecordTotalCaloriesProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<TotalCaloriesRecord[]>([]);
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
    fetchTotalCaloriesData();
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

  const fetchTotalCaloriesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = getStartDate();
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await aget<TotalCaloriesResponse>(
        `/record-total-calories/admin/${userId}?startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`
      );

      if (response.data && Array.isArray(response.data.data)) {
        // Convert calories from joules to kcal (1 kcal = 4184 joules)
        const convertedRecords = response.data.data.map(record => ({
          ...record,
          calories: record.calories / 4184 // Convert to kcal
        }));
        setRecords(convertedRecords);
        processChartData(convertedRecords);
        calculateSummary(convertedRecords);
      } else {
        setRecords([]);
        setChartData(null);
        setSummary(null);
      }
    } catch (err: any) {
      console.error('Error fetching total calories data:', err);
      setError(err.message || 'Failed to fetch total calories data');
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

  const processChartData = (data: TotalCaloriesRecord[]) => {
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
        dataPoints = sortedData.map(record => record.calories);
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
          
          return dayRecords.reduce((sum, record) => sum + record.calories, 0);
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
          
          return dayRecords.reduce((sum, record) => sum + record.calories, 0);
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
          
          return monthRecords.reduce((sum, record) => sum + record.calories, 0);
        });
        break;
    }

    setChartData({
      labels,
      datasets: [{
        label: 'Calories Burned',
        data: dataPoints,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }]
    });
  };

  const calculateSummary = (data: TotalCaloriesRecord[]) => {
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
      total: parseFloat(total.toFixed(1)),
      average: parseFloat(average.toFixed(1)),
      max: parseFloat(max.toFixed(1)),
      min: parseFloat(min.toFixed(1))
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
    <Box className="user-detail-record-total-calories">
      <Typography variant="h5" gutterBottom>
        Total Calories Burned
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
            Loading calories data...
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
              <div className="chart-wrapper">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ mt: 3 }}>
              No calories data available for the selected period.
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
                        <td>{record.calories.toFixed(1)}</td>
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