import { Avatar, Button, IconButton, Chip, Box } from "@mui/material";
import { Bar } from "react-chartjs-2";
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
import "./UsersDetailPage.scss";
import CommonBreadcrumb from "@components/commons/CommonBreadcrumb";
import { Link, useParams } from "react-router-dom";
import UDEBasicProfile from "./UsersDetailEdit/UDEBasicProfile";
import { useState, useEffect } from "react";
import { aget, aput } from "@components/utils/util_axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import UDEPointsHistory from "./UsersPointsHistory/UDEPointsHistory";
import UserPointsEdit from "./UsersPointsEdit/UserPointsEdit";
import CommonDialog from "@components/commons/CommonDialog";
import UserDetailRecordActiveCalories from "./UsersDetailRecords/UserDetailRecordActiveCalories";
import UserDetailRecordHeartRate from "./UsersDetailRecords/UserDetailRecordHeartRate";
import UserDetailRecordDistance from "./UsersDetailRecords/UserDetailRecordDistance";
import UserDetailRecordOxygenSaturation from "./UsersDetailRecords/UserDetailRecordOxygenSaturation";
import UserDetailRecordRestingHeartRate from "./UsersDetailRecords/UserDetailRecordRestingHeartRate";
import UserDetailRecordSteps from "./UsersDetailRecords/UserDetailRecordSteps";
import UserDetailRecordTotalCalories from "./UsersDetailRecords/UserDetailRecordTotalCalories";
import UserDetailRecordSleepSession from "./UsersDetailRecords/UserDetailRecordSleepSession";
import UserDetailRecordExerciseSession from "./UsersDetailRecords/UserDetailRecordExerciseSession";
import { sendErrorToast, sendSuccessToast } from "@components/utils/util_toastify";

