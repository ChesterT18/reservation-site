import { Client } from '@botpress/client';

interface ChatbotResponse {
  message: string;
  navigateTo?: string;
  confidence?: number;
  suggestions?: string[];
}

interface ConversationContext {
  userId: string;
  conversationId?: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface NavigationIntent {
  intent: string;
  path: string;
  keywords: string[];
  priority: number;
}

export class BotpressChatbot {
  private client: Client;
  private contexts: Map<string, ConversationContext>;
  private navigationMap: NavigationIntent[];

  constructor(apiKey?: string) {
    const token = apiKey || process.env.VITE_BOTPRESS_API_KEY || '';
    this.client = new Client({
      token: token,
    });
    this.contexts = new Map();
    this.navigationMap = this.initializeNavigationMap();
  }

  private initializeNavigationMap(): NavigationIntent[] {
    return [
      {
        intent: 'view_menu',
        path: '/menu',
        keywords: ['menu', 'food', 'pizza', 'pizzas', 'items', 'dishes', 'what do you have', 'what do you serve', 'options', 'choices', 'pepperoni', 'supreme', 'margherita', 'hawaiian', 'bbq', 'veggie', 'appetizers', 'desserts', 'beverages', 'drinks'],
        priority: 10
      },
      {
        intent: 'make_reservation',
        path: '/reservation',
        keywords: ['reservation', 'reserve', 'book', 'booking', 'table', 'seat', 'order', 'pre-order', 'schedule', 'appointment', 'dine in', 'dine-in'],
        priority: 10
      },
      {
        intent: 'view_home',
        path: '/',
        keywords: ['home', 'main page', 'homepage', 'start', 'beginning', 'back to main'],
        priority: 5
      },
      {
        intent: 'view_about',
        path: '/about',
        keywords: ['about', 'about us', 'who are you', 'company', 'story', 'history', 'information'],
        priority: 7
      },
      {
        intent: 'view_contact',
        path: '/contact',
        keywords: ['contact', 'reach', 'get in touch', 'contact us', 'phone', 'email', 'address', 'location', 'where are you', 'find you'],
        priority: 8
      },
      {
        intent: 'view_gallery',
        path: '/gallery',
        keywords: ['gallery', 'photos', 'pictures', 'images', 'see', 'look', 'view pictures'],
        priority: 6
      }
    ];
  }

