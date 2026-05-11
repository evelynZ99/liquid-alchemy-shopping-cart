-- Liquid Alchemy — Product Seed Data
-- Run: mysql -u root -p ecommerce_cart_db < database/seed_data.sql

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `order_items`;
TRUNCATE TABLE `cart_items`;
TRUNCATE TABLE `wishlist_items`;
TRUNCATE TABLE `products`;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `products`
  (`id`, `name`, `description`, `price`, `image_url`, `category`, `stock`,
   `alcohol_type`, `flavor_profile`, `difficulty`, `occasion`)
VALUES
  -- ── Cocktails ──────────────────────────────────────────────────────────────
  (1,  'Cucumber Salad Single',
       'Hendrick\'s Gin, Mezcal, Olive Brine',
       35, '/images/cucumber-salad.png',   'Cocktails', 12,
       'Gin, Mezcal',  'Savory',          'Medium',   'Casual'),

  (2,  'Pineappu Beach Single',
       'Japanese Whisky, Yuzu Umeshu, Pineapple Cordial',
       38, '/images/pineappu-beach.png',   'Cocktails', 10,
       'Whisky',       'Sweet & Sour',    'Easy',     'Casual'),

  (3,  'Smoky Chile & Honey',
       'Islay Whisky, Scotch Whisky, Chile Pepper Liqueur, Elderflower Liqueur, Honey, Lemon',
       39, '/images/smoky-chile-honey.png','Cocktails', 10,
       'Whisky',       'Smoky & Sweet',   'Medium',   'Date Night'),

  (4,  'Carrot Cake',
       'Suntory Kakubin Whisky, White Rum, Lillet Blanc, Butter, Carrot Juice, Almond Milk, Orgeat, Cinnamon, Lemon',
       39, '/images/carrot-cake.png',      'Cocktails', 10,
       'Whisky, Rum',  'Sweet & Creamy',  'Advanced', 'Celebration'),

  (5,  'Tomato Cobbler',
       'Fino Sherry, Tomato Syrup, Lemon Juice',
       35, '/images/tomato-cobbler.png',   'Cocktails', 10,
       'Sherry',       'Savory & Bright', 'Easy',     'Casual'),

  (6,  'Kicu In The Sidecar',
       'Chrysanthemum Sake, Apricot Liqueur, D.O.M Benedictine, Lemon',
       39, '/images/kicu-sidecar.png',     'Cocktails', 10,
       'Sake',         'Floral & Citrus', 'Medium',   'Date Night'),

  (7,  'Shiozakura Collins',
       'Roku Gin, Sakura Vermouth, Shio-zakura Saline Solution, Lemon, Simple Syrup, CO2',
       38, '/images/shiozakura-collins.png','Cocktails',10,
       'Gin',          'Refreshing',      'Easy',     'Casual'),

  -- ── Kits ───────────────────────────────────────────────────────────────────
  (8,  'Shima Fizzy Kit',
       'Mezcal, Dashi, Watermelon Soda — serves 2',
       75, '/images/shima-fizzy.png',      'Kits',      8,
       'Mezcal',       'Fizzy & Experimental', 'Medium', 'Party'),

  (9,  'Mojito Starter Kit',
       'White Rum, Fresh Mint, Lime, Cane Sugar, Soda Water — serves 4',
       65, '/images/mojito-kit.png',       'Kits',     12,
       'Rum',          'Fresh & Citrus',  'Easy',     'Party'),

  (10, 'Classic Margarita Kit',
       'Blanco Tequila, Triple Sec, Fresh Lime, Salt — serves 4',
       70, '/images/margarita-kit.png',    'Kits',     10,
       'Tequila',      'Sour & Bright',   'Easy',     'Party'),

  -- ── Glassware ──────────────────────────────────────────────────────────────
  (11, 'Coupe Glass Set',
       'Handblown crystal coupe, set of 4. Ideal for cocktails and champagne.',
       85, '/images/coupe-glass.png',      'Glassware',15,
       NULL, NULL, NULL, NULL),

  (12, 'Highball Glass Set',
       'Clear crystal highball, set of 4. Perfect for long cocktails and fizzy drinks.',
       72, '/images/highball-glass.png',   'Glassware',15,
       NULL, NULL, NULL, NULL),

  (13, 'Crystal Rocks Glass',
       'Heavy-base crystal rocks glass, set of 2. Designed for whiskey and spirit pours.',
       68, '/images/rocks-glass.png',      'Glassware',20,
       NULL, NULL, NULL, NULL),

  -- ── Bar Tools ──────────────────────────────────────────────────────────────
  (14, 'Cocktail Shaker Set',
       '3-piece stainless steel shaker with built-in strainer and measuring cap.',
       55, '/images/shaker-set.png',       'Bar Tools',20,
       NULL, NULL, NULL, NULL),

  (15, 'Precision Jigger',
       'Double-sided stainless steel jigger, 30ml / 60ml. Calibrated for accuracy.',
       28, '/images/jigger-set.png',       'Bar Tools',25,
       NULL, NULL, NULL, NULL);
