import { Box, IconButton } from "@mui/material";
import {
  DirectionsRun as ExerciseIcon,
  Article as PostIcon,
  Warning as AlertIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import "./UDPRecentActivity.scss";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { formatDate } from "@components/utils/util_format";

export function UDPRecentActivity({ user, loading }: any) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "exercise":
        return <ExerciseIcon className="activity-icon exercise" />;
      case "post":
        return <PostIcon className="activity-icon post" />;
      case "health_alert":
        return <AlertIcon className="activity-icon alert" />;
      default:
        return <TimeIcon className="activity-icon default" />;
    }
  };

  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityDescription = (activity: any) => {
    switch (activity.type) {
      case "exercise":
        return `Exercise session (${activity.duration})`;
      case "post":
        return `Posted: ${activity.title || "Untitled"}`;
      case "health_alert":
        return `${activity.severity} alert: ${activity.message}`;
      default:
        return "Activity";
    }
  };

  return (
    <div className="udp-recent-activity">
      <div className="header">
        <h3 className="title">Recent Activities</h3>
      </div>

      <div className="activity-list">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="activity-item loading">
                <Skeleton width={40} height={40} circle />
                <div className="activity-content">
                  <Skeleton width={180} />
                  <Skeleton width={120} />
                </div>
              </div>
            ))
        ) : user?.recent_activities?.length > 0 ? (
          user.recent_activities.map((activity: any, index: number) => (
            <div key={index} className="activity-item">
              <Box className="activity-icon-container">
                {getActivityIcon(activity.type)}
              </Box>
              <div className="activity-content">
                <p className="activity-description">
                  {getActivityDescription(activity)}
                </p>
                <p className="activity-date">
                  {formatDate(activity.date)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-activities">
            <p>No recent activities found</p>
          </div>
        )}
      </div>
    </div>
  );
}