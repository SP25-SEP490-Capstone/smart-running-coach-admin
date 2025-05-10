import { Button, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { aput } from "@components/utils/util_axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import CommonDialog from "@components/commons/CommonDialog";
import {
  sendErrorToast,
  sendSuccessToast,
} from "@components/utils/util_toastify";
import "./UDPExpertApproval.scss";

export default function UDPExpertApproval({
  user,
  loading,
}: any) {
  const [isExpert, setIsExpert] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const userId = user?.id;
  const userRoles = user?.roles;

  useEffect(() => {
    if (userRoles) {
      const hasExpertRole = userRoles.some(
        (role: string) => role.toLowerCase() === "expert"
      );
      setIsExpert(hasExpertRole);
    }
  }, [userRoles]);

  const approveExpert = async () => {
    try {
      await aput(`/admins/approve-expert/${userId}`);
      sendSuccessToast("User approved as expert successfully");
      setIsExpert(true);
    } catch (error) {
      console.error("Error approving expert:", error);
      sendErrorToast("Failed to approve expert");
    }
  };

  const revokeExpert = async () => {
    try {
      await aput(`/admins/revoke-expert/${userId}`);
      sendSuccessToast("Expert privileges revoked successfully");
      setIsExpert(false);
    } catch (error) {
      console.error("Error revoking expert:", error);
      sendErrorToast("Failed to revoke expert privileges");
    }
  };

  const handleToggle = () => {
    if (isExpert) {
      revokeExpert();
    } else {
      setConfirmDialog(true);
    }
  };

  const handleConfirm = () => {
    setConfirmDialog(false);
    approveExpert();
  };

  return (
    <div className="udp-expert-approval">
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
