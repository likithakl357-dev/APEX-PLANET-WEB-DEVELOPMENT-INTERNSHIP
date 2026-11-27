// =============================================================================
// FreshNest product image map: the single source of truth for product photos.
// -----------------------------------------------------------------------------
// RULES
//  * A product shows a photo ONLY if it has an entry below AND the entry still matches the catalogue
//    (same product name + brand). Otherwise a clean, product-specific placeholder is shown. A wrong photo is
//    never preferred over a placeholder.
//  * Photos are real product photographs, stored LOCALLY under public/products/ (never hotlinked, never
//    Google thumbnail URLs, never AI-generated). Download them from the brand / manufacturer product page,
//    an authorised retailer, or a database whose licence allows reuse, and record where they came from.
//  * Keys are product ids ("<category index>-<item index>", e.g. "1-10"). Run `npm run images:list`
//    to export the full catalogue (ids, names, brands, pack sizes) as a sourcing checklist.
//  * Run `npm run images:check` after editing: it fails on missing files, stale names/brands,
//    missing source/licence info, and one photo reused for different products.
//
// ENTRY FORMAT
//   '1-10': {
//     name: 'Farm Eggs', brand: 'FreshNest Farm',            // must equal the catalogue values (safety check)
//     src: '/products/dairy/farm-eggs-6pc.webp',              // file inside public/products/
//     alt: 'Tray of six brown eggs',                          // describe what the photo actually shows
//     source: 'https://example.com/product-page',             // page the photo came from
//     credit: 'Brand name',                                   // shown as a small caption on the card (optional)
//     license: 'Permission from brand, 2026-11-20',           // REQUIRED: permission / licence under which it is used
//     representative: true,                             // loose produce only, labelled as an example
//     verified: '2026-11-20',                                 // date the photo and licence were reviewed
//   },
// =============================================================================

