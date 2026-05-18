const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@realfarms.in',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const getPublicKey = (req, res) => {
  res.status(200).json({ success: true, publicKey: process.env.VAPID_PUBLIC_KEY });
};

const subscribe = async (req, res) => {
  try {
    const subscription = req.body;
    // Basic validation
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, error: 'Invalid subscription' });
    }

    // Check if it already exists to prevent duplicates
    const existing = await PushSubscription.findOne({ where: { endpoint: subscription.endpoint } });
    if (!existing) {
      await PushSubscription.create({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userId: req.user ? req.user.id : null // If logged in, associate with user
      });
    }

    res.status(201).json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ success: false, error: 'Failed to subscribe' });
  }
};

const sendNotification = async (req, res) => {
  try {
    const { title, body, url, image } = req.body;
    const payload = JSON.stringify({ title, body, url, image });

    const subscriptions = await PushSubscription.findAll();

    const notifications = subscriptions.map(sub => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: sub.keys
      };
      return webpush.sendNotification(pushSub, payload).catch(err => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or is no longer valid
          return PushSubscription.destroy({ where: { endpoint: sub.endpoint } });
        }
        console.error('Error sending notification, reason: ', err);
      });
    });

    await Promise.all(notifications);
    res.status(200).json({ success: true, message: 'Notifications sent successfully' });
  } catch (err) {
    console.error('Send notification error:', err);
    res.status(500).json({ success: false, error: 'Failed to send notifications' });
  }
};

module.exports = { getPublicKey, subscribe, sendNotification };
