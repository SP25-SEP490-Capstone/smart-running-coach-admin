import { Button, Box } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDownOffAltOutlined as ThumbDownOffAltOutlinedIcon,
  ModeCommentOutlined as ModeCommentOutlinedIcon,
  Google as GoogleIcon,
  LockClockOutlined as LockClockOutlinedIcon,
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
import UDESuspendDialog from "./UsersSuspend/UDESuspendDialog";
import {
  sendErrorToast,
  sendSuccessToast,
} from "@components/utils/util_toastify";
import { UDPPersonalDetails } from "./UDPPersonalDetails";
import UDPPointsInformation from "./UDPPointsInformation";
import UDPProfileCard from "./UDPProfileCard";
import UDPCommunityActivity from "./UDPCommunityActivity";
import { UDPRecentActivity } from "./UDPRecentActivity";
import { UDPLoginInformation } from "./UDPLoginInformation";
import UDPRecordsSection from "./UDPRecordsSection";
import UDPExpertApproval from "./UDPExpertApproval";

function ExpertApproval({
  user,
  loading,
  onApproveExpert,
  onRevokeExpert,
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
      const hasExpertRole = user?.roles?.some(
        (role: string) => role.toLowerCase() === "expert"
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
              Status:{" "}
              <span className={isExpert ? "approved" : "not-approved"}>
                {isExpert ? "Approved" : "Not Approved"}
              </span>
            </p>
            <Button
              variant="contained"
              className="toggle-button"
              color={isExpert ? "error" : "primary"}
              onClick={handleToggle}
            >
              {isExpert ? "Revoke Approval" : "Approve as Expert"}
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
          <Box style={{ display: "flex", gap: 10 }}>
            <Button variant="outlined" onClick={() => setConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleConfirm}>
              Confirm
            </Button>
          </Box>
        }
      >
        <p style={{ padding: "1rem" }}>
          Are you sure you want to approve this user as an expert?
        </p>
      </CommonDialog>
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
  const [suspendDialog, setSuspendDialog] = useState(false);
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
      <UDPProfileCard
        user={user}
        loading={loading}
        setSuspendDialog={setSuspendDialog}
      />
      <div className="rows">
        <div className="row">
          <UDPPersonalDetails
            user={user}
            loading={loading}
            onUdeBasicProfile={() => setUdeBasicProfile(true)}
          />
          <UDPExpertApproval
            user={user}
            loading={loading}
          />
          <UDPPointsInformation
            user={user}
            loading={loading}
            onShowHistory={handleShowHistory}
            onEditPoints={handleEditPoints}
          />
          <UDPRecordsSection
            loading={loading}
            onViewRecord={handleViewRecord}
          />
          <UDPCommunityActivity loading={loading} user={user} />
          <ChatHistoryLog loading={loading} stats={user?.stats} />
        </div>
        <div className="row">
          <UDPLoginInformation user={user} loading={loading} />
          <UDPRecentActivity user={user} loading={loading} />
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
          {userRecordDialog.open &&
            userRecordDialog.record === "Total Calories" && (
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
          {userRecordDialog.open &&
            userRecordDialog.record === "Sleep Session" && (
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
          {userRecordDialog.open &&
            userRecordDialog.record === "Exercise Session" && (
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
                <UserDetailRecordExerciseSession userId={user?.id} />
              </CommonDialog>
            )}

          {suspendDialog && (
            <UDESuspendDialog
              open={suspendDialog}
              onClose={() => setSuspendDialog(false)}
              userId={user.id}
              isActive={user.is_active}
              onSuspendSuccess={fetchUser}
            />
          )}
        </>
      )}
    </div>
  );
}
