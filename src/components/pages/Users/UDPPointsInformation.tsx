import './UDPPointsInformation.scss'
import { Avatar, Button, IconButton, Chip, Box } from "@mui/material";
import {
  Person as PersonIcon,
  Cake as CakeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Circle as CircleIcon,
  Event as EventIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDownOffAltOutlined as ThumbDownOffAltOutlinedIcon,
  ModeCommentOutlined as ModeCommentOutlinedIcon,
  DoNotDisturbAlt as DoNotDisturbAltIcon,
  DeleteOutline as DeleteOutlineIcon,
  EditOutlined as EditOutlinedIcon,
  WatchOutlined as WatchOutlinedIcon,
  Google as GoogleIcon,
  LockClockOutlined as LockClockOutlinedIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  Transgender as TransgenderIcon,
} from "@mui/icons-material";
import "chart.js/auto";
import "./UDPPointsInformation.scss";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { capitalizeFirstLetter } from '@components/utils/util_format';

export default function UDPPointsInformation({
  user,
  loading,
  onShowHistory,
  onEditPoints,
}: {
  user: any;
  loading: boolean;
  onShowHistory: () => void;
  onEditPoints: () => void;
}) {
  return (
    <div className="udp-points-information">
      <div className="header">
        <p className="label">Point Information</p>
        {!loading && (
          <IconButton className="btn-edit" onClick={onEditPoints}>
            <EditOutlinedIcon />
          </IconButton>
        )}
      </div>
      <div className="point-information-content">
        <div className="point-item">
          {loading ? (
            <Skeleton width={50} />
          ) : (
            <p className="point-value">{user?.points || 0}</p>
          )}
          <p className="point-label">Total Points Earned</p>
        </div>
         <div className="point-item">
          {loading ? (
            <Skeleton width={50} />
          ) : (
            <p className="point-value">{capitalizeFirstLetter(user?.user_level) || "N/A"}</p>
          )}
          <p className="point-label">User Rank</p>
        </div>
        <div className="point-item">
          <Button
            variant="contained"
            className="btn-view-history"
            onClick={onShowHistory}
          >
            View History
          </Button>
        </div>
      </div>
    </div>
  );
}