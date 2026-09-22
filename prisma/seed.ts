import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding YashodhaMart database...');

  // 1. Create Demo Admin
  const adminPasswordHash = await bcrypt.hash('Admin12345!', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@yashodhamart.com' },
    update: {},
    create: {
      name: 'Yashodha Admin',
      email: 'admin@yashodhamart.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log('Admin created:', admin.email);

  // 2. Create Demo User
  const userPasswordHash = await bcrypt.hash('User12345!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@yashodhamart.com' },
    update: {},
    create: {
      name: 'Rahul Sharma',
      email: 'user@yashodhamart.com',
      phone: '9876543210',
      passwordHash: userPasswordHash,
      role: 'USER',
    },
  });
  console.log('User created:', user.email);

  // 3. Create Address for User
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      fullName: 'Rahul Sharma',
      phone: '9876543210',
      houseBuilding: 'Flat 402, Sunshine Apartments',
      street: 'MG Road, Outer Ring Road',
      area: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      isDefault: true,
    },
  });

  // 4. Create Categories
  const categoriesData = [
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Ethnic wear, casual outfits, western clothes & trending apparel',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Smartphones, laptops, smart TVs & premium gadgets',
      image: 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Mobile Accessories',
      slug: 'mobile-accessories',
      description: 'Headphones, chargers, power banks, back covers & tempered glass',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Cookware, decor, bedsheets, storage boxes & home appliances',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Beauty',
      slug: 'beauty',
      description: 'Skincare, haircare, makeup essentials & personal grooming',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Books',
      slug: 'books',
      description: 'Academic textbooks, fiction, self-help, competitive exams & novels',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Grocery',
      slug: 'grocery',
      description: 'Daily staples, organic spices, pulses, rice & snacks',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Sports shoes, formal shoes, ethnic sandals & sneakers',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Watches, leather wallets, sunglasses, handbags & belts',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
    },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }

  // 5. Create 20+ Realistic Products
  const productsData = [
    {
      name: 'Yashodha Pure Cotton Printed Kurta Set',
      slug: 'yashodha-cotton-printed-kurta-set',
      description: 'Premium pure cotton breathable Indian kurta with matching trousers and dupatta. Handcrafted with traditional floral prints.',
      price: 1899,
      discountPercent: 35,
      stock: 45,
      rating: 4.7,
      reviewCount: 128,
      isFeatured: true,
      isNewArrival: false,
      categoryId: categoryMap['fashion'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Men Premium Slim Fit Casual Oxford Shirt',
      slug: 'men-slim-fit-oxford-shirt',
      description: '100% combed cotton Oxford shirt with crisp collar and comfortable stretch. Perfect for casual meetings and evening wear.',
      price: 1499,
      discountPercent: 40,
      stock: 30,
      rating: 4.5,
      reviewCount: 94,
      isFeatured: false,
      isNewArrival: true,
      categoryId: categoryMap['fashion'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Active Noise Cancelling Wireless Headphones',
      slug: 'anc-wireless-headphones',
      description: '40mm HD dynamic drivers, 35-hour battery life, fast charging (10 min charge = 3 hrs play), and hybrid active noise cancellation.',
      price: 4999,
      discountPercent: 25,
      stock: 22,
      rating: 4.8,
      reviewCount: 310,
      isFeatured: true,
      isNewArrival: true,
      categoryId: categoryMap['electronics'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Ultra-Slim 15.6" Full HD Student Laptop',
      slug: 'ultraslim-student-laptop',
      description: 'Powered by 12th Gen Intel Core i5 processor, 16GB DDR4 RAM, 512GB NVMe SSD, backlit keyboard, and 1080p IPS display.',
      price: 48999,
      discountPercent: 18,
      stock: 12,
      rating: 4.6,
      reviewCount: 82,
      isFeatured: true,
      isNewArrival: false,
      categoryId: categoryMap['electronics'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: '20000mAh 22.5W Fast Charging Power Bank',
      slug: '20000mah-fast-charging-power-bank',
      description: 'Dual USB-A and Type-C Power Delivery ports. Fits easily in pocket or bag. Over-voltage and short-circuit protection built-in.',
      price: 1999,
      discountPercent: 30,
      stock: 60,
      rating: 4.4,
      reviewCount: 215,
      isFeatured: false,
      isNewArrival: true,
      categoryId: categoryMap['mobile-accessories'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1609592424074-8b65287f3bfa?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'True Wireless Earbuds with ENC Dual Mic',
      slug: 'tws-earbuds-enc-mic',
      description: 'Deep bass TWS earbuds with Environmental Noise Cancellation for crystal clear calls, IPX5 water resistance, and 28-hour playtime.',
      price: 1799,
      discountPercent: 45,
      stock: 50,
      rating: 4.3,
      reviewCount: 450,
      isFeatured: true,
      isNewArrival: false,
      categoryId: categoryMap['mobile-accessories'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Non-Stick Die-Cast Aluminum Granite Cookware Set (3 Pcs)',
      slug: 'granite-non-stick-cookware-set',
      description: 'Includes Kadhai with lid, Fry Pan, and Dosa Tawa. PFOA-free 5-layer granite coating suitable for both induction and gas stoves.',
      price: 3499,
      discountPercent: 50,
      stock: 18,
      rating: 4.7,
      reviewCount: 76,
      isFeatured: true,
      isNewArrival: false,
      categoryId: categoryMap['home-kitchen'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: '100% Egyptian Cotton 300 TC Bedsheet with 2 Pillow Covers',
      slug: 'egyptian-cotton-bedsheet-set',
      description: 'Super soft King-size double bedsheet with satin weave finish. Skin-friendly, shrink-resistant, and fade-resistant fabric.',
      price: 2499,
      discountPercent: 40,
      stock: 35,
      rating: 4.5,
      reviewCount: 160,
      isFeatured: false,
      isNewArrival: true,
      categoryId: categoryMap['home-kitchen'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Vitamin C Brightening Face Serum (30ml)',
      slug: 'vitamin-c-face-serum-30ml',
      description: 'Enriched with 15% Pure L-Ascorbic Acid, Hyaluronic Acid, and Ferulic Acid. Helps reduce dark spots, pigmentation, and fine lines.',
      price: 699,
      discountPercent: 20,
      stock: 80,
      rating: 4.6,
      reviewCount: 520,
      isFeatured: true,
      isNewArrival: false,
      categoryId: categoryMap['beauty'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Organic Ayurvedic Herbal Hair Oil (200ml)',
      slug: 'ayurvedic-herbal-hair-oil-200ml',
      description: 'Cold-pressed coconut and sesame oil infused with Bhringraj, Amla, and Neem. Nourishes scalp, controls hair fall, and prevents dandruff.',
      price: 499,
      discountPercent: 15,
      stock: 100,
      rating: 4.5,
      reviewCount: 290,
      isFeatured: false,
      isNewArrival: true,
      categoryId: categoryMap['beauty'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608248597369-24759657a876?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Atomic Habits by James Clear (Paperback Edition)',
      slug: 'atomic-habits-james-clear',
      description: 'The million-copy bestseller. An easy & proven way to build good habits and break bad ones.',
      price: 599,
      discountPercent: 25,
      stock: 40,
      rating: 4.9,
      reviewCount: 1400,
      isFeatured: true,
      isNewArrival: false,
      categoryId: categoryMap['books'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Data Structures & Algorithms in Java (Core Textbook)',
      slug: 'dsa-java-textbook',
      description: 'Comprehensive guide covering arrays, linked lists, trees, graphs, dynamic programming, and interview preparation questions.',
      price: 850,
      discountPercent: 20,
      stock: 25,
      rating: 4.7,
      reviewCount: 110,
      isFeatured: false,
      isNewArrival: true,
      categoryId: categoryMap['books'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Premium Single-Origin Organic Cardamom & Whole Spices Combo',
      slug: 'organic-spices-combo-pack',
      description: 'Handpicked Western Ghats green cardamom (100g), clove (100g), and cinnamon sticks (100g). Rich aroma and 100% natural.',
      price: 799,
      discountPercent: 15,
      stock: 50,
      rating: 4.8,
      reviewCount: 88,
      isFeatured: false,
      isNewArrival: true,
      categoryId: categoryMap['grocery'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Himalayan Organic Raw Wildflower Honey (500g)',
      slug: 'himalayan-raw-honey-500g',
      description: '100% pure unprocessed wildflower honey harvested from forest beehives. Zero added sugar or artificial preservatives.',
      price: 449,
      discountPercent: 10,
      stock: 75,
      rating: 4.6,
      reviewCount: 204,
      isFeatured: true,
      isNewArrival: false,
      categoryId: categoryMap['grocery'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Men Lightweight Cushioned Sports Running Shoes',
      slug: 'men-cushioned-running-shoes',
      description: 'Breathable fly-knit mesh upper with high-rebound EVA sole. Designed for daily running, gym workouts, and outdoor activities.',
      price: 2999,
      discountPercent: 40,
      stock: 35,
      rating: 4.6,
      reviewCount: 380,
      isFeatured: true,
      isNewArrival: true,
      categoryId: categoryMap['footwear'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Women Stylish Memory Foam Casual Walking Sneakers',
      slug: 'women-memory-foam-sneakers',
      description: 'Ultra-lightweight slip-on walking shoes with orthopedic memory foam insoles for all-day comfort.',
      price: 2299,
      discountPercent: 35,
      stock: 40,
      rating: 4.5,
      reviewCount: 195,
      isFeatured: false,
      isNewArrival: true,
      categoryId: categoryMap['footwear'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Chronograph Stainless Steel Waterproof Watch for Men',
      slug: 'chronograph-watch-men',
      description: 'Japanese quartz movement, mineral glass dial, date display, 50m water resistance, and durable stainless steel chain.',
      price: 4500,
      discountPercent: 30,
      stock: 20,
      rating: 4.7,
      reviewCount: 145,
      isFeatured: true,
      isNewArrival: false,
      categoryId: categoryMap['accessories'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Genuine Leather RFID Blocking Wallet for Men',
      slug: 'genuine-leather-rfid-wallet',
      description: 'Crafted from top-grain leather with 8 card slots, 2 currency compartments, and hidden coin pocket. RFID protection against scanning.',
      price: 1299,
      discountPercent: 35,
      stock: 65,
      rating: 4.6,
      reviewCount: 280,
      isFeatured: false,
      isNewArrival: true,
      categoryId: categoryMap['accessories'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Polarized UV400 Protection Aviator Sunglasses',
      slug: 'polarized-aviator-sunglasses',
      description: 'Lightweight alloy metal frame with glare-reducing polarized lenses. Protects eyes from 100% harmful UVA and UVB rays.',
      price: 1599,
      discountPercent: 50,
      stock: 30,
      rating: 4.4,
      reviewCount: 175,
      isFeatured: false,
      isNewArrival: false,
      categoryId: categoryMap['accessories'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800',
      ]),
    },
    {
      name: 'Ergonomic Mesh Office Desk Chair with Lumbar Support',
      slug: 'ergonomic-mesh-office-chair',
      description: 'High-back desk chair with adjustable lumbar support, 3D armrests, heavy-duty nylon base, and 120-degree tilt mechanism.',
      price: 7999,
      discountPercent: 25,
      stock: 15,
      rating: 4.8,
      reviewCount: 62,
      isFeatured: true,
      isNewArrival: true,
      categoryId: categoryMap['home-kitchen'],
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&q=80&w=800',
      ]),
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const created = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
    createdProducts.push(created);
  }
  console.log(`Seeded ${createdProducts.length} products.`);

  // 6. Create Initial Order for Demo User
  const sampleProd1 = createdProducts[0];
  const sampleProd2 = createdProducts[2];

  const order = await prisma.order.create({
    data: {
      orderNumber: 'YM-ORD-100291',
      userId: user.id,
      totalAmount: sampleProd1.price + sampleProd2.price,
      discountAmount: Math.round(sampleProd1.price * (sampleProd1.discountPercent / 100) + sampleProd2.price * (sampleProd2.discountPercent / 100)),
      deliveryFee: 0,
      finalAmount: Math.round(sampleProd1.price * (1 - sampleProd1.discountPercent / 100) + sampleProd2.price * (1 - sampleProd2.discountPercent / 100)),
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      orderStatus: 'Delivered',
      shippingAddress: JSON.stringify(address),
      items: {
        create: [
          {
            productId: sampleProd1.id,
            productName: sampleProd1.name,
            productImage: JSON.parse(sampleProd1.images)[0],
            price: Math.round(sampleProd1.price * (1 - sampleProd1.discountPercent / 100)),
            quantity: 1,
            totalPrice: Math.round(sampleProd1.price * (1 - sampleProd1.discountPercent / 100)),
          },
          {
            productId: sampleProd2.id,
            productName: sampleProd2.name,
            productImage: JSON.parse(sampleProd2.images)[0],
            price: Math.round(sampleProd2.price * (1 - sampleProd2.discountPercent / 100)),
            quantity: 1,
            totalPrice: Math.round(sampleProd2.price * (1 - sampleProd2.discountPercent / 100)),
          },
        ],
      },
    },
  });
  console.log('Sample order created:', order.orderNumber);

  // 7. Add Sample Review for Demo User
  await prisma.review.create({
    data: {
      userId: user.id,
      productId: sampleProd1.id,
      rating: 5,
      comment: 'Excellent quality fabric! Fitting is perfect and color is exact as shown in photos. Delivered on time.',
    },
  });
  console.log('Sample review created.');

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
