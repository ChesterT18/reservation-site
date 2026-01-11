import * as tf from '@tensorflow/tfjs';
import { Reservation, MenuItem, Feedback, DineTable, ResOrder, UserRating } from '../types';

// ==================== INTERFACES FOR ANALYTICS OUTPUTS ====================

export interface ReservationStatusBreakdown {
  total: number;
  active: number;
  completed: number;
  noshow: number;
}

export interface LineGraphData {
  labels: string[];
  data: number[];
}

export interface HeatMapData {
  xLabels: string[];
  yLabels: string[];
  data: number[][];
}

export interface PieChartData {
  labels: string[];
  data: number[];
}

export interface BarGraphData {
  labels: string[];
  data: number[];
}

export interface TopRatedFood {
  foodId: string;
  foodName: string;
  averageRating: number;
  numberOfRatings: number;
}

// ==================== HELPER FUNCTIONS ====================

// const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function filterByDateRange(reservations: Reservation[], startYear: number, endYear: number): Reservation[] {
  return reservations.filter(res => {
    const resYear = new Date(res.date).getFullYear();
    return resYear >= startYear && resYear <= endYear;
  });
}

function getDayOfWeek(dateString: string): number {
  return new Date(dateString).getDay();
}

function getMonth(dateString: string): number {
  return new Date(dateString).getMonth();
}

function getHourSlot(timeString: string): string {
  const hour = parseInt(timeString.split(':')[0]);
  const nextHour = hour + 1;
  return `${hour.toString().padStart(2, '0')}:00-${nextHour.toString().padStart(2, '0')}:00`;
}

function getHourIndex(timeString: string): number {
  const hour = parseInt(timeString.split(':')[0]);
  return hour - 11; // Assuming operating hours start at 11:00
}

// ==================== ANALYTICS FUNCTIONS ====================

/**
 * 1. Total number of reservations, broken down by status
 */
export function getReservationStatusBreakdown(reservations: Reservation[]): ReservationStatusBreakdown {
  const tensor = tf.tidy(() => {
    const active = reservations.filter(r => r.status === 'active').length;
    const completed = reservations.filter(r => r.status === 'completed').length;
    const noshow = reservations.filter(r => r.status === 'noshow').length;
    const total = reservations.length;

    return { total, active, completed, noshow };
  });

  return tensor;
}

/**
 * 2. Daily completed reservations (by day of week)
 */
export function getDailyCompletedReservations(
  reservations: Reservation[],
  startYear: number,
  endYear: number
): LineGraphData {
  const filtered = filterByDateRange(reservations, startYear, endYear)
    .filter(r => r.status === 'completed');

  return tf.tidy(() => {
    const dayCounts = new Array(7).fill(0);
    
    filtered.forEach(res => {
      const dayIndex = getDayOfWeek(res.date);
      dayCounts[dayIndex]++;
    });

    const tensor = tf.tensor1d(dayCounts);
    const data = Array.from(tensor.dataSync());

    return {
      labels: DAYS_OF_WEEK,
      data: data
    };
  });
}

/**
 * 3. Monthly completed reservations
 */
export function getMonthlyCompletedReservations(
  reservations: Reservation[],
  startYear: number,
  endYear: number
): LineGraphData {
  const filtered = filterByDateRange(reservations, startYear, endYear)
    .filter(r => r.status === 'completed');

  return tf.tidy(() => {
    const monthCounts = new Array(12).fill(0);
    
    filtered.forEach(res => {
      const monthIndex = getMonth(res.date);
      monthCounts[monthIndex]++;
    });

    const tensor = tf.tensor1d(monthCounts);
    const data = Array.from(tensor.dataSync());

    return {
      labels: MONTHS,
      data: data
    };
  });
}

/**
 * 4. Daily peak hours data (array of {day, hour, reservations} for scatter chart)
 */
export function getDailyPeakHours(
  reservations: Reservation[],
  startYear: number,
  endYear: number
): Array<{day: string; hour: number; reservations: number}> {
  const filtered = filterByDateRange(reservations, startYear, endYear)
    .filter(r => r.status === 'completed' || r.status === 'active');

  const dayHourMap: Record<string, number> = {};
  
  filtered.forEach(res => {
    const dayIndex = getDayOfWeek(res.date);
    const dayName = DAYS_OF_WEEK[dayIndex];
    const startHour = parseInt(res.startTime.split(':')[0]);
    let endHour = parseInt(res.endTime.split(':')[0]);
    if (res.endTime.endsWith(':00')) {
      endHour--;
    }

    for (let i = startHour; i <= endHour; i++) {
      const key = `${dayName}-${i}`;
      if (!dayHourMap[key]) {
        dayHourMap[key] = 0;
      }
      dayHourMap[key]++;
    }
  });

  // Convert the map to the desired array format
  const result = Object.entries(dayHourMap).map(([key, count]) => {
    const [day, hourStr] = key.split('-');
    return {
      day,
      hour: parseInt(hourStr),
      reservations: count
    };
  });

  return result;
}

/**
 * 5. Monthly peak hours data (array of {month, hour, reservations} for scatter chart)
 */
export function getMonthlyPeakHours(
  reservations: Reservation[],
  startYear: number,
  endYear: number
): Array<{month: string; hour: number; reservations: number}> {
  const filtered = filterByDateRange(reservations, startYear, endYear)
    .filter(r => r.status === 'completed' || r.status === 'active');

  const monthHourMap: Record<string, number> = {};
  
  filtered.forEach(res => {
    const monthIndex = getMonth(res.date);
    const monthName = MONTHS[monthIndex];
    const startHour = parseInt(res.startTime.split(':')[0]);
    let endHour = parseInt(res.endTime.split(':')[0]);
    if (res.endTime.endsWith(':00')) {
      endHour--;
    }

    for (let i = startHour; i <= endHour; i++) {
      const key = `${monthName}-${i}`;
      if (!monthHourMap[key]) {
        monthHourMap[key] = 0;
      }
      monthHourMap[key]++;
    }
  });

  // Convert the map to the desired array format
  const result = Object.entries(monthHourMap).map(([key, count]) => {
    const [month, hourStr] = key.split('-');
    return {
      month,
      hour: parseInt(hourStr),
      reservations: count
    };
  });

  return result;
}

/**
 * 6. Daily total guests (pax) by day of week
 */
export function getDailyTotalGuests(
  reservations: Reservation[],
  startYear: number,
  endYear: number
): LineGraphData {
  const filtered = filterByDateRange(reservations, startYear, endYear)
    .filter(r => r.status === 'completed' || r.status === 'active');

  return tf.tidy(() => {
    const dayCounts = new Array(7).fill(0);
    
    filtered.forEach(res => {
      const dayIndex = getDayOfWeek(res.date);
      dayCounts[dayIndex] += res.pax;
    });

    const tensor = tf.tensor1d(dayCounts);
    const data = Array.from(tensor.dataSync());

    return {
      labels: DAYS_OF_WEEK,
      data: data
    };
  });
}

/**
 * 7. Monthly total guests (pax)
 */
export function getMonthlyTotalGuests(
  reservations: Reservation[],
  startYear: number,
  endYear: number
): LineGraphData {
  const filtered = filterByDateRange(reservations, startYear, endYear)
    .filter(r => r.status === 'completed' || r.status === 'active');

  return tf.tidy(() => {
    const monthCounts = new Array(12).fill(0);
    
    filtered.forEach(res => {
      const monthIndex = getMonth(res.date);
      monthCounts[monthIndex] += res.pax;
    });

    const tensor = tf.tensor1d(monthCounts);
    const data = Array.from(tensor.dataSync());

    return {
      labels: MONTHS,
      data: data
    };
  });
}

/**
 * 8. Top reserved dining tables (top 3 + others)
 */
export function getTopReservedTables(
  reservations: Reservation[],
  tables: DineTable[],
  startYear: number,
  endYear: number
): PieChartData {
  const filtered = filterByDateRange(reservations, startYear, endYear)
    .filter(r => r.status === 'completed' || r.status === 'active');

  return tf.tidy(() => {
    const tableCounts = new Map<string, number>();
    
    filtered.forEach(res => {
      res.tableIds.forEach(tableId => {
        tableCounts.set(tableId, (tableCounts.get(tableId) || 0) + 1);
      });
    });

    // Sort by count descending
    const sortedTables = Array.from(tableCounts.entries())
      .sort((a, b) => b[1] - a[1]);

    const labels: string[] = [];
    const data: number[] = [];

    // Top 3
    for (let i = 0; i < Math.min(3, sortedTables.length); i++) {
      const tableId = sortedTables[i][0];
      const table = tables.find(t => t.id === tableId);
      labels.push(table?.name || `Table ${tableId}`);
      data.push(sortedTables[i][1]);
    }

    // Others
    if (sortedTables.length > 3) {
      const othersCount = sortedTables.slice(3).reduce((sum, [, count]) => sum + count, 0);
      labels.push('Others');
      data.push(othersCount);
    }

    const tensor = tf.tensor1d(data);
    const finalData = Array.from(tensor.dataSync());

    return {
      labels: labels,
      data: finalData
    };
  });
}

/**
 * 9. Top ordered food (top 3 + others)
 */
export function getTopOrderedFood(
  reservations: Reservation[],
  startYear: number,
  endYear: number
): PieChartData {
  const filtered = filterByDateRange(reservations, startYear, endYear)
    .filter(r => r.status === 'completed');

  return tf.tidy(() => {
    const foodCounts = new Map<string, { name: string; count: number }>();
    
    filtered.forEach(res => {
      res.orders.forEach(order => {
        const existing = foodCounts.get(order.foodId);
        if (existing) {
          existing.count += order.number;
        } else {
          foodCounts.set(order.foodId, {
            name: order.foodName,
            count: order.number
          });
        }
      });
    });

    // Sort by count descending
    const sortedFood = Array.from(foodCounts.entries())
      .sort((a, b) => b[1].count - a[1].count);

    const labels: string[] = [];
    const data: number[] = [];

    // Top 3
    for (let i = 0; i < Math.min(3, sortedFood.length); i++) {
      labels.push(sortedFood[i][1].name);
      data.push(sortedFood[i][1].count);
    }

    // Others
    if (sortedFood.length > 3) {
      const othersCount = sortedFood.slice(3).reduce((sum, [, item]) => sum + item.count, 0);
      labels.push('Others');
      data.push(othersCount);
    }

    const tensor = tf.tensor1d(data);
    const finalData = Array.from(tensor.dataSync());

    return {
      labels: labels,
      data: finalData
    };
  });
}

/**
 * 10. Top rated foods based on average rating
 */
export function getTopRatedFoods(
  menuItems: MenuItem[],
  startYear: number,
  endYear: number
): TopRatedFood[] {
  return tf.tidy(() => {
    // Filter menu items with ratings
    const ratedItems = menuItems.filter(item => item.noOfReviews > 0);
    
    // Sort by average rating descending
    const sorted = ratedItems
      .map(item => ({
        foodId: item.id,
        foodName: item.name,
        averageRating: item.averageRating,
        numberOfRatings: item.noOfReviews
      }))
      .sort((a, b) => b.averageRating - a.averageRating);

    // Use TensorFlow for normalization/processing
    if (sorted.length > 0) {
      const ratings = sorted.map(item => item.averageRating);
      const tensor = tf.tensor1d(ratings);
      const normalized = tensor.dataSync();
      
      return sorted.map((item, idx) => ({
        ...item,
        averageRating: normalized[idx]
      }));
    }

    return sorted;
  });
}

/**
 * 11. Average rating by feedback category
 */
export function getAverageRatingsByCategory(
  feedbacks: Feedback[],
  startYear: number,
  endYear: number
): BarGraphData {
  const filtered = feedbacks.filter(feedback => {
    if (!feedback.createdAt) return true;
    const year = new Date(feedback.createdAt).getFullYear();
    return year >= startYear && year <= endYear;
  });

  return tf.tidy(() => {
    const categories = [
      'Overall',
      'Food Quality',
      'Service',
      'Cleanliness',
      'Ambiance',
      'Value for Money'
    ];

    const totals = {
      overall: 0,
      foodQuality: 0,
      service: 0,
      cleanliness: 0,
      ambiance: 0,
      valueForMoney: 0
    };

    filtered.forEach(feedback => {
      totals.overall += feedback.overallRating;
      totals.foodQuality += feedback.foodQualityRating;
      totals.service += feedback.serviceRating;
      totals.cleanliness += feedback.cleanlinessRating;
      totals.ambiance += feedback.ambianceRating;
      totals.valueForMoney += feedback.valueForMoneyRating;
    });

    const count = filtered.length || 1; // Avoid division by zero
    const averages = [
      totals.overall / count,
      totals.foodQuality / count,
      totals.service / count,
      totals.cleanliness / count,
      totals.ambiance / count,
      totals.valueForMoney / count
    ];

    const tensor = tf.tensor1d(averages);
    const data = Array.from(tensor.dataSync());

    return {
      labels: categories,
      data: data
    };
  });
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calculate statistics using TensorFlow
 */
export function calculateStatistics(data: number[]): {
  mean: number;
  std: number;
  min: number;
  max: number;
} {
  return tf.tidy(() => {
    const tensor = tf.tensor1d(data);
    const mean = tensor.mean().dataSync()[0];
    const std = tf.moments(tensor).variance.sqrt().dataSync()[0];
    const min = tensor.min().dataSync()[0];
    const max = tensor.max().dataSync()[0];

    return { mean, std, min, max };
  });
}

/**
 * Normalize data using TensorFlow
 */
export function normalizeData(data: number[]): number[] {
  return tf.tidy(() => {
    const tensor = tf.tensor1d(data);
    const min = tensor.min();
    const max = tensor.max();
    const normalized = tensor.sub(min).div(max.sub(min));
    return Array.from(normalized.dataSync());
  });
}

/**
 * Calculate moving average for trend analysis
 */
export function calculateMovingAverage(data: number[], windowSize: number): number[] {
  return tf.tidy(() => {
    const tensor = tf.tensor1d(data);
    const result: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const windowTensor = tf.tensor1d(window);
      const avg = windowTensor.mean().dataSync()[0];
      result.push(avg);
    }
    
    return result;
  });
}
