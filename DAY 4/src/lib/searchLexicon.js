// Search vocabulary for FreshNest. Plain data: edit freely, no code changes needed elsewhere.
// Everything here is matched after lower-casing, de-punctuating and singularising (see search.js),
// so "Eggs", "egg" and "EGG" are all the same entry.

// 1) TRUE SYNONYMS: any phrase in a group can stand in for any other (two-way).
//    Matches reached this way rank below direct name matches.
export const SYNONYM_GROUPS = [
  ['egg', 'anda'],
  ['curd', 'dahi', 'yogurt', 'yoghurt'],
  ['paneer', 'cottage cheese'],
  ['atta', 'aata', 'wheat flour', 'whole wheat flour', 'chapati flour', 'roti flour'],
  ['ghee', 'clarified butter'],
  ['buttermilk', 'chaas', 'chaach'],
  ['biscuit', 'cookie'],
  ['coca cola', 'coke', 'cocacola'],
  ['noodle', 'ramen', 'chowmein'],
  ['chip', 'crisp'],
  ['chocolate', 'choco'],
  ['sooji', 'suji', 'rava', 'rawa', 'semolina'],
  ['besan', 'gram flour', 'chickpea flour'],
  ['poha', 'flattened rice', 'aval'],
  ['sabudana', 'sago'],
  ['ragi', 'finger millet', 'nachni'],
  ['jowar', 'sorghum'],
  ['dalia', 'broken wheat', 'cracked wheat'],
  ['makhana', 'fox nut', 'lotus seed'],
  ['kabuli chana', 'chole', 'chickpea'],
  ['rajma', 'kidney bean'],
  ['masoor dal', 'red lentil'],
  ['toor dal', 'arhar dal', 'tur dal'],
  ['moong dal', 'mung dal'],
  ['urad dal', 'black gram'],
  ['rice', 'chawal'],
  ['dal', 'daal', 'dhal', 'lentil', 'pulse'],
  ['tomato', 'tamatar'], ['onion', 'pyaz', 'pyaaz'], ['potato', 'aloo', 'batata'], ['banana', 'kela'],
  ['mango', 'aam'], ['apple', 'seb'], ['orange', 'santra', 'narangi'], ['grape', 'angoor'], ['papaya', 'papita'],
  ['watermelon', 'tarbooz'], ['guava', 'amrood'], ['pomegranate', 'anar'], ['coconut', 'nariyal'],
  ['carrot', 'gajar'], ['cucumber', 'kheera'], ['spinach', 'palak'], ['coriander', 'dhania', 'cilantro'],
  ['chilli', 'chili', 'mirchi', 'chile'],
  ['honey', 'shahad'], ['salt', 'namak'], ['turmeric', 'haldi'], ['cumin', 'jeera'], ['cardamom', 'elaichi'],
  ['cinnamon', 'dalchini'], ['pepper', 'kali mirch'],
  ['tea', 'chai'], ['coffee', 'kaapi'],
  ['almond', 'badam'], ['cashew', 'kaju'], ['pistachio', 'pista'], ['walnut', 'akhrot'], ['raisin', 'kishmish'],
  ['ladoo', 'laddu', 'laddoo', 'ladu'],
  ['handwash', 'hand wash'], ['dishwash', 'dish wash'], ['facewash', 'face wash'], ['bodywash', 'body wash'],
  ['cornflakes', 'corn flakes'], ['toothpaste', 'dentifrice'], ['diaper', 'nappy'],
  ['sanitary pad', 'sanitary napkin', 'period pad'],
  ['detergent', 'washing powder', 'laundry powder'],
  ['agarbatti', 'agarbathi', 'incense', 'incense stick'],
  ['camphor', 'kapoor', 'karpooram'], ['kumkum', 'kumkuma', 'vermilion'], ['rose water', 'gulab jal'],
  ['bin', 'dustbin', 'trash can'], ['foil', 'aluminum foil'],
];

// 2) RELATED TERMS (one-way): a search for the key also shows these, ranked after direct matches.
export const RELATED = {
  biscuit: ['cracker', 'rusk'],
  bread: ['loaf', 'pav', 'bun', 'breadstick'],
  atta: ['flour'],
  milk: ['buttermilk'],
};

