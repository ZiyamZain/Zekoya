import Wallet from '../models/walletModel.js';
import User from '../models/userModel.js';

export const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });

    // if wallet doesn't exist , create one

    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: 0,
        transactions: [],
      });
    }
    res.status(200).json(wallet);
  } catch (error) {
    console.error('Error fetching wallet: ', error);
    res.status(500).json({ message: 'Failed to fetch wallet' });
  }
};

export const addFunds = async (req, res) => {
  try {
    const { amount, description, orderId } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    let wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
        balance: 0,
        transactions: [],
      });
    }
    wallet.transactions.push({
      amount,
      type: 'credit',
      description: description || 'Funds added',
      orderId,
      createdAt: new Date(),
    });

    wallet.balance += amount;

    await wallet.save();

    res.status(200).json({
      message: 'Funds added Succesfully',
      wallet,
    });
  } catch (error) {
    console.error('Error adding funds: ', error);
    res.status(500).json({ message: 'Failed to add Funds' });
  }
};

export const processRefund = async (req, res) => {
  try {
    const {
      userId, amount, description,
    } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'invalid refund amount' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }
    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = await wallet.create({
        user: userId,
        balance: 0,
        transactions: [],
      });
    }
    wallet.transactions.push({
      amount,
      type: 'credit',
      description: description || 'Refund processed',
      createdAt: new Date(),
    });
    wallet.balance += amount;

    await wallet.save();
    res.status(200).json({
      message: 'Refund processed succesfully',
      wallet,
    });
  } catch (error) {
    console.error('Error processign refund : ', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
};

// use wallet balance for payment (deduct funds)

export const useWalletBalance = async (req, res) => {
  try {
    const { amount, description, orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'invalid amount' });
    }
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: 'insufficient wallet balance' });
    }

    wallet.transactions.push({
      amount,
      type: 'debit',
      description: description || 'Payment',
      orderId,
      createdAt: new Date(),
    });
    wallet.balance -= amount;

    await wallet.save();

    res.status(200).json({
      message: 'Payment successful',
      wallet,
    });
  } catch (error) {
    console.error('Error processing payment: ', error);
    res.status(500).json({ message: 'Failed to process payment' });
  }
};
