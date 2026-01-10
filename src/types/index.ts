export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface DineTable {
  id: string;
  name: string;
  availableSeats: number;
  category: 'regular' | 'private';
  hourlyCost: number;
}

export interface Reservation {
  id?: string;
  userId: string;
  userName: string;
  tableIds: Array<string>;
  orders: Array<ResOrder>;
  date: string;
  startTime: string;
  endTime: string;
  pax: number;
  totalAmount?: number;
  status?: 'active' | 'delayed' | 'overriden' | 'completed';
  createdAt?: string;
  updatedAt?: string;
  notes: string;
}

export interface ResOrder {
  id?: string;
  reservationId?: string;
  foodId: string;
  foodName: string;
  singleAmount: number;
  number: number;
  size?: string;
  variation?: string;
  instructions?: string;
}

export interface PublicReservation {
  reservation_date: string;
  reservation_time: string;
  num_people: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface ReservationDetails {
  date: string;
  time: string;
  numPeople: number;
  customerName: string;
  customerEmail: string;
  reservationId: string;
  notes?: string;
}







export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imgUrl: string;
  noOfReviews: number;
  averageRating: number;
  perfectRating: number;
}





export interface Feedback {
  id?: string;
  userId: string;
  userName: string;
  reservationId?: string;
  foodQualityRating: number;
  foodQualityComment?: string;
  serviceRating: number;
  serviceComment?: string;
  ambianceRating: number;
  ambianceComment?: string;
  cleanlinessRating: number;
  cleanlinessComment?: string;
  generalFeedback?: string;
  suggestion?: string;
  recommend: 'yes'|'no';
  favoriteFoodIds: string;
  createdAt?: string;
}

export interface UserRating {
  id?: string;
  userId: string;
  userName: string;
  foodId: string;
  score: number;
  createdAt?: string;
}





export interface Availability {
  id: number;
  date: string;
  time_slot: string;
  max_tables: number;
  max_customers: number;
  blocked: number;
  reason?: string;
}

export interface TableBlock {
  id: number;
  date: string;
  time_slot: string;
  table_number: number;
  blocked: number;
  reason?: string;
  created_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: User;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  register: (email: string, password: string, name: string, phone: string) => Promise<ApiResponse>;
}
