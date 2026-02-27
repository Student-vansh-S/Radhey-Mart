import { Link, useParams } from "react-router-dom";

export default function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <div className="max-w-2xl mx-auto px-4 py-14 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-2xl font-bold text-white">Order Confirmed!</h1>
      <p className="text-brand-muted mt-2">
        Your order <span className="text-white font-semibold">#{orderId}</span> has been placed successfully.
      </p>
      <p className="text-brand-muted mt-2">
        Admins have been notified by email.
      </p>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Link to="/" className="btn-primary px-5 py-2.5">Continue Shopping</Link>
        <Link to="/profile" className="btn-secondary px-5 py-2.5">Go to Profile</Link>
      </div>
    </div>
  );
}