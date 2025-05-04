import User from "../models/userModel.js";


export const getAllUsers = async (req, res) => {
    try {
        
        // Check if admin is authenticated
        if (!req.admin) {
            return res.status(401).json({ message: 'Unauthorized: Admin authentication required' });
        }

        const { page = 1, limit = 10, search = "" } = req.query;
        
 
        const searchQuery = search
          ? {
              $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
              ],
            }
          : {};


    
        // Fetch users with detailed logging
        const users = await User.find(searchQuery)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .select('-password'); // Exclude password field

      
        // Count total documents
        const total = await User.countDocuments(searchQuery);


        res.json({ 
            users, 
            total, 
            page: parseInt(page), 
            limit: parseInt(limit) 
        });
    } catch (err) {
        console.error('[ERROR] Get All Users Failed:', {
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({ 
            message: 'Failed to retrieve users', 
            error: err.message 
        });
    }
};


export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const blockUser = async (req, res) => {
  try {
    // Check if admin is authenticated
    if (!req.admin) {
      return res.status(401).json({ message: 'Unauthorized: Admin authentication required' });
    }
    // Optionally: Prevent blocking self (if required)
    // if (req.admin === req.params.id) {
    //   return res.status(400).json({ message: "Admin cannot block themselves" });
    // }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true ,select: "-password " }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('[ERROR] Block User Failed:', err);
    res.status(500).json({ message: err.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    // Check if admin is authenticated
    if (!req.admin) {
      return res.status(401).json({ message: 'Unauthorized: Admin authentication required' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true, select: "-password" }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('[ERROR] Unblock User Failed:', err);
    res.status(500).json({ message: err.message });
  }
};
