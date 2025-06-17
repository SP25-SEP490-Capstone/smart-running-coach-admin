import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  IconButton,
  Chip,
} from "@mui/material";
import { Check, Close, AccessTime } from "@mui/icons-material";
import "./CertificatesDetailPage.scss";
import { useParams, Link } from "react-router-dom";
import CommonBreadcrumb from "@components/commons/CommonBreadcrumb";
import { aget, apost } from "@components/utils/util_axios";
import { CommonAvatar } from "@components/commons/CommonAvatar";
import { sendSuccessToast, sendErrorToast } from "@components/utils/util_toastify";
import { capitalizeFirstLetter } from "@components/utils/util_format";

interface Certificate {
  id: string;
  certificateType: string;
  description: string;
  imageId: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface User {
  id: string;
  name: string;
  username: string;
  gender: string;
  email: string;
  image?: {
    url: string;
  };
  points: number;
  user_level: string;
  roles: string[];
}

interface ApiResponse {
  success: boolean;
  data: {
    user: User;
    certificates: Certificate[];
  };
}

export default function CertificatesDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificateStatuses, setCertificateStatuses] = useState<{
    [key: string]: { status: string; rejectReason: string | null };
  }>({});

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await aget(`/user-certificates/admin/user/${userId}`);
      setData(response.data);
      const initialStatuses = response.data.data.certificates.reduce(
        (acc: any, cert: Certificate) => ({
          ...acc,
          [cert.id]: { status: cert.status, rejectReason: cert.rejectReason },
        }),
        {}
      );
      setCertificateStatuses(initialStatuses);
    } catch (err) {
      setError("Failed to load certificate data");
      sendErrorToast("Failed to load certificate data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCertificates();
    }
  }, [userId]);

  const handleStatusChange = (certificateId: string, newStatus: string) => {
    setCertificateStatuses((prev) => ({
      ...prev,
      [certificateId]: {
        ...prev[certificateId],
        status: newStatus,
        rejectReason:
          newStatus !== "REJECTED" ? null : prev[certificateId].rejectReason,
      },
    }));
  };

  const handleRejectReasonChange = (
    certificateId: string,
    rejectReason: string
  ) => {
    setCertificateStatuses((prev) => ({
      ...prev,
      [certificateId]: {
        ...prev[certificateId],
        rejectReason,
      },
    }));
  };

  const handleApply = async (certificateId: string) => {
    try {
      const { status, rejectReason } = certificateStatuses[certificateId];
      if (status === "REJECTED" && !rejectReason) {
        sendErrorToast("Reject reason is required for REJECTED status");
        return;
      }
      const response = await apost("/user-certificates/admin/update", {
        certificateId,
        status,
        rejectReason: status === "REJECTED" ? rejectReason : null,
      });
      if (response.data.status === "success") {
        sendSuccessToast("Certificate status updated successfully");
        setCertificateStatuses((prev) => ({
          ...prev,
          [certificateId]: {
            status: response.data.data.status,
            rejectReason: response.data.data.rejectReason,
          },
        }));
      }
    } catch (error: any) {
      sendErrorToast(
        error.response?.data?.message || "Failed to update certificate status"
      );
      console.error(error);
    }
  };

  const handleRoleSwitch = async () => {
    try {
      const response = await apost(
        `/user-certificates/admin/toggle-expert/${userId}`,
        {}
      );
      if (response.data.status === "success") {
        setData((prev) =>
          prev
            ? {
                ...prev,
                data: {
                  ...prev.data,
                  user: {
                    ...prev.data.user,
                    roles: response.data.data.user.roles,
                  },
                },
              }
            : prev
        );
        sendSuccessToast(
          `User ${
            response.data.data.user.roles.includes("expert")
              ? "promoted to"
              : "demoted from"
          } Expert`
        );
      }
    } catch (error: any) {
      sendErrorToast(
        error.response?.data?.message || "Failed to toggle expert status"
      );
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box className="certificates-detail-page loading">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Box className="certificates-detail-page error">{error}</Box>;
  }

  if (!data) {
    return <Box className="certificates-detail-page">User not found</Box>;
  }

  const { user, certificates } = data.data;

  // Define all possible certificate types in the desired order
  const certificateOrder = [
    "CITIZEN_DOCUMENT_FRONT",
    "CITIZEN_DOCUMENT_BACK",
    ...new Set(
      certificates
        .map((cert) => cert.certificateType)
        .filter(
          (type) =>
            type !== "CITIZEN_DOCUMENT_FRONT" &&
            type !== "CITIZEN_DOCUMENT_BACK" &&
            type !== "NOTE"
        )
    ),
    "NOTE",
  ];

  // Group certificates by type
  const groupedCertificates: { [key: string]: Certificate[] } = certificateOrder.reduce(
    (acc, type) => ({ ...acc, [type]: [] }),
    {}
  );
  certificates.forEach((cert) => {
    groupedCertificates[cert.certificateType].push(cert);
  });

  return (
    <Box className="certificates-detail-page">
      <CommonBreadcrumb
        items={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Certificates", link: "/certificates" },
          { name: user.name },
        ]}
      />

      <Box className="certificate-container">
        <Box className="certificate-header">
          <p className="user-id">User ID: {user.id}</p>
          <Typography variant="h4" className="certificate-title">
            Certificates for {user.name}
            {user?.roles?.includes("expert") && (
              <Chip
                label="Expert"
                size="small"
                color="warning"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>

          <Box className="certificate-meta">
            <CommonAvatar uri={user.image?.url} />
            <Box>
              <Link to={`/users/${user.id}`}>
                <Typography className="author">
                  {user.name}{" "}
                  <span className="author-username">@{user.username}</span>
                </Typography>
              </Link>
              <Typography className="details" variant="caption">
                Email: {user.email} | Points: {user.points} | Level:{" "}
                {capitalizeFirstLetter(user.user_level, true)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="certificate-content">
          {certificateOrder.map((certType, index) => {
            const certs = groupedCertificates[certType];
            if (certs.length === 0 && certType !== "CITIZEN_DOCUMENT_FRONT" && certType !== "CITIZEN_DOCUMENT_BACK") {
              return null; // Skip empty sections except for citizen documents
            }

            if (certType === "CITIZEN_DOCUMENT_FRONT" || certType === "CITIZEN_DOCUMENT_BACK") {
              // Handle citizen documents as a pair
              if (index !== 0) return null; // Only render once for CITIZEN_DOCUMENT_FRONT
              const citizenFront = groupedCertificates["CITIZEN_DOCUMENT_FRONT"][0];
              const citizenBack = groupedCertificates["CITIZEN_DOCUMENT_BACK"][0];

              return (
                <Box key="citizen-documents" className="certificate-section citizen-documents">
                  <Typography className="section-title">Citizen Documents</Typography>
                  <Box className="citizen-document-pair">
                    {citizenFront && (
                      <Box
                        className={`document-item status-${certificateStatuses[citizenFront.id]?.status.toLowerCase()}`}
                      >
                        <Typography variant="subtitle2">Front</Typography>
                        <img
                          src={citizenFront.description}
                          alt="Citizen Document Front"
                          className="document-image"
                        />
                        <Box className="document-controls">
                          <Box className="status-control">
                            <Select
                              value={certificateStatuses[citizenFront.id]?.status || "PENDING"}
                              onChange={(e) =>
                                handleStatusChange(citizenFront.id, e.target.value)
                              }
                              size="small"
                              sx={{ flex: 1 }}
                              renderValue={(value) => (
                                <Box className="status-select-value">
                                  <span className={`status-icon status-${value.toLowerCase()}`}>
                                    {value === "ACCEPTED" && <Check />}
                                    {value === "PENDING" && <AccessTime />}
                                    {value === "REJECTED" && <Close />}
                                  </span>
                                  {value}
                                </Box>
                              )}
                            >
                              <MenuItem value="ACCEPTED">
                                <Check className="status-icon status-accepted" />
                                Accepted
                              </MenuItem>
                              <MenuItem value="REJECTED">
                                <Close className="status-icon status-rejected" />
                                Rejected
                              </MenuItem>
                              <MenuItem value="PENDING">
                                <AccessTime className="status-icon status-pending" />
                                Pending
                              </MenuItem>
                            </Select>
                            <IconButton
                              size="small"
                              className="apply-button"
                              onClick={() => handleApply(citizenFront.id)}
                            >
                              <Check />
                            </IconButton>
                          </Box>
                          {certificateStatuses[citizenFront.id]?.status === "REJECTED" && (
                            <TextField
                              label="Reject Reason"
                              value={certificateStatuses[citizenFront.id]?.rejectReason || ""}
                              onChange={(e) =>
                                handleRejectReasonChange(citizenFront.id, e.target.value)
                              }
                              size="small"
                              fullWidth
                              multiline
                              rows={2}
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          Created: {formatDate(citizenFront.createdAt)}
                          {citizenFront.updatedAt &&
                            ` | Updated: ${formatDate(citizenFront.updatedAt)}`}
                        </Typography>
                      </Box>
                    )}
                    {citizenBack && (
                      <Box
                        className={`document-item status-${certificateStatuses[citizenBack.id]?.status.toLowerCase()}`}
                      >
                        <Typography variant="subtitle2">Back</Typography>
                        <img
                          src={citizenBack.description}
                          alt="Citizen Document Back"
                          className="document-image"
                        />
                        <Box className="document-controls">
                          <Box className="status-control">
                            <Select
                              value={certificateStatuses[citizenBack.id]?.status || "PENDING"}
                              onChange={(e) =>
                                handleStatusChange(citizenBack.id, e.target.value)
                              }
                              size="small"
                              sx={{ flex: 1 }}
                              renderValue={(value) => (
                                <Box className="status-select-value">
                                  <span className={`status-icon status-${value.toLowerCase()}`}>
                                    {value === "ACCEPTED" && <Check />}
                                    {value === "PENDING" && <AccessTime />}
                                    {value === "REJECTED" && <Close />}
                                  </span>
                                  {value}
                                </Box>
                              )}
                            >
                              <MenuItem value="ACCEPTED">
                                <Check className="status-icon status-accepted" />
                                Accepted
                              </MenuItem>
                              <MenuItem value="REJECTED">
                                <Close className="status-icon status-rejected" />
                                Rejected
                              </MenuItem>
                              <MenuItem value="PENDING">
                                <AccessTime className="status-icon status-pending" />
                                Pending
                              </MenuItem>
                            </Select>
                            <IconButton
                              size="small"
                              className="apply-button"
                              onClick={() => handleApply(citizenBack.id)}
                            >
                              <Check />
                            </IconButton>
                          </Box>
                          {certificateStatuses[citizenBack.id]?.status === "REJECTED" && (
                            <TextField
                              label="Reject Reason"
                              value={certificateStatuses[citizenBack.id]?.rejectReason || ""}
                              onChange={(e) =>
                                handleRejectReasonChange(citizenBack.id, e.target.value)
                              }
                              size="small"
                              fullWidth
                              multiline
                              rows={2}
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          Created: {formatDate(citizenBack.createdAt)}
                          {citizenBack.updatedAt &&
                            ` | Updated: ${formatDate(citizenBack.updatedAt)}`}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            }

            // Handle other certificate types
            return (
              <Box
                key={certType}
                className={`certificate-section ${certType.toLowerCase()}-documents`}
              >
                <Typography className="section-title">
                  {certType === "NOTE" ? "Notes" : `${capitalizeFirstLetter(certType?.toLowerCase(), true)}`}
                </Typography>
                {certs.map((doc) => (
                  <Box
                    key={doc.id}
                    className={`document-item status-${certificateStatuses[doc.id]?.status.toLowerCase()}`}
                  >
                    {certType === "NOTE" ? (
                      <Typography variant="body2" className="note-text">
                        {doc.description}
                      </Typography>
                    ) : (
                      <a
                        href={doc.description}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="document-link"
                      >
                        {doc.description}
                      </a>
                    )}
                    <Box className="document-controls">
                      <Box className="status-control">
                        <Select
                          value={certificateStatuses[doc.id]?.status || "PENDING"}
                          onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                          size="small"
                          sx={{ flex: 1 }}
                          renderValue={(value) => (
                            <Box className="status-select-value">
                              <span className={`status-icon status-${value.toLowerCase()}`}>
                                {value === "ACCEPTED" && <Check />}
                                {value === "PENDING" && <AccessTime />}
                                {value === "REJECTED" && <Close />}
                              </span>
                              {value}
                            </Box>
                          )}
                        >
                          <MenuItem value="ACCEPTED">
                            <Check className="status-icon status-accepted" />
                            Accepted
                          </MenuItem>
                          <MenuItem value="REJECTED">
                            <Close className="status-icon status-rejected" />
                            Rejected
                          </MenuItem>
                          <MenuItem value="PENDING">
                            <AccessTime className="status-icon status-pending" />
                            Pending
                          </MenuItem>
                        </Select>
                        <IconButton
                          size="small"
                          className="apply-button"
                          onClick={() => handleApply(doc.id)}
                        >
                          <Check />
                        </IconButton>
                      </Box>
                      {certificateStatuses[doc.id]?.status === "REJECTED" && (
                        <TextField
                          label="Reject Reason"
                          value={certificateStatuses[doc.id]?.rejectReason || ""}
                          onChange={(e) =>
                            handleRejectReasonChange(doc.id, e.target.value)
                          }
                          size="small"
                          fullWidth
                          multiline
                          rows={2}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Created: {formatDate(doc.createdAt)}
                      {doc.updatedAt && ` | Updated: ${formatDate(doc.updatedAt)}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>

        <Box className="certificate-actions">
          <Button
            variant="contained"
            color="primary"
            onClick={handleRoleSwitch}
          >
            {user.roles.includes("expert") ? "Demote from Expert" : "Promote to Expert"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}