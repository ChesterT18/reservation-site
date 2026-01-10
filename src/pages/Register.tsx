import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pizza, Shield } from 'lucide-react';
import { api } from '../api/api';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin';
  securityQuestion: string;
  securityAnswer: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'customer',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.role === 'admin' && !formData.securityAnswer) {
      setError('Security question answer is required for admin accounts');
      return;
    }

    const result = await api.auth.register(
      // formData.email,
      // formData.password,
      // formData.name,
      // formData.phone,
      // formData.role,
      // formData.securityQuestion,
      // formData.securityAnswer
    );

    // if (result.success) {
    //   setSuccess(true);
    //   setTimeout(() => navigate('/login'), 2000);
    // } else {
    //   setError(result.message || 'Registration failed');
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Pizza className="w-16 h-16 text-pizza-red mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-pizza-yellow">Create Account</h2>
          <p className="text-gray-400 mt-2">Join Shakey's Pizza today</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded">
                Registration successful! Redirecting to login...
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="border-t border-gray-800 pt-4">
              <label className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  checked={formData.role === 'admin'}
                  onChange={(e) => setFormData({
                    ...formData,
                    role: e.target.checked ? 'admin' : 'customer'
                  })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300 flex items-center">
                  <Shield className="w-4 h-4 mr-1 text-pizza-red" />
                  Register as Admin (requires security verification)
                </span>
              </label>

              {formData.role === 'admin' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Security Question
                    </label>
                    <select
                      name="securityQuestion"
                      value={formData.securityQuestion}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select a question</option>
                      <option value="What is your favorite pizza?">What is your favorite pizza?</option>
                      <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                      <option value="What city were you born in?">What city were you born in?</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Security Answer
                    </label>
                    <input
                      type="text"
                      name="securityAnswer"
                      value={formData.securityAnswer}
                      onChange={handleChange}
                      className="input-field"
                      required={formData.role === 'admin'}
                    />
                  </div>
                </>
              )}
            </div>

            <button type="submit" className="w-full btn-primary">
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-pizza-yellow hover:text-pizza-gold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
