import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CheckCircleFill, XCircleFill, ArrowRepeat } from 'react-bootstrap-icons';

const Verification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your account...');

    useEffect(() => {
        const verify = async () => {
            const token = searchParams.get('uid');
            if (!token) {
                setStatus('error');
                setMessage('Invalid or missing verification token.');
                return;
            }

            const BASE_URL = process.env.REACT_APP_API_URL;

            try {
                // Try applicant endpoint
                const res = await axios.patch(`${BASE_URL}/applicant/account/verify?token=${token}`);
                if (res.data.success) {
                    setStatus('success');
                    setMessage('Your account has been successfully verified!');
                    toast.success('Verification successful!');
                } else {
                    throw new Error(res.data.message);
                }
            } catch (err) {
                try {
                    // Try company endpoint
                    const res = await axios.patch(`${BASE_URL}/company/account/verify?token=${token}`);
                    if (res.data.success) {
                        setStatus('success');
                        setMessage('Your account has been successfully verified!');
                        toast.success('Verification successful!');
                    } else {
                        throw new Error(res.data.message);
                    }
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
                        <ArrowRepeat size={80} className="text-primary mb-4" />
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
        </div>
    );
};

export default Verification;