  private analyzeNavigationIntent(message: string): NavigationIntent | null {
    const lowerMessage = message.toLowerCase();
    let bestMatch: NavigationIntent | null = null;
    let highestScore = 0;

    for (const nav of this.navigationMap) {
      let score = 0;
      for (const keyword of nav.keywords) {
        if (lowerMessage.includes(keyword)) {
          score += nav.priority;
          if (lowerMessage.startsWith(keyword) || lowerMessage.endsWith(keyword)) {
            score += 2;
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = nav;
      }
    }

    return highestScore > 0 ? bestMatch : null;
  }

  private generateContextualSuggestions(message: string): string[] {
    const lowerMessage = message.toLowerCase();
    const suggestions: string[] = [];

    if (lowerMessage.includes('menu') || lowerMessage.includes('food') || lowerMessage.includes('pizza')) {
      suggestions.push('Show me the menu', 'What pizzas do you have?', 'Make a reservation');
    } else if (lowerMessage.includes('reservation') || lowerMessage.includes('book')) {
      suggestions.push('Book a table now', 'What are your hours?', 'View menu');
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      suggestions.push('Show me the menu', 'Make a reservation', 'Any special offers?');
    } else if (lowerMessage.includes('location') || lowerMessage.includes('where')) {
      suggestions.push('Get directions', 'Contact information', 'Make a reservation');
    } else {
      suggestions.push('View menu', 'Make a reservation', 'Contact us');
    }

    return suggestions.slice(0, 3);
  }

  private getOrCreateContext(userId: string): ConversationContext {
    if (!this.contexts.has(userId)) {
      this.contexts.set(userId, {
        userId,
        history: []
      });
    }
    return this.contexts.get(userId)!;
  }

  async sendMessage(userId: string, message: string): Promise<ChatbotResponse> {
    try {
      const context = this.getOrCreateContext(userId);
      
      context.history.push({
        role: 'user',
        content: message
      });

      const navigationIntent = this.analyzeNavigationIntent(message);

      let conversationId = context.conversationId;
      if (!conversationId) {
        const conversation = await this.client.createConversation({
          integrationName: 'webchat',
          channel: 'web',
          tags: {
            userId: userId
          }
        });
        conversationId = conversation.conversation.id;
        context.conversationId = conversationId;
      }

      await this.client.createMessage({
        conversationId: conversationId,
        type: 'text',
        payload: {
          text: message
        },
        userId: userId,
        tags: {
          timestamp: new Date().toISOString()
        }
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const messages = await this.client.listMessages({
        conversationId: conversationId
      });

      const botMessages = messages.messages
        .filter(msg => msg.direction === 'outgoing' && msg.payload.type === 'text')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      let botResponse = botMessages.length > 0 
        ? (botMessages[0].payload as any).text 
        : this.getFallbackResponse(message);

      context.history.push({
        role: 'assistant',
        content: botResponse
      });

      const suggestions = this.generateContextualSuggestions(message);

      const response: ChatbotResponse = {
        message: botResponse,
        suggestions: suggestions,
        confidence: navigationIntent ? 0.9 : 0.5
      };

      if (navigationIntent) {
        response.navigateTo = navigationIntent.path;
        response.message += `\n\nWould you like me to take you to the ${navigationIntent.intent.replace('view_', '').replace('make_', '').replace(/_/g, ' ')} page?`;
      }

      return response;

    } catch (error) {
      console.error('Botpress API Error:', error);
      return this.handleFallback(message);
    }
  }

  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! Welcome to Shakey's Pizza! I'm your AI assistant. I can help you explore our menu, make reservations, find our location, and answer any questions you have. How can I assist you today?";
    }

    if (lowerMessage.includes('menu') || lowerMessage.includes('food') || lowerMessage.includes('pizza')) {
      return "We have an amazing selection of pizzas including Pepperoni, Supreme, Margherita, BBQ Chicken, Hawaiian, and Veggie Delight! We also offer appetizers, salads, desserts, and beverages. Would you like to see our full menu?";
    }

    if (lowerMessage.includes('reservation') || lowerMessage.includes('book') || lowerMessage.includes('table')) {
      return "I can help you make a reservation! You can select your preferred date, time, number of guests, and even pre-order food items. Would you like to go to our reservation page?";
    }

    if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
      return "We're open Monday-Thursday 11am-10pm, Friday-Saturday 11am-11pm, and Sunday 12pm-9pm. Would you like to make a reservation?";
    }

    if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address')) {
      return "We're located at 123 Pizza Street, Food City, FC 12345. You can find us near the central plaza! Would you like directions or contact information?";
    }

    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      return "You can reach us at (555) 123-4567 or email us at info@shakeyspizza.com. We're always happy to help!";
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return "Our pizzas range from $11.99 to $15.99 depending on the type. We also have great deals on appetizers and combo meals. Would you like to see our full menu with prices?";
    }

    if (lowerMessage.includes('delivery') || lowerMessage.includes('takeout') || lowerMessage.includes('pickup')) {
      return "We currently offer dine-in and takeout services. You can make a reservation for dine-in through our website to ensure you get a table at your preferred time!";
    }

    if (lowerMessage.includes('birthday') || lowerMessage.includes('party') || lowerMessage.includes('celebration') || lowerMessage.includes('event')) {
      return "We love hosting special events and birthday celebrations! Just mention it in the notes when making your reservation, and we'll make sure your celebration is memorable!";
    }

    return "I'm here to help you with information about our menu, reservations, hours, location, and more! What would you like to know about Shakey's Pizza?";
  }

  private handleFallback(message: string): ChatbotResponse {
    const navigationIntent = this.analyzeNavigationIntent(message);
    const fallbackMessage = this.getFallbackResponse(message);
    const suggestions = this.generateContextualSuggestions(message);

    const response: ChatbotResponse = {
      message: fallbackMessage,
      suggestions: suggestions,
      confidence: 0.7
    };

    if (navigationIntent) {
      response.navigateTo = navigationIntent.path;
      response.message += `\n\nI can take you to the ${navigationIntent.intent.replace('view_', '').replace('make_', '').replace(/_/g, ' ')} page if you'd like!`;
    }

    return response;
  }

