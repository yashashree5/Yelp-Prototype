export default function ReviewCard({ review }) {
  return (
    <div className="border p-3 mb-2 rounded">
      <strong>{review.user.name}</strong> - {review.rating} ★
      <p>{review.comment}</p>
    </div>
  );
}