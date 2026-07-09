import { useState } from "react";

function ReviewDialog({ onClose, onSubmit, initialReview = null }) {
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [body, setBody] = useState(initialReview?.body || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (rating === 0) {
      setError("Please choose a rating.");
      return;
    }

    if (!body.trim()) {
      setError("Please write your review.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await onSubmit({
        rating,
        body,
      });

      onClose();
    } catch (submitError) {
      setError(submitError.message || "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="review-dialog" onSubmit={handleSubmit}>
      <div className="dialog-header">
        <h2>{initialReview ? "Edit Review" : "Write a Review"}</h2>
        <button type="button" onClick={onClose} className="close-btn">
          ×
        </button>
      </div>

      <label>Your rating</label>
      <div className="star-input">
        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => setRating(number)}
            className={number <= rating ? "selected-star" : ""}
          >
            {number <= rating ? "★" : "☆"}
          </button>
        ))}
      </div>

      <label>Your review</label>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="What was your experience living here?"
        rows="5"
      />

      {error && <p className="error">{error}</p>}

      <div className="dialog-actions">
        <button type="button" onClick={onClose} className="secondary-action">
          Cancel
        </button>

        <button type="submit" className="primary-action" disabled={submitting}>
          {submitting
            ? "Saving..."
            : initialReview
              ? "Save Changes"
              : "Submit Review"}
        </button>
      </div>
    </form>
  );
}

export default ReviewDialog;
