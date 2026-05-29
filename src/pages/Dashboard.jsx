import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apartments } from "../data/mockData";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("All");
  const [sortBy, setSortBy] = useState("ratingHigh");

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const neighbourhoods = ["All", ...new Set(apartments.map((apt) => apt.neighbourhood))];

  const filteredApartments = useMemo(() => {
    let result = apartments.filter((apt) => {
      const searchText = `${apt.name} ${apt.address} ${apt.neighbourhood}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesNeighbourhood =
        neighbourhood === "All" || apt.neighbourhood === neighbourhood;

      return matchesSearch && matchesNeighbourhood;
    });

    if (sortBy === "ratingHigh") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === "ratingLow") {
      result = [...result].sort((a, b) => a.rating - b.rating);
    }

    if (sortBy === "reviewsHigh") {
      result = [...result].sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [search, neighbourhood, sortBy]);

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <h2 className="logo">TenantTrails</h2>

        <div className="dashboard-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="text-button">
            Sign out
          </button>
        </div>
      </nav>

      <main className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Apartments in Halifax</h1>
            <p>Honest reviews from real tenants. Read before you rent.</p>
          </div>

          <div className="stats">
            <div>
              <strong>{apartments.length}</strong>
              <span>apartments</span>
            </div>
            <div>
              <strong>13</strong>
              <span>reviews</span>
            </div>
            <div>
              <strong>{neighbourhoods.length - 1}</strong>
              <span>neighbourhoods</span>
            </div>
          </div>
        </div>

        <div className="controls">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search apartments by address or neighbourhood..."
          />

          <select
            value={neighbourhood}
            onChange={(event) => setNeighbourhood(event.target.value)}
          >
            {neighbourhoods.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="ratingHigh">Rating: High to Low</option>
            <option value="ratingLow">Rating: Low to High</option>
            <option value="reviewsHigh">Most Reviews</option>
          </select>
        </div>

        <section className="apartment-grid">
          {filteredApartments.map((apt) => (
            <article key={apt.id} className="apartment-card">
              <div className="apartment-image-wrap">
                <img src={apt.image} alt={apt.name} className="apartment-image" />
                <span className="rating-badge">⭐ {apt.rating}</span>
              </div>

              <div className="apartment-content">
                <h3>{apt.name}</h3>
                <p className="address">
                  {apt.address} · {apt.neighbourhood}
                </p>

                <div className="tag-row">
                  {apt.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <p className="review-count">{apt.reviews} review{apt.reviews > 1 ? "s" : ""}</p>
              </div>
            </article>
          ))}
        </section>

        {filteredApartments.length === 0 && (
          <p className="empty-state">No apartments match your search.</p>
        )}
      </main>
    </div>
  );
}

export default Dashboard;