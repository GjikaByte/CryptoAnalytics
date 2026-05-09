export default function StarButton({ isStarred, onToggle, size = "md" }) {
  return (
    <button
      type="button"
      className={`star-btn ${isStarred ? "starred" : ""} size-${size}`}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      title={isStarred ? "Remove from watchlist" : "Add to watchlist"}
    >
      {isStarred ? "★" : "☆"}
    </button>
  );
}
