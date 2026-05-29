import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="app">
      <nav className="navbar">
        <h2 className="logo">TenantTrails</h2>

        <div className="nav-links">
          <Link to="/login" className="text-link">
            Sign In
          </Link>

          <Link to="/signup" className="primary-link small">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="hero">
        <p className="tagline">Launching in Halifax, Nova Scotia</p>

        <h1>
          Know what you're <br />
          signing before <br />
          you sign it.
        </h1>

        <p className="subtitle">
          Read honest reviews from past tenants. See AI-generated summaries.
          Make informed decisions about where you live.
        </p>

        <div className="hero-buttons">
          <Link to="/signup" className="primary-link">
            Create Free Account
          </Link>

          <Link to="/login" className="secondary-link">
            Sign In
          </Link>
        </div>

        <section className="features">
          <div className="feature">
            <span>⭐</span>
            <h3>Verified Reviews</h3>
            <p>Real ratings with photos and videos from past tenants.</p>
          </div>

          <div className="feature">
            <span>🤖</span>
            <h3>AI Summaries</h3>
            <p>Key issues and sentiment extracted from every review.</p>
          </div>

          <div className="feature">
            <span>💬</span>
            <h3>Ask Questions</h3>
            <p>Comment on reviews and get answers from past tenants.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Landing;