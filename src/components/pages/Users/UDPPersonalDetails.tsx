import { IconButton, Chip } from "@mui/material";
import {
  Person as PersonIcon,
  Cake as CakeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Circle as CircleIcon,
  Event as EventIcon,
  EditOutlined as EditOutlinedIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  Transgender as TransgenderIcon,
} from "@mui/icons-material";
import "./UDPPersonalDetails.scss";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  capitalizeFirstLetter,
  formatDate,
} from "@components/utils/util_format";

export function UDPPersonalDetails({ user, loading, onUdeBasicProfile }: any) {
  const getGenderIcon = () => {
    if (!user?.gender) return null;
    switch (user.gender.toUpperCase()) {
      case "MALE":
        return <MaleIcon fontSize="small" className="gender-icon male" />;
      case "FEMALE":
        return <FemaleIcon fontSize="small" className="gender-icon female" />;
      default:
        return (
          <TransgenderIcon fontSize="small" className="gender-icon other" />
        );
    }
  };

  const formatPhoneNumber = () => {
    if (!user?.phone_number) return "N/A";
    return `${user.phone_code ? `(${user.phone_code}) ` : ""}${
      user.phone_number
    }`;
  };

  const formatAddress = () => {
    const parts = [user?.address1, user?.address2, user?.zip_code].filter(
      Boolean
    );
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  return (
    <div className="udp-personal-details">
      <div className="header">
        <h3 className="label">Personal Details</h3>
        {!loading && (
          <IconButton className="edit-button" onClick={onUdeBasicProfile}>
            <EditOutlinedIcon />
          </IconButton>
        )}
      </div>

      <div className="details-grid">
        {/* Name */}
        <div className="detail-item">
          <PersonIcon className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Full Name</span>
            {loading ? (
              <Skeleton width={150} />
            ) : (
              <span className="detail-value">{user?.name || "N/A"}</span>
            )}
          </div>
        </div>
        <div className="detail-item">
          <PersonIcon className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Username</span>
            {loading ? (
              <Skeleton width={150} />
            ) : (
              <span className="detail-value">@{user?.username || "N/A"}</span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="detail-item">
          <EmailIcon className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Email</span>
            {loading ? (
              <Skeleton width={200} />
            ) : (
              <span className="detail-value">{user?.email || "N/A"}</span>
            )}
          </div>
        </div>

        {/* Birth Date */}
        <div className="detail-item">
          <CakeIcon className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Birth Date</span>
            {loading ? (
              <Skeleton width={120} />
            ) : (
              <span className="detail-value">
                {user?.birth_date
                  ? new Date(user.birth_date).toLocaleDateString()
                  : "N/A"}
              </span>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="detail-item">
          <PhoneIcon className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Phone</span>
            {loading ? (
              <Skeleton width={140} />
            ) : (
              <span className="detail-value">{formatPhoneNumber()}</span>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="detail-item">
          <HomeIcon className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Address</span>
            {loading ? (
              <Skeleton width={180} />
            ) : (
              <span className="detail-value">{formatAddress()}</span>
            )}
          </div>
        </div>

        {/* Zip Code */}
        <div className="detail-item">
          <CircleIcon className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Zip Code</span>
            {loading ? (
              <Skeleton width={80} />
            ) : (
              <span className="detail-value">{user?.zip_code || "N/A"}</span>
            )}
          </div>
        </div>

        {/* Gender */}
        <div className="detail-item">
          {getGenderIcon() || <PersonIcon className="detail-icon" />}
          <div className="detail-content">
            <span className="detail-label">Gender</span>
            {loading ? (
              <Skeleton width={80} />
            ) : (
              <span className="detail-value gender">
                {capitalizeFirstLetter(user?.gender, true) || "N/A"}
              </span>
            )}
          </div>
        </div>

        {/* Role */}
        <div className="detail-item">
          <BadgeIcon className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Role</span>
            {loading ? (
              <Skeleton width={100} />
            ) : (
              <div className="roles">
                {user?.roles?.map((role: string) => (
                  <Chip
                    key={role}
                    label={role}
                    size="small"
                    className="role-chip"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="detail-item">
          <CircleIcon className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Status</span>
            {loading ? (
              <Skeleton width={80} />
            ) : (
              <Chip
                label={user?.is_active ? "Active" : "Inactive"}
                className={`status-chip ${
                  user?.is_active ? "active" : "inactive"
                }`}
                size="small"
              />
            )}
          </div>
        </div>

        {/* Created At */}
        <div className="detail-item">
          <EventIcon className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Joined</span>
            {loading ? (
              <Skeleton width={150} />
            ) : (
              <span className="detail-value">
                {user?.created_at ? formatDate(user.created_at) : "N/A"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