  async resetConversation(userId: string): Promise<void> {
    this.contexts.delete(userId);
  }

  async getConversationHistory(userId: string): Promise<Array<{ role: string; content: string }>> {
    const context = this.contexts.get(userId);
    return context ? context.history : [];
  }

  clearAllContexts(): void {
    this.contexts.clear();
  }
}

export class SmartChatbotManager {
  private botpressChatbot: BotpressChatbot | null = null;
  private fallbackMode: boolean = false;

  constructor(apiKey?: string) {
    if (apiKey || process.env.VITE_BOTPRESS_API_KEY) {
      try {
        this.botpressChatbot = new BotpressChatbot(apiKey);
      } catch (error) {
        console.warn('Botpress initialization failed, using fallback mode:', error);
        this.fallbackMode = true;
      }
    } else {
      console.warn('No Botpress API Key provided, using fallback mode');
      this.fallbackMode = true;
    }
  }

  async sendMessage(userId: string, message: string): Promise<ChatbotResponse> {
    if (this.botpressChatbot && !this.fallbackMode) {
      try {
        return await this.botpressChatbot.sendMessage(userId, message);
      } catch (error) {
        console.error('Botpress error, switching to fallback:', error);
        this.fallbackMode = true;
      }
    }

    return this.getFallbackResponse(message);
  }

  private getFallbackResponse(message: string): ChatbotResponse {
    const lowerMessage = message.toLowerCase();
    let response: ChatbotResponse = {
      message: '',
      suggestions: []
    };

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response.message = "Hello! Welcome to Shakey's Pizza! I'm your AI assistant. How can I help you today?";
      response.suggestions = ['View menu', 'Make a reservation', 'Contact us'];
    } else if (lowerMessage.includes('menu') || lowerMessage.includes('food') || lowerMessage.includes('pizza')) {
      response.message = "We have delicious pizzas including Pepperoni, Supreme, Margherita, BBQ Chicken, Hawaiian, and Veggie Delight! Plus appetizers, salads, and desserts.";
      response.navigateTo = '/menu';
      response.suggestions = ['Show me the menu', 'Make a reservation', 'What are the prices?'];
    } else if (lowerMessage.includes('reservation') || lowerMessage.includes('book') || lowerMessage.includes('table')) {
      response.message = "I can help you make a reservation! Select your date, time, and number of guests.";
      response.navigateTo = '/reservation';
      response.suggestions = ['Book now', 'View menu', 'What are your hours?'];
    } else if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
      response.message = "We're open Mon-Thu 11am-10pm, Fri-Sat 11am-11pm, Sun 12pm-9pm.";
      response.suggestions = ['Make a reservation', 'View menu', 'Get directions'];
    } else if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address')) {
      response.message = "We're at 123 Pizza Street, Food City, FC 12345, near the central plaza!";
      response.navigateTo = '/contact';
      response.suggestions = ['Contact us', 'Make a reservation', 'View menu'];
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      response.message = "Reach us at (555) 123-4567 or info@shakeyspizza.com";
      response.navigateTo = '/contact';
      response.suggestions = ['Make a reservation', 'View menu', 'Get directions'];
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      response.message = "Pizzas range from $11.99 to $15.99. Check our menu for detailed pricing!";
      response.navigateTo = '/menu';
      response.suggestions = ['View menu', 'Make a reservation', 'Any specials?'];
    } else {
      response.message = "I can help with menu info, reservations, hours, location, and more! What would you like to know?";
      response.suggestions = ['View menu', 'Make a reservation', 'Contact us'];
    }

    return response;
  }

  async resetConversation(userId: string): Promise<void> {
    if (this.botpressChatbot) {
      await this.botpressChatbot.resetConversation(userId);
    }
  }

  async getHistory(userId: string): Promise<Array<{ role: string; content: string }>> {
    if (this.botpressChatbot) {
      return await this.botpressChatbot.getConversationHistory(userId);
    }
    return [];
  }
}

export default SmartChatbotManager;
