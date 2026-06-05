function StarRating({ rating, max = 5 }) {
  const fullStars = Math.round(rating);

  return (
    <span className="stars" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className={index < fullStars ? "star-filled" : "star-empty"}
        >
          {index < fullStars ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

export default StarRating;