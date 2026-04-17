const { Banner } = require('./models');

const seedBanners = async () => {
  try {
    const count = await Banner.count();
    if (count > 0) {
      console.log('Banners already exist, skipping seed.');
      return;
    }

    const heroBanners = [
      { type: 'HERO', title: 'Get Groceries in 10 Minutes', subtitle: 'Fresh & Fast', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200', bg: 'linear-gradient(to right, #2b5876 0%, #4e4376 100%)', order: 1 },
      { type: 'HERO', title: 'Farm Fresh Vegetables Delivered', subtitle: 'Direct from Farms', image: 'https://images.unsplash.com/photo-1582284728022-81ad57adc229?auto=format&fit=crop&q=80&w=1200', bg: 'linear-gradient(to right, #0ba360 0%, #3cba92 100%)', order: 2 },
      { type: 'HERO', title: 'Craving Sweets? Fast Delivery!', subtitle: 'Treat Yourself', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1200', bg: 'linear-gradient(to right, #ff0844 0%, #ffb199 100%)', order: 3 },
    ];

    const b2bHeroBanners = [
      { type: 'B2B_HERO', title: 'Scale your Business with Wholesale', subtitle: 'Warehouse Direct', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200', bg: 'linear-gradient(to right, #1e3a8a 0%, #1e40af 100%)', order: 1 },
      { type: 'B2B_HERO', title: 'Bulk Orders, Reliable Delivery', subtitle: 'Efficient Logistics', image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=1200', bg: 'linear-gradient(to right, #312e81 0%, #4338ca 100%)', order: 2 },
    ];

    const promos = [
      { type: 'PROMO', title: 'Summer Essentials', subtitle: 'Up to 50% OFF', bg: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)', image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=400', order: 1 },
      { type: 'PROMO', title: 'Farm Fresh', subtitle: 'Delivered in 10 mins', bg: 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)', image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&q=80&w=400', order: 2 },
      { type: 'PROMO', title: 'Late Night Cravings', subtitle: 'Snacks & Drinks', bg: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=400', order: 3 },
    ];

    const b2bPromos = [
      { type: 'B2B_PROMO', title: 'Bulk Deals', subtitle: 'Save Up to 40%', bg: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400', order: 1 },
    ];

    await Banner.bulkCreate([...heroBanners, ...b2bHeroBanners, ...promos, ...b2bPromos]);
    console.log('✅ Banners seeded successfully!');
  } catch (err) {
    console.error('❌ Failed to seed banners:', err);
  }
};

module.exports = seedBanners;
