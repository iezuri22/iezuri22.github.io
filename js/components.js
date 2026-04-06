// ============================================================
// COMPONENTS PAGE - js/components.js
// Component library, Build a Plate, Cook Mode, and Combos
// Depends on js/shared.js for: CONFIG, state, storage, esc,
// capitalize, navigateTo, renderDesktopSidebar, renderBottomNav,
// getAppShellClass, renderNav, renderDesktopPageTitle,
// loadAllState, persistState, persistStateNow, openModal,
// closeModal, showToast, saveToLS, loadFromLS, emptyState
// ============================================================

// ============================================================
// SECTION 1: CATEGORY CONSTANTS
// ============================================================
const COMPONENT_CATEGORIES = ['Protein', 'Veggie', 'Starch', 'Seasoning', 'Sauce'];

const COMPONENT_CATEGORY_COLORS = {
  'Protein': '#e85d5d',
  'Veggie': '#32d74b',
  'Starch': '#ffd60a',
  'Seasoning': '#ff9f0a',
  'Sauce': '#5e5ce6',
  'Marinade': '#bf5af2',
  'Finishing': '#64d2ff'
};

const COMPONENT_CATEGORY_GRADIENTS = {
  'Protein': 'linear-gradient(135deg, #c0392b, #6b1a1a)',
  'Veggie': 'linear-gradient(135deg, #27ae60, #1a5c34)',
  'Starch': 'linear-gradient(135deg, #d4a017, #6b5a0d)',
  'Seasoning': 'linear-gradient(135deg, #e67e22, #7d4512)',
  'Sauce': 'linear-gradient(135deg, #5e5ce6, #2d2b7a)',
  'Marinade': 'linear-gradient(135deg, #9b59b6, #4a235a)',
  'Finishing': 'linear-gradient(135deg, #3498db, #1a4d6b)'
};

const PLATE_SLOTS = [
  { role: 'protein', label: 'Protein', category: 'Protein', color: '#e85d5d', required: false },
  { role: 'veggie', label: 'Veggie', category: 'Veggie', color: '#32d74b', required: false },
  { role: 'veggie2', label: 'Veggie 2', category: 'Veggie', color: '#32d74b', required: false },
  { role: 'starch', label: 'Starch', category: 'Starch', color: '#ffd60a', required: false },
  { role: 'sauce', label: 'Sauce', category: 'Sauce', color: '#5e5ce6', required: false }
];

// Flavor pairing tips — keyed by protein name fragment → veggie/side name fragment → tip string
const FLAVOR_PAIRINGS = {
  "chicken": {
    "broccoli": "Garlic and lemon brighten this up",
    "sweet potato": "Cinnamon on the sweet potato, paprika on the chicken",
    "asparagus": "A squeeze of lemon ties it together",
    "bell pepper": "Fajita vibes — add some cumin"
  },
  "salmon": {
    "asparagus": "Try a dill yogurt sauce on the side",
    "broccoli": "Soy-ginger glaze works great on both",
    "sweet potato": "Maple glaze connects these two"
  },
  "steak": {
    "potato": "Chimichurri drizzle is the move",
    "asparagus": "Blue cheese crumbles if you're feeling it",
    "mushroom": "Red wine reduction or just garlic butter"
  },
  "shrimp": {
    "corn": "Old Bay and butter, classic",
    "broccoli": "Garlic butter sauce on everything",
    "zucchini": "Lemon herb drizzle"
  },
  "pork": {
    "apple": "Apple sauce or apple slaw on the side",
    "sweet potato": "Brown sugar and cinnamon theme",
    "brussels sprouts": "Balsamic glaze ties it together"
  },
  "tofu": {
    "broccoli": "Sesame ginger sauce is perfect here",
    "bell pepper": "Stir-fry vibes — add soy and sesame",
    "snap peas": "Peanut sauce for dipping"
  }
};

// ============================================================
// SECTION 2: STARTER COMPONENTS DATA
// ============================================================
function _makeId(slug) { return 'component_starter_' + slug; }
function _now() { return '2026-01-01T00:00:00.000Z'; }

