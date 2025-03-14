import './LoginPage.scss';
//@ts-ignore
import logo from '@assets/logo.png';
import { useState } from 'react';
import { CheckCircle } from '@mui/icons-material';
import { sendSuccessToast } from '@components/utils/util_toastify';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const login = () => {
    sendSuccessToast('Login successful!');
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
          <label>Email</label>
          <div className='input-container'>
            <input
              type='email'
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

          <button type='submit'>Sign in</button>
        </form>
      </div>
    </div>
  );
}