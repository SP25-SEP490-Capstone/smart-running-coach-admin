import { useState, useEffect, useRef } from "react";
import "./UserDetailRecordExerciseSession.scss";
import { aget } from "@components/utils/util_axios";
import { Box, Typography } from "@mui/material";
import {
  getIconFromExerciseType,
  getNameFromExerciseType,
} from "@components/utils/util_exerciseType";
import { format, parseISO } from "date-fns";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SpeedIcon from "@mui/icons-material/Speed";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { DirectionsRun } from "@mui/icons-material";

interface UserDetailRecordExerciseSessionProps {
  userId: string;
}

interface ExerciseSession {
  id: string;
  exercise_type: number;
  start_time: string;
  duration_seconds: number;
  heart_rate: {
    min: number;
    max: number;
    avg: number;
  };
  total_steps: number | null;
  total_distance: number | null;
  total_calories: number | null;
  data_origin: string;
  created_at: string;
}

interface ExerciseSessionDetail {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  exercise_type: number;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  data_origin: string;
  routes: {
    latitude: number;
    longitude: number;
    time: string;
  }[];
  heart_rate: {
    min: number;
    max: number;
    avg: number;
  };
  total_steps: number | null;
  total_distance: number | null;
  total_calories: number | null;
}

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
  marginTop: "16px",
};

