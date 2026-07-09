import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiFetch } from "../api";
import AISummary from "../components/AISummary";
import ReviewCard from "../components/ReviewCard";
import ReviewDialog from "../components/ReviewDialog";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";

function formatReviewDate(date) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recent review";
  }

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function ApartmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [apartment, setApartment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadApartmentData() {
      try {
        const [apartmentData, reviewData] = await Promise.all([
          apiFetch(`/api/apartments/${id}`),
          apiFetch(`/api/apartments/${id}/reviews`),
        ]);

        if (!isMounted) {
          return;
        }

        setApartment(apartmentData);
        setReviews(reviewData);
        setError("");
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Could not load apartment.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadApartmentData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const apartmentDetails = useMemo(() => {
    if (!apartment) {
      return null;
    }

    return {
      ...apartment,
      rating: Number(apartment.rating ?? 0),
      reviews: Number(apartment.reviews ?? 0),
      aiSummary:
        apartment.aiSummary ||
        "No AI summary is available yet. Check the reviews below for current tenant feedback.",
      aiIssues: Array.isArray(apartment.aiIssues) ? apartment.aiIssues : [],
    };
  }, [apartment]);

  const apartmentReviews = useMemo(
    () =>
      reviews.map((review) => ({
        ...review,
        author: review.author || "Anonymous tenant",
        date: formatReviewDate(review.date),
      })),
    [reviews]
  );

  async function refreshApartmentData() {
    const [apartmentData, reviewData] = await Promise.all([
      apiFetch(`/api/apartments/${id}`),
      apiFetch(`/api/apartments/${id}/reviews`),
    ]);

    setApartment(apartmentData);
    setReviews(reviewData);
  }

  async function handleSubmitReview(newReview) {
    await apiFetch(`/api/apartments/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify({
        rating: newReview.rating,
        body: newReview.body,
      }),
    });

    await refreshApartmentData();
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-container">
          <Link to="/dashboard" className="back-link">
            ← Back to all apartments
          </Link>
          <p className="empty-state">Loading apartment...</p>
        </main>
      </div>
    );
  }

  if (error === "Apartment not found") {
    return (
      <div className="dashboard-page">
        <main className="dashboard-container">
          <Link to="/dashboard" className="back-link">
            ← Back to all apartments
          </Link>
          <h1>Apartment not found</h1>
        </main>
      </div>
    );
  }

  if (error || !apartmentDetails) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-container">
          <Link to="/dashboard" className="back-link">
            ← Back to all apartments
          </Link>
          <p className="empty-state">Could not load apartment.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <Link to="/dashboard" className="logo">
          TenantTrails
        </Link>

        <div className="dashboard-user">
          <Link to="/profile" className="text-link">
            {user?.name || "Profile"}
          </Link>
          <Link to="/dashboard" className="text-link">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="detail-container">
        <Link to="/dashboard" className="back-link">
          ← Back to all apartments
        </Link>

        <section className="detail-header-card">
          <div>
            <h1>{apartmentDetails.name}</h1>
            <p>
              {apartmentDetails.address} · {apartmentDetails.neighbourhood}
            </p>
            <span>
              {apartmentDetails.verified
                ? "Verified apartment with recent tenant activity."
                : "Tenant reviews help build the picture for this apartment."}
            </span>
          </div>

          <div className="detail-rating">
            <strong>{apartmentDetails.rating}</strong>
            <StarRating rating={apartmentDetails.rating} />
            <span>{apartmentDetails.reviews} reviews</span>
          </div>
        </section>

        <div className="detail-layout">
          <div className="detail-main">
            <AISummary
              summary={apartmentDetails.aiSummary}
              issues={apartmentDetails.aiIssues}
            />

            <section className="reviews-section">
              <div className="section-title-row">
                <h2>Reviews ({apartmentReviews.length})</h2>
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => setShowReviewDialog(true)}
                >
                  + Write a Review
                </button>
              </div>

              {apartmentReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  rating={review.rating}
                  body={review.body}
                  date={review.date}
                  author={review.author}
                />
              ))}

              {apartmentReviews.length === 0 && (
                <p className="empty-state">
                  No reviews yet. Be the first to share your experience.
                </p>
              )}
            </section>
          </div>

          <aside className="detail-sidebar">
            <section className="info-card">
              <h3>Property Info</h3>
              <div className="info-row">
                <span>Landlord</span>
                <strong>{apartmentDetails.landlord}</strong>
              </div>
              <div className="info-row">
                <span>Units</span>
                <strong>{apartmentDetails.units}</strong>
              </div>
              <div className="info-row">
                <span>Year built</span>
                <strong>{apartmentDetails.built}</strong>
              </div>
              <div className="info-row">
                <span>Neighbourhood</span>
                <strong>{apartmentDetails.neighbourhood}</strong>
              </div>
            </section>

            <section className="info-card">
              <h3>Rating Breakdown</h3>
              <div className="rating-bar-row">
                <span>5 ★</span>
                <div>
                  <b style={{ width: "70%" }}></b>
                </div>
              </div>
              <div className="rating-bar-row">
                <span>4 ★</span>
                <div>
                  <b style={{ width: "50%" }}></b>
                </div>
              </div>
              <div className="rating-bar-row">
                <span>3 ★</span>
                <div>
                  <b style={{ width: "35%" }}></b>
                </div>
              </div>
              <div className="rating-bar-row">
                <span>2 ★</span>
                <div>
                  <b style={{ width: "12%" }}></b>
                </div>
              </div>
              <div className="rating-bar-row">
                <span>1 ★</span>
                <div>
                  <b style={{ width: "5%" }}></b>
                </div>
              </div>
            </section>

            <button
              type="button"
              className="full-button"
              onClick={() => setShowReviewDialog(true)}
            >
              Write a Review
            </button>
          </aside>
        </div>
      </main>

      {showReviewDialog && (
        <div
          className="modal-overlay"
          onClick={() => setShowReviewDialog(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ReviewDialog
              onClose={() => setShowReviewDialog(false)}
              onSubmit={handleSubmitReview}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ApartmentDetail;
