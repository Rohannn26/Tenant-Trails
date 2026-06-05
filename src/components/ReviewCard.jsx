import StarRating from "./StarRating";

function ReviewCard({
  rating,
  body,
  date,
  author,
  apartmentName,
  onDelete,
  onEdit,
  showApartmentName = false,
}) {
  return (
    <article className="review-card">
      <div className="review-top">
        <div>
          {showApartmentName && <h3>{apartmentName}</h3>}
          <StarRating rating={rating} />
        </div>

        <span className="review-date">{date}</span>
      </div>

      <p>{body}</p>

      <div className="review-bottom">
        <span className="review-author">{author}</span>

        {(onEdit || onDelete) && (
          <div className="review-actions">
            {onEdit && (
              <button type="button" onClick={onEdit}>
                Edit
              </button>
            )}

            {onDelete && (
              <button type="button" onClick={onDelete} className="danger-btn">
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default ReviewCard;