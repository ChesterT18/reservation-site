import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Edit, Trash2, Sofa, HelpCircle, X, Pizza } from 'lucide-react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import type { Reservation, MenuItem, DineTable } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface OrderItem {
  id: string;
  foodId: string;
  foodName: string;
  amount: number;
  quantity: number;
  instructions: string;
}

interface FormData {
  startTime: string;
  endTime: string;
  numPeople: number;
  diningTables: string[];
  orderItems: OrderItem[];
  notes: string;
}

const Reservation: React.FC = () => {
  const { user } = useAuth();
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [diningTables, setDiningTables] = useState<DineTable[]>([]);
  
  useEffect(() => {
    const fetchDiningTablesAndTimeSlots = async () => {
      try {
        const tables = await api.dineTables.getAll();
        setDiningTables(tables);
        const times = await api.dineTables.getAllTimes();
        setTimeSlots(times);
      } catch (error) {
        console.error('Failed to fetch dining tables/times:', error);
      }
    };
    fetchDiningTablesAndTimeSlots();
  }, []);

  const [selectedTableNumber, setSelectedTableNumber] = useState<string>('');

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (selectedCalendarDate && selectedTableNumber) {
        const slots = await api.dineTables.getAvailableTimes(format(selectedCalendarDate, 'yyyy-MM-dd'), selectedTableNumber);
        setAvailableTimeSlots(slots);
      }
    };
    fetchTimeSlots();
  }, [selectedCalendarDate, selectedTableNumber]);

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [showForm, setShowForm] = useState<boolean>(false);
  const [showFloorPlan, setShowFloorPlan] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    startTime: '12:00',
    endTime: '13:00',
    numPeople: 2,
    orderItems: [],
    diningTables: [],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (user) {
      const myRes = await api.reservations.getByUser(user.id);
      setMyReservations(myRes);
    }
    // const publicRes = api.reservations.getPublic();
    // setPublicReservations(publicRes);
    try {
      const items = await api.foodItems.getAll();
      setMenuItems(items);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const dto: Reservation = {
      userId: user.id,
      userName: user.firstName + ' ' + user.lastName,
      tableIds: [],
      orders: [],
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: formData.startTime,
      endTime: formData.endTime,
      pax: formData.numPeople,
      notes: formData.notes, 
    }

    formData.diningTables.forEach(table => {
      dto.tableIds.push(table);
    });

    formData.orderItems.forEach(item => {
      dto.orders.push({
        foodId: item.foodId,
        foodName: item.foodName,
        singleAmount: item.amount,
        number: item.quantity,
        instructions: item.instructions
      });
    })

    if (editingId) {
      dto.id = editingId;
      await api.reservations.update(dto);
    } else {
      await api.reservations.create(dto);
    }

    await loadData();
    setShowForm(false);
    setEditingId(null);
    setFormData({ startTime: '12:00', endTime: '13:00', numPeople: 2, diningTables: [], orderItems: [], notes: '' });
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingId(reservation.id ? reservation.id : null);
    setSelectedDate(parseISO(reservation.date));
    setFormData({
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      numPeople: reservation.pax,
      orderItems: reservation.orders ? reservation.orders.map(order => ({
        id: order.id ? order.id : '',
        foodId: order.foodId,
        foodName: order.foodName,
        amount: order.singleAmount,
        quantity: order.number,
        instructions: order.instructions || ''
      })) : [],
      diningTables: reservation.tableIds,
      notes: reservation.notes || ''
    });
    setShowForm(true);
  };

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await api.reservations.delete(id);
        await loadData();
      } catch (error) {
        console.error('Failed to cancel reservation:', error);
        alert('Failed to cancel reservation. Please try again.');
      }
    }
  };

  const addOrderItem = () => {
    if (menuItems.length === 0) return;
    
    setFormData(prev => ({
      ...prev,
      orderItems: [
        ...prev.orderItems,
        {
          id: uuidv4(),
          foodId: menuItems[0].id,
          foodName: menuItems[0].name,
          amount: menuItems[0].price,
          quantity: 1,
          instructions: ''
        }
      ]
    }));
  };

  const removeOrderItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter(item => item.id !== id)
    }));
  };

  const updateOrderItem = (id: string, updates: Partial<OrderItem>) => {
    if (updates.foodId) {
      const item = menuItems.find(item => item.id === updates.foodId);
      if (item) {
        updates.foodName = item.name;
        updates.amount = item.price;
      }
    }
    setFormData(prev => ({
      ...prev,
      orderItems: prev.orderItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  const toggleDiningTable = (tableId: string) => {
    const exists = formData.diningTables.find(d => d === tableId);
    if (exists) {
      setFormData({
        ...formData,
        diningTables: formData.diningTables.filter(d => d !== tableId)
      });
    } else {
      setFormData({
        ...formData,
        diningTables: [...formData.diningTables, tableId]
      });
    }
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const getCalendarDays = (date: Date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = daysInMonth[0];
    const startDay = firstDay.getDay();
    const previousMonthDays = Array(startDay).fill(null);
    return [...previousMonthDays, ...daysInMonth];
  };

  const handlePreviousMonth = () => {
    setCalendarDate(subMonths(calendarDate, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(addMonths(calendarDate, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedCalendarDate(date);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center mb-8">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ startTime: '12:00', endTime: '13:00', numPeople: 2, diningTables: [], orderItems: [], notes: '' });
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Reservation</span>
          </button>
        </div>

        {showForm && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-pizza-yellow mb-6">
              {editingId ? 'Edit Reservation' : 'Create Reservation'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Start Time
                  </label>
                  <select
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="input-field"
                    required
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    End Time
                  </label>
                  <select
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="input-field"
                    required
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of People
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.numPeople}
                    onChange={(e) => setFormData({ ...formData, numPeople: parseInt(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Sofa className="w-4 h-4 inline mr-2" />
                  Choose Dining Tables
                  <button
                    type="button"
                    onClick={() => setShowFloorPlan(true)}
                    className="ml-2 inline-flex items-center justify-center text-pizza-yellow hover:text-pizza-gold transition-colors"
                    aria-label="View floor plan"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </label>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-3 max-h-60 overflow-y-auto p-4 bg-gray-800 rounded-lg">
                  {diningTables.map(dtbl => {
                    const isSelected = formData.diningTables.some(d => d === dtbl.id);
                    return (
                      <button
                        key={dtbl.id}
                        type="button"
                        onClick={() => toggleDiningTable(dtbl.id)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isSelected 
                            ? 'bg-pizza-yellow text-gray-900 hover:bg-pizza-gold' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {dtbl.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                {/** CONFLICTS */}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    <Pizza className="w-4 h-4 inline mr-2" />
                    Pre-order
                  </label>
                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="text-sm bg-pizza-yellow hover:bg-pizza-gold text-gray-900 px-3 py-1 rounded-md flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Item
                  </button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto p-4 bg-gray-800 rounded-lg">
                  {formData.orderItems.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No items added yet</p>
                  ) : (
                    formData.orderItems.map(orderItem => {
                      const menuItem = menuItems.find(item => item.id === orderItem.foodId);
                      if (!menuItem) return null;
                      
                      return (
                        <div key={orderItem.id} className="bg-gray-700 p-3 rounded-md">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-200">{menuItem.name}</h4>
                              <p className="text-sm text-gray-400">${menuItem.price} each</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOrderItem(orderItem.id)}
                              className="text-gray-400 hover:text-red-400"
                              aria-label="Remove item"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-gray-300">Qty:</label>
                              <select
                                value={orderItem.quantity}
                                onChange={(e) => updateOrderItem(orderItem.id, { quantity: parseInt(e.target.value) })}
                                className="bg-gray-600 text-white text-sm rounded px-2 py-1 w-16"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                  <option key={num} value={num}>{num}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="flex-1">
                              <select
                                value={orderItem.foodId}
                                onChange={(e) => updateOrderItem(orderItem.id, { foodId: e.target.value })}
                                className="w-full bg-gray-600 text-white text-sm rounded px-2 py-1"
                              >
                                {menuItems.map(item => (
                                  <option key={item.id} value={item.id}>
                                    {item.name} (${item.price})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <input
                              type="text"
                              value={orderItem.instructions}
                              onChange={(e) => updateOrderItem(orderItem.id, { instructions: e.target.value })}
                              placeholder="Special instructions (optional)"
                              className="w-full bg-gray-600 text-white text-sm rounded px-2 py-1 mt-1"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Notes (Birthday, allergies, etc.)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="e.g., Birthday celebration, no peanuts, window seat preferred..."
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Reservation' : 'Create Reservation'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold text-pizza-yellow mb-6">My Reservations</h2>
            <div className="space-y-4">
              {myReservations.length === 0 ? (
                <p className="text-gray-400">No reservations yet. Create your first one!</p>
              ) : (
                myReservations.map(reservation => (
                  <div key={reservation.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-pizza-yellow font-semibold">
                          {format(parseISO(reservation.date), 'MMMM dd, yyyy')}
                        </p>
                        <p className="text-gray-300">{reservation.startTime}-{reservation.endTime} • {reservation.pax} people</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm ${
                        reservation.status === 'delayed' ? 'bg-yellow-900 text-yellow-200' :
                        reservation.status === 'active' ? 'bg-green-900 text-green-200' :
                        reservation.status === 'completed' ? 'bg-blue-900 text-blue-200' :
                        'bg-red-900 text-red-200'
                      }`}>
                        {reservation.status}
                      </span>
                    </div>
                    {reservation.orders && reservation.orders.length > 0 && (
                      <p className="text-sm text-gray-400 mb-2">
                        Pre-ordered: {reservation.orders.map(f => f.foodName).join(', ')}
                      </p>
                    )}
                    {reservation.notes && (
                      <p className="text-sm text-gray-400 mb-2">Notes: {reservation.notes}</p>
                    )}
                    {reservation.status === 'active' && (
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => handleEdit(reservation)}
                          className="text-pizza-yellow hover:text-pizza-gold flex items-center space-x-1 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleCancel(reservation.id ? reservation.id : '')}
                          className="text-red-400 hover:text-red-300 flex items-center space-x-1 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
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

export default Reservation;





{/** CALENDAR
  

          <div className="card">
            <h2 className="text-2xl font-bold text-pizza-yellow mb-6">Available Time Slots</h2>
            <p className="text-gray-400 text-sm mb-4">
              Select a date to view available time slots
            </p>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-300" />
                </button>
                <h3 className="text-xl font-semibold text-gray-200">
                  {format(calendarDate, 'MMMM yyyy')}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
                    {day}
                  </div>
                ))}
                
                {getCalendarDays(calendarDate).map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} />;
                  }
                  
                  const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
                  const isCurrentMonth = isSameMonth(day, calendarDate);
                  const isSelected = selectedCalendarDate && isSameDay(day, selectedCalendarDate);
                  const isTodayDate = isToday(day);
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => !isPast && handleDateSelect(day)}
                      disabled={isPast}
                      className={`
                        aspect-[2/1] p-2 rounded-lg text-sm font-medium transition-colors
                        ${!isCurrentMonth ? 'text-gray-600' : 'text-gray-300'}
                        ${isPast ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-700 cursor-pointer'}
                        ${isSelected ? 'bg-pizza-yellow text-gray-900' : ''}
                        ${isTodayDate && !isSelected ? 'ring-2 ring-pizza-yellow ring-opacity-50' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4 mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Table className="w-4 h-4 inline mr-2" />
                Select Table Number
                <button
                  type="button"
                  onClick={() => setShowFloorPlan(true)}
                  className="ml-2 inline-flex items-center justify-center text-pizza-yellow hover:text-pizza-gold transition-colors"
                  aria-label="View floor plan"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </label>
              <select
                value={selectedTableNumber}
                onChange={(e) => {setSelectedTableNumber(e.target.value); console.log(selectedTableNumber); console.log(selectedCalendarDate);}}
                className="input-field w-full"
              >
                <option value="">Choose Table Number...</option>
                {diningTables.map(diningTable => {
                  return (
                    <option key={diningTable.id} value={diningTable.id}>{diningTable.name}</option>
                  );
                })}
              </select>
            </div>

            {selectedCalendarDate && selectedTableNumber && (
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-gray-200 mb-3">
                  Available Times for {format(selectedCalendarDate, 'MMMM dd, yyyy')}
                </h3>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map(slot => (
                      <div
                        key={slot}
                        className="bg-gray-800 p-3 rounded-lg text-center text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        <Clock className="w-4 h-4 inline mr-1" />
                        {slot}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center text-gray-400 py-4">
                      No available time slots for this date
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

  */}


  {/** grid-cols-1 lg:grid-cols-2 */}


  {/**           <h1 className="text-4xl font-bold text-pizza-yellow">Reservations</h1> */}