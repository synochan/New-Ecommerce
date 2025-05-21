import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const location = useLocation();
  const { state: { items } } = useCart();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Shop' },
    { path: '/cart', label: 'Cart', count: totalItems },
    { path: '/orders', label: 'Account' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-mono-900/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2"
          >
            <span className="text-xl font-bold text-white">
              Apparel
            </span>
            <span className="text-xl font-light text-mono-400">
              Store
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {navLinks.map(({ path, label, count }) => (
              <Link
                key={path}
                to={path}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(path) 
                    ? 'bg-white/10 text-white' 
                    : 'text-mono-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                {label}
                {count && count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-mono-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-fade-in">
                    {count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar; 