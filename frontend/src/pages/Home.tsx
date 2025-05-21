import { Link } from 'react-router-dom';

const Home = () => {
  const categories = [
    { id: 1, name: 'New Arrivals', image: '/images/new-arrivals.jpg', path: '/products?category=new' },
    { id: 2, name: 'Men\'s Collection', image: '/images/mens.jpg', path: '/products?category=men' },
    { id: 3, name: 'Women\'s Collection', image: '/images/womens.jpg', path: '/products?category=women' },
    { id: 4, name: 'Accessories', image: '/images/accessories.jpg', path: '/products?category=accessories' },
  ];

  return (
    <div className="space-y-16 animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[80vh] -mt-16 flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-mono-900 to-transparent z-10" />
        <div className="absolute inset-0">
          <img 
            src="/images/hero.jpg" 
            alt="Hero" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-20">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl sm:text-6xl font-bold text-white">
              Discover Your Style
            </h1>
            <p className="text-lg text-mono-200">
              Explore our latest collection of premium apparel and accessories.
            </p>
            <div className="flex gap-4">
              <Link to="/products" className="btn btn-primary">
                Shop Now
              </Link>
              <Link to="/products?category=new" className="btn btn-secondary">
                New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container">
        <h2 className="text-3xl font-bold text-white mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={category.path}
              className="group relative h-64 overflow-hidden rounded-lg card-hover"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-mono-900 via-mono-900/20 to-transparent z-10" />
              <img 
                src={category.image} 
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-xl font-bold text-white">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="container py-16 bg-mono-800/50 rounded-2xl backdrop-blur-sm">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-white">Why Choose Us</h2>
          <p className="text-mono-300 max-w-2xl mx-auto">
            Experience premium quality and exceptional service
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Premium Quality', description: 'Carefully curated collection of high-quality apparel' },
            { title: 'Fast Shipping', description: 'Quick delivery to your doorstep worldwide' },
            { title: '24/7 Support', description: 'Always here to help with your shopping needs' },
          ].map((feature, index) => (
            <div key={index} className="card p-6 text-center space-y-4">
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="text-mono-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container">
        <div className="card p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">Stay Updated</h2>
          <p className="text-mono-300 max-w-xl mx-auto">
            Subscribe to our newsletter for exclusive offers and updates
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="input flex-1"
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home; 