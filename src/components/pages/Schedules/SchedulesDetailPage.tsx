import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Paper,
  Tooltip,
} from "@mui/material";
import { ExpandMore, FitnessCenter, DirectionsRun, LocalFireDepartment } from "@mui/icons-material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./SchedulesDetailPage.scss";
import { useParams } from "react-router-dom";
import CommonBreadcrumb from "@components/commons/CommonBreadcrumb";
import { aget } from "@components/utils/util_axios";
import { CommonAvatar } from "@components/commons/CommonAvatar";
import { sendErrorToast } from "@components/utils/util_toastify";

const localizer = momentLocalizer(moment);

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string | null;
}

interface ScheduleDetail {
  id: string;
  schedule_day_id: string;
  description: string;
  start_time: string;
  end_time: string;
  goal_steps: number | null;
  goal_distance: number | null;
  goal_calories: number | null;
  goal_minbpms: number | null;
  goal_maxbpms: number | null;
  status: string;
  workout_feeling: string;
  estimated_time: number | null;
  created_at: string;
  updated_at: string | null;
  is_deleted: boolean;
  actual_steps: number;
  actual_distance: number;
  actual_calories: number;
}

interface ScheduleDay {
  id: string;
  schedule_id: string;
  day: string;
  created_at: string;
  updated_at: string | null;
  is_deleted: boolean;
  is_rest_day: boolean;
  ScheduleDetail: ScheduleDetail[];
}

interface Schedule {
  id: string;
  schedule_type: "USER" | "EXPERT";
  title: string;
  description: string;
  user_id: string;
  expert_id: string | null;
  created_at: string;
  updated_at: string | null;
  status: string;
  is_deleted: boolean;
  ScheduleDay: ScheduleDay[];
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    user: User;
    schedules: Schedule[];
  };
}

