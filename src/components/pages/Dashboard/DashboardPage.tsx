import './DashboardPage.scss';
import { Card, CardContent, Grid, Avatar, Chip } from '@mui/material';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aget } from '@components/utils/util_axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

Chart.register(...registerables);

export default function DashboardPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'User Growth',
      data: [3000, 4500, 4000, 5000, 6000, 5500],
      borderColor: '#4A90E2',
      fill: false,
    }],
  };

  const categoryData = {
    labels: ['Fitness', 'Nutrition', 'Mental Health', 'Life Coach'],
    datasets: [{
      data: [30, 20, 25, 25],
      backgroundColor: ['#4A90E2', '#4CAF50', '#FFA726', '#9E9E9E'],
    }],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, postsResponse] = await Promise.all([
          aget('/users'),
          aget('/posts')
        ]);

        if (usersResponse.status === 200) {
          setUsers(usersResponse.data.data);
        }

        if (postsResponse.status === 200) {
          setPosts(postsResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="dashboard-page">
      <div className='title-container'>
        <h1>Dashboard</h1>
      </div>
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <div className="stats-card">
            <div className="stats-card-title">Total Users</div>
            {loading ? (
              <Skeleton width={100} height={30} />
            ) : (
              <div className="stats-card-value">{users.length}</div>
            )}
          </div>
        </Grid>
        <Grid item xs={3}>
          <div className="stats-card">
            <div className="stats-card-title">Active Experts</div>
            {loading ? (
              <Skeleton width={100} height={30} />
            ) : (
              <div className="stats-card-value">
                {users.filter(user => user.UserRole.some(role => role.Role.role_name === 'runner')).length}
              </div>
            )}
          </div>
        </Grid>
        <Grid item xs={3}>
          <div className="stats-card">
            <div className="stats-card-title">Total Posts</div>
            {loading ? (
              <Skeleton width={100} height={30} />
            ) : (
              <div className="stats-card-value">{posts.length}</div>
            )}
          </div>
        </Grid>
        <Grid item xs={3}>
          <div className="stats-card">
            <div className="stats-card-title">Open Tickets</div>
            {loading ? (
              <Skeleton width={100} height={30} />
            ) : (
              <div className="stats-card-value">82</div>
            )}
          </div>
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={3} className='chart'>
        <Grid item xs={8}>
          <Card>
            <CardContent>
              <p className="card-title">User Growth</p>
              {loading ? (
                <Skeleton height={300} />
              ) : (
                <Line data={userGrowthData} />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <p className="card-title">Expert Categories</p>
              {loading ? (
                <Skeleton height={300} />
              ) : (
                <Doughnut data={categoryData} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <div className="latest-container">
        <div className="latest-users">
          <p className="latest-title">Latest Users</p>
          <div className='latest-items'>
            {loading ? (
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="user-item">
                  <div className="user-meta">
                    <Skeleton circle width={40} height={40} />
                    <div style={{ width: '100%', marginLeft: '10px' }}>
                      <Skeleton width={120} />
                      <Skeleton width={180} />
                    </div>
                  </div>
                  <Skeleton width={60} height={24} />
                </div>
              ))
            ) : (
              users.slice(0, 3).map(user => (
                <div key={user.id} className="user-item" onClick={() => navigate(`/users/${user.id}`)}>
                  <div className="user-meta">
                    <Avatar>{user.name[0]}</Avatar>
                    <div>
                      <p className="user-name">{user.name}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                  </div>
                  <Chip 
                    className='user-status' 
                    label={user.is_active ? 'Active' : 'Inactive'} 
                    color={user.is_active ? 'success' : 'default'} 
                  />
                </div>
              ))
            )}
          </div>
          <div className='btn-view-all' onClick={() => navigate('/users')}>
            <p>View all</p>
          </div>
        </div>
        <div className="latest-posts">
          <p className="latest-title">Latest Posts</p>
          <div className='latest-items'>
            {loading ? (
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="post-item">
                  <Skeleton width={250} />
                  <Skeleton width={200} />
                </div>
              ))
            ) : (
              posts.slice(0, 3).map(post => (
                <div key={post.id} className="post-item" onClick={() => navigate(`/posts/${post.id}`)}>
                  <p className="post-title">{post.title}</p>
                  <p className="post-details">
                    {post.User?.username} • {formatDate(post.created_at)} • {post.upvote_count} upvotes
                  </p>
                </div>
              ))
            )}
          </div>
          <div className='btn-view-all' onClick={() => navigate('/posts')}>
            <p>View all</p>
          </div>
        </div>
      </div>
    </div>
  );
}