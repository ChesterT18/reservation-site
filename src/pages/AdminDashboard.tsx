import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, Plus, Edit, Trash2, X, HelpCircle, Star } from 'lucide-react';
import { api } from '../api/api';
import { format, parseISO } from 'date-fns';
import type { Reservation, Feedback, MenuItem, DineTable } from '../types';
import { BarGraphData, getAverageRatingsByCategory, getDailyCompletedReservations, getDailyPeakHours, getDailyTotalGuests, getMonthlyCompletedReservations, getMonthlyPeakHours, getMonthlyTotalGuests, getReservationStatusBreakdown, getTopOrderedFood, getTopRatedFoods, getTopReservedTables, LineGraphData, PieChartData, ReservationStatusBreakdown } from '../ai/analytics2';
import { scaleSequential } from "d3-scale";
import { interpolateReds } from "d3-scale-chromatic";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [diningTables, setDiningTables] = useState<DineTable[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showFloorPlan, setShowFloorPlan] = useState<boolean>(false);

  const years = [2026];
  const [startYear, setStartYear] = useState<number>(years[0]);
  const [endYear, setEndYear] = useState<number>(years[0]);

  const [reservationStatusBreakdown, setReservationStatusBreakdown] = useState<ReservationStatusBreakdown>();
  const [dailyCompletedReservations, setDailyCompletedReservations] = useState<LineGraphData>();
  const [monthlyCompletedReservations, setMonthlyCompletedReservations] = useState<LineGraphData>();
  const [dailyPeakHours, setDailyPeakHours] = useState<{day: string; hour: number; reservations: number}[]>([]);
  const [monthlyPeakHours, setMonthlyPeakHours] = useState<{month: string; hour: number; reservations: number}[]>([]);
  const [dailyTotalGuests, setDailyTotalGuests] = useState<LineGraphData>();
  const [monthlyTotalGuests, setMonthlyTotalGuests] = useState<LineGraphData>();
  const [topRatedFood, setTopRatedFood] = useState<MenuItem[]>([]);
  const [topReservedTables, setTopReservedTables] = useState<PieChartData>();
  const [topOrderedFood, setTopOrderedFood] = useState<PieChartData>();
  const [feedbackSummary, setFeedbackSummary] = useState<BarGraphData>();

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    }
    fetchData();
  }, []);

  const loadData = async () => {
    const apiReservations = await api.reservations.getAll();
    setReservations(apiReservations);
    const apiDiningTables = await api.dineTables.getAll();
    setDiningTables(apiDiningTables);
    const apiFeedbacks = await api.feedbacks.getAll();
    setFeedbacks(apiFeedbacks);
    const apiMenu = await api.foodItems.getAll();
    setMenuItems(apiMenu);
    setReservationStatusBreakdown(getReservationStatusBreakdown(apiReservations));
    if (apiReservations && startYear && endYear) {
      setDailyCompletedReservations(getDailyCompletedReservations(apiReservations, startYear, endYear));
      setMonthlyCompletedReservations(getMonthlyCompletedReservations(apiReservations, startYear, endYear));
      setDailyPeakHours(getDailyPeakHours(apiReservations, startYear, endYear));
      setMonthlyPeakHours(getMonthlyPeakHours(apiReservations, startYear, endYear));
      setDailyTotalGuests(getDailyTotalGuests(apiReservations, startYear, endYear));
      setMonthlyTotalGuests(getMonthlyTotalGuests(apiReservations, startYear, endYear));
      setTopReservedTables(getTopReservedTables(apiReservations, apiDiningTables, startYear, endYear));
      setTopOrderedFood(getTopOrderedFood(apiReservations, startYear, endYear));
      setFeedbackSummary(getAverageRatingsByCategory(apiFeedbacks, startYear, endYear));
      const a = getTopRatedFoods(apiMenu, startYear, endYear);
      const topmenu: MenuItem[] = [];
      a.forEach(i => {
        const m = apiMenu.find(x => x.id === i.foodId);
        if (m) topmenu.push(m);
      })
      setTopRatedFood(topmenu);
    }
  };

  useEffect(() => {
    setDailyCompletedReservations(getDailyCompletedReservations(reservations, startYear, endYear));
    setMonthlyCompletedReservations(getMonthlyCompletedReservations(reservations, startYear, endYear));
    setDailyPeakHours(getDailyPeakHours(reservations, startYear, endYear));
    setMonthlyPeakHours(getMonthlyPeakHours(reservations, startYear, endYear));
    setDailyTotalGuests(getDailyTotalGuests(reservations, startYear, endYear));
    setMonthlyTotalGuests(getMonthlyTotalGuests(reservations, startYear, endYear));
  }, [reservations, startYear, endYear]);

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
  
  const handleStatusUpdate = async (res: Reservation, status: any) => {
    res.status = status;
    await api.reservations.update(res);
    await loadData();
  };

  const handleMenuSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-pizza-yellow mb-8">Admin Dashboard</h1>

        <div className="flex space-x-4 mb-8 w-full">
          {['analytics', 'reservations', 'feedbacks', 'menu'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg font-semibold whitespace-nowrap transition text-center ${
                activeTab === tab
                  ? 'bg-pizza-red text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'analytics' && (

          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-gray-300">Start Year :</label>
                <select 
                  className="bg-gray-700 text-white rounded px-3 py-1"
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                >
                  {years.map(year => (
                    <option key={`start-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-gray-300">End Year :</label>
                <select 
                  className="bg-gray-700 text-white rounded px-3 py-1"
                  value={endYear}
                  onChange={(e) => setEndYear(parseInt(e.target.value))}
                >
                  {years.map(year => (
                    <option key={`end-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-pizza-yellow mb-4">Total Reservations : {reservationStatusBreakdown?.total}</h2>
            {reservationStatusBreakdown && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="card p-4">
                  <div className="flex items-center justify-between h-full">
                    <div>
                      <p className="text-gray-400 text-sm">Active Reservations</p>
                      <p className="text-3xl font-bold text-cyan-500">{reservationStatusBreakdown.active}</p>
                    </div>
                    <Calendar className="w-10 h-10 text-cyan-500" />
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center justify-between h-full">
                    <div>
                      <p className="text-gray-400 text-sm">Completed</p>
                      <p className="text-3xl font-bold text-green-500">{reservationStatusBreakdown.completed}</p>
                    </div>
                    <Calendar className="w-10 h-10 text-green-500" />
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center justify-between h-full">
                    <div>
                      <p className="text-gray-400 text-sm">No-Shows</p>
                      <p className="text-3xl font-bold text-red-500">{reservationStatusBreakdown.noshow}</p>
                    </div>
                    <Calendar className="w-10 h-10 text-red-500" />
                  </div>
                </div>
              </div>
            )}
          
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-4 text-pizza-yellow">Total Daily Completed Reservations</h3>
                <div className="h-64">
                  {dailyCompletedReservations && dailyCompletedReservations.labels.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dailyCompletedReservations.labels.map((label, index) => ({
                          day: label,
                          reservations: dailyCompletedReservations.data[index] || 0
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                        <XAxis 
                          dataKey="day" 
                          tick={{ fill: '#9CA3AF' }}
                          tickLine={{ stroke: '#4B5563' }}
                        />
                        <YAxis 
                          tick={{ fill: '#9CA3AF' }}
                          tickLine={{ stroke: '#4B5563' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937',
                            borderColor: '#4B5563',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="reservations" 
                          name="Reservations"
                          stroke="#06B6D4"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available for the selected period
                    </div>
                  )}
                </div>
              </div>

              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-4 text-pizza-yellow">Total Monthly Completed Reservations</h3>
                <div className="h-64">
                  {monthlyCompletedReservations && monthlyCompletedReservations.labels.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyCompletedReservations.labels.map((label, index) => ({
                          month: label,
                          reservations: monthlyCompletedReservations.data[index] || 0
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fill: '#9CA3AF' }}
                          tickLine={{ stroke: '#4B5563' }}
                        />
                        <YAxis 
                          tick={{ fill: '#9CA3AF' }}
                          tickLine={{ stroke: '#4B5563' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937',
                            borderColor: '#4B5563',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="reservations" 
                          name="Reservations"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available for the selected period
                    </div>
                  )}
                </div>
              </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-4 text-pizza-yellow">Daily Peak Hours Heatmap</h3>
                <div className="overflow-x-auto">
                  {dailyPeakHours && dailyPeakHours.length > 0 ? (
                    <div className="inline-block min-w-full">
                      <div className="flex gap-1 mb-2">
                        <div className="w-16"></div>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="flex-1 text-center text-xs text-gray-400 min-w-[40px]">
                            {day}
                          </div>
                        ))}
                      </div>
                      {(() => {
                        const hours = Array.from(new Set(dailyPeakHours.map(d => d.hour))).sort((a, b) => a - b);
                        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        const maxReservations = Math.max(...dailyPeakHours.map(d => d.reservations));
                        const colorScale = scaleSequential(interpolateReds).domain([0, maxReservations]);
                        
                        return hours.map((hour) => (
                          <div key={hour} className="flex gap-1 mb-1">
                            <div className="w-16 text-xs text-gray-400 flex items-center justify-end pr-2">
                              {hour.toString().padStart(2, '0')}:00
                            </div>
                            {days.map((day) => {
                              const dataPoint = dailyPeakHours.find(d => d.day === day && d.hour === hour);
                              const count = dataPoint?.reservations || 0;
                              const color = count > 0 ? colorScale(count) : '#1F2937';
                              
                              return (
                                <div
                                  key={`${day}-${hour}`}
                                  className="flex-1 aspect-2/1 rounded-sm min-w-[40px] min-h-[40px] border border-gray-700 hover:border-pizza-yellow transition-colors cursor-pointer group relative"
                                  style={{ backgroundColor: color }}
                                  title={`${day} ${hour}:00 - ${count} reservations`}
                                >
                                  <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10 border border-gray-700">
                                    {count} reservations
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ));
                      })()}
                      <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                        <span>Less</span>
                        <div className="flex gap-1">
                          {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                            const maxReservations = Math.max(...dailyPeakHours.map(d => d.reservations));
                            const colorScale = scaleSequential(interpolateReds).domain([0, maxReservations]);
                            const color = val === 0 ? '#1F2937' : colorScale(val * maxReservations);
                            return (
                              <div
                                key={idx}
                                className="w-3 h-3 rounded-sm border border-gray-700"
                                style={{ backgroundColor: color }}
                              />
                            );
                          })}
                        </div>
                        <span>More</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      No peak hours data available
                    </div>
                  )}
                </div>
              </div>

              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-4 text-pizza-yellow">Monthly Peak Hours Heatmap</h3>
                <div className="overflow-x-auto">
                  {monthlyPeakHours && monthlyPeakHours.length > 0 ? (
                    <div className="inline-block min-w-full">
                      <div className="flex gap-1 mb-2">
                        <div className="w-16"></div>
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                          <div key={month} className="flex-1 text-center text-xs text-gray-400 min-w-[32px]">
                            {month}
                          </div>
                        ))}
                      </div>
                      {(() => {
                        const hours = Array.from(new Set(monthlyPeakHours.map(d => d.hour))).sort((a, b) => a - b);
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const maxReservations = Math.max(...monthlyPeakHours.map(d => d.reservations));
                        const colorScale = scaleSequential(interpolateReds).domain([0, maxReservations]);
                        
                        return hours.map((hour) => (
                          <div key={hour} className="flex gap-1 mb-1">
                            <div className="w-16 text-xs text-gray-400 flex items-center justify-end pr-2">
                              {hour.toString().padStart(2, '0')}:00
                            </div>
                            {months.map((month) => {
                              const dataPoint = monthlyPeakHours.find(d => d.month === month && d.hour === hour);
                              const count = dataPoint?.reservations || 0;
                              const color = count > 0 ? colorScale(count) : '#1F2937';
                              
                              return (
                                <div
                                  key={`${month}-${hour}`}
                                  className="flex-1 aspect-square rounded-sm min-w-[32px] min-h-[32px] border border-gray-700 hover:border-pizza-yellow transition-colors cursor-pointer group relative"
                                  style={{ backgroundColor: color }}
                                  title={`${month} ${hour}:00 - ${count} reservations`}
                                >
                                  <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10 border border-gray-700">
                                    {count} reservations
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ));
                      })()}
                      <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                        <span>Less</span>
                        <div className="flex gap-1">
                          {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                            const maxReservations = Math.max(...monthlyPeakHours.map(d => d.reservations));
                            const colorScale = scaleSequential(interpolateReds).domain([0, maxReservations]);
                            const color = val === 0 ? '#1F2937' : colorScale(val * maxReservations);
                            return (
                              <div
                                key={idx}
                                className="w-3 h-3 rounded-sm border border-gray-700"
                                style={{ backgroundColor: color }}
                              />
                            );
                          })}
                        </div>
                        <span>More</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      No peak hours data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-4 text-pizza-yellow">Total Daily Guests</h3>
                <div className="h-64">
                  {dailyTotalGuests && dailyTotalGuests.labels.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dailyTotalGuests.labels.map((label, index) => ({
                          day: label,
                          guests: dailyTotalGuests.data[index] || 0
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                        <XAxis 
                          dataKey="day" 
                          tick={{ fill: '#9CA3AF' }}
                          tickLine={{ stroke: '#4B5563' }}
                        />
                        <YAxis 
                          tick={{ fill: '#9CA3AF' }}
                          tickLine={{ stroke: '#4B5563' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937',
                            borderColor: '#4B5563',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="guests" 
                          name="Guests"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available for the selected period
                    </div>
                  )}
                </div>
              </div>

              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-4 text-pizza-yellow">Total Monthly Guests</h3>
                <div className="h-64">
                  {monthlyTotalGuests && monthlyTotalGuests.labels.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyTotalGuests.labels.map((label, index) => ({
                          month: label,
                          guests: monthlyTotalGuests.data[index] || 0
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fill: '#9CA3AF' }}
                          tickLine={{ stroke: '#4B5563' }}
                        />
                        <YAxis 
                          tick={{ fill: '#9CA3AF' }}
                          tickLine={{ stroke: '#4B5563' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937',
                            borderColor: '#4B5563',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="guests" 
                          name="Guests"
                          stroke="#8B5CF6"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available for the selected period
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-4 text-pizza-yellow">Top Ordered Food</h3>
                <div className="h-64">
                  {topOrderedFood && topOrderedFood.labels.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topOrderedFood.labels.map((label, index) => ({
                            name: label,
                            value: topOrderedFood.data[index] || 0
                          }))}
                          cx="35%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {topOrderedFood.labels.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#DC2626', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899'][index % 6]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937',
                            borderColor: '#4B5563',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Legend 
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                          wrapperStyle={{ paddingLeft: '20px' }}
                          formatter={(value, entry: any) => {
                            const percent = entry.payload.percent * 100;
                            return `${value}: ${percent.toFixed(0)}%`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available for the selected period
                    </div>
                  )}
                </div>
              </div>

              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-4 text-pizza-yellow">Top Reserved Tables</h3>
                <div className="h-64">
                  {topReservedTables && topReservedTables.labels.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topReservedTables.labels.map((label, index) => ({
                            name: label,
                            value: topReservedTables.data[index] || 0
                          }))}
                          cx="35%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {topReservedTables.labels.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#06B6D4', '#10B981', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899'][index % 6]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937',
                            borderColor: '#4B5563',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Legend 
                          layout="vertical"
                          align="right"
                          verticalAlign="middle"
                          wrapperStyle={{ paddingLeft: '20px' }}
                          formatter={(value, entry: any) => {
                            const percent = entry.payload.percent * 100;
                            return `${value}: ${percent.toFixed(0)}%`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available for the selected period
                    </div>
                  )}
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-pizza-yellow mb-4">Customer Ratings and Feedbacks</h2>

            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-4 text-pizza-yellow">Top Rated Foods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topRatedFood && topRatedFood.map(item => (
                  <div key={item.id} className="card hover:border-pizza-red transition">
                    <div 
                      className="flex justify-center mb-4"
                      // onClick={() => handleImageClick(item.imgUrl)}
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
                      <span className="text-lg line-clamp-2 text-ellipsis break-words">{item.name}</span>
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
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <h3 className="text-lg font-semibold mb-4 text-pizza-yellow">Average Feedback Ratings by Category</h3>
              <div className="h-64">
                {feedbackSummary && feedbackSummary.labels.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={feedbackSummary.labels.map((label, index) => ({
                        category: label,
                        rating: feedbackSummary.data[index] || 0
                      }))}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                      <XAxis 
                        dataKey="category" 
                        tick={{ fill: '#9CA3AF' }}
                        tickLine={{ stroke: '#4B5563' }}
                        angle={0}
                        textAnchor="middle"
                        height={20}
                      />
                      <YAxis 
                        tick={{ fill: '#9CA3AF' }}
                        tickLine={{ stroke: '#4B5563' }}
                        domain={[0, 5]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937',
                          borderColor: '#4B5563',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Bar 
                        dataKey="rating" 
                        name="Average Rating"
                        fill="#F59E0B"
                      >
                        {feedbackSummary.labels.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#DC2626', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6', '#EC4899'][index % 6]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No feedback data available for the selected period
                  </div>
                )}
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
                      <th className="text-left py-3 px-4 text-gray-400">Customer</th>
                      <th className="text-left py-3 px-4 text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 text-gray-400">Start Time</th>
                      <th className="text-left py-3 px-4 text-gray-400">End Time</th>
                      <th className="text-left py-3 px-4 text-gray-400">Guests</th>
                      <th className="text-left py-3 px-4 text-gray-400">
                        Table 
                        <button
                          type="button"
                          onClick={() => setShowFloorPlan(true)}
                          className="ml-2 inline-flex items-center justify-center text-pizza-yellow hover:text-pizza-gold transition-colors"
                          aria-label="View floor plan"
                        >
                          <HelpCircle className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400">Total Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(res => (
                      <tr key={res.id} className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="py-3 px-4 text-gray-300">{res.userName}</td>
                        <td className="py-3 px-4 text-gray-300">
                          {format(parseISO(res.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-gray-300">{res.startTime}</td>
                        <td className="py-3 px-4 text-gray-300">{res.endTime}</td>
                        <td className="py-3 px-4 text-gray-300">{res.pax}</td>
                        <td className="py-3 px-4 text-gray-300">{res.tableIds.map(tableId => diningTables.find(table => table.id === tableId)?.name).join(', ')}</td>
                        <td className="py-3 px-4 text-gray-300">{res.totalAmount}</td>
                        <td className="py-3 px-4">
                          <select
                            value={res.status}
                            onChange={(e) => handleStatusUpdate(res, e.target.value)}
                            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                          >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="noshow">No Show</option>
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

        {activeTab === 'feedbacks' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold text-pizza-yellow mb-6">Customer Feedbacks</h2>
              <div className="space-y-4">
                {/** feedbacks.map(feedback => (
                  <div key={feedback.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-pizza-yellow font-semibold">{feedback.}</p>
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
                ))*/}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-pizza-yellow">Menu Management</h2>
              <button
                // onClick={() => {
                //   setShowMenuForm(true);
                //   setEditingMenuItem(null);
                //   setMenuFormData({ name: '', description: '', category: 'Pizza', price: '', image_url: '', available: 1 });
                // }}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Menu Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map(item => (
                <div key={item.id} className="card">
                  <h3 className="text-lg font-bold text-pizza-yellow mb-2">{item.name}</h3>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{item.description}</p>
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
                      // onClick={() => handleMenuEdit(item)}
                      className="flex-1 bg-pizza-yellow text-pizza-black py-2 rounded hover:bg-pizza-gold transition"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      // onClick={() => handleMenuDelete(item.id)}
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
      </div>

      {showFloorPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowFloorPlan(false)}>
          <div className="relative bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowFloorPlan(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-pizza-yellow mb-4">Restaurant Floor Plan</h3>
            <img
              src="/src/media/restaurant-floor-plan.png"
              alt="Restaurant Floor Plan"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

{/** 

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-4 text-pizza-yellow">Daily Peak Hours</h3>
                <div className="h-96">
                  {dailyPeakHours && dailyPeakHours.data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                        <XAxis 
                          type="category" 
                          dataKey="x" 
                          name="Day"
                          allowDuplicatedCategory={false}
                          tick={{ fill: '#9CA3AF' }}
                          tickLine={{ stroke: '#4B5563' }}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="y" 
                          name="Hour"
                          tick={{ fill: '#9CA3AF' }}
                          tickLine={{ stroke: '#4B5563' }}
                        />
                        <ZAxis 
                          type="number" 
                          dataKey="z" 
                          range={[100, 1000]} 
                          name="Reservations"
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          contentStyle={{ 
                            backgroundColor: '#1F2937',
                            borderColor: '#4B5563',
                            borderRadius: '0.5rem'
                          }}
                          formatter={(value: any, name: string) => {
                            if (name === 'Reservations') return [value, name];
                            return [value, name];
                          }}
                        />
                        <Scatter 
                          name="Peak Hours" 
                          data={dailyPeakHours.data.flatMap((row, rowIdx) =>
                            row.map((value, colIdx) => ({
                              x: dailyPeakHours.xLabels[colIdx],
                              y: dailyPeakHours.yLabels[rowIdx],
                              z: value
                            }))
                          )}
                          fill="#DC2626"
                        >
                          {dailyPeakHours.data.flatMap((row, rowIdx) =>
                            row.map((value, colIdx) => {
                              const maxValue = Math.max(...dailyPeakHours.data.flat());
                              const intensity = maxValue > 0 ? value / maxValue : 0;
                              const opacity = value === 0 ? 0.1 : 0.3 + intensity * 0.7;
                              return (
                                <Cell 
                                  key={`cell-${rowIdx}-${colIdx}`} 
                                  fill={`rgba(220, 38, 38, ${opacity})`}
                                />
                              );
                            })
                          )}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available for the selected period
                    </div>
                  )}
                </div>
              </div>

              <div className="card p-4">
                <h3 className="text-lg font-semibold mb-4 text-pizza-yellow">Monthly Peak Hours</h3>
                <div className="h-96">
                  {monthlyPeakHours && monthlyPeakHours.data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                        <XAxis 
                          type="category" 
                          dataKey="x" 
                          name="Month"
                          allowDuplicatedCategory={false}
                          tick={{ fill: '#9CA3AF' }}
                          tickLine={{ stroke: '#4B5563' }}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="y" 
                          name="Hour"
                          tick={{ fill: '#9CA3AF' }}
                          tickLine={{ stroke: '#4B5563' }}
                        />
                        <ZAxis 
                          type="number" 
                          dataKey="z" 
                          range={[100, 1000]} 
                          name="Reservations"
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          contentStyle={{ 
                            backgroundColor: '#1F2937',
                            borderColor: '#4B5563',
                            borderRadius: '0.5rem'
                          }}
                          formatter={(value: any, name: string) => {
                            if (name === 'Reservations') return [value, name];
                            return [value, name];
                          }}
                        />
                        <Scatter 
                          name="Peak Hours" 
                          data={monthlyPeakHours.data.flatMap((row, rowIdx) =>
                            row.map((value, colIdx) => ({
                              x: monthlyPeakHours.xLabels[colIdx],
                              y: monthlyPeakHours.yLabels[rowIdx],
                              z: value
                            }))
                          )}
                          fill="#F59E0B"
                        >
                          {monthlyPeakHours.data.flatMap((row, rowIdx) =>
                            row.map((value, colIdx) => {
                              const maxValue = Math.max(...monthlyPeakHours.data.flat());
                              const intensity = maxValue > 0 ? value / maxValue : 0;
                              const opacity = value === 0 ? 0.1 : 0.3 + intensity * 0.7;
                              return (
                                <Cell 
                                  key={`cell-${rowIdx}-${colIdx}`} 
                                  fill={`rgba(245, 158, 11, ${opacity})`}
                                />
                              );
                            })
                          )}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available for the selected period
                    </div>
                  )}
                </div>
              </div>
            </div>

            */}