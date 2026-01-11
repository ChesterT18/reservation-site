interface ResponseMap {
  [key: string]: string[];
}

interface ChatbotResponse {
  message: string;
  navigateTo?: string;
}

export class SimpleChatbot {
  private responses: ResponseMap;

  constructor() {
    this.responses = {
      greetings: [
        "Hello! Welcome to Shakey's Pizza! How can I help you today?",
        "Hi there! I'm here to assist you with your pizza needs!",
        "Welcome to Shakey's! What can I do for you?"
      ],
      menu: [
        "We have a variety of delicious pizzas including Pepperoni, Supreme, Margherita, BBQ Chicken, Hawaiian, and Veggie Delight. We also offer appetizers, salads, desserts, and beverages!",
        "Our menu features classic and specialty pizzas, wings, garlic bread, salads, and more! Would you like to know about a specific item?"
      ],
      hours: [
        "We're open Monday-Thursday 11am-10pm, Friday-Saturday 11am-11pm, and Sunday 12pm-9pm.",
        "Our operating hours are: Mon-Thu 11am-10pm, Fri-Sat 11am-11pm, Sun 12pm-9pm."
      ],
      reservation: [
        "You can make a reservation by going to our Reservation page. Just select your date, time, number of guests, and any food items you'd like to pre-order!",
        "To reserve a table, visit our Reservation page where you can choose your preferred date and time. We'll confirm your booking right away!"
      ],
      location: [
        "We're located at 123 Pizza Street, Food City, FC 12345. You can find us near the central plaza!",
        "Our address is 123 Pizza Street, Food City, FC 12345. We're easy to find!"
      ],
      contact: [
        "You can reach us at (555) 123-4567 or email us at info@shakeyspizza.com",
        "Contact us at (555) 123-4567 or info@shakeyspizza.com. We're happy to help!"
      ],
      price: [
        "Our pizzas range from $11.99 to $15.99 depending on the type. Check out our Menu page for detailed pricing!",
        "Pizza prices start at $11.99. Visit our Menu page to see all items and prices!"
      ],
      delivery: [
        "Currently, we offer dine-in and takeout services. You can make a reservation for dine-in through our website!",
        "We focus on providing the best dine-in experience. Make a reservation online to secure your table!"
      ],
      special: [
        "We offer birthday celebration packages! Just mention it in the notes when making your reservation.",
        "Planning a special event? Let us know in your reservation notes and we'll make it memorable!"
      ],
      default: [
        "I'm not sure about that, but I can help you with menu information, reservations, hours, or contact details. What would you like to know?",
        "That's a great question! For specific inquiries, please call us at (555) 123-4567 or check our website. How else can I assist you?"
      ]
    };
  }

  getResponse(message: string): ChatbotResponse {
    const lowerMessage = message.toLowerCase();
    
    if (this.matchesPattern(lowerMessage, ['hello', 'hi', 'hey', 'greetings'])) {
      return { message: this.randomResponse('greetings') };
    }
    
    if (this.matchesPattern(lowerMessage, ['menu', 'food', 'pizza', 'what do you have', 'what do you serve'])) {
      return { 
        message: this.randomResponse('menu'),
        navigateTo: '/menu'
      };
    }
    
    if (this.matchesPattern(lowerMessage, ['hours', 'open', 'close', 'when', 'time'])) {
      return { message: this.randomResponse('hours') };
    }
    
    if (this.matchesPattern(lowerMessage, ['reservation', 'reserve', 'book', 'table', 'order'])) {
      return { 
        message: this.randomResponse('reservation'),
        navigateTo: '/reservation'
      };
    }
    
    if (this.matchesPattern(lowerMessage, ['location', 'where', 'address', 'find you'])) {
      return { message: this.randomResponse('location') };
    }
    
    if (this.matchesPattern(lowerMessage, ['contact', 'phone', 'email', 'call', 'reach'])) {
      return { message: this.randomResponse('contact') };
    }
    
    if (this.matchesPattern(lowerMessage, ['price', 'cost', 'how much', 'expensive'])) {
      return { message: this.randomResponse('price') };
    }
    
    if (this.matchesPattern(lowerMessage, ['delivery', 'deliver', 'takeout', 'pickup'])) {
      return { message: this.randomResponse('delivery') };
    }
    
    if (this.matchesPattern(lowerMessage, ['birthday', 'celebration', 'party', 'event', 'special'])) {
      return { message: this.randomResponse('special') };
    }
    
    return { message: this.randomResponse('default') };
  }

  private matchesPattern(message: string, patterns: string[]): boolean {
    return patterns.some(pattern => message.includes(pattern));
  }

  private randomResponse(category: string): string {
    const responses = this.responses[category];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
