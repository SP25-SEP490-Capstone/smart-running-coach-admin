import { Chip } from "@mui/material";
import {
  Email as EmailIcon,
  VerifiedUser as VerifiedIcon,
  Refresh as RefreshIcon,
  Devices as DevicesIcon,
  Google as GoogleIcon,
  LockClockOutlined,
} from "@mui/icons-material";
import "./UDPLoginInformation.scss";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { formatDate } from "@components/utils/util_format";

export function UDPLoginInformation({ user, loading }: any) {
  const getProviderIcon = () => {
    return <GoogleIcon className="provider-icon" />;
  };

  const formatLastActive = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="udp-login-information">
      <div className="header">
        <h3 className="title">Login Information</h3>
      </div>

      <div className="login-details">
        {/* Email Verification */}
        <div className="detail-item">
          <EmailIcon className="detail-icon" />
          <div className="detail-content">
            <p className="detail-label">Email Verification</p>
            {loading ? (
              <Skeleton width={100} />
            ) : (
              <Chip
                icon={<VerifiedIcon fontSize="small" />}
                label={user?.verification?.is_verified ? "Verified" : "Not Verified"}
                size="small"
                color={user?.verification?.is_verified ? "success" : "default"}
                className="verification-chip"
              />
            )}
          </div>
        </div>

        {/* Password Reset */}
        <div className="detail-item">
          <RefreshIcon className="detail-icon" />
          <div className="detail-content">
            <p className="detail-label">Password Reset</p>
            {loading ? (
              <Skeleton width={120} />
            ) : (
              <div className="reset-info">
                <Chip
                  label={user?.verification?.is_reset_password_allowed ? "Allowed" : "Not Allowed"}
                  size="small"
                  variant="outlined"
                  className="reset-chip"
                />
                {user?.verification?.last_password_reset && (
                  <p className="reset-date">
                    Last reset: {formatLastActive(user.verification.last_password_reset)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Login Provider */}
        <div className="detail-item">
          {getProviderIcon()}
          <div className="detail-content">
            <p className="detail-label">Login Method</p>
            {loading ? (
              <Skeleton width={80} />
            ) : (
              <Chip
                label="Normal"
                size="small"
                variant="outlined"
                className="provider-chip"
              />
            )}
          </div>
        </div>

        {/* Last Active */}
        <div className="detail-item">
          <DevicesIcon className="detail-icon" />
          <div className="detail-content">
            <p className="detail-label">Last Active</p>
            {loading ? (
              <Skeleton width={150} />
            ) : (
              <p className="detail-value">
                {formatLastActive(user?.updated_at)}
              </p>
            )}
          </div>
        </div>

        <div className="detail-item">
          <LockClockOutlined className="detail-icon" />
          <div className="detail-content">
            <p className="detail-label">Account Created</p>
            {loading ? (
              <Skeleton width={150} />
            ) : (
              <p className="detail-value">
                {user?.created_at ? formatDate(user.created_at) : "N/A"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}