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
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme
} from "@mui/material";
import { 
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage,
  Bedtime,
  AccessTime,
  Hotel,
  Visibility,
  Brightness5,
  DirectionsWalk,
  HelpOutline
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { format, subDays, subMonths, subYears, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { aget } from '@components/utils/util_axios';
import './UserDetailRecordSleepSession.scss';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SleepStage {
  stage: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

interface SleepSession {
  record_id: string;
  data_origin: string | null;
  user_id: string;
  start_time: string;
  end_time: string;
  total_duration_hours: number;
  sleep_score: number | null;
  avg_heart_rate: number | null;
  avg_breathing: number | null;
  avg_spo2: number | null;
  stages: SleepStage[];
}

interface SleepResponse {
  data: SleepSession[];
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export const SleepType = {
  UNKNOWN: 0,
  AWAKE: 1,
  SLEEPING: 2,
  OUT_OF_BED: 3,
  LIGHT: 4,
  DEEP: 5,
  REM: 6,
  AWAKE_IN_BED: 7,
} as const;

export type SleepTypeValue = (typeof SleepType)[keyof typeof SleepType];

export function getNameFromSleepType(num: SleepTypeValue): string {
  switch (num) {
    case SleepType.UNKNOWN:
      return 'Unknown';
    case SleepType.AWAKE:
      return 'Awake';
    case SleepType.SLEEPING:
      return 'Sleeping';
    case SleepType.OUT_OF_BED:
      return 'Out of Bed';
    case SleepType.LIGHT:
      return 'Light Sleep';
    case SleepType.DEEP:
      return 'Deep Sleep';
    case SleepType.REM:
      return 'REM Sleep';
    case SleepType.AWAKE_IN_BED:
      return 'Awake in Bed';
    default:
      const matchedType = Object.entries(SleepType).find(([_, value]) => value === num);
      return matchedType 
        ? matchedType[0]
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
        : 'Unknown';
  }
}

export function getIconFromSleepType(num: SleepTypeValue) {
  switch (num) {
    case SleepType.AWAKE:
    case SleepType.AWAKE_IN_BED:
      return <Visibility />;
    case SleepType.LIGHT:
      return <Brightness5 />;
    case SleepType.DEEP:
      return <Hotel />;
    case SleepType.REM:
      return <Brightness5 />;
    case SleepType.OUT_OF_BED:
      return <DirectionsWalk />;
    case SleepType.SLEEPING:
      return <Bedtime />;
    case SleepType.UNKNOWN:
    default:
      return <HelpOutline />;
  }
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
      position: 'right' as const,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return `${context.label}: ${context.raw.toFixed(1)} hours`;
        }
      }
    }
  },
  cutout: '70%',
};

interface UserDetailRecordSleepSessionProps {
  userId: string;
}

