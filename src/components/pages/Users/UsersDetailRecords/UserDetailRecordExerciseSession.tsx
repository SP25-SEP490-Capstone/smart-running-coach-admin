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
  Avatar,
  useTheme,
  Tab,
  Tabs,
  Chip
} from "@mui/material";
import { 
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage,
  DirectionsRun,
  DirectionsBike,
  Pool,
  FitnessCenter,
  SportsSoccer,
  SportsTennis,
  GolfCourse,
  Hiking,
  SelfImprovement,
  DirectionsWalk
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { format, subDays, subMonths, subYears, isSameDay, parseISO } from 'date-fns';
import { aget } from '@components/utils/util_axios';
import { ExerciseType, getNameFromExerciseType, getIconFromExerciseType } from '@components/utils/util_exerciseType';
import GoogleMapReact from 'google-map-react';
import './UserDetailRecordExerciseSession.scss';

interface ExerciseRoutePoint {
  time: string;
  latitude: number;
  longitude: number;
}

interface HeartRateRecord {
  time: string;
  value: number;
}

interface ExerciseSession {
  id: string;
  record_id: string;
  exercise_type: number;
  data_origin: string | null;
  start_time: string;
  end_time: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  duration_minutes: number;
  total_distance: number;
  total_calories: number;
  total_steps: number;
  avg_pace: string | null;
  heart_rate: {
    min: number | null;
    avg: number | null;
    max: number | null;
    records: HeartRateRecord[];
  };
  routes: ExerciseRoutePoint[];
}

interface ExerciseResponse {
  data: ExerciseSession[];
}

interface UserDetailRecordExerciseSessionProps {
  userId: string;
}

const AnyReactComponent = ({ text }: { text: string }) => (
  <div style={{
    color: 'white',
    background: 'red',
    padding: '5px 10px',
    display: 'inline-flex',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '100%',
    transform: 'translate(-50%, -50%)'
  }}>
    {text}
  </div>
);

export default function UserDetailRecordExerciseSession({ userId }: UserDetailRecordExerciseSessionProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ExerciseSession[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] = useState<ExerciseSession | null>(null);
  const [groupedSessions, setGroupedSessions] = useState<Record<string, ExerciseSession[]>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [mapZoom, setMapZoom] = useState(14);

  const timeRanges = {
    day: 1,
    week: 7,
    month: 30,
    year: 365
  };

  useEffect(() => {
    fetchExerciseData();
  }, [userId, timeRange, selectedDate]);

  useEffect(() => {
    if (sessions.length > 0) {
      const grouped: Record<string, ExerciseSession[]> = {};
      
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
    if (selectedSession?.routes && selectedSession.routes.length > 0) {
      const firstPoint = selectedSession.routes[0];
      setMapCenter({ lat: firstPoint.latitude, lng: firstPoint.longitude });
      setMapZoom(14);
    }
  }, [selectedSession]);

  const fetchExerciseData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = getStartDate();
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await aget<ExerciseResponse>(
        `/record-exercise-session/admin/${userId}?startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}`
      );

      if (response.data && Array.isArray(response.data.data)) {
        setSessions(response.data.data);
      } else {
        setSessions([]);
      }
    } catch (err: any) {
      console.error('Error fetching exercise data:', err);
      setError(err.message || 'Failed to fetch exercise data');
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
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

  const getExerciseIcon = (type: number) => {
    switch (type) {
      case ExerciseType.RUNNING:
      case ExerciseType.RUNNING_TREADMILL:
        return <DirectionsRun />;
      case ExerciseType.BIKING:
      case ExerciseType.BIKING_STATIONARY:
        return <DirectionsBike />;
      case ExerciseType.SWIMMING_OPEN_WATER:
      case ExerciseType.SWIMMING_POOL:
        return <Pool />;
      case ExerciseType.STRENGTH_TRAINING:
      case ExerciseType.WEIGHTLIFTING:
        return <FitnessCenter />;
      case ExerciseType.SOCCER:
      case ExerciseType.FOOTBALL_AMERICAN:
        return <SportsSoccer />;
      case ExerciseType.TENNIS:
      case ExerciseType.BADMINTON:
        return <SportsTennis />;
      case ExerciseType.GOLF:
        return <GolfCourse />;
      case ExerciseType.HIKING:
        return <Hiking />;
      case ExerciseType.YOGA:
        return <SelfImprovement />;
      case ExerciseType.WALKING:
        return <DirectionsWalk />;
      default:
        return <FitnessCenter />;
    }
  };

  const renderMap = () => {
    if (!selectedSession?.routes || selectedSession.routes.length === 0) {
      return (
        <Box sx={{ 
          height: 400, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: theme.palette.grey[100],
          borderRadius: 1
        }}>
          <Typography>No route data available for this session</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ height: 400, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '' }}
          defaultCenter={mapCenter}
          defaultZoom={mapZoom}
          options={{
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          {selectedSession.routes.map((point, index) => (
            <AnyReactComponent
              key={index}
              lat={point.latitude}
              lng={point.longitude}
              text={index === 0 ? 'S' : index === selectedSession.routes.length - 1 ? 'F' : ''}
            />
          ))}
        </GoogleMapReact>
      </Box>
    );
  };

  const renderHeartRateChart = () => {
    if (!selectedSession?.heart_rate?.records || selectedSession.heart_rate.records.length === 0) {
      return (
        <Box sx={{ 
          height: 300, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: theme.palette.grey[100],
          borderRadius: 1
        }}>
          <Typography>No heart rate data available for this session</Typography>
        </Box>
      );
    }

    // In a real implementation, you would use a charting library here
    return (
      <Box sx={{ height: 300, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Heart Rate Chart Placeholder
        </Typography>
      </Box>
    );
  };

  return (
    <Box className="user-detail-record-exercise">
      <Typography variant="h5" gutterBottom>
        Exercise Sessions
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
            Loading exercise data...
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
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ 
                            bgcolor: theme.palette.primary.main,
                            width: 40,
                            height: 40
                          }}>
                            {getExerciseIcon(session.exercise_type)}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle1">
                              {getNameFromExerciseType(session.exercise_type)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatTimeRange(session.start_time, session.end_time)}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="body2">
                              {formatDuration(session.duration_minutes)}
                            </Typography>
                            {session.total_distance > 0 && (
                              <Typography variant="body2">
                                {(session.total_distance / 1000).toFixed(2)} km
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ))
            ) : (
              <Typography variant="body1" sx={{ mt: 3 }}>
                No exercise data available for the selected period.
              </Typography>
            )}
          </Grid>

          {/* Right side - Session details */}
          <Grid item xs={12} md={7}>
            {selectedSession ? (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ 
                    bgcolor: theme.palette.primary.main,
                    width: 60,
                    height: 60
                  }}>
                    {getExerciseIcon(selectedSession.exercise_type)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {getNameFromExerciseType(selectedSession.exercise_type)}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {formatTimeRange(selectedSession.start_time, selectedSession.end_time)}
                    </Typography>
                  </Box>
                </Box>

                <Tabs 
                  value={activeTab} 
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  sx={{ mb: 3 }}
                >
                  <Tab label="Summary" />
                  <Tab label="Route" />
                  <Tab label="Heart Rate" />
                </Tabs>

                {activeTab === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                        <Typography variant="subtitle2">Duration</Typography>
                        <Typography variant="h4" sx={{ mt: 1 }}>
                          {formatDuration(selectedSession.duration_minutes)}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {selectedSession.total_distance > 0 && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                          <Typography variant="subtitle2">Distance</Typography>
                          <Typography variant="h4" sx={{ mt: 1 }}>
                            {(selectedSession.total_distance / 1000).toFixed(2)} km
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {selectedSession.avg_pace && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                          <Typography variant="subtitle2">Avg Pace</Typography>
                          <Typography variant="h4" sx={{ mt: 1 }}>
                            {selectedSession.avg_pace} min/km
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {selectedSession.total_calories > 0 && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                          <Typography variant="subtitle2">Calories</Typography>
                          <Typography variant="h4" sx={{ mt: 1 }}>
                            {Math.round(selectedSession.total_calories)} kcal
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {selectedSession.total_steps > 0 && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                          <Typography variant="subtitle2">Steps</Typography>
                          <Typography variant="h4" sx={{ mt: 1 }}>
                            {selectedSession.total_steps.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {selectedSession.heart_rate.avg && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                          <Typography variant="subtitle2">Avg Heart Rate</Typography>
                          <Typography variant="h4" sx={{ mt: 1 }}>
                            {selectedSession.heart_rate.avg} bpm
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                )}

                {activeTab === 1 && renderMap()}

                {activeTab === 2 && renderHeartRateChart()}
              </Paper>
            ) : (
              <Typography variant="body1" sx={{ mt: 3 }}>
                Select an exercise session to view details
              </Typography>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
}