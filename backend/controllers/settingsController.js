const { Settings } = require('../models');

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findByPk(1);
    if (!settings) {
      settings = await Settings.create({ id: 1 });
    }
    const data = settings.toJSON();
    // Don't expose Razorpay secret to non-admins
    if (req.user?.role !== 'admin') {
      delete data.razorpayKeySecret;
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const {
      freeDeliveryThreshold, standardDeliveryFee,
      smallCartFeeThreshold, smallCartFeeAmount,
      lowOrderFeeThreshold, lowOrderFeeAmount,
      packagingFee,
      qwikDeliveryFee, qwikDeliveryCutoffHour,
      nightModeStartHour, nightModeEndHour,
      razorpayKeyId, razorpayKeySecret,
      storeLatitude, storeLongitude,
      vegetableMorningSlotStart, vegetableMorningSlotEnd,
      vegetableEveningSlotStart, vegetableEveningSlotEnd,
      vegetableSlotsEnabled,
      agentPayPerKm, agentMinPayPerOrder,
      agentIncentiveThreshold, agentIncentiveAmount,
    } = req.body;

    let settings = await Settings.findByPk(1);
    if (!settings) {
      settings = await Settings.create({ id: 1 });
    }

    const update = {};
    if (freeDeliveryThreshold !== undefined) update.freeDeliveryThreshold = freeDeliveryThreshold;
    if (standardDeliveryFee !== undefined) update.standardDeliveryFee = standardDeliveryFee;
    if (smallCartFeeThreshold !== undefined) update.smallCartFeeThreshold = smallCartFeeThreshold;
    if (smallCartFeeAmount !== undefined) update.smallCartFeeAmount = smallCartFeeAmount;
    if (lowOrderFeeThreshold !== undefined) update.lowOrderFeeThreshold = lowOrderFeeThreshold;
    if (lowOrderFeeAmount !== undefined) update.lowOrderFeeAmount = lowOrderFeeAmount;
    if (packagingFee !== undefined) update.packagingFee = packagingFee;
    if (qwikDeliveryFee !== undefined) update.qwikDeliveryFee = qwikDeliveryFee;
    if (qwikDeliveryCutoffHour !== undefined) update.qwikDeliveryCutoffHour = qwikDeliveryCutoffHour;
    if (nightModeStartHour !== undefined) update.nightModeStartHour = nightModeStartHour;
    if (nightModeEndHour !== undefined) update.nightModeEndHour = nightModeEndHour;
    if (razorpayKeyId !== undefined) update.razorpayKeyId = razorpayKeyId;
    if (razorpayKeySecret !== undefined) update.razorpayKeySecret = razorpayKeySecret;
    if (storeLatitude !== undefined) update.storeLatitude = storeLatitude;
    if (storeLongitude !== undefined) update.storeLongitude = storeLongitude;
    if (vegetableMorningSlotStart !== undefined) update.vegetableMorningSlotStart = vegetableMorningSlotStart;
    if (vegetableMorningSlotEnd !== undefined) update.vegetableMorningSlotEnd = vegetableMorningSlotEnd;
    if (vegetableEveningSlotStart !== undefined) update.vegetableEveningSlotStart = vegetableEveningSlotStart;
    if (vegetableEveningSlotEnd !== undefined) update.vegetableEveningSlotEnd = vegetableEveningSlotEnd;
    if (vegetableSlotsEnabled !== undefined) update.vegetableSlotsEnabled = vegetableSlotsEnabled;
    if (agentPayPerKm !== undefined) update.agentPayPerKm = agentPayPerKm;
    if (agentMinPayPerOrder !== undefined) update.agentMinPayPerOrder = agentMinPayPerOrder;
    if (agentIncentiveThreshold !== undefined) update.agentIncentiveThreshold = agentIncentiveThreshold;
    if (agentIncentiveAmount !== undefined) update.agentIncentiveAmount = agentIncentiveAmount;

    await settings.update(update);
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

/**
 * Tiered flat-fee delivery calculation.
 * Returns full breakdown: deliveryFee, packagingFee, smallCartFee, qwikSurcharge, total.
 */
const calcDeliveryFee = async (req, res) => {
  try {
    const { subtotal, deliveryType } = req.query;
    const sub = parseFloat(subtotal) || 0;

    let settings = await Settings.findByPk(1);
    if (!settings) settings = await Settings.create({ id: 1 });

    const freeThreshold   = settings.freeDeliveryThreshold   || 200;
    const stdFee          = settings.standardDeliveryFee      || 25;
    const smallThreshold  = settings.smallCartFeeThreshold    || 100;
    const smallFee        = settings.smallCartFeeAmount        || 10;
    const lowThreshold    = settings.lowOrderFeeThreshold     || 50;
    const lowFee          = settings.lowOrderFeeAmount         || 15;
    const pkgFee          = settings.packagingFee             || 10;
    const qwikFee         = settings.qwikDeliveryFee          || 30;

    // ── Qwik Delivery: only Qwik fee + packaging ───────────────
    if (deliveryType === 'Qwik') {
      return res.json({
        success: true,
        deliveryFee: 0,
        packagingFee: pkgFee,
        smallCartFee: 0,
        qwikSurcharge: qwikFee,
        isFree: false,
        deliveryMessage: `⚡ Qwik delivery — priority processing!`,
        smallCartMessage: '',
        freeThreshold,
        total: sub + qwikFee + pkgFee,
      });
    }

    // ── Smart Delivery fee (based on subtotal) ─────────────────
    let deliveryFee = 0;
    let deliveryMessage = '';
    let isFree = false;

    if (sub >= freeThreshold) {
      deliveryFee = 0;
      isFree = true;
      deliveryMessage = '🎉 You unlocked FREE delivery!';
    } else {
      deliveryFee = stdFee;
      const amountNeeded = Math.ceil(freeThreshold - sub);
      deliveryMessage = `Add ₹${amountNeeded} more to unlock FREE delivery`;
    }

    // ── Small Cart Fee ────────────────────────────────────────
    let smallCartFee = 0;
    let smallCartMessage = '';
    if (sub < lowThreshold) {
      smallCartFee = lowFee;
      smallCartMessage = 'Low-order handling · supports our small farmers';
    } else if (sub < smallThreshold) {
      smallCartFee = smallFee;
      smallCartMessage = 'Small batch service · we pack with extra care';
    }

    return res.json({
      success: true,
      deliveryFee,
      packagingFee: pkgFee,
      smallCartFee,
      qwikSurcharge: 0,
      isFree,
      deliveryMessage,
      smallCartMessage,
      freeThreshold,
      total: sub + deliveryFee + pkgFee + smallCartFee,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getSettings, updateSettings, calcDeliveryFee };
