import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Reviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [starCount, setStarCount] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/reviews/${productId}`);
        setReviews(response.data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        toast.error('Failed to load reviews. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  // Handle review submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (starCount === 0) {
      toast.error('Please provide a rating');
      return;
    }
    
    if (!title.trim() || !description.trim()) {
      toast.error('Please provide a title and review text');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get the token from localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.accessToken;
      
      console.log('User info from localStorage:', userInfo); // Debug log
      console.log('Token being used:', token); // Debug log
      
      if (!token) {
        toast.error('You need to be logged in to submit a review');
        return;
      }

      // Make sure the token is properly formatted
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const response = await axios.post(
        '/api/reviews',
        {
          productId,
          title: title.trim(),
          description: description.trim(),
          starCount,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
          }
        }
      );
      
      setReviews([response.data, ...reviews]);
      setTitle('');
      setDescription('');
      setStarCount(0);
      toast.success('Thank you for your review!');
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.config?.headers
      });
      
      if (err.response?.status === 401) {
        // If unauthorized, clear the token and reload to force login
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
        toast.error('Your session has expired. Please log in again.');
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to submit review. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Customer Reviews ({reviews.length})
      </h2>

      {/* Review List */}
      {reviews.length === 0 ? (
        <p className="text-gray-600 mb-6">
          No reviews yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-6 mb-8">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.starCount ? "text-yellow-400" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.375 2.45a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.538 1.118l-3.375-2.45a1 1 0 00-1.175 0l-3.375 2.45c-.783.57-1.838-.197-1.538-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.05 9.397c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69l1.286-3.97z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{review.title}</h3>
              <p className="text-gray-700 mb-2">{review.description}</p>
              {review.user && (
                <p className="text-sm text-gray-500">
                  {review.user.name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Form */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Write a Review
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`w-8 h-8 focus:outline-none ${
                    i < (hoverRating || starCount)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  } transition-colors duration-200`}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setStarCount(i + 1)}
                >
                  <svg
                    className="w-full h-full"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.174c.969 0 1.371 1.24.588 1.81l-3.375 2.45a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.538 1.118l-3.375-2.45a1 1 0 00-1.175 0l-3.375 2.45c-.783.57-1.838-.197-1.538-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.05 9.397c-.783-.57-.38-1.81.588-1.81h4.174a1 1 0 00.95-.69l1.286-3.97z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a title for your review"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Review
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
              placeholder="Share your experience with this product"
              maxLength={1000}
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } transition-colors duration-200`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Reviews;