function PersonalDetails({ user, loading, onUdeBasicProfile }: any) {
  const getGenderIcon = () => {
    if (!user?.gender) return null;
    switch (user.gender.toLowerCase()) {
      case "male":
        return <MaleIcon fontSize="small" />;
      case "female":
        return <FemaleIcon fontSize="small" />;
      default:
        return <TransgenderIcon fontSize="small" />;
    }
  };

  return (
    <div className="personal-details">
      <div className="label">
        <p>Personal Details</p>
        {!loading && (
          <IconButton className="btn-edit" onClick={onUdeBasicProfile}>
            <EditOutlinedIcon />
          </IconButton>
        )}
      </div>
      <div className="items">
        <div className="item">
          <PersonIcon className="item-icon" />
          <div className="item-meta">
            <p className="label">Full name</p>
            {loading ? (
              <Skeleton width={150} />
            ) : (
              <p className="value">{user?.name || "N/A"}</p>
            )}
          </div>
        </div>
        <div className="item">
          <CakeIcon className="item-icon" />
          <div className="item-meta">
            <p className="label">Birth Date</p>
            {loading ? (
              <Skeleton width={100} />
            ) : (
              <p className="value">
                {user?.birth_date
                  ? new Date(user.birth_date).toLocaleDateString()
                  : "N/A"}
              </p>
            )}
          </div>
        </div>
        <div className="item">
          <EmailIcon className="item-icon" />
          <div className="item-meta">
            <p className="label">Email</p>
            {loading ? (
              <Skeleton width={200} />
            ) : (
              <p className="value">{user?.email || "N/A"}</p>
            )}
          </div>
        </div>
        {user?.phone_number && (
          <div className="item">
            <PhoneIcon className="item-icon" />
            <div className="item-meta">
              <p className="label">Phone</p>
              {loading ? (
                <Skeleton width={120} />
              ) : (
                <p className="value">{`${user.phone_code || ""} ${
                  user.phone_number
                }`}</p>
              )}
            </div>
          </div>
        )}
        {(user?.address1 || user?.address2) && (
          <div className="item">
            <HomeIcon className="item-icon" />
            <div className="item-meta">
              <p className="label">Address</p>
              {loading ? (
                <Skeleton width={180} />
              ) : (
                <p className="value">
                  {`${user.address1 || ""} ${user.address2 || ""} ${
                    user.zip_code || ""
                  }`.trim()}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="item">
          <BadgeIcon className="item-icon" />
          <div className="item-meta">
            <p className="label">Role</p>
            {loading ? (
              <Skeleton width={100} />
            ) : (
              <div className="value">
                {user?.roles?.map((role: string) => (
                  <Chip
                    key={role}
                    label={role}
                    size="small"
                    sx={{ mr: 0.5, textTransform: "capitalize" }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="item">
          <CircleIcon className="item-icon" />
          <div className="item-meta">
            <p className="label">Status</p>
            {loading ? (
              <Skeleton width={80} />
            ) : (
              <Chip
                label={user?.is_active ? "Active" : "Inactive"}
                color={user?.is_active ? "success" : "error"}
                size="small"
              />
            )}
          </div>
        </div>
        <div className="item">
          {getGenderIcon() || <PersonIcon className="item-icon" />}
          <div className="item-meta">
            <p className="label">Gender</p>
            {loading ? (
              <Skeleton width={80} />
            ) : (
              <p className="value">{user?.gender || "N/A"}</p>
            )}
          </div>
        </div>
        <div className="item">
          <EventIcon className="item-icon" />
          <div className="item-meta">
            <p className="label">Created</p>
            {loading ? (
              <Skeleton width={150} />
            ) : (
              <p className="value">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleString()
                  : "N/A"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpertApproval({ 
  user, 
  loading,
  onApproveExpert,
  onRevokeExpert 
}: { 
  user: any; 
  loading: boolean;
  onApproveExpert: () => void;
  onRevokeExpert: () => void;
}) {
  const [isExpert, setIsExpert] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    if (user) {
      const hasExpertRole = user?.roles?.some((role: string) => 
        role.toLowerCase() === 'expert'
      );
      setIsExpert(hasExpertRole);
    }
  }, [user]);

  const handleToggle = () => {
    if (isExpert) {
      onRevokeExpert();
    } else {
      setConfirmDialog(true);
    }
  };

  const handleConfirm = () => {
    setConfirmDialog(false);
    onApproveExpert();
  };

  return (
    <div className="expert-approval">
      <div className="header">
        <p className="label">Expert Approval</p>
      </div>
      <div className="expert-approval-content">
        {loading ? (
          <Skeleton width={100} height={40} />
        ) : (
          <div className="toggle-container">
            <p className="status-text">
              Status: <span className={isExpert ? 'approved' : 'not-approved'}>{isExpert ? 'Approved' : 'Not Approved'}</span>
            </p>
            <Button
              variant="contained"
              className="toggle-button"
              color={isExpert ? 'error' : 'primary'}
              onClick={handleToggle}
            >
              {isExpert ? 'Revoke Approval' : 'Approve as Expert'}
            </Button>
          </div>
        )}
      </div>

      <CommonDialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        title="Confirm Expert Approval"
        maxWidth="sm"
        footer={
          <Box style={{display: 'flex', gap: 10}}>
            <Button 
              variant="outlined" 
              onClick={() => setConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          </Box>
        }
      >
        <p style={{ padding: '1rem' }}>Are you sure you want to approve this user as an expert?</p>
      </CommonDialog>
    </div>
  );
}

function CommunityActivity({
  loading,
  stats,
}: {
  loading: boolean;
  stats: any;
}) {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Posts",
        data: [5, 10, 15, 8, 20, 25, 30],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="community-activity">
      <p className="label">Community Activity</p>
      <div className="stats">
        <div className="stat">
          <ThumbUpOutlinedIcon className="stat-icon" />
          {loading ? (
            <Skeleton width={30} />
          ) : (
            <p className="stat-value">{stats?.total_likes_received || 0}</p>
          )}
          <p className="stat-label">Upvotes</p>
        </div>
        <div className="stat">
          <ThumbDownOffAltOutlinedIcon className="stat-icon" />
          {loading ? (
            <Skeleton width={30} />
          ) : (
            <p className="stat-value">{stats?.total_dislikes_received || 0}</p>
          )}
          <p className="stat-label">Downvotes</p>
        </div>
        <div className="stat">
          <ModeCommentOutlinedIcon className="stat-icon" />
          {loading ? (
            <Skeleton width={30} />
          ) : (
            <p className="stat-value">{stats?.total_comments_received || 0}</p>
          )}
          <p className="stat-label">Comments</p>
        </div>
      </div>
      <div className="activity-graph">
        <p className="label">Posting Activity</p>
        <div className="graph">
          {loading ? (
            <Skeleton height={200} />
          ) : (
            <Bar data={data} options={options} />
          )}
        </div>
      </div>
      <Link to="/posts">
        <p className="btn-view-all">View all</p>
      </Link>
    </div>
  );
}

function LoginInformation({ user, loading }: { user: any; loading: boolean }) {
  return (
    <div className="login-information">
      <p className="label">Login Information</p>
      <div className="login-information-content">
        <div className="login-method">
          <p className="label">Primary Login Method</p>
          {loading ? (
            <Skeleton height={50} />
          ) : (
            <div className="login-method-content">
              <GoogleIcon className="logo-google" />
              <div className="meta">
                <p className="meta-label">Google Account</p>
                <p className="meta-email">{user?.email || "N/A"}</p>
              </div>
            </div>
          )}
        </div>
        <div className="security-method">
          <p className="label">Security Accounts</p>
          {loading ? (
            <Skeleton height={50} />
          ) : (
            <div className="security-method-content">
              <div className="item">
                <div className="item-meta">
                  <LockClockOutlinedIcon className="logo-lock" />
                  <p className="meta-label">Password Reset Required</p>
                </div>
                <p
                  className={`item-active ${
                    user?.isResetPassAllowed ? "active" : ""
                  }`}
                >
                  {user?.isResetPassAllowed ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PointInformation({
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
    <div className="point-information">
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

function RecordsSection({
  loading,
  onViewRecord,
}: {
  loading: boolean;
  onViewRecord: (record: string) => void;
}) {
  const records = [
    "Active Calories",
    "Distance",
    "Exercise Session",
    "Heart Rate",
    "Oxygen Saturation",
    "Resting Heart Rate",
    "Sleep Session",
    "Steps",
    "Total Calories",
  ];

  return (
    <div className="records-section">
      <p className="label">Records</p>
      <div className="records-grid">
        {records.map((record) => (
          <Button
            key={record}
            variant="outlined"
            className="record-button"
            onClick={() => onViewRecord(record)}
            disabled={loading}
          >
            {`View ${record}`}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ChatHistoryLog({ loading, stats }: { loading: boolean; stats: any }) {
  return (
    <div className="chat-history-log">
      <p className="label">Chat History</p>
      <div className="chat-history-log-content">
        <div className="session-item">
          {loading ? (
            <Skeleton width={50} />
          ) : (
            <p className="session-value session-value-expert">
              {stats?.total_chat_sessions || 0}
            </p>
          )}
          <p className="session-label">with Experts</p>
          <p className="session-viewmore">View more</p>
        </div>
        <div className="session-item">
          {loading ? (
            <Skeleton width={50} />
          ) : (
            <p className="session-value session-value-ai">
              {stats?.total_active_chat_sessions || 0}
            </p>
          )}
          <p className="session-label">with AI</p>
          <p className="session-viewmore">View more</p>
        </div>
      </div>
    </div>
  );
}

export default function UsersDetailPage() {
  const [udeBasicProfile, setUdeBasicProfile] = useState(false);
  const [udePointsHistory, setUdePointsHistory] = useState(false);
  const [userPointsEdit, setUserPointsEdit] = useState(false);
  const [userRecordDialog, setUserRecordDialog] = useState<{
    open: boolean;
    record: string;
  }>({ open: false, record: "" });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await aget(`/users/admin/${id}`);
      setUser(response.data.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      sendErrorToast("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleShowHistory = () => {
    setUdePointsHistory(true);
  };

  const handleEditPoints = () => {
    setUserPointsEdit(true);
  };

  const handlePointsUpdated = () => {
    fetchUser();
    setUserPointsEdit(false);
  };

  const handleViewRecord = (record: string) => {
    setUserRecordDialog({ open: true, record });
  };

  const handleCloseRecordDialog = () => {
    setUserRecordDialog({ open: false, record: "" });
  };

  const approveExpert = async () => {
    try {
      await aput(`/admins/approve-expert/${id}`);
      sendSuccessToast("User approved as expert successfully");
      fetchUser();
    } catch (error) {
      console.error("Error approving expert:", error);
      sendErrorToast("Failed to approve expert");
    }
  };

  const revokeExpert = async () => {
    try {
      await aput(`/admins/revoke-expert/${id}`);
      sendSuccessToast("Expert privileges revoked successfully");
      fetchUser();
    } catch (error) {
      console.error("Error revoking expert:", error);
      sendErrorToast("Failed to revoke expert privileges");
    }
  };

  return (
    <div className="users-detail-page">
      <CommonBreadcrumb
        items={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Users", link: "/users" },
          { name: loading ? "Loading..." : user?.username || "User" },
        ]}
      />
      <div className="profile-card">
        <div className="left">
          {loading ? (
            <Skeleton circle height={64} width={64} />
          ) : (
            <Avatar className="avatar">
              {user?.username?.charAt(0) || "U"}
            </Avatar>
          )}
          <div>
            <div className="name">
              {loading ? (
                <Skeleton width={150} />
              ) : (
                <>
                  {user?.username}
                  <span
                    className={`status ${
                      user?.is_active ? "active" : "inactive"
                    }`}
                  >
                    {user?.is_active ? "Active" : "Inactive"}
                  </span>
                </>
              )}
            </div>
            <div className="role">
              {loading ? (
                <Skeleton width={100} />
              ) : (
                user?.roles?.join(", ") || "No role"
              )}
            </div>
            <div className="id">
              {loading ? <Skeleton width={120} /> : `ID: ${user?.id || "N/A"}`}
            </div>
          </div>
        </div>
        <div className="right">
          {loading ? (
            <>
              <Skeleton
                width={120}
                height={36}
                style={{ marginRight: "10px" }}
              />
              <Skeleton width={100} height={36} />
            </>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<DoNotDisturbAltIcon />}
                className="btn-suspend"
              >
                Suspend
              </Button>
              <Button
                variant="contained"
                startIcon={<DeleteOutlineIcon />}
                className="btn-delete"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="rows">
        <div className="row">
          <PersonalDetails
            user={user}
            loading={loading}
            onUdeBasicProfile={() => setUdeBasicProfile(true)}
          />
          <ExpertApproval
            user={user}
            loading={loading}
            onApproveExpert={approveExpert}
            onRevokeExpert={revokeExpert}
          />
          <PointInformation
            user={user}
            loading={loading}
            onShowHistory={handleShowHistory}
            onEditPoints={handleEditPoints}
          />
          <RecordsSection loading={loading} onViewRecord={handleViewRecord} />
          <CommunityActivity loading={loading} stats={user?.stats} />
          <ChatHistoryLog loading={loading} stats={user?.stats} />
        </div>
        <div className="row">
          <LoginInformation user={user} loading={loading} />
        </div>
      </div>
      {user && (
        <>
          <UDEBasicProfile
            open={udeBasicProfile}
            onClose={() => setUdeBasicProfile(false)}
            user={user}
            onSave={fetchUser}
          />
          <UDEPointsHistory
            open={udePointsHistory}
            onClose={() => setUdePointsHistory(false)}
            userId={user.id}
          />
          <UserPointsEdit
            open={userPointsEdit}
            onClose={() => setUserPointsEdit(false)}
            userId={user.id}
            onPointsUpdated={handlePointsUpdated}
          />
          {userRecordDialog.open &&
            userRecordDialog.record === "Active Calories" && (
              <CommonDialog
                title="Active Calories Records"
                maxWidth="lg"
                open={userRecordDialog.open}
                onClose={handleCloseRecordDialog}
                footer={
                  <Button variant="contained" onClick={handleCloseRecordDialog}>
                    Close
                  </Button>
                }
              >
                <UserDetailRecordActiveCalories userId={user.id} />
              </CommonDialog>
            )}
          {userRecordDialog.open &&
            userRecordDialog.record === "Heart Rate" && (
              <CommonDialog
                title="Heart Rate Records"
                maxWidth="lg"
                open={userRecordDialog.open}
                onClose={handleCloseRecordDialog}
                footer={
                  <Button variant="contained" onClick={handleCloseRecordDialog}>
                    Close
                  </Button>
                }
              >
                <UserDetailRecordHeartRate userId={user.id} />
              </CommonDialog>
            )}
          {userRecordDialog.open && userRecordDialog.record === "Distance" && (
            <CommonDialog
              title="Distance Records"
              maxWidth="lg"
              open={userRecordDialog.open}
              onClose={handleCloseRecordDialog}
              footer={
                <Button variant="contained" onClick={handleCloseRecordDialog}>
                  Close
                </Button>
              }
            >
              <UserDetailRecordDistance userId={user.id} />
            </CommonDialog>
          )}
          {userRecordDialog.open &&
            userRecordDialog.record === "Oxygen Saturation" && (
              <CommonDialog
                title="Oxygen Saturation (SpO2) Records"
                maxWidth="lg"
                open={userRecordDialog.open}
                onClose={handleCloseRecordDialog}
                footer={
                  <Button variant="contained" onClick={handleCloseRecordDialog}>
                    Close
                  </Button>
                }
              >
                <UserDetailRecordOxygenSaturation userId={user.id} />
              </CommonDialog>
            )}
          {userRecordDialog.open &&
            userRecordDialog.record === "Resting Heart Rate" && (
              <CommonDialog
                title="Resting Heart Rate Records"
                maxWidth="lg"
                open={userRecordDialog.open}
                onClose={handleCloseRecordDialog}
                footer={
                  <Button variant="contained" onClick={handleCloseRecordDialog}>
                    Close
                  </Button>
                }
              >
                <UserDetailRecordRestingHeartRate userId={user.id} />
              </CommonDialog>
            )}
          {userRecordDialog.open && userRecordDialog.record === "Steps" && (
            <CommonDialog
              title="Steps Records"
              maxWidth="lg"
              open={userRecordDialog.open}
              onClose={handleCloseRecordDialog}
              footer={
                <Button variant="contained" onClick={handleCloseRecordDialog}>
                  Close
                </Button>
              }
            >
              <UserDetailRecordSteps userId={user.id} />
            </CommonDialog>
          )}
          {userRecordDialog.open && userRecordDialog.record === "Total Calories" && (
            <CommonDialog
              title="Total Calories Burned Records"
              maxWidth="lg"
              open={userRecordDialog.open}
              onClose={handleCloseRecordDialog}
              footer={
                <Button variant="contained" onClick={handleCloseRecordDialog}>
                  Close
                </Button>
              }
            >
              <UserDetailRecordTotalCalories userId={user.id} />
            </CommonDialog>
          )}
          {userRecordDialog.open && userRecordDialog.record === "Sleep Session" && (
            <CommonDialog
              title="Sleep Session Records"
              maxWidth="lg"
              open={userRecordDialog.open}
              onClose={handleCloseRecordDialog}
              footer={
                <Button variant="contained" onClick={handleCloseRecordDialog}>
                  Close
                </Button>
              }
            >
              <UserDetailRecordSleepSession userId={user.id} />
            </CommonDialog>
          )}
          {userRecordDialog.open && userRecordDialog.record === "Exercise Session" && (
            <CommonDialog
              title="Exercise Session Records"
              maxWidth="lg"
              open={userRecordDialog.open}
              onClose={handleCloseRecordDialog}
              footer={
                <Button variant="contained" onClick={handleCloseRecordDialog}>
                  Close
                </Button>
              }
            >
              <UserDetailRecordExerciseSession userId={user.id} />
            </CommonDialog>
          )}
        </>
      )}
    </div>
  );
}