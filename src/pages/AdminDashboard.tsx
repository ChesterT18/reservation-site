import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Users, Pizza as PizzaIcon, TrendingUp, MessageSquare, Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../api/api';
import { Analytics } from '../ai/analytics';
import { format, parseISO } from 'date-fns';
import type { Reservation, Feedback, MenuItem } from '../types';

interface MenuFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  image_url: string;
  available: number;
}

interface AvailabilityData {
  date: string;
  time_slot: string;
  max_tables: number | string;
  max_customers: number | string;
  blocked: number;
  reason: string;
}

interface TableBlockData {
  date: string;
  time_slot: string;
  table_number: number | string;
  reason: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [insights, setInsights] = useState<any[]>([]);
  const [showMenuForm, setShowMenuForm] = useState<boolean>(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  const [menuFormData, setMenuFormData] = useState<MenuFormData>({
    name: '',
    description: '',
    category: 'Pizza',
    price: '',
    image_url: '',
    available: 1
  });

  const [availabilityData, setAvailabilityData] = useState<AvailabilityData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    time_slot: '12:00',
    max_tables: 10,
    max_customers: 40,
    blocked: 0,
    reason: ''
  });

  const [tableBlockData, setTableBlockData] = useState<TableBlockData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    time_slot: '12:00',
    table_number: 1,
    reason: ''
  });

  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // const res = api.reservations.getAll();
    setReservations([]);
    // const fb = api.feedbacks.getAll();
    setFeedbacks([]);
    const items = await api.foodItems.getAll();
    setMenuItems(items);
    // const analyticsInsights = Analytics.generateInsights(res, fb);
    setInsights([]);
  };

  const handleStatusUpdate = (id: number, status: string) => {
    // api.reservations.updateStatus(id, status);
    api.reservations.updateStatus();
    loadData();
  };

  const handleMenuSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingMenuItem) {
      api.foodItems.update(
        // editingMenuItem.id,
        // menuFormData.name,
        // menuFormData.description,
        // menuFormData.category,
        // parseFloat(menuFormData.price),
        // menuFormData.image_url,
        // menuFormData.available
      );
    } else {
      api.foodItems.create(
        // menuFormData.name,
        // menuFormData.description,
        // menuFormData.category,
        // parseFloat(menuFormData.price),
        // menuFormData.image_url
      );
    }
    loadData();
    setShowMenuForm(false);
    setEditingMenuItem(null);
    setMenuFormData({ name: '', description: '', category: 'Pizza', price: '', image_url: '', available: 1 });
  };

  const handleMenuDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      // api.foodItems.delete(id);
      api.foodItems.delete();
      loadData();
    }
  };

  const handleMenuEdit = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price.toString(),
      image_url: item.imgUrl,
      available: 1
    });
    setShowMenuForm(true);
  };

  const handleAvailabilitySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // api.availability.set(
    //   availabilityData.date,
    //   availabilityData.time_slot,
    //   typeof availabilityData.max_tables === 'string' ? parseInt(availabilityData.max_tables) : availabilityData.max_tables,
    //   typeof availabilityData.max_customers === 'string' ? parseInt(availabilityData.max_customers) : availabilityData.max_customers,
    //   availabilityData.blocked,
    //   availabilityData.reason
    // );
    // setAvailabilityData({
    //   date: format(new Date(), 'yyyy-MM-dd'),
    //   time_slot: '12:00',
    //   max_tables: 10,
    //   max_customers: 40,
    //   blocked: 0,
    //   reason: ''
    // });
  };

  const handleTableBlockSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // api.tableBlocks.create(
    //   tableBlockData.date,
    //   tableBlockData.time_slot,
    //   typeof tableBlockData.table_number === 'string' ? parseInt(tableBlockData.table_number) : tableBlockData.table_number,
    //   tableBlockData.reason
    // );
    // setTableBlockData({
    //   date: format(new Date(), 'yyyy-MM-dd'),
    //   time_slot: '12:00',
    //   table_number: 1,
    //   reason: ''
    // });
  };

  const peakHoursData = Analytics.analyzePeakHours(reservations);
  const demandData = Analytics.analyzeDemandByDate(reservations, filterPeriod);
  const mostOrderedItems = Analytics.analyzeMostOrderedItems(reservations);
  const sentimentAnalysis = Analytics.analyzeSentiment(feedbacks);
  const peakPrediction = Analytics.predictPeakHours(reservations);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-pizza-yellow mb-8">Admin Dashboard</h1>

        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {['overview', 'reservations', 'analytics', 'menu', 'availability', 'feedbacks'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                activeTab === tab
                  ? 'bg-pizza-red text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Reservations</p>
                    <p className="text-3xl font-bold text-pizza-yellow">{reservations.length}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-pizza-red" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {reservations.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-yellow-400" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Menu Items</p>
                    <p className="text-3xl font-bold text-pizza-yellow">{menuItems.length}</p>
                  </div>
                  <PizzaIcon className="w-12 h-12 text-pizza-red" />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Rating</p>
                    <p className="text-3xl font-bold text-pizza-yellow">{sentimentAnalysis.avgRating}</p>
                  </div>
                  <MessageSquare className="w-12 h-12 text-pizza-red" />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold text-pizza-yellow mb-4">AI Insights</h2>
              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <div key={idx} className="bg-gray-800 p-4 rounded-lg flex items-start space-x-3">
                    <TrendingUp className="w-6 h-6 text-pizza-red mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-pizza-yellow">{insight.title}</h3>
                      <p className="text-gray-300 text-sm">{insight.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Confidence: {insight.confidence}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="text-2xl font-bold text-pizza-yellow mb-4">Peak Hours</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                    <Bar dataKey="reservations" fill="#DC2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold text-pizza-yellow mb-4">Customer Sentiment</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Overall Sentiment:</span>
                    <span className={`px-3 py-1 rounded font-semibold ${
                      sentimentAnalysis.overall === 'positive' ? 'bg-green-900 text-green-200' :
                      sentimentAnalysis.overall === 'neutral' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-red-900 text-red-200'
                    }`}>
                      {sentimentAnalysis.overall}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Positive</span>
                      <span className="text-green-400">{sentimentAnalysis.distribution.positive}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Neutral</span>
                      <span className="text-yellow-400">{sentimentAnalysis.distribution.neutral}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Negative</span>
                      <span className="text-red-400">{sentimentAnalysis.distribution.negative}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mt-4">{sentimentAnalysis.summary}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold text-pizza-yellow mb-6">All Reservations</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400">ID</th>
                      <th className="text-left py-3 px-4 text-gray-400">Customer</th>
                      <th className="text-left py-3 px-4 text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 text-gray-400">Time</th>
                      <th className="text-left py-3 px-4 text-gray-400">Guests</th>
                      <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(res => (
                      <tr key={res.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="py-3 px-4 text-gray-300">{res.id}</td>
                        <td className="py-3 px-4 text-gray-300">{res.user_name}</td>
                        <td className="py-3 px-4 text-gray-300">
                          {format(parseISO(res.reservation_date), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-gray-300">{res.reservation_time}</td>
                        <td className="py-3 px-4 text-gray-300">{res.num_people}</td>
                        <td className="py-3 px-4">
                          <select
                            value={res.status}
                            onChange={(e) => handleStatusUpdate(res.id, e.target.value)}
                            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-pizza-yellow">Demand Forecasting</h2>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value as 'week' | 'month' | 'year')}
                  className="bg-gray-800 text-white px-4 py-2 rounded"
                >
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={demandData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Legend />
                  <Line type="monotone" dataKey="customers" stroke="#DC2626" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold text-pizza-yellow mb-4">Peak Hours Prediction</h2>
              <div className="bg-gray-800 p-6 rounded-lg">
                <p className="text-gray-300 text-lg mb-2">{peakPrediction.prediction}</p>
                <p className="text-sm text-gray-500">Confidence: {peakPrediction.confidence.toFixed(0)}%</p>
                {peakPrediction.peakHours.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-400 mb-2">Predicted Peak Hours:</p>
                    <div className="flex flex-wrap gap-2">
                      {peakPrediction.peakHours.map(hour => (
                        <span key={hour} className="bg-pizza-red px-3 py-1 rounded text-white">
                          {hour}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-pizza-yellow">Menu Management</h2>
              <button
                onClick={() => {
                  setShowMenuForm(true);
                  setEditingMenuItem(null);
                  setMenuFormData({ name: '', description: '', category: 'Pizza', price: '', image_url: '', available: 1 });
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Menu Item</span>
              </button>
            </div>

            {showMenuForm && (
              <div className="card">
                <h3 className="text-xl font-bold text-pizza-yellow mb-4">
                  {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <form onSubmit={handleMenuSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input
                        type="text"
                        value={menuFormData.name}
                        onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <select
                        value={menuFormData.category}
                        onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })}
                        className="input-field"
                      >
                        <option value="Pizza">Pizza</option>
                        <option value="Appetizers">Appetizers</option>
                        <option value="Salads">Salads</option>
                        <option value="Desserts">Desserts</option>
                        <option value="Beverages">Beverages</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={menuFormData.price}
                        onChange={(e) => setMenuFormData({ ...menuFormData, price: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Available</label>
                      <select
                        value={menuFormData.available}
                        onChange={(e) => setMenuFormData({ ...menuFormData, available: parseInt(e.target.value) })}
                        className="input-field"
                      >
                        <option value={1}>Yes</option>
                        <option value={0}>No</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={menuFormData.description}
                      onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                      className="input-field"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                    <input
                      type="text"
                      value={menuFormData.image_url}
                      onChange={(e) => setMenuFormData({ ...menuFormData, image_url: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button type="submit" className="btn-primary">
                      {editingMenuItem ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMenuForm(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map(item => (
                <div key={item.id} className="card">
                  <h3 className="text-lg font-bold text-pizza-yellow mb-2">{item.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-pizza-red">${item.price.toFixed(2)}</span>
                    {/*
                    <span className={`text-sm px-2 py-1 rounded ${
                      item.available ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                    */}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMenuEdit(item)}
                      className="flex-1 bg-pizza-yellow text-pizza-black py-2 rounded hover:bg-pizza-gold transition"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleMenuDelete(item.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'feedbacks' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold text-pizza-yellow mb-6">Customer Feedbacks</h2>
              <div className="space-y-4">
                {feedbacks.map(feedback => (
                  <div key={feedback.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-pizza-yellow font-semibold">{feedback.user_name}</p>
                        <p className="text-sm text-gray-500">
                          {feedback.created_at && format(parseISO(feedback.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < feedback.rating ? 'text-pizza-yellow' : 'text-gray-600'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300">{feedback.comment}</p>
                    <span className="inline-block mt-2 text-xs bg-gray-700 px-2 py-1 rounded text-gray-400">
                      {feedback.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
