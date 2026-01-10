import type { Reservation, Feedback } from '../types';

interface HourData {
  hour: string;
  reservations: number;
}

interface DateData {
  date: string;
  customers: number;
}

interface PeakPrediction {
  prediction: string;
  peakHours: string[];
  confidence: number;
}

interface ItemCount {
  name: string;
  count: number;
}

interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  score: number;
  avgRating: string;
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  summary: string;
}

interface Insight {
  type: string;
  title: string;
  description: string;
  confidence: number;
}

export class Analytics {
  static analyzePeakHours(reservations: Reservation[]): HourData[] {
    const hourCounts: { [key: string]: number } = {};
    
    reservations.forEach(reservation => {
      if (reservation.status !== 'cancelled') {
        const hour = reservation.reservation_time.split(':')[0];
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    const peakHoursData = Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        reservations: count
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    return peakHoursData;
  }

  static analyzeDemandByDate(reservations: Reservation[], filterType: 'week' | 'month' | 'year' = 'week'): DateData[] {
    const dateCounts: { [key: string]: number } = {};
    
    reservations.forEach(reservation => {
      if (reservation.status !== 'cancelled') {
        const resDate = new Date(reservation.reservation_date);
        let key: string;
        
        if (filterType === 'week') {
          const weekStart = new Date(resDate);
          weekStart.setDate(resDate.getDate() - resDate.getDay());
          key = weekStart.toISOString().split('T')[0];
        } else if (filterType === 'month') {
          key = `${resDate.getFullYear()}-${String(resDate.getMonth() + 1).padStart(2, '0')}`;
        } else {
          key = resDate.getFullYear().toString();
        }
        
        dateCounts[key] = (dateCounts[key] || 0) + reservation.num_people;
      }
    });

    return Object.entries(dateCounts)
      .map(([date, count]) => ({
        date,
        customers: count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  static predictPeakHours(reservations: Reservation[]): PeakPrediction {
    const hourData = this.analyzePeakHours(reservations);
    
    if (hourData.length === 0) {
      return {
        prediction: 'Insufficient data for prediction',
        peakHours: [],
        confidence: 0
      };
    }

    const avgReservations = hourData.reduce((sum, h) => sum + h.reservations, 0) / hourData.length;
    const peakHours = hourData
      .filter(h => h.reservations > avgReservations * 1.2)
      .sort((a, b) => b.reservations - a.reservations);

    return {
      prediction: peakHours.length > 0 
        ? `Peak hours are typically ${peakHours.map(h => h.hour).join(', ')}`
        : 'No significant peak hours detected',
      peakHours: peakHours.map(h => h.hour),
      confidence: Math.min(95, 50 + (reservations.length / 10))
    };
  }

  static analyzeMostOrderedItems(reservations: Reservation[]): ItemCount[] {
    const itemCounts: { [key: string]: number } = {};
    
    reservations.forEach(reservation => {
      if (reservation.status !== 'cancelled' && reservation.food_items) {
        reservation.food_items.forEach(item => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
        });
      }
    });

    return Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  static analyzeSentiment(feedbacks: Feedback[]): SentimentAnalysis {
    if (feedbacks.length === 0) {
      return {
        overall: 'neutral',
        score: 0,
        avgRating: '0',
        distribution: { positive: 0, neutral: 0, negative: 0 },
        summary: 'No feedback data available'
      };
    }

    const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'delicious', 'perfect', 'love', 'best', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'disappointing', 'poor', 'hate', 'disgusting', 'cold'];

    let positive = 0;
    let neutral = 0;
    let negative = 0;
    let totalRating = 0;

    feedbacks.forEach(feedback => {
      totalRating += feedback.rating;
      
      const comment = (feedback.comment || '').toLowerCase();
      const hasPositive = positiveWords.some(word => comment.includes(word));
      const hasNegative = negativeWords.some(word => comment.includes(word));

      if (feedback.rating >= 4 || hasPositive) {
        positive++;
      } else if (feedback.rating <= 2 || hasNegative) {
        negative++;
      } else {
        neutral++;
      }
    });

    const avgRating = totalRating / feedbacks.length;
    const sentimentScore = ((positive - negative) / feedbacks.length) * 100;

    let overall: 'positive' | 'neutral' | 'negative';
    if (avgRating >= 4) overall = 'positive';
    else if (avgRating >= 3) overall = 'neutral';
    else overall = 'negative';

    const summary = `Average rating: ${avgRating.toFixed(1)}/5. ${positive} positive, ${neutral} neutral, ${negative} negative feedback${feedbacks.length > 1 ? 's' : ''}.`;

    return {
      overall,
      score: sentimentScore,
      avgRating: avgRating.toFixed(1),
      distribution: { positive, neutral, negative },
      summary
    };
  }

  static generateInsights(reservations: Reservation[], feedbacks: Feedback[]): Insight[] {
    const insights: Insight[] = [];

    const peakPrediction = this.predictPeakHours(reservations);
    if (peakPrediction.peakHours.length > 0) {
      insights.push({
        type: 'peak_hours',
        title: 'Peak Hours Identified',
        description: peakPrediction.prediction,
        confidence: peakPrediction.confidence
      });
    }

    const mostOrdered = this.analyzeMostOrderedItems(reservations);
    if (mostOrdered.length > 0) {
      insights.push({
        type: 'popular_items',
        title: 'Most Popular Item',
        description: `${mostOrdered[0].name} has been ordered ${mostOrdered[0].count} times`,
        confidence: 90
      });
    }

    const sentiment = this.analyzeSentiment(feedbacks);
    insights.push({
      type: 'sentiment',
      title: 'Customer Sentiment',
      description: sentiment.summary,
      confidence: feedbacks.length > 5 ? 85 : 60
    });

    const upcomingReservations = reservations.filter(r => {
      const resDate = new Date(r.reservation_date);
      const today = new Date();
      return resDate >= today && r.status === 'pending';
    });

    if (upcomingReservations.length > 10) {
      insights.push({
        type: 'demand',
        title: 'High Upcoming Demand',
        description: `${upcomingReservations.length} upcoming reservations. Consider staffing accordingly.`,
        confidence: 95
      });
    }

    return insights;
  }
}
