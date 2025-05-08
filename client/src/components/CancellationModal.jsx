import React, { useState } from 'react';
import { toast } from 'react-toastify';

const CancellationModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  
  if (!isOpen) return null;
  
  const handleSubmit = () => {
    if (!reason) {
      toast.error('Please select a reason for cancellation');
      return;
    }
    
    const finalReason = reason === 'Other' ? `Other: ${otherReason}` : reason;
    onConfirm(finalReason);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Cancel Order</h2>
        <p className="text-gray-600 mb-4">Please provide a reason for cancellation:</p>
        
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        >
          <option value="">Select a reason</option>
          <option value="Changed my mind">Changed my mind</option>
          <option value="Found a better price elsewhere">Found a better price elsewhere</option>
          <option value="Ordered by mistake">Ordered by mistake</option>
          <option value="Shipping takes too long">Shipping takes too long</option>
          <option value="Other">Other</option>
        </select>
        
        {reason === 'Other' && (
          <textarea
            placeholder="Please specify your reason"
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
            rows="3"
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
          ></textarea>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;