export default function UserDetailRecordExerciseSession({
  userId,
}: UserDetailRecordExerciseSessionProps) {
  const [exerciseSessions, setExerciseSessions] = useState<ExerciseSession[]>(
    []
  );
  const [selectedSession, setSelectedSession] =
    useState<ExerciseSessionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Mapbox references
  const mapContainer = useRef<any>(null);
  const map = useRef<any>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  const fetchList = async () => {
    try {
      const response = await aget(
        `/record-exercise-session/admin/all/${userId}`
      );
      const resData = response.data;
      if (resData.status) {
        setExerciseSessions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching exercise sessions:", error);
    }
  };

  const fetchSessionDetail = async (sessionId: string) => {
    try {
      setLoadingDetail(true);
      const response = await aget(
        `/record-exercise-session/admin/detail/${sessionId}`
      );
      const resData = response.data;
      if (resData.status) {
        setSelectedSession(resData.data);
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (!selectedSession?.routes || !mapContainer.current || mapInitialized)
      return;

    // Initialize map only once
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

    const pathCoordinates = selectedSession.routes.map((route) => ({
      lng: route.longitude,
      lat: route.latitude,
    }));

    const bounds = new mapboxgl.LngLatBounds();
    pathCoordinates.forEach((coord) => bounds.extend(coord));

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      bounds: bounds,
      fitBoundsOptions: {
        padding: 50,
      },
    });

    map.current.on("load", () => {
      setMapInitialized(true);

      map.current?.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: pathCoordinates.map((coord) => [coord.lng, coord.lat]),
          },
        },
      });

      map.current?.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#003363",
          "line-width": 4,
        },
      });

      if (pathCoordinates.length > 0) {
        new mapboxgl.Marker({ color: "#4CAF50" })
          .setLngLat(pathCoordinates[0])
          .setPopup(new mapboxgl.Popup().setHTML("<h3>Start</h3>"))
          .addTo(map.current);

        new mapboxgl.Marker({ color: "#F44336" })
          .setLngLat(pathCoordinates[pathCoordinates.length - 1])
          .setPopup(new mapboxgl.Popup().setHTML("<h3>End</h3>"))
          .addTo(map.current);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapInitialized(false);
      }
    };
  }, [selectedSession?.routes]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy h:mm a");
  };

  const handleSessionSelect = (sessionId: string) => {
    fetchSessionDetail(sessionId);
  };

  return (
    <div className="user-detail-record-exercise-session">
      <Box className="left-side">
        <Typography variant="h6" gutterBottom className="section-title">
          Exercise Sessions
        </Typography>
        <Box className="scrollable-content">
          {exerciseSessions.map((session) => {
            const IconComponent = getIconFromExerciseType(
              session.exercise_type
            );
            return (
              <div
                key={session.id}
                className={`session-item ${
                  selectedSession?.id === session.id ? "active" : ""
                }`}
                onClick={() => handleSessionSelect(session.id)}
              >
                <div className="session-icon">
                  <IconComponent />
                </div>
                <div className="session-content">
                  <div className="session-header">
                    <Typography variant="subtitle1" className="exercise-name">
                      {getNameFromExerciseType(session.exercise_type)}
                    </Typography>
                  </div>
                  <Typography variant="caption" className="session-date">
                    {formatDate(session.start_time)}
                  </Typography>
                  <div className="session-stats">
                    <div className="stat-item">
                      <WatchLaterIcon fontSize="small" color="action" />
                      <span>{formatDuration(session.duration_seconds)}</span>
                    </div>
                    {session.total_distance !== null && (
                      <div className="stat-item">
                        <SpeedIcon fontSize="small" color="action" />
                        <span>
                          {(session.total_distance / 1000).toFixed(2)} km
                        </span>
                      </div>
                    )}
                    {session.heart_rate && (
                      <div className="stat-item">
                        <FavoriteIcon fontSize="small" color="error" />
                        <span>Avg: {session.heart_rate.avg} bpm</span>
                      </div>
                    )}
                    {session.total_calories !== null && (
                      <div className="stat-item">
                        <LocalFireDepartmentIcon
                          fontSize="small"
                          color="warning"
                        />
                        <span>{session.total_calories} kcal</span>
                      </div>
                    )}
                    {session.total_steps !== null && (
                      <div className="stat-item">
                        <DirectionsWalkIcon fontSize="small" color="action" />
                        <span>{session.total_steps} steps</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </Box>
      </Box>
      <Box className="right-side">
        <Typography variant="h6" gutterBottom className="section-title">
          Session Details
        </Typography>
        <Box className="scrollable-content">
          {loadingDetail ? (
            <div className="placeholder-content">
              <Typography variant="body1" color="textSecondary">
                Loading session details...
              </Typography>
            </div>
          ) : selectedSession ? (
            <div className="session-detail">
              <div className="detail-header">
                <Typography variant="h6" className="exercise-name">
                  {getNameFromExerciseType(selectedSession.exercise_type)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {formatDate(selectedSession.start_time)}
                </Typography>
              </div>

              <div className="detail-stats">
                <div className="stat-row">
                  <div className="stat-item">
                    <WatchLaterIcon fontSize="small" color="action" />
                    <div>
                      <Typography variant="caption">Duration</Typography>
                      <Typography>
                        {formatDuration(selectedSession.duration_seconds)}
                      </Typography>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FavoriteIcon fontSize="small" color="error" />
                    <div>
                      <Typography variant="caption">Heart Rate</Typography>
                      <Typography>
                        {selectedSession.heart_rate.avg} bpm (min:{" "}
                        {selectedSession.heart_rate.min}, max:{" "}
                        {selectedSession.heart_rate.max})
                      </Typography>
                    </div>
                  </div>
                </div>

                <div className="stat-row">
                  {selectedSession.total_distance !== null && (
                    <div className="stat-item">
                      <SpeedIcon fontSize="small" color="action" />
                      <div>
                        <Typography variant="caption">Distance</Typography>
                        <Typography>
                          {(selectedSession.total_distance / 1000).toFixed(2)}{" "}
                          km
                        </Typography>
                      </div>
                    </div>
                  )}
                  {selectedSession.total_calories !== null && (
                    <div className="stat-item">
                      <LocalFireDepartmentIcon
                        fontSize="small"
                        color="warning"
                      />
                      <div>
                        <Typography variant="caption">Calories</Typography>
                        <Typography>
                          {selectedSession.total_calories} kcal
                        </Typography>
                      </div>
                    </div>
                  )}
                </div>

                {selectedSession.total_steps !== null && (
                  <div className="stat-row">
                    <div className="stat-item">
                      <DirectionsWalkIcon fontSize="small" color="action" />
                      <div>
                        <Typography variant="caption">Steps</Typography>
                        <Typography>{selectedSession.total_steps}</Typography>
                      </div>
                    </div>
                  </div>
                )}
                <div className="stat-row">
                  <DirectionsRun fontSize="small" color="primary" />
                  <div>
                    <Typography variant="caption">Avg Pace</Typography>
                    <Typography>
                      {(
                        selectedSession.duration_seconds /
                        (selectedSession.total_distance / 1000) /
                        60
                      )
                        .toFixed(2)
                        .replace(/[.,]00$/, "")}{" "}
                      min/km
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="user-info">
                <Typography variant="subtitle2">User Information</Typography>
                <div className="info-grid">
                  <div>
                    <Typography variant="caption">Name</Typography>
                    <Typography>{selectedSession.user.name}</Typography>
                  </div>
                  <div>
                    <Typography variant="caption">Email</Typography>
                    <Typography>{selectedSession.user.email}</Typography>
                  </div>
                  <div>
                    <Typography variant="caption">Data Source</Typography>
                    <Typography>{selectedSession.data_origin}</Typography>
                  </div>
                </div>
              </div>

              {selectedSession.routes && selectedSession.routes.length > 0 && (
                <div className="map-section">
                  <Typography variant="subtitle2">Route Map</Typography>
                  <div ref={mapContainer} style={mapContainerStyle} />
                </div>
              )}
            </div>
          ) : (
            <div className="placeholder-content">
              <Typography variant="body1" color="textSecondary">
                Select a session to view detailed metrics and charts
              </Typography>
            </div>
          )}
        </Box>
      </Box>
    </div>
  );
}
