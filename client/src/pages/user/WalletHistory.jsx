import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from '../../features/userProfile/userProfileSlice';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaArrowLeft, FaWallet, FaArrowUp, FaArrowDown, FaFilter, FaSearch } from 'react-icons/fa';

const WalletHistory = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.userProfile || {});
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user?.walletHistory) {
      setTransactions(user.walletHistory);
      setFilteredTransactions(user.walletHistory);
    }
  }, [user]);

  useEffect(() => {
    let result = [...transactions];
    
    // Apply type filter
    if (filter !== 'all') {
      result = result.filter(transaction => transaction.type === filter);
    }
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    result = result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredTransactions(result);
  }, [filter, searchTerm, sortOrder, transactions]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort) => {
    setSortOrder(newSort);
  };

  const getTransactionIcon = (type) => {
    return type === 'credit' ? 
      <div className="bg-green-100 p-2 rounded-full">
        <FaArrowUp className="text-green-600" />
      </div> : 
      <div className="bg-red-100 p-2 rounded-full">
        <FaArrowDown className="text-red-600" />
      </div>;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link to="/profile" className="mr-4">
          <FaArrowLeft className="text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Wallet Transaction History</h1>
      </div>
      
      {/* Wallet Balance Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="bg-black p-3 rounded-full mr-4">
              <FaWallet className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-700">Current Balance</h2>
              <p className="text-gray-500 text-sm">Available for purchases and refunds</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            ₹{user?.walletBalance ? user.walletBalance.toFixed(2) : '0.00'}
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <FaFilter className="text-gray-500 mr-2" />
            <span className="text-gray-700 mr-2">Filter:</span>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              <button 
                onClick={() => handleFilterChange('credit')}
                className={`px-3 py-1 rounded-full text-sm ${filter === 'credit' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Credits
              </button>
              <button 
                onClick={() => handleFilterChange('debit')}
                className={`px-3 py-1 rounded-full text-sm ${filter === 'debit' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Debits
              </button>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <select 
              value={sortOrder}
              onChange={(e) => handleSortChange(e.target.value)}
              className="ml-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            <p className="mt-2 text-gray-600">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getTransactionIcon(transaction.type)}
                    <div className="ml-4">
                      <p className="font-medium text-gray-800">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.date ? format(new Date(transaction.date), 'MMM dd, yyyy • h:mm a') : 'Unknown date'}
                      </p>
                      {transaction.orderId && (
                        <Link to={`/orders/${transaction.orderId}`} className="text-sm text-blue-600 hover:underline">
                          View Order
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="bg-gray-100 inline-flex p-4 rounded-full mb-4">
              <FaWallet className="text-gray-500 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No transactions found</h3>
            <p className="text-gray-500">
              {filter !== 'all' || searchTerm 
                ? 'Try changing your filters or search term' 
                : 'Your wallet transactions will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletHistory;
