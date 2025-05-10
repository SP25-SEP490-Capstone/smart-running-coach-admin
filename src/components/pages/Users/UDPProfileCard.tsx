import { Button } from "@mui/material";
import "chart.js/auto";
import "./UDPProfileCard.scss";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { CommonAvatar } from "@components/commons/CommonAvatar";
import { DoNotDisturbAlt } from "@mui/icons-material";

export default function UDPProfileCard({
  user,
  loading,
  setSuspendDialog,
}: any) {
  return (
    <div className="udp-profile-card">
      <div className="left">
        {loading ? (
          <Skeleton circle height={64} width={64} />
        ) : (
          <CommonAvatar uri={user.image?.url} size={50} />
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
            <Skeleton width={120} height={36} style={{ marginRight: "10px" }} />
            <Skeleton width={100} height={36} />
          </>
        ) : (
          <>
            <Button
              variant="contained"
              startIcon={<DoNotDisturbAlt />}
              className="btn-suspend"
              onClick={() => setSuspendDialog(true)}
            >
              {user?.is_active ? "Suspend" : "Activate"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
