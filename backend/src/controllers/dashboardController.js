const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const Appointment = require('../models/Appointment');
const Delivery = require('../models/Delivery');
const asyncWrapper = require('../utils/asyncWrapper');

exports.getDashboard = asyncWrapper(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalClients,
    ordersInProgress,
    ordersLate,
    pendingDeliveries,
    upcomingAppointments,
    monthPayments,
    recentOrders,
  ] = await Promise.all([
    Client.countDocuments({ user: userId, isArchived: false }),

    Order.countDocuments({ user: userId, status: { $in: ['confirmed', 'in_progress', 'fitting', 'ready'] } }),

    Order.countDocuments({
      user: userId,
      status: { $nin: ['delivered', 'cancelled'] },
      estimatedDeliveryDate: { $lt: now },
    }),

    Delivery.countDocuments({ user: userId, status: 'pending' }),

    Appointment.find({
      user: userId,
      startAt: { $gte: now },
      status: 'scheduled',
    })
      .populate('client', 'firstName lastName')
      .sort({ startAt: 1 })
      .limit(5),

    Payment.aggregate([
      { $match: { user: userId, paidAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),

    Order.find({ user: userId })
      .populate('client', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const monthRevenue = monthPayments[0]?.total || 0;
  const monthPaymentCount = monthPayments[0]?.count || 0;

  res.json({
    success: true,
    data: {
      stats: {
        totalClients,
        ordersInProgress,
        ordersLate,
        pendingDeliveries,
        monthRevenue,
        monthPaymentCount,
      },
      upcomingAppointments,
      recentOrders,
    },
  });
});
