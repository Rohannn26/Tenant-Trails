import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useReviews } from "../context/ReviewContext";
import ReviewCard from "../components/ReviewCard";
import ReviewDialog from "../components/ReviewDialog";

function Profile() {
  const { user } = useAuth();
  const { reviews, deleteReview, updateReview } = useReviews();
  const [editingReview, setEditingReview] = useState(null);

  const myReviews = reviews.filter(
    (review) => review.userId === (user?.id || "alex")
  );

  function handleDelete(reviewId) {
    deleteReview(reviewId);
  }

  function handleEditSubmit(updatedReview) {
    updateReview(editingReview.id, updatedReview);
    setEditingReview(null);
  }

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <Link to="/dashboard" className="logo">
          TenantTrails
        </Link>

        <div className="dashboard-user">
          <Link to="/dashboard" className="text-link">
            Dashboard
          </Link>
          <span>{user?.name || "Alex Mitchell"}</span>
        </div>
      </nav>

      <main className="detail-container">
        <Link to="/dashboard" className="back-link">
          ← Back to apartments
        </Link>

        <section className="profile-header">
          <div className="avatar">AM</div>

          <div>
            <h1>{user?.name || "Alex Mitchell"}</h1>
            <p>{user?.email || "alex@dal.ca"}</p>
          </div>

          <div className="profile-stats">
            <div>
              <strong>{myReviews.length}</strong>
              <span>reviews</span>
            </div>

            <div>
              <strong>3</strong>
              <span>comments</span>
            </div>
          </div>
        </section>

        <section className="profile-reviews">
          <h2>Your Reviews</h2>

          {myReviews.length === 0 && (
            <p className="empty-state">You have not written any reviews yet.</p>
          )}

          {myReviews.map((review) => (
            <ReviewCard
              key={review.id}
              rating={review.rating}
              body={review.body}
              date={review.date}
              author={review.author}
              apartmentName={review.apartmentName}
              showApartmentName={true}
              onEdit={() => setEditingReview(review)}
              onDelete={() => handleDelete(review.id)}
            />
          ))}
        </section>
      </main>

      {editingReview && (
        <div className="modal-overlay" onClick={() => setEditingReview(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ReviewDialog
              initialReview={editingReview}
              onClose={() => setEditingReview(null)}
              onSubmit={handleEditSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
