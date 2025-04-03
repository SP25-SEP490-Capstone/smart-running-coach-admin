import { deleteCookie, getCookie, setCookie } from '@components/utils/util_cookie';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import './App.scss';
import HomeLayout from '@components/layouts/HomeLayout';
import LoginLayout from '@components/layouts/LoginLayout';
import LoginPage from '@components/pages/Login/LoginPage';
import DashboardPage from '@components/pages/Dashboard/DashboardPage';
import NewsPage from '@components/pages/News/NewsPage';
import NewsDetailEditPage from '@components/pages/News/NewsDetailEditPage';
import NewsCreatePage from '@components/pages/News/NewsCreatePage';
import PostsPage from '@components/pages/Posts/PostsPage';
import PostsDetailPage from '@components/pages/Posts/PostsDetailPage';
import SystemConfigPage from '@components/pages/SystemConfig/SystemConfigPage';
import TicketsPage from '@components/pages/Tickets/TicketsPage';
import TicketsDetailPage from '@components/pages/Tickets/TicketsDetailPage';
import TicketsCreatePage from '@components/pages/Tickets/TicketsCreatePage';
import UsersPage from '@components/pages/Users/UsersPage';
import UsersDetailPage from '@components/pages/Users/UsersDetailPage';
import { useAtom } from 'jotai';
import { userAtom } from '@components/atoms/userAtom';
import { aget } from '@components/utils/util_axios';

function useAuthValidator() {
  const navigate = useNavigate();
  const location = useLocation();
  const [_, setUser] = useAtom(userAtom);

  useEffect(() => {
    const validateAuth = async () => {
      const token = getCookie('token');
      const isLoggedIn = !!token;

      // Redirect rules
      if (isLoggedIn && location.pathname === '/login') {
        navigate('/dashboard');
        return;
      } 
      
      if (!isLoggedIn && location.pathname !== '/login') {
        navigate('/login');
        return;
      }

      if (isLoggedIn) {
        try {
          const response = await aget('/admins/me');

          if (response.data?.status === 'success') {
            setUser(response.data.data);
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          deleteCookie('token');
          setUser(null);
          navigate('/login');
        }
      }
    };

    validateAuth();
  }, [location, navigate, setUser]);
}

export default function App() {
  useAuthValidator();

  return (
    <div className='app'>
      <Routes>
        <Route path='/' element={<HomeLayout pageComponent={<DashboardPage />} />} />
        <Route path='/login' element={<LoginLayout pageComponent={<LoginPage />} />} />
        <Route path='/dashboard' element={<HomeLayout pageComponent={<DashboardPage />} />} />
        <Route path='/news' element={<HomeLayout pageComponent={<NewsPage />} />} />
        <Route path='/news/edit/:id' element={<HomeLayout pageComponent={<NewsDetailEditPage />} />} />
        <Route path='/news/create' element={<HomeLayout pageComponent={<NewsCreatePage/>} />} />
        <Route path='/posts' element={<HomeLayout pageComponent={<PostsPage />} />} />
        <Route path='/posts/:id' element={<HomeLayout pageComponent={<PostsDetailPage />} />} />
        <Route path='/config' element={<HomeLayout pageComponent={<SystemConfigPage />} />} />
        <Route path='/tickets' element={<HomeLayout pageComponent={<TicketsPage />} />} />
        <Route path='/tickets/edit/:id' element={<HomeLayout pageComponent={<TicketsDetailPage />} />} />
        <Route path='/tickets/compose' element={<HomeLayout pageComponent={<TicketsCreatePage />} />} />
        <Route path='/users' element={<HomeLayout pageComponent={<UsersPage />} />} />
        <Route path='/users/:id' element={<HomeLayout pageComponent={<UsersDetailPage />} />} />
      </Routes>
    </div>
  );
}