import React from 'react';
import { Link } from 'react-router-dom';
import { Pizza, Calendar, Star, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="relative bg-gradient-to-br from-pizza-darkred via-pizza-black to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-pizza-yellow">Shakey's Pizza</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Experience the finest pizza in town with our signature recipes
            </p>
            <div className="flex justify-center space-x-4">
              {user ? (
                <Link to="/reservation" className="btn-primary text-lg px-8 py-3">
                  Make a Reservation
                </Link>
              ) : (
                <Link to="/login" className="btn-primary text-lg px-8 py-3">
                  Get Started
                </Link>
              )}
              <Link to="/menu" className="btn-secondary text-lg px-8 py-3">
                View Menu
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Pizza className="w-16 h-16 text-pizza-red" />
            </div>
            <h3 className="text-xl font-bold text-pizza-yellow mb-2">Fresh Ingredients</h3>
            <p className="text-gray-300">
              We use only the freshest ingredients to create our delicious pizzas
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Calendar className="w-16 h-16 text-pizza-red" />
            </div>
            <h3 className="text-xl font-bold text-pizza-yellow mb-2">Easy Reservations</h3>
            <p className="text-gray-300">
              Book your table online with our simple reservation system
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Star className="w-16 h-16 text-pizza-red" />
            </div>
            <h3 className="text-xl font-bold text-pizza-yellow mb-2">Top Rated</h3>
            <p className="text-gray-300">
              Loved by customers for our quality and service
            </p>
          </div>
        </div>

        <div className="mt-16 card">
          <div className="flex items-center space-x-4 mb-6">
            <Clock className="w-8 h-8 text-pizza-red" />
            <h2 className="text-2xl font-bold text-pizza-yellow">Our Story</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Since our founding, Shakey's Pizza has been dedicated to serving the best pizza in town. 
            Our secret recipes, passed down through generations, combined with fresh, locally-sourced 
            ingredients, create an unforgettable dining experience. Whether you're celebrating a special 
            occasion or just craving great pizza, we're here to serve you with a smile.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