export default function SchedulesDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await aget(`/schedules/admin/user/${userId}`);
      setData(response.data);
    } catch (err) {
      setError("Failed to load schedule data");
      sendErrorToast("Failed to load schedule data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSchedules();
    }
  }, [userId]);

  const formatDate = (dateString: string) => {
    return moment(dateString).format("MMM D, YYYY, h:mm A");
  };

  const formatShortDate = (dateString: string) => {
    return moment(dateString).format("MMM D, YYYY");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "success";
      case "CANCELED": return "error";
      case "ONGOING": return "primary";
      case "UPCOMING": return "warning";
      case "INCOMING": return "info";
      case "MISSED": return "error";
      default: return "default";
    }
  };

  const getFeelingIcon = (feeling: string) => {
    switch (feeling) {
      case "GREAT": return "😊👍";
      case "GOOD": return "🙂";
      case "NEUTRAL": return "😐";
      case "BAD": return "😔";
      case "VERY_BAD": return "😞👎";
      default: return "";
    }
  };

  const calendarEvents = data?.data.schedules.flatMap(schedule =>
    schedule.ScheduleDay.flatMap(day =>
      day.ScheduleDetail.map(detail => ({
        title: detail.description || "Workout",
        start: new Date(detail.start_time),
        end: new Date(detail.end_time),
        allDay: false,
        resource: { status: detail.status, scheduleTitle: schedule.title },
      }))
    )
  ) || [];

  if (loading) {
    return (
      <Box className="schedules-detail-page loading">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Box className="schedules-detail-page error">{error}</Box>;
  }

  if (!data || data.status !== "success") {
    return <Box className="schedules-detail-page">No schedule data available</Box>;
  }

  const { user } = data.data;

  return (
    <Box className="schedules-detail-page">
      <CommonBreadcrumb
        items={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Schedules", link: "/schedules" },
          { name: user.name },
        ]}
      />

      <Box className="schedules-container">
        <Box className="schedules-header">
          <p className="user-id">User ID: {user.id}</p>
          <Typography variant="h4" className="schedules-title">
            Schedules for {user.name}
          </Typography>
          <Box className="schedules-meta">
            <CommonAvatar uri={user.image?.url} mode={user.roles?.includes("expert") ? "expert" : "runner"} />
            <Box>
              <Typography className="author">
                {user.name} <span className="author-username">@{user.username}</span>
              </Typography>
              <Typography className="details" variant="caption">
                Email: {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3} className="schedules-content">
          {/* Left Side: Accordion View */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} className="accordion-panel">
              <Typography variant="h6" className="panel-title">
                Schedule Details
              </Typography>
              {data.data.schedules.map(schedule => (
                <Accordion key={schedule.id} className="schedule-accordion">
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box className="accordion-summary">
                      <Typography variant="subtitle1">
                        {schedule.title || "Untitled Schedule"}
                      </Typography>
                      <Chip
                        label={schedule.status}
                        color={getStatusColor(schedule.status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                      <Chip
                        label={schedule.schedule_type}
                        color={schedule.schedule_type === "USER" ? "default" : "secondary"}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box className="schedule-details">
                      <Typography variant="body2" color="textSecondary">
                        Created: {formatDate(schedule.created_at)}
                        {schedule.updated_at && ` | Updated: ${formatDate(schedule.updated_at)}`}
                      </Typography>
                      {schedule.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {schedule.description}
                        </Typography>
                      )}
                      {schedule.ScheduleDay.map(day => (
                        <Accordion key={day.id} className="day-accordion">
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle2">
                              {formatShortDate(day.day)}
                              {day.is_rest_day && " (Rest Day)"}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box className="day-details">
                              {day.is_rest_day ? (
                                <Typography variant="body2">
                                  No activities scheduled (Rest Day)
                                </Typography>
                              ) : (
                                day.ScheduleDetail.map(detail => (
                                  <Paper key={detail.id} className="detail-card" elevation={1}>
                                    <Typography variant="subtitle2" className="detail-title">
                                      {detail.description || "Workout"}
                                    </Typography>
                                    <Chip
                                      label={detail.status}
                                      color={getStatusColor(detail.status)}
                                      size="small"
                                      sx={{ mb: 1 }}
                                    />
                                    <Typography variant="body2">
                                      <strong>Time:</strong> {moment(detail.start_time).format("h:mm A")} - {moment(detail.end_time).format("h:mm A")}
                                    </Typography>
                                    <Typography variant="body2">
                                      <strong>Estimated:</strong> {detail.estimated_time || "N/A"} minutes
                                    </Typography>
                                    <Box className="goals">
                                      <Tooltip title="Steps">
                                        <Typography variant="body2">
                                          <DirectionsRun fontSize="small" /> {detail.goal_steps || "N/A"} ({detail.actual_steps})
                                        </Typography>
                                      </Tooltip>
                                      <Tooltip title="Distance (km)">
                                        <Typography variant="body2">
                                          <FitnessCenter fontSize="small" /> {detail.goal_distance || "N/A"} ({detail.actual_distance})
                                        </Typography>
                                      </Tooltip>
                                      <Tooltip title="Calories">
                                        <Typography variant="body2">
                                          <LocalFireDepartment fontSize="small" /> {detail.goal_calories || "N/A"} ({detail.actual_calories})
                                        </Typography>
                                      </Tooltip>
                                    </Box>
                                    {(detail.goal_minbpms || detail.goal_maxbpms) && (
                                      <Typography variant="body2">
                                        <strong>Heart Rate:</strong> {detail.goal_minbpms || "N/A"} - {detail.goal_maxbpms || "N/A"} BPM
                                      </Typography>
                                    )}
                                    <Typography variant="body2">
                                      <strong>Feeling:</strong> {getFeelingIcon(detail.workout_feeling)} {detail.workout_feeling}
                                    </Typography>
                                  </Paper>
                                ))
                              )}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
          </Grid>

          {/* Right Side: Calendar View */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} className="calendar-panel">
              <Typography variant="h6" className="panel-title">
                Calendar Overview
              </Typography>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor: {
                      COMPLETED: "#22c55e",
                      CANCELED: "#ef4444",
                      ONGOING: "#3b82f6",
                      UPCOMING: "#facc15",
                      INCOMING: "#06b6d4",
                      MISSED: "#ef4444",
                    }[event.resource.status] || "#9ca3af",
                    color: "#fff",
                    borderRadius: "4px",
                    fontSize: "12px",
                  },
                })}
                tooltipAccessor={(event) => `${event.resource.scheduleTitle}: ${event.title} (${event.resource.status})`}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}