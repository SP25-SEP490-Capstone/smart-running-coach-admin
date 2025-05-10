import { Box } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ModeCommentOutlined as ModeCommentOutlinedIcon,
  Google,
  PostAdd,
  FavoriteOutlined,
} from "@mui/icons-material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chart.js/auto";
import "./UDPCommunityActivity.scss";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function UDPCommunityActivity({ user, loading }: any) {
  const chartData = {
    labels:
      user?.community_stats?.posting_activity?.map((item: any) => item.date) ||
      [],
    datasets: [
      {
        label: "Posts",
        data:
          user?.community_stats?.posting_activity?.map(
            (item: any) => item.count
          ) || [],
        backgroundColor: "rgba(0, 71, 142, 0.7)",
        borderColor: "rgba(25, 118, 210, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  return (
    <div className="udp-community-activity">
      <h3 className="label">Community Activity</h3>

      <div className="stats-grid">
        <div className="stat-card">
          <Box className="stat-icon-container">
            <PostAdd className="stat-icon" />
          </Box>
          {loading ? (
            <Skeleton width={40} />
          ) : (
            <span className="stat-value">
              {user?.community_stats?.total_posts || 0}
            </span>
          )}
          <span className="stat-label">Total Posts</span>
        </div>

        {/* Comments Stat */}
        <div className="stat-card">
          <Box className="stat-icon-container">
            <ModeCommentOutlinedIcon className="stat-icon" />
          </Box>

          {loading ? (
            <Skeleton width={40} />
          ) : (
            <span className="stat-value">
              {user?.community_stats?.total_comments || 0}
            </span>
          )}
          <span className="stat-label">Comments</span>
        </div>

        {/* Upvotes Stat */}
        <div className="stat-card">
          <Box className="stat-icon-container">
            <FavoriteOutlined className="stat-icon" />
          </Box>

          {loading ? (
            <Skeleton width={40} />
          ) : (
            <span className="stat-value">
              {user?.community_stats?.total_upvotes || 0}
            </span>
          )}
          <span className="stat-label">Upvotes</span>
        </div>
      </div>

      <div className="activity-chart">
        <h4 className="chart-title">Posting Activity (Last 30 Days)</h4>
        <div className="chart-container">
          {loading ? (
            <Skeleton height={300} />
          ) : (
            <Bar data={chartData} options={chartOptions} height={300} />
          )}
        </div>
      </div>

      <Link to={`/admin/users/${user?.id}/posts`} className="view-all-link">
        View all posts by this user
      </Link>
    </div>
  );
}
