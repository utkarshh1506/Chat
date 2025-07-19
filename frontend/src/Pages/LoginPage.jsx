import React, { useState } from 'react';
import axios from '../api/axios.config';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import assets from '../assets/assets.js'
const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleMode = () => {
    setError('');
    setFormData({ email: '', password: '', confirmPassword: '' });
    setIsRegister(!isRegister);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        console.log(formData)

        const res = await axios.post('/api/users/register', {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/profile'); // go to profile setup
      } else {
        const res = await axios.post('/api/users/login', {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/'); // if already has profile
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setError(msg);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
      <div className='left'>
        <img src={assets.logo_icon} alt="" />
        <h1>WebChat</h1>
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{isRegister ? 'Register' : 'Login'}</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder='Enter your Email'
          value={formData.email}
          required
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder='Password'
          value={formData.password}
          required
          onChange={handleChange}
        />

        {isRegister && (
          <>
            <input
              type="password"
              name="confirmPassword"
              placeholder='Confirm Password'
              value={formData.confirmPassword}
              required
              onChange={handleChange}
            />
          </>
        )}

        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>

        <p className="toggle-auth">
          {isRegister ? 'Already have an account?' : 'New here?'}{' '}
          <span onClick={toggleMode}>
            {isRegister ? 'Login' : 'Register'}
          </span>
        </p>
      </form>
    </div>
    </div>
    
  );
};

export default LoginPage;
