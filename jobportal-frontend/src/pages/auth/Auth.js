import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Nav } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BriefcaseFill } from 'react-bootstrap-icons';

const BASE_URL = process.env.REACT_APP_API_URL;

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
    
    const applicantSecret = process.env.REACT_APP_APPLICANT_SECRET || 'local-applicant-secret';
    const companySecret = process.env.REACT_APP_COMPANY_SECRET || 'local-company-secret';
    const clientKey = role === 'COMPANY' 
      ? btoa(`company:${companySecret}`) 
      : btoa(`applicant:${applicantSecret}`);
    
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

  const SignUpHandler = (e) => {
    e.preventDefault();
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

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 py-5">
      <Card className="border-0 shadow-lg overflow-hidden" style={{ maxWidth: '900px', width: '100%', borderRadius: '20px' }}>
        <Row className="g-0">
          {/* Left Side: Branding/Visual */}
          <Col md={5} className="bg-primary d-none d-md-flex flex-column align-items-center justify-content-center text-white p-5 text-center">
            <BriefcaseFill size={64} className="mb-4" />
            <h2 className="fw-bold mb-3">Welcome to JobPortal</h2>
            <p className="opacity-75">Connect with the world's leading companies and land your dream job today.</p>
          </Col>

          {/* Right Side: Form */}
          <Col md={7} className="p-4 p-md-5 bg-white">
            <div className="mb-4 text-center d-md-none">
              <BriefcaseFill size={40} className="text-primary mb-2" />
              <h3 className="fw-bold">JobPortal</h3>
            </div>

            <div className="d-flex justify-content-center mb-4">
              <Nav variant="pills" activeKey={authMode} onSelect={(k) => setAuthMode(k)} className="bg-light p-1 rounded-pill">
                <Nav.Item>
                  <Nav.Link eventKey="signin" className="rounded-pill px-4">Sign In</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="signup" className="rounded-pill px-4">Sign Up</Nav.Link>
                </Nav.Item>
              </Nav>
            </div>

            <Form onSubmit={authMode === 'signin' ? LoginHandler : SignUpHandler}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted text-uppercase">I am a</Form.Label>
                <Form.Select value={role} onChange={e => setRole(e.target.value)} className="bg-light border-0">
                  <option value="APPLICANT">Graduate / Applicant</option>
                  <option value="COMPANY">Company / Recruiter</option>
                </Form.Select>
              </Form.Group>

              {authMode === 'signin' ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted text-uppercase">Username</Form.Label>
                    <Form.Control type="text" placeholder="Enter username" value={userName} onChange={e => setUserName(e.target.value)} />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted text-uppercase">Password</Form.Label>
                    <Form.Control type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100 py-2 fs-5">Sign In</Button>
                </>
              ) : (
                <>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Username</Form.Label>
                        <Form.Control type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-muted text-uppercase">Email</Form.Label>
                        <Form.Control type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted text-uppercase">Password</Form.Label>
                    <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </Form.Group>
                  
                  {role === 'APPLICANT' ? (
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold text-muted text-uppercase">University</Form.Label>
                          <Form.Control type="text" value={university} onChange={e => setUniversity(e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold text-muted text-uppercase">Degree</Form.Label>
                          <Form.Control type="text" value={degree} onChange={e => setDegree(e.target.value)} />
                        </Form.Group>
                      </Col>
                    </Row>
                  ) : (
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold text-muted text-uppercase">Company Name</Form.Label>
                          <Form.Control type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold text-muted text-uppercase">Industry</Form.Label>
                          <Form.Control type="text" value={industry} onChange={e => setIndustry(e.target.value)} />
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                  <Button variant="primary" type="submit" className="w-100 py-2 fs-5 mt-2">Create Account</Button>
                </>
              )}
            </Form>

            <div className="text-center mt-4 text-muted small">
              {authMode === 'signin' ? (
                <p>Don't have an account? <span className="text-primary fw-bold cursor-pointer" onClick={() => setAuthMode('signup')} style={{cursor:'pointer'}}>Sign Up</span></p>
              ) : (
                <p>Already have an account? <span className="text-primary fw-bold cursor-pointer" onClick={() => setAuthMode('signin')} style={{cursor:'pointer'}}>Sign In</span></p>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
