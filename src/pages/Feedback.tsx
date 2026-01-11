import React, { useState, useEffect } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import type { Feedback, MenuItem } from '../types';

interface SurveyQuestion {
  id: string;
  question: string;
  type: 'rating' | 'yesno' | 'text';
  value: string | number;
}

const Feedback: React.FC = () => {
  const { user } = useAuth();
  const [hoverRatings, setHoverRatings] = useState<{ [key: string]: number }>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedTopFoods, setSelectedTopFoods] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // load foods
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await api.foodItems.getAll();
        setMenuItems(items);
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
      }
    };
    fetchMenuItems();
  }, []);

  // initialize survey questions
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([
    { id: 'foodQualityRating', question: 'How would you rate the overall quality of the food you received?', type: 'rating', value: 0 },
    { id: 'foodQualityComment', question: 'Please share any thoughts about taste, freshness, portion size, or presentation. (optional)', type: 'text', value: '' },
    { id: 'serviceRating', question: 'How would you rate the service provided by our staff?', type: 'rating', value: 0 },
    { id: 'serviceComment', question: 'Please share any thoughts about attentiveness, friendliness, or speed of service. (optional)', type: 'text', value: '' },
    { id: 'ambienceRating', question: 'How would you rate the ambiance of our restaurant?', type: 'rating', value: 0 },
    { id: 'ambienceComment', question: 'Please share any thoughts about atmosphere, music, lighting, or seating comfort. (optional)', type: 'text', value: '' },
    { id: 'cleanlinessRating', question: 'How would you rate the cleanliness of our restaurant?', type: 'rating', value: 0 },
    { id: 'cleanlinessComment', question: 'Please share any thoughts about table cleanliness, restrooms, or overall hygiene. (optional)', type: 'text', value: '' },
    { id: 'valueForMoneyRating', question: 'How would you rate the value for money of your dining experience?', type: 'rating', value: 0 },
    { id: 'valueForMoneyComment', question: 'Please share any thoughts about pricing, portion size, or whether the experience felt worth the cost. (optional)', type: 'text', value: '' },
    { id: 'overallRating', question: 'How would you rate your overall experience at our restaurant?', type: 'rating', value: 0 },
    { id: 'generalFeedback', question: 'Please share any thoughts about your overall impression, highlights, or areas for improvement. (optional)', type: 'text', value: '' },
    { id: 'suggestion', question: 'Please share any additional suggestions or ideas to help us improve your dining experience. (optional)', type: 'text', value: '' },
    { id: 'recommend', question: 'Would you recommend us to your family and friends?', type: 'yesno', value: '' }
  ]);

  // update answers to survey questions
  const updateQuestionValue = (id: string, value: string | number) => {
    setSurveyQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, value } : q)
    );
  };

  // update selected foods
  const toggleFoodSelection = (foodId: string) => {
    setSelectedTopFoods(prev =>
      prev.includes(foodId)
        ? prev.filter(id => id !== foodId)
        : [...prev, foodId]
    );
  };

  const handleSubmitFeedback = async () => {
    if (!user) return;

    const dto: Feedback = {
      userId: user.id ? user.id : '',
      userName: user.firstName + ' ' + user.lastName,
      foodQualityRating: surveyQuestions[0].value as number,
      foodQualityComment: surveyQuestions[1].value as string,
      serviceRating: surveyQuestions[2].value as number,
      serviceComment: surveyQuestions[3].value as string,
      ambianceRating: surveyQuestions[4].value as number,
      ambianceComment: surveyQuestions[5].value as string,
      cleanlinessRating: surveyQuestions[6].value as number,
      cleanlinessComment: surveyQuestions[7].value as string,
      valueForMoneyRating: surveyQuestions[8].value as number,
      valueForMoneyComment: surveyQuestions[9].value as string,
      overallRating: surveyQuestions[10].value as number,
      generalFeedback: surveyQuestions[11].value as string,
      suggestion: surveyQuestions[12].value as string,
      recommend: surveyQuestions[13].value as any,
      favoriteFoodIds: selectedTopFoods.join(','),
    }
    
    await api.feedbacks.create(dto);

    // Reset survey questions to initial state
    setSurveyQuestions(prev => 
      prev.map(q => ({
        ...q,
        value: q.type === 'rating' ? 0 : ''
      }))
    );
    // Clear selected foods
    setSelectedTopFoods([]);
    // Show success message
    setSubmitted(true);
    // Hide success message after 3 seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <MessageSquare className="w-16 h-16 text-pizza-red mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-pizza-yellow mb-4">We Value Your Feedback</h1>
        </div>

        <div className="card">
          <p className="text-gray-400 mb-6">Help us improve by answering a few quick questions</p>
          <div className="space-y-6">
            {surveyQuestions.map(q => (
              <div key={q.id} className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-300 mb-3">{q.question}</p>
                {q.type === 'rating' && (
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(num => {
                      const currentRating = typeof q.value === 'number' ? q.value : 0;
                      const displayRating = hoverRatings[q.id] || currentRating;
                      const isFilled = num <= displayRating;
                      return (
                        <Star
                          key={num}
                          className={`w-8 h-8 cursor-pointer transition ${
                            isFilled ? 'fill-pizza-yellow text-pizza-yellow' : 'text-gray-600 hover:text-pizza-yellow'
                          }`}
                          onClick={() => updateQuestionValue(q.id, num)}
                          onMouseEnter={() => setHoverRatings(prev => ({ ...prev, [q.id]: num }))}
                          onMouseLeave={() => setHoverRatings(prev => ({ ...prev, [q.id]: 0 }))}
                        />
                      );
                    })}
                  </div>
                )}
                {q.type === 'yesno' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => updateQuestionValue(q.id, 'yes')}
                      className={`px-6 py-2 rounded-lg font-semibold transition ${
                        q.value === 'yes'
                          ? 'bg-pizza-yellow text-gray-900'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => updateQuestionValue(q.id, 'no')}
                      className={`px-6 py-2 rounded-lg font-semibold transition ${
                        q.value === 'no'
                          ? 'bg-pizza-yellow text-gray-900'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      No
                    </button>
                  </div>
                )}
                {q.type === 'text' && (
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Your answer..."
                    value={q.value as string}
                    onChange={(e) => updateQuestionValue(q.id, e.target.value)}
                  />
                )}
              </div>
            ))}
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-300 mb-3">What were your top foods? (Select all that apply)</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-h-30 overflow-y-auto">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleFoodSelection(item.id)}
                    className={`p-3 rounded-lg text-left transition ${
                      selectedTopFoods.includes(item.id)
                        ? 'bg-pizza-yellow text-gray-900 font-semibold'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium text-xs">{item.name}</div>
                    <div className="text-xs opacity-75">₱{item.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
              {selectedTopFoods.length > 0 && (
                <p className="text-sm text-pizza-yellow mt-3">
                  {selectedTopFoods.length} food{selectedTopFoods.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => { handleSubmitFeedback(); }}
                className="btn-primary flex items-center space-x-2 px-6 py-3 text-lg"
              >
                <Send className="w-5 h-5" />
                <span>Submit Feedback</span>
              </button>
            </div>
            {submitted && (
              <div className="mt-4 p-4 bg-green-900/50 border border-green-700 text-green-200 rounded-lg">
                Thank you for your feedback! Your responses have been submitted.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;