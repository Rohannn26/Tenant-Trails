import "./App.css";

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <h2 className="logo">TenantTrails</h2>

        <div className="nav-links">
          <button className="text-button">Sign In</button>
          <button className="primary-button small">Get Started</button>
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
          <button className="primary-button">Create Free Account</button>
          <button className="secondary-button">Sign In</button>
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

export default App;