import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utilities/api';
import 'animate.css';
import { PersonCircle, Building, Envelope, Lock, Person } from 'react-bootstrap-icons';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('applicant'); // 'applicant' or 'company'
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        companyName: '',
        contactNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                // Login Logic
                const loginData = new URLSearchParams();
                loginData.append('username', formData.userName);
                loginData.append('password', formData.password);
                loginData.append('grant_type', 'password');

                const response = await api.post('/oauth/token', loginData, {
                    headers: {
                        'Authorization': 'Basic ' + btoa(role === 'applicant' ? 'applicant:password' : 'company:password'),
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                localStorage.setItem('ACCESS_TOKEN', response.data.access_token);
                localStorage.setItem('USER_ROLE', role);
                window.dispatchEvent(new Event('storage')); // Trigger update in App.js
                
                toast.success('Welcome back!');
                navigate(role === 'applicant' ? '/dashboard' : '/company/dashboard');
            } else {
                // Signup Logic
                const endpoint = role === 'applicant' ? '/applicant/signup' : '/company/signup';
                await api.post(endpoint, formData);
                toast.success('Registration successful! Please check your email for verification.');
                setIsLogin(true);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Something went wrong';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="auth-card card shadow-lg border-0 animate__animated animate__fadeIn" style={{ maxWidth: '450px', width: '100%', borderRadius: '1.5rem', overflow: 'hidden' }}>
                <div className="card-header bg-primary text-white text-center py-4 border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <h2 className="fw-bold mb-0">{isLogin ? 'Welcome Back' : 'Join JobPortal'}</h2>
                    <p className="small opacity-75 mb-0">{isLogin ? 'Sign in to your account' : 'Start your journey with us'}</p>
                </div>
                
                <div className="card-body p-4">
                    {/* Role Selector */}
                    <div className="d-flex justify-content-center mb-4 p-1 bg-light rounded-pill">
                        <button 
                            className={`btn rounded-pill px-4 flex-grow-1 ${role === 'applicant' ? 'btn-primary shadow' : 'btn-link text-muted text-decoration-none'}`}
                            onClick={() => setRole('applicant')}
                            style={role === 'applicant' ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' } : {}}
                        >
                            <PersonCircle className="me-2" /> Applicant
                        </button>
                        <button 
                            className={`btn rounded-pill px-4 flex-grow-1 ${role === 'company' ? 'btn-primary shadow' : 'btn-link text-muted text-decoration-none'}`}
                            onClick={() => setRole('company')}
                            style={role === 'company' ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' } : {}}
                        >
                            <Building className="me-2" /> Company
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="animate__animated animate__fadeInUp animate__faster">
                        <div className="mb-3">
                            <label className="form-label small text-muted">Username</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Person /></span>
                                <input 
                                    type="text" name="userName" className="form-control border-start-0 ps-0" 
                                    placeholder="Enter username" required onChange={handleInputChange} 
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Email Address</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0"><Envelope /></span>
                                        <input 
                                            type="email" name="email" className="form-control border-start-0 ps-0" 
                                            placeholder="name@example.com" required onChange={handleInputChange} 
                                        />
                                    </div>
                                </div>
                                {role === 'company' && (
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Company Name</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0"><Building /></span>
                                            <input 
                                                type="text" name="companyName" className="form-control border-start-0 ps-0" 
                                                placeholder="e.g. Acme Corp" required onChange={handleInputChange} 
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="mb-4">
                            <label className="form-label small text-muted">Password</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><Lock /></span>
                                <input 
                                    type="password" name="password" className="form-control border-start-0 ps-0" 
                                    placeholder="••••••••" required onChange={handleInputChange} 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary w-100 py-2 fw-bold rounded-pill shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm me-2"></span>
                            ) : (
                                isLogin ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-muted small">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                className="btn btn-link p-0 ms-1 small fw-bold text-decoration-none"
                                onClick={() => setIsLogin(!isLogin)}
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            
            <style>{`
                .auth-container {
                    background: #f8f9fa;
                    background-image: radial-gradient(#667eea11 2px, transparent 2px);
                    background-size: 30px 30px;
                }
                .form-control:focus {
                    box-shadow: none;
                    border-color: #667eea;
                }
                .input-group-text {
                    color: #764ba2;
                }
            `}</style>
        </div>
    );
};

export default Auth;
