import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

export default function NavBar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('User') || '{}');
  const isCompany = user?.userDetails?.role === 'COMPANY';

  const logout = () => {
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('User');
    window.dispatchEvent(new Event('storage'));
    navigate('/auth');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand onClick={() => navigate(isCompany ? '/company/dashboard' : '/dashboard')} style={{cursor:'pointer'}}>
          JobPortal
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            {!isCompany && <>
              <Nav.Link onClick={() => navigate('/jobs')}>Browse Jobs</Nav.Link>
              <Nav.Link onClick={() => navigate('/my-applications')}>My Applications</Nav.Link>
            </>}
            {isCompany && <>
              <Nav.Link onClick={() => navigate('/company/post-job')}>Post Job</Nav.Link>
            </>}
          </Nav>
          <Nav>
            <Nav.Link disabled>👤 {user?.username}</Nav.Link>
            <Nav.Link onClick={logout} style={{color:'#ff6b6b'}}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
