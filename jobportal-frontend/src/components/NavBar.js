import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Person, BoxArrowRight, Briefcase, Speedometer2, ListTask, PlusCircle } from 'react-bootstrap-icons';

const NavBar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('USER_ROLE');

    const handleLogout = () => {
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('USER_ROLE');
        window.dispatchEvent(new Event('storage'));
        navigate('/auth');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="container">
                <Link className="navbar-brand fw-bold d-flex align-items-center" to={role === 'applicant' ? '/dashboard' : '/company/dashboard'}>
                    <Briefcase className="me-2" /> JobPortal
                </Link>
                
                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {role === 'applicant' ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link d-flex align-items-center" to="/dashboard">
                                        <Speedometer2 className="me-1" /> Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link d-flex align-items-center" to="/jobs">
                                        <Briefcase className="me-1" /> Browse Jobs
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link d-flex align-items-center" to="/my-applications">
                                        <ListTask className="me-1" /> My Applications
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link d-flex align-items-center" to="/company/dashboard">
                                        <Speedometer2 className="me-1" /> Overview
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link d-flex align-items-center" to="/company/post-job">
                                        <PlusCircle className="me-1" /> Post a Job
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    <div className="d-flex align-items-center">
                        <div className="text-white me-3 d-none d-lg-block">
                            <Person className="me-1" /> {role === 'applicant' ? 'Applicant Portal' : 'Company Portal'}
                        </div>
                        <button className="btn btn-outline-light rounded-pill px-4 btn-sm fw-bold" onClick={handleLogout}>
                            <BoxArrowRight className="me-1" /> Logout
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                .nav-link {
                    font-weight: 500;
                    margin: 0 5px;
                    transition: all 0.3s ease;
                }
                .nav-link:hover {
                    transform: translateY(-2px);
                    opacity: 0.9;
                }
            `}</style>
        </nav>
    );
};

export default NavBar;