export const PRODUCT_IMAGES = {
  "0-0": {
    "name": "Alphonso Mango",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-0.jpg",
    "alt": "Alphonso Mango",
    "representative": true,
    "supplied": true
  },
  "0-1": {
    "name": "Robusta Banana",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-1.jpeg",
    "alt": "Robusta Banana",
    "representative": true,
    "supplied": true
  },
  "0-2": {
    "name": "Shimla Apple",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-2.jpeg",
    "alt": "Shimla Apple",
    "representative": true,
    "supplied": true
  },
  "0-3": {
    "name": "Nagpur Orange",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-3.jpeg",
    "alt": "Nagpur Orange",
    "representative": true,
    "supplied": true
  },
  "0-4": {
    "name": "Green Grapes",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-4.jpeg",
    "alt": "Green Grapes",
    "representative": true,
    "supplied": true
  },
  "0-5": {
    "name": "Pomegranate",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-5.jpeg",
    "alt": "Pomegranate",
    "representative": true,
    "supplied": true
  },
  "0-6": {
    "name": "Papaya",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-6.jpeg",
    "alt": "Papaya",
    "representative": true,
    "supplied": true
  },
  "0-7": {
    "name": "Watermelon",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-7.jpeg",
    "alt": "Watermelon",
    "representative": true,
    "supplied": true
  },
  "0-8": {
    "name": "Sweet Lime",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-8.jpeg",
    "alt": "Sweet Lime",
    "representative": true,
    "supplied": true
  },
  "0-9": {
    "name": "Guava",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-9.jpeg",
    "alt": "Guava",
    "representative": true,
    "supplied": true
  },
  "0-10": {
    "name": "Avocado",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-10.jpeg",
    "alt": "Avocado",
    "representative": true,
    "supplied": true
  },
  "0-11": {
    "name": "Coconut",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-11.jpeg",
    "alt": "Coconut",
    "representative": true,
    "supplied": true
  },
  "0-12": {
    "name": "Tomato",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-12.jpeg",
    "alt": "Tomato",
    "representative": true,
    "supplied": true
  },
  "0-13": {
    "name": "Onion",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-13.jpeg",
    "alt": "Onion",
    "representative": true,
    "supplied": true
  },
  "0-14": {
    "name": "Potato",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-14.jpeg",
    "alt": "Potato",
    "representative": true,
    "supplied": true
  },
  "0-15": {
    "name": "Spinach",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-15.jpeg",
    "alt": "Spinach",
    "representative": true,
    "supplied": true
  },
  "0-16": {
    "name": "Coriander Leaves",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-16.jpeg",
    "alt": "Coriander Leaves",
    "representative": true,
    "supplied": true
  },
  "0-17": {
    "name": "Green Chilli",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-17.jpeg",
    "alt": "Green Chilli",
    "representative": true,
    "supplied": true
  },
  "0-18": {
    "name": "Carrot",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-18.jpeg",
    "alt": "Carrot",
    "representative": true,
    "supplied": true
  },
  "0-19": {
    "name": "Cucumber",
    "brand": "FreshNest Farm",
    "src": "/products/produce/0-19.jpeg",
    "alt": "Cucumber",
    "representative": true,
    "supplied": true
  },
  "1-0": {
    "name": "Full Cream Milk",
    "brand": "Amul",
    "src": "/products/produce/1-0.jpeg",
    "alt": "Full Cream Milk",
    "representative": true,
    "supplied": true
  },
  "1-1": {
    "name": "Toned Milk",
    "brand": "Mother Dairy",
    "src": "/products/produce/1-1.jpeg",
    "alt": "Toned Milk",
    "representative": true,
    "supplied": true
  },
  "1-2": {
    "name": "Curd",
    "brand": "Milky Mist",
    "src": "/products/produce/1-2.jpeg",
    "alt": "Curd",
    "representative": true,
    "supplied": true
  },
  "1-3": {
    "name": "Greek Yogurt",
    "brand": "Epigamia",
    "src": "/products/produce/1-3.jpeg",
    "alt": "Greek Yogurt",
    "representative": true,
    "supplied": true
  },
  "1-4": {
    "name": "Paneer",
    "brand": "Amul",
    "src": "/products/produce/1-4.jpeg",
    "alt": "Paneer",
    "representative": true,
    "supplied": true
  },
  "1-5": {
    "name": "Butter",
    "brand": "Amul",
    "src": "/products/produce/1-5.jpeg",
    "alt": "Butter",
    "representative": true,
    "supplied": true
  },
  "1-6": {
    "name": "Cheese Slices",
    "brand": "Milky Mist",
    "src": "/products/produce/1-6.jpeg",
    "alt": "Cheese Slices",
    "representative": true,
    "supplied": true
  },
  "1-7": {
    "name": "Cheddar Cheese",
    "brand": "Milky Mist",
    "src": "/products/produce/1-7.jpeg",
    "alt": "Cheddar Cheese",
    "representative": true,
    "supplied": true
  },
  "1-8": {
    "name": "Fresh Cream",
    "brand": "Mother Dairy",
    "src": "/products/produce/1-8.jpeg",
    "alt": "Fresh Cream",
    "representative": true,
    "supplied": true
  },
  "1-9": {
    "name": "Masala Buttermilk",
    "brand": "Amul",
    "src": "/products/produce/1-9.jpeg",
    "alt": "Masala Buttermilk",
    "representative": true,
    "supplied": true
  },
  "1-10": {
    "name": "Free-Range Eggs",
    "brand": "Farm Made",
    "src": "/products/produce/1-10.jpeg",
    "alt": "Free-Range Eggs",
    "representative": true,
    "supplied": true
  },
  "1-11": {
    "name": "Brown Bread",
    "brand": "Harvest Gold",
    "src": "/products/produce/1-11.jpeg",
    "alt": "Brown Bread",
    "representative": true,
    "supplied": true
  },
  "1-12": {
    "name": "Whole Wheat Bread",
    "brand": "Baker’s Loaf",
    "src": "/products/produce/1-12.jpeg",
    "alt": "Whole Wheat Bread",
    "representative": true,
    "supplied": true
  },
  "1-13": {
    "name": "Multigrain Bread",
    "brand": "Harvest Gold",
    "src": "/products/produce/1-13.jpeg",
    "alt": "Multigrain Bread",
    "representative": true,
    "supplied": true
  },
  "1-14": {
    "name": "Pav",
    "brand": "Harvest Gold",
    "src": "/products/produce/1-14.jpeg",
    "alt": "Pav",
    "representative": true,
    "supplied": true
  },
  "1-15": {
    "name": "Burger Buns",
    "brand": "Modern",
    "src": "/products/produce/1-15.jpeg",
    "alt": "Burger Buns",
    "representative": true,
    "supplied": true
  },
  "1-16": {
    "name": "Idli Batter",
    "brand": "Freshey’s",
    "src": "/products/produce/1-16.jpeg",
    "alt": "Idli Batter",
    "representative": true,
    "supplied": true
  },
  "1-17": {
    "name": "Dosa Batter",
    "brand": "Fresh Rush",
    "src": "/products/produce/1-17.jpeg",
    "alt": "Dosa Batter",
    "representative": true,
    "supplied": true
  },
  "1-18": {
    "name": "Lassi",
    "brand": "Mother Dairy",
    "src": "/products/produce/1-18.jpeg",
    "alt": "Lassi",
    "representative": true,
    "supplied": true
  },
  "1-19": {
    "name": "High-Protein Milk",
    "brand": "Amul",
    "src": "/products/produce/1-19.jpeg",
    "alt": "High-Protein Milk",
    "representative": true,
    "supplied": true
  },
  "2-0": {
    "name": "Whole Wheat Atta",
    "brand": "Pillsbury",
    "src": "/products/produce/2-0.jpeg",
    "alt": "Whole Wheat Atta",
    "representative": true,
    "supplied": true
  },
  "2-1": {
    "name": "Basmati Rice",
    "brand": "Organic India",
    "src": "/products/produce/2-1.jpeg",
    "alt": "Basmati Rice",
    "representative": true,
    "supplied": true
  },
  "2-2": {
    "name": "Sona Masoori Rice",
    "brand": "Daawat",
    "src": "/products/produce/2-2.jpeg",
    "alt": "Sona Masoori Rice",
    "representative": true,
    "supplied": true
  },
  "2-3": {
    "name": "Brown Rice",
    "brand": "Brand not specified",
    "src": "/products/produce/2-3.jpeg",
    "alt": "Brown Rice",
    "representative": true,
    "supplied": true
  },
  "2-4": {
    "name": "Toor Dal",
    "brand": "24 Mantra Organic",
    "src": "/products/produce/2-4.jpeg",
    "alt": "Toor Dal",
    "representative": true,
    "supplied": true
  },
  "2-5": {
    "name": "Moong Dal",
    "brand": "Fortune",
    "src": "/products/produce/2-5.jpeg",
    "alt": "Moong Dal",
    "representative": true,
    "supplied": true
  },
  "2-6": {
    "name": "Unpolished Masoor Dal",
    "brand": "Tata Sampann",
    "src": "/products/produce/2-6.jpeg",
    "alt": "Unpolished Masoor Dal",
    "representative": true,
    "supplied": true
  },
  "2-7": {
    "name": "Chana Dal",
    "brand": "Tata Sampann",
    "src": "/products/produce/2-7.jpeg",
    "alt": "Chana Dal",
    "representative": true,
    "supplied": true
  },
  "2-8": {
    "name": "Urad Dal",
    "brand": "24 Mantra Organic",
    "src": "/products/produce/2-8.jpeg",
    "alt": "Urad Dal",
    "representative": true,
    "supplied": true
  },
  "2-9": {
    "name": "Kabuli Chana",
    "brand": "Tata Sampann",
    "src": "/products/produce/2-9.jpeg",
    "alt": "Kabuli Chana",
    "representative": true,
    "supplied": true
  },
  "2-10": {
    "name": "Organic Peanuts",
    "brand": "24 Mantra Organic",
    "src": "/products/produce/2-10.jpeg",
    "alt": "Organic Peanuts",
    "representative": true,
    "supplied": true
  },
  "2-11": {
    "name": "Poha",
    "brand": "24 Mantra Organic",
    "src": "/products/produce/2-11.jpeg",
    "alt": "Poha",
    "representative": true,
    "supplied": true
  },
  "2-12": {
    "name": "Unpolished Toor Dal",
    "brand": "Tata Sampann",
    "src": "/products/produce/2-12.jpeg",
    "alt": "Unpolished Toor Dal",
    "representative": true,
    "supplied": true
  },
  "2-13": {
    "name": "Besan",
    "brand": "Tata Sampann",
    "src": "/products/produce/2-13.jpeg",
    "alt": "Besan",
    "representative": true,
    "supplied": true
  },
  "2-14": {
    "name": "Ragi Flour",
    "brand": "Aashirvaad",
    "src": "/products/produce/2-14.jpeg",
    "alt": "Ragi Flour",
    "representative": true,
    "supplied": true
  },
  "2-15": {
    "name": "Jowar Flour",
    "brand": "Brand not specified",
    "src": "/products/produce/2-15.jpeg",
    "alt": "Jowar Flour",
    "representative": true,
    "supplied": true
  },
  "2-16": {
    "name": "Unpolished Urad Dal",
    "brand": "Fortune",
    "src": "/products/produce/2-16.jpeg",
    "alt": "Unpolished Urad Dal",
    "representative": true,
    "supplied": true
  },
  "2-17": {
    "name": "Sabudana",
    "brand": "Brand not specified",
    "src": "/products/produce/2-17.jpeg",
    "alt": "Sabudana",
    "representative": true,
    "supplied": true
  },
  "2-18": {
    "name": "Quinoa",
    "brand": "Organic India",
    "src": "/products/produce/2-18.jpeg",
    "alt": "Quinoa",
    "representative": true,
    "supplied": true
  },
  "2-19": {
    "name": "Millet Mix",
    "brand": "Purely",
    "src": "/products/produce/2-19.jpeg",
    "alt": "Millet Mix",
    "representative": true,
    "supplied": true
  },
  "3-0": {
    "name": "Saffola Gold Edible Oil Blend",
    "brand": "Saffola",
    "src": "/products/produce/3-0.jpeg",
    "alt": "Saffola Gold Edible Oil Blend",
    "representative": true,
    "supplied": true
  },
  "3-1": {
    "name": "Filtered Groundnut Oil",
    "brand": "Dhara",
    "src": "/products/produce/3-1.jpeg",
    "alt": "Filtered Groundnut Oil",
    "representative": true,
    "supplied": true
  },
  "3-2": {
    "name": "Mustard Oil",
    "brand": "Fortune",
    "src": "/products/produce/3-2.jpeg",
    "alt": "Mustard Oil",
    "representative": true,
    "supplied": true
  },
  "3-3": {
    "name": "Olive Oil",
    "brand": "Figaro",
    "src": "/products/produce/3-3.jpeg",
    "alt": "Olive Oil",
    "representative": true,
    "supplied": true
  },
  "3-4": {
    "name": "Coconut Oil",
    "brand": "Royal Gold",
    "src": "/products/produce/3-4.jpeg",
    "alt": "Coconut Oil",
    "representative": true,
    "supplied": true
  },
  "3-5": {
    "name": "Cow Ghee",
    "brand": "Patanjali",
    "src": "/products/produce/3-5.jpeg",
    "alt": "Cow Ghee",
    "representative": true,
    "supplied": true
  },
  "3-6": {
    "name": "Gir Cow Ghee",
    "brand": "Mother Dairy",
    "src": "/products/produce/3-6.jpeg",
    "alt": "Gir Cow Ghee",
    "representative": true,
    "supplied": true
  },
  "3-7": {
    "name": "Turmeric Powder",
    "brand": "Everest",
    "src": "/products/produce/3-7.jpeg",
    "alt": "Turmeric Powder",
    "representative": true,
    "supplied": true
  },
  "3-8": {
    "name": "Lal Mirch Powder",
    "brand": "MDH",
    "src": "/products/produce/3-8.jpeg",
    "alt": "Lal Mirch Powder",
    "representative": true,
    "supplied": true
  },
  "3-9": {
    "name": "Coriander Powder",
    "brand": "Everest",
    "src": "/products/produce/3-9.jpeg",
    "alt": "Coriander Powder",
    "representative": true,
    "supplied": true
  },
  "3-10": {
    "name": "Cumin Powder",
    "brand": "Everest",
    "src": "/products/produce/3-10.jpeg",
    "alt": "Cumin Powder",
    "representative": true,
    "supplied": true
  },
  "3-11": {
    "name": "Mustard Seeds",
    "brand": "Brand not specified",
    "src": "/products/produce/3-11.jpeg",
    "alt": "Mustard Seeds",
    "representative": true,
    "supplied": true
  },
  "3-12": {
    "name": "Garam Masala",
    "brand": "Tata Sampann",
    "src": "/products/produce/3-12.jpeg",
    "alt": "Garam Masala",
    "representative": true,
    "supplied": true
  },
  "3-13": {
    "name": "Pav Bhaji Masala",
    "brand": "Everest",
    "src": "/products/produce/3-13.jpeg",
    "alt": "Pav Bhaji Masala",
    "representative": true,
    "supplied": true
  },
  "3-14": {
    "name": "Sambar Powder",
    "brand": "Tata Sampann",
    "src": "/products/produce/3-14.jpeg",
    "alt": "Sambar Powder",
    "representative": true,
    "supplied": true
  },
  "3-15": {
    "name": "Chicken Biryani Masala",
    "brand": "MDH",
    "src": "/products/produce/3-15.jpeg",
    "alt": "Chicken Biryani Masala",
    "representative": true,
    "supplied": true
  },
  "3-16": {
    "name": "Black Pepper Powder",
    "brand": "MDH",
    "src": "/products/produce/3-16.jpeg",
    "alt": "Black Pepper Powder",
    "representative": true,
    "supplied": true
  },
  "3-17": {
    "name": "Cardamom",
    "brand": "Sake",
    "src": "/products/produce/3-17.jpeg",
    "alt": "Cardamom",
    "representative": true,
    "supplied": true
  },
  "3-18": {
    "name": "Whole Cassia",
    "brand": "Tata Sampann",
    "src": "/products/produce/3-18.jpeg",
    "alt": "Whole Cassia",
    "representative": true,
    "supplied": true
  },
  "3-19": {
    "name": "Rock Salt",
    "brand": "Tata Salt",
    "src": "/products/produce/3-19.jpeg",
    "alt": "Rock Salt",
    "representative": true,
    "supplied": true
  },
  "4-0": {
    "name": "Salted Potato Chips",
    "brand": "Balaji Wafers",
    "src": "/products/produce/4-0.jpeg",
    "alt": "Salted Potato Chips",
    "representative": true,
    "supplied": true
  },
  "4-1": {
    "name": "Masala Chips",
    "brand": "Bikaji",
    "src": "/products/produce/4-1.jpeg",
    "alt": "Masala Chips",
    "representative": true,
    "supplied": true
  },
  "4-2": {
    "name": "Banana Chips",
    "brand": "Brand not specified",
    "src": "/products/produce/4-2.jpeg",
    "alt": "Banana Chips",
    "representative": true,
    "supplied": true
  },
  "4-3": {
    "name": "Karare Munchy Masala",
    "brand": "Too Yumm!",
    "src": "/products/produce/4-3.jpeg",
    "alt": "Karare Munchy Masala",
    "representative": true,
    "supplied": true
  },
  "4-4": {
    "name": "Cheese Balls",
    "brand": "Bikaji",
    "src": "/products/produce/4-4.jpeg",
    "alt": "Cheese Balls",
    "representative": true,
    "supplied": true
  },
  "4-5": {
    "name": "Roasted Makhana",
    "brand": "Brand not specified",
    "src": "/products/produce/4-5.jpeg",
    "alt": "Roasted Makhana",
    "representative": true,
    "supplied": true
  },
  "4-6": {
    "name": "Masala Peanuts",
    "brand": "Brand not specified",
    "src": "/products/produce/4-6.jpeg",
    "alt": "Masala Peanuts",
    "representative": true,
    "supplied": true
  },
  "4-7": {
    "name": "Puffed Rice",
    "brand": "Aurenzo",
    "src": "/products/produce/4-7.jpeg",
    "alt": "Puffed Rice",
    "representative": true,
    "supplied": true
  },
  "4-8": {
    "name": "Bhujia",
    "brand": "Haldiram’s",
    "src": "/products/produce/4-8.jpeg",
    "alt": "Bhujia",
    "representative": true,
    "supplied": true
  },
  "4-9": {
    "name": "Mixture",
    "brand": "Haldiram’s",
    "src": "/products/produce/4-9.jpeg",
    "alt": "Mixture",
    "representative": true,
    "supplied": true
  },
  "4-10": {
    "name": "Healthy Bites Khakhra",
    "brand": "Balaji Wafers",
    "src": "/products/produce/4-10.jpeg",
    "alt": "Healthy Bites Khakhra",
    "representative": true,
    "supplied": true
  },
  "4-11": {
    "name": "Masala Sev Murmura",
    "brand": "Balaji Wafers",
    "src": "/products/produce/4-11.jpeg",
    "alt": "Masala Sev Murmura",
    "representative": true,
    "supplied": true
  },
  "4-12": {
    "name": "Murukku",
    "brand": "Bikaji",
    "src": "/products/produce/4-12.jpeg",
    "alt": "Murukku",
    "representative": true,
    "supplied": true
  },
  "4-13": {
    "name": "Popcorn Kernels",
    "brand": "SNN",
    "src": "/products/produce/4-13.jpeg",
    "alt": "Popcorn Kernels",
    "representative": true,
    "supplied": true
  },
  "4-14": {
    "name": "Granola Bar",
    "brand": "Baska",
    "src": "/products/produce/4-14.jpeg",
    "alt": "Granola Bar",
    "representative": true,
    "supplied": true
  },
  "4-15": {
    "name": "Choco Peanut Butter Protein Minis",
    "brand": "Yogabar",
    "src": "/products/produce/4-15.jpeg",
    "alt": "Choco Peanut Butter Protein Minis",
    "representative": true,
    "supplied": true
  },
  "4-16": {
    "name": "Too Yumm! Chips",
    "brand": "Too Yumm!",
    "src": "/products/produce/4-16.jpeg",
    "alt": "Too Yumm! Chips",
    "representative": true,
    "supplied": true
  },
  "4-17": {
    "name": "Too Yumm! Masala Chips",
    "brand": "Too Yumm!",
    "src": "/products/produce/4-17.jpeg",
    "alt": "Too Yumm! Masala Chips",
    "representative": true,
    "supplied": true
  },
  "4-18": {
    "name": "Trail Mix",
    "brand": "Brand not specified",
    "src": "/products/produce/4-18.jpeg",
    "alt": "Trail Mix",
    "representative": true,
    "supplied": true
  },
  "4-19": {
    "name": "Roasted Chana",
    "brand": "Yumflick",
    "src": "/products/produce/4-19.jpeg",
    "alt": "Roasted Chana",
    "representative": true,
    "supplied": true
  },
  "5-0": {
    "name": "Hershey’s Favorites Snack Size",
    "brand": "Hershey’s",
    "src": "/products/produce/5-0.jpeg",
    "alt": "Hershey’s Favorites Snack Size",
    "representative": true,
    "supplied": true
  },
  "5-1": {
    "name": "Choco Brownie Ice Cream",
    "brand": "Mother Dairy",
    "src": "/products/produce/5-1.jpeg",
    "alt": "Choco Brownie Ice Cream",
    "representative": true,
    "supplied": true
  },
  "5-2": {
    "name": "Gulab Jamun Dessert Mix",
    "brand": "MTR",
    "src": "/products/produce/5-2.jpeg",
    "alt": "Gulab Jamun Dessert Mix",
    "representative": true,
    "supplied": true
  },
  "5-3": {
    "name": "Cadbury Celebrations Chocolate Assortment",
    "brand": "Cadbury",
    "src": "/products/produce/5-3.jpeg",
    "alt": "Cadbury Celebrations Chocolate Assortment",
    "representative": true,
    "supplied": true
  },
  "5-4": {
    "name": "Soan Papdi",
    "brand": "Haldiram’s",
    "src": "/products/produce/5-4.jpeg",
    "alt": "Soan Papdi",
    "representative": true,
    "supplied": true
  },
  "5-5": {
    "name": "Kaju Katli",
    "brand": "Haldiram’s",
    "src": "/products/produce/5-5.jpeg",
    "alt": "Kaju Katli",
    "representative": true,
    "supplied": true
  },
  "5-6": {
    "name": "Bournville Fruit & Nut Dark Chocolate",
    "brand": "Cadbury",
    "src": "/products/produce/5-6.jpeg",
    "alt": "Bournville Fruit & Nut Dark Chocolate",
    "representative": true,
    "supplied": true
  },
  "5-7": {
    "name": "Milk Chocolate with Whole Almonds",
    "brand": "Hershey’s",
    "src": "/products/produce/5-7.jpeg",
    "alt": "Milk Chocolate with Whole Almonds",
    "representative": true,
    "supplied": true
  },
  "5-8": {
    "name": "Chocolate Wafer",
    "brand": "Brand not specified",
    "src": "/products/produce/5-8.jpeg",
    "alt": "Chocolate Wafer",
    "representative": true,
    "supplied": true
  },
  "5-9": {
    "name": "Choco Roll Wafers",
    "brand": "Dukes",
    "src": "/products/produce/5-9.jpeg",
    "alt": "Choco Roll Wafers",
    "representative": true,
    "supplied": true
  },
  "5-10": {
    "name": "Cupcake",
    "brand": "Brand not specified",
    "src": "/products/produce/5-10.jpeg",
    "alt": "Cupcake",
    "representative": true,
    "supplied": true
  },
  "5-11": {
    "name": "Instant Vada Mix",
    "brand": "MTR",
    "src": "/products/produce/5-11.jpeg",
    "alt": "Instant Vada Mix",
    "representative": true,
    "supplied": true
  },
  "5-12": {
    "name": "Bikaneri Burfi",
    "brand": "Haldiram’s",
    "src": "/products/produce/5-12.jpeg",
    "alt": "Bikaneri Burfi",
    "representative": true,
    "supplied": true
  },
  "5-13": {
    "name": "Caramel Pudding",
    "brand": "Brand not specified",
    "src": "/products/produce/5-13.jpeg",
    "alt": "Caramel Pudding",
    "representative": true,
    "supplied": true
  },
  "5-14": {
    "name": "Ice Cream Tub",
    "brand": "Brand not specified",
    "src": "/products/produce/5-14.jpeg",
    "alt": "Ice Cream Tub",
    "representative": true,
    "supplied": true
  },
  "5-15": {
    "name": "Kulfi",
    "brand": "Brand not specified",
    "src": "/products/produce/5-15.jpeg",
    "alt": "Kulfi",
    "representative": true,
    "supplied": true
  },
  "5-16": {
    "name": "Jelly Cups",
    "brand": "Brand not specified",
    "src": "/products/produce/5-16.jpeg",
    "alt": "Jelly Cups",
    "representative": true,
    "supplied": true
  },
  "5-17": {
    "name": "Ladoo",
    "brand": "Brand not specified",
    "src": "/products/produce/5-17.jpeg",
    "alt": "Ladoo",
    "representative": true,
    "supplied": true
  },
  "5-18": {
    "name": "Cocoa Almond Spread",
    "brand": "Hershey’s",
    "src": "/products/produce/5-18.jpeg",
    "alt": "Cocoa Almond Spread",
    "representative": true,
    "supplied": true
  },
  "5-19": {
    "name": "Peanut Chikki",
    "brand": "Brand not specified",
    "src": "/products/produce/5-19.jpeg",
    "alt": "Peanut Chikki",
    "representative": true,
    "supplied": true
  },
  "6-0": {
    "name": "Orange Juice",
    "brand": "Tropicana",
    "src": "/products/produce/6-0.jpeg",
    "alt": "Orange Juice",
    "representative": true,
    "supplied": true
  },
  "6-1": {
    "name": "Mango Juice",
    "brand": "Real",
    "src": "/products/produce/6-1.jpeg",
    "alt": "Mango Juice",
    "representative": true,
    "supplied": true
  },
  "6-2": {
    "name": "Apple Juice",
    "brand": "Real",
    "src": "/products/produce/6-2.jpeg",
    "alt": "Apple Juice",
    "representative": true,
    "supplied": true
  },
  "6-3": {
    "name": "Mixed Fruit Juice",
    "brand": "Tropicana",
    "src": "/products/produce/6-3.jpeg",
    "alt": "Mixed Fruit Juice",
    "representative": true,
    "supplied": true
  },
  "6-4": {
    "name": "Tender Coconut Water",
    "brand": "Tender Coco",
    "src": "/products/produce/6-4.jpeg",
    "alt": "Tender Coconut Water",
    "representative": true,
    "supplied": true
  },
  "6-5": {
    "name": "Sprite Lemon-Lime Soft Drink",
    "brand": "Sprite",
    "src": "/products/produce/6-5.jpeg",
    "alt": "Sprite Lemon-Lime Soft Drink",
    "representative": true,
    "supplied": true
  },
  "6-6": {
    "name": "Coca-Cola Original Taste",
    "brand": "Coca-Cola",
    "src": "/products/produce/6-6.jpeg",
    "alt": "Coca-Cola Original Taste",
    "representative": true,
    "supplied": true
  },
  "6-7": {
    "name": "Sprite Lemon-Lime Soft Drink Multipack",
    "brand": "Sprite",
    "src": "/products/produce/6-7.jpeg",
    "alt": "Sprite Lemon-Lime Soft Drink Multipack",
    "representative": true,
    "supplied": true
  },
  "6-8": {
    "name": "Schweppes Ginger Ale",
    "brand": "Schweppes",
    "src": "/products/produce/6-8.jpeg",
    "alt": "Schweppes Ginger Ale",
    "representative": true,
    "supplied": true
  },
  "6-9": {
    "name": "Red Bull Energy Drink",
    "brand": "Red Bull",
    "src": "/products/produce/6-9.jpeg",
    "alt": "Red Bull Energy Drink",
    "representative": true,
    "supplied": true
  },
  "6-10": {
    "name": "Cold Coffee",
    "brand": "Nescafé",
    "src": "/products/produce/6-10.jpeg",
    "alt": "Cold Coffee",
    "representative": true,
    "supplied": true
  },
  "6-11": {
    "name": "Energy Drink",
    "brand": "Brand not specified",
    "src": "/products/produce/6-11.jpeg",
    "alt": "Energy Drink",
    "representative": true,
    "supplied": true
  },
  "6-12": {
    "name": "Kinley Soda",
    "brand": "Kinley",
    "src": "/products/produce/6-12.jpeg",
    "alt": "Kinley Soda",
    "representative": true,
    "supplied": true
  },
  "6-13": {
    "name": "Mineral Water",
    "brand": "Aquafina",
    "src": "/products/produce/6-13.jpeg",
    "alt": "Mineral Water",
    "representative": true,
    "supplied": true
  },
  "6-14": {
    "name": "Buttermilk",
    "brand": "Brand not specified",
    "src": "/products/produce/6-14.jpeg",
    "alt": "Buttermilk",
    "representative": true,
    "supplied": true
  },
  "6-15": {
    "name": "Aam Panna",
    "brand": "Brand not specified",
    "src": "/products/produce/6-15.jpeg",
    "alt": "Aam Panna",
    "representative": true,
    "supplied": true
  },
  "6-16": {
    "name": "Litchi Fruit Drink",
    "brand": "Swing",
    "src": "/products/produce/6-16.jpeg",
    "alt": "Litchi Fruit Drink",
    "representative": true,
    "supplied": true
  },
  "6-17": {
    "name": "Guava Fruit Drink",
    "brand": "Swing",
    "src": "/products/produce/6-17.jpeg",
    "alt": "Guava Fruit Drink",
    "representative": true,
    "supplied": true
  },
  "6-18": {
    "name": "Pomegranate Fruit Drink",
    "brand": "Swing",
    "src": "/products/produce/6-18.jpeg",
    "alt": "Pomegranate Fruit Drink",
    "representative": true,
    "supplied": true
  },
  "6-19": {
    "name": "Kombucha",
    "brand": "Brand not specified",
    "src": "/products/produce/6-19.jpeg",
    "alt": "Kombucha",
    "representative": true,
    "supplied": true
  },
  "7-0": {
    "name": "Corn Flakes",
    "brand": "Kellogg’s",
    "src": "/products/produce/7-0.jpeg",
    "alt": "Corn Flakes",
    "representative": true,
    "supplied": true
  },
  "7-1": {
    "name": "Froot Loops and Chocos Cereal Combo",
    "brand": "Kellogg’s",
    "src": "/products/produce/7-1.jpeg",
    "alt": "Froot Loops and Chocos Cereal Combo",
    "representative": true,
    "supplied": true
  },
  "7-2": {
    "name": "Muesli",
    "brand": "Bagrry’s",
    "src": "/products/produce/7-2.jpeg",
    "alt": "Muesli",
    "representative": true,
    "supplied": true
  },
  "7-3": {
    "name": "Oats",
    "brand": "Bagrry’s",
    "src": "/products/produce/7-3.jpeg",
    "alt": "Oats",
    "representative": true,
    "supplied": true
  },
  "7-4": {
    "name": "Peanut Butter",
    "brand": "Dr. Oetker FunFoods",
    "src": "/products/produce/7-4.jpeg",
    "alt": "Peanut Butter",
    "representative": true,
    "supplied": true
  },
  "7-5": {
    "name": "Almond Butter",
    "brand": "Jus Amazin",
    "src": "/products/produce/7-5.jpeg",
    "alt": "Almond Butter",
    "representative": true,
    "supplied": true
  },
  "7-6": {
    "name": "Mixed Fruit Drink Multipack",
    "brand": "Del Monte",
    "src": "/products/produce/7-6.jpeg",
    "alt": "Mixed Fruit Drink Multipack",
    "representative": true,
    "supplied": true
  },
  "7-7": {
    "name": "Strawberry Jam",
    "brand": "Kissan",
    "src": "/products/produce/7-7.jpeg",
    "alt": "Strawberry Jam",
    "representative": true,
    "supplied": true
  },
  "7-8": {
    "name": "Honey",
    "brand": "Saffola",
    "src": "/products/produce/7-8.jpeg",
    "alt": "Honey",
    "representative": true,
    "supplied": true
  },
  "7-9": {
    "name": "Maple-Flavoured Syrup",
    "brand": "Briovo",
    "src": "/products/produce/7-9.jpeg",
    "alt": "Maple-Flavoured Syrup",
    "representative": true,
    "supplied": true
  },
  "7-10": {
    "name": "Tomato Ketchup",
    "brand": "Del Monte",
    "src": "/products/produce/7-10.jpeg",
    "alt": "Tomato Ketchup",
    "representative": true,
    "supplied": true
  },
  "7-11": {
    "name": "Chilli Sauce",
    "brand": "Del Monte",
    "src": "/products/produce/7-11.jpeg",
    "alt": "Chilli Sauce",
    "representative": true,
    "supplied": true
  },
  "7-12": {
    "name": "Soy Sauce",
    "brand": "Del Monte",
    "src": "/products/produce/7-12.jpeg",
    "alt": "Soy Sauce",
    "representative": true,
    "supplied": true
  },
  "7-13": {
    "name": "Mayonnaise",
    "brand": "Dr. Oetker FunFoods",
    "src": "/products/produce/7-13.jpeg",
    "alt": "Mayonnaise",
    "representative": true,
    "supplied": true
  },
  "7-14": {
    "name": "Mustard Sauce",
    "brand": "Veeba",
    "src": "/products/produce/7-14.jpeg",
    "alt": "Mustard Sauce",
    "representative": true,
    "supplied": true
  },
  "7-15": {
    "name": "Pasta Sauce",
    "brand": "Veeba",
    "src": "/products/produce/7-15.jpeg",
    "alt": "Pasta Sauce",
    "representative": true,
    "supplied": true
  },
  "7-16": {
    "name": "Vinegar",
    "brand": "Brand not specified",
    "src": "/products/produce/7-16.jpeg",
    "alt": "Vinegar",
    "representative": true,
    "supplied": true
  },
  "7-17": {
    "name": "Classic Pancake Mix",
    "brand": "Brand not specified",
    "src": "/products/produce/7-17.jpeg",
    "alt": "Classic Pancake Mix",
    "representative": true,
    "supplied": true
  },
  "7-18": {
    "name": "Porridge Mix",
    "brand": "Brand not specified",
    "src": "/products/produce/7-18.jpeg",
    "alt": "Porridge Mix",
    "representative": true,
    "supplied": true
  },
  "7-19": {
    "name": "Cocoa Powder",
    "brand": "Puramate",
    "src": "/products/produce/7-19.jpeg",
    "alt": "Cocoa Powder",
    "representative": true,
    "supplied": true
  },
  "8-0": {
    "name": "Instant Noodles",
    "brand": "Top Ramen",
    "src": "/products/produce/8-0.jpeg",
    "alt": "Instant Noodles",
    "representative": true,
    "supplied": true
  },
  "8-1": {
    "name": "Cup Noodles",
    "brand": "Nissin",
    "src": "/products/produce/8-1.jpeg",
    "alt": "Cup Noodles",
    "representative": true,
    "supplied": true
  },
  "8-2": {
    "name": "Italian Pasta Sauce",
    "brand": "Del Monte",
    "src": "/products/produce/8-2.jpeg",
    "alt": "Italian Pasta Sauce",
    "representative": true,
    "supplied": true
  },
  "8-3": {
    "name": "Macaroni",
    "brand": "Brand not specified",
    "src": "/products/produce/8-3.jpeg",
    "alt": "Macaroni",
    "representative": true,
    "supplied": true
  },
  "8-4": {
    "name": "Vegetable Biryani Cooking Paste",
    "brand": "ITC Master Chef",
    "src": "/products/produce/8-4.jpeg",
    "alt": "Vegetable Biryani Cooking Paste",
    "representative": true,
    "supplied": true
  },
  "8-5": {
    "name": "Frozen Green Peas",
    "brand": "McCain",
    "src": "/products/produce/8-5.jpeg",
    "alt": "Frozen Green Peas",
    "representative": true,
    "supplied": true
  },
  "8-6": {
    "name": "Frozen Corn",
    "brand": "Brand not specified",
    "src": "/products/produce/8-6.jpeg",
    "alt": "Frozen Corn",
    "representative": true,
    "supplied": true
  },
  "8-7": {
    "name": "Frozen French Fries",
    "brand": "McCain",
    "src": "/products/produce/8-7.jpeg",
    "alt": "Frozen French Fries",
    "representative": true,
    "supplied": true
  },
  "8-8": {
    "name": "Frozen Vegetable Snack Combo",
    "brand": "Godrej Yummiez",
    "src": "/products/produce/8-8.jpeg",
    "alt": "Frozen Vegetable Snack Combo",
    "representative": true,
    "supplied": true
  },
  "8-9": {
    "name": "Frozen Spring Rolls",
    "brand": "Brand not specified",
    "src": "/products/produce/8-9.jpeg",
    "alt": "Frozen Spring Rolls",
    "representative": true,
    "supplied": true
  },
  "8-10": {
    "name": "Frozen Paratha",
    "brand": "Brand not specified",
    "src": "/products/produce/8-10.jpeg",
    "alt": "Frozen Paratha",
    "representative": true,
    "supplied": true
  },
  "8-11": {
    "name": "Rice Idli Instant Mix",
    "brand": "Gits",
    "src": "/products/produce/8-11.jpeg",
    "alt": "Rice Idli Instant Mix",
    "representative": true,
    "supplied": true
  },
  "8-12": {
    "name": "Protein Dosa Ready Mix",
    "brand": "MTR",
    "src": "/products/produce/8-12.jpeg",
    "alt": "Protein Dosa Ready Mix",
    "representative": true,
    "supplied": true
  },
  "8-13": {
    "name": "Soup Pack",
    "brand": "Brand not specified",
    "src": "/products/produce/8-13.jpeg",
    "alt": "Soup Pack",
    "representative": true,
    "supplied": true
  },
  "8-14": {
    "name": "Instant Upma",
    "brand": "Master Cook",
    "src": "/products/produce/8-14.jpeg",
    "alt": "Instant Upma",
    "representative": true,
    "supplied": true
  },
  "8-15": {
    "name": "Instant Poha",
    "brand": "Brand not specified",
    "src": "/products/produce/8-15.jpeg",
    "alt": "Instant Poha",
    "representative": true,
    "supplied": true
  },
  "8-16": {
    "name": "YiPPee! Suji Pasta",
    "brand": "Sunfeast YiPPee!",
    "src": "/products/produce/8-16.jpeg",
    "alt": "YiPPee! Suji Pasta",
    "representative": true,
    "supplied": true
  },
  "8-17": {
    "name": "Frozen Momos",
    "brand": "Prasuma",
    "src": "/products/produce/8-17.jpeg",
    "alt": "Frozen Momos",
    "representative": true,
    "supplied": true
  },
  "8-18": {
    "name": "Veg Burger Patty",
    "brand": "ITC Master Chef",
    "src": "/products/produce/8-18.jpeg",
    "alt": "Veg Burger Patty",
    "representative": true,
    "supplied": true
  },
  "8-19": {
    "name": "Pizza Base",
    "brand": "Brand not specified",
    "src": "/products/produce/8-19.jpeg",
    "alt": "Pizza Base",
    "representative": true,
    "supplied": true
  },
  "9-0": {
    "name": "White Bread",
    "brand": "Brand not specified",
    "src": "/products/produce/9-0.jpeg",
    "alt": "White Bread",
    "representative": true,
    "supplied": true
  },
  "9-1": {
    "name": "Brown Bread Loaf",
    "brand": "Britannia",
    "src": "/products/produce/9-1.jpeg",
    "alt": "Brown Bread Loaf",
    "representative": true,
    "supplied": true
  },
  "9-2": {
    "name": "Multigrain Loaf",
    "brand": "Modern",
    "src": "/products/produce/9-2.jpeg",
    "alt": "Multigrain Loaf",
    "representative": true,
    "supplied": true
  },
  "9-3": {
    "name": "Garlic Bread",
    "brand": "Britannia",
    "src": "/products/produce/9-3.jpeg",
    "alt": "Garlic Bread",
    "representative": true,
    "supplied": true
  },
  "9-4": {
    "name": "Treat Chocolate Croissant",
    "brand": "Britannia",
    "src": "/products/produce/9-4.jpeg",
    "alt": "Treat Chocolate Croissant",
    "representative": true,
    "supplied": true
  },
  "9-5": {
    "name": "Butter Bun",
    "brand": "Brand not specified",
    "src": "/products/produce/9-5.jpeg",
    "alt": "Butter Bun",
    "representative": true,
    "supplied": true
  },
  "9-6": {
    "name": "Pita Bread",
    "brand": "Brand not specified",
    "src": "/products/produce/9-6.jpeg",
    "alt": "Pita Bread",
    "representative": true,
    "supplied": true
  },
  "9-7": {
    "name": "Tortilla Wrap",
    "brand": "Karamat",
    "src": "/products/produce/9-7.jpeg",
    "alt": "Tortilla Wrap",
    "representative": true,
    "supplied": true
  },
  "9-8": {
    "name": "Chocolate Celebration Cake",
    "brand": "Brand not specified",
    "src": "/products/produce/9-8.jpeg",
    "alt": "Chocolate Celebration Cake",
    "representative": true,
    "supplied": true
  },
  "9-9": {
    "name": "Cadbury Chocolate Layered Cake",
    "brand": "Cadbury",
    "src": "/products/produce/9-9.jpeg",
    "alt": "Cadbury Chocolate Layered Cake",
    "representative": true,
    "supplied": true
  },
  "9-10": {
    "name": "Vanilla Slice Cake",
    "brand": "Britannia",
    "src": "/products/produce/9-10.jpeg",
    "alt": "Vanilla Slice Cake",
    "representative": true,
    "supplied": true
  },
  "9-11": {
    "name": "Tea Cake",
    "brand": "Britannia",
    "src": "/products/produce/9-11.jpeg",
    "alt": "Tea Cake",
    "representative": true,
    "supplied": true
  },
  "9-12": {
    "name": "Suji Rusk",
    "brand": "Harvest Gold",
    "src": "/products/produce/9-12.jpeg",
    "alt": "Suji Rusk",
    "representative": true,
    "supplied": true
  },
  "9-13": {
    "name": "Fruit Bread",
    "brand": "Britannia",
    "src": "/products/produce/9-13.jpeg",
    "alt": "Fruit Bread",
    "representative": true,
    "supplied": true
  },
  "9-14": {
    "name": "Pizza Base",
    "brand": "Harvest Gold",
    "src": "/products/produce/9-14.jpeg",
    "alt": "Pizza Base",
    "representative": true,
    "supplied": true
  },
  "9-15": {
    "name": "Puff Pastry",
    "brand": "Brand not specified",
    "src": "/products/produce/9-15.jpeg",
    "alt": "Puff Pastry",
    "representative": true,
    "supplied": true
  },
  "9-16": {
    "name": "Cinnamon Roll",
    "brand": "Brand not specified",
    "src": "/products/produce/9-16.jpeg",
    "alt": "Cinnamon Roll",
    "representative": true,
    "supplied": true
  },
  "9-17": {
    "name": "Donut",
    "brand": "Brand not specified",
    "src": "/products/produce/9-17.jpeg",
    "alt": "Donut",
    "representative": true,
    "supplied": true
  },
  "9-18": {
    "name": "Bagel",
    "brand": "Brand not specified",
    "src": "/products/produce/9-18.jpeg",
    "alt": "Bagel",
    "representative": true,
    "supplied": true
  },
  "9-19": {
    "name": "Breadsticks",
    "brand": "Brand not specified",
    "src": "/products/produce/9-19.jpeg",
    "alt": "Breadsticks",
    "representative": true,
    "supplied": true
  },
  "10-0": {
    "name": "Assam Tea",
    "brand": "Octavius",
    "src": "/products/produce/10-0.jpeg",
    "alt": "Assam Tea",
    "representative": true,
    "supplied": true
  },
  "10-1": {
    "name": "Green Tea",
    "brand": "Society Tea",
    "src": "/products/produce/10-1.jpeg",
    "alt": "Green Tea",
    "representative": true,
    "supplied": true
  },
  "10-2": {
    "name": "Masala Tea",
    "brand": "Red Label",
    "src": "/products/produce/10-2.jpeg",
    "alt": "Masala Tea",
    "representative": true,
    "supplied": true
  },
  "10-3": {
    "name": "Darjeeling Tea",
    "brand": "Golden Tips",
    "src": "/products/produce/10-3.jpeg",
    "alt": "Darjeeling Tea",
    "representative": true,
    "supplied": true
  },
  "10-4": {
    "name": "Nescafé 2-in-1 Instant Coffee",
    "brand": "Nescafé",
    "src": "/products/produce/10-4.jpeg",
    "alt": "Nescafé 2-in-1 Instant Coffee",
    "representative": true,
    "supplied": true
  },
  "10-5": {
    "name": "Nescafé Classic Instant Coffee",
    "brand": "Nescafé",
    "src": "/products/produce/10-5.jpeg",
    "alt": "Nescafé Classic Instant Coffee",
    "representative": true,
    "supplied": true
  },
  "10-6": {
    "name": "Cold Coffee Mix",
    "brand": "BRU",
    "src": "/products/produce/10-6.jpeg",
    "alt": "Cold Coffee Mix",
    "representative": true,
    "supplied": true
  },
  "10-7": {
    "name": "Cacao Powder",
    "brand": "Sattvic Foods",
    "src": "/products/produce/10-7.jpeg",
    "alt": "Cacao Powder",
    "representative": true,
    "supplied": true
  },
  "10-8": {
    "name": "Boost Nutrition Drink Mix",
    "brand": "Boost",
    "src": "/products/produce/10-8.jpeg",
    "alt": "Boost Nutrition Drink Mix",
    "representative": true,
    "supplied": true
  },
  "10-9": {
    "name": "Chocolate Plant Protein Shake",
    "brand": "Orgain",
    "src": "/products/produce/10-9.jpeg",
    "alt": "Chocolate Plant Protein Shake",
    "representative": true,
    "supplied": true
  },
  "10-10": {
    "name": "Electrolyte Drink",
    "brand": "Sweetmate",
    "src": "/products/produce/10-10.jpeg",
    "alt": "Electrolyte Drink",
    "representative": true,
    "supplied": true
  },
  "10-11": {
    "name": "Rejuvenate Herbal Infusion",
    "brand": "Tata Tea",
    "src": "/products/produce/10-11.jpeg",
    "alt": "Rejuvenate Herbal Infusion",
    "representative": true,
    "supplied": true
  },
  "10-12": {
    "name": "Red Label Tea",
    "brand": "Red Label",
    "src": "/products/produce/10-12.jpeg",
    "alt": "Red Label Tea",
    "representative": true,
    "supplied": true
  },
  "10-13": {
    "name": "Lemon Tea",
    "brand": "Red Label",
    "src": "/products/produce/10-13.jpeg",
    "alt": "Lemon Tea",
    "representative": true,
    "supplied": true
  },
  "10-14": {
    "name": "BRU Instant Coffee",
    "brand": "BRU",
    "src": "/products/produce/10-14.jpeg",
    "alt": "BRU Instant Coffee",
    "representative": true,
    "supplied": true
  },
  "10-15": {
    "name": "Nescafé Classic Instant Coffee",
    "brand": "Nescafé",
    "src": "/products/produce/10-15.jpeg",
    "alt": "Nescafé Classic Instant Coffee",
    "representative": true,
    "supplied": true
  },
  "10-16": {
    "name": "Matcha Powder",
    "brand": "Brand not specified",
    "src": "/products/produce/10-16.jpeg",
    "alt": "Matcha Powder",
    "representative": true,
    "supplied": true
  },
  "10-17": {
    "name": "Turmeric Latte Mix",
    "brand": "Fresh Start",
    "src": "/products/produce/10-17.jpeg",
    "alt": "Turmeric Latte Mix",
    "representative": true,
    "supplied": true
  },
  "10-18": {
    "name": "Badam Drink Mix",
    "brand": "MTR",
    "src": "/products/produce/10-18.jpeg",
    "alt": "Badam Drink Mix",
    "representative": true,
    "supplied": true
  },
  "10-19": {
    "name": "Health Malt",
    "brand": "Cadbury Bournvita",
    "src": "/products/produce/10-19.jpeg",
    "alt": "Health Malt",
    "representative": true,
    "supplied": true
  },
  "11-0": {
    "name": "Almonds",
    "brand": "Tata Sampann",
    "src": "/products/produce/11-0.jpeg",
    "alt": "Almonds",
    "representative": true,
    "supplied": true
  },
  "11-1": {
    "name": "Cashews",
    "brand": "Tata Sampann",
    "src": "/products/produce/11-1.jpeg",
    "alt": "Cashews",
    "representative": true,
    "supplied": true
  },
  "11-2": {
    "name": "Pistachios",
    "brand": "Nutraj",
    "src": "/products/produce/11-2.jpeg",
    "alt": "Pistachios",
    "representative": true,
    "supplied": true
  },
  "11-3": {
    "name": "Walnuts",
    "brand": "Tata Sampann",
    "src": "/products/produce/11-3.jpeg",
    "alt": "Walnuts",
    "representative": true,
    "supplied": true
  },
  "11-4": {
    "name": "Raisins",
    "brand": "Farmley",
    "src": "/products/produce/11-4.jpeg",
    "alt": "Raisins",
    "representative": true,
    "supplied": true
  },
  "11-5": {
    "name": "Dates",
    "brand": "Farmley",
    "src": "/products/produce/11-5.jpeg",
    "alt": "Dates",
    "representative": true,
    "supplied": true
  },
  "11-6": {
    "name": "Dried Figs",
    "brand": "Brand not specified",
    "src": "/products/produce/11-6.jpeg",
    "alt": "Dried Figs",
    "representative": true,
    "supplied": true
  },
  "11-7": {
    "name": "Apricots",
    "brand": "Farmley",
    "src": "/products/produce/11-7.jpeg",
    "alt": "Apricots",
    "representative": true,
    "supplied": true
  },
  "11-8": {
    "name": "Shelled Pumpkin Seeds",
    "brand": "Happilo",
    "src": "/products/produce/11-8.jpeg",
    "alt": "Shelled Pumpkin Seeds",
    "representative": true,
    "supplied": true
  },
  "11-9": {
    "name": "Sunflower Seeds",
    "brand": "Farmley",
    "src": "/products/produce/11-9.jpeg",
    "alt": "Sunflower Seeds",
    "representative": true,
    "supplied": true
  },
  "11-10": {
    "name": "Chia Seeds",
    "brand": "Farmley",
    "src": "/products/produce/11-10.jpeg",
    "alt": "Chia Seeds",
    "representative": true,
    "supplied": true
  },
  "11-11": {
    "name": "Flax Seeds",
    "brand": "Nutraj",
    "src": "/products/produce/11-11.jpeg",
    "alt": "Flax Seeds",
    "representative": true,
    "supplied": true
  },
  "11-12": {
    "name": "Pine Nuts",
    "brand": "Brand not specified",
    "src": "/products/produce/11-12.jpeg",
    "alt": "Pine Nuts",
    "representative": true,
    "supplied": true
  },
  "11-13": {
    "name": "Pecan Nuts",
    "brand": "Brand not specified",
    "src": "/products/produce/11-13.jpeg",
    "alt": "Pecan Nuts",
    "representative": true,
    "supplied": true
  },
  "11-14": {
    "name": "Hazelnuts",
    "brand": "Arome",
    "src": "/products/produce/11-14.jpeg",
    "alt": "Hazelnuts",
    "representative": true,
    "supplied": true
  },
  "11-15": {
    "name": "Prunes",
    "brand": "Farmley",
    "src": "/products/produce/11-15.jpeg",
    "alt": "Prunes",
    "representative": true,
    "supplied": true
  },
  "11-16": {
    "name": "Cranberries",
    "brand": "Brand not specified",
    "src": "/products/produce/11-16.jpeg",
    "alt": "Cranberries",
    "representative": true,
    "supplied": true
  },
  "11-17": {
    "name": "Mixed Nuts and Party Mix Combo",
    "brand": "Farmley",
    "src": "/products/produce/11-17.jpeg",
    "alt": "Mixed Nuts and Party Mix Combo",
    "representative": true,
    "supplied": true
  },
  "11-18": {
    "name": "Mixed Dry Fruits Trail Mix",
    "brand": "Bikano",
    "src": "/products/produce/11-18.jpeg",
    "alt": "Mixed Dry Fruits Trail Mix",
    "representative": true,
    "supplied": true
  },
  "11-19": {
    "name": "Pumpkin Seeds",
    "brand": "Nutraj",
    "src": "/products/produce/11-19.jpeg",
    "alt": "Pumpkin Seeds",
    "representative": true,
    "supplied": true
  },
  "12-0": {
    "name": "Milk Chocolate Bar",
    "brand": "Cadbury",
    "src": "/products/produce/12-0.jpeg",
    "alt": "Milk Chocolate Bar",
    "representative": true,
    "supplied": true
  },
  "12-1": {
    "name": "KitKat Brownie Dessert Wafer",
    "brand": "KitKat",
    "src": "/products/produce/12-1.jpeg",
    "alt": "KitKat Brownie Dessert Wafer",
    "representative": true,
    "supplied": true
  },
  "12-2": {
    "name": "White Chocolate",
    "brand": "Hershey’s",
    "src": "/products/produce/12-2.jpeg",
    "alt": "White Chocolate",
    "representative": true,
    "supplied": true
  },
  "12-3": {
    "name": "Hazelnut Chocolate",
    "brand": "Nestlé",
    "src": "/products/produce/12-3.jpeg",
    "alt": "Hazelnut Chocolate",
    "representative": true,
    "supplied": true
  },
  "12-4": {
    "name": "Exotic Dark Turkish Hazelnut Chocolate",
    "brand": "Hershey’s",
    "src": "/products/produce/12-4.jpeg",
    "alt": "Exotic Dark Turkish Hazelnut Chocolate",
    "representative": true,
    "supplied": true
  },
  "12-5": {
    "name": "Chocolate Truffle Cake",
    "brand": "Brand not specified",
    "src": "/products/produce/12-5.jpeg",
    "alt": "Chocolate Truffle Cake",
    "representative": true,
    "supplied": true
  },
  "12-6": {
    "name": "Amul Chocominis",
    "brand": "Amul",
    "src": "/products/produce/12-6.jpeg",
    "alt": "Amul Chocominis",
    "representative": true,
    "supplied": true
  },
  "12-7": {
    "name": "Fruit Candy",
    "brand": "Brand not specified",
    "src": "/products/produce/12-7.jpeg",
    "alt": "Fruit Candy",
    "representative": true,
    "supplied": true
  },
  "12-8": {
    "name": "Dairy Milk Mint Crisp",
    "brand": "Cadbury",
    "src": "/products/produce/12-8.jpeg",
    "alt": "Dairy Milk Mint Crisp",
    "representative": true,
    "supplied": true
  },
  "12-9": {
    "name": "Dairy Milk Lolly",
    "brand": "Cadbury",
    "src": "/products/produce/12-9.jpeg",
    "alt": "Dairy Milk Lolly",
    "representative": true,
    "supplied": true
  },
  "12-10": {
    "name": "Gummy Bears",
    "brand": "Brand not specified",
    "src": "/products/produce/12-10.jpeg",
    "alt": "Gummy Bears",
    "representative": true,
    "supplied": true
  },
  "12-11": {
    "name": "Jelly Beans",
    "brand": "Brand not specified",
    "src": "/products/produce/12-11.jpeg",
    "alt": "Jelly Beans",
    "representative": true,
    "supplied": true
  },
  "12-12": {
    "name": "Alpenliebe Gold Caramel Candy",
    "brand": "Alpenliebe",
    "src": "/products/produce/12-12.jpeg",
    "alt": "Alpenliebe Gold Caramel Candy",
    "representative": true,
    "supplied": true
  },
  "12-13": {
    "name": "Hershey’s Choco Tubes",
    "brand": "Hershey’s",
    "src": "/products/produce/12-13.jpeg",
    "alt": "Hershey’s Choco Tubes",
    "representative": true,
    "supplied": true
  },
  "12-14": {
    "name": "Sour Punk Strawberry Candy Sticks",
    "brand": "Sour Punk",
    "src": "/products/produce/12-14.jpeg",
    "alt": "Sour Punk Strawberry Candy Sticks",
    "representative": true,
    "supplied": true
  },
  "12-15": {
    "name": "Chocolate Candies",
    "brand": "Brand not specified",
    "src": "/products/produce/12-15.jpeg",
    "alt": "Chocolate Candies",
    "representative": true,
    "supplied": true
  },
  "12-16": {
    "name": "Reese’s Peanut Butter Cups",
    "brand": "Reese’s",
    "src": "/products/produce/12-16.jpeg",
    "alt": "Reese’s Peanut Butter Cups",
    "representative": true,
    "supplied": true
  },
  "12-17": {
    "name": "Hershey’s Chocolate Wafer",
    "brand": "Hershey’s",
    "src": "/products/produce/12-17.jpeg",
    "alt": "Hershey’s Chocolate Wafer",
    "representative": true,
    "supplied": true
  },
  "12-18": {
    "name": "Coconut Shots Candy",
    "brand": "Brand not specified",
    "src": "/products/produce/12-18.jpeg",
    "alt": "Coconut Shots Candy",
    "representative": true,
    "supplied": true
  },
  "12-19": {
    "name": "Amul Assorted Chocolates",
    "brand": "Amul",
    "src": "/products/produce/12-19.jpeg",
    "alt": "Amul Assorted Chocolates",
    "representative": true,
    "supplied": true
  },
  "13-0": {
    "name": "Clinic Plus Shampoo",
    "brand": "Clinic Plus",
    "src": "/products/produce/13-0.jpeg",
    "alt": "Clinic Plus Shampoo",
    "representative": true,
    "supplied": true
  },
  "13-1": {
    "name": "Sunsilk Conditioner",
    "brand": "Sunsilk",
    "src": "/products/produce/13-1.jpeg",
    "alt": "Sunsilk Conditioner",
    "representative": true,
    "supplied": true
  },
  "13-2": {
    "name": "Frangipani & Oil Shower Gel",
    "brand": "Nivea",
    "src": "/products/produce/13-2.jpeg",
    "alt": "Frangipani & Oil Shower Gel",
    "representative": true,
    "supplied": true
  },
  "13-3": {
    "name": "Toothpaste",
    "brand": "Closeup",
    "src": "/products/produce/13-3.jpeg",
    "alt": "Toothpaste",
    "representative": true,
    "supplied": true
  },
  "13-4": {
    "name": "Colgate Bamboo Toothbrush",
    "brand": "Colgate",
    "src": "/products/produce/13-4.jpeg",
    "alt": "Colgate Bamboo Toothbrush",
    "representative": true,
    "supplied": true
  },
  "13-5": {
    "name": "Mouthwash",
    "brand": "Colgate",
    "src": "/products/produce/13-5.webp",
    "alt": "Mouthwash",
    "representative": true,
    "supplied": true
  },
  "13-6": {
    "name": "Perfect Radiance Face Wash",
    "brand": "Lakmé",
    "src": "/products/produce/13-6.webp",
    "alt": "Perfect Radiance Face Wash",
    "representative": true,
    "supplied": true
  },
  "13-7": {
    "name": "Nivea Creme Moisturizer",
    "brand": "Nivea",
    "src": "/products/produce/13-7.webp",
    "alt": "Nivea Creme Moisturizer",
    "representative": true,
    "supplied": true
  },
  "13-8": {
    "name": "Sun Expert SPF 50 Sunscreen",
    "brand": "Lakmé",
    "src": "/products/produce/13-8.webp",
    "alt": "Sun Expert SPF 50 Sunscreen",
    "representative": true,
    "supplied": true
  },
  "13-9": {
    "name": "Strawberry Shine Serum Lip Balm",
    "brand": "Himalaya",
    "src": "/products/produce/13-9.jpeg",
    "alt": "Strawberry Shine Serum Lip Balm",
    "representative": true,
    "supplied": true
  },
  "13-10": {
    "name": "Fresh Active Deodorant",
    "brand": "Nivea Men",
    "src": "/products/produce/13-10.webp",
    "alt": "Fresh Active Deodorant",
    "representative": true,
    "supplied": true
  },
  "13-11": {
    "name": "Gillette Body 2-in-1 Shave Gel",
    "brand": "Gillette",
    "src": "/products/produce/13-11.jpeg",
    "alt": "Gillette Body 2-in-1 Shave Gel",
    "representative": true,
    "supplied": true
  },
  "13-12": {
    "name": "Hand Cream",
    "brand": "Brand not specified",
    "src": "/products/produce/13-12.jpeg",
    "alt": "Hand Cream",
    "representative": true,
    "supplied": true
  },
  "13-13": {
    "name": "Hair Serum",
    "brand": "Bare Anatomy",
    "src": "/products/produce/13-13.jpeg",
    "alt": "Hair Serum",
    "representative": true,
    "supplied": true
  },
  "13-14": {
    "name": "Intense Repair Shampoo and Conditioner",
    "brand": "Dove",
    "src": "/products/produce/13-14.jpeg",
    "alt": "Intense Repair Shampoo and Conditioner",
    "representative": true,
    "supplied": true
  },
  "13-15": {
    "name": "Twin-Blade Razor",
    "brand": "Brand not specified",
    "src": "/products/produce/13-15.jpeg",
    "alt": "Twin-Blade Razor",
    "representative": true,
    "supplied": true
  },
  "13-16": {
    "name": "Fusion5 Cartridges and Shaving Foam",
    "brand": "Gillette",
    "src": "/products/produce/13-16.jpeg",
    "alt": "Fusion5 Cartridges and Shaving Foam",
    "representative": true,
    "supplied": true
  },
  "13-17": {
    "name": "Sanitary Pads",
    "brand": "Stayfree",
    "src": "/products/produce/13-17.jpeg",
    "alt": "Sanitary Pads",
    "representative": true,
    "supplied": true
  },
  "13-18": {
    "name": "Wet Wipes",
    "brand": "Nivea",
    "src": "/products/produce/13-18.jpeg",
    "alt": "Wet Wipes",
    "representative": true,
    "supplied": true
  },
  "13-19": {
    "name": "Cotton Buds",
    "brand": "Johnson’s",
    "src": "/products/produce/13-19.jpeg",
    "alt": "Cotton Buds",
    "representative": true,
    "supplied": true
  },
  "14-0": {
    "name": "Pears Pure & Gentle Bathing Bars",
    "brand": "Pears",
    "src": "/products/produce/14-0.webp",
    "alt": "Pears Pure & Gentle Bathing Bars",
    "representative": true,
    "supplied": true
  },
  "14-1": {
    "name": "Himalaya Gentle Baby Wash",
    "brand": "Himalaya",
    "src": "/products/produce/14-1.jpeg",
    "alt": "Himalaya Gentle Baby Wash",
    "representative": true,
    "supplied": true
  },
  "14-2": {
    "name": "Nivea Body Lotion",
    "brand": "Nivea",
    "src": "/products/produce/14-2.jpeg",
    "alt": "Nivea Body Lotion",
    "representative": true,
    "supplied": true
  },
  "14-3": {
    "name": "Body Scrub",
    "brand": "Brand not specified",
    "src": "/products/produce/14-3.jpeg",
    "alt": "Body Scrub",
    "representative": true,
    "supplied": true
  },
  "14-4": {
    "name": "Bath Sponge",
    "brand": "Brand not specified",
    "src": "/products/produce/14-4.jpeg",
    "alt": "Bath Sponge",
    "representative": true,
    "supplied": true
  },
  "14-5": {
    "name": "Pears Shower Gel",
    "brand": "Pears",
    "src": "/products/produce/14-5.jpeg",
    "alt": "Pears Shower Gel",
    "representative": true,
    "supplied": true
  },
  "14-6": {
    "name": "Urea & AHA Foot Cream",
    "brand": "Chemist at Play",
    "src": "/products/produce/14-6.jpeg",
    "alt": "Urea & AHA Foot Cream",
    "representative": true,
    "supplied": true
  },
  "14-7": {
    "name": "Talcum Powder",
    "brand": "Himalaya",
    "src": "/products/produce/14-7.jpeg",
    "alt": "Talcum Powder",
    "representative": true,
    "supplied": true
  },
  "14-8": {
    "name": "Bath Salt",
    "brand": "Brand not specified",
    "src": "/products/produce/14-8.jpeg",
    "alt": "Bath Salt",
    "representative": true,
    "supplied": true
  },
  "14-9": {
    "name": "Loofah",
    "brand": "Brand not specified",
    "src": "/products/produce/14-9.jpeg",
    "alt": "Loofah",
    "representative": true,
    "supplied": true
  },
  "14-10": {
    "name": "Face Soap",
    "brand": "Nivea",
    "src": "/products/produce/14-10.jpeg",
    "alt": "Face Soap",
    "representative": true,
    "supplied": true
  },
  "14-11": {
    "name": "Dettol Hydrate Hand Wash Refill",
    "brand": "Dettol",
    "src": "/products/produce/14-11.jpeg",
    "alt": "Dettol Hydrate Hand Wash Refill",
    "representative": true,
    "supplied": true
  },
  "14-12": {
    "name": "Cocoa Butter Deep Nourishing Serum",
    "brand": "Nivea",
    "src": "/products/produce/14-12.jpeg",
    "alt": "Cocoa Butter Deep Nourishing Serum",
    "representative": true,
    "supplied": true
  },
  "14-13": {
    "name": "Hand Sanitizer",
    "brand": "Savlon",
    "src": "/products/produce/14-13.jpeg",
    "alt": "Hand Sanitizer",
    "representative": true,
    "supplied": true
  },
  "14-14": {
    "name": "Toilet Soap",
    "brand": "Brand not specified",
    "src": "/products/produce/14-14.jpeg",
    "alt": "Toilet Soap",
    "representative": true,
    "supplied": true
  },
  "14-15": {
    "name": "Shower Cap",
    "brand": "Brand not specified",
    "src": "/products/produce/14-15.jpeg",
    "alt": "Shower Cap",
    "representative": true,
    "supplied": true
  },
  "14-16": {
    "name": "Essential Oil",
    "brand": "Brand not specified",
    "src": "/products/produce/14-16.jpeg",
    "alt": "Essential Oil",
    "representative": true,
    "supplied": true
  },
  "14-17": {
    "name": "Bath Towel",
    "brand": "Brand not specified",
    "src": "/products/produce/14-17.jpeg",
    "alt": "Bath Towel",
    "representative": true,
    "supplied": true
  },
  "14-18": {
    "name": "Body Mist",
    "brand": "Brand not specified",
    "src": "/products/produce/14-18.jpeg",
    "alt": "Body Mist",
    "representative": true,
    "supplied": true
  },
  "14-19": {
    "name": "Pears Pure & Gentle Body Wash Refill",
    "brand": "Pears",
    "src": "/products/produce/14-19.jpeg",
    "alt": "Pears Pure & Gentle Body Wash Refill",
    "representative": true,
    "supplied": true
  },
  "15-0": {
    "name": "Dishwash Liquid",
    "brand": "Pril",
    "src": "/products/produce/15-0.jpeg",
    "alt": "Dishwash Liquid",
    "representative": true,
    "supplied": true
  },
  "15-1": {
    "name": "Vim Dishwash Bar",
    "brand": "Vim",
    "src": "/products/produce/15-1.jpeg",
    "alt": "Vim Dishwash Bar",
    "representative": true,
    "supplied": true
  },
  "15-2": {
    "name": "Ariel Machine Expert Detergent",
    "brand": "Ariel",
    "src": "/products/produce/15-2.jpeg",
    "alt": "Ariel Machine Expert Detergent",
    "representative": true,
    "supplied": true
  },
  "15-3": {
    "name": "Fabric Softener",
    "brand": "Comfort",
    "src": "/products/produce/15-3.jpeg",
    "alt": "Fabric Softener",
    "representative": true,
    "supplied": true
  },
  "15-4": {
    "name": "Floor Cleaner",
    "brand": "Lizol",
    "src": "/products/produce/15-4.webp",
    "alt": "Floor Cleaner",
    "representative": true,
    "supplied": true
  },
  "15-5": {
    "name": "G-Look Toilet Cleaner Tablets",
    "brand": "G-Look",
    "src": "/products/produce/15-5.jpeg",
    "alt": "G-Look Toilet Cleaner Tablets",
    "representative": true,
    "supplied": true
  },
  "15-6": {
    "name": "Glass Cleaner",
    "brand": "Brand not specified",
    "src": "/products/produce/15-6.jpeg",
    "alt": "Glass Cleaner",
    "representative": true,
    "supplied": true
  },
  "15-7": {
    "name": "Lizol Disinfectant Surface Cleaner",
    "brand": "Lizol",
    "src": "/products/produce/15-7.jpeg",
    "alt": "Lizol Disinfectant Surface Cleaner",
    "representative": true,
    "supplied": true
  },
  "15-8": {
    "name": "Gala Scrub Pads",
    "brand": "Gala",
    "src": "/products/produce/15-8.jpg",
    "alt": "Gala Scrub Pads",
    "representative": true,
    "supplied": true
  },
  "15-9": {
    "name": "Garbage Bags",
    "brand": "Presto!",
    "src": "/products/produce/15-9.jpeg",
    "alt": "Garbage Bags",
    "representative": true,
    "supplied": true
  },
  "15-10": {
    "name": "Kitchen Wipes",
    "brand": "Brand not specified",
    "src": "/products/produce/15-10.jpeg",
    "alt": "Kitchen Wipes",
    "representative": true,
    "supplied": true
  },
  "15-11": {
    "name": "Microfiber Cloth",
    "brand": "Gala",
    "src": "/products/produce/15-11.jpeg",
    "alt": "Microfiber Cloth",
    "representative": true,
    "supplied": true
  },
  "15-12": {
    "name": "Maxx Toilet Cleaner",
    "brand": "Brand not specified",
    "src": "/products/produce/15-12.jpeg",
    "alt": "Maxx Toilet Cleaner",
    "representative": true,
    "supplied": true
  },
  "15-13": {
    "name": "Harpic White & Shine Bleach Cleaner",
    "brand": "Harpic",
    "src": "/products/produce/15-13.jpeg",
    "alt": "Harpic White & Shine Bleach Cleaner",
    "representative": true,
    "supplied": true
  },
  "15-14": {
    "name": "Drain Cleaner",
    "brand": "Pitambari",
    "src": "/products/produce/15-14.jpeg",
    "alt": "Drain Cleaner",
    "representative": true,
    "supplied": true
  },
  "15-15": {
    "name": "Stain Remover",
    "brand": "Brand not specified",
    "src": "/products/produce/15-15.jpeg",
    "alt": "Stain Remover",
    "representative": true,
    "supplied": true
  },
  "15-16": {
    "name": "Washing Brush",
    "brand": "Brand not specified",
    "src": "/products/produce/15-16.jpeg",
    "alt": "Washing Brush",
    "representative": true,
    "supplied": true
  },
  "15-17": {
    "name": "Scotch-Brite Heavy Duty Gloves, Medium",
    "brand": "Scotch-Brite",
    "src": "/products/produce/15-17.jpeg",
    "alt": "Scotch-Brite Heavy Duty Gloves, Medium",
    "representative": true,
    "supplied": true
  },
  "15-18": {
    "name": "Godrej aer Air Freshener Assortment",
    "brand": "Godrej aer",
    "src": "/products/produce/15-18.webp",
    "alt": "Godrej aer Air Freshener Assortment",
    "representative": true,
    "supplied": true
  },
  "15-19": {
    "name": "Scotch-Brite Handheld Scrubber",
    "brand": "Scotch-Brite",
    "src": "/products/produce/15-19.jpeg",
    "alt": "Scotch-Brite Handheld Scrubber",
    "representative": true,
    "supplied": true
  },
  "16-0": {
    "name": "Perfetto Kitchen Towel Rolls",
    "brand": "Perfetto",
    "src": "/products/produce/16-0.jpeg",
    "alt": "Perfetto Kitchen Towel Rolls",
    "representative": true,
    "supplied": true
  },
  "16-1": {
    "name": "Aluminium Foil",
    "brand": "Home Fresh",
    "src": "/products/produce/16-1.jpeg",
    "alt": "Aluminium Foil",
    "representative": true,
    "supplied": true
  },
  "16-2": {
    "name": "Cling Film",
    "brand": "Brand not specified",
    "src": "/products/produce/16-2.jpeg",
    "alt": "Cling Film",
    "representative": true,
    "supplied": true
  },
  "16-3": {
    "name": "Storage Containers",
    "brand": "Brand not specified",
    "src": "/products/produce/16-3.jpeg",
    "alt": "Storage Containers",
    "representative": true,
    "supplied": true
  },
  "16-4": {
    "name": "Water Bottle",
    "brand": "Milton",
    "src": "/products/produce/16-4.jpeg",
    "alt": "Water Bottle",
    "representative": true,
    "supplied": true
  },
  "16-5": {
    "name": "Stainless Steel Tiffin Box",
    "brand": "Milton",
    "src": "/products/produce/16-5.jpeg",
    "alt": "Stainless Steel Tiffin Box",
    "representative": true,
    "supplied": true
  },
  "16-6": {
    "name": "Printed Food Packing Sheets Roll",
    "brand": "Brand not specified",
    "src": "/products/produce/16-6.jpeg",
    "alt": "Printed Food Packing Sheets Roll",
    "representative": true,
    "supplied": true
  },
  "16-7": {
    "name": "Toothpicks",
    "brand": "Brand not specified",
    "src": "/products/produce/16-7.jpeg",
    "alt": "Toothpicks",
    "representative": true,
    "supplied": true
  },
  "16-8": {
    "name": "Safety Matchbox",
    "brand": "Brand not specified",
    "src": "/products/produce/16-8.jpeg",
    "alt": "Safety Matchbox",
    "representative": true,
    "supplied": true
  },
  "16-9": {
    "name": "VT 250 Inverter Battery",
    "brand": "Brand not specified",
    "src": "/products/produce/16-9.jpeg",
    "alt": "VT 250 Inverter Battery",
    "representative": true,
    "supplied": true
  },
  "16-10": {
    "name": "Polycab LED Bulb",
    "brand": "Polycab",
    "src": "/products/produce/16-10.jpeg",
    "alt": "Polycab LED Bulb",
    "representative": true,
    "supplied": true
  },
  "16-11": {
    "name": "Stainless Steel Pedal Bin",
    "brand": "Brand not specified",
    "src": "/products/produce/16-11.jpeg",
    "alt": "Stainless Steel Pedal Bin",
    "representative": true,
    "supplied": true
  },
  "16-12": {
    "name": "Food Wrap",
    "brand": "Mistique",
    "src": "/products/produce/16-12.jpeg",
    "alt": "Food Wrap",
    "representative": true,
    "supplied": true
  },
  "16-13": {
    "name": "Reusable Tote and Pouch Set",
    "brand": "Brand not specified",
    "src": "/products/produce/16-13.jpeg",
    "alt": "Reusable Tote and Pouch Set",
    "representative": true,
    "supplied": true
  },
  "16-14": {
    "name": "Kitchen Sponge",
    "brand": "Brand not specified",
    "src": "/products/produce/16-14.jpeg",
    "alt": "Kitchen Sponge",
    "representative": true,
    "supplied": true
  },
  "16-15": {
    "name": "Steel Scrubber Multipack",
    "brand": "Gala",
    "src": "/products/produce/16-15.jpeg",
    "alt": "Steel Scrubber Multipack",
    "representative": true,
    "supplied": true
  },
  "16-16": {
    "name": "Clear Storage Jar",
    "brand": "Brand not specified",
    "src": "/products/produce/16-16.jpeg",
    "alt": "Clear Storage Jar",
    "representative": true,
    "supplied": true
  },
  "16-17": {
    "name": "Milton Round Lunch Containers with Carry Case",
    "brand": "Milton",
    "src": "/products/produce/16-17.jpeg",
    "alt": "Milton Round Lunch Containers with Carry Case",
    "representative": true,
    "supplied": true
  },
  "16-18": {
    "name": "Serving Spoons",
    "brand": "Brand not specified",
    "src": "/products/produce/16-18.jpeg",
    "alt": "Serving Spoons",
    "representative": true,
    "supplied": true
  },
  "16-19": {
    "name": "Zip Lock Bags",
    "brand": "Brand not specified",
    "src": "/products/produce/16-19.jpeg",
    "alt": "Zip Lock Bags",
    "representative": true,
    "supplied": true
  },
  "17-0": {
    "name": "Huggies Natural Soft Overnight Pants, XL",
    "brand": "Huggies",
    "src": "/products/produce/17-0.jpeg",
    "alt": "Huggies Natural Soft Overnight Pants, XL",
    "representative": true,
    "supplied": true
  },
  "17-1": {
    "name": "Baby Wipes",
    "brand": "Mamaearth",
    "src": "/products/produce/17-1.jpeg",
    "alt": "Baby Wipes",
    "representative": true,
    "supplied": true
  },
  "17-2": {
    "name": "Baby Lotion",
    "brand": "Himalaya",
    "src": "/products/produce/17-2.jpeg",
    "alt": "Baby Lotion",
    "representative": true,
    "supplied": true
  },
  "17-3": {
    "name": "Milky Soft Baby Shampoo",
    "brand": "Mother Sparsh",
    "src": "/products/produce/17-3.jpeg",
    "alt": "Milky Soft Baby Shampoo",
    "representative": true,
    "supplied": true
  },
  "17-4": {
    "name": "Johnson’s Baby Soap",
    "brand": "Johnson’s",
    "src": "/products/produce/17-4.webp",
    "alt": "Johnson’s Baby Soap",
    "representative": true,
    "supplied": true
  },
  "17-5": {
    "name": "Mamaearth Baby Shampoo",
    "brand": "Mamaearth",
    "src": "/products/produce/17-5.jpeg",
    "alt": "Mamaearth Baby Shampoo",
    "representative": true,
    "supplied": true
  },
  "17-6": {
    "name": "Johnson’s Baby Oil and Hair Oil",
    "brand": "Johnson’s",
    "src": "/products/produce/17-6.jpeg",
    "alt": "Johnson’s Baby Oil and Hair Oil",
    "representative": true,
    "supplied": true
  },
  "17-7": {
    "name": "Johnson’s Baby Cream",
    "brand": "Johnson’s",
    "src": "/products/produce/17-7.jpeg",
    "alt": "Johnson’s Baby Cream",
    "representative": true,
    "supplied": true
  },
  "17-8": {
    "name": "Baby Wash",
    "brand": "Johnson’s",
    "src": "/products/produce/17-8.jpeg",
    "alt": "Baby Wash",
    "representative": true,
    "supplied": true
  },
  "17-9": {
    "name": "Stainless Steel Feeding Bottle",
    "brand": "Brand not specified",
    "src": "/products/produce/17-9.jpeg",
    "alt": "Stainless Steel Feeding Bottle",
    "representative": true,
    "supplied": true
  },
  "17-10": {
    "name": "Easum Moong Dal and Rice Baby Cereal",
    "brand": "Easum",
    "src": "/products/produce/17-10.jpeg",
    "alt": "Easum Moong Dal and Rice Baby Cereal",
    "representative": true,
    "supplied": true
  },
  "17-11": {
    "name": "Himalaya Diaper Rash Cream",
    "brand": "Himalaya",
    "src": "/products/produce/17-11.jpeg",
    "alt": "Himalaya Diaper Rash Cream",
    "representative": true,
    "supplied": true
  },
  "17-12": {
    "name": "Cotton Buds",
    "brand": "Babyhug",
    "src": "/products/produce/17-12.jpeg",
    "alt": "Cotton Buds",
    "representative": true,
    "supplied": true
  },
  "17-13": {
    "name": "Baby Towel",
    "brand": "Brand not specified",
    "src": "/products/produce/17-13.jpeg",
    "alt": "Baby Towel",
    "representative": true,
    "supplied": true
  },
  "17-14": {
    "name": "Baby Diaper Pants, Large",
    "brand": "Mee Mee",
    "src": "/products/produce/17-14.jpeg",
    "alt": "Baby Diaper Pants, Large",
    "representative": true,
    "supplied": true
  },
  "17-15": {
    "name": "Mamaearth Baby Laundry Detergent",
    "brand": "Mamaearth",
    "src": "/products/produce/17-15.jpeg",
    "alt": "Mamaearth Baby Laundry Detergent",
    "representative": true,
    "supplied": true
  },
  "17-16": {
    "name": "Teething Ring",
    "brand": "Brand not specified",
    "src": "/products/produce/17-16.jpeg",
    "alt": "Teething Ring",
    "representative": true,
    "supplied": true
  },
  "17-17": {
    "name": "Baby Toothbrush",
    "brand": "Pigeon",
    "src": "/products/produce/17-17.jpeg",
    "alt": "Baby Toothbrush",
    "representative": true,
    "supplied": true
  },
  "17-18": {
    "name": "Baby Blanket",
    "brand": "Brand not specified",
    "src": "/products/produce/17-18.jpeg",
    "alt": "Baby Blanket",
    "representative": true,
    "supplied": true
  },
  "17-19": {
    "name": "Baby Tissue",
    "brand": "Brand not specified",
    "src": "/products/produce/17-19.jpeg",
    "alt": "Baby Tissue",
    "representative": true,
    "supplied": true
  },
  "18-0": {
    "name": "Drools Adult Dog Food",
    "brand": "Drools",
    "src": "/products/produce/18-0.jpeg",
    "alt": "Drools Adult Dog Food",
    "representative": true,
    "supplied": true
  },
  "18-1": {
    "name": "Me-O Adult Seafood Cat Food",
    "brand": "Me-O",
    "src": "/products/produce/18-1.jpeg",
    "alt": "Me-O Adult Seafood Cat Food",
    "representative": true,
    "supplied": true
  },
  "18-2": {
    "name": "Pedigree Puppy Chicken, Liver and Vegetable Food",
    "brand": "Pedigree",
    "src": "/products/produce/18-2.jpeg",
    "alt": "Pedigree Puppy Chicken, Liver and Vegetable Food",
    "representative": true,
    "supplied": true
  },
  "18-3": {
    "name": "Kitten Food",
    "brand": "Drools",
    "src": "/products/produce/18-3.jpeg",
    "alt": "Kitten Food",
    "representative": true,
    "supplied": true
  },
  "18-4": {
    "name": "Whiskas Ocean Fish Cat Food",
    "brand": "Whiskas",
    "src": "/products/produce/18-4.jpeg",
    "alt": "Whiskas Ocean Fish Cat Food",
    "representative": true,
    "supplied": true
  },
  "18-5": {
    "name": "Chew Bone",
    "brand": "Pets Empire",
    "src": "/products/produce/18-5.jpeg",
    "alt": "Chew Bone",
    "representative": true,
    "supplied": true
  },
  "18-6": {
    "name": "Drools Cat Litter",
    "brand": "Drools",
    "src": "/products/produce/18-6.jpeg",
    "alt": "Drools Cat Litter",
    "representative": true,
    "supplied": true
  },
  "18-7": {
    "name": "Drools Tick & Flea Shampoo with Brush",
    "brand": "Drools",
    "src": "/products/produce/18-7.jpeg",
    "alt": "Drools Tick & Flea Shampoo with Brush",
    "representative": true,
    "supplied": true
  },
  "18-8": {
    "name": "Drools Creamy Cat Treats",
    "brand": "Drools",
    "src": "/products/produce/18-8.jpeg",
    "alt": "Drools Creamy Cat Treats",
    "representative": true,
    "supplied": true
  },
  "18-9": {
    "name": "Drools Adult Dog Food Chunks in Gravy",
    "brand": "Drools",
    "src": "/products/produce/18-9.jpeg",
    "alt": "Drools Adult Dog Food Chunks in Gravy",
    "representative": true,
    "supplied": true
  },
  "18-10": {
    "name": "Stainless Steel Pet Bowls",
    "brand": "Pets Empire",
    "src": "/products/produce/18-10.jpeg",
    "alt": "Stainless Steel Pet Bowls",
    "representative": true,
    "supplied": true
  },
  "18-11": {
    "name": "Pedigree Adult Mini Dog Food",
    "brand": "Pedigree",
    "src": "/products/produce/18-11.jpeg",
    "alt": "Pedigree Adult Mini Dog Food",
    "representative": true,
    "supplied": true
  },
  "18-12": {
    "name": "Whiskas Tuna in Jelly Adult Cat Food",
    "brand": "Whiskas",
    "src": "/products/produce/18-12.jpeg",
    "alt": "Whiskas Tuna in Jelly Adult Cat Food",
    "representative": true,
    "supplied": true
  },
  "18-13": {
    "name": "Bird Seed",
    "brand": "Brand not specified",
    "src": "/products/produce/18-13.jpeg",
    "alt": "Bird Seed",
    "representative": true,
    "supplied": true
  },
  "18-14": {
    "name": "Sinking Goldfish Pellets",
    "brand": "Brand not specified",
    "src": "/products/produce/18-14.jpeg",
    "alt": "Sinking Goldfish Pellets",
    "representative": true,
    "supplied": true
  },
  "18-15": {
    "name": "Pet Brush",
    "brand": "Brand not specified",
    "src": "/products/produce/18-15.jpeg",
    "alt": "Pet Brush",
    "representative": true,
    "supplied": true
  },
  "18-16": {
    "name": "Tick and Flea Shampoo",
    "brand": "Virbac",
    "src": "/products/produce/18-16.jpeg",
    "alt": "Tick and Flea Shampoo",
    "representative": true,
    "supplied": true
  },
  "18-17": {
    "name": "Pet Toy",
    "brand": "Brand not specified",
    "src": "/products/produce/18-17.webp",
    "alt": "Pet Toy",
    "representative": true,
    "supplied": true
  },
  "18-18": {
    "name": "Litter Scoop",
    "brand": "Brand not specified",
    "src": "/products/produce/18-18.jpeg",
    "alt": "Litter Scoop",
    "representative": true,
    "supplied": true
  },
  "18-19": {
    "name": "Pet Dental Sticks",
    "brand": "Absolut Pet",
    "src": "/products/produce/18-19.jpeg",
    "alt": "Pet Dental Sticks",
    "representative": true,
    "supplied": true
  },
  "19-0": {
    "name": "Cycle Rose and Jasmine Agarbatti",
    "brand": "Cycle",
    "src": "/products/produce/19-0.webp",
    "alt": "Cycle Rose and Jasmine Agarbatti",
    "representative": true,
    "supplied": true
  },
  "19-1": {
    "name": "Dhoop Sticks",
    "brand": "Rajnigandha",
    "src": "/products/produce/19-1.jpeg",
    "alt": "Dhoop Sticks",
    "representative": true,
    "supplied": true
  },
  "19-2": {
    "name": "Camphor",
    "brand": "Brand not specified",
    "src": "/products/produce/19-2.jpeg",
    "alt": "Camphor",
    "representative": true,
    "supplied": true
  },
  "19-3": {
    "name": "Cotton Wicks",
    "brand": "Brand not specified",
    "src": "/products/produce/19-3.jpeg",
    "alt": "Cotton Wicks",
    "representative": true,
    "supplied": true
  },
  "19-4": {
    "name": "Pooja Oil",
    "brand": "Brand not specified",
    "src": "/products/produce/19-4.jpeg",
    "alt": "Pooja Oil",
    "representative": true,
    "supplied": true
  },
  "19-5": {
    "name": "Ghee Diya",
    "brand": "Brand not specified",
    "src": "/products/produce/19-5.jpeg",
    "alt": "Ghee Diya",
    "representative": true,
    "supplied": true
  },
  "19-6": {
    "name": "Jar of Ghee",
    "brand": "Brand not specified",
    "src": "/products/produce/19-6.jpeg",
    "alt": "Jar of Ghee",
    "representative": true,
    "supplied": true
  },
  "19-7": {
    "name": "Scented Incense Sticks",
    "brand": "Brand not specified",
    "src": "/products/produce/19-7.jpeg",
    "alt": "Scented Incense Sticks",
    "representative": true,
    "supplied": true
  },
  "19-8": {
    "name": "Fresh Turmeric Root",
    "brand": "Brand not specified",
    "src": "/products/produce/19-8.jpeg",
    "alt": "Fresh Turmeric Root",
    "representative": true,
    "supplied": true
  },
  "19-9": {
    "name": "Sandalwood Powder",
    "brand": "Brand not specified",
    "src": "/products/produce/19-9.jpeg",
    "alt": "Sandalwood Powder",
    "representative": true,
    "supplied": true
  },
  "19-10": {
    "name": "Cotton Wicks Pack",
    "brand": "Brand not specified",
    "src": "/products/produce/19-10.jpeg",
    "alt": "Cotton Wicks Pack",
    "representative": true,
    "supplied": true
  },
  "19-11": {
    "name": "White Rangoli Powder",
    "brand": "Brand not specified",
    "src": "/products/produce/19-11.jpeg",
    "alt": "White Rangoli Powder",
    "representative": true,
    "supplied": true
  },
  "19-12": {
    "name": "Pooja Thali Set",
    "brand": "Brand not specified",
    "src": "/products/produce/19-12.jpeg",
    "alt": "Pooja Thali Set",
    "representative": true,
    "supplied": true
  },
  "19-13": {
    "name": "Bel Murabba",
    "brand": "Brand not specified",
    "src": "/products/produce/19-13.jpeg",
    "alt": "Bel Murabba",
    "representative": true,
    "supplied": true
  },
  "19-14": {
    "name": "Pooja Product Twin Pack",
    "brand": "Brand not specified",
    "src": "/products/produce/19-14.jpeg",
    "alt": "Pooja Product Twin Pack",
    "representative": true,
    "supplied": true
  },
  "19-15": {
    "name": "Rose Water",
    "brand": "Dabur",
    "src": "/products/produce/19-15.jpeg",
    "alt": "Rose Water",
    "representative": true,
    "supplied": true
  },
  "19-16": {
    "name": "Mangaldeep Sambrani",
    "brand": "Mangaldeep",
    "src": "/products/produce/19-16.jpeg",
    "alt": "Mangaldeep Sambrani",
    "representative": true,
    "supplied": true
  },
  "19-17": {
    "name": "Hawan Samagri",
    "brand": "Brand not specified",
    "src": "/products/produce/19-17.jpeg",
    "alt": "Hawan Samagri",
    "representative": true,
    "supplied": true
  },
  "19-18": {
    "name": "Homelites Matchbox Value Pack",
    "brand": "Homelites",
    "src": "/products/produce/19-18.jpeg",
    "alt": "Homelites Matchbox Value Pack",
    "representative": true,
    "supplied": true
  },
  "19-19": {
    "name": "Flower Garland",
    "brand": "Brand not specified",
    "src": "/products/produce/19-19.jpeg",
    "alt": "Flower Garland",
    "representative": true,
    "supplied": true
  }
};

/** Returns the catalogue photo entry for a product, or null (→ placeholder). */
export function imageFor(product) {
  const e = PRODUCT_IMAGES[product.id];
  if (!e || !e.src || (!e.supplied && (!e.verified || !e.license))) return null;
  if (e.name !== product.name || e.brand !== product.brand) return null; // catalogue changed since verification
  return e;
}
