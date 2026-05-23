import { Link } from 'react-router-dom'

const NotFound = () => (
  <main className="page-section notfound-page">
    <div className="glass-card centered-panel">
      <span className="status-code">404</span>
      <h1>Page not found</h1>
      <p>The requested hospital dashboard section could not be found.</p>
      <Link to="/dashboard" className="btn btn-primary">
        Back to Dashboard
      </Link>
    </div>
  </main>
)

export default NotFound
