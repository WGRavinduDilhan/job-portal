import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_API_URL;

// Base64 values for OAuth2 clients:
// "applicant:password" → YXBwbGljYW50OnBhc3N3b3Jk
// "company:password"   → Y29tcGFueTpwYXNzd29yZA==

export default function Auth() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('signin');
  const [role, setRole] = useState('APPLICANT');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');

  const fireStorageEvent = () => window.dispatchEvent(new Event('storage'));

  const LoginHandler = async (e) => {
    e.preventDefault();
    if (!userName || !password) { toast.warn('Please fill all fields'); return; }
    const data = new FormData();
    data.append('username', userName);
    data.append('password', password);
    data.append('grant_type', 'password');
    
    // Updated client keys to match backend: applicant:password and company:password
    const clientKey = role === 'COMPANY' ? 'Y29tcGFueTpwYXNzd29yZA==' : 'YXBwbGljYW50OnBhc3N3b3Jk';
    
    try {
      const res = await axios.post(`${BASE_URL}/oauth/token`, data, {
        headers: { Authorization: `Basic ${clientKey}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res?.data?.access_token) {
        localStorage.setItem('ACCESS_TOKEN', res.data.access_token);
        localStorage.setItem('User', JSON.stringify(res.data.user));
        fireStorageEvent();
        const userRole = res.data.user?.userDetails?.role;
        navigate(userRole === 'COMPANY' ? '/company/dashboard' : '/dashboard');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    }
  };

  const SignUpHandler = () => {
    if (!newUserName || !newEmail || !newPassword) { toast.warn('Fill all fields'); return; }
    const url = role === 'COMPANY' ? `${BASE_URL}/company/signup` : `${BASE_URL}/applicant/signup`;
    const body = role === 'COMPANY'
      ? { userName: newUserName, email: newEmail, password: newPassword, companyName, industry }
      : { userName: newUserName, email: newEmail, password: newPassword, university, degree };
    axios.post(url, body)
      .then(res => {
        if (res?.data?.success) {
          toast.success('Signed up successfully! You can now sign in.');
          setAuthMode('signin');
          setNewUserName('');
          setNewEmail('');
          setNewPassword('');
          setUniversity('');
          setDegree('');
          setCompanyName('');
          setIndustry('');
        } else {
          toast.error(res.data.message);
        }
      })
      .catch(err => toast.error(err?.response?.data?.message || 'Sign up failed'));
  };

  if (authMode === 'signin') {
    return (
      <div className="Auth-form-container d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <form className="Auth-form card shadow p-4" style={{maxWidth:'400px', width:'100%'}}>
          <div className="Auth-form-content">
            <h3 className="Auth-form-title text-center mb-4">Sign In</h3>
            <div className="form-group mt-3">
              <label>Login as</label>
              <select className="form-control mt-1" value={role} onChange={e => setRole(e.target.value)}>
                <option value="APPLICANT">Applicant (Graduate)</option>
                <option value="COMPANY">Company (Recruiter)</option>
              </select>
            </div>
            <div className="form-group mt-3">
              <label>Username</label>
              <input type="text" className="form-control mt-1" value={userName}
                onChange={e => setUserName(e.target.value)} placeholder="Username" />
            </div>
            <div className="form-group mt-3">
              <label>Password</label>
              <input type="password" className="form-control mt-1" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Password" />
            </div>
            <div className="d-grid gap-2 mt-4">
              <button className="btn btn-dark" onClick={LoginHandler}>Sign In</button>
            </div>
            <div className="text-center mt-3">
              <span className="link-text" style={{cursor:'pointer'}} onClick={() => setAuthMode('signup')}>
                New here? <u className="text-primary">Sign Up</u>
              </span>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="Auth-form-container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <form className="Auth-form card shadow p-4" style={{maxWidth:'450px', width:'100%'}}>
        <div className="Auth-form-content">
          <h3 className="Auth-form-title text-center mb-4">Sign Up</h3>
          <div className="form-group mt-2">
            <label>Registering as</label>
            <select className="form-control mt-1" value={role} onChange={e => setRole(e.target.value)}>
              <option value="APPLICANT">Graduate / Applicant</option>
              <option value="COMPANY">Company / Recruiter</option>
            </select>
          </div>
          <div className="form-group mt-2"><label>Username</label>
            <input type="text" className="form-control mt-1" value={newUserName}
              onChange={e => setNewUserName(e.target.value)} /></div>
          <div className="form-group mt-2"><label>Email</label>
            <input type="email" className="form-control mt-1" value={newEmail}
              onChange={e => setNewEmail(e.target.value)} /></div>
          <div className="form-group mt-2"><label>Password</label>
            <input type="password" className="form-control mt-1" value={newPassword}
              onChange={e => setNewPassword(e.target.value)} /></div>
          {role === 'APPLICANT' && <>
            <div className="form-group mt-2"><label>University</label>
              <input type="text" className="form-control mt-1" value={university}
                onChange={e => setUniversity(e.target.value)} /></div>
            <div className="form-group mt-2"><label>Degree</label>
              <input type="text" className="form-control mt-1" value={degree}
                onChange={e => setDegree(e.target.value)} /></div>
          </>}
          {role === 'COMPANY' && <>
            <div className="form-group mt-2"><label>Company Name</label>
              <input type="text" className="form-control mt-1" value={companyName}
                onChange={e => setCompanyName(e.target.value)} /></div>
            <div className="form-group mt-2"><label>Industry</label>
              <input type="text" className="form-control mt-1" value={industry}
                onChange={e => setIndustry(e.target.value)} /></div>
          </>}
          <div className="d-grid gap-2 mt-4">
            <button type="button" className="btn btn-primary" onClick={SignUpHandler}>Sign Up</button>
          </div>
          <div className="text-center mt-3">
            <span style={{cursor:'pointer'}} onClick={() => setAuthMode('signin')}>
              Already registered? <u className="text-primary">Sign In</u>
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