const STARTER_COMPONENTS = [
  // ── PROTEINS (15) ──────────────────────────────────────
  {
    id: _makeId('chicken_thighs_bone_in'), type: 'component', name: 'Chicken Thighs (bone-in)',
    category: 'Protein', subcategory: 'Poultry', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p1s1', action: 'Pat chicken thighs dry with paper towels', duration: 2, type: 'prep' },
      { id: 'p1s2', action: 'Season generously on both sides', duration: 2, type: 'season' },
      { id: 'p1s3', action: 'Place skin-side down in air fryer basket', duration: 1, type: 'cook' },
      { id: 'p1s4', action: 'Cook at 400F for 10 minutes', duration: 10, type: 'cook' },
      { id: 'p1s5', action: 'Flip skin-side up, cook another 10 minutes', duration: 10, type: 'cook' },
      { id: 'p1s6', action: 'Rest 5 minutes before serving', duration: 5, type: 'rest' }
    ],
    airFryer: { temp: 400, cookTime: 20, flipHalfway: true, flipAt: 10, shakeInterval: null, notes: 'Skin-side down first for crispier skin' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, garlic powder, paprika, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['weeknight', 'high-protein'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('chicken_breast'), type: 'component', name: 'Chicken Breast',
    category: 'Protein', subcategory: 'Poultry', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p2s1', action: 'Butterfly or pound to even thickness', duration: 3, type: 'prep' },
      { id: 'p2s2', action: 'Brush with oil and season both sides', duration: 2, type: 'season' },
      { id: 'p2s3', action: 'Place in air fryer basket in single layer', duration: 1, type: 'cook' },
      { id: 'p2s4', action: 'Cook at 380F for 9 minutes', duration: 9, type: 'cook' },
      { id: 'p2s5', action: 'Flip and cook another 9 minutes', duration: 9, type: 'cook' },
      { id: 'p2s6', action: 'Rest 5 minutes, then slice', duration: 5, type: 'rest' }
    ],
    airFryer: { temp: 380, cookTime: 18, flipHalfway: true, flipAt: 9, shakeInterval: null, notes: 'Pound to even thickness for even cooking' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, Italian seasoning, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['meal-prep', 'high-protein'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('chicken_wings'), type: 'component', name: 'Chicken Wings',
    category: 'Protein', subcategory: 'Poultry', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p3s1', action: 'Pat wings completely dry', duration: 2, type: 'prep' },
      { id: 'p3s2', action: 'Toss with oil and seasoning', duration: 2, type: 'season' },
      { id: 'p3s3', action: 'Arrange in single layer in basket', duration: 1, type: 'cook' },
      { id: 'p3s4', action: 'Cook at 400F for 12 minutes', duration: 12, type: 'cook' },
      { id: 'p3s5', action: 'Shake basket, cook another 12 minutes', duration: 12, type: 'cook' },
      { id: 'p3s6', action: 'Toss in sauce if desired', duration: 1, type: 'finish' }
    ],
    airFryer: { temp: 400, cookTime: 24, flipHalfway: false, flipAt: null, shakeInterval: 12, notes: 'Shake basket at halfway for even crispness' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, garlic powder, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['game-day', 'appetizer'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('chicken_tenders'), type: 'component', name: 'Chicken Tenders',
    category: 'Protein', subcategory: 'Poultry', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p4s1', action: 'Pat tenders dry', duration: 1, type: 'prep' },
      { id: 'p4s2', action: 'Season with oil and spices', duration: 2, type: 'season' },
      { id: 'p4s3', action: 'Place in single layer', duration: 1, type: 'cook' },
      { id: 'p4s4', action: 'Cook at 400F for 5 minutes', duration: 5, type: 'cook' },
      { id: 'p4s5', action: 'Flip and cook another 5 minutes', duration: 5, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 10, flipHalfway: true, flipAt: 5, shakeInterval: null, notes: 'Don\'t overcrowd basket' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, garlic powder, onion powder' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['quick', 'kid-friendly'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('salmon_fillet'), type: 'component', name: 'Salmon Fillet',
    category: 'Protein', subcategory: 'Seafood', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p5s1', action: 'Pat salmon dry, check for pin bones', duration: 2, type: 'prep' },
      { id: 'p5s2', action: 'Brush with oil and season', duration: 2, type: 'season' },
      { id: 'p5s3', action: 'Place skin-side down in basket', duration: 1, type: 'cook' },
      { id: 'p5s4', action: 'Cook at 390F for 10 minutes', duration: 10, type: 'cook' },
      { id: 'p5s5', action: 'Rest 2 minutes', duration: 2, type: 'rest' }
    ],
    airFryer: { temp: 390, cookTime: 10, flipHalfway: false, flipAt: null, shakeInterval: null, notes: 'No flip needed — skin-side down entire time' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, lemon pepper, dill' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['healthy', 'omega-3'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('shrimp'), type: 'component', name: 'Shrimp',
    category: 'Protein', subcategory: 'Seafood', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p6s1', action: 'Peel and devein shrimp, pat dry', duration: 5, type: 'prep' },
      { id: 'p6s2', action: 'Toss with oil and seasoning', duration: 2, type: 'season' },
      { id: 'p6s3', action: 'Spread in single layer', duration: 1, type: 'cook' },
      { id: 'p6s4', action: 'Cook at 400F for 4 minutes', duration: 4, type: 'cook' },
      { id: 'p6s5', action: 'Shake basket, cook another 4 minutes', duration: 4, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 8, flipHalfway: false, flipAt: null, shakeInterval: 4, notes: 'Shake at 4 min — shrimp curl when done' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, Old Bay, lemon juice' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['quick', 'seafood'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('steak_tips'), type: 'component', name: 'Steak Tips',
    category: 'Protein', subcategory: 'Beef', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p7s1', action: 'Cut steak into 1-inch cubes', duration: 3, type: 'prep' },
      { id: 'p7s2', action: 'Toss with oil and steak seasoning', duration: 2, type: 'season' },
      { id: 'p7s3', action: 'Spread in single layer', duration: 1, type: 'cook' },
      { id: 'p7s4', action: 'Cook at 400F for 5 minutes', duration: 5, type: 'cook' },
      { id: 'p7s5', action: 'Shake basket, cook 5 more minutes', duration: 5, type: 'cook' },
      { id: 'p7s6', action: 'Rest 3 minutes', duration: 3, type: 'rest' }
    ],
    airFryer: { temp: 400, cookTime: 10, flipHalfway: false, flipAt: null, shakeInterval: 5, notes: 'For medium-rare; add 2 min for medium' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, steak seasoning, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['high-protein', 'date-night'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('pork_chops'), type: 'component', name: 'Pork Chops',
    category: 'Protein', subcategory: 'Pork', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p8s1', action: 'Pat pork chops dry', duration: 1, type: 'prep' },
      { id: 'p8s2', action: 'Brush with oil, season both sides', duration: 2, type: 'season' },
      { id: 'p8s3', action: 'Place in air fryer basket', duration: 1, type: 'cook' },
      { id: 'p8s4', action: 'Cook at 400F for 6 minutes', duration: 6, type: 'cook' },
      { id: 'p8s5', action: 'Flip and cook another 6 minutes', duration: 6, type: 'cook' },
      { id: 'p8s6', action: 'Rest 5 minutes', duration: 5, type: 'rest' }
    ],
    airFryer: { temp: 400, cookTime: 12, flipHalfway: true, flipAt: 6, shakeInterval: null, notes: 'Internal temp should reach 145F' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, garlic powder, onion powder, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['weeknight'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('italian_sausage'), type: 'component', name: 'Italian Sausage',
    category: 'Protein', subcategory: 'Pork', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p9s1', action: 'Prick sausages with fork a few times', duration: 1, type: 'prep' },
      { id: 'p9s2', action: 'Place in air fryer basket', duration: 1, type: 'cook' },
      { id: 'p9s3', action: 'Cook at 400F for 6 minutes', duration: 6, type: 'cook' },
      { id: 'p9s4', action: 'Flip and cook another 6 minutes', duration: 6, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 12, flipHalfway: true, flipAt: 6, shakeInterval: null, notes: 'Internal temp should reach 160F' },
    defaultSeasoning: { componentIds: [], freeText: 'None (pre-seasoned)' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['easy', 'meal-prep'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('ground_turkey_patties'), type: 'component', name: 'Ground Turkey Patties',
    category: 'Protein', subcategory: 'Poultry', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p10s1', action: 'Form into 1/2 inch thick patties', duration: 3, type: 'prep' },
      { id: 'p10s2', action: 'Season both sides', duration: 2, type: 'season' },
      { id: 'p10s3', action: 'Place in air fryer basket', duration: 1, type: 'cook' },
      { id: 'p10s4', action: 'Cook at 375F for 7 minutes', duration: 7, type: 'cook' },
      { id: 'p10s5', action: 'Flip and cook another 7 minutes', duration: 7, type: 'cook' }
    ],
    airFryer: { temp: 375, cookTime: 14, flipHalfway: true, flipAt: 7, shakeInterval: null, notes: 'Make a thumbprint in center to prevent puffing' },
    defaultSeasoning: { componentIds: [], freeText: 'Worcestershire, garlic, onion powder, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['lean', 'high-protein'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('tilapia'), type: 'component', name: 'Tilapia',
    category: 'Protein', subcategory: 'Seafood', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p11s1', action: 'Pat fillets dry', duration: 1, type: 'prep' },
      { id: 'p11s2', action: 'Brush with oil and season', duration: 2, type: 'season' },
      { id: 'p11s3', action: 'Place in basket — use parchment if desired', duration: 1, type: 'cook' },
      { id: 'p11s4', action: 'Cook at 400F for 10 minutes', duration: 10, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 10, flipHalfway: false, flipAt: null, shakeInterval: null, notes: 'No flip needed — delicate fish' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, lemon pepper, garlic powder' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['quick', 'light'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('lamb_chops'), type: 'component', name: 'Lamb Chops',
    category: 'Protein', subcategory: 'Lamb', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p12s1', action: 'Bring to room temperature 15 min', duration: 15, type: 'prep' },
      { id: 'p12s2', action: 'Rub with oil, rosemary, garlic', duration: 2, type: 'season' },
      { id: 'p12s3', action: 'Place in air fryer basket', duration: 1, type: 'cook' },
      { id: 'p12s4', action: 'Cook at 400F for 5 minutes', duration: 5, type: 'cook' },
      { id: 'p12s5', action: 'Flip and cook another 5 minutes', duration: 5, type: 'cook' },
      { id: 'p12s6', action: 'Rest 5 minutes', duration: 5, type: 'rest' }
    ],
    airFryer: { temp: 400, cookTime: 10, flipHalfway: true, flipAt: 5, shakeInterval: null, notes: 'For medium-rare; add 2-3 min for medium' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, rosemary, garlic, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['date-night', 'special'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('tofu_pressed_cubed'), type: 'component', name: 'Tofu (pressed, cubed)',
    category: 'Protein', subcategory: 'Plant-Based', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p13s1', action: 'Press tofu 15 min, cut into cubes', duration: 18, type: 'prep' },
      { id: 'p13s2', action: 'Toss with sesame oil and soy sauce', duration: 2, type: 'season' },
      { id: 'p13s3', action: 'Spread in single layer', duration: 1, type: 'cook' },
      { id: 'p13s4', action: 'Cook at 400F for 7 minutes', duration: 7, type: 'cook' },
      { id: 'p13s5', action: 'Shake basket, cook 8 more minutes', duration: 8, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 15, flipHalfway: false, flipAt: null, shakeInterval: 7, notes: 'Extra-firm tofu works best; press well for crispiness' },
    defaultSeasoning: { componentIds: [], freeText: 'Sesame oil, soy sauce, garlic' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['vegan', 'high-protein'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('bacon'), type: 'component', name: 'Bacon',
    category: 'Protein', subcategory: 'Pork', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p14s1', action: 'Lay strips in single layer — slight overlap OK', duration: 1, type: 'prep' },
      { id: 'p14s2', action: 'Cook at 400F for 8 minutes', duration: 8, type: 'cook' },
      { id: 'p14s3', action: 'Transfer to paper towel to drain', duration: 1, type: 'finish' }
    ],
    airFryer: { temp: 400, cookTime: 8, flipHalfway: false, flipAt: null, shakeInterval: null, notes: 'No flip needed; adjust time for thickness' },
    defaultSeasoning: { componentIds: [], freeText: 'None' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['breakfast', 'quick'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('hard_boiled_eggs'), type: 'component', name: 'Hard Boiled Eggs',
    category: 'Protein', subcategory: 'Eggs', cookingMethod: 'Air Fry',
    steps: [
      { id: 'p15s1', action: 'Place eggs in air fryer basket', duration: 1, type: 'cook' },
      { id: 'p15s2', action: 'Cook at 270F for 15 minutes', duration: 15, type: 'cook' },
      { id: 'p15s3', action: 'Transfer to ice bath for 5 minutes', duration: 5, type: 'rest' },
      { id: 'p15s4', action: 'Peel and serve', duration: 2, type: 'finish' }
    ],
    airFryer: { temp: 270, cookTime: 15, flipHalfway: false, flipAt: null, shakeInterval: null, notes: 'Ice bath is key for easy peeling' },
    defaultSeasoning: { componentIds: [], freeText: 'None' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['meal-prep', 'breakfast', 'snack'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },

  // ── VEGGIES (20) ──────────────────────────────────────
  {
    id: _makeId('broccoli_florets'), type: 'component', name: 'Broccoli Florets',
    category: 'Veggie', subcategory: 'Cruciferous', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v1s1', action: 'Cut into even-sized florets', duration: 3, type: 'prep' },
      { id: 'v1s2', action: 'Toss with oil and garlic powder', duration: 2, type: 'season' },
      { id: 'v1s3', action: 'Spread in basket', duration: 1, type: 'cook' },
      { id: 'v1s4', action: 'Cook at 375F for 4 minutes', duration: 4, type: 'cook' },
      { id: 'v1s5', action: 'Shake and cook 4 more minutes', duration: 4, type: 'cook' }
    ],
    airFryer: { temp: 375, cookTime: 8, flipHalfway: false, flipAt: null, shakeInterval: 4, notes: 'Don\'t overcrowd — cook in batches if needed' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, garlic powder, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['healthy', 'weeknight'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('sweet_potato_cubes'), type: 'component', name: 'Sweet Potato Cubes',
    category: 'Veggie', subcategory: 'Root Veggie', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v2s1', action: 'Peel and cut into 3/4-inch cubes', duration: 5, type: 'prep' },
      { id: 'v2s2', action: 'Toss with oil and cinnamon', duration: 2, type: 'season' },
      { id: 'v2s3', action: 'Spread in single layer', duration: 1, type: 'cook' },
      { id: 'v2s4', action: 'Cook at 400F for 8 minutes', duration: 8, type: 'cook' },
      { id: 'v2s5', action: 'Shake basket, cook 7 more minutes', duration: 7, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 15, flipHalfway: false, flipAt: null, shakeInterval: 8, notes: 'Cut evenly for consistent cooking' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, cinnamon, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['healthy', 'meal-prep'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('asparagus'), type: 'component', name: 'Asparagus',
    category: 'Veggie', subcategory: 'Green Veggie', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v3s1', action: 'Trim woody ends', duration: 2, type: 'prep' },
      { id: 'v3s2', action: 'Toss with oil and garlic', duration: 2, type: 'season' },
      { id: 'v3s3', action: 'Lay flat in basket', duration: 1, type: 'cook' },
      { id: 'v3s4', action: 'Cook at 400F for 7 minutes', duration: 7, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 7, flipHalfway: false, flipAt: null, shakeInterval: null, notes: 'No flip needed — thicker spears may need 1-2 min extra' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, garlic, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['quick', 'elegant'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('brussels_sprouts'), type: 'component', name: 'Brussels Sprouts (halved)',
    category: 'Veggie', subcategory: 'Cruciferous', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v4s1', action: 'Trim and halve sprouts', duration: 4, type: 'prep' },
      { id: 'v4s2', action: 'Toss with oil and balsamic', duration: 2, type: 'season' },
      { id: 'v4s3', action: 'Place cut-side down in basket', duration: 1, type: 'cook' },
      { id: 'v4s4', action: 'Cook at 375F for 8 minutes', duration: 8, type: 'cook' },
      { id: 'v4s5', action: 'Shake basket, cook 7 more minutes', duration: 7, type: 'cook' }
    ],
    airFryer: { temp: 375, cookTime: 15, flipHalfway: false, flipAt: null, shakeInterval: 8, notes: 'Cut-side down first for better browning' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, balsamic, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['healthy', 'meal-prep'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('bell_peppers'), type: 'component', name: 'Bell Peppers (sliced)',
    category: 'Veggie', subcategory: 'Pepper', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v5s1', action: 'Remove seeds, cut into strips', duration: 3, type: 'prep' },
      { id: 'v5s2', action: 'Toss with oil and S&P', duration: 1, type: 'season' },
      { id: 'v5s3', action: 'Cook at 400F for 4 minutes', duration: 4, type: 'cook' },
      { id: 'v5s4', action: 'Shake, cook 4 more minutes', duration: 4, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 8, flipHalfway: false, flipAt: null, shakeInterval: 4, notes: 'Mix colors for visual appeal' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['colorful', 'fajitas'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('zucchini_rounds'), type: 'component', name: 'Zucchini (rounds)',
    category: 'Veggie', subcategory: 'Squash', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v6s1', action: 'Cut into 1/4-inch rounds', duration: 3, type: 'prep' },
      { id: 'v6s2', action: 'Toss with oil and Italian seasoning', duration: 2, type: 'season' },
      { id: 'v6s3', action: 'Arrange in single layer', duration: 1, type: 'cook' },
      { id: 'v6s4', action: 'Cook at 400F for 5 minutes', duration: 5, type: 'cook' },
      { id: 'v6s5', action: 'Flip and cook 5 more minutes', duration: 5, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 10, flipHalfway: true, flipAt: 5, shakeInterval: null, notes: 'Single layer for crispiness' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, Italian seasoning' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['light', 'summer'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('green_beans'), type: 'component', name: 'Green Beans',
    category: 'Veggie', subcategory: 'Green Veggie', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v7s1', action: 'Trim ends', duration: 3, type: 'prep' },
      { id: 'v7s2', action: 'Toss with oil and garlic powder', duration: 2, type: 'season' },
      { id: 'v7s3', action: 'Cook at 400F for 4 minutes', duration: 4, type: 'cook' },
      { id: 'v7s4', action: 'Shake, cook 4 more minutes', duration: 4, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 8, flipHalfway: false, flipAt: null, shakeInterval: 4, notes: 'Slightly charred edges add great flavor' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, garlic powder, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['healthy', 'quick'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('cauliflower_florets'), type: 'component', name: 'Cauliflower Florets',
    category: 'Veggie', subcategory: 'Cruciferous', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v8s1', action: 'Cut into even florets', duration: 3, type: 'prep' },
      { id: 'v8s2', action: 'Toss with oil and turmeric', duration: 2, type: 'season' },
      { id: 'v8s3', action: 'Cook at 400F for 6 minutes', duration: 6, type: 'cook' },
      { id: 'v8s4', action: 'Shake, cook 6 more minutes', duration: 6, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 12, flipHalfway: false, flipAt: null, shakeInterval: 6, notes: 'Golden brown edges = peak flavor' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, turmeric, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['low-carb', 'healthy'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('corn_on_the_cob'), type: 'component', name: 'Corn on the Cob',
    category: 'Veggie', subcategory: 'Corn', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v9s1', action: 'Shuck corn and remove silk', duration: 2, type: 'prep' },
      { id: 'v9s2', action: 'Brush with butter', duration: 1, type: 'season' },
      { id: 'v9s3', action: 'Cook at 400F for 5 minutes', duration: 5, type: 'cook' },
      { id: 'v9s4', action: 'Turn and cook 5 more minutes', duration: 5, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 10, flipHalfway: true, flipAt: 5, shakeInterval: null, notes: 'Cut in half if corn doesn\'t fit' },
    defaultSeasoning: { componentIds: [], freeText: 'Butter, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['summer', 'bbq'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('carrots'), type: 'component', name: 'Carrots (sticks)',
    category: 'Veggie', subcategory: 'Root Veggie', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v10s1', action: 'Peel and cut into sticks', duration: 4, type: 'prep' },
      { id: 'v10s2', action: 'Toss with oil, honey, S&P', duration: 2, type: 'season' },
      { id: 'v10s3', action: 'Cook at 380F for 6 minutes', duration: 6, type: 'cook' },
      { id: 'v10s4', action: 'Shake, cook 6 more minutes', duration: 6, type: 'cook' }
    ],
    airFryer: { temp: 380, cookTime: 12, flipHalfway: false, flipAt: null, shakeInterval: 6, notes: 'Honey caramelizes beautifully' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, honey, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['sweet', 'healthy'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('mushrooms'), type: 'component', name: 'Mushrooms (halved)',
    category: 'Veggie', subcategory: 'Fungi', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v11s1', action: 'Clean and halve mushrooms', duration: 3, type: 'prep' },
      { id: 'v11s2', action: 'Toss with oil, garlic, thyme', duration: 2, type: 'season' },
      { id: 'v11s3', action: 'Cook at 400F for 4 minutes', duration: 4, type: 'cook' },
      { id: 'v11s4', action: 'Shake, cook 4 more minutes', duration: 4, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 8, flipHalfway: false, flipAt: null, shakeInterval: 4, notes: 'Don\'t wash — wipe clean with damp towel' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, garlic, thyme' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['umami', 'versatile'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('onion_wedges'), type: 'component', name: 'Onion (wedges)',
    category: 'Veggie', subcategory: 'Allium', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v12s1', action: 'Peel and cut into wedges', duration: 3, type: 'prep' },
      { id: 'v12s2', action: 'Toss with oil and balsamic', duration: 2, type: 'season' },
      { id: 'v12s3', action: 'Cook at 400F for 5 minutes', duration: 5, type: 'cook' },
      { id: 'v12s4', action: 'Shake, cook 5 more minutes', duration: 5, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 10, flipHalfway: false, flipAt: null, shakeInterval: 5, notes: 'Toothpick through wedges keeps them together' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, balsamic, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['caramelized', 'versatile'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('eggplant_cubes'), type: 'component', name: 'Eggplant (cubes)',
    category: 'Veggie', subcategory: 'Nightshade', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v13s1', action: 'Cut into 1-inch cubes, salt for 10 min', duration: 13, type: 'prep' },
      { id: 'v13s2', action: 'Pat dry, toss with oil and seasoning', duration: 2, type: 'season' },
      { id: 'v13s3', action: 'Cook at 400F for 6 minutes', duration: 6, type: 'cook' },
      { id: 'v13s4', action: 'Shake, cook 6 more minutes', duration: 6, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 12, flipHalfway: false, flipAt: null, shakeInterval: 6, notes: 'Salting removes bitterness' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, garlic, Italian seasoning' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['mediterranean'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('butternut_squash'), type: 'component', name: 'Butternut Squash (cubes)',
    category: 'Veggie', subcategory: 'Squash', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v14s1', action: 'Peel, seed, and cube', duration: 7, type: 'prep' },
      { id: 'v14s2', action: 'Toss with oil, cinnamon, nutmeg', duration: 2, type: 'season' },
      { id: 'v14s3', action: 'Cook at 375F for 9 minutes', duration: 9, type: 'cook' },
      { id: 'v14s4', action: 'Shake, cook 9 more minutes', duration: 9, type: 'cook' }
    ],
    airFryer: { temp: 375, cookTime: 18, flipHalfway: false, flipAt: null, shakeInterval: 9, notes: 'Cubes should be fork-tender' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, cinnamon, nutmeg' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['fall', 'sweet'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('kale_chips'), type: 'component', name: 'Kale Chips',
    category: 'Veggie', subcategory: 'Leafy Green', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v15s1', action: 'Wash, dry thoroughly, remove stems, tear into pieces', duration: 5, type: 'prep' },
      { id: 'v15s2', action: 'Massage with oil and S&P', duration: 2, type: 'season' },
      { id: 'v15s3', action: 'Spread loosely in basket', duration: 1, type: 'cook' },
      { id: 'v15s4', action: 'Cook at 300F for 5 minutes', duration: 5, type: 'cook' }
    ],
    airFryer: { temp: 300, cookTime: 5, flipHalfway: false, flipAt: null, shakeInterval: null, notes: 'Must be completely dry or they won\'t crisp' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['snack', 'healthy'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('cabbage_wedges'), type: 'component', name: 'Cabbage Wedges',
    category: 'Veggie', subcategory: 'Cruciferous', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v16s1', action: 'Cut into wedges, keep core to hold together', duration: 3, type: 'prep' },
      { id: 'v16s2', action: 'Brush with oil, season both sides', duration: 2, type: 'season' },
      { id: 'v16s3', action: 'Cook at 375F for 6 minutes', duration: 6, type: 'cook' },
      { id: 'v16s4', action: 'Flip, cook 6 more minutes', duration: 6, type: 'cook' }
    ],
    airFryer: { temp: 375, cookTime: 12, flipHalfway: true, flipAt: 6, shakeInterval: null, notes: 'Charred edges are the best part' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, garlic powder, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['low-carb', 'budget'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('cherry_tomatoes'), type: 'component', name: 'Cherry Tomatoes',
    category: 'Veggie', subcategory: 'Nightshade', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v17s1', action: 'Wash and pat dry', duration: 2, type: 'prep' },
      { id: 'v17s2', action: 'Toss with oil and Italian seasoning', duration: 1, type: 'season' },
      { id: 'v17s3', action: 'Cook at 375F for 4 minutes', duration: 4, type: 'cook' },
      { id: 'v17s4', action: 'Shake, cook 4 more minutes', duration: 4, type: 'cook' }
    ],
    airFryer: { temp: 375, cookTime: 8, flipHalfway: false, flipAt: null, shakeInterval: 4, notes: 'They\'ll burst — that\'s what you want' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, Italian seasoning' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['burst', 'pasta-ready'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('snap_peas'), type: 'component', name: 'Snap Peas',
    category: 'Veggie', subcategory: 'Green Veggie', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v18s1', action: 'Remove strings if needed', duration: 3, type: 'prep' },
      { id: 'v18s2', action: 'Toss with sesame oil and garlic', duration: 2, type: 'season' },
      { id: 'v18s3', action: 'Cook at 400F for 3 minutes', duration: 3, type: 'cook' },
      { id: 'v18s4', action: 'Shake, cook 3 more minutes', duration: 3, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 6, flipHalfway: false, flipAt: null, shakeInterval: 3, notes: 'Keep them snappy — don\'t overcook' },
    defaultSeasoning: { componentIds: [], freeText: 'Sesame oil, garlic, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['asian', 'quick'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('beet_chips'), type: 'component', name: 'Beet Chips (thin sliced)',
    category: 'Veggie', subcategory: 'Root Veggie', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v19s1', action: 'Peel and slice paper-thin (mandoline)', duration: 7, type: 'prep' },
      { id: 'v19s2', action: 'Toss with oil and S&P', duration: 2, type: 'season' },
      { id: 'v19s3', action: 'Arrange in single layer', duration: 2, type: 'cook' },
      { id: 'v19s4', action: 'Cook at 350F for 6 minutes', duration: 6, type: 'cook' },
      { id: 'v19s5', action: 'Shake, cook 6 more minutes', duration: 6, type: 'cook' }
    ],
    airFryer: { temp: 350, cookTime: 12, flipHalfway: false, flipAt: null, shakeInterval: 6, notes: 'Use a mandoline for even thickness' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['snack', 'colorful'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('plantain'), type: 'component', name: 'Plantain (sliced)',
    category: 'Veggie', subcategory: 'Tropical', cookingMethod: 'Air Fry',
    steps: [
      { id: 'v20s1', action: 'Peel and slice into 1/2-inch rounds', duration: 3, type: 'prep' },
      { id: 'v20s2', action: 'Brush with oil', duration: 1, type: 'season' },
      { id: 'v20s3', action: 'Arrange in single layer', duration: 1, type: 'cook' },
      { id: 'v20s4', action: 'Cook at 375F for 5 minutes', duration: 5, type: 'cook' },
      { id: 'v20s5', action: 'Flip, cook 5 more minutes', duration: 5, type: 'cook' }
    ],
    airFryer: { temp: 375, cookTime: 10, flipHalfway: true, flipAt: 5, shakeInterval: null, notes: 'Ripe (yellow/black) for sweet; green for savory' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['caribbean', 'versatile'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },

  // ── STARCHES (10) ──────────────────────────────────────
  {
    id: _makeId('french_fries'), type: 'component', name: 'French Fries (frozen)',
    category: 'Starch', subcategory: 'Potato', cookingMethod: 'Air Fry',
    steps: [
      { id: 'st1s1', action: 'Add frozen fries to basket — no thawing', duration: 1, type: 'cook' },
      { id: 'st1s2', action: 'Cook at 400F for 8 minutes', duration: 8, type: 'cook' },
      { id: 'st1s3', action: 'Shake basket, cook 7 more minutes', duration: 7, type: 'cook' },
      { id: 'st1s4', action: 'Season immediately after cooking', duration: 1, type: 'season' }
    ],
    airFryer: { temp: 400, cookTime: 15, flipHalfway: false, flipAt: null, shakeInterval: 8, notes: 'Don\'t overcrowd for maximum crispiness' },
    defaultSeasoning: { componentIds: [], freeText: 'S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['classic', 'easy'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('sweet_potato_fries'), type: 'component', name: 'Sweet Potato Fries (frozen)',
    category: 'Starch', subcategory: 'Potato', cookingMethod: 'Air Fry',
    steps: [
      { id: 'st2s1', action: 'Add frozen fries to basket', duration: 1, type: 'cook' },
      { id: 'st2s2', action: 'Cook at 400F for 6 minutes', duration: 6, type: 'cook' },
      { id: 'st2s3', action: 'Shake, cook 6 more minutes', duration: 6, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 12, flipHalfway: false, flipAt: null, shakeInterval: 6, notes: 'Season after cooking' },
    defaultSeasoning: { componentIds: [], freeText: 'S&P, cinnamon optional' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['sweet', 'easy'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('tater_tots'), type: 'component', name: 'Tater Tots (frozen)',
    category: 'Starch', subcategory: 'Potato', cookingMethod: 'Air Fry',
    steps: [
      { id: 'st3s1', action: 'Add frozen tots to basket', duration: 1, type: 'cook' },
      { id: 'st3s2', action: 'Cook at 400F for 8 minutes', duration: 8, type: 'cook' },
      { id: 'st3s3', action: 'Shake, cook 7 more minutes', duration: 7, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 15, flipHalfway: false, flipAt: null, shakeInterval: 8, notes: 'Shake well for even browning' },
    defaultSeasoning: { componentIds: [], freeText: 'S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['comfort', 'kid-friendly'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('baked_potato'), type: 'component', name: 'Baked Potato',
    category: 'Starch', subcategory: 'Potato', cookingMethod: 'Air Fry',
    steps: [
      { id: 'st4s1', action: 'Wash and prick with fork several times', duration: 2, type: 'prep' },
      { id: 'st4s2', action: 'Rub with oil and salt', duration: 1, type: 'season' },
      { id: 'st4s3', action: 'Cook at 400F for 20 minutes', duration: 20, type: 'cook' },
      { id: 'st4s4', action: 'Flip, cook 20 more minutes', duration: 20, type: 'cook' },
      { id: 'st4s5', action: 'Squeeze to check doneness', duration: 1, type: 'finish' }
    ],
    airFryer: { temp: 400, cookTime: 40, flipHalfway: true, flipAt: 20, shakeInterval: null, notes: 'Medium potatoes; large ones may need 45-50 min' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['classic', 'filling'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('garlic_bread'), type: 'component', name: 'Garlic Bread',
    category: 'Starch', subcategory: 'Bread', cookingMethod: 'Air Fry',
    steps: [
      { id: 'st5s1', action: 'Slice bread, spread with garlic butter', duration: 3, type: 'prep' },
      { id: 'st5s2', action: 'Place in basket butter-side up', duration: 1, type: 'cook' },
      { id: 'st5s3', action: 'Cook at 350F for 5 minutes', duration: 5, type: 'cook' }
    ],
    airFryer: { temp: 350, cookTime: 5, flipHalfway: false, flipAt: null, shakeInterval: null, notes: 'Watch closely — burns fast' },
    defaultSeasoning: { componentIds: [], freeText: 'Butter, garlic, parsley' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['quick', 'side'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('naan_pita'), type: 'component', name: 'Naan/Pita',
    category: 'Starch', subcategory: 'Bread', cookingMethod: 'Air Fry',
    steps: [
      { id: 'st6s1', action: 'Brush lightly with butter or oil', duration: 1, type: 'season' },
      { id: 'st6s2', action: 'Cook at 375F for 2 minutes', duration: 2, type: 'cook' },
      { id: 'st6s3', action: 'Flip, cook 2 more minutes', duration: 2, type: 'cook' }
    ],
    airFryer: { temp: 375, cookTime: 4, flipHalfway: true, flipAt: 2, shakeInterval: null, notes: 'Great for warming store-bought naan' },
    defaultSeasoning: { componentIds: [], freeText: 'Butter or olive oil' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['quick', 'bread'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('tortilla_chips'), type: 'component', name: 'Tortilla Chips',
    category: 'Starch', subcategory: 'Snack', cookingMethod: 'Air Fry',
    steps: [
      { id: 'st7s1', action: 'Cut tortillas into triangles', duration: 2, type: 'prep' },
      { id: 'st7s2', action: 'Spray with oil, sprinkle salt', duration: 1, type: 'season' },
      { id: 'st7s3', action: 'Cook at 350F for 3 minutes', duration: 3, type: 'cook' },
      { id: 'st7s4', action: 'Shake, cook 2 more minutes', duration: 2, type: 'cook' }
    ],
    airFryer: { temp: 350, cookTime: 5, flipHalfway: false, flipAt: null, shakeInterval: 3, notes: 'Corn tortillas = best crunch' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil spray, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['snack', 'homemade'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('quinoa_cakes'), type: 'component', name: 'Quinoa Cakes',
    category: 'Starch', subcategory: 'Grain', cookingMethod: 'Air Fry',
    steps: [
      { id: 'st8s1', action: 'Form cooked quinoa mixture into patties', duration: 5, type: 'prep' },
      { id: 'st8s2', action: 'Brush with oil', duration: 1, type: 'season' },
      { id: 'st8s3', action: 'Cook at 375F for 5 minutes', duration: 5, type: 'cook' },
      { id: 'st8s4', action: 'Flip, cook 5 more minutes', duration: 5, type: 'cook' }
    ],
    airFryer: { temp: 375, cookTime: 10, flipHalfway: true, flipAt: 5, shakeInterval: null, notes: 'Refrigerate patties 30 min before cooking for best hold' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, S&P' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['healthy', 'grain'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('rice_balls'), type: 'component', name: 'Rice Balls (arancini)',
    category: 'Starch', subcategory: 'Grain', cookingMethod: 'Air Fry',
    steps: [
      { id: 'st9s1', action: 'Form chilled rice into balls', duration: 5, type: 'prep' },
      { id: 'st9s2', action: 'Spray with oil', duration: 1, type: 'season' },
      { id: 'st9s3', action: 'Cook at 400F for 5 minutes', duration: 5, type: 'cook' },
      { id: 'st9s4', action: 'Shake, cook 5 more minutes', duration: 5, type: 'cook' }
    ],
    airFryer: { temp: 400, cookTime: 10, flipHalfway: false, flipAt: null, shakeInterval: 5, notes: 'Use day-old rice for best results' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil spray' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['italian', 'appetizer'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('croutons'), type: 'component', name: 'Croutons',
    category: 'Starch', subcategory: 'Bread', cookingMethod: 'Air Fry',
    steps: [
      { id: 'st10s1', action: 'Cut bread into cubes', duration: 3, type: 'prep' },
      { id: 'st10s2', action: 'Toss with oil, garlic, Italian seasoning', duration: 2, type: 'season' },
      { id: 'st10s3', action: 'Cook at 375F for 3 minutes', duration: 3, type: 'cook' },
      { id: 'st10s4', action: 'Shake, cook 2 more minutes', duration: 2, type: 'cook' }
    ],
    airFryer: { temp: 375, cookTime: 5, flipHalfway: false, flipAt: null, shakeInterval: 3, notes: 'Use day-old bread for best crunch' },
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, garlic, Italian seasoning' },
    ingredients: [], pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['salad', 'quick'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },

  // ── SEASONINGS (15) ──────────────────────────────────
  {
    id: _makeId('all_purpose_rub'), type: 'component', name: 'All-Purpose Rub',
    category: 'Seasoning', subcategory: 'Dry Rub', cookingMethod: 'No Cook',
    steps: [{ id: 'se1s1', action: 'Mix all ingredients together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Garlic powder, onion powder, paprika, black pepper, salt' },
    ingredients: [
      { name: 'Garlic powder', amount: '1', unit: 'tbsp' },
      { name: 'Onion powder', amount: '1', unit: 'tbsp' },
      { name: 'Paprika', amount: '1', unit: 'tbsp' },
      { name: 'Black pepper', amount: '1', unit: 'tsp' },
      { name: 'Salt', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['versatile', 'staple'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('cajun_seasoning'), type: 'component', name: 'Cajun Seasoning',
    category: 'Seasoning', subcategory: 'Dry Rub', cookingMethod: 'No Cook',
    steps: [{ id: 'se2s1', action: 'Mix all ingredients together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Paprika, garlic, onion, cayenne, oregano, thyme, pepper, salt' },
    ingredients: [
      { name: 'Paprika', amount: '2', unit: 'tbsp' }, { name: 'Garlic powder', amount: '1', unit: 'tbsp' },
      { name: 'Onion powder', amount: '1', unit: 'tbsp' }, { name: 'Cayenne', amount: '1', unit: 'tsp' },
      { name: 'Oregano', amount: '1', unit: 'tsp' }, { name: 'Thyme', amount: '1', unit: 'tsp' },
      { name: 'Black pepper', amount: '1', unit: 'tsp' }, { name: 'Salt', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['spicy', 'southern'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('lemon_pepper'), type: 'component', name: 'Lemon Pepper',
    category: 'Seasoning', subcategory: 'Dry Rub', cookingMethod: 'No Cook',
    steps: [{ id: 'se3s1', action: 'Mix all ingredients together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Lemon zest, black pepper, garlic powder, onion powder, salt' },
    ingredients: [
      { name: 'Lemon zest', amount: '2', unit: 'tbsp' }, { name: 'Black pepper', amount: '1', unit: 'tbsp' },
      { name: 'Garlic powder', amount: '1', unit: 'tsp' }, { name: 'Onion powder', amount: '1', unit: 'tsp' },
      { name: 'Salt', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['citrus', 'seafood'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('italian_herb_blend'), type: 'component', name: 'Italian Herb Blend',
    category: 'Seasoning', subcategory: 'Dry Rub', cookingMethod: 'No Cook',
    steps: [{ id: 'se4s1', action: 'Mix all herbs together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Basil, oregano, thyme, rosemary, garlic powder, S&P' },
    ingredients: [
      { name: 'Basil', amount: '1', unit: 'tbsp' }, { name: 'Oregano', amount: '1', unit: 'tbsp' },
      { name: 'Thyme', amount: '1', unit: 'tsp' }, { name: 'Rosemary', amount: '1', unit: 'tsp' },
      { name: 'Garlic powder', amount: '1', unit: 'tsp' }, { name: 'Salt', amount: '1', unit: 'tsp' },
      { name: 'Black pepper', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['italian', 'versatile'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('taco_seasoning'), type: 'component', name: 'Taco Seasoning',
    category: 'Seasoning', subcategory: 'Dry Rub', cookingMethod: 'No Cook',
    steps: [{ id: 'se5s1', action: 'Mix all ingredients together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Chili powder, cumin, paprika, garlic, onion, oregano, S&P' },
    ingredients: [
      { name: 'Chili powder', amount: '2', unit: 'tbsp' }, { name: 'Cumin', amount: '1', unit: 'tbsp' },
      { name: 'Paprika', amount: '1', unit: 'tsp' }, { name: 'Garlic powder', amount: '1', unit: 'tsp' },
      { name: 'Onion powder', amount: '1', unit: 'tsp' }, { name: 'Oregano', amount: '1', unit: 'tsp' },
      { name: 'Salt', amount: '1', unit: 'tsp' }, { name: 'Black pepper', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['mexican', 'staple'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('garlic_herb_butter'), type: 'component', name: 'Garlic Herb Butter',
    category: 'Seasoning', subcategory: 'Wet Seasoning', cookingMethod: 'No Cook',
    steps: [{ id: 'se6s1', action: 'Soften butter, mix in garlic and herbs', duration: 3, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Butter, garlic, parsley, S&P' },
    ingredients: [
      { name: 'Butter', amount: '4', unit: 'tbsp' }, { name: 'Garlic (minced)', amount: '4', unit: 'cloves' },
      { name: 'Parsley', amount: '2', unit: 'tbsp' }, { name: 'Salt', amount: '1/2', unit: 'tsp' },
      { name: 'Black pepper', amount: '1/4', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['compound-butter', 'rich'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('honey_garlic_glaze'), type: 'component', name: 'Honey Garlic Glaze',
    category: 'Seasoning', subcategory: 'Wet Seasoning', cookingMethod: 'No Cook',
    steps: [{ id: 'se7s1', action: 'Whisk all ingredients until smooth', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Honey, soy sauce, garlic, ginger' },
    ingredients: [
      { name: 'Honey', amount: '3', unit: 'tbsp' }, { name: 'Soy sauce', amount: '2', unit: 'tbsp' },
      { name: 'Garlic (minced)', amount: '3', unit: 'cloves' }, { name: 'Ginger', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['sweet', 'asian'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('teriyaki_marinade'), type: 'component', name: 'Teriyaki Marinade',
    category: 'Seasoning', subcategory: 'Marinade', cookingMethod: 'No Cook',
    steps: [{ id: 'se8s1', action: 'Whisk all ingredients together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Soy sauce, brown sugar, garlic, ginger, sesame oil' },
    ingredients: [
      { name: 'Soy sauce', amount: '1/4', unit: 'cup' }, { name: 'Brown sugar', amount: '2', unit: 'tbsp' },
      { name: 'Garlic (minced)', amount: '2', unit: 'cloves' }, { name: 'Ginger', amount: '1', unit: 'tsp' },
      { name: 'Sesame oil', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['asian', 'marinade'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('jerk_seasoning'), type: 'component', name: 'Jerk Seasoning',
    category: 'Seasoning', subcategory: 'Dry Rub', cookingMethod: 'No Cook',
    steps: [{ id: 'se9s1', action: 'Mix all spices together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Allspice, thyme, cayenne, garlic, onion, cinnamon, nutmeg, S&P' },
    ingredients: [
      { name: 'Allspice', amount: '1', unit: 'tbsp' }, { name: 'Thyme', amount: '1', unit: 'tbsp' },
      { name: 'Cayenne', amount: '1', unit: 'tsp' }, { name: 'Garlic powder', amount: '1', unit: 'tsp' },
      { name: 'Onion powder', amount: '1', unit: 'tsp' }, { name: 'Cinnamon', amount: '1/2', unit: 'tsp' },
      { name: 'Nutmeg', amount: '1/2', unit: 'tsp' }, { name: 'Salt', amount: '1', unit: 'tsp' },
      { name: 'Black pepper', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['caribbean', 'spicy'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('mediterranean_rub'), type: 'component', name: 'Mediterranean Rub',
    category: 'Seasoning', subcategory: 'Dry Rub', cookingMethod: 'No Cook',
    steps: [{ id: 'se10s1', action: 'Mix all ingredients together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Oregano, garlic, lemon zest, cumin, coriander, S&P' },
    ingredients: [
      { name: 'Oregano', amount: '1', unit: 'tbsp' }, { name: 'Garlic powder', amount: '1', unit: 'tbsp' },
      { name: 'Lemon zest', amount: '1', unit: 'tbsp' }, { name: 'Cumin', amount: '1', unit: 'tsp' },
      { name: 'Coriander', amount: '1', unit: 'tsp' }, { name: 'Salt', amount: '1', unit: 'tsp' },
      { name: 'Black pepper', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['mediterranean', 'lamb'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('bbq_dry_rub'), type: 'component', name: 'BBQ Dry Rub',
    category: 'Seasoning', subcategory: 'Dry Rub', cookingMethod: 'No Cook',
    steps: [{ id: 'se11s1', action: 'Mix all ingredients together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Brown sugar, paprika, chili powder, garlic, onion, cumin, S&P' },
    ingredients: [
      { name: 'Brown sugar', amount: '2', unit: 'tbsp' }, { name: 'Paprika', amount: '1', unit: 'tbsp' },
      { name: 'Chili powder', amount: '1', unit: 'tbsp' }, { name: 'Garlic powder', amount: '1', unit: 'tsp' },
      { name: 'Onion powder', amount: '1', unit: 'tsp' }, { name: 'Cumin', amount: '1', unit: 'tsp' },
      { name: 'Salt', amount: '1', unit: 'tsp' }, { name: 'Black pepper', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['bbq', 'summer'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('everything_bagel'), type: 'component', name: 'Everything Bagel Seasoning',
    category: 'Seasoning', subcategory: 'Dry Rub', cookingMethod: 'No Cook',
    steps: [{ id: 'se12s1', action: 'Mix all ingredients together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Sesame seeds, poppy seeds, dried onion, dried garlic, sea salt' },
    ingredients: [
      { name: 'Sesame seeds', amount: '1', unit: 'tbsp' }, { name: 'Poppy seeds', amount: '1', unit: 'tbsp' },
      { name: 'Dried onion flakes', amount: '1', unit: 'tbsp' }, { name: 'Dried garlic flakes', amount: '1', unit: 'tbsp' },
      { name: 'Sea salt', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['trendy', 'versatile'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('ranch_seasoning'), type: 'component', name: 'Ranch Seasoning',
    category: 'Seasoning', subcategory: 'Dry Rub', cookingMethod: 'No Cook',
    steps: [{ id: 'se13s1', action: 'Mix all ingredients together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Dried dill, garlic powder, onion powder, dried parsley, S&P' },
    ingredients: [
      { name: 'Dried dill', amount: '1', unit: 'tbsp' }, { name: 'Garlic powder', amount: '1', unit: 'tbsp' },
      { name: 'Onion powder', amount: '1', unit: 'tbsp' }, { name: 'Dried parsley', amount: '1', unit: 'tsp' },
      { name: 'Salt', amount: '1', unit: 'tsp' }, { name: 'Black pepper', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['american', 'popular'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('chili_lime'), type: 'component', name: 'Chili Lime',
    category: 'Seasoning', subcategory: 'Dry Rub', cookingMethod: 'No Cook',
    steps: [{ id: 'se14s1', action: 'Mix all ingredients together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Chili powder, lime zest, cumin, garlic powder, S&P' },
    ingredients: [
      { name: 'Chili powder', amount: '1', unit: 'tbsp' }, { name: 'Lime zest', amount: '1', unit: 'tbsp' },
      { name: 'Cumin', amount: '1', unit: 'tsp' }, { name: 'Garlic powder', amount: '1', unit: 'tsp' },
      { name: 'Salt', amount: '1', unit: 'tsp' }, { name: 'Black pepper', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['mexican', 'bright'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('sesame_ginger'), type: 'component', name: 'Sesame Ginger',
    category: 'Seasoning', subcategory: 'Dry Rub', cookingMethod: 'No Cook',
    steps: [{ id: 'se15s1', action: 'Mix all ingredients together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Sesame seeds, ginger, garlic, onion, white pepper' },
    ingredients: [
      { name: 'Sesame seeds', amount: '1', unit: 'tbsp' }, { name: 'Ginger powder', amount: '1', unit: 'tbsp' },
      { name: 'Garlic powder', amount: '1', unit: 'tsp' }, { name: 'Onion powder', amount: '1', unit: 'tsp' },
      { name: 'White pepper', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['asian', 'aromatic'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },

  // ── SAUCES (10) ──────────────────────────────────────
  {
    id: _makeId('sriracha_mayo'), type: 'component', name: 'Sriracha Mayo',
    category: 'Sauce', subcategory: 'Creamy', cookingMethod: 'No Cook',
    steps: [{ id: 'sa1s1', action: 'Mix all ingredients until smooth', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Mayo, sriracha, lime juice' },
    ingredients: [
      { name: 'Mayo', amount: '1/4', unit: 'cup' }, { name: 'Sriracha', amount: '2', unit: 'tbsp' },
      { name: 'Lime juice', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['spicy', 'dipping'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('chimichurri'), type: 'component', name: 'Chimichurri',
    category: 'Sauce', subcategory: 'Herb', cookingMethod: 'No Cook',
    steps: [
      { id: 'sa2s1', action: 'Finely chop parsley and garlic', duration: 5, type: 'prep' },
      { id: 'sa2s2', action: 'Mix with oil, vinegar, and red pepper flakes', duration: 2, type: 'prep' },
      { id: 'sa2s3', action: 'Let rest 15 minutes for flavors to meld', duration: 15, type: 'rest' }
    ],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Parsley, garlic, olive oil, red wine vinegar, red pepper flakes, S&P' },
    ingredients: [
      { name: 'Parsley (fresh)', amount: '1', unit: 'cup' }, { name: 'Garlic', amount: '4', unit: 'cloves' },
      { name: 'Olive oil', amount: '1/2', unit: 'cup' }, { name: 'Red wine vinegar', amount: '2', unit: 'tbsp' },
      { name: 'Red pepper flakes', amount: '1', unit: 'tsp' }, { name: 'Salt', amount: '1/2', unit: 'tsp' },
      { name: 'Black pepper', amount: '1/4', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['argentine', 'steak'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('tzatziki'), type: 'component', name: 'Tzatziki',
    category: 'Sauce', subcategory: 'Creamy', cookingMethod: 'No Cook',
    steps: [
      { id: 'sa3s1', action: 'Grate cucumber, squeeze out excess water', duration: 5, type: 'prep' },
      { id: 'sa3s2', action: 'Mix all ingredients together', duration: 2, type: 'prep' },
      { id: 'sa3s3', action: 'Refrigerate 30 minutes', duration: 30, type: 'rest' }
    ],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Greek yogurt, cucumber, garlic, lemon juice, dill, S&P' },
    ingredients: [
      { name: 'Greek yogurt', amount: '1', unit: 'cup' }, { name: 'Cucumber (diced)', amount: '1/2', unit: 'cup' },
      { name: 'Garlic (minced)', amount: '2', unit: 'cloves' }, { name: 'Lemon juice', amount: '1', unit: 'tbsp' },
      { name: 'Dill', amount: '1', unit: 'tbsp' }, { name: 'Salt', amount: '1/2', unit: 'tsp' },
      { name: 'Black pepper', amount: '1/4', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['greek', 'refreshing'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('honey_mustard'), type: 'component', name: 'Honey Mustard',
    category: 'Sauce', subcategory: 'Sweet', cookingMethod: 'No Cook',
    steps: [{ id: 'sa4s1', action: 'Whisk all ingredients until smooth', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Honey, dijon mustard, mayo' },
    ingredients: [
      { name: 'Honey', amount: '3', unit: 'tbsp' }, { name: 'Dijon mustard', amount: '2', unit: 'tbsp' },
      { name: 'Mayo', amount: '1', unit: 'tbsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['sweet', 'dipping'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('garlic_aioli'), type: 'component', name: 'Garlic Aioli',
    category: 'Sauce', subcategory: 'Creamy', cookingMethod: 'No Cook',
    steps: [{ id: 'sa5s1', action: 'Mix all ingredients until smooth', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Mayo, garlic, lemon juice, S&P' },
    ingredients: [
      { name: 'Mayo', amount: '1/2', unit: 'cup' }, { name: 'Garlic (minced)', amount: '3', unit: 'cloves' },
      { name: 'Lemon juice', amount: '1', unit: 'tbsp' }, { name: 'Salt', amount: '1/4', unit: 'tsp' },
      { name: 'Black pepper', amount: '1/8', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['creamy', 'versatile'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('buffalo_sauce'), type: 'component', name: 'Buffalo Sauce',
    category: 'Sauce', subcategory: 'Hot', cookingMethod: 'No Cook',
    steps: [{ id: 'sa6s1', action: 'Melt butter and mix with hot sauce and vinegar', duration: 3, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Hot sauce, butter, vinegar' },
    ingredients: [
      { name: 'Hot sauce', amount: '1/2', unit: 'cup' }, { name: 'Butter (melted)', amount: '4', unit: 'tbsp' },
      { name: 'Vinegar', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['spicy', 'wings'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('peanut_sauce'), type: 'component', name: 'Peanut Sauce',
    category: 'Sauce', subcategory: 'Nutty', cookingMethod: 'No Cook',
    steps: [{ id: 'sa7s1', action: 'Whisk all ingredients until smooth', duration: 3, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Peanut butter, soy sauce, lime juice, sriracha, honey' },
    ingredients: [
      { name: 'Peanut butter', amount: '1/4', unit: 'cup' }, { name: 'Soy sauce', amount: '2', unit: 'tbsp' },
      { name: 'Lime juice', amount: '1', unit: 'tbsp' }, { name: 'Sriracha', amount: '1', unit: 'tsp' },
      { name: 'Honey', amount: '1', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['thai', 'dipping'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('tahini_dressing'), type: 'component', name: 'Tahini Dressing',
    category: 'Sauce', subcategory: 'Creamy', cookingMethod: 'No Cook',
    steps: [{ id: 'sa8s1', action: 'Whisk all ingredients, thin with water as needed', duration: 3, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Tahini, lemon juice, garlic, water, S&P' },
    ingredients: [
      { name: 'Tahini', amount: '1/4', unit: 'cup' }, { name: 'Lemon juice', amount: '2', unit: 'tbsp' },
      { name: 'Garlic (minced)', amount: '1', unit: 'clove' }, { name: 'Water', amount: '2', unit: 'tbsp' },
      { name: 'Salt', amount: '1/4', unit: 'tsp' }, { name: 'Black pepper', amount: '1/8', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['middle-eastern', 'vegan'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('balsamic_glaze'), type: 'component', name: 'Balsamic Glaze',
    category: 'Sauce', subcategory: 'Reduction', cookingMethod: 'Stovetop',
    steps: [
      { id: 'sa9s1', action: 'Pour balsamic vinegar into saucepan', duration: 1, type: 'prep' },
      { id: 'sa9s2', action: 'Simmer on medium-low for 15 minutes, stirring', duration: 15, type: 'cook' },
      { id: 'sa9s3', action: 'Cool — it thickens as it cools', duration: 5, type: 'rest' }
    ],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Balsamic vinegar' },
    ingredients: [
      { name: 'Balsamic vinegar', amount: '1', unit: 'cup' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['italian', 'finishing'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  },
  {
    id: _makeId('lemon_herb_drizzle'), type: 'component', name: 'Lemon Herb Drizzle',
    category: 'Sauce', subcategory: 'Herb', cookingMethod: 'No Cook',
    steps: [{ id: 'sa10s1', action: 'Whisk all ingredients together', duration: 2, type: 'prep' }],
    airFryer: null,
    defaultSeasoning: { componentIds: [], freeText: 'Olive oil, lemon juice, garlic, fresh herbs, S&P' },
    ingredients: [
      { name: 'Olive oil', amount: '1/4', unit: 'cup' }, { name: 'Lemon juice', amount: '2', unit: 'tbsp' },
      { name: 'Garlic (minced)', amount: '1', unit: 'clove' }, { name: 'Fresh herbs (mixed)', amount: '2', unit: 'tbsp' },
      { name: 'Salt', amount: '1/4', unit: 'tsp' }, { name: 'Black pepper', amount: '1/8', unit: 'tsp' }
    ],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: ['fresh', 'finishing'],
    image_url: '', createdAt: _now(), lastUsed: null, source: 'starter'
  }
];

// ============================================================
// SECTION 3: SEEDING LOGIC
// ============================================================
function seedStarterComponents() {
  if (localStorage.getItem('yummy_components_seeded')) return;
  if (state.components.length === 0) {
    state.components = STARTER_COMPONENTS.map(c => ({ ...c }));
    persistState();
  }
  localStorage.setItem('yummy_components_seeded', 'true');
}

// ============================================================
// SECTION 4: PAGE-LOCAL STATE
// ============================================================
let componentSearchTerm = '';
let componentCategoryFilter = 'All';
let componentSortBy = 'name';
let activeTab = 'library'; // 'library' | 'combos'
let selectedComponentId = null;
let editingComponentId = null;

// Build a Plate state
let buildPlateSlots = { protein: null, veggie: null, veggie2: null, starch: null, sauce: null };
let buildPlateTimeline = [];

// Cook Mode state
let cookModeActive = false;
let cookModeStartTime = null;
let cookModeTimerInterval = null;
let cookModeElapsedSeconds = 0;
let cookModeTimeline = [];
let cookModeTotalTime = 0;
let cookModeCompletedSteps = {};
let cookModeDismissedReminders = {};

// Combos state
let comboSearchTerm = '';
let comboSortBy = 'recent';

// Video state
let videoFormOpenForStep = null;   // step.id when inline URL form is visible
let expandedVideoStepId = null;    // step.id when video player is expanded
let videoUploadInProgress = null;  // step.id when upload is active
let cachedIsAdmin = null;          // cached admin check result

async function refreshAdminStatus() {
  cachedIsAdmin = await isAppAdmin();
}

// Recipe extraction state
let extractionState = null;
// When active: { step: 1|2|3, selectedRecipeId, searchTerm, mappings: [], comboName: '' }

// Import preview state
let importPreviewData = null;

// ============================================================
// SECTION 5: HELPER FUNCTIONS
// ============================================================
function getComponentById(id) {
  return state.components.find(c => c.id === id);
}

function getCategoryColor(category) {
  return COMPONENT_CATEGORY_COLORS[category] || CONFIG.text_muted;
}

function getCategoryGradient(category) {
  return COMPONENT_CATEGORY_GRADIENTS[category] || 'linear-gradient(135deg, #333, #1a1a24)';
}

function formatMinutes(min) {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${min} min`;
}

function formatTimer(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function generateComponentId() {
  return 'component_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function generateComboId() {
  return 'combo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

// ── Video Helpers ──────────────────────────────────────
function parseVideoUrl(url) {
  if (!url) return null;
  url = url.trim();
  // YouTube detection
  let videoId = null;
  const ytWatchMatch = url.match(/youtube\.com\/watch\?v=([^&\s]+)/);
  const ytShortMatch = url.match(/youtu\.be\/([^?\s]+)/);
  const ytShortsMatch = url.match(/youtube\.com\/shorts\/([^?\s]+)/);
  const ytEmbedMatch = url.match(/youtube\.com\/embed\/([^?\s]+)/);
  videoId = (ytWatchMatch || ytShortMatch || ytShortsMatch || ytEmbedMatch || [])[1];
  if (videoId) {
    return {
      type: 'youtube',
      embedUrl: 'https://www.youtube.com/embed/' + videoId,
      thumbnailUrl: 'https://img.youtube.com/vi/' + videoId + '/mqdefault.jpg'
    };
  }
  // Supabase storage video detection
  if (url.includes(SUPABASE_URL + '/storage/')) {
    return { type: 'video', embedUrl: url, thumbnailUrl: null };
  }
  // Direct video file detection
  if (/\.(mp4|mov|webm)(\?.*)?$/i.test(url)) {
    return { type: 'video', embedUrl: url, thumbnailUrl: null };
  }
  // External link
  return { type: 'external', embedUrl: url, thumbnailUrl: null };
}

function renderVideoEmbed(mediaUrl) {
  return renderVideoPlayer(mediaUrl);
}

function renderVideoPlayer(mediaUrl) {
  if (!mediaUrl) return '';
  const parsed = parseVideoUrl(mediaUrl);
  if (!parsed) return '';
  if (parsed.type === 'youtube') {
    return `<div style="position:relative;width:100%;padding-bottom:56.25%;margin:8px 0;border-radius:8px;overflow:hidden;background:#000;">
      <iframe src="${esc(parsed.embedUrl)}?autoplay=1"
        style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
        allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
        allowfullscreen></iframe>
    </div>`;
  }
  if (parsed.type === 'video') {
    return `<div style="width:100%;margin:8px 0;border-radius:8px;overflow:hidden;">
      <video src="${esc(parsed.embedUrl)}" controls playsinline webkit-playsinline preload="metadata"
        onplay="pauseOtherVideos(this)"
        style="width:100%;border-radius:8px;background:#000;"></video>
    </div>`;
  }
  return '';
}

function pauseOtherVideos(current) {
  document.querySelectorAll('video').forEach(v => {
    if (v !== current && !v.paused) v.pause();
  });
}

// ── Recipe Extraction Helpers ──────────────────────────
function detectComponentCategory(ingredientName, ingredientGroup) {
  const name = (ingredientName || '').toLowerCase().trim();
  const catMap = {
    'Proteins': 'Protein', 'Vegetables': 'Veggie', 'Grains': 'Starch',
    'Herbs & Spices': 'Seasoning', 'Pantry': null, 'Fruits': null, 'Dairy': null
  };
  // Check INGREDIENT_CATEGORY_MAP from shared.js
  for (const [key, cat] of Object.entries(INGREDIENT_CATEGORY_MAP)) {
    if (name.includes(key) || key.includes(name)) {
      const mapped = catMap[cat];
      if (mapped !== undefined) return mapped;
    }
  }
  // Fallback to ingredient group
  if (ingredientGroup) {
    const groupLower = ingredientGroup.toLowerCase();
    if (groupLower.includes('protein') || groupLower.includes('meat') || groupLower.includes('seafood')) return 'Protein';
    if (groupLower.includes('vegetable') || groupLower.includes('produce')) return 'Veggie';
    if (groupLower.includes('grain') || groupLower.includes('starch') || groupLower.includes('pasta')) return 'Starch';
    if (groupLower.includes('spice') || groupLower.includes('herb') || groupLower.includes('seasoning')) return 'Seasoning';
    if (groupLower.includes('sauce') || groupLower.includes('condiment')) return 'Sauce';
  }
  return null;
}

function findMatchingComponent(ingredientName) {
  const normalized = (ingredientName || '').toLowerCase().trim();
  if (!normalized) return null;
  // Exact match
  let match = state.components.find(c => c.name.toLowerCase() === normalized);
  if (match) return match;
  // Partial containment
  match = state.components.find(c => {
    const cName = c.name.toLowerCase();
    return normalized.includes(cName) || cName.includes(normalized);
  });
  if (match) return match;
  // Word overlap (words > 3 chars)
  const ingWords = normalized.split(/\s+/).filter(w => w.length > 3);
  if (ingWords.length > 0) {
    match = state.components.find(c => {
      const cWords = c.name.toLowerCase().split(/\s+/);
      return ingWords.some(w => cWords.some(cw => cw.includes(w) || w.includes(cw)));
    });
  }
  return match || null;
}

function buildAutoMappings(recipe) {
  const ingredients = typeof recipeIngList === 'function' ? recipeIngList(recipe) : (recipe.ingredientsRows || []);
  return ingredients.map(ing => {
    const name = ing.name || '';
    const autoCategory = detectComponentCategory(name, ing.group);
    const matchedComp = findMatchingComponent(name);
    let action = 'skip';
    if (matchedComp) action = 'map';
    else if (autoCategory) action = 'create';
    return {
      ingredientName: name, qty: ing.qty || '', unit: ing.unit || '', group: ing.group || '',
      autoCategory, action, matchedComponentId: matchedComp ? (matchedComp.__backendId || matchedComp.id) : null,
      newComponentName: name ? toTitleCase(name) : '', newComponentCategory: autoCategory || 'Protein'
    };
  });
}

function getFilteredComponents() {
  let comps = [...state.components];

  // Category filter
  if (componentCategoryFilter !== 'All') {
    comps = comps.filter(c => c.category === componentCategoryFilter);
  }

  // Search filter
  if (componentSearchTerm.trim()) {
    const term = componentSearchTerm.toLowerCase().trim();
    comps = comps.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term) ||
      (c.subcategory && c.subcategory.toLowerCase().includes(term)) ||
      (c.tags && c.tags.some(t => t.toLowerCase().includes(term))) ||
      (c.defaultSeasoning && c.defaultSeasoning.freeText && c.defaultSeasoning.freeText.toLowerCase().includes(term))
    );
  }

  // Sort
  switch (componentSortBy) {
    case 'name': comps.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'category': comps.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)); break;
    case 'rating': comps.sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.name.localeCompare(b.name)); break;
    case 'recent': comps.sort((a, b) => {
      const aTime = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
      const bTime = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
      return bTime - aTime || a.name.localeCompare(b.name);
    }); break;
  }

  return comps;
}

// ============================================================
// SECTION 5B: AI MEMORY SYSTEM
// ============================================================
const DEFAULT_AI_PREFS = {
  seasoningUsage: {},
  proteinSeasoningMap: {},
  suggestionsAccepted: 0,
  suggestionsDismissed: 0,
  dismissedTypes: {},
  componentUsage: {},
  avoidedIngredients: [],
  flavorProfile: "classic-american"
};

function getAiPrefs() {
  return loadFromLS('ai_cooking_prefs', JSON.parse(JSON.stringify(DEFAULT_AI_PREFS)));
}

function updateAiPrefs(prefs) {
  saveToLS('ai_cooking_prefs', prefs);
}

function recordComponentUsage(componentId) {
  const prefs = getAiPrefs();
  if (!prefs.componentUsage[componentId]) {
    prefs.componentUsage[componentId] = { count: 0, lastUsed: null };
  }
  prefs.componentUsage[componentId].count++;
  prefs.componentUsage[componentId].lastUsed = new Date().toISOString();

  // Also track seasoning usage if it's a seasoning
  const comp = getComponentById(componentId);
  if (comp && comp.category === 'Seasoning') {
    if (!prefs.seasoningUsage[componentId]) {
      prefs.seasoningUsage[componentId] = { count: 0, lastUsed: null };
    }
    prefs.seasoningUsage[componentId].count++;
    prefs.seasoningUsage[componentId].lastUsed = new Date().toISOString();
  }
  updateAiPrefs(prefs);
}

function recordProteinSeasoningPair(proteinType, seasoningId) {
  const prefs = getAiPrefs();
  if (!prefs.proteinSeasoningMap[proteinType]) {
    prefs.proteinSeasoningMap[proteinType] = {};
  }
  if (!prefs.proteinSeasoningMap[proteinType][seasoningId]) {
    prefs.proteinSeasoningMap[proteinType][seasoningId] = 0;
  }
  prefs.proteinSeasoningMap[proteinType][seasoningId]++;
  updateAiPrefs(prefs);
}

function recordSuggestionAccepted(suggestion) {
  const prefs = getAiPrefs();
  prefs.suggestionsAccepted++;
  if (!prefs.dismissedTypes[suggestion.type]) {
    prefs.dismissedTypes[suggestion.type] = { accepted: 0, dismissed: 0 };
  } else if (typeof prefs.dismissedTypes[suggestion.type] === 'number') {
    // Migrate old format
    prefs.dismissedTypes[suggestion.type] = { accepted: 0, dismissed: prefs.dismissedTypes[suggestion.type] };
  }
  prefs.dismissedTypes[suggestion.type].accepted++;
  updateAiPrefs(prefs);
}

function recordSuggestionDismissed(suggestion) {
  const prefs = getAiPrefs();
  prefs.suggestionsDismissed++;
  if (!prefs.dismissedTypes[suggestion.type]) {
    prefs.dismissedTypes[suggestion.type] = { accepted: 0, dismissed: 0 };
  } else if (typeof prefs.dismissedTypes[suggestion.type] === 'number') {
    prefs.dismissedTypes[suggestion.type] = { accepted: 0, dismissed: prefs.dismissedTypes[suggestion.type] };
  }
  prefs.dismissedTypes[suggestion.type].dismissed++;
  updateAiPrefs(prefs);
}

function getTopSeasoningForProtein(proteinType) {
  const prefs = getAiPrefs();
  const map = prefs.proteinSeasoningMap[proteinType];
  if (!map) return [];
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => getComponentById(id))
    .filter(Boolean);
}

function getMostUsedComponents(category, limit) {
  limit = limit || 3;
  const prefs = getAiPrefs();
  return Object.entries(prefs.componentUsage)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([id]) => getComponentById(id))
    .filter(c => c && c.category === category)
    .slice(0, limit);
}

function shouldShowSuggestionType(type) {
  const prefs = getAiPrefs();
  const typeData = prefs.dismissedTypes[type];
  if (!typeData) return true;
  // Support both old (number) and new ({ accepted, dismissed }) format
  const dismissed = typeof typeData === 'number' ? typeData : (typeData.dismissed || 0);
  return dismissed < 5;
}

// ============================================================
// SECTION 5C: GAP-FILLING SUGGESTIONS
// ============================================================
let dismissedSuggestionsThisSession = new Set();

function getGapSuggestions(currentSlots) {
  const suggestions = [];
  const filledSlots = {};
  const filledComps = {};

  // Resolve all filled slots to component objects
  Object.entries(currentSlots).forEach(([role, compId]) => {
    if (compId) {
      const comp = getComponentById(compId);
      if (comp) {
        filledSlots[role] = comp;
        filledComps[role] = comp;
      }
    }
  });

  const hasProtein = !!filledComps.protein;
  const hasVeggie = !!(filledComps.veggie || filledComps.veggie2);
  const hasStarch = !!filledComps.starch;
  const hasSauce = !!filledComps.sauce;
  const filledCount = Object.keys(filledComps).length;

  // Don't suggest on empty plate
  if (filledCount === 0) return [];

  // CHECK 1: Temperature conflict (priority 15)
  if (shouldShowSuggestionType('temp_conflict')) {
    const tempsItems = [];
    Object.entries(filledComps).forEach(([role, comp]) => {
      if (comp.airFryer && comp.airFryer.temp) {
        tempsItems.push({ name: comp.name, temp: comp.airFryer.temp });
      }
    });
    for (let i = 0; i < tempsItems.length; i++) {
      for (let j = i + 1; j < tempsItems.length; j++) {
        const diff = Math.abs(tempsItems[i].temp - tempsItems[j].temp);
        if (diff > 25) {
          suggestions.push({
            type: 'temp_conflict',
            priority: 15,
            message: `${tempsItems[i].name} wants ${tempsItems[i].temp}°F but ${tempsItems[j].name} wants ${tempsItems[j].temp}°F. They may cook unevenly — consider adjusting or cooking separately.`,
            suggestions: []
          });
          break;
        }
      }
      if (suggestions.some(s => s.type === 'temp_conflict')) break;
    }
  }

  // CHECK 2: Missing category (priority 10)
  if (hasProtein && shouldShowSuggestionType('missing_category')) {
    if (!hasVeggie) {
      const veggies = _getSuggestionsForCategory('Veggie');
      if (veggies.length > 0) {
        suggestions.push({
          type: 'missing_category',
          priority: 10,
          message: 'No veggie on this plate — add one to balance it out?',
          suggestions: veggies
        });
      }
    }
    if (!hasStarch) {
      const starches = _getSuggestionsForCategory('Starch');
      if (starches.length > 0) {
        suggestions.push({
          type: 'missing_category',
          priority: 10,
          message: 'No starch in this plate — add some fries or sweet potato?',
          suggestions: starches
        });
      }
    }
    if (!hasSauce) {
      const sauces = _getSuggestionsForCategory('Sauce');
      if (sauces.length > 0) {
        suggestions.push({
          type: 'missing_category',
          priority: 10,
          message: 'No sauce or finishing touch — drizzle something on top?',
          suggestions: sauces
        });
      }
    }
  }

  // CHECK 3: Missing seasoning (priority 8)
  if (hasProtein && shouldShowSuggestionType('missing_seasoning')) {
    const protein = filledComps.protein;
    const hasSeasoning = hasSauce && filledComps.sauce && filledComps.sauce.category === 'Seasoning';
    const hasDefaultSeasoning = protein.defaultSeasoning &&
      ((protein.defaultSeasoning.componentIds && protein.defaultSeasoning.componentIds.length > 0) ||
       (protein.defaultSeasoning.freeText && protein.defaultSeasoning.freeText.trim()));

    if (!hasSeasoning && !hasDefaultSeasoning) {
      const proteinType = (protein.name || '').toLowerCase().split(' ')[0];
      let seasoningSuggestions = getTopSeasoningForProtein(proteinType);
      if (seasoningSuggestions.length === 0) {
        // Fall back to all seasonings sorted by usage
        seasoningSuggestions = getMostUsedComponents('Seasoning', 3);
      }
      if (seasoningSuggestions.length === 0) {
        // Fall back to any available seasonings
        seasoningSuggestions = (state.components || [])
          .filter(c => c.category === 'Seasoning')
          .slice(0, 3);
      }
      if (seasoningSuggestions.length > 0) {
        suggestions.push({
          type: 'missing_seasoning',
          priority: 8,
          message: `Your ${protein.name} doesn't have a seasoning — try one of these?`,
          suggestions: seasoningSuggestions.map(c => ({
            componentId: c.__backendId || c.id,
            name: c.name,
            category: c.category
          }))
        });
      }
    }
  }

  // CHECK 4: Flavor pairing tip (priority 3)
  if (hasProtein && hasVeggie && shouldShowSuggestionType('flavor_tip')) {
    const proteinName = (filledComps.protein.name || '').toLowerCase();
    const veggieComp = filledComps.veggie || filledComps.veggie2;
    const veggieName = (veggieComp.name || '').toLowerCase();

    for (const [proteinKey, pairings] of Object.entries(FLAVOR_PAIRINGS)) {
      if (proteinName.includes(proteinKey)) {
        for (const [veggieKey, tip] of Object.entries(pairings)) {
          if (veggieName.includes(veggieKey)) {
            suggestions.push({
              type: 'flavor_tip',
              priority: 3,
              message: tip,
              suggestions: []
            });
            break;
          }
        }
        break;
      }
    }
  }

  // Filter dismissed types for this session, sort by priority desc, cap at 2
  return suggestions
    .filter(s => !dismissedSuggestionsThisSession.has(s.type))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 2);
}

function _getSuggestionsForCategory(category) {
  // Try AI memory first
  let comps = getMostUsedComponents(category, 3);
  if (comps.length === 0) {
    // Fall back to any available components in this category
    comps = (state.components || [])
      .filter(c => c.category === category)
      .slice(0, 3);
  }
  return comps.map(c => ({
    componentId: c.__backendId || c.id,
    name: c.name,
    category: c.category
  }));
}

function renderGapSuggestions() {
  const suggestions = getGapSuggestions(buildPlateSlots);
  if (suggestions.length === 0) return '';

  const typeColors = {
    'temp_conflict': CONFIG.warning_color,
    'missing_category': CONFIG.primary_action_color,
    'missing_seasoning': '#ff9f0a',
    'flavor_tip': '#64d2ff'
  };

  const typeIcons = {
    'temp_conflict': `<svg width="18" height="18" fill="none" stroke="${CONFIG.warning_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>`,
    'missing_category': `<svg width="18" height="18" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>`,
    'missing_seasoning': `<svg width="18" height="18" fill="none" stroke="#ff9f0a" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>`,
    'flavor_tip': `<svg width="18" height="18" fill="none" stroke="#64d2ff" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"/></svg>`
  };

  return suggestions.map(s => {
    const color = typeColors[s.type] || CONFIG.text_muted;
    const icon = typeIcons[s.type] || '';
    const pills = (s.suggestions || []).map(sug =>
      `<button onclick="acceptGapSuggestion('${s.type}', '${esc(sug.componentId)}')" style="
        min-height: 44px; padding: 8px 14px; border-radius: 20px;
        background: ${CONFIG.surface_elevated}; border: 1px solid ${CONFIG.divider_color};
        color: ${CONFIG.text_color}; font-size: ${CONFIG.type_caption};
        font-family: ${CONFIG.font_family}; cursor: pointer;
        white-space: nowrap;
      ">${esc(sug.name)}</button>`
    ).join('');

    return `
      <div style="
        background: ${CONFIG.surface_color}; border-radius: 12px; padding: 12px 14px;
        margin-bottom: 10px; border-left: 3px solid ${color};
        box-shadow: ${CONFIG.shadow}; position: relative;
        animation: suggestionSlideIn 0.25s ease-out;
      ">
        <button onclick="dismissGapSuggestion('${s.type}')" style="
          position: absolute; top: 8px; right: 8px;
          background: none; border: none; color: ${CONFIG.text_muted};
          cursor: pointer; padding: 4px; font-size: 16px; line-height: 1;
        ">&times;</button>
        <div style="display: flex; align-items: flex-start; gap: 10px; padding-right: 24px;">
          <div style="flex-shrink: 0; margin-top: 1px;">${icon}</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${color}; margin-bottom: 4px;">Suggestion</div>
            <div style="font-size: ${CONFIG.type_body}; color: ${CONFIG.text_color}; line-height: 1.4; margin-bottom: ${pills ? '10px' : '0'};">${esc(s.message)}</div>
            ${pills ? `<div style="display: flex; flex-wrap: wrap; gap: 8px;">${pills}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function acceptGapSuggestion(type, componentId) {
  addComponentToPlate(componentId);
  recordSuggestionAccepted({ type });
}

function dismissGapSuggestion(type) {
  dismissedSuggestionsThisSession.add(type);
  recordSuggestionDismissed({ type });
  render();
}

// ============================================================
// SECTION 6: TIMELINE CALCULATION
// ============================================================
function calculateTimeline(slots) {
  const items = [];
  Object.entries(slots).forEach(([role, compId]) => {
    if (!compId) return;
    const comp = getComponentById(compId);
    if (!comp || !comp.airFryer || !comp.airFryer.cookTime) return;
    items.push({ role, comp, cookTime: comp.airFryer.cookTime });
  });

  if (items.length === 0) return [];

  items.sort((a, b) => b.cookTime - a.cookTime);
  const longestTime = items[0].cookTime;

  return items.map(item => ({
    role: item.role,
    componentId: item.comp.id,
    componentName: item.comp.name,
    category: item.comp.category,
    cookTime: item.cookTime,
    temp: item.comp.airFryer.temp,
    startAtMinute: longestTime - item.cookTime,
    flipAt: item.comp.airFryer.flipAt ? (longestTime - item.cookTime) + item.comp.airFryer.flipAt : null,
    shakeAt: item.comp.airFryer.shakeInterval ? (longestTime - item.cookTime) + item.comp.airFryer.shakeInterval : null,
    notes: item.comp.airFryer.notes || '',
    steps: item.comp.steps || []
  }));
}

function getTotalCookTime(slots) {
  let max = 0;
  Object.values(slots).forEach(compId => {
    if (!compId) return;
    const comp = getComponentById(compId);
    if (comp && comp.airFryer && comp.airFryer.cookTime > max) max = comp.airFryer.cookTime;
  });
  return max;
}

// ============================================================
// SECTION 7: RENDER - COMPONENTS LIBRARY
// ============================================================
function renderComponentsPage() {
  if (extractionState) return renderExtractionFlow();

  const comps = getFilteredComponents();
  const categories = ['All', ...COMPONENT_CATEGORIES];

  return `
    <div style="padding: 12px 0 ${CONFIG.space_2xl};">
      <!-- Header -->
      <div style="padding: 12px 12px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <h1 style="font-size: ${CONFIG.type_title}; font-weight: ${CONFIG.type_title_weight}; color: ${CONFIG.text_color}; margin: 0; letter-spacing: ${CONFIG.type_title_tracking};">Components</h1>
          <button onclick="navigateToView('build-plate')" style="background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; padding: 8px 16px; font-size: ${CONFIG.type_caption}; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Build a Plate
          </button>
        </div>

        <!-- Action bar -->
        <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
          <button onclick="startRecipeExtraction()" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color}; border: 1px solid ${CONFIG.divider_color}; border-radius: 10px; padding: 6px 12px; font-size: ${CONFIG.type_caption}; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
            Import from Recipe
          </button>
          <button onclick="exportComponentsData()" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color}; border: 1px solid ${CONFIG.divider_color}; border-radius: 10px; padding: 6px 12px; font-size: ${CONFIG.type_caption}; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
            Export
          </button>
          <button onclick="showImportComponentsModal()" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color}; border: 1px solid ${CONFIG.divider_color}; border-radius: 10px; padding: 6px 12px; font-size: ${CONFIG.type_caption}; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
            Import
          </button>
        </div>

        <!-- Tabs -->
        <div style="display: flex; gap: 0; margin-bottom: 12px; background: ${CONFIG.surface_color}; border-radius: 10px; padding: 3px;">
          <button onclick="setActiveTab('library')" style="flex: 1; padding: 8px; border: none; border-radius: 8px; font-size: ${CONFIG.type_caption}; font-weight: 600; cursor: pointer; background: ${activeTab === 'library' ? CONFIG.surface_elevated : 'transparent'}; color: ${activeTab === 'library' ? CONFIG.text_color : CONFIG.text_muted};">Library</button>
          <button onclick="setActiveTab('combos')" style="flex: 1; padding: 8px; border: none; border-radius: 8px; font-size: ${CONFIG.type_caption}; font-weight: 600; cursor: pointer; background: ${activeTab === 'combos' ? CONFIG.surface_elevated : 'transparent'}; color: ${activeTab === 'combos' ? CONFIG.text_color : CONFIG.text_muted};">Combos${state.combos.length > 0 ? ' (' + state.combos.length + ')' : ''}</button>
        </div>
      </div>

      ${activeTab === 'combos' ? renderCombosContent() : renderLibraryContent(comps, categories)}
    </div>
  `;
}

function renderLibraryContent(comps, categories) {
  return `
    <!-- Search -->
    <div style="padding: 0 12px 8px;">
      <div style="position: relative;">
        <input type="text" id="componentSearchInput" value="${esc(componentSearchTerm)}" oninput="handleComponentSearch(this.value)" placeholder="Search components..." style="width: 100%; padding: 10px 12px 10px 36px; background: ${CONFIG.surface_color}; border: 1px solid ${CONFIG.divider_color}; border-radius: 10px; color: ${CONFIG.text_color}; font-size: ${CONFIG.type_body}; font-family: ${CONFIG.font_family}; box-sizing: border-box; outline: none;" />
        <svg style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: ${CONFIG.text_muted};" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="category-tabs-scroll" style="margin-bottom: 12px;">
      ${categories.map(cat => `
        <button onclick="setComponentCategory('${cat}')" style="flex-shrink: 0; padding: 6px 14px; border-radius: 20px; border: none; font-size: ${CONFIG.type_caption}; font-weight: 500; cursor: pointer; white-space: nowrap; background: ${componentCategoryFilter === cat ? (cat === 'All' ? CONFIG.primary_action_color : getCategoryColor(cat)) : CONFIG.surface_color}; color: ${componentCategoryFilter === cat ? 'white' : CONFIG.text_muted};">${cat === 'All' ? 'All' : cat + 's'}</button>
      `).join('')}
    </div>

    <!-- Sort -->
    <div style="padding: 0 12px 10px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: ${CONFIG.type_micro_tracking};">${comps.length} component${comps.length !== 1 ? 's' : ''}</span>
      <select onchange="setComponentSort(this.value)" style="background: ${CONFIG.surface_color}; border: 1px solid ${CONFIG.divider_color}; border-radius: 8px; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; padding: 4px 8px; font-family: ${CONFIG.font_family};">
        <option value="name" ${componentSortBy === 'name' ? 'selected' : ''}>Name</option>
        <option value="category" ${componentSortBy === 'category' ? 'selected' : ''}>Category</option>
        <option value="rating" ${componentSortBy === 'rating' ? 'selected' : ''}>Rating</option>
        <option value="recent" ${componentSortBy === 'recent' ? 'selected' : ''}>Recent</option>
      </select>
    </div>

    <!-- Grid -->
    ${comps.length > 0 ? `
      <div class="component-grid">
        ${comps.map(c => renderComponentCard(c)).join('')}
      </div>
    ` : `
      <div style="text-align: center; padding: 48px 24px; color: ${CONFIG.text_muted};">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24" style="margin: 0 auto 12px; opacity: 0.5;"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
        <p style="font-size: ${CONFIG.type_body};">No components found</p>
      </div>
    `}

    <!-- FAB -->
    <button onclick="addNewComponent()" style="position: fixed; bottom: 80px; right: 16px; width: 56px; height: 56px; border-radius: 28px; background: ${CONFIG.primary_action_color}; color: white; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(232,93,93,0.4); display: flex; align-items: center; justify-content: center; z-index: 30;">
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
    </button>
  `;
}

function renderComponentCard(comp) {
  const af = comp.airFryer;
  const afInfo = af ? `${af.temp}F / ${af.cookTime} min` : (comp.cookingMethod || 'No cook');
  const catColor = getCategoryColor(comp.category);

  return `
    <div onclick="openComponentDetail('${comp.id}')" class="component-card-enter" style="background: ${CONFIG.surface_color}; border-radius: ${CONFIG.border_radius}; overflow: hidden; cursor: pointer; box-shadow: ${CONFIG.shadow};">
      <!-- Image / Gradient -->
      <div style="height: 90px; background: ${getCategoryGradient(comp.category)}; display: flex; align-items: center; justify-content: center; position: relative;">
        <span style="font-size: 32px; opacity: 0.6;">${comp.category === 'Protein' ? '\ud83e\udd69' : comp.category === 'Veggie' ? '\ud83e\udd66' : comp.category === 'Starch' ? '\ud83c\udf5e' : comp.category === 'Seasoning' ? '\ud83e\uddc2' : '\ud83e\uded5'}</span>
        ${comp.rating > 0 ? `<div style="position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.5); border-radius: 6px; padding: 2px 6px; font-size: 10px; color: ${CONFIG.warning_color};">${'\u2605'.repeat(comp.rating)}</div>` : ''}
      </div>
      <!-- Info -->
      <div style="padding: 8px 10px 10px;">
        <div style="font-size: ${CONFIG.type_caption}; font-weight: 600; color: ${CONFIG.text_color}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">${esc(comp.name)}</div>
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <span style="font-size: 10px; font-weight: 500; color: white; background: ${catColor}; border-radius: 4px; padding: 1px 6px;">${comp.category}</span>
        </div>
        <div style="font-size: 11px; color: ${CONFIG.text_muted};">${afInfo}</div>
      </div>
    </div>
  `;
}

// ============================================================
// SECTION 8: RENDER - COMPONENT DETAIL
// ============================================================
function renderComponentDetail() {
  const comp = getComponentById(selectedComponentId);
  if (!comp) return `<div style="padding: 24px; color: ${CONFIG.text_muted};">Component not found</div>`;

  const af = comp.airFryer;
  const isEditing = editingComponentId === comp.id;
  const isSeasoningOrSauce = comp.category === 'Seasoning' || comp.category === 'Sauce';

  return `
    <div style="padding: 0 0 ${CONFIG.space_2xl};">
      <!-- Hero -->
      <div style="height: 160px; background: ${getCategoryGradient(comp.category)}; display: flex; align-items: center; justify-content: center; position: relative;">
        <span style="font-size: 64px; opacity: 0.5;">${comp.category === 'Protein' ? '\ud83e\udd69' : comp.category === 'Veggie' ? '\ud83e\udd66' : comp.category === 'Starch' ? '\ud83c\udf5e' : comp.category === 'Seasoning' ? '\ud83e\uddc2' : '\ud83e\uded5'}</span>
        <div style="position: absolute; bottom: 12px; left: 12px; right: 12px;">
          <h1 style="font-size: 22px; font-weight: 700; color: white; margin: 0; text-shadow: 0 1px 4px rgba(0,0,0,0.5);">${esc(comp.name)}</h1>
          <div style="display: flex; gap: 8px; margin-top: 4px;">
            <span style="font-size: 11px; font-weight: 500; color: white; background: rgba(0,0,0,0.4); border-radius: 4px; padding: 2px 8px;">${comp.category}</span>
            ${comp.subcategory ? `<span style="font-size: 11px; color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.3); border-radius: 4px; padding: 2px 8px;">${esc(comp.subcategory)}</span>` : ''}
            <span style="font-size: 11px; color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.3); border-radius: 4px; padding: 2px 8px;">${comp.cookingMethod}</span>
          </div>
        </div>
      </div>

      <div style="padding: 12px;">
        <!-- Air Fryer Settings -->
        ${af ? `
          <div style="background: ${CONFIG.surface_color}; border-radius: ${CONFIG.border_radius}; padding: 14px; margin-bottom: 12px; box-shadow: ${CONFIG.shadow};">
            <div style="font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color}; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"/></svg>
              Air Fryer Settings
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              <div style="background: ${CONFIG.surface_elevated}; border-radius: 10px; padding: 10px; text-align: center;">
                <div style="font-size: 10px; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Temp</div>
                <div style="font-size: 20px; font-weight: 700; color: ${CONFIG.primary_action_color};">${af.temp}°F</div>
              </div>
              <div style="background: ${CONFIG.surface_elevated}; border-radius: 10px; padding: 10px; text-align: center;">
                <div style="font-size: 10px; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Cook Time</div>
                <div style="font-size: 20px; font-weight: 700; color: ${CONFIG.text_color};">${af.cookTime} min</div>
              </div>
              ${af.flipHalfway || af.flipAt ? `
                <div style="background: ${CONFIG.surface_elevated}; border-radius: 10px; padding: 10px; text-align: center;">
                  <div style="font-size: 10px; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Flip At</div>
                  <div style="font-size: 20px; font-weight: 700; color: ${CONFIG.warning_color};">${af.flipAt || Math.floor(af.cookTime / 2)} min</div>
                </div>
              ` : ''}
              ${af.shakeInterval ? `
                <div style="background: ${CONFIG.surface_elevated}; border-radius: 10px; padding: 10px; text-align: center;">
                  <div style="font-size: 10px; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Shake At</div>
                  <div style="font-size: 20px; font-weight: 700; color: ${CONFIG.warning_color};">${af.shakeInterval} min</div>
                </div>
              ` : ''}
            </div>
            ${af.notes ? `<div style="margin-top: 8px; font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_muted}; font-style: italic;">${esc(af.notes)}</div>` : ''}
          </div>
        ` : ''}

        <!-- Default Seasoning -->
        ${comp.defaultSeasoning && comp.defaultSeasoning.freeText ? `
          <div style="background: ${CONFIG.surface_color}; border-radius: ${CONFIG.border_radius}; padding: 14px; margin-bottom: 12px; box-shadow: ${CONFIG.shadow};">
            <div style="font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color}; margin-bottom: 8px;">Default Seasoning</div>
            <div style="font-size: ${CONFIG.type_body}; color: ${CONFIG.text_muted};">${esc(comp.defaultSeasoning.freeText)}</div>
          </div>
        ` : ''}

        <!-- Ingredients (for Seasoning/Sauce) -->
        ${isSeasoningOrSauce && comp.ingredients && comp.ingredients.length > 0 ? `
          <div style="background: ${CONFIG.surface_color}; border-radius: ${CONFIG.border_radius}; padding: 14px; margin-bottom: 12px; box-shadow: ${CONFIG.shadow};">
            <div style="font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color}; margin-bottom: 10px;">Ingredients</div>
            ${comp.ingredients.map(ing => `
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid ${CONFIG.divider_color};">
                <span style="font-size: ${CONFIG.type_body}; color: ${CONFIG.text_color};">${esc(ing.name)}</span>
                <span style="font-size: ${CONFIG.type_body}; color: ${CONFIG.text_muted};">${esc(ing.amount)} ${esc(ing.unit)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Steps -->
        ${comp.steps && comp.steps.length > 0 ? `
          <div style="background: ${CONFIG.surface_color}; border-radius: ${CONFIG.border_radius}; padding: 14px; margin-bottom: 12px; box-shadow: ${CONFIG.shadow};">
            <div style="font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color}; margin-bottom: 10px;">Steps</div>
            ${comp.steps.map((step, i) => {
              const stepId = step.id || ('auto_' + i);
              const typeColors = { prep: CONFIG.text_muted, season: '#ff9f0a', cook: CONFIG.primary_action_color, rest: '#5e5ce6', finish: CONFIG.success_color };
              const effectiveMediaUrl = step.mediaUrl || step.defaultMediaUrl;
              const hasVideo = !!effectiveMediaUrl;
              const isUserOverride = !!step.mediaUrl && !!step.defaultMediaUrl && step.mediaUrl !== step.defaultMediaUrl;
              const canDelete = hasVideo && (cachedIsAdmin || isUserOverride || (step.mediaUrl && !step.defaultMediaUrl));
              const isFormOpen = videoFormOpenForStep === stepId;
              const isVideoExpanded = expandedVideoStepId === stepId;
              const isUploading = videoUploadInProgress === stepId;
              return `
                <div style="padding: 8px 0; ${i < comp.steps.length - 1 ? 'border-bottom: 1px solid ' + CONFIG.divider_color + ';' : ''}">
                  <div style="display: flex; gap: 10px; align-items: flex-start;">
                    <div style="flex-shrink: 0; width: 24px; height: 24px; border-radius: 12px; background: ${typeColors[step.type] || CONFIG.text_muted}20; color: ${typeColors[step.type] || CONFIG.text_muted}; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;">${i + 1}</div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-size: ${CONFIG.type_body}; color: ${CONFIG.text_color};">${esc(step.action)}</div>
                      <div style="font-size: 11px; color: ${CONFIG.text_muted}; margin-top: 2px;">
                        <span style="text-transform: capitalize;">${step.type}</span>${step.duration ? ` \u00b7 ${step.duration} min` : ''}
                      </div>
                    </div>
                    <div style="flex-shrink: 0; display: flex; gap: 4px; align-items: center;">
                      ${hasVideo ? `
                        <button onclick="toggleStepVideoPlayback('${stepId}')" style="background: none; border: none; padding: 10px; cursor: pointer; color: ${CONFIG.primary_action_color}; display: flex; align-items: center; gap: 4px;" title="Play video">
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                        ${isUserOverride ? `<span style="font-size: 10px; color: ${CONFIG.text_muted}; font-weight: 500;">yours</span>` : ''}
                        ${canDelete ? `
                          <button onclick="removeStepVideo('${comp.id}', ${i})" style="background: none; border: none; padding: 10px; cursor: pointer; color: ${CONFIG.text_muted};" title="Remove video">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        ` : ''}
                      ` : `
                        <button onclick="videoFormOpenForStep = '${stepId}'; render();" style="background: none; border: none; padding: 10px; cursor: pointer; color: ${CONFIG.text_muted}; font-size: 11px; white-space: nowrap; display: flex; align-items: center; gap: 4px;" title="Add video">
                          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
                          + Video
                        </button>
                      `}
                    </div>
                  </div>
                  ${isUserOverride ? `
                    <div style="margin: 4px 0 0 34px;">
                      <button onclick="resetStepVideoToDefault('${comp.id}', ${i})" style="background: none; border: none; padding: 4px 0; cursor: pointer; color: ${CONFIG.primary_action_color}; font-size: 11px;">Reset to default</button>
                    </div>
                  ` : ''}
                  ${isFormOpen ? `
                    <div style="margin: 8px 0 4px 34px; background: ${CONFIG.surface_elevated}; border-radius: 12px; padding: 12px;">
                      ${isUploading ? `
                        <div style="text-align: center; padding: 12px 0;">
                          <div style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_muted}; margin-bottom: 8px;">Uploading video...</div>
                          <div style="height: 4px; background: ${CONFIG.divider_color}; border-radius: 2px; overflow: hidden;">
                            <div style="width: 50%; height: 100%; background: ${CONFIG.primary_action_color}; border-radius: 2px; animation: uploadPulse 1.5s ease-in-out infinite;"></div>
                          </div>
                        </div>
                      ` : `
                        <input type="file" id="videoFileInput_${i}" accept="video/mp4,video/quicktime,video/webm,video/*" capture="environment" style="display: none;" onchange="handleVideoFileSelected('${comp.id}', ${i})" />
                        <button onclick="document.getElementById('videoFileInput_${i}').click();" style="width: 100%; padding: 14px; border: none; border-radius: 10px; background: ${CONFIG.primary_action_color}; color: white; font-size: ${CONFIG.type_body}; font-weight: 600; font-family: ${CONFIG.font_family}; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px;">
                          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
                          Record / Choose Video
                        </button>
                        <div style="display: flex; align-items: center; gap: 8px; margin: 10px 0 6px 0;">
                          <div style="flex: 1; height: 1px; background: ${CONFIG.divider_color};"></div>
                          <span style="font-size: 11px; color: ${CONFIG.text_muted};">or paste a link</span>
                          <div style="flex: 1; height: 1px; background: ${CONFIG.divider_color};"></div>
                        </div>
                        <input type="url" id="videoUrlInput_${i}" placeholder="Paste YouTube or video URL" style="width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid ${CONFIG.divider_color}; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; font-size: ${CONFIG.type_caption}; font-family: ${CONFIG.font_family}; box-sizing: border-box;" ${step.mediaUrl ? `value="${esc(step.mediaUrl)}"` : ''} />
                        <div style="display: flex; gap: 8px; margin-top: 8px;">
                          <button onclick="videoFormOpenForStep = null; render();" style="flex: 1; padding: 10px; border: none; border-radius: 8px; background: ${CONFIG.background_color}; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; font-family: ${CONFIG.font_family}; cursor: pointer;">Cancel</button>
                          <button onclick="saveStepVideo('${comp.id}', ${i})" style="flex: 1; padding: 10px; border: none; border-radius: 8px; background: ${CONFIG.primary_action_color}; color: white; font-size: ${CONFIG.type_caption}; font-weight: 600; font-family: ${CONFIG.font_family}; cursor: pointer;">Save URL</button>
                        </div>
                      `}
                    </div>
                  ` : ''}
                  ${isVideoExpanded && hasVideo ? `
                    <div style="margin: 8px 0 4px 34px;">
                      ${renderVideoPlayer(effectiveMediaUrl)}
                      <button onclick="expandedVideoStepId = null; render();" style="margin-top: 8px; background: none; border: 1px solid ${CONFIG.divider_color}; border-radius: 8px; padding: 6px 14px; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        Close
                      </button>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}

        <!-- Tags -->
        ${comp.tags && comp.tags.length > 0 ? `
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; padding: 0 2px;">
            ${comp.tags.map(tag => `<span style="font-size: 11px; color: ${CONFIG.text_muted}; background: ${CONFIG.surface_color}; border-radius: 6px; padding: 4px 10px;">#${esc(tag)}</span>`).join('')}
          </div>
        ` : ''}

        <!-- Actions -->
        <div style="display: flex; gap: 10px; margin-top: 16px;">
          <button onclick="addComponentToPlate('${comp.id}')" style="flex: 1; padding: 12px; border: none; border-radius: 12px; background: ${CONFIG.primary_action_color}; color: white; font-size: ${CONFIG.type_body}; font-weight: 600; cursor: pointer;">Add to Plate</button>
          <button onclick="deleteComponent('${comp.id}')" style="padding: 12px 16px; border: none; border-radius: 12px; background: ${CONFIG.surface_color}; color: ${CONFIG.danger_color}; font-size: ${CONFIG.type_body}; cursor: pointer;">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SECTION 9: RENDER - BUILD A PLATE
// ============================================================
function renderBuildPlate() {
  const timeline = calculateTimeline(buildPlateSlots);
  const totalTime = getTotalCookTime(buildPlateSlots);
  const hasAnySlots = Object.values(buildPlateSlots).some(v => v);

  return `
    <div style="padding: 12px 12px ${CONFIG.space_2xl};">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h2 style="font-size: ${CONFIG.type_title}; font-weight: ${CONFIG.type_title_weight}; color: ${CONFIG.text_color}; margin: 0;">Build a Plate</h2>
        ${hasAnySlots ? `<button onclick="clearPlateSlots()" style="background: none; border: none; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; cursor: pointer;">Clear All</button>` : ''}
      </div>

      <!-- Slots -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
        ${PLATE_SLOTS.map(slot => {
          const compId = buildPlateSlots[slot.role];
          const comp = compId ? getComponentById(compId) : null;
          return renderPlateSlot(slot, comp);
        }).join('')}
      </div>

      <!-- AI Gap-Filling Suggestions -->
      ${renderGapSuggestions()}

      ${timeline.length > 0 ? `
        <!-- Timeline Preview -->
        <div style="background: ${CONFIG.surface_color}; border-radius: ${CONFIG.border_radius}; padding: 14px; margin-bottom: 16px; box-shadow: ${CONFIG.shadow};">
          <div style="font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color}; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Cook Timeline
          </div>
          <div style="font-size: 28px; font-weight: 700; color: ${CONFIG.primary_action_color}; margin-bottom: 12px;">${formatMinutes(totalTime)} total</div>
          ${timeline.map(item => `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid ${CONFIG.divider_color};">
              <div style="width: 50px; font-size: 13px; font-weight: 600; color: ${item.startAtMinute === 0 ? CONFIG.primary_action_color : CONFIG.text_color};">${item.startAtMinute === 0 ? 'Start' : item.startAtMinute + ':00'}</div>
              <div style="flex: 1;">
                <div style="font-size: ${CONFIG.type_body}; color: ${CONFIG.text_color};">${esc(item.componentName)}</div>
                <div style="font-size: 11px; color: ${CONFIG.text_muted};">${item.temp}°F · ${item.cookTime} min${item.flipAt ? ' · Flip at ' + (item.flipAt - item.startAtMinute) + ' min' : ''}${item.shakeAt ? ' · Shake at ' + (item.shakeAt - item.startAtMinute) + ' min' : ''}</div>
              </div>
              <div style="width: 8px; height: 8px; border-radius: 4px; background: ${getCategoryColor(item.category)};"></div>
            </div>
          `).join('')}
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button onclick="startCookMode()" style="padding: 14px; border: none; border-radius: 12px; background: ${CONFIG.primary_action_color}; color: white; font-size: ${CONFIG.type_body}; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"/></svg>
            Start Cooking
          </button>
          <button onclick="showSaveComboModal()" style="padding: 14px; border: none; border-radius: 12px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; font-size: ${CONFIG.type_body}; font-weight: 600; cursor: pointer; box-shadow: ${CONFIG.shadow};">Save as Combo</button>
        </div>
      ` : `
        <div style="text-align: center; padding: 32px; color: ${CONFIG.text_muted};">
          <p style="font-size: ${CONFIG.type_body}; margin-bottom: 4px;">Tap a slot to add components</p>
          <p style="font-size: ${CONFIG.type_caption};">Your timeline will appear here</p>
        </div>
      `}
    </div>
  `;
}

function renderPlateSlot(slot, comp) {
  if (comp) {
    const af = comp.airFryer;
    return `
      <div style="background: ${CONFIG.surface_color}; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px; box-shadow: ${CONFIG.shadow}; border-left: 3px solid ${slot.color};">
        <div style="width: 44px; height: 44px; border-radius: 10px; background: ${getCategoryGradient(comp.category)}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="font-size: 20px;">${comp.category === 'Protein' ? '\ud83e\udd69' : comp.category === 'Veggie' ? '\ud83e\udd66' : comp.category === 'Starch' ? '\ud83c\udf5e' : comp.category === 'Seasoning' ? '\ud83e\uddc2' : '\ud83e\uded5'}</span>
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: ${CONFIG.type_body}; font-weight: 600; color: ${CONFIG.text_color}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(comp.name)}</div>
          <div style="font-size: 11px; color: ${CONFIG.text_muted};">${af ? af.temp + '°F · ' + af.cookTime + ' min' : comp.cookingMethod || 'No cook'}</div>
        </div>
        <button onclick="event.stopPropagation(); removeFromPlateSlot('${slot.role}')" style="width: 32px; height: 32px; border-radius: 16px; border: none; background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_muted}; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    `;
  }

  return `
    <div onclick="openComponentPicker('${slot.role}', '${slot.category}')" style="border: 2px dashed ${CONFIG.divider_color}; border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-left: 3px solid ${slot.color}40;">
      <div style="width: 44px; height: 44px; border-radius: 10px; background: ${CONFIG.surface_elevated}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="20" height="20" fill="none" stroke="${CONFIG.text_muted}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
      </div>
      <div style="font-size: ${CONFIG.type_body}; color: ${CONFIG.text_muted};">Add ${slot.label}</div>
    </div>
  `;
}

// ============================================================
// SECTION 10: RENDER - COOK MODE
// ============================================================
function renderCookMode() {
  const totalSeconds = cookModeTotalTime * 60;
  const remaining = Math.max(0, totalSeconds - cookModeElapsedSeconds);
  const progress = totalSeconds > 0 ? (cookModeElapsedSeconds / totalSeconds) * 100 : 0;
  const done = remaining <= 0;

  return `
    <div style="padding: 12px 12px ${CONFIG.space_2xl}; min-height: 80vh;">
      <!-- Timer -->
      <div style="text-align: center; padding: 24px 0 20px;">
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: ${CONFIG.text_muted}; margin-bottom: 8px;">${done ? 'DONE!' : 'TIME REMAINING'}</div>
        <div id="cook-timer-display" style="font-size: 56px; font-weight: 700; color: ${done ? CONFIG.success_color : CONFIG.text_color}; font-variant-numeric: tabular-nums; letter-spacing: -2px;">${formatTimer(remaining)}</div>
        <!-- Progress bar -->
        <div style="margin: 12px auto; width: 80%; height: 4px; background: ${CONFIG.surface_elevated}; border-radius: 2px; overflow: hidden;">
          <div style="width: ${Math.min(100, progress)}%; height: 100%; background: ${done ? CONFIG.success_color : CONFIG.primary_action_color}; border-radius: 2px; transition: width 1s linear;"></div>
        </div>
        <div style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_muted};">Elapsed: ${formatTimer(cookModeElapsedSeconds)}</div>
      </div>

      <!-- Timeline Cards -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
        ${cookModeTimeline.map((item, idx) => {
          const itemStartSec = item.startAtMinute * 60;
          const itemEndSec = (item.startAtMinute + item.cookTime) * 60;
          const isActive = cookModeElapsedSeconds >= itemStartSec && cookModeElapsedSeconds < itemEndSec;
          const isCompleted = cookModeElapsedSeconds >= itemEndSec;
          const isUpcoming = cookModeElapsedSeconds < itemStartSec;
          const flipSec = item.flipAt !== null ? item.flipAt * 60 : null;
          const shakeSec = item.shakeAt !== null ? item.shakeAt * 60 : null;
          const showFlipReminder = flipSec && cookModeElapsedSeconds >= flipSec - 5 && cookModeElapsedSeconds <= flipSec + 30 && !cookModeDismissedReminders['flip_' + idx];
          const showShakeReminder = shakeSec && cookModeElapsedSeconds >= shakeSec - 5 && cookModeElapsedSeconds <= shakeSec + 30 && !cookModeDismissedReminders['shake_' + idx];

          const stepsWithVideo = (item.steps || []).filter(s => s.mediaUrl || s.defaultMediaUrl);
          return `
            <div class="timeline-card ${isActive ? 'cook-mode-active' : ''} ${isCompleted ? 'cook-mode-completed' : ''}" style="background: ${CONFIG.surface_color}; border-radius: 12px; padding: 12px; box-shadow: ${CONFIG.shadow}; border-left: 3px solid ${isActive ? CONFIG.primary_action_color : isCompleted ? CONFIG.success_color : CONFIG.divider_color};">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: ${CONFIG.type_body}; font-weight: 600; color: ${CONFIG.text_color};">${esc(item.componentName)}</span>
                  ${stepsWithVideo.length > 0 ? `<svg width="14" height="14" fill="${CONFIG.primary_action_color}" viewBox="0 0 24 24" style="flex-shrink: 0;"><path d="M8 5v14l11-7z"/></svg>` : ''}
                </div>
                <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px; background: ${isActive ? CONFIG.primary_action_color + '20' : isCompleted ? CONFIG.success_color + '20' : CONFIG.surface_elevated}; color: ${isActive ? CONFIG.primary_action_color : isCompleted ? CONFIG.success_color : CONFIG.text_muted};">
                  ${isCompleted ? 'Done' : isActive ? 'NOW' : 'At ' + item.startAtMinute + ':00'}
                </span>
              </div>
              <div style="font-size: 11px; color: ${CONFIG.text_muted};">${item.temp}\u00b0F \u00b7 ${item.cookTime} min</div>
              ${showFlipReminder ? `
                <div style="margin-top: 8px; padding: 8px 10px; background: ${CONFIG.warning_color}20; border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: ${CONFIG.type_caption}; font-weight: 600; color: ${CONFIG.warning_color};">FLIP NOW!</span>
                  <button onclick="dismissReminder('flip_${idx}')" style="background: none; border: none; color: ${CONFIG.text_muted}; font-size: 11px; cursor: pointer;">Dismiss</button>
                </div>
              ` : ''}
              ${showShakeReminder ? `
                <div style="margin-top: 8px; padding: 8px 10px; background: ${CONFIG.warning_color}20; border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: ${CONFIG.type_caption}; font-weight: 600; color: ${CONFIG.warning_color};">SHAKE BASKET!</span>
                  <button onclick="dismissReminder('shake_${idx}')" style="background: none; border: none; color: ${CONFIG.text_muted}; font-size: 11px; cursor: pointer;">Dismiss</button>
                </div>
              ` : ''}
              ${stepsWithVideo.length > 0 ? `
                <div style="margin-top: 8px; border-top: 1px solid ${CONFIG.divider_color}; padding-top: 8px;">
                  ${stepsWithVideo.map(s => {
                    const sId = s.id || 'auto';
                    const isExpanded = expandedVideoStepId === sId;
                    return `
                      <div style="margin-bottom: 6px;">
                        <div onclick="toggleStepVideoPlayback('${sId}')" style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 4px 0;">
                          <svg width="14" height="14" fill="${CONFIG.primary_action_color}" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          <span style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_color}; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${esc(s.action)}</span>
                        </div>
                        ${isExpanded ? `
                          <div style="margin-top: 4px;">
                            ${renderVideoPlayer(s.mediaUrl || s.defaultMediaUrl)}
                            <button onclick="expandedVideoStepId = null; render();" style="margin-top: 6px; background: none; border: 1px solid ${CONFIG.divider_color}; border-radius: 6px; padding: 4px 10px; color: ${CONFIG.text_muted}; font-size: 11px; cursor: pointer;">Close</button>
                          </div>
                        ` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <!-- Controls -->
      <div style="display: flex; gap: 10px;">
        ${done ? `
          <button onclick="finishCookMode()" style="flex: 1; padding: 14px; border: none; border-radius: 12px; background: ${CONFIG.success_color}; color: white; font-size: ${CONFIG.type_body}; font-weight: 600; cursor: pointer;">Done!</button>
        ` : `
          <button onclick="stopCookMode()" style="flex: 1; padding: 14px; border: none; border-radius: 12px; background: ${CONFIG.surface_color}; color: ${CONFIG.danger_color}; font-size: ${CONFIG.type_body}; font-weight: 600; cursor: pointer; box-shadow: ${CONFIG.shadow};">Stop</button>
        `}
      </div>
    </div>
  `;
}

// ============================================================
// SECTION 11: RENDER - COMBOS
// ============================================================
function renderCombosContent() {
  let combos = [...state.combos];

  if (comboSearchTerm.trim()) {
    const term = comboSearchTerm.toLowerCase();
    combos = combos.filter(c => c.name.toLowerCase().includes(term));
  }

  switch (comboSortBy) {
    case 'recent': combos.sort((a, b) => {
      const aT = a.lastCooked ? new Date(a.lastCooked).getTime() : new Date(a.createdAt).getTime();
      const bT = b.lastCooked ? new Date(b.lastCooked).getTime() : new Date(b.createdAt).getTime();
      return bT - aT;
    }); break;
    case 'rating': combos.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    case 'fastest': combos.sort((a, b) => {
      const aSlots = {}; (a.slots || []).forEach(s => { aSlots[s.role] = s.componentId; });
      const bSlots = {}; (b.slots || []).forEach(s => { bSlots[s.role] = s.componentId; });
      return getTotalCookTime(aSlots) - getTotalCookTime(bSlots);
    }); break;
  }

  if (combos.length === 0) {
    return `
      <div style="text-align: center; padding: 48px 24px; color: ${CONFIG.text_muted};">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24" style="margin: 0 auto 12px; opacity: 0.5;"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
        <p style="font-size: ${CONFIG.type_body}; margin-bottom: 4px;">No saved combos yet</p>
        <p style="font-size: ${CONFIG.type_caption};">Build a plate and save it as a combo</p>
      </div>
    `;
  }

  return `
    <div style="padding: 0 12px;">
      <!-- Sort -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase;">${combos.length} combo${combos.length !== 1 ? 's' : ''}</span>
        <select onchange="setComboSort(this.value)" style="background: ${CONFIG.surface_color}; border: 1px solid ${CONFIG.divider_color}; border-radius: 8px; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; padding: 4px 8px; font-family: ${CONFIG.font_family};">
          <option value="recent" ${comboSortBy === 'recent' ? 'selected' : ''}>Recent</option>
          <option value="rating" ${comboSortBy === 'rating' ? 'selected' : ''}>Rating</option>
          <option value="fastest" ${comboSortBy === 'fastest' ? 'selected' : ''}>Fastest</option>
        </select>
      </div>

      <!-- Combo Cards -->
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${combos.map(combo => {
          const slots = {};
          (combo.slots || []).forEach(s => { slots[s.role] = s.componentId; });
          const totalTime = getTotalCookTime(slots);
          const compNames = (combo.slots || []).map(s => {
            const c = getComponentById(s.componentId);
            return c ? c.name : 'Unknown';
          });

          return `
            <div style="background: ${CONFIG.surface_color}; border-radius: ${CONFIG.border_radius}; padding: 14px; box-shadow: ${CONFIG.shadow};">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div>
                  <div style="font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color};">${esc(combo.name)}</div>
                  <div style="font-size: 11px; color: ${CONFIG.text_muted}; margin-top: 2px;">${compNames.join(' · ')}</div>
                </div>
                <div style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.primary_action_color}; font-weight: 600;">${totalTime > 0 ? formatMinutes(totalTime) : ''}</div>
              </div>
              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button onclick="loadCombo('${combo.id}')" style="flex: 1; padding: 8px; border: none; border-radius: 8px; background: ${CONFIG.primary_action_color}; color: white; font-size: ${CONFIG.type_caption}; font-weight: 600; cursor: pointer;">Cook Again</button>
                <button onclick="deleteCombo('${combo.id}')" style="padding: 8px 12px; border: none; border-radius: 8px; background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; cursor: pointer;">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ============================================================
// SECTION 12: COMPONENT PICKER MODAL
// ============================================================
function openComponentPicker(role, category) {
  const comps = state.components.filter(c => c.category === category).sort((a, b) => a.name.localeCompare(b.name));

  const content = `
    <div style="padding: 4px 0;">
      <div style="font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color}; margin-bottom: 12px;">Choose ${category}</div>
      <input type="text" id="pickerSearchInput" oninput="filterPicker('${role}', '${category}', this.value)" placeholder="Search ${category.toLowerCase()}s..." style="width: 100%; padding: 10px 12px; background: ${CONFIG.surface_elevated}; border: 1px solid ${CONFIG.divider_color}; border-radius: 10px; color: ${CONFIG.text_color}; font-size: ${CONFIG.type_body}; font-family: ${CONFIG.font_family}; box-sizing: border-box; outline: none; margin-bottom: 10px;" />
      <div id="pickerList" style="max-height: 50vh; overflow-y: auto;">
        ${comps.map(c => renderPickerItem(c, role)).join('')}
      </div>
    </div>
  `;

  openModal(content);
}

function renderPickerItem(comp, role) {
  const af = comp.airFryer;
  return `
    <div onclick="selectComponent('${role}', '${comp.id}')" style="display: flex; align-items: center; gap: 12px; padding: 10px 8px; border-bottom: 1px solid ${CONFIG.divider_color}; cursor: pointer;">
      <div style="width: 40px; height: 40px; border-radius: 10px; background: ${getCategoryGradient(comp.category)}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <span style="font-size: 18px;">${comp.category === 'Protein' ? '\ud83e\udd69' : comp.category === 'Veggie' ? '\ud83e\udd66' : comp.category === 'Starch' ? '\ud83c\udf5e' : comp.category === 'Seasoning' ? '\ud83e\uddc2' : '\ud83e\uded5'}</span>
      </div>
      <div style="flex: 1;">
        <div style="font-size: ${CONFIG.type_body}; color: ${CONFIG.text_color}; font-weight: 500;">${esc(comp.name)}</div>
        <div style="font-size: 11px; color: ${CONFIG.text_muted};">${af ? af.temp + '°F · ' + af.cookTime + ' min' : comp.cookingMethod || 'No cook'}</div>
      </div>
    </div>
  `;
}

function filterPicker(role, category, searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  let comps = state.components.filter(c => c.category === category);
  if (term) {
    comps = comps.filter(c => c.name.toLowerCase().includes(term));
  }
  comps.sort((a, b) => a.name.localeCompare(b.name));
  const list = document.getElementById('pickerList');
  if (list) {
    list.innerHTML = comps.map(c => renderPickerItem(c, role)).join('');
  }
}

// ============================================================
// SECTION 13: ACTION FUNCTIONS
// ============================================================
function navigateToView(view) {
  state.currentView = view;
  render();
}

function setActiveTab(tab) {
  activeTab = tab;
  render();
}

function handleComponentSearch(value) {
  componentSearchTerm = value;
  render();
  setTimeout(() => {
    const input = document.getElementById('componentSearchInput');
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }, 0);
}

function setComponentCategory(cat) {
  componentCategoryFilter = cat;
  render();
}

function setComponentSort(val) {
  componentSortBy = val;
  render();
}

function setComboSort(val) {
  comboSortBy = val;
  render();
}

function openComponentDetail(id) {
  selectedComponentId = id;
  state.currentView = 'component-detail';
  render();
}

function addNewComponent() {
  const newComp = {
    id: generateComponentId(), type: 'component', name: 'New Component',
    category: 'Protein', subcategory: '', cookingMethod: 'Air Fry',
    steps: [], airFryer: { temp: 400, cookTime: 10, flipHalfway: false, flipAt: null, shakeInterval: null, notes: '' },
    defaultSeasoning: { componentIds: [], freeText: '' }, ingredients: [],
    pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: [],
    image_url: '', createdAt: new Date().toISOString(), lastUsed: null, source: 'user'
  };
  storage.create(newComp);
  selectedComponentId = newComp.id;
  state.currentView = 'component-detail';
  render();
}

function deleteComponent(id) {
  const comp = getComponentById(id);
  if (!comp) return;
  if (!confirm('Delete "' + comp.name + '"?')) return;
  storage.delete(comp);
  if (selectedComponentId === id) selectedComponentId = null;
  state.currentView = 'components';
  render();
  showToast('Component deleted', 'info');
}

function addComponentToPlate(compId) {
  const comp = getComponentById(compId);
  if (!comp) return;
  // Find the right slot based on category
  const catToRole = { 'Protein': 'protein', 'Veggie': 'veggie', 'Starch': 'starch', 'Sauce': 'sauce', 'Seasoning': 'sauce' };
  let role = catToRole[comp.category] || 'sauce';
  // If primary slot is taken, try secondary
  if (role === 'veggie' && buildPlateSlots.veggie) role = 'veggie2';
  buildPlateSlots[role] = compId;
  buildPlateTimeline = calculateTimeline(buildPlateSlots);
  state.currentView = 'build-plate';
  render();
  showToast(comp.name + ' added to plate', 'success');
}

function selectComponent(role, compId) {
  buildPlateSlots[role] = compId;
  buildPlateTimeline = calculateTimeline(buildPlateSlots);
  closeModal();
  render();
}

function removeFromPlateSlot(role) {
  buildPlateSlots[role] = null;
  buildPlateTimeline = calculateTimeline(buildPlateSlots);
  render();
}

function clearPlateSlots() {
  buildPlateSlots = { protein: null, veggie: null, veggie2: null, starch: null, sauce: null };
  buildPlateTimeline = [];
  render();
}

// ── Cook Mode ──
function startCookMode() {
  cookModeTimeline = calculateTimeline(buildPlateSlots);
  cookModeTotalTime = getTotalCookTime(buildPlateSlots);
  cookModeStartTime = Date.now();
  cookModeElapsedSeconds = 0;
  cookModeCompletedSteps = {};
  cookModeDismissedReminders = {};
  cookModeActive = true;

  state.currentView = 'cook-mode';
  render();

  cookModeTimerInterval = setInterval(() => {
    cookModeElapsedSeconds = Math.floor((Date.now() - cookModeStartTime) / 1000);
    // Targeted update for timer display
    const timerEl = document.getElementById('cook-timer-display');
    if (timerEl) {
      const remaining = Math.max(0, (cookModeTotalTime * 60) - cookModeElapsedSeconds);
      timerEl.textContent = formatTimer(remaining);
      if (remaining <= 0 && cookModeActive) {
        cookModeActive = false;
        clearInterval(cookModeTimerInterval);
        cookModeTimerInterval = null;
        render(); // Full re-render to show done state
      }
    }
    // Check for flip/shake reminders — re-render if one triggers
    cookModeTimeline.forEach((item, idx) => {
      const flipSec = item.flipAt !== null ? item.flipAt * 60 : null;
      const shakeSec = item.shakeAt !== null ? item.shakeAt * 60 : null;
      if (flipSec && cookModeElapsedSeconds === flipSec && !cookModeDismissedReminders['flip_' + idx]) {
        render();
      }
      if (shakeSec && cookModeElapsedSeconds === shakeSec && !cookModeDismissedReminders['shake_' + idx]) {
        render();
      }
    });
  }, 1000);
}

function stopCookMode() {
  if (!confirm('Stop cooking? Timer will be reset.')) return;
  clearInterval(cookModeTimerInterval);
  cookModeTimerInterval = null;
  cookModeActive = false;
  state.currentView = 'build-plate';
  render();
}

function finishCookMode() {
  clearInterval(cookModeTimerInterval);
  cookModeTimerInterval = null;
  cookModeActive = false;
  // Increment timesCooked for each component
  Object.values(buildPlateSlots).forEach(compId => {
    if (!compId) return;
    const comp = getComponentById(compId);
    if (comp) {
      comp.timesCooked = (comp.timesCooked || 0) + 1;
      comp.lastUsed = new Date().toISOString();
      storage.update(comp);
    }
  });
  // AI Memory: record usage
  Object.values(buildPlateSlots).forEach(compId => {
    if (compId) recordComponentUsage(compId);
  });
  // Record protein-seasoning pairs
  const plateProtein = buildPlateSlots.protein ? getComponentById(buildPlateSlots.protein) : null;
  const sauceComp = buildPlateSlots.sauce ? getComponentById(buildPlateSlots.sauce) : null;
  if (plateProtein && sauceComp && sauceComp.category === 'Seasoning') {
    const proteinType = (plateProtein.name || '').toLowerCase().split(' ')[0];
    recordProteinSeasoningPair(proteinType, sauceComp.__backendId || sauceComp.id);
  }

  showToast('Cooking complete!', 'success');
  state.currentView = 'build-plate';
  render();
}

function dismissReminder(key) {
  cookModeDismissedReminders[key] = true;
  render();
}

// ── Step Video ──
async function handleVideoFileSelected(compId, stepIndex) {
  const input = document.getElementById('videoFileInput_' + stepIndex);
  const file = input?.files?.[0];
  if (!file) return;

  const comp = getComponentById(compId);
  if (!comp || !comp.steps[stepIndex]) return;
  const step = comp.steps[stepIndex];
  const stepId = step.id || ('auto_' + stepIndex);

  if (!file.type.startsWith('video/')) {
    showToast('Please select a video file', 'error');
    return;
  }
  if (file.size > 50 * 1024 * 1024) {
    showToast('Video must be under 50MB', 'error');
    return;
  }

  // Show upload progress
  videoUploadInProgress = stepId;
  render();

  showToast('Uploading video...', 'info');
  const result = await uploadStepVideo(file, compId, stepId);

  videoUploadInProgress = null;

  if (!result) {
    render();
    return;
  }

  const isAdmin = cachedIsAdmin;
  if (isAdmin) {
    step.defaultMediaUrl = result.videoUrl;
    step.defaultMediaPath = result.storagePath;
  }
  step.mediaUrl = result.videoUrl;
  step.mediaPath = result.storagePath;
  step.mediaThumbnail = result.thumbnailUrl;

  storage.update(comp);
  videoFormOpenForStep = null;
  render();
  showToast('Video uploaded!', 'success');
}

function saveStepVideo(compId, stepIndex) {
  const input = document.getElementById('videoUrlInput_' + stepIndex);
  const url = input ? input.value.trim() : '';
  if (!url) { showToast('Please enter a URL', 'error'); return; }
  try { new URL(url); } catch { showToast('Invalid URL', 'error'); return; }
  const comp = getComponentById(compId);
  if (!comp || !comp.steps[stepIndex]) return;
  const step = comp.steps[stepIndex];
  const parsed = parseVideoUrl(url);
  step.mediaUrl = url;
  step.mediaThumbnail = parsed ? parsed.thumbnailUrl : null;
  if (cachedIsAdmin) {
    step.defaultMediaUrl = url;
  }
  storage.update(comp);
  videoFormOpenForStep = null;
  render();
  showToast('Video added', 'success');
}

async function removeStepVideo(compId, stepIndex) {
  const comp = getComponentById(compId);
  if (!comp || !comp.steps[stepIndex]) return;
  const step = comp.steps[stepIndex];
  const isAdmin = cachedIsAdmin;
  const hasUserOverride = !!step.mediaUrl && !!step.defaultMediaUrl && step.mediaUrl !== step.defaultMediaUrl;

  let msg = 'Remove this video?';
  if (isAdmin && step.defaultMediaUrl && !hasUserOverride) {
    msg = 'Remove default video? This affects all users.';
  } else if (hasUserOverride) {
    msg = 'Remove your video override?';
  }

  if (!confirm(msg)) return;

  if (hasUserOverride) {
    // Delete user override, revert to default
    if (step.mediaPath) await deleteStepVideo(step.mediaPath);
    step.mediaUrl = step.defaultMediaUrl;
    step.mediaPath = step.defaultMediaPath || null;
  } else if (isAdmin && step.defaultMediaPath) {
    // Admin deleting default — remove everything
    await deleteStepVideo(step.defaultMediaPath);
    step.defaultMediaUrl = null;
    step.defaultMediaPath = null;
    step.mediaUrl = null;
    step.mediaPath = null;
  } else {
    // Simple case: no default, just a user video or URL
    if (step.mediaPath) await deleteStepVideo(step.mediaPath);
    step.mediaUrl = null;
    step.mediaPath = null;
  }

  step.mediaThumbnail = null;
  storage.update(comp);
  expandedVideoStepId = null;
  render();
  showToast('Video removed', 'info');
}

async function resetStepVideoToDefault(compId, stepIndex) {
  const comp = getComponentById(compId);
  if (!comp || !comp.steps[stepIndex]) return;
  const step = comp.steps[stepIndex];

  if (step.mediaPath && step.mediaPath.startsWith('user/')) {
    await deleteStepVideo(step.mediaPath);
  }

  step.mediaUrl = step.defaultMediaUrl;
  step.mediaPath = step.defaultMediaPath || null;
  step.mediaThumbnail = null;

  storage.update(comp);
  render();
  showToast('Reset to default video', 'info');
}

function toggleStepVideoPlayback(stepId) {
  const mediaUrl = findStepMediaUrl(stepId);
  const parsed = parseVideoUrl(mediaUrl);
  if (parsed && parsed.type === 'external') {
    window.open(parsed.embedUrl, '_blank');
    return;
  }
  expandedVideoStepId = expandedVideoStepId === stepId ? null : stepId;
  render();
}

function findStepMediaUrl(stepId) {
  for (const comp of state.components) {
    if (!comp.steps) continue;
    const step = comp.steps.find(s => (s.id || '') === stepId);
    if (step) {
      if (step.mediaUrl) return step.mediaUrl;
      if (step.defaultMediaUrl) return step.defaultMediaUrl;
    }
  }
  return null;
}

// ── Combos ──
function showSaveComboModal() {
  const content = `
    <div style="padding: 4px 0;">
      <div style="font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color}; margin-bottom: 12px;">Save as Combo</div>
      <input type="text" id="comboNameInput" placeholder="Combo name..." style="width: 100%; padding: 10px 12px; background: ${CONFIG.surface_elevated}; border: 1px solid ${CONFIG.divider_color}; border-radius: 10px; color: ${CONFIG.text_color}; font-size: ${CONFIG.type_body}; font-family: ${CONFIG.font_family}; box-sizing: border-box; outline: none; margin-bottom: 12px;" />
      <button onclick="saveCombo()" style="width: 100%; padding: 12px; border: none; border-radius: 12px; background: ${CONFIG.primary_action_color}; color: white; font-size: ${CONFIG.type_body}; font-weight: 600; cursor: pointer;">Save</button>
    </div>
  `;
  openModal(content);
  setTimeout(() => { const inp = document.getElementById('comboNameInput'); if (inp) inp.focus(); }, 100);
}

function saveCombo() {
  const nameInput = document.getElementById('comboNameInput');
  const name = nameInput ? nameInput.value.trim() : '';
  if (!name) { showToast('Please enter a name', 'error'); return; }

  const combo = {
    id: generateComboId(), type: 'combo', name: name,
    slots: Object.entries(buildPlateSlots).filter(([_, v]) => v).map(([role, componentId]) => ({ role, componentId })),
    createdAt: new Date().toISOString(), rating: 0, timesCooked: 0, lastCooked: null, notes: ''
  };
  storage.create(combo);
  // AI Memory: record component usage for saved combo
  combo.slots.forEach(s => { if (s.componentId) recordComponentUsage(s.componentId); });
  closeModal();
  showToast('Combo saved!', 'success');
  render();
}

function loadCombo(comboId) {
  const combo = state.combos.find(c => c.id === comboId);
  if (!combo) return;
  buildPlateSlots = { protein: null, veggie: null, veggie2: null, starch: null, sauce: null };
  (combo.slots || []).forEach(slot => {
    buildPlateSlots[slot.role] = slot.componentId;
  });
  buildPlateTimeline = calculateTimeline(buildPlateSlots);
  state.currentView = 'build-plate';
  render();
}

function deleteCombo(comboId) {
  const combo = state.combos.find(c => c.id === comboId);
  if (!combo) return;
  if (!confirm('Delete "' + combo.name + '"?')) return;
  storage.delete(combo);
  render();
  showToast('Combo deleted', 'info');
}

// ── Recipe Extraction Flow ──
function startRecipeExtraction() {
  extractionState = { step: 1, selectedRecipeId: null, searchTerm: '', mappings: [], comboName: '' };
  render();
}

function renderExtractionFlow() {
  if (!extractionState) return '';
  if (extractionState.step === 1) return renderExtractionStep1();
  if (extractionState.step === 2) return renderExtractionStep2();
  return '';
}

function renderExtractionStep1() {
  const term = (extractionState.searchTerm || '').toLowerCase();
  const recipes = (state.recipes || []).filter(r => !r.isDraft && !r.isTip);
  const filtered = term ? recipes.filter(r => (r.title || '').toLowerCase().includes(term)) : recipes;

  return `
    <div style="padding: 12px 12px ${CONFIG.space_2xl};">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <button onclick="extractionState = null; render();" style="background: none; border: none; color: ${CONFIG.text_muted}; cursor: pointer; padding: 8px;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <h2 style="font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color}; margin: 0;">Choose a Recipe to Extract</h2>
      </div>
      <div style="position: relative; margin-bottom: 12px;">
        <svg width="16" height="16" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%);"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
        <input type="text" id="extractionSearchInput" value="${esc(extractionState.searchTerm)}" oninput="extractionState.searchTerm = this.value; render(); setTimeout(() => { const el = document.getElementById('extractionSearchInput'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }}, 0);" placeholder="Search recipes..." style="width: 100%; padding: 10px 12px 10px 36px; background: ${CONFIG.surface_color}; border: 1px solid ${CONFIG.divider_color}; border-radius: 12px; color: ${CONFIG.text_color}; font-size: ${CONFIG.type_body}; font-family: ${CONFIG.font_family}; box-sizing: border-box;" />
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px; max-height: 65vh; overflow-y: auto;">
        ${filtered.length === 0 ? `<div style="text-align: center; padding: 32px; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_body};">No recipes found</div>` : ''}
        ${filtered.slice(0, 50).map(r => {
          const ingCount = (typeof recipeIngList === 'function' ? recipeIngList(r) : r.ingredientsRows || []).length;
          const thumb = typeof recipeThumb === 'function' ? recipeThumb(r) : r.image_url;
          return `
            <div onclick="selectRecipeForExtraction('${r.__backendId || r.id}')" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: ${CONFIG.surface_color}; border-radius: 12px; cursor: pointer; box-shadow: ${CONFIG.shadow};">
              ${thumb ? `<img src="${esc(thumb)}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; flex-shrink: 0;" onerror="this.style.display='none'" />` : `<div style="width: 48px; height: 48px; border-radius: 8px; background: ${typeof getPlaceholderGradient === 'function' ? getPlaceholderGradient(r) : CONFIG.surface_elevated}; flex-shrink: 0;"></div>`}
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: ${CONFIG.type_body}; font-weight: 600; color: ${CONFIG.text_color}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(r.title || 'Untitled')}</div>
                <div style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_muted};">${ingCount} ingredient${ingCount !== 1 ? 's' : ''}${r.category ? ' \u00b7 ' + esc(r.category) : ''}</div>
              </div>
              <svg width="16" height="16" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function selectRecipeForExtraction(recipeId) {
  const recipe = typeof getRecipeById === 'function' ? getRecipeById(recipeId) : state.recipes.find(r => (r.__backendId || r.id) === recipeId);
  if (!recipe) { showToast('Recipe not found', 'error'); return; }
  const ingredients = typeof recipeIngList === 'function' ? recipeIngList(recipe) : (recipe.ingredientsRows || []);
  if (ingredients.length === 0) { showToast('This recipe has no ingredients to extract', 'error'); return; }
  extractionState.selectedRecipeId = recipeId;
  extractionState.mappings = buildAutoMappings(recipe);
  extractionState.comboName = recipe.title || 'New Combo';
  extractionState.step = 2;
  render();
}

function renderExtractionStep2() {
  const recipe = typeof getRecipeById === 'function' ? getRecipeById(extractionState.selectedRecipeId) : state.recipes.find(r => (r.__backendId || r.id) === extractionState.selectedRecipeId);
  if (!recipe) return '<div style="padding: 24px; color: ' + CONFIG.text_muted + ';">Recipe not found</div>';

  const mappings = extractionState.mappings;
  const mappedCount = mappings.filter(m => m.action === 'map').length;
  const createCount = mappings.filter(m => m.action === 'create').length;
  const skipCount = mappings.filter(m => m.action === 'skip').length;
  const activeCount = mappedCount + createCount;

  return `
    <div style="padding: 12px 12px ${CONFIG.space_2xl};">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
        <button onclick="extractionState.step = 1; render();" style="background: none; border: none; color: ${CONFIG.text_muted}; cursor: pointer; padding: 8px;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <div style="flex: 1; min-width: 0;">
          <h2 style="font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color}; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Import: ${esc(recipe.title || 'Recipe')}</h2>
        </div>
      </div>
      <div style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_muted}; margin-bottom: 16px; padding-left: 40px;">${mappings.length} ingredients \u00b7 ${mappedCount} matched \u00b7 ${createCount} new \u00b7 ${skipCount} skipped</div>

      <div style="display: flex; flex-direction: column; gap: 10px; max-height: 55vh; overflow-y: auto; margin-bottom: 16px;">
        ${mappings.map((m, i) => {
          const catColor = m.autoCategory ? getCategoryColor(m.autoCategory) : CONFIG.text_muted;
          const matchedComp = m.matchedComponentId ? getComponentById(m.matchedComponentId) : null;
          return `
            <div style="background: ${CONFIG.surface_color}; border-radius: 12px; padding: 12px; box-shadow: ${CONFIG.shadow}; ${m.action === 'skip' ? 'opacity: 0.5;' : ''}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div>
                  <div style="font-size: ${CONFIG.type_body}; font-weight: 600; color: ${CONFIG.text_color};">${esc(m.ingredientName)}</div>
                  <div style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_muted};">${m.qty ? esc(m.qty) + ' ' : ''}${m.unit ? esc(m.unit) : ''}</div>
                </div>
                ${m.autoCategory ? `<span style="font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; background: ${catColor}20; color: ${catColor};">${m.autoCategory}</span>` : ''}
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button onclick="setExtractionAction(${i}, 'map')" style="padding: 6px 12px; border-radius: 8px; font-size: ${CONFIG.type_caption}; font-weight: 500; cursor: pointer; border: 1px solid ${m.action === 'map' ? CONFIG.success_color : CONFIG.divider_color}; background: ${m.action === 'map' ? CONFIG.success_color + '15' : 'transparent'}; color: ${m.action === 'map' ? CONFIG.success_color : CONFIG.text_muted};">Map</button>
                <button onclick="setExtractionAction(${i}, 'create')" style="padding: 6px 12px; border-radius: 8px; font-size: ${CONFIG.type_caption}; font-weight: 500; cursor: pointer; border: 1px solid ${m.action === 'create' ? CONFIG.primary_action_color : CONFIG.divider_color}; background: ${m.action === 'create' ? CONFIG.primary_action_color + '15' : 'transparent'}; color: ${m.action === 'create' ? CONFIG.primary_action_color : CONFIG.text_muted};">Create New</button>
                <button onclick="setExtractionAction(${i}, 'skip')" style="padding: 6px 12px; border-radius: 8px; font-size: ${CONFIG.type_caption}; font-weight: 500; cursor: pointer; border: 1px solid ${m.action === 'skip' ? CONFIG.text_muted : CONFIG.divider_color}; background: ${m.action === 'skip' ? CONFIG.text_muted + '15' : 'transparent'}; color: ${CONFIG.text_muted};">Skip</button>
              </div>
              ${m.action === 'map' ? `
                <div style="margin-top: 8px;">
                  ${matchedComp ? `
                    <div onclick="openExtractionPicker(${i})" style="display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: ${CONFIG.surface_elevated}; border-radius: 8px; cursor: pointer;">
                      <span style="font-size: 16px;">${matchedComp.category === 'Protein' ? '\ud83e\udd69' : matchedComp.category === 'Veggie' ? '\ud83e\udd66' : matchedComp.category === 'Starch' ? '\ud83c\udf5e' : matchedComp.category === 'Seasoning' ? '\ud83e\uddc2' : '\ud83e\uded5'}</span>
                      <span style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_color}; flex: 1;">${esc(matchedComp.name)}</span>
                      <span style="font-size: 11px; color: ${CONFIG.text_muted};">Change</span>
                    </div>
                  ` : `
                    <button onclick="openExtractionPicker(${i})" style="width: 100%; padding: 8px; border: 1px dashed ${CONFIG.divider_color}; border-radius: 8px; background: transparent; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; cursor: pointer;">Select a component...</button>
                  `}
                </div>
              ` : ''}
              ${m.action === 'create' ? `
                <div style="margin-top: 8px; display: flex; gap: 8px; align-items: center;">
                  <input type="text" value="${esc(m.newComponentName)}" oninput="extractionState.mappings[${i}].newComponentName = this.value;" style="flex: 1; padding: 6px 10px; border-radius: 8px; border: 1px solid ${CONFIG.divider_color}; background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color}; font-size: ${CONFIG.type_caption}; font-family: ${CONFIG.font_family};" />
                  <select onchange="extractionState.mappings[${i}].newComponentCategory = this.value; render();" style="padding: 6px 8px; border-radius: 8px; border: 1px solid ${CONFIG.divider_color}; background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color}; font-size: ${CONFIG.type_caption}; font-family: ${CONFIG.font_family};">
                    ${COMPONENT_CATEGORIES.map(cat => `<option value="${cat}" ${m.newComponentCategory === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                  </select>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <!-- Combo name + submit -->
      <div style="background: ${CONFIG.surface_color}; border-radius: 12px; padding: 12px; box-shadow: ${CONFIG.shadow}; margin-bottom: 12px;">
        <div style="font-size: ${CONFIG.type_caption}; font-weight: 600; color: ${CONFIG.text_muted}; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Combo Name</div>
        <input type="text" id="extractionComboName" value="${esc(extractionState.comboName)}" oninput="extractionState.comboName = this.value;" style="width: 100%; padding: 10px 12px; background: ${CONFIG.surface_elevated}; border: 1px solid ${CONFIG.divider_color}; border-radius: 10px; color: ${CONFIG.text_color}; font-size: ${CONFIG.type_body}; font-family: ${CONFIG.font_family}; box-sizing: border-box;" />
      </div>

      <div style="display: flex; gap: 10px;">
        <button onclick="extractionState = null; render();" style="flex: 1; padding: 12px; border: none; border-radius: 12px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_body}; cursor: pointer; box-shadow: ${CONFIG.shadow};">Cancel</button>
        <button onclick="executeExtraction()" style="flex: 1; padding: 12px; border: none; border-radius: 12px; background: ${activeCount > 0 ? CONFIG.primary_action_color : CONFIG.text_muted}; color: white; font-size: ${CONFIG.type_body}; font-weight: 600; cursor: pointer; ${activeCount === 0 ? 'opacity: 0.5; pointer-events: none;' : ''}">Create Combo</button>
      </div>
    </div>
  `;
}

function setExtractionAction(index, action) {
  const m = extractionState.mappings[index];
  m.action = action;
  // If switching to 'map' and no existing match, try to find one
  if (action === 'map' && !m.matchedComponentId) {
    const match = findMatchingComponent(m.ingredientName);
    if (match) m.matchedComponentId = match.__backendId || match.id;
  }
  render();
}

function openExtractionPicker(mappingIndex) {
  const m = extractionState.mappings[mappingIndex];
  const filterCat = m.autoCategory || null;
  let comps = [...state.components];
  if (filterCat) comps.sort((a, b) => (a.category === filterCat ? -1 : 1) - (b.category === filterCat ? -1 : 1));
  comps.sort((a, b) => a.name.localeCompare(b.name));

  openModal(`
    <div style="padding: 4px 0;">
      <div style="font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color}; margin-bottom: 12px;">Choose Component</div>
      <div id="extractionPickerList" style="max-height: 50vh; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
        ${comps.map(c => `
          <div onclick="extractionState.mappings[${mappingIndex}].matchedComponentId = '${c.__backendId || c.id}'; closeModal(); render();" style="display: flex; align-items: center; gap: 10px; padding: 10px; background: ${CONFIG.surface_elevated}; border-radius: 10px; cursor: pointer;">
            <span style="font-size: 20px;">${c.category === 'Protein' ? '\ud83e\udd69' : c.category === 'Veggie' ? '\ud83e\udd66' : c.category === 'Starch' ? '\ud83c\udf5e' : c.category === 'Seasoning' ? '\ud83e\uddc2' : '\ud83e\uded5'}</span>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: ${CONFIG.type_body}; color: ${CONFIG.text_color}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(c.name)}</div>
              <div style="font-size: 11px; color: ${getCategoryColor(c.category)};">${c.category}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `);
}

function executeExtraction() {
  if (!extractionState) return;
  const mappings = extractionState.mappings;
  const activeItems = mappings.filter(m => m.action !== 'skip');

  if (activeItems.length === 0) {
    showToast('No ingredients selected', 'error');
    return;
  }

  const componentIds = [];
  let createdCount = 0;

  for (const m of activeItems) {
    if (m.action === 'map' && m.matchedComponentId) {
      componentIds.push(m.matchedComponentId);
    } else if (m.action === 'create') {
      const newComp = {
        id: generateComponentId(), type: 'component',
        name: m.newComponentName || m.ingredientName,
        category: m.newComponentCategory || 'Protein',
        subcategory: '', cookingMethod: 'Air Fry',
        steps: [],
        airFryer: { temp: 400, cookTime: 10, flipHalfway: false, flipAt: null, shakeInterval: null, notes: '' },
        defaultSeasoning: { componentIds: [], freeText: '' },
        ingredients: [],
        pairsWellWith: [], timesCooked: 0, rating: 0, notes: '', tags: [],
        image_url: '', createdAt: new Date().toISOString(), lastUsed: null, source: 'user'
      };
      storage.create(newComp);
      componentIds.push(newComp.id);
      createdCount++;
    }
  }

  // Build combo slots — assign roles based on category, max 5
  const slotAssignments = { protein: null, veggie: null, veggie2: null, starch: null, sauce: null };
  for (const compId of componentIds) {
    const comp = getComponentById(compId);
    if (!comp) continue;
    const catToRole = { 'Protein': 'protein', 'Veggie': 'veggie', 'Starch': 'starch', 'Sauce': 'sauce', 'Seasoning': 'sauce' };
    let role = catToRole[comp.category] || 'sauce';
    if (slotAssignments[role] !== null) {
      if (role === 'veggie' && slotAssignments.veggie2 === null) role = 'veggie2';
      else continue; // slot full, skip
    }
    slotAssignments[role] = compId;
  }

  const filledSlots = Object.entries(slotAssignments).filter(([_, v]) => v).map(([role, componentId]) => ({ role, componentId }));

  if (filledSlots.length > 0) {
    const combo = {
      id: generateComboId(), type: 'combo',
      name: extractionState.comboName || 'Imported Combo',
      slots: filledSlots,
      createdAt: new Date().toISOString(), rating: 0, timesCooked: 0, lastCooked: null, notes: ''
    };
    storage.create(combo);

    // Load into Build a Plate
    buildPlateSlots = { protein: null, veggie: null, veggie2: null, starch: null, sauce: null };
    filledSlots.forEach(s => { buildPlateSlots[s.role] = s.componentId; });
    buildPlateTimeline = calculateTimeline(buildPlateSlots);
  }

  extractionState = null;
  showToast('Created ' + createdCount + ' component' + (createdCount !== 1 ? 's' : '') + ' + combo', 'success');
  state.currentView = filledSlots.length > 0 ? 'build-plate' : 'components';
  render();
}

// ── Import/Export Components ──
function exportComponentsData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    exportedBy: 'PotLuck',
    components: state.components.map(c => { const copy = { ...c }; delete copy.__backendId; return copy; }),
    combos: state.combos.map(c => { const copy = { ...c }; delete copy.__backendId; return copy; }),
    aiPrefs: getAiPrefs()
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'potluck-components-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported ' + state.components.length + ' components and ' + state.combos.length + ' combos', 'success');
}

function validateImportData(data) {
  if (!data || typeof data !== 'object') return { valid: false, error: 'Invalid file format' };
  if (!data.version) return { valid: false, error: 'Missing version field' };
  if (!Array.isArray(data.components)) return { valid: false, error: 'Missing components array' };
  for (const c of data.components) {
    if (!c.name || !c.category) return { valid: false, error: 'Component "' + (c.name || 'unnamed') + '" missing required fields' };
  }
  return { valid: true };
}

function showImportComponentsModal() {
  openModal(`
    <div style="padding: 4px 0;">
      <div style="font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color}; margin-bottom: 8px;">Import Components</div>
      <p style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_muted}; margin-bottom: 16px;">Upload a previously exported PotLuck components JSON file.</p>
      <input type="file" id="componentImportFile" accept=".json" style="width: 100%; padding: 10px; background: ${CONFIG.surface_elevated}; border: 1px solid ${CONFIG.divider_color}; border-radius: 10px; color: ${CONFIG.text_color}; font-size: ${CONFIG.type_caption}; font-family: ${CONFIG.font_family}; box-sizing: border-box; margin-bottom: 16px;" />
      <div style="display: flex; gap: 8px;">
        <button onclick="closeModal()" style="flex: 1; padding: 10px; border: none; border-radius: 10px; background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_body}; cursor: pointer;">Cancel</button>
        <button onclick="processComponentImport()" style="flex: 1; padding: 10px; border: none; border-radius: 10px; background: ${CONFIG.primary_action_color}; color: white; font-size: ${CONFIG.type_body}; font-weight: 600; cursor: pointer;">Continue</button>
      </div>
    </div>
  `);
}

function processComponentImport() {
  const fileInput = document.getElementById('componentImportFile');
  const file = fileInput ? fileInput.files[0] : null;
  if (!file) { showToast('Please select a file', 'error'); return; }
  if (file.size > 5 * 1024 * 1024) { showToast('File too large (max 5MB)', 'error'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const validation = validateImportData(data);
      if (!validation.valid) { showToast(validation.error, 'error'); return; }

      const importedComps = data.components || [];
      const importedCombos = data.combos || [];
      const existingCompNames = new Set(state.components.map(c => c.name.toLowerCase()));
      const existingComboNames = new Set(state.combos.map(c => c.name.toLowerCase()));

      const newComponents = importedComps.filter(c => !existingCompNames.has(c.name.toLowerCase()));
      const duplicateComponents = importedComps.filter(c => existingCompNames.has(c.name.toLowerCase()));
      const newCombos = importedCombos.filter(c => !existingComboNames.has(c.name.toLowerCase()));
      const duplicateCombos = importedCombos.filter(c => existingComboNames.has(c.name.toLowerCase()));

      importPreviewData = {
        components: importedComps, combos: importedCombos,
        newComponents, duplicateComponents, newCombos, duplicateCombos,
        strategy: 'skip'
      };
      closeModal();
      showImportPreviewModal();
    } catch (err) {
      showToast('Failed to parse file', 'error');
      console.error(err);
    }
  };
  reader.readAsText(file);
}

function showImportPreviewModal() {
  if (!importPreviewData) return;
  const d = importPreviewData;
  openModal(`
    <div style="padding: 4px 0;">
      <div style="font-size: ${CONFIG.type_header}; font-weight: ${CONFIG.type_header_weight}; color: ${CONFIG.text_color}; margin-bottom: 12px;">Import Preview</div>
      <div style="background: ${CONFIG.surface_elevated}; border-radius: 10px; padding: 12px; margin-bottom: 12px;">
        <div style="font-size: ${CONFIG.type_body}; color: ${CONFIG.text_color}; margin-bottom: 4px;">${d.components.length} component${d.components.length !== 1 ? 's' : ''} found</div>
        <div style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_muted};">${d.newComponents.length} new, ${d.duplicateComponents.length} already exist</div>
        <div style="font-size: ${CONFIG.type_body}; color: ${CONFIG.text_color}; margin-top: 8px; margin-bottom: 4px;">${d.combos.length} combo${d.combos.length !== 1 ? 's' : ''} found</div>
        <div style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_muted};">${d.newCombos.length} new, ${d.duplicateCombos.length} already exist</div>
      </div>
      ${d.duplicateComponents.length + d.duplicateCombos.length > 0 ? `
        <div style="margin-bottom: 16px;">
          <div style="font-size: ${CONFIG.type_caption}; font-weight: 600; color: ${CONFIG.text_color}; margin-bottom: 8px;">Duplicates:</div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label onclick="importPreviewData.strategy = 'skip'; showImportPreviewModal();" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: ${d.strategy === 'skip' ? CONFIG.primary_action_color + '15' : CONFIG.surface_elevated}; border: 1px solid ${d.strategy === 'skip' ? CONFIG.primary_action_color : CONFIG.divider_color}; border-radius: 8px; cursor: pointer;">
              <div style="width: 16px; height: 16px; border-radius: 50%; border: 2px solid ${d.strategy === 'skip' ? CONFIG.primary_action_color : CONFIG.text_muted}; display: flex; align-items: center; justify-content: center;">${d.strategy === 'skip' ? `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${CONFIG.primary_action_color};"></div>` : ''}</div>
              <span style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_color};">Skip duplicates</span>
            </label>
            <label onclick="importPreviewData.strategy = 'overwrite'; showImportPreviewModal();" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: ${d.strategy === 'overwrite' ? CONFIG.primary_action_color + '15' : CONFIG.surface_elevated}; border: 1px solid ${d.strategy === 'overwrite' ? CONFIG.primary_action_color : CONFIG.divider_color}; border-radius: 8px; cursor: pointer;">
              <div style="width: 16px; height: 16px; border-radius: 50%; border: 2px solid ${d.strategy === 'overwrite' ? CONFIG.primary_action_color : CONFIG.text_muted}; display: flex; align-items: center; justify-content: center;">${d.strategy === 'overwrite' ? `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${CONFIG.primary_action_color};"></div>` : ''}</div>
              <span style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_color};">Overwrite with imported version</span>
            </label>
            <label onclick="importPreviewData.strategy = 'copy'; showImportPreviewModal();" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: ${d.strategy === 'copy' ? CONFIG.primary_action_color + '15' : CONFIG.surface_elevated}; border: 1px solid ${d.strategy === 'copy' ? CONFIG.primary_action_color : CONFIG.divider_color}; border-radius: 8px; cursor: pointer;">
              <div style="width: 16px; height: 16px; border-radius: 50%; border: 2px solid ${d.strategy === 'copy' ? CONFIG.primary_action_color : CONFIG.text_muted}; display: flex; align-items: center; justify-content: center;">${d.strategy === 'copy' ? `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${CONFIG.primary_action_color};"></div>` : ''}</div>
              <span style="font-size: ${CONFIG.type_caption}; color: ${CONFIG.text_color};">Import as copies (rename with " (imported)")</span>
            </label>
          </div>
        </div>
      ` : ''}
      <div style="display: flex; gap: 8px;">
        <button onclick="importPreviewData = null; closeModal();" style="flex: 1; padding: 10px; border: none; border-radius: 10px; background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_body}; cursor: pointer;">Cancel</button>
        <button onclick="executeComponentImport()" style="flex: 1; padding: 10px; border: none; border-radius: 10px; background: ${CONFIG.primary_action_color}; color: white; font-size: ${CONFIG.type_body}; font-weight: 600; cursor: pointer;">Import</button>
      </div>
    </div>
  `);
}

function executeComponentImport() {
  if (!importPreviewData) return;
  const d = importPreviewData;
  const strategy = d.strategy;
  const oldToNewId = {};
  let importedCompCount = 0;
  let importedComboCount = 0;

  // Process components
  for (const imported of d.components) {
    const existingByName = state.components.find(c => c.name.toLowerCase() === imported.name.toLowerCase());

    if (existingByName) {
      if (strategy === 'skip') continue;
      if (strategy === 'overwrite') {
        const oldId = existingByName.id;
        const oldBackendId = existingByName.__backendId;
        Object.assign(existingByName, imported);
        existingByName.id = oldId;
        existingByName.__backendId = oldBackendId;
        oldToNewId[imported.id] = oldId;
        storage.update(existingByName);
        importedCompCount++;
        continue;
      }
      if (strategy === 'copy') {
        const newId = generateComponentId();
        oldToNewId[imported.id] = newId;
        const copy = { ...imported, id: newId, __backendId: null, name: imported.name + ' (imported)', source: 'imported' };
        storage.create(copy);
        importedCompCount++;
        continue;
      }
    } else {
      const newId = generateComponentId();
      oldToNewId[imported.id] = newId;
      const copy = { ...imported, id: newId, __backendId: null, source: 'imported' };
      storage.create(copy);
      importedCompCount++;
    }
  }

  // Process combos
  for (const imported of d.combos) {
    const existingByName = state.combos.find(c => c.name.toLowerCase() === imported.name.toLowerCase());

    if (existingByName) {
      if (strategy === 'skip') continue;
      if (strategy === 'overwrite') {
        const oldId = existingByName.id;
        const oldBackendId = existingByName.__backendId;
        Object.assign(existingByName, imported);
        existingByName.id = oldId;
        existingByName.__backendId = oldBackendId;
        // Remap slot component IDs
        if (existingByName.slots) {
          existingByName.slots.forEach(s => { if (oldToNewId[s.componentId]) s.componentId = oldToNewId[s.componentId]; });
        }
        storage.update(existingByName);
        importedComboCount++;
        continue;
      }
      if (strategy === 'copy') {
        const newId = generateComboId();
        const copy = { ...imported, id: newId, __backendId: null, name: imported.name + ' (imported)' };
        if (copy.slots) { copy.slots = copy.slots.map(s => ({ ...s, componentId: oldToNewId[s.componentId] || s.componentId })); }
        storage.create(copy);
        importedComboCount++;
        continue;
      }
    } else {
      const newId = generateComboId();
      const copy = { ...imported, id: newId, __backendId: null };
      if (copy.slots) { copy.slots = copy.slots.map(s => ({ ...s, componentId: oldToNewId[s.componentId] || s.componentId })); }
      storage.create(copy);
      importedComboCount++;
    }
  }

  importPreviewData = null;
  closeModal();
  render();
  showToast('Imported ' + importedCompCount + ' components and ' + importedComboCount + ' combos', 'success');
}

// ============================================================
// SECTION 14: VIEW RENDERERS & RENDER
// ============================================================
const VIEW_RENDERERS = {
  'components': renderComponentsPage,
  'component-detail': renderComponentDetail,
  'build-plate': renderBuildPlate,
  'cook-mode': renderCookMode
};

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  const renderer = VIEW_RENDERERS[state.currentView];
  let content;
  if (renderer) {
    content = renderer();
  } else {
    content = renderComponentsPage();
    state.currentView = 'components';
  }

  app.innerHTML = `
    <div class="${getAppShellClass()}" style="background: ${CONFIG.background_color}; min-height: 100dvh; padding-bottom: 56px;">
      ${renderDesktopSidebar()}
      ${renderNav()}
      <div class="desktop-content-area">
        ${renderDesktopPageTitle()}
        ${content}
      </div>
      ${renderBottomNav()}
    </div>
  `;
}

// ============================================================
// SECTION 15: INIT
// ============================================================
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.key === 'Escape') {
      const modal = document.getElementById('modal');
      if (modal && modal.style.display === 'flex') {
        closeModal();
      } else if (state.currentView === 'component-detail') {
        state.currentView = 'components';
        render();
      } else if (state.currentView === 'build-plate' || state.currentView === 'cook-mode') {
        if (state.currentView === 'cook-mode' && cookModeActive) {
          stopCookMode();
        } else {
          state.currentView = 'components';
          render();
        }
      }
    }
  });
}

loadAllState();
seedStarterComponents();
setupKeyboardShortcuts();
refreshAdminStatus();

const targetView = sessionStorage.getItem('yummy_target_view');
if (targetView && VIEW_RENDERERS[targetView]) {
  sessionStorage.removeItem('yummy_target_view');
  state.currentView = targetView;
} else {
  state.currentView = 'components';
}

// Load combo from auto-plan if navigated from home page
const loadComboId = sessionStorage.getItem('yummy_load_combo');
if (loadComboId) {
  sessionStorage.removeItem('yummy_load_combo');
  const combo = state.combos.find(c => c.id === loadComboId);
  if (combo) {
    buildPlateSlots = { protein: null, veggie: null, veggie2: null, starch: null, sauce: null };
    (combo.slots || []).forEach(slot => {
      buildPlateSlots[slot.role] = slot.componentId;
    });
    buildPlateTimeline = calculateTimeline(buildPlateSlots);
    state.currentView = 'build-plate';
  }
}

render();
