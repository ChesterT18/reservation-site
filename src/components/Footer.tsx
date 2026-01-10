import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-pizza-yellow text-lg font-bold mb-4">Contact Information</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-pizza-red" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-pizza-red" />
                <span>info@shakeyspizza.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-pizza-red" />
                <span>123 Pizza Street, Food City, FC 12345</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-pizza-yellow text-lg font-bold mb-4">Operating Hours</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-start space-x-2">
                <Clock className="w-5 h-5 text-pizza-red mt-0.5" />
                <div>
                  <p>Monday - Thursday: 11:00 AM - 10:00 PM</p>
                  <p>Friday - Saturday: 11:00 AM - 11:00 PM</p>
                  <p>Sunday: 12:00 PM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-pizza-yellow text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                 className="bg-gray-800 p-3 rounded-full hover:bg-pizza-red transition">
                <Facebook className="w-6 h-6 text-white" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                 className="bg-gray-800 p-3 rounded-full hover:bg-pizza-red transition">
                <Instagram className="w-6 h-6 text-white" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="bg-gray-800 p-3 rounded-full hover:bg-pizza-red transition">
                <Twitter className="w-6 h-6 text-white" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Shakey's Pizza. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
