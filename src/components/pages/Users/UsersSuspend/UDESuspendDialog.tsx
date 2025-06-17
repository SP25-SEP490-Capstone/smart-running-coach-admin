import { useState } from "react";
import { Button } from "@mui/material";
import CommonDialog from "@components/commons/CommonDialog";
import { aput } from "@components/utils/util_axios";
import {
  sendSuccessToast,
  sendErrorToast,
} from "@components/utils/util_toastify";

interface UDESuspendDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  isActive: boolean;
  onSuspendSuccess: () => void;
}

export default function UDESuspendDialog({
  open,
  onClose,
  userId,
  isActive,
  onSuspendSuccess,
}: UDESuspendDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSuspend = async () => {
    try {
      setLoading(true);
      let result = await aput("/users/admin/suspend", {
        userId,
        suspend: isActive,
      });
      if (result.data.success) {
        sendSuccessToast(
          `User has been ${isActive ? "suspended" : "activated"} successfully`
        );
      } else {
        sendErrorToast(result.data.message);
      }

      onSuspendSuccess();
      onClose();
    } catch (error) {
      console.error("Error suspending user:", error);
      sendErrorToast(`Failed to ${isActive ? "suspend" : "activate"} user`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommonDialog
      open={open}
      onClose={onClose}
      title={`${isActive ? "Suspend" : "Activate"} User`}
      maxWidth="sm"
      footer={
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={isActive ? "error" : "success"}
            onClick={handleSuspend}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : isActive
              ? "Confirm Suspend"
              : "Confirm Activate"}
          </Button>
        </div>
      }
    >
      <p style={{ padding: "1rem" }}>
        Are you sure you want to {isActive ? "suspend" : "activate"} this user?{" "}
        {isActive
          ? "The user will no longer be able to access their account."
          : "The user will regain access to their account."}
      </p>
    </CommonDialog>
  );
}