// 3) AISLE GROUPS: the whole query must name the aisle (e.g. "dairy", "snacks", "pooja items").
//    A word that is only *inside* a category name (the "eggs" in "Dairy, Bread & Eggs") does NOT trigger this.
const FRUIT = /mango|banana|apple|orange|grape|pomegranate|papaya|watermelon|sweet lime|guava|avocado|coconut/i;
const inCat = c => p => p.category === c;
const group = (category, aliases, test) => ({ category, aliases, test: test || inCat(category) });

export const GROUPS = [
  group('Fruits & Vegetables', ['fruit', 'fruits'], p => p.category === 'Fruits & Vegetables' && FRUIT.test(p.name)),
  group('Fruits & Vegetables', ['vegetable', 'vegetables', 'veggies', 'veg', 'sabzi'], p => p.category === 'Fruits & Vegetables' && !FRUIT.test(p.name)),
  group('Fruits & Vegetables', ['produce', 'fresh produce', 'fruits and vegetables', 'fruits and veggies']),
  group('Dairy, Bread & Eggs', ['dairy', 'dairy products', 'dairy bread and eggs', 'dairy bread eggs'], p => p.category === 'Dairy, Bread & Eggs' && !/bread|bun|pav|egg|batter/i.test(p.name)),
  group('Atta, Rice & Dal', ['staples', 'grains', 'atta rice and dal', 'atta rice dal']),
  group('Oil, Ghee & Masala', ['spices', 'spice', 'masalas', 'oil ghee and masala'], p => p.category === 'Oil, Ghee & Masala' && !/oil|ghee/i.test(p.name)),
  group('Snacks & Munchies', ['snacks', 'munchies', 'namkeen', 'snacks and munchies']),
  group('Sweet Tooth', ['sweets', 'mithai', 'desserts', 'sweet tooth']),
  group('Cold Drinks & Juices', ['cold drinks', 'soft drinks', 'cool drinks', 'cooldrink', 'beverages', 'drinks', 'cold drinks and juices']),
  group('Breakfast & Sauces', ['breakfast', 'sauces', 'spreads', 'breakfast and sauces']),
  group('Instant & Frozen Food', ['instant food', 'frozen food', 'frozen', 'ready to eat', 'instant and frozen food']),
  group('Bakery & Cakes', ['bakery', 'baked goods', 'bakery and cakes']),
  group('Tea, Coffee & Health Drinks', ['tea and coffee', 'health drinks', 'health drink']),
  group('Dry Fruits & Nuts', ['dry fruits', 'dry fruit', 'dryfruits', 'dryfruit', 'dry fruits and nuts', 'mewa']),
  group('Chocolates & Candies', ['candy', 'candies', 'confectionery', 'chocolates and candies']),
  group('Personal Care', ['personal care', 'grooming', 'skincare', 'skin care', 'haircare', 'hair care']),
  group('Bath & Body', ['bath and body', 'bath', 'body care']),
  group('Cleaning Essentials', ['cleaning', 'cleaning supplies', 'household', 'home care', 'cleaning essentials']),
  group('Home & Kitchen', ['home and kitchen', 'kitchen', 'kitchenware']),
  group('Baby Care', ['baby', 'baby care', 'infant', 'newborn']),
  group('Pet Supplies', ['pet', 'pets', 'pet supplies', 'pet care']),
  group('Pooja Essentials', ['pooja', 'puja', 'pooja items', 'puja items', 'pooja samagri', 'puja samagri', 'festive']),
];

// 4) Words that add nothing on their own ("fresh milk online"). They are only dropped when the full query finds nothing.
export const SOFT_WORDS = ['fresh', 'pure', 'best', 'good', 'new', 'buy', 'online', 'product', 'products', 'item', 'items', 'pack', 'near', 'me', 'quality', 'premium', 'grocery', 'groceries'];

// 5) Pet-aisle products are only shown for general queries (e.g. "biscuit") when the query has pet context.
export const PET_CONTEXT = ['pet', 'pets', 'dog', 'dogs', 'puppy', 'puppies', 'cat', 'cats', 'kitten', 'kittens', 'bird', 'fish', 'litter', 'pooch', 'tick'];
