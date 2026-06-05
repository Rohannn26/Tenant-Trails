import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { apartments } from "../data/mockData";
import AISummary from "../components/AISummary";
import ReviewCard from "../components/ReviewCard";
import ReviewDialog from "../components/ReviewDialog";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";
import { useReviews } from "../context/ReviewContext";

function ApartmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { reviews, addReview } = useReviews();

  const apartment = apartments.find((apt) => apt.id === Number(id));
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  if (!apartment) {
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

  const apartmentReviews = reviews.filter(
    (review) => review.aptId === apartment.id
  );

  function handleSubmitReview(newReview) {
    const review = {
      id: Date.now(),
      aptId: apartment.id,
      apartmentName: apartment.name,
      userId: user?.id || "alex",
      author: user?.name || "Alex Mitchell",
      rating: newReview.rating,
      date: "Today",
      body: newReview.body,
    };

    addReview(review);
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
            <h1>{apartment.name}</h1>
            <p>
              {apartment.address} · {apartment.neighbourhood}
            </p>
            <span>High-rise tower in a quiet residential neighbourhood.</span>
          </div>

          <div className="detail-rating">
            <strong>{apartment.rating}</strong>
            <StarRating rating={apartment.rating} />
            <span>{apartment.reviews} reviews</span>
          </div>
        </section>

        <div className="detail-layout">
          <div className="detail-main">
            <AISummary
              summary={apartment.aiSummary}
              issues={apartment.aiIssues}
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
            </section>
          </div>

          <aside className="detail-sidebar">
            <section className="info-card">
              <h3>Property Info</h3>
              <div className="info-row">
                <span>Landlord</span>
                <strong>{apartment.landlord}</strong>
              </div>
              <div className="info-row">
                <span>Units</span>
                <strong>{apartment.units}</strong>
              </div>
              <div className="info-row">
                <span>Year built</span>
                <strong>{apartment.yearBuilt}</strong>
              </div>
              <div className="info-row">
                <span>Neighbourhood</span>
                <strong>{apartment.neighbourhood}</strong>
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
