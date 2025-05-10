import { getNameFromExerciseType } from "@components/utils/util_exerciseType";
import { DirectionsRun, Favorite, LocalFireDepartment, Timer } from "@mui/icons-material";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { useRef } from "react";

export default function PDPExerciseSession({post, calculateDuration, mapContainer, mapContainerStyle} : any) {

  return (
    <Box className="exercise-session-card">
      <Typography variant="h6" className="section-title">
        <DirectionsRun sx={{ mr: 1 }} /> Exercise Session
      </Typography>
      <Grid container spacing={2} className="session-stats">
        <Grid item xs={6} sm={3}>
          <Card variant="outlined" className="stat-card">
            <CardContent>
              <Timer color="primary" />
              <Typography variant="h6">
                {calculateDuration(
                  post.exerciseSession.startTime,
                  post.exerciseSession.endTime
                )}{" "}
                min
              </Typography>
              <Typography variant="caption">Duration</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined" className="stat-card">
            <CardContent>
              <LocalFireDepartment color="primary" />
              <Typography variant="h6">
                {getNameFromExerciseType(post.exerciseSession.exerciseType)}
              </Typography>
              <Typography variant="caption">Exercise Type</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined" className="stat-card">
            <CardContent>
              <Favorite color="error" />
              <Typography variant="h6">
                {post.exerciseSession.routes.length}
              </Typography>
              <Typography variant="caption">Route Points</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {post.exerciseSession.routes.length > 0 && (
        <Box className="map-section">
          <Typography variant="subtitle1" className="section-title">
            Exercise Route
          </Typography>
          <div
            ref={mapContainer}
            style={mapContainerStyle}
            className="map-container"
          />
        </Box>
      )}
    </Box>
  );
}
