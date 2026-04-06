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
  const comps = getFilteredComponents();
  const categories = ['All', ...COMPONENT_CATEGORIES];

  return `
    <div style="padding: 12px 0 ${CONFIG.space_2xl};">
      <!-- Header -->
      <div style="padding: 12px 12px 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <h1 style="font-size: ${CONFIG.type_title}; font-weight: ${CONFIG.type_title_weight}; color: ${CONFIG.text_color}; margin: 0; letter-spacing: ${CONFIG.type_title_tracking};">Components</h1>
          <button onclick="navigateToView('build-plate')" style="background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; padding: 8px 16px; font-size: ${CONFIG.type_caption}; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Build a Plate
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
              const typeColors = { prep: CONFIG.text_muted, season: '#ff9f0a', cook: CONFIG.primary_action_color, rest: '#5e5ce6', finish: CONFIG.success_color };
              return `
                <div style="display: flex; gap: 10px; padding: 8px 0; ${i < comp.steps.length - 1 ? 'border-bottom: 1px solid ' + CONFIG.divider_color + ';' : ''}">
                  <div style="flex-shrink: 0; width: 24px; height: 24px; border-radius: 12px; background: ${typeColors[step.type] || CONFIG.text_muted}20; color: ${typeColors[step.type] || CONFIG.text_muted}; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;">${i + 1}</div>
                  <div style="flex: 1;">
                    <div style="font-size: ${CONFIG.type_body}; color: ${CONFIG.text_color};">${esc(step.action)}</div>
                    <div style="font-size: 11px; color: ${CONFIG.text_muted}; margin-top: 2px;">
                      <span style="text-transform: capitalize;">${step.type}</span>${step.duration ? ` · ${step.duration} min` : ''}
                    </div>
                  </div>
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

          return `
            <div class="timeline-card ${isActive ? 'cook-mode-active' : ''} ${isCompleted ? 'cook-mode-completed' : ''}" style="background: ${CONFIG.surface_color}; border-radius: 12px; padding: 12px; box-shadow: ${CONFIG.shadow}; border-left: 3px solid ${isActive ? CONFIG.primary_action_color : isCompleted ? CONFIG.success_color : CONFIG.divider_color};">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <div style="font-size: ${CONFIG.type_body}; font-weight: 600; color: ${CONFIG.text_color};">${esc(item.componentName)}</div>
                <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px; background: ${isActive ? CONFIG.primary_action_color + '20' : isCompleted ? CONFIG.success_color + '20' : CONFIG.surface_elevated}; color: ${isActive ? CONFIG.primary_action_color : isCompleted ? CONFIG.success_color : CONFIG.text_muted};">
                  ${isCompleted ? 'Done' : isActive ? 'NOW' : 'At ' + item.startAtMinute + ':00'}
                </span>
              </div>
              <div style="font-size: 11px; color: ${CONFIG.text_muted};">${item.temp}°F · ${item.cookTime} min</div>
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
  showToast('Cooking complete!', 'success');
  state.currentView = 'build-plate';
  render();
}

function dismissReminder(key) {
  cookModeDismissedReminders[key] = true;
  render();
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

const targetView = sessionStorage.getItem('yummy_target_view');
if (targetView && VIEW_RENDERERS[targetView]) {
  sessionStorage.removeItem('yummy_target_view');
  state.currentView = targetView;
} else {
  state.currentView = 'components';
}

render();
