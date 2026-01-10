// import initSqlJs, { Database } from 'sql.js';

// let db: Database | null = null;

// export const initDatabase = async (): Promise<Database> => {
//   const SQL = await initSqlJs({
//     locateFile: file => `https://sql.js.org/dist/${file}`
//   });

//   db = new SQL.Database();

//   db.run(`
//     CREATE TABLE IF NOT EXISTS users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       email TEXT UNIQUE NOT NULL,
//       password TEXT NOT NULL,
//       name TEXT NOT NULL,
//       phone TEXT,
//       role TEXT DEFAULT 'customer',
//       security_question TEXT,
//       security_answer TEXT,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     );
//   `);

//   db.run(`
//     CREATE TABLE IF NOT EXISTS food_items (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT NOT NULL,
//       description TEXT,
//       category TEXT,
//       price REAL NOT NULL,
//       image_url TEXT,
//       available INTEGER DEFAULT 1,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     );
//   `);

//   db.run(`
//     CREATE TABLE IF NOT EXISTS reservations (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       user_id INTEGER NOT NULL,
//       reservation_date TEXT NOT NULL,
//       reservation_time TEXT NOT NULL,
//       num_people INTEGER NOT NULL,
//       food_items TEXT,
//       notes TEXT,
//       status TEXT DEFAULT 'pending',
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY (user_id) REFERENCES users(id)
//     );
//   `);

//   db.run(`
//     CREATE TABLE IF NOT EXISTS customer_feedbacks (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       user_id INTEGER NOT NULL,
//       rating INTEGER NOT NULL,
//       comment TEXT,
//       category TEXT,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY (user_id) REFERENCES users(id)
//     );
//   `);

//   db.run(`
//     CREATE TABLE IF NOT EXISTS availability (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       date TEXT NOT NULL,
//       time_slot TEXT NOT NULL,
//       max_tables INTEGER DEFAULT 10,
//       max_customers INTEGER DEFAULT 40,
//       blocked INTEGER DEFAULT 0,
//       reason TEXT,
//       UNIQUE(date, time_slot)
//     );
//   `);

//   db.run(`
//     CREATE TABLE IF NOT EXISTS table_blocks (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       date TEXT NOT NULL,
//       time_slot TEXT NOT NULL,
//       table_number INTEGER NOT NULL,
//       blocked INTEGER DEFAULT 1,
//       reason TEXT,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     );
//   `);

//   const adminExists = db.exec("SELECT * FROM users WHERE role = 'admin'");
//   if (adminExists.length === 0) {
//     db.run(`
//       INSERT INTO users (email, password, name, role, security_question, security_answer)
//       VALUES ('admin@shakeys.com', 'admin123', 'Admin User', 'admin', 'What is your favorite pizza?', 'pepperoni');
//     `);
//   }

//   const menuItems = [
//     { name: 'Classic Pepperoni Pizza', description: 'Traditional pepperoni with mozzarella cheese', category: 'Pizza', price: 12.99, image_url: '/images/pepperoni.jpg' },
//     { name: 'Supreme Pizza', description: 'Loaded with pepperoni, sausage, peppers, and onions', category: 'Pizza', price: 15.99, image_url: '/images/supreme.jpg' },
//     { name: 'Margherita Pizza', description: 'Fresh tomatoes, basil, and mozzarella', category: 'Pizza', price: 11.99, image_url: '/images/margherita.jpg' },
//     { name: 'BBQ Chicken Pizza', description: 'Grilled chicken with BBQ sauce and red onions', category: 'Pizza', price: 14.99, image_url: '/images/bbq-chicken.jpg' },
//     { name: 'Hawaiian Pizza', description: 'Ham and pineapple with mozzarella', category: 'Pizza', price: 13.99, image_url: '/images/hawaiian.jpg' },
//     { name: 'Veggie Delight Pizza', description: 'Fresh vegetables with cheese', category: 'Pizza', price: 12.99, image_url: '/images/veggie.jpg' },
//     { name: 'Chicken Wings', description: 'Crispy chicken wings with your choice of sauce', category: 'Appetizers', price: 8.99, image_url: '/images/wings.jpg' },
//     { name: 'Garlic Bread', description: 'Toasted bread with garlic butter', category: 'Appetizers', price: 5.99, image_url: '/images/garlic-bread.jpg' },
//     { name: 'Caesar Salad', description: 'Fresh romaine with Caesar dressing', category: 'Salads', price: 7.99, image_url: '/images/caesar.jpg' },
//     { name: 'Chocolate Brownie', description: 'Warm chocolate brownie with ice cream', category: 'Desserts', price: 6.99, image_url: '/images/brownie.jpg' },
//     { name: 'Soft Drinks', description: 'Coca-Cola, Sprite, or Fanta', category: 'Beverages', price: 2.99, image_url: '/images/soda.jpg' },
//     { name: 'Iced Tea', description: 'Freshly brewed iced tea', category: 'Beverages', price: 2.49, image_url: '/images/iced-tea.jpg' }
//   ];

//   const existingItems = db.exec("SELECT COUNT(*) as count FROM food_items");
//   if (existingItems[0].values[0][0] === 0) {
//     menuItems.forEach(item => {
//       db.run(`
//         INSERT INTO food_items (name, description, category, price, image_url)
//         VALUES (?, ?, ?, ?, ?)
//       `, [item.name, item.description, item.category, item.price, item.image_url]);
//     });
//   }

//   return db;
// };

// export const getDatabase = (): Database | null => {
//   return db;
// };

// export const saveDatabase = (): void => {
//   if (db) {
//     const data = db.export();
//     localStorage.setItem('shakeys_db', JSON.stringify(Array.from(data)));
//   }
// };

// export const loadDatabase = async (): Promise<Database> => {
//   const savedData = localStorage.getItem('shakeys_db');
//   if (savedData) {
//     const SQL = await initSqlJs({
//       locateFile: file => `https://sql.js.org/dist/${file}`
//     });
//     const data = new Uint8Array(JSON.parse(savedData));
//     db = new SQL.Database(data);
//     return db;
//   }
//   return initDatabase();
// };