export default function UserDetailRecordSleepSession({ userId }: UserDetailRecordSleepSessionProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [selectedSession, setSelectedSession] = useState<SleepSession | null>(null);
  const [groupedSessions, setGroupedSessions] = useState<Record<string, SleepSession[]>>({});

  const sleepTypeColors = {
    [SleepType.UNKNOWN]: theme.palette.grey[500],
    [SleepType.AWAKE]: theme.palette.error.main,
    [SleepType.SLEEPING]: theme.palette.primary.main,
    [SleepType.OUT_OF_BED]: theme.palette.warning.main,
    [SleepType.LIGHT]: theme.palette.info.light,
    [SleepType.DEEP]: theme.palette.info.dark,
    [SleepType.REM]: theme.palette.info.main,
    [SleepType.AWAKE_IN_BED]: theme.palette.error.light,
  };

  useEffect(() => {
    fetchSleepData();
  }, [userId, timeRange, selectedDate]);

  useEffect(() => {
    if (sessions.length > 0) {
      const grouped: Record<string, SleepSession[]> = {};
      
      sessions.forEach(session => {
        const dateKey = format(parseISO(session.start_time), 'MMMM do, yyyy');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(session);
      });
      
      setGroupedSessions(grouped);
      
      if (!selectedSession || !sessions.some(s => s.record_id === selectedSession.record_id)) {
        setSelectedSession(sessions[0]);
      }
    } else {
      setGroupedSessions({});
      setSelectedSession(null);
    }
  }, [sessions]);

  useEffect(() => {
    if (selectedSession) {
      updateChartData(selectedSession);
    } else {
      setChartData(null);
    }
  }, [selectedSession]);

  const fetchSleepData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = getStartDate();
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await aget<SleepResponse>(
        `/record-sleep-session/admin/${userId}?startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`
      );

      if (response.data && Array.isArray(response.data.data)) {
        setSessions(response.data.data);
      } else {
        setSessions([]);
      }
    } catch (err: any) {
      console.error('Error fetching sleep data:', err);
      setError(err.message || 'Failed to fetch sleep data');
      setSessions([]);
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

  const updateChartData = (session: SleepSession) => {
    const stageDurations: Record<number, number> = {
      [SleepType.UNKNOWN]: 0,
      [SleepType.AWAKE]: 0,
      [SleepType.SLEEPING]: 0,
      [SleepType.OUT_OF_BED]: 0,
      [SleepType.LIGHT]: 0,
      [SleepType.DEEP]: 0,
      [SleepType.REM]: 0,
      [SleepType.AWAKE_IN_BED]: 0,
    };
    
    session.stages.forEach(stage => {
      const hours = stage.duration_minutes / 60;
      stageDurations[stage.stage] += hours;
    });

    // Merge SLEEPING into LIGHT if both exist
    if (stageDurations[SleepType.SLEEPING] > 0 && stageDurations[SleepType.LIGHT] > 0) {
      stageDurations[SleepType.LIGHT] += stageDurations[SleepType.SLEEPING];
      stageDurations[SleepType.SLEEPING] = 0;
    }

    // Merge AWAKE and AWAKE_IN_BED if both exist
    if (stageDurations[SleepType.AWAKE] > 0 && stageDurations[SleepType.AWAKE_IN_BED] > 0) {
      stageDurations[SleepType.AWAKE] += stageDurations[SleepType.AWAKE_IN_BED];
      stageDurations[SleepType.AWAKE_IN_BED] = 0;
    }

    const activeStages = Object.entries(SleepType)
      .filter(([_, value]) => stageDurations[value as number] > 0)
      .sort((a, b) => stageDurations[b[1] as number] - stageDurations[a[1] as number]);

    const labels = activeStages.map(([key]) => getNameFromSleepType(key as any));
    const data = activeStages.map(([_, value]) => stageDurations[value as number]);
    const backgroundColors = activeStages.map(([_, value]) => sleepTypeColors[value as number]);

    setChartData({
      labels,
      datasets: [{
        label: 'Sleep Stages',
        data,
        backgroundColor: backgroundColors,
        borderColor: theme.palette.background.paper,
        borderWidth: 2
      }]
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

  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const formatTimeRange = (start: string, end: string) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    
    if (isSameDay(startDate, endDate)) {
      return `${format(startDate, 'MMM dd, yyyy')} • ${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
    } else {
      return `${format(startDate, 'MMM dd, h:mm a')} - ${format(endDate, 'MMM dd, h:mm a')}`;
    }
  };

  const getStageTimeRange = (stages: SleepStage[], stageType: number) => {
    const filteredStages = stages.filter(s => s.stage === stageType);
    if (filteredStages.length === 0) return '';
    
    const firstStage = filteredStages[0];
    const lastStage = filteredStages[filteredStages.length - 1];
    
    return `${format(parseISO(firstStage.start_time), 'h:mm a')} - ${format(parseISO(lastStage.end_time), 'h:mm a')}`;
  };

  return (
    <Box className="user-detail-record-sleep">
      <Typography variant="h5" gutterBottom>
        Sleep Records
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
            Loading sleep data...
          </Typography>
        </Box>
      ) : error ? (
        <Typography color="error" className="error-message">
          {error}
        </Typography>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Left side - Session list */}
          <Grid item xs={12} md={5}>
            {Object.entries(groupedSessions).length > 0 ? (
              Object.entries(groupedSessions).map(([date, dateSessions]) => (
                <Box key={date} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {date}
                  </Typography>
                  {dateSessions.map(session => (
                    <Card 
                      key={session.record_id}
                      sx={{ 
                        mb: 2,
                        cursor: 'pointer',
                        borderLeft: selectedSession?.record_id === session.record_id ? 
                          `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                        transition: 'border-color 0.2s ease',
                        '&:hover': {
                          borderLeft: `4px solid ${theme.palette.primary.light}`
                        }
                      }}
                      onClick={() => setSelectedSession(session)}
                    >
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          {formatTimeRange(session.start_time, session.end_time)}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={1}>
                          <AccessTime fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {formatDuration(session.total_duration_hours)} total
                          </Typography>
                          {session.sleep_score && (
                            <>
                              <Box sx={{ mx: 1 }}>•</Box>
                              <Typography variant="body2">
                                Score: {Math.round(session.sleep_score)}/100
                              </Typography>
                            </>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ))
            ) : (
              <Typography variant="body1" sx={{ mt: 3 }}>
                No sleep data available for the selected period.
              </Typography>
            )}
          </Grid>

          {/* Right side - Session details */}
          <Grid item xs={12} md={7}>
            {selectedSession ? (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Sleep Session Details
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {formatTimeRange(selectedSession.start_time, selectedSession.end_time)}
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                      <Typography variant="subtitle2">Total Sleep Duration</Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {formatDuration(selectedSession.total_duration_hours)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {selectedSession.sleep_score && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                        <Typography variant="subtitle2">Sleep Score</Typography>
                        <Typography variant="h4" sx={{ mt: 1 }}>
                          {Math.round(selectedSession.sleep_score)}/100
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  
                  {selectedSession.avg_heart_rate && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                        <Typography variant="subtitle2">Avg Heart Rate</Typography>
                        <Typography variant="h4" sx={{ mt: 1 }}>
                          {Math.round(selectedSession.avg_heart_rate)} bpm
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  
                  {selectedSession.avg_spo2 && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                        <Typography variant="subtitle2">Avg SpO₂</Typography>
                        <Typography variant="h4" sx={{ mt: 1 }}>
                          {Math.round(selectedSession.avg_spo2)}%
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
                
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Sleep Stages
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      {chartData && (
                        <Box sx={{ height: 300 }}>
                          <Doughnut data={chartData} options={chartOptions} />
                        </Box>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <List>
                        {Object.entries(SleepType)
                          .filter(([_, value]) => {
                            return selectedSession.stages.some(s => s.stage === value);
                          })
                          .map(([key, value]) => {
                            const totalDuration = selectedSession.stages
                              .filter(s => s.stage === value)
                              .reduce((sum, stage) => sum + (stage.duration_minutes / 60), 0);
                            
                            return (
                              <ListItem key={key} sx={{ px: 0 }}>
                                <ListItemIcon>
                                  <Avatar sx={{ 
                                    bgcolor: sleepTypeColors[value as SleepTypeValue],
                                    width: 24, 
                                    height: 24 
                                  }}>
                                    {getIconFromSleepType(value as SleepTypeValue)}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={getNameFromSleepType(value as SleepTypeValue)}
                                  secondary={`${formatDuration(totalDuration)} • ${getStageTimeRange(selectedSession.stages, value)}`}
                                />
                              </ListItem>
                            );
                          })}
                      </List>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            ) : (
              <Typography variant="body1" sx={{ mt: 3 }}>
                Select a sleep session to view details
              </Typography>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
}