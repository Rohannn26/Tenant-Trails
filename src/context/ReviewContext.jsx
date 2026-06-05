import { createContext, useContext, useState } from "react";
import { reviews as initialReviews } from "../data/mockData";

const ReviewContext = createContext(null);

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState(initialReviews);

  function addReview(review) {
    setReviews((currentReviews) => [review, ...currentReviews]);
  }

  function deleteReview(reviewId) {
    setReviews((currentReviews) =>
      currentReviews.filter((review) => review.id !== reviewId)
    );
  }

  function updateReview(reviewId, updatedReview) {
    setReviews((currentReviews) =>
      currentReviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              rating: updatedReview.rating,
              body: updatedReview.body,
            }
          : review
      )
    );
  }

  return (
    <ReviewContext.Provider
      value={{ reviews, addReview, deleteReview, updateReview }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);

  if (!context) {
    throw new Error("useReviews must be used within a ReviewProvider");
  }

  return context;
}
