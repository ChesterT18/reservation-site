//import { getDatabase, saveDatabase } from '../database/db';
import type {
  AuthResponse, User, MenuItem,
  DineTable,
  Reservation,
  Feedback,
  UserRating,
} from '../types';

const getData = async <T>(uri: string) : Promise<T | null> => {
  const body = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }
  try {
    const response = await fetch(uri, body);
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 204) {
      return null;
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error('Error encountered while trying to get data');
  } 
}

const createData = async <T>(uri: string, data: T) : Promise<T> => {
  const body = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }
  try {
    const response = await fetch(uri, body);
    if (response.status === 201) {
      return response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error('Error encountered while trying to create data');
  } 
}

const updateData = async <T>(uri: string, data: T) : Promise<T | null> => {
  const body = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }
  try {
    const response = await fetch(uri, body);
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 204) {
      return null;
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error('Error encountered while trying to update data');
  } 
}

const deleteData = async (uri: string ): Promise<boolean> => {
  const body = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  }
  try {
    const response = await fetch(uri, body);
    if (response.status === 204) {
      return true;
    } else if (response.status === 404) {
      return false;
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    throw new Error('Error encountered while trying to delete data');
  } 
}

export const api = {

  auth: {

    register: async (user: User): Promise<AuthResponse> => {
      try {
        const uri = `/api/user`;
        const data = await createData<User>(uri, user);
        if (!data) { return { success: false, message: 'Registration failed' }; }
        return { success: true, user: data };
      } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'An error occurred during registration' };
      }
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
      try {
        const uri = `/api/user/${email}/${password}`;
        const data = await getData<User>(uri);
        if (!data) { return { success: false, message: 'Incorrect username or password' }; }
        return { success: true, user: data };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'An error occurred during login' };
      }
    },

    verifySecurityAnswer: () => {},

    // verifySecurityAnswer: (email: string, answer: string): boolean => {
    //   const db = getDatabase();
    //   if (!db) return false;
    //   const result = db.exec(
    //     `SELECT id FROM users WHERE email = ? AND security_answer = ?`,
    //     [email, answer]
    //   );
    //   return result.length > 0 && result[0].values.length > 0;
    // }
  },

  users: {

    getAll: () => {}

    // getAll: (): User[] => {
    //   const db = getDatabase();
    //   if (!db) return [];
    //   const result = db.exec(`SELECT id, email, name, phone, role, created_at FROM users`);
    //   if (result.length > 0) {
    //     return result[0].values.map(row => ({
    //       id: row[0] as number,
    //       email: row[1] as string,
    //       name: row[2] as string,
    //       phone: row[3] as string,
    //       role: row[4] as 'customer' | 'admin',
    //       created_at: row[5] as string
    //     }));
    //   }
    //   return [];
    // }

  },

  dineTables: {

    getAll: async (): Promise<DineTable[]> => {
      try {
        const uri = `/api/tables`;
        const data = await getData<DineTable[]>(uri);
        if (!data) { return []; }
        // arrange alphabetically
        data.sort((a, b) => {
          return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        });
        return data;
      } catch (error) {
        console.error('Fetch dining tables error:', error);
        return [];
      }
    },

    getAllTimes: async(): Promise<string[]> => {
      try {
        const uri = `/api/times`;
        const data = await getData<string[]>(uri);
        if (!data) { return []; }
        return data;
      } catch (error) {
        console.error('Fetch time slots error:', error);
        return [];
      }
    },

    getAvailableTimes: async (dateStr: string, tableId: string): Promise<string[]> => {
      try {
        const uri = `/api/times/available?date=${dateStr}&tableId=${tableId}`;
        const data = await getData<string[]>(uri);
        if (!data) { return []; }
        return data;
      } catch (error) {
        console.error('Fetch available times error:', error);
        return [];
      }
    },

  },

  foodItems: {

    getAll: async (): Promise<MenuItem[]> => {
      try {
        const uri = `/api/menu`;
        const data = await getData<MenuItem[]>(uri);
        if (!data) { return []; }
        return data;
      } catch (error) {
        console.error('Fetch menu error:', error);
        return [];
      }
    },


    getAllAdmin: () => {},

    // getAllAdmin: (): FoodItem[] => {
    //   const db = getDatabase();
    //   if (!db) return [];
    //   const result = db.exec(`SELECT * FROM food_items`);
    //   if (result.length > 0) {
    //     return result[0].values.map(row => ({
    //       id: row[0] as number,
    //       name: row[1] as string,
    //       description: row[2] as string,
    //       category: row[3] as string,
    //       price: row[4] as number,
    //       image_url: row[5] as string,
    //       available: row[6] as number,
    //       created_at: row[7] as string
    //     }));
    //   }
    //   return [];
    // },

    create: () => {},

    // create: (name: string, description: string, category: string, price: number, image_url: string): ApiResponse => {
    //   const db = getDatabase();
    //   if (!db) {
    //     return { success: false, message: 'Database not initialized' };
    //   }
    //   db.run(
    //     `INSERT INTO food_items (name, description, category, price, image_url)
    //      VALUES (?, ?, ?, ?, ?)`,
    //     [name, description, category, price, image_url]
    //   );
    //   saveDatabase();
    //   return { success: true };
    // },

    update: () => {},

    // update: (id: number, name: string, description: string, category: string, price: number, image_url: string, available: number): ApiResponse => {
    //   const db = getDatabase();
    //   if (!db) {
    //     return { success: false, message: 'Database not initialized' };
    //   }
    //   db.run(
    //     `UPDATE food_items 
    //      SET name = ?, description = ?, category = ?, price = ?, image_url = ?, available = ?
    //      WHERE id = ?`,
    //     [name, description, category, price, image_url, available, id]
    //   );
    //   saveDatabase();
    //   return { success: true };
    // },

    delete: () => {},

    // delete: (id: number): ApiResponse => {
    //   const db = getDatabase();
    //   if (!db) {
    //     return { success: false, message: 'Database not initialized' };
    //   }
    //   db.run(`DELETE FROM food_items WHERE id = ?`, [id]);
    //   saveDatabase();
    //   return { success: true };
    // }

  },

  reservations: {

    getAll: async (): Promise<Reservation[]> => {
      try {
        const uri = `/api/reservations`;
        const data = await getData<Reservation[]>(uri);
        if (!data) { return []; }
        return data;
      } catch (error) {
        console.error('Fetch reservations error:', error);
        return [];
      }
    },

    getByUser: async (userId: string): Promise<Reservation[]> => {
      try {
        const uri = `/api/reservations/user/${userId}`;
        const data = await getData<Reservation[]>(uri);
        if (!data) { return []; }
        return data;
      } catch (error) {
        console.error('Fetch reservations by user error:', error);
        return [];
      }
    },

    delete: async (id: string): Promise<void> => {
      try {
        const uri = `/api/reservations/${id}`;
        const deleted = await deleteData(uri);
        if (!deleted) { console.error('Delete reservation error: Does not exist'); }
      } catch (error) {
        console.error('Delete reservation error:', error);
      }
    },

    getPublic: () => {},

    create: async (data: Reservation): Promise<Reservation | null> => {
      try {
        const uri = `/api/reservations`;
        const reservation = await createData(uri, data);
        return reservation;
      } catch (error) {
        console.error('Delete reservation error:', error);
        return null;
      }
    },

    update: async (data: Reservation): Promise<Reservation | null> => {
      try {
        const uri = `/api/reservations/${data.id}`;
        const reservation = await updateData(uri, data);
        if (!reservation) return null;
        return reservation;
      } catch (error) {
        console.error('Update reservation error:', error);
        return null;
      }
    },

    updateStatus: () => {},

  },

  feedbacks: {

    getAll: async (): Promise<Feedback[]> => {
      try {
        const uri = `/api/feedbacks`;
        const data = await getData<Feedback[]>(uri);
        if (!data) { return []; }
        return data;
      } catch (error) {
        console.error('Fetch feedbacks error:', error);
        return [];
      }
    },

    create: async (data: Feedback): Promise<Feedback | null> => {
      try {
        const uri = `/api/feedbacks`;
        const feedback = await createData(uri, data);
        return feedback;
      } catch (error) {
        console.error('Create feedback error:', error);
        return null;
      }
    },

  },

  userRatings: {

    getAll: () => {},

    create: async (data: UserRating): Promise<UserRating | null> => {
      try {
        const uri = `/api/userRatings`;
        const userRating = await createData(uri, data);
        return userRating;
      } catch (error) {
        console.error('Create user rating error:', error);
        return null;
      }
    },

  }

  // feedbacks: {
  //   getAll: (): Feedback[] => {
  //     const db = getDatabase();
  //     if (!db) return [];
  //     const result = db.exec(`
  //       SELECT f.id, f.user_id, u.name, f.rating, f.comment, f.category, f.created_at
  //       FROM customer_feedbacks f
  //       JOIN users u ON f.user_id = u.id
  //       ORDER BY f.created_at DESC
  //     `);
  //     if (result.length > 0) {
  //       return result[0].values.map(row => ({
  //         id: row[0] as number,
  //         user_id: row[1] as number,
  //         user_name: row[2] as string,
  //         rating: row[3] as number,
  //         comment: row[4] as string,
  //         category: row[5] as string,
  //         created_at: row[6] as string
  //       }));
  //     }
  //     return [];
  //   },

  //   create: (userId: number, rating: number, comment: string, category: string): ApiResponse => {
  //     const db = getDatabase();
  //     if (!db) {
  //       return { success: false, message: 'Database not initialized' };
  //     }
  //     db.run(
  //       `INSERT INTO customer_feedbacks (user_id, rating, comment, category)
  //        VALUES (?, ?, ?, ?)`,
  //       [userId, rating, comment, category]
  //     );
  //     saveDatabase();
  //     return { success: true };
  //   }
  // },

  // availability: {
  //   get: (date: string, timeSlot: string): Availability | null => {
  //     const db = getDatabase();
  //     if (!db) return null;
  //     const result = db.exec(
  //       `SELECT * FROM availability WHERE date = ? AND time_slot = ?`,
  //       [date, timeSlot]
  //     );
  //     if (result.length > 0 && result[0].values.length > 0) {
  //       const row = result[0].values[0];
  //       return {
  //         id: row[0] as number,
  //         date: row[1] as string,
  //         time_slot: row[2] as string,
  //         max_tables: row[3] as number,
  //         max_customers: row[4] as number,
  //         blocked: row[5] as number,
  //         reason: row[6] as string
  //       };
  //     }
  //     return null;
  //   },

  //   set: (date: string, timeSlot: string, maxTables: number, maxCustomers: number, blocked: number = 0, reason: string = ''): ApiResponse => {
  //     const db = getDatabase();
  //     if (!db) {
  //       return { success: false, message: 'Database not initialized' };
  //     }
  //     const existing = api.availability.get(date, timeSlot);
      
  //     if (existing) {
  //       db.run(
  //         `UPDATE availability 
  //          SET max_tables = ?, max_customers = ?, blocked = ?, reason = ?
  //          WHERE date = ? AND time_slot = ?`,
  //         [maxTables, maxCustomers, blocked, reason, date, timeSlot]
  //       );
  //     } else {
  //       db.run(
  //         `INSERT INTO availability (date, time_slot, max_tables, max_customers, blocked, reason)
  //          VALUES (?, ?, ?, ?, ?, ?)`,
  //         [date, timeSlot, maxTables, maxCustomers, blocked, reason]
  //       );
  //     }
  //     saveDatabase();
  //     return { success: true };
  //   }
  // },

  // tableBlocks: {
  //   create: (date: string, timeSlot: string, tableNumber: number, reason: string): ApiResponse => {
  //     const db = getDatabase();
  //     if (!db) {
  //       return { success: false, message: 'Database not initialized' };
  //     }
  //     db.run(
  //       `INSERT INTO table_blocks (date, time_slot, table_number, reason)
  //        VALUES (?, ?, ?, ?)`,
  //       [date, timeSlot, tableNumber, reason]
  //     );
  //     saveDatabase();
  //     return { success: true };
  //   },

  //   getByDateTime: (date: string, timeSlot: string): TableBlock[] => {
  //     const db = getDatabase();
  //     if (!db) return [];
  //     const result = db.exec(
  //       `SELECT * FROM table_blocks WHERE date = ? AND time_slot = ? AND blocked = 1`,
  //       [date, timeSlot]
  //     );
  //     if (result.length > 0) {
  //       return result[0].values.map(row => ({
  //         id: row[0] as number,
  //         date: row[1] as string,
  //         time_slot: row[2] as string,
  //         table_number: row[3] as number,
  //         blocked: row[4] as number,
  //         reason: row[5] as string,
  //         created_at: row[6] as string
  //       }));
  //     }
  //     return [];
  //   },

  //   remove: (id: number): ApiResponse => {
  //     const db = getDatabase();
  //     if (!db) {
  //       return { success: false, message: 'Database not initialized' };
  //     }
  //     db.run(`DELETE FROM table_blocks WHERE id = ?`, [id]);
  //     saveDatabase();
  //     return { success: true };
  //   }
  // }
};
