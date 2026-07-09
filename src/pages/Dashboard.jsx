import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiFetch } from "../api";
import { useAuth } from "../context/AuthContext";

const APARTMENT_IMAGES = {
  1: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&auto=format&fit=crop",
  2: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&auto=format&fit=crop",
  3: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop",
  4: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop",
  5: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=900&auto=format&fit=crop",
};

const FALLBACK_IMAGE =
  "https://media.istockphoto.com/id/2148850507/photo/contemporary-urban-apartments-with-rooftop-greenery.jpg?s=612x612&w=0&k=20&c=N5JEzh21OtER3f3IHdxf-N8kWUJVll1eT4dmXdeRwPU=";

function buildApartmentTags(apartment) {
  const tags = [];

  if (Number(apartment.verified) === 1) {
    tags.push("Verified");
  }

  if (apartment.landlord) {
    tags.push(apartment.landlord);
  }

  if (apartment.units) {
    tags.push(`${apartment.units} units`);
  }

  return tags.length > 0 ? tags.slice(0, 3) : ["No highlights yet"];
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("All");
  const [sortBy, setSortBy] = useState("ratingHigh");

  useEffect(() => {
    let isMounted = true;

    async function loadApartments() {
      try {
        const data = await apiFetch("/api/apartments");

        if (!isMounted) {
          return;
        }

        const normalizedApartments = data.map((apartment) => ({
          ...apartment,
          rating: Number(apartment.rating ?? 0),
          reviews: Number(apartment.reviews ?? 0),
          image: apartment.image || FALLBACK_IMAGE,
          tags: Array.isArray(apartment.tags)
            ? apartment.tags
            : buildApartmentTags(apartment),
        }));

        setApartments(normalizedApartments);
        setError("");
      } catch {
        if (isMounted) {
          setError("Could not load apartments.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadApartments();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const neighbourhoods = [
    "All",
    ...new Set(apartments.map((apt) => apt.neighbourhood)),
  ];

  const totalReviews = apartments.reduce(
    (sum, apartment) => sum + apartment.reviews,
    0
  );

  const filteredApartments = useMemo(() => {
    let result = apartments.filter((apt) => {
      const searchText =
        `${apt.name} ${apt.address} ${apt.neighbourhood}`.toLowerCase();

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
  }, [apartments, search, neighbourhood, sortBy]);

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <h2 className="logo">TenantTrails</h2>

        <div className="dashboard-user">
          <span>Welcome, {user?.name}</span>

          <Link to="/profile" className="text-link">
            Profile
          </Link>

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
              <strong>{totalReviews}</strong>
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

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="ratingHigh">Rating: High to Low</option>
            <option value="ratingLow">Rating: Low to High</option>
            <option value="reviewsHigh">Most Reviews</option>
          </select>
        </div>

        {loading && <p className="empty-state">Loading apartments...</p>}
        {!loading && error && <p className="empty-state">{error}</p>}

        {!loading && !error && (
          <section className="apartment-grid">
            {filteredApartments.map((apt) => (
              <Link
                key={apt.id}
                to={`/apartment/${apt.id}`}
                className="apartment-card-link"
              >
                <article className="apartment-card">
                  <div className="apartment-image-wrap">
                    <img
                      src={apt.image || APARTMENT_IMAGES[apt.id] || FALLBACK_IMAGE}
  alt={apt.name}
  className="apartment-image"
                    />
                    <span className="rating-badge">★ {apt.rating}</span>
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

                    <p className="review-count">
                      {apt.reviews} review{apt.reviews !== 1 ? "s" : ""}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </section>
        )}

        {!loading && !error && filteredApartments.length === 0 && (
          <p className="empty-state">No apartments match your search.</p>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
