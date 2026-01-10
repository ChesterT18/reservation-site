import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { Star, X } from 'lucide-react';
import type { MenuItem, UserRating } from '../types';
import { useAuth } from '../context/AuthContext';

const Menu: React.FC = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ratingItem, setRatingItem] = useState<MenuItem | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const items = await api.foodItems.getAll();
      setMenuItems(items);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const handleImageClick = (imgUrl: string) => {
    setSelectedImage(imgUrl);
  };

  const handleRateClick = (item: MenuItem) => {
    setRatingItem(item);
    setSelectedRating(0);
    setHoverRating(0);
  };

  const handleSubmitRating = async () => {
    if (ratingItem && selectedRating > 0) {
      try {
        if (!user) return;
        const dto: UserRating = {
          userId: user.id,
          userName: user.firstName + ' ' + user.lastName,
          foodId: ratingItem.id,
          score: selectedRating,
        }
        await api.userRatings.create(dto);
        setRatingItem(null);
        setSelectedRating(0);
        await loadData();
      } catch (error) {
        console.error('Failed to submit rating:', error);
      }
    }
  };

  const renderStars = (averageRating: number, perfectRating: number) => {
    const stars = [];
    for (let i = 1; i <= perfectRating; i++) {
      const isFilled = i <= Math.round(averageRating);
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            isFilled ? 'fill-pizza-yellow text-pizza-yellow' : 'text-gray-600'
          }`}
        />
      );
    }
    return stars;
  };

  const renderRatingStars = (rating: number, isHover: boolean = false) => {
    const stars = [];
    const displayRating = isHover ? hoverRating : rating;
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= displayRating;
      stars.push(
        <Star
          key={i}
          className={`w-8 h-8 cursor-pointer transition ${
            isFilled ? 'fill-pizza-yellow text-pizza-yellow' : 'text-gray-600 hover:text-pizza-yellow'
          }`}
          onClick={() => setSelectedRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pizza-yellow mb-4">Our Menu</h1>
          <p className="text-gray-300 text-lg">Discover our delicious selection</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                selectedCategory === category
                  ? 'bg-pizza-red text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="card hover:border-pizza-red transition">
              <div 
                className="flex justify-center mb-4 cursor-pointer"
                onClick={() => handleImageClick(item.imgUrl)}
              >
                <div className="w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
                  <img 
                    src={item.imgUrl} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-pizza-yellow mb-2 line-clamp-1 text-ellipsis break-words">
                <span className="text-lg line-clamp-1 text-ellipsis break-words">{item.name}</span>
              </h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-pizza-red">${item.price.toFixed(2)}</span>
                <span className="text-sm text-gray-500 bg-gray-800 px-3 py-1 rounded">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {renderStars(item.averageRating, item.perfectRating)}
                </div>
                <span className="text-sm text-gray-400">({item.noOfReviews} reviews)</span>
              </div>
              <button
                onClick={() => handleRateClick(item)}
                className="w-full bg-pizza-red hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Rate this food
              </button>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No items found in this category</p>
          </div>
        )}
      </div>

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative" style={{ maxWidth: '25vw', maxHeight: '25vh' }}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-pizza-red transition"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={selectedImage} 
              alt="Food item"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {ratingItem && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setRatingItem(null)}
        >
          <div 
            className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-pizza-yellow">Rate {ratingItem.name}</h3>
              <button
                onClick={() => setRatingItem(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex justify-center gap-2 mb-6">
              {renderRatingStars(selectedRating, hoverRating > 0)}
            </div>
            <div className="text-center mb-6">
              <p className="text-gray-400">
                {selectedRating > 0 ? `You selected ${selectedRating} star${selectedRating > 1 ? 's' : ''}` : 'Select a rating'}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setRatingItem(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={selectedRating === 0}
                className={`flex-1 font-semibold py-3 px-6 rounded-lg transition ${
                  selectedRating === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-pizza-red hover:bg-red-700 text-white'
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
