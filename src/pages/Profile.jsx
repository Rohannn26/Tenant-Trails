import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiFetch } from "../api";
import ReviewCard from "../components/ReviewCard";
import ReviewDialog from "../components/ReviewDialog";
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

function Profile() {
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const data = await apiFetch("/api/profile");

        if (!isMounted) {
          return;
        }

        setProfileUser(data.user);
        setReviews(data.reviews || []);
        setError("");
        setActionError("");
      } catch {
        if (isMounted) {
          setError("Could not load profile.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleDelete(reviewId) {
    try {
      setActionError("");

      await apiFetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      setReviews((currentReviews) =>
        currentReviews.filter((review) => review.id !== reviewId)
      );
    } catch (deleteError) {
      setActionError(deleteError.message || "Could not delete review.");
    }
  }

  async function handleEditSubmit(updatedReview) {
    setActionError("");

    await apiFetch(`/api/reviews/${editingReview.id}`, {
      method: "PUT",
      body: JSON.stringify({
        rating: updatedReview.rating,
        body: updatedReview.body,
      }),
    });

    setReviews((currentReviews) =>
      currentReviews.map((review) =>
        review.id === editingReview.id
          ? {
              ...review,
              rating: updatedReview.rating,
              body: updatedReview.body,
            }
          : review
      )
    );
  }

  const displayUser = profileUser || user;

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="detail-container">
          <p className="empty-state">Loading profile...</p>
        </main>
      </div>
    );
  }

  if (error || !displayUser) {
    return (
      <div className="dashboard-page">
        <main className="detail-container">
          <p className="empty-state">Could not load profile.</p>
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
          <Link to="/dashboard" className="text-link">
            Dashboard
          </Link>
          <span>{displayUser.name}</span>
        </div>
      </nav>

      <main className="detail-container">
        <Link to="/dashboard" className="back-link">
          {"<-"} Back to apartments
        </Link>

        <section className="profile-header">
          <div className="avatar">{displayUser.initials || "TT"}</div>

          <div>
            <h1>{displayUser.name}</h1>
            <p>{displayUser.email}</p>
          </div>

          <div className="profile-stats">
            <div>
              <strong>{reviews.length}</strong>
              <span>reviews</span>
            </div>

            <div>
              <strong>{displayUser.initials || "TT"}</strong>
              <span>initials</span>
            </div>
          </div>
        </section>

        <section className="profile-reviews">
          <h2>Your Reviews</h2>

          {actionError && <p className="error">{actionError}</p>}

          {reviews.length === 0 && (
            <p className="empty-state">You have not written any reviews yet.</p>
          )}

          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              rating={review.rating}
              body={review.body}
              date={formatReviewDate(review.date)}
              author={displayUser.name}
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
