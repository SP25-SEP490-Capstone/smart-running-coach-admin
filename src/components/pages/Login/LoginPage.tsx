import './LoginPage.scss';
//@ts-ignore
import logo from '@assets/logo.png';
import { useState, useEffect } from 'react';
import { CheckCircle } from '@mui/icons-material';
import { sendErrorToast, sendSuccessToast } from '@components/utils/util_toastify';
import { apost } from '@components/utils/util_axios';
import { setCookie } from '@components/utils/util_cookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    if (email) {
      localStorage.setItem('savedEmail', email);
    } else {
      localStorage.removeItem('savedEmail');
    }
  }, [email]);

  const login = () => {
    setIsLoading(true);
    apost('/admins/login', { identifier: email, password })
      .then((res) => {
        if (res.status == 200) {
          let data = res.data;
          if (data.status == "error") {
            sendErrorToast(data.message);
          } else {
            setCookie('token', data.data.accessToken, 30);
            sendSuccessToast(data.message);
            window.location.href = '/dashboard';
          }
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className='login-page'>
      <div className='login-container'>
        <div className='login-logo'>
          <img src={logo} alt='Logo' />
        </div>
        <h2>Administrator Login</h2>
        <p>Please fill your details to access your account.</p>

        <form onSubmit={(e) => { e.preventDefault(); login(); }}>
          <label>Email or username</label>
          <div className='input-container'>
            <input
              type='text'
              placeholder='youremail@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {isValidEmail(email) && <CheckCircle className='valid-icon' />}
          </div>

          <label>Password</label>
          <input
            type='password'
            placeholder='Enter password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className='login-options'>
            <label>
              <input
                className='checkbox-remember-me'
                type='checkbox'
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember Me
            </label>
            <a href='/forgot-password' className='forgot-password'>Forgot Password?</a>
          </div>

          <button type='submit' disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}