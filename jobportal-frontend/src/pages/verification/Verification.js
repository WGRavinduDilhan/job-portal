import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../utilities/api';
import { toast } from 'react-toastify';
import { CheckCircleFill, XCircleFill, ArrowRepeat } from 'react-bootstrap-icons';

const Verification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verifying your account...');

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('uid');
            if (!token) {
                setStatus('error');
                setMessage('Invalid or missing verification token.');
                return;
            }

            try {
                // Try as applicant first, then company if it fails (or check role if stored)
                // However, the backend /applicant/account/verify and /company/account/verify 
                // are separate. We'll try both or check the token payload if possible.
                // For simplicity, we'll try applicant first.
                await api.patch(`/applicant/account/verify?token=${token}`);
                setStatus('success');
                setMessage('Your account has been successfully verified!');
                toast.success('Verification successful!');
            } catch (err) {
                try {
                    await api.patch(`/company/account/verify?token=${token}`);
                    setStatus('success');
                    setMessage('Your account has been successfully verified!');
                    toast.success('Verification successful!');
                } catch (companyErr) {
                    setStatus('error');
                    setMessage(companyErr.response?.data?.message || 'Verification failed. The token may be expired.');
                    toast.error('Verification failed.');
                }
            }
        };

        verify();
    }, [searchParams]);

    return (
        <div className="container min-vh-100 d-flex align-items-center justify-content-center">
            <div className="card shadow-lg border-0 text-center p-5" style={{ maxWidth: '500px', borderRadius: '1.5rem' }}>
                {status === 'verifying' && (
                    <div className="animate__animated animate__pulse animate__infinite">
                        <ArrowRepeat size={80} className="text-primary mb-4" style={{ animation: 'spin 2s linear infinite' }} />
                        <h2 className="fw-bold">Verifying...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate__animated animate__zoomIn">
                        <CheckCircleFill size={80} className="text-success mb-4" />
                        <h2 className="fw-bold">Success!</h2>
                        <p className="text-muted">{message}</p>
                        <button className="btn btn-primary rounded-pill px-5 py-2 mt-3 fw-bold shadow-sm" onClick={() => navigate('/auth')}>
                            Proceed to Login
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="animate__animated animate__headShake">
                        <XCircleFill size={80} className="text-danger mb-4" />
                        <h2 className="fw-bold">Oops!</h2>
                        <p className="text-muted">{message}</p>
                        <button className="btn btn-outline-danger rounded-pill px-5 py-2 mt-3 fw-bold" onClick={() => navigate('/auth')}>
                            Back to Signup
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Verification;
