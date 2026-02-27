import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  // ✅ Admin check
  const isAdmin = user?.role === "admin";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">
              Radhey <span className="text-gray-400">Mart</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive("/") ? "text-white" : "text-brand-muted hover:text-white"
              }`}
            >
              Home
            </Link>

            {/* ✅ Show Admin only for admin users */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors ${
                  isActive("/admin")
                    ? "text-white"
                    : "text-brand-muted hover:text-white"
                }`}
              >
                Admin
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to="/cart"
                  className={`relative text-sm font-medium transition-colors ${
                    isActive("/cart")
                      ? "text-white"
                      : "text-brand-muted hover:text-white"
                  }`}
                >
                  Cart
                  {cart.totalItems > 0 && (
                    <span className="absolute -top-2 -right-3 bg-white text-black text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cart.totalItems > 9 ? "9+" : cart.totalItems}
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  className={`text-sm font-medium transition-colors ${
                    isActive("/profile")
                      ? "text-white"
                      : "text-brand-muted hover:text-white"
                  }`}
                >
                  {user.name?.split(" ")[0]}
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-brand-muted hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-brand-muted hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm px-3 py-1.5">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}