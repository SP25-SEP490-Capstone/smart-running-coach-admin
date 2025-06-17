import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { Warning, ErrorOutline, Info, FitnessCenter } from "@mui/icons-material";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { format, parseISO } from "date-fns";
import { aget } from "@components/utils/util_axios";
import "./UserDetailRiskAnalysis.scss";

ChartJS.register(ArcElement, Tooltip, Legend);

interface RiskFactor {
  name: string;
  level: string;
  description: string;
}

interface RiskAlert {
  alert_id: string;
  score: number;
  severity: string;
  alert_type: string;
  alert_message: string;
  risk_factors: RiskFactor[];
  heart_rate_danger: number;
  recommendations: string[];
  step: number;
  distance: number;
  heart_rate_min: number;
  heart_rate_max: number;
  pace: number;
  user_id: string;
  created_at: string;
  updated_at: string | null;
}

interface RiskResponse {
  result: {
    status: string;
    message: string;
    data: RiskAlert[];
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right" as const,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return `${context.label}: ${context.raw} factors`;
        },
      },
    },
  },
  cutout: "70%",
};

interface UserDetailRiskAnalysisProps {
  userId: string;
}

export default function UserDetailRiskAnalysis({ userId }: UserDetailRiskAnalysisProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null);
  const [groupedAlerts, setGroupedAlerts] = useState<Record<string, RiskAlert[]>>({});

  const severityColors = {
    High: theme.palette.error.main,
    Moderate: theme.palette.warning.main,
    Normal: theme.palette.info.main,
  };

  useEffect(() => {
    fetchRiskData();
  }, [userId]);

  useEffect(() => {
    if (alerts.length > 0) {
      const grouped: Record<string, RiskAlert[]> = {};

      alerts.forEach((alert) => {
        const dateKey = format(parseISO(alert.created_at), "MMMM do, yyyy");
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(alert);
      });

      setGroupedAlerts(grouped);

      if (!selectedAlert || !alerts.some((a) => a.alert_id === selectedAlert.alert_id)) {
        setSelectedAlert(alerts[0]);
      }
    } else {
      setGroupedAlerts({});
      setSelectedAlert(null);
    }
  }, [alerts]);

  useEffect(() => {
    if (selectedAlert) {
      updateChartData(selectedAlert);
    } else {
      setChartData(null);
    }
  }, [selectedAlert]);

  const fetchRiskData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aget<RiskResponse>(`/ai/admin/get-risk-list/${userId}`);

      if (response.data && Array.isArray(response.data.result.data)) {
        setAlerts(response.data.result.data);
      } else {
        setAlerts([]);
      }
    } catch (err: any) {
      console.error("Error fetching risk data:", err);
      setError(err.message || "Failed to fetch risk data");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateChartData = (alert: RiskAlert) => {
    const riskLevels = {
      High: 0,
      Moderate: 0,
      Normal: 0,
    };

    alert.risk_factors.forEach((factor) => {
      riskLevels[factor.level as keyof typeof riskLevels]++;
    });

    const labels = Object.keys(riskLevels).filter(
      (level) => riskLevels[level as keyof typeof riskLevels] > 0
    );
    const data = labels.map((level) => riskLevels[level as keyof typeof riskLevels]);
    const backgroundColors = labels.map(
      (level) => severityColors[level as keyof typeof severityColors]
    );

    setChartData({
      labels,
      datasets: [
        {
          label: "Risk Factor Levels",
          data,
          backgroundColor: backgroundColors,
          borderColor: theme.palette.background.paper,
          borderWidth: 2,
        },
      ],
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "High":
        return <ErrorOutline />;
      case "Moderate":
        return <Warning />;
      case "Normal":
        return <Info />;
      default:
        return <Info />;
    }
  };

  return (
    <Box className="user-detail-risk-analysis">
      <Typography variant="h5" gutterBottom>
        Risk Analysis
      </Typography>

      {loading ? (
        <Box className="loading-container">
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading risk data...
          </Typography>
        </Box>
      ) : error ? (
        <Typography color="error" className="error-message">
          {error}
        </Typography>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={5}>
            {Object.entries(groupedAlerts).length > 0 ? (
              Object.entries(groupedAlerts).map(([date, dateAlerts]) => (
                <Box key={date} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                    {date}
                  </Typography>
                  {dateAlerts.map((alert) => (
                    <Card
                      key={alert.alert_id}
                      sx={{
                        mb: 2,
                        cursor: "pointer",
                        borderLeft:
                          selectedAlert?.alert_id === alert.alert_id
                            ? `4px solid ${theme.palette.primary.main}`
                            : "4px solid transparent",
                        transition: "border-color 0.2s ease",
                        "&:hover": {
                          borderLeft: `4px solid ${theme.palette.primary.light}`,
                        },
                      }}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          {format(parseISO(alert.created_at), "MMM dd, yyyy • h:mm a")}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={1}>
                          <Typography variant="body2">{alert.alert_type}</Typography>
                          <Box sx={{ mx: 1 }}>•</Box>
                          <Typography variant="body2">Score: {alert.score}/100</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ))
            ) : (
              <Typography variant="body1" sx={{ mt: 3 }}>
                No risk data available.
              </Typography>
            )}
          </Grid>

          {/* Right side - Alert details */}
          <Grid item xs={12} md={7}>
            {selectedAlert ? (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Risk Analysis Details
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {format(parseISO(selectedAlert.created_at), "MMM dd, yyyy • h:mm a")}
                </Typography>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                      <Typography variant="subtitle2">Risk Score</Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {selectedAlert.score}/100
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                      <Typography variant="subtitle2">Severity</Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {selectedAlert.severity}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                      <Typography variant="subtitle2">Heart Rate Range</Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {selectedAlert.heart_rate_min} - {selectedAlert.heart_rate_max} bpm
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, backgroundColor: theme.palette.grey[100], borderRadius: 1 }}>
                      <Typography variant="subtitle2">Distance</Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {selectedAlert.distance.toFixed(2)} km
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Risk Factors
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      {chartData && (
                        <Box sx={{ height: 300 }}>
                          <Doughnut data={chartData} options={chartOptions} />
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <List>
                        {selectedAlert.risk_factors.map((factor) => (
                          <ListItem key={factor.name} sx={{ px: 0 }}>
                            <ListItemIcon>
                              <Avatar
                                sx={{
                                  bgcolor: severityColors[factor.level as keyof typeof severityColors],
                                  width: 24,
                                  height: 24,
                                }}
                              >
                                {getSeverityIcon(factor.level)}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText primary={factor.name} secondary={factor.description} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Recommendations
                  </Typography>
                  <List>
                    {selectedAlert.recommendations.map((rec, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Info color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Paper>
            ) : (
              <Typography variant="body1" sx={{ mt: 3 }}>
                Select a risk alert to view details
              </Typography>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
}