// ============================================================
// SHARED.JS - Shared JavaScript for all pages
// Contains: CONFIG, constants, state, storage layer, utilities,
// navigation, nav rendering, and all shared functions.
// ============================================================

const DEBUG_LOG = false;
function debugLog(...args) { if (DEBUG_LOG) console.log(...args); }
window.debugLog = debugLog;

// ============================================================
// STANDALONE WEB APP NAVIGATION INTERCEPTOR
// Keeps all internal links within the standalone (Add to Home Screen) shell
// instead of opening Safari with browser chrome.
// ============================================================
if (window.navigator.standalone === true) {
  document.documentElement.classList.add('ios-standalone');
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a');
    if (link && link.href && link.origin === window.location.origin) {
      e.preventDefault();
      window.location.href = link.href;
    }
  });
}

// ============================================================
// EARLY SAFETY CLEANUP — runs before anything else
// ============================================================
(function earlySafetyCleanup() {
  try { localStorage.removeItem('yummy_chefChatMessages'); } catch(e) {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && localStorage[key] && localStorage[key].length > 2000000) {
        console.warn('[SAFETY] Removing oversized key:', key, '(' + (localStorage[key].length / 1024 / 1024).toFixed(1) + ' MB)');
        localStorage.removeItem(key);
      }
    }
  } catch(e) { console.error('[SAFETY] Cleanup error:', e); }

  // Diagnostic: log what's in localStorage right now
  debugLog('[BOOT] localStorage key count:', localStorage.length);
  const yummyKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) yummyKeys.push(key + ': ' + (localStorage[key].length / 1024).toFixed(1) + 'KB');
  }
  debugLog('[BOOT] All localStorage keys:', yummyKeys.join(', ') || '(EMPTY — no data in localStorage!)');
})();

// ============================================================
// SUPABASE INITIALIZATION
// ============================================================
const SUPABASE_URL = 'https://blqbxduxgimarrhgyfgn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJscWJ4ZHV4Z2ltYXJyaGd5ZmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NjgyNDcsImV4cCI6MjA4MzE0NDI0N30.iNrBLJLSQEUEV24VCnhrMPTTJ6A_0rIuSAOinuFd-vM';

// Load Supabase library dynamically
(function loadSupabase() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.js';
  script.onload = () => {
    try {
      window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      debugLog('[BOOT] Supabase loaded successfully');
      // Once Supabase is loaded, check auth
      checkAuthAndInit();
    } catch (e) {
      console.error('[BOOT] Supabase client creation failed:', e);
      // Fallback: load from localStorage and render
      if (!state.dataLoaded) loadAllState();
      if (typeof render === 'function') render();
    }
  };
  script.onerror = () => {
    console.error('[BOOT] Supabase script failed to load — falling back to localStorage');
    if (!state.dataLoaded) loadAllState();
    if (typeof render === 'function') render();
  };
  document.head.appendChild(script);
})();

// Auth check (called after Supabase loads)
async function checkAuthAndInit() {
  if (!window.supabaseClient) {
    console.warn('[AUTH] No Supabase client — falling back to localStorage');
    if (!state.dataLoaded) loadAllState();
    if (typeof render === 'function') render();
    return;
  }
  try {
    // Use getSession (local cache) first for speed; fall back to getUser if needed
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session || !session.user) {
      // No active session — show login
      debugLog('[AUTH] No session found — showing login');
      showLoginModal();
      return;
    }
    const user = session.user;
    debugLog('[AUTH] Session found for:', user.email);
    // User is logged in — migrate saved/plates then load data from Supabase
    try {
      await migrateSavedAndPlatesToSupabase();
    } catch (migErr) {
      console.error('[AUTH] Saved/plates migration failed (non-fatal):', migErr);
    }
    try {
      await loadDataFromSupabase();
      debugLog('[AUTH] Data loaded from Supabase');
    } catch (loadErr) {
      console.error('[AUTH] Supabase data load failed, falling back to localStorage:', loadErr);
      if (!state.dataLoaded) loadAllState();
    }
    try {
      subscribeToChanges(user.id);
    } catch (subErr) {
      console.error('[AUTH] Realtime subscription failed (non-fatal):', subErr);
    }
    try {
      updateUserIndicator(user.email);
    } catch (uiErr) {
      console.error('[AUTH] User indicator update failed (non-fatal):', uiErr);
    }
    // Re-render the current page
    if (typeof render === 'function') render();
  } catch (e) {
    console.error('[AUTH] Auth check failed:', e);
    // Try to show login, but if that fails too, at least load localStorage
    try {
      showLoginModal();
    } catch (modalErr) {
      console.error('[AUTH] Login modal also failed — loading from localStorage:', modalErr);
      if (!state.dataLoaded) loadAllState();
      if (typeof render === 'function') render();
    }
  }
}

function clearAuthCache() {
  localStorage.removeItem('yummy_auth_user_id');
  localStorage.removeItem('yummy_auth_user_email');
  localStorage.removeItem('yummy_isLoggedIn');
}

// ============================================================
// SECTION 1: CONFIGURATION
// ============================================================
const CONFIG = {
  background_color: "#0d0d14",
  surface_color: "#1a1a24",
  surface_elevated: "#242432",
  text_color: "#f5f5f7",
  text_muted: "#8e8e93",
  text_tertiary: "#5c5c66",
  primary_action_color: "#e85d5d",
  primary_subtle: "rgba(232, 93, 93, 0.1)",
  secondary_action_color: "#242432",
  accent_color: "#e85d5d",
  success_color: "#32d74b",
  warning_color: "#ffd60a",
  danger_color: "#ff453a",
  divider_color: "rgba(255, 255, 255, 0.06)",
  gradient_start: "#e85d5d",
  gradient_end: "#e85d5d",
  font_family: "-apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif",
  font_size: 15,
  app_title: "PotLuck",
  recipes_label: "My Recipes",
  weekly_plan_label: "Meal History",
  grocery_list_label: "Grocery List",
  border_radius: "16px",
  shadow: "0 2px 8px rgba(0,0,0,0.3)",
  type_title: "20px",
  type_title_weight: "700",
  type_title_tracking: "-0.5px",
  type_header: "16px",
  type_header_weight: "600",
  type_header_tracking: "-0.2px",
  type_body: "14px",
  type_body_weight: "400",
  type_caption: "13px",
  type_caption_weight: "400",
  type_micro: "10px",
  type_micro_weight: "500",
  type_micro_tracking: "0.5px",
  space_xs: "4px",
  space_sm: "6px",
  space_md: "12px",
  space_lg: "16px",
  space_xl: "20px",
  space_2xl: "24px"
};

// ============================================================
// SECTION 2: CONSTANTS
// ============================================================
const ING_GROUPS = ['Produce', 'Beef', 'Poultry', 'Pork', 'Lamb & Goat', 'Seafood', 'Dairy & Eggs', 'Grains & Pasta', 'Pantry', 'Spices & Seasonings', 'Prepared', 'Other'];
const INGREDIENT_CATEGORIES = ['Vegetables', 'Fruits', 'Proteins', 'Dairy', 'Grains', 'Herbs & Spices', 'Pantry', 'Other'];
const COOKING_METHODS = ['Air Fry', 'Bake', 'Roast', 'Grill', 'Saut\u00e9', 'Pan Fry', 'Deep Fry', 'Steam', 'Boil', 'Poach', 'Braise', 'Slow Cook', 'Pressure Cook', 'Microwave', 'Raw'];
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'Year-round'];
const STORAGE_LOCATIONS = ['Counter', 'Fridge', 'Freezer', 'Pantry', 'Cool & Dark'];
const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Vegetables', 'Dinner', 'Appetizer'];
const TIP_CATEGORIES = ['Prep Techniques', 'Cleaning & Washing', 'Cutting & Slicing', 'Defrosting', 'Seasoning', 'Cooking Methods', 'Storage', 'Other'];
const SOURCE_TYPES = ['user', 'chefiq'];
const STORAGE_KEY = 'meal_planner_data_v1';

const INGREDIENT_CATEGORY_MAP = {
  'chicken': 'Proteins', 'beef': 'Proteins', 'pork': 'Proteins', 'lamb': 'Proteins',
  'steak': 'Proteins', 'bacon': 'Proteins', 'sausage': 'Proteins', 'ham': 'Proteins',
  'salmon': 'Proteins', 'shrimp': 'Proteins', 'clams': 'Proteins', 'tilapia': 'Proteins',
  'tuna': 'Proteins', 'eggs': 'Proteins', 'egg': 'Proteins', 'tofu': 'Proteins',
  'turkey': 'Proteins', 'fish': 'Proteins',
  'onion': 'Vegetables', 'garlic': 'Vegetables', 'shallot': 'Vegetables',
  'tomato': 'Vegetables', 'pepper': 'Vegetables', 'carrot': 'Vegetables',
  'celery': 'Vegetables', 'broccoli': 'Vegetables', 'cauliflower': 'Vegetables',
  'spinach': 'Vegetables', 'kale': 'Vegetables', 'lettuce': 'Vegetables',
  'arugula': 'Vegetables', 'zucchini': 'Vegetables', 'squash': 'Vegetables',
  'eggplant': 'Vegetables', 'mushroom': 'Vegetables', 'potato': 'Vegetables',
  'corn': 'Vegetables', 'beans': 'Vegetables', 'peas': 'Vegetables',
  'asparagus': 'Vegetables', 'sprouts': 'Vegetables', 'cucumber': 'Vegetables',
  'avocado': 'Vegetables', 'cabbage': 'Vegetables',
  'apple': 'Fruits', 'banana': 'Fruits', 'orange': 'Fruits', 'lemon': 'Fruits',
  'lime': 'Fruits', 'strawberr': 'Fruits', 'blueberr': 'Fruits', 'raspberr': 'Fruits',
  'mango': 'Fruits', 'pineapple': 'Fruits', 'grapes': 'Fruits', 'peach': 'Fruits',
  'milk': 'Dairy', 'cream': 'Dairy', 'butter': 'Dairy', 'cheese': 'Dairy',
  'cheddar': 'Dairy', 'mozzarella': 'Dairy', 'parmesan': 'Dairy', 'feta': 'Dairy',
  'jack': 'Dairy', 'yogurt': 'Dairy',
  'bread': 'Grains', 'tortilla': 'Grains', 'pita': 'Grains', 'pasta': 'Grains',
  'spaghetti': 'Grains', 'linguine': 'Grains', 'penne': 'Grains', 'fettuccine': 'Grains',
  'rigatoni': 'Grains', 'farfalle': 'Grains', 'orzo': 'Grains', 'lasagna': 'Grains',
  'noodles': 'Grains', 'rice': 'Grains', 'quinoa': 'Grains', 'couscous': 'Grains',
  'flour': 'Grains', 'breadcrumbs': 'Grains', 'oats': 'Grains', 'cereal': 'Grains',
  'cavatappi': 'Grains',
  'salt': 'Herbs & Spices', 'cumin': 'Herbs & Spices', 'paprika': 'Herbs & Spices',
  'chili': 'Herbs & Spices', 'oregano': 'Herbs & Spices', 'basil': 'Herbs & Spices',
  'thyme': 'Herbs & Spices', 'rosemary': 'Herbs & Spices', 'cinnamon': 'Herbs & Spices',
  'nutmeg': 'Herbs & Spices', 'bay': 'Herbs & Spices', 'seasoning': 'Herbs & Spices',
  'powder': 'Herbs & Spices', 'flakes': 'Herbs & Spices',
  'oil': 'Pantry', 'vinegar': 'Pantry', 'sauce': 'Pantry', 'sugar': 'Pantry',
  'honey': 'Pantry', 'syrup': 'Pantry', 'vanilla': 'Pantry', 'broth': 'Pantry',
  'stock': 'Pantry', 'canned': 'Pantry', 'paste': 'Pantry', 'chickpeas': 'Pantry',
  'coconut': 'Pantry', 'peanut': 'Pantry', 'almonds': 'Pantry', 'walnuts': 'Pantry',
  'peanuts': 'Pantry', 'wine': 'Pantry', 'brandy': 'Pantry'
};

// Default images for ingredients
const INGREDIENT_IMAGES = {
  'chicken breast': 'https://joyfullymad.com/wp-content/uploads/2023/08/grilled-chicken-salad-5.jpg',
  'chicken thighs': 'https://thecookful.com/wp-content/uploads/2018/09/chicken-thighs-instant-pot-feature-1392x780.jpg',
  'chicken wings': 'https://www.instacart.com/assets/domains/product-image/file/large',
  'whole chicken': 'https://ifoodreal.com/wp-content/uploads/2023/08/how-to-cut-up-a-whole-chicken.jpg',
  'ground beef': 'https://meat.tamu.edu/wp-content/uploads/2024/07/Ground-Beef-@-Rosenthal-2-1536x1024-2.jpg',
  'ribeye steak': 'https://www.vicsmeat.com.au/cdn/shop/files/beef-rib-eye-steak-black-onyx-marbling-score-3-rangers-valley-1kg-vics-meat-546607.jpg?v=1765840185',
  'ribeye': 'https://www.vicsmeat.com.au/cdn/shop/files/beef-rib-eye-steak-black-onyx-marbling-score-3-rangers-valley-1kg-vics-meat-546607.jpg?v=1765840185',
  'filet mignon': 'https://freezedrywholesalers.com/cdn/shop/products/Filet-Mignon_900x.jpg?v=1599149544',
  'new york strip': 'https://thomascattlecompany.com/cdn/shop/files/Copy_of_New_York_2.jpg?v=1762458007&width=1920',
  'sirloin': 'https://eelriverorganicbeef.com/wp-content/uploads/Eel-River-Organic-Top-Sirloin-Raw-3.jpg',
  't-bone steak': 'https://cdn.woodwardmeats.com/media/product/2_aaa-t-bone-steak.jpg',
  't-bone': 'https://cdn.woodwardmeats.com/media/product/2_aaa-t-bone-steak.jpg',
  'flank steak': 'https://rogueproduce.com/wp-content/uploads/2020/11/Flank-Steak.jpg',
  'skirt steak': 'https://www.grillseeker.com/wp-content/uploads/2020/03/inside-vs-outside-skirt-steak-feature-image-678x1024.jpg',
  'beef roast': 'https://media.istockphoto.com/id/525616019/photo/raw-grass-fed-prime-rib-meat.jpg?s=612x612&w=0&k=20&c=D5ZzN6jur0JDkxmYpV7dkZ-uGdJ4X7HwWMrQRWjv8oo=',
  'pork chops': 'https://www.seriouseats.com/thmb/7G55_V8fyOm2Z7JMFAz39W7Gvdc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__recipes__images__2016__02__20160208-sous-vide-pork-chop-guide-food-lab-02-10d7ecdd7c2e42ca94ff188f814ece48.jpg',
  'lamb chops': 'https://media.istockphoto.com/id/538918713/photo/lamb-chops.jpg?s=612x612&w=0&k=20&c=qRiDgM6Pp7mKLcIf_hIy6o4jom6J-wGrtkRMaXw5RaM=',
  'turkey bacon': 'https://d1tjtj7oa1d196.cloudfront.net/filters:strip_exif()/filters:strip_icc()/filters:format(jpeg)/filters:background_color(fff)/filters:quality(60)/fit-in/800x0/2020/01/14/17/07/13/6703d644-133c-41f5-acbb-4bfd8032ba8b/Natural%20Turkey%20Bacon_Front.png',
  'bacon': 'https://images.medicinenet.com/images/article/main_image/how-long-does-bacon-last.jpg?output-quality=75',
  'chicken sausage': 'https://storage.googleapis.com/images-prs-prd-c7e7986.prs.prd.v8.commerce.mi9cloud.com/product-images/zoom/00030771026367_1',
  'sausage': 'https://www.paulinamarket.com/cdn/shop/files/hungarian.jpg?v=1714743894',
  'ham': 'https://heritagefoods.com/cdn/shop/products/Uncured-ham-bonein3_preview_600x.jpeg?v=1629752527',
  'salmon': 'https://thefatbutcherph.com/cdn/shop/articles/NEW_COLLECTION.png?v=1682413999&width=1100',
  'shrimp': 'https://shop.legalseafoods.com/cdn/shop/files/RawShrimpNov24.jpg?v=1731080264&width=1946',
  'clams': 'https://popmenucloud.com/cdn-cgi/image/width=1920,height=1920,format=auto,fit=scale-down/jtfpqdub/bccd17cb-054b-4a46-8123-927e3ed3e50a.jpeg',
  'tilapia': 'https://assets.usfoods.com/Product/Image/10133495/23f253cbebee152b35c938e050fba02b.jpg',
  'tuna': 'https://www.tastingtable.com/img/gallery/14-tips-you-need-when-cooking-with-tuna/l-intro-1671563002.jpg',
  'eggs': 'https://cdn.shopify.com/s/files/1/0732/3140/1273/files/Untitled_design_2_b5be794c-dd9b-40de-80eb-82c9b9fef755.png?v=1743249046',
  'egg': 'https://cdn.shopify.com/s/files/1/0732/3140/1273/files/Untitled_design_2_b5be794c-dd9b-40de-80eb-82c9b9fef755.png?v=1743249046',
  'tofu': 'https://bonpourtoi.ca/app/uploads/2020/04/BPT-Articles-tofu-cru-tinyjpg.jpeg',
  'red onion': 'https://www.naturesninja.org/wp-content/uploads/2020/02/red-onions-960.jpg',
  'yellow onion': 'https://www.gurneys.com/cdn/shop/files/14781A.webp?v=1729090544',
  'white onion': 'https://migardener.com/cdn/shop/products/ONI5_white_sweet_spanish_d4e91e4a-db67-4a6f-b939-845ac8d7fa23_800x.jpg?v=1641493834',
  'onion': 'https://www.gurneys.com/cdn/shop/files/14781A.webp?v=1729090544',
  'garlic': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN_uhM0eWP8vpC5ZYQWJtX7OWWji_2u0-g2Q&s',
  'shallots': 'https://www.adaptiveseeds.com/wp-content/uploads/2024/12/Onion-Cuisse-de-Poulet-Zebrune-1.jpg',
  'shallot': 'https://www.adaptiveseeds.com/wp-content/uploads/2024/12/Onion-Cuisse-de-Poulet-Zebrune-1.jpg',
  'tomato': 'https://img.etimg.com/thumb/width-1200,height-900,imgsize-56196,resizemode-75,msid-95423774/magazines/panache/5-reasons-why-tomatoes-should-be-your-favourite-fruit-this-year.jpg',
  'tomatoes': 'https://img.etimg.com/thumb/width-1200,height-900,imgsize-56196,resizemode-75,msid-95423774/magazines/panache/5-reasons-why-tomatoes-should-be-your-favourite-fruit-this-year.jpg',
  'cherry tomatoes': 'https://bacolodpages.com/sites/default/files/styles/480x480/public/products/Cherry%20Tomato1.png.webp?itok=PsUliomj',
  'bell pepper': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZVYa_RBlmhm9U4LPivanbeLe4aZ1PHG_JJQ&s',
  'bell peppers': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZVYa_RBlmhm9U4LPivanbeLe4aZ1PHG_JJQ&s',
  'jalape\u00f1o': 'https://www.foodandwine.com/thmb/ig_EnbYuEt-88gXJSDFpyWGxEJY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Why-Have-Jalapenos-Become-so-Mild-FT-BLOG0525-01-bfb059df7eb745a6b454ec971c7d36b0.jpg',
  'jalapeno': 'https://www.foodandwine.com/thmb/ig_EnbYuEt-88gXJSDFpyWGxEJY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Why-Have-Jalapenos-Become-so-Mild-FT-BLOG0525-01-bfb059df7eb745a6b454ec971c7d36b0.jpg',
  'carrot': 'https://static.wikia.nocookie.net/my-first-encyclopedia/images/9/9a/Carrot-PNG-Clipart.png/revision/latest/scale-to-width-down/340?cb=20220711193537',
  'carrots': 'https://static.wikia.nocookie.net/my-first-encyclopedia/images/9/9a/Carrot-PNG-Clipart.png/revision/latest/scale-to-width-down/340?cb=20220711193537',
  'baby carrot': 'https://i5.walmartimages.com/seo/Fresh-Baby-Cut-Carrots-2lb-Bag_7e8ec89d-158d-41d7-9dd4-aada713d1227.bda0fd4fa50396bc2205c1ca2e38ea75.jpeg',
  'baby carrots': 'https://i5.walmartimages.com/seo/Fresh-Baby-Cut-Carrots-2lb-Bag_7e8ec89d-158d-41d7-9dd4-aada713d1227.bda0fd4fa50396bc2205c1ca2e38ea75.jpeg',
  'celery': 'https://images.immediate.co.uk/production/volatile/sites/30/2020/02/Celery-stalks-and-leaves-7860193.jpg?quality=90&resize=700,636',
  'broccoli': 'https://voca-land.sgp1.cdn.digitaloceanspaces.com/0/1757665833918/02cb4926.jpg',
  'cauliflower': 'https://lh6.googleusercontent.com/proxy/U92MdIX-umsRwyIJa9MgRyvnW4kUOaGNIKef3C1pJnbExzNFHCLihNceYGESRvEh_p61UB15r8QGcgnXc2oR8gO97q76aTZMljuXz1ZJRjf29rObGo-k0zt8Du251vaCSWgQTaAHee5jf3Q',
  'spinach': 'https://images.immediate.co.uk/production/volatile/sites/30/2013/06/GettyImages-652986635-3dffa4d.jpg?quality=90&resize=708,643',
  'kale': 'https://healthyfamilyproject.com/wp-content/uploads/2020/05/Kale-background.jpg',
  'lettuce': 'https://www.gurneys.com/cdn/shop/files/14627A.webp?v=1729089529',
  'arugula': 'https://www.taylorfarms.com/wp-content/uploads/2023/10/Arugula.webp',
  'zucchini': 'https://thrivemeetings.com/wp-content/uploads/2016/06/Zucchini%E2%80%94whole-partially-sliced.jpg',
  'squash': 'https://www.highmowingseeds.com/media/catalog/product/cache/95cbc1bb565f689da055dd93b41e1c28/2/9/2940_1.jpg',
  'eggplant': 'https://snaped.fns.usda.gov/sites/default/files/seasonal-produce/2018-05/eggplant.jpg',
  'mushrooms': 'https://lovefoodhatewaste.com/sites/default/files/styles/16_9_two_column/public/2022-07/Mushroom-sh1679028943.jpg.webp?itok=zsNCU7sW',
  'mushroom': 'https://lovefoodhatewaste.com/sites/default/files/styles/16_9_two_column/public/2022-07/Mushroom-sh1679028943.jpg.webp?itok=zsNCU7sW',
  'potato': 'https://www.lovefoodhatewaste.com/sites/default/files/styles/twitter_card_image/public/2022-08/Potatoes-shutterstock-1721688538.jpg.webp?itok=4hLqSjDi',
  'potatoes': 'https://www.lovefoodhatewaste.com/sites/default/files/styles/twitter_card_image/public/2022-08/Potatoes-shutterstock-1721688538.jpg.webp?itok=4hLqSjDi',
  'baby potato': 'https://vegetablerecipes.com/wp-content/uploads/2023/03/Boiled-Baby-Potatoes-VR-6-1-of-1-1024x731.jpg',
  'baby potatoes': 'https://vegetablerecipes.com/wp-content/uploads/2023/03/Boiled-Baby-Potatoes-VR-6-1-of-1-1024x731.jpg',
  'sweet potato': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB3tXoUG54W7fKjmfz63nPzvsLC4v1ro9R0g&s',
  'sweet potatoes': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB3tXoUG54W7fKjmfz63nPzvsLC4v1ro9R0g&s',
  'corn': 'https://asian-veggies.com/cdn/shop/products/goldcorn.jpg?v=1614395321',
  'green beans': 'https://vikalinka.com/wp-content/uploads/2023/12/Lemon-Garlic-Green-Beans-7-Edit-500x500.jpg',
  'peas': 'https://images.ctfassets.net/ruek9xr8ihvu/6ajA622p1DhEV41r5mBtC6/b150416e7b2e3ad29afea40dfee50739/Pea_Garden-Kate_Lindquist.jpg?w=1096&q=80&fm=webp',
  'asparagus': 'https://www.madaboutmacarons.com/wp-content/uploads/2023/05/oven-roasted-asparagus-French-500x500.jpg',
  'brussels sprouts': 'https://nutritionsource.hsph.harvard.edu/wp-content/uploads/2024/11/AdobeStock_59069256-1024x683.jpeg',
  'cucumber': 'https://www.freshpoint.com/wp-content/uploads/2020/02/freshpoint-english-cucumber-scaled.jpg',
  'avocado': 'https://domf5oio6qrcr.cloudfront.net/medialibrary/16762/gettyimages-961101662.jpg',
  'cabbage': 'https://www.kikkoman.com/en/cookbook/assets/img/0023_feature2.jpg',
  'apple': 'https://assets.clevelandclinic.org/transform/LargeFeatureImage/cd71f4bd-81d4-45d8-a450-74df78e4477a/Apples-184940975-770x533-1_jpg',
  'apples': 'https://assets.clevelandclinic.org/transform/LargeFeatureImage/cd71f4bd-81d4-45d8-a450-74df78e4477a/Apples-184940975-770x533-1_jpg',
  'banana': 'https://www.southernliving.com/thmb/EM-f8L_T36WluwBtBkhD4gnCKg8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/How_To_Freeze_Bananas_023-71e81efacb6a4d87a3596b8c2c519884.jpg',
  'bananas': 'https://www.southernliving.com/thmb/EM-f8L_T36WluwBtBkhD4gnCKg8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/How_To_Freeze_Bananas_023-71e81efacb6a4d87a3596b8c2c519884.jpg',
  'orange': 'https://cdn.britannica.com/24/174524-050-A851D3F2/Oranges.jpg',
  'oranges': 'https://cdn.britannica.com/24/174524-050-A851D3F2/Oranges.jpg',
  'lemon': 'https://assets.vogue.com/photos/6925e7e556850c6852dae0ab/1:1/w_3648,h_3648,c_limit/1395000061',
  'lemons': 'https://assets.vogue.com/photos/6925e7e556850c6852dae0ab/1:1/w_3648,h_3648,c_limit/1395000061',
  'lime': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNtbiRCz4WAebwffdxrErABMHo676xRI9a0Q&s',
  'limes': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNtbiRCz4WAebwffdxrErABMHo676xRI9a0Q&s',
  'strawberries': 'https://cdn.mos.cms.futurecdn.net/r5ibnDz656ibgejAdjWHaj.jpg',
  'strawberry': 'https://cdn.mos.cms.futurecdn.net/r5ibnDz656ibgejAdjWHaj.jpg',
  'blueberries': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqUBHTFEu_rXLYV39NuVesAA1aB2CiWpr-Ww&s',
  'blueberry': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqUBHTFEu_rXLYV39NuVesAA1aB2CiWpr-Ww&s',
  'raspberries': 'https://cdn.britannica.com/83/156583-050-4A1FABB5/Red-raspberries.jpg',
  'raspberry': 'https://cdn.britannica.com/83/156583-050-4A1FABB5/Red-raspberries.jpg',
  'mango': 'https://www.avera.org/app/files/public/75073/mango-fruit-and-slices-on-a-cutting-board.jpg',
  'pineapple': 'https://articles-1mg.gumlet.io/articles/wp-content/uploads/2016/10/pineapple.jpg?compress=true&quality=80&w=640&dpr=2.6',
  'grapes': 'https://assets.epicurious.com/photos/55e4c39fcf90d6663f727a74/16:9/w_2560%2Cc_limit/shutterstock_209917372.jpg',
  'peaches': 'https://draxe.com/wp-content/uploads/2016/08/DrAxePeachHeader.jpg',
  'peach': 'https://draxe.com/wp-content/uploads/2016/08/DrAxePeachHeader.jpg',
  'milk': 'https://www.elizabethrider.com/wp-content/uploads/2024/02/homemade-almond-milk-2.jpg',
  'heavy cream': 'https://i5.walmartimages.com/seo/Land-O-Lakes-Heavy-Whipping-Cream-32-fl-oz_09395890-0f62-4336-9fb1-f4c01622890b.5c23cc54754527ecf67c8716c210265f.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF',
  'half and half': 'https://i5.walmartimages.com/asr/66471027-4b85-4dcc-915c-101c9e90f4a4.926ae5f515760be92fd8ab0a6422dab6.jpeg',
  'butter': 'https://www.bhg.com/thmb/Fx7YYldknv8aJvvsO-f5YZxOn5k=/5434x0/filters:no_upscale():strip_icc()/GettyImages-2158134925-23a8af00a9db4ddabbe99cb0c0d67540.jpg',
  'cheddar cheese': 'https://pearlvalleycheese.com/cdn/shop/files/sharp-cheddar-slices_1.jpg?v=1755888466',
  'cheddar': 'https://pearlvalleycheese.com/cdn/shop/files/sharp-cheddar-slices_1.jpg?v=1755888466',
  'mozzarella': 'https://images.immediate.co.uk/production/volatile/sites/30/2021/09/Homemade-mozzarella-054151d.jpg?quality=90&resize=708,643',
  'parmesan': 'https://www.kroger.com/product/images/xlarge/front/0003114252385',
  'feta': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Feta_Cheese.jpg',
  'monterey jack': 'https://californiaranchmarket.com/cdn/shop/products/105147.jpg?v=1622480636',
  'monterey jack cheese': 'https://californiaranchmarket.com/cdn/shop/products/105147.jpg?v=1622480636',
  'pepper jack': 'https://www.kroger.com/product/images/large/front/0004610000122',
  'pepper jack cheese': 'https://www.kroger.com/product/images/large/front/0004610000122',
  'cream cheese': 'https://i5.walmartimages.com/asr/7160398e-31e3-4097-8280-bf333ea32d49.b53d76dbeeb50dc7857146566ed0dede.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF',
  'yogurt': 'https://www.liveeatlearn.com/wp-content/uploads/2024/08/how-to-make-homemade-greek-yogurt-28-500x500.jpg',
  'sour cream': 'https://m.media-amazon.com/images/I/61wzj-GacBL._AC_UF1000,1000_QL80_.jpg',
  'bread': 'https://assets.bonappetit.com/photos/5c62e4a3e81bbf522a9579ce/1:1/w_2560%2Cc_limit/milk-bread.jpg',
  'tortillas': 'https://static01.nyt.com/images/2024/08/06/multimedia/11EATrex-flour-tortillas-mvfk/11EATrex-flour-tortillas-mvfk-mediumSquareAt3X.jpg',
  'tortilla': 'https://static01.nyt.com/images/2024/08/06/multimedia/11EATrex-flour-tortillas-mvfk/11EATrex-flour-tortillas-mvfk-mediumSquareAt3X.jpg',
  'pita': 'https://www.seriouseats.com/thmb/oV5Eov1pgSkwjpjA5E2ynSdCFv4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__recipes__images__2015__08__20150626-Stacked-Perfect-Pitas-Yvonne-Ruperti-Edit-Edit-bf72e9e490e148e0b95c56c04a0d18ab.jpg',
  'spaghetti': 'https://cdn.apartmenttherapy.info/image/upload/f_jpg,q_auto:eco,c_fill,g_auto,w_1500,ar_1:1/k%2Farchive%2Faa5b3bf7120c1f655611b3e4b2e848679823777e',
  'cavatappi': 'https://images.albertsons-media.com/is/image/ABS/970011886-ECOM?$ng-ecom-pdp-desktop$&defaultImage=Not_Available',
  'linguine': 'https://chefsmandala.com/wp-content/uploads/2018/02/Linguine-Pasta-shutterstock_377987440.jpg',
  'penne': 'https://www.the-pasta-project.com/wp-content/uploads/Penne-Pasta.jpg',
  'fettuccine': 'https://tb-static.uber.com/prod/image-proc/processed_images/5d1066b9afe3876d00ab9de64a62a0f3/b4665c191b34baf3d0e0fa45dfdd3d1d.jpeg',
  'rigatoni': 'https://www.orchidsandsweettea.com/wp-content/uploads/2024/02/Spicy-Vodka-Rigatoni-Pasta-Bake-2.jpg',
  'farfalle': 'https://substackcdn.com/image/fetch/$s_!-xnQ!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7edd31a4-8561-4264-9881-0333c643138e_1442x2048.jpeg',
  'orzo': 'https://m.media-amazon.com/images/I/71TZ64uRNxL._SL1500_.jpg',
  'lasagna noodles': 'https://keepingitsimpleitalian.com/wp-content/uploads/2023/01/dried-lasagna-noodles-360x480.jpg',
  'lasagna': 'https://keepingitsimpleitalian.com/wp-content/uploads/2023/01/dried-lasagna-noodles-360x480.jpg',
  'egg noodles': 'https://thewoksoflife.com/wp-content/uploads/2020/04/homemade-chinese-egg-noodles-19-e1609271249794.jpg',
  'rice': 'https://www.bhf.org.uk/-/media/images/information-support/support/healthy-living/recipes-new/peas-and-corn-pilau-rice_800x600.jpg',
  'quinoa': 'https://twohealthykitchens.com/wp-content/uploads/2016/01/THK-Quinoa-1-2.jpg',
  'couscous': 'https://www.fivehearthome.com/wp-content/uploads/2024/07/How-to-Cook-Couscous-by-Five-Heart-Home_1200pxFeatured-1.jpg',
  'flour': 'https://pics.walgreens.com/prodimg/509296/450.jpg',
  'breadcrumbs': 'https://www.bowlofdelicious.com/wp-content/uploads/2021/09/homemade-bread-crumbs-square.jpg',
  'oats': 'https://food.fnr.sndimg.com/content/dam/images/food/fullset/2021/09/23/rolled-oats-linen-wood-surface-white-bowl.jpg.rend.hgtvcom.1280.1280.85.suffix/1632429307666.webp',
  'cereal': 'https://www.digicomply.com/hubfs/AI-Generated%20Media/Images/Cereal%20Recall.jpeg',
  'salt': 'https://media.self.com/photos/5cc0781558c4c36a45d91deb/1:1/w_3569,h_3569,c_limit/cooking-salts.jpg',
  'pepper': 'https://spices.com/cdn/shop/products/a5ba8da4bc526b25463e0607481bc4e39a3d5cd33806617f1f32d76e54c84f9d.jpg?v=1718827884&width=1445',
  'black pepper': 'https://spices.com/cdn/shop/products/a5ba8da4bc526b25463e0607481bc4e39a3d5cd33806617f1f32d76e54c84f9d.jpg?v=1718827884&width=1445',
  'cumin': 'https://i5.walmartimages.com/seo/McCormick-Kosher-Ground-Cumin-1-5-oz-Bottle_bce81744-0b14-4e22-8d84-19070ac9a481.7c849d503f3269de460198ce80883008.jpeg',
  'paprika': 'https://badiaspices.com/wp-content/uploads/2025/02/033844006730.jpg',
  'crushed red pepper': 'https://badiaspices.com/wp-content/uploads/2025/02/033844005474.jpg',
  'red pepper flakes': 'https://badiaspices.com/wp-content/uploads/2025/02/033844005474.jpg',
  'chili powder': 'https://www.mccormick.com/cdn/shop/files/00052100004280_D_A1N1-2025-12-02.jpg?v=1764708478&width=700',
  'oregano': 'https://m.media-amazon.com/images/I/91qESpubSlL._AC_UF894,1000_QL80_.jpg',
  'basil': 'https://cdn.shopify.com/s/files/1/0686/4283/2583/files/new_about_basil_hero.webp?v=1757613354',
  'thyme': 'https://www.highmowingseeds.com/media/catalog/product/cache/95cbc1bb565f689da055dd93b41e1c28/5/1/5140-4.jpg',
  'rosemary': 'https://m.media-amazon.com/images/I/61giyp23UTL._AC_UF1000,1000_QL80_.jpg',
  'garlic powder': 'https://m.media-amazon.com/images/I/81mPfw5LQgL._AC_UF894,1000_QL80_.jpg',
  'onion powder': 'https://badiaspices.com/wp-content/uploads/2025/02/033844000066.jpg',
  'cinnamon': 'https://www.bluemountainorganics.com/media/catalog/product/cache/207e23213cf636ccdef205098cf3c8a3/c/i/cinnamon_powder_4.webp',
  'nutmeg': 'https://images.albertsons-media.com/is/image/ABS/114150166-C1N1?$ng-ecom-pdp-mobile$&defaultImage=Not_Available',
  'bay leaves': 'https://www.redstickspice.com/cdn/shop/products/bay_leaf_600x.jpg?v=1704812105',
  'bay leaf': 'https://www.redstickspice.com/cdn/shop/products/bay_leaf_600x.jpg?v=1704812105',
  'italian seasoning': 'https://www.kroger.com/product/images/xlarge/front/0005210000534',
  'olive oil': 'https://purenutrition.in/cdn/shop/files/Olive-Pomace-Oil-1L-_FOP_1.jpg?v=1723799877&width=1500',
  'vegetable oil': 'https://storage.googleapis.com/images-lnb-prd-8936dd0.lnb.prd.v8.commerce.mi9cloud.com/product-images/zoom/00070253009587.png',
  'coconut oil': 'https://www.pureindianfoods.com/cdn/shop/files/CO-1_d864f329-f198-4e44-949f-99a80dfdba07.jpg?v=1701805811',
  'avocado oil': 'https://shop.daniellewalker.com/cdn/shop/products/31csf_tADRL_560x.jpg?v=1604462155',
  'sesame oil': 'https://m.media-amazon.com/images/I/71SxFJLbq3L._AC_UF894,1000_QL80_.jpg',
  'balsamic vinegar': 'https://www.ponti.com/wp-content/uploads/3241.png',
  'red wine vinegar': 'https://images.cdn.retail.brookshires.com/detail/00070404001002_C1C1.jpeg',
  'apple cider vinegar': 'https://i5.walmartimages.com/seo/Bragg-Organic-Apple-Cider-Vinegar-with-the-Mother-Raw-and-Unfiltered-32-fl-oz_e85f2790-ddb2-4ee6-a337-114aca7a00e5.ae5d30f07483f7714bf246bd92a29984.jpeg',
  'soy sauce': 'https://i5.walmartimages.com/asr/bebe857c-3ba0-446a-b019-35aaa727e845.315ccee09c32027b32e06f820788ef3c.jpeg',
  'fish sauce': 'https://www.markethallfoods.com/cdn/shop/files/red-boat-fish-sauce.jpg?v=1761865254&width=900',
  'sugar': 'https://i.cbc.ca/ais/1.1912472,1717151470459/full/max/0/default.jpg?im=Crop%2Crect%3D%280%2C0%2C620%2C348%29%3B',
  'brown sugar': 'https://cdn.jwplayer.com/v2/media/F9e0EImz/thumbnails/VCZN7qMW.jpg?width=1280',
  'honey': 'https://cdn.mos.cms.futurecdn.net/v2/t:0,l:592,cw:3558,ch:2669,q:80,w:2560/zcz8f72orNC9GKgm3tbqMY.jpg',
  'maple syrup': 'https://dutchmansgold.com/cdn/shop/files/17657---Dutchmans-Gold-Pure-Maple-Syrup-250mlWeb_600x.jpg?v=1719681510',
  'vanilla extract': 'https://www.clubhouse.ca/-/media/project/oneweb/clubhouseca/products/club-house/00066200004705_a1c1.png',
  'vanilla': 'https://www.clubhouse.ca/-/media/project/oneweb/clubhouseca/products/club-house/00066200004705_a1c1.png',
  'chicken broth': 'https://i5.walmartimages.com/seo/Swanson-100-Natural-Chicken-Broth-32-oz-Carton_d663a2bb-5e23-471b-b3ab-744341f43ab9.2cec2d16e105ee87612f1fab8f00b216.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF',
  'chicken stock': 'https://i5.walmartimages.com/seo/Swanson-100-Natural-Chicken-Broth-32-oz-Carton_d663a2bb-5e23-471b-b3ab-744341f43ab9.2cec2d16e105ee87612f1fab8f00b216.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF',
  'beef broth': 'https://healthyheartmarket.com/cdn/shop/products/swanson-unsalted-beef-broth-gluten-free-32-oz-carton-healthy-heart-market.jpg?v=1675886225&width=1445',
  'beef stock': 'https://healthyheartmarket.com/cdn/shop/products/swanson-unsalted-beef-broth-gluten-free-32-oz-carton-healthy-heart-market.jpg?v=1675886225&width=1445',
  'canned tomatoes': 'https://www.allrecipes.com/thmb/v7p4-wFK22zmUDJlktNwgslED-8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ar-canned-tomato-taste-test-cento-whole-4x3-1b3a0d596e0041ffad3c644cb039b53a.jpg',
  'diced tomatoes': 'https://www.allrecipes.com/thmb/v7p4-wFK22zmUDJlktNwgslED-8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ar-canned-tomato-taste-test-cento-whole-4x3-1b3a0d596e0041ffad3c644cb039b53a.jpg',
  'tomato paste': 'https://www.cheeseshopsb.com/cdn/shop/products/502515_doubleconcetrate_tomatopaste.jpg?v=1718486636',
  'tomato sauce': 'https://www.kierstenhickman.com/wp-content/uploads/2019/09/homemade-tomato-sauce-2-khickman.jpg',
  'black beans': 'https://i5.walmartimages.com/seo/Bush-s-Black-Beans-Canned-Beans-15-oz_c27b0e60-c3f8-434a-9cfa-f83b05e651a8.2796317ef2848615bad8f99338504cfc.jpeg',
  'kidney beans': 'https://i5.walmartimages.com/seo/Bush-s-Dark-Red-Kidney-Beans-Canned-Beans-16-oz_c80718d7-1d4d-41a1-a971-c6e9c859aa9f.7c67bd90bc638704e7e01bafb838571c.jpeg',
  'chickpeas': 'https://www.lapreferida.com/wp-content/uploads/2017/12/Chick-Peas-1.png',
  'garbanzo beans': 'https://www.lapreferida.com/wp-content/uploads/2017/12/Chick-Peas-1.png',
  'coconut milk': 'https://images.albertsons-media.com/is/image/ABS/127050033-C1N1?$ng-ecom-pdp-mobile$&defaultImage=Not_Available',
  'peanut butter': 'https://www.kroger.com/product/images/xlarge/front/0005150024191',
  'almonds': 'https://www.harighotra.co.uk/images/Shutterstock/almonds_560x560.jpg',
  'walnuts': 'https://wegotnuts.com/cdn/shop/files/1_6bcf7df5-aa40-4301-87d0-1226f3b40357_1024x1024.png?v=1741332459',
  'peanuts': 'https://nuts.com/images/ct/images.cdn.us-central1.gcp.commercetools.com/fe6ef66f-361c-4adb-b11f-d4aa8f13c79c/4046_RoastedPeanutsS-g-WeqkNg-zoom.jpg',
  'white wine': 'https://images.commerce7.com/st--francis-winery/images/medium/chardonnay-1708120943704.png',
  'red wine': 'https://bravofarms.com/cdn/shop/products/red-wine.jpg?v=1646253890',
  'brandy': 'https://cdn11.bigcommerce.com/s-0ddlsmhg83/images/stencil/836x836/products/2485/2703/hennessy-very-special-cognac__42099.1752495284.1280.1280__79246.1755241936.jpg?c=1'
};

// ITEM_MAPPINGS for receipt scanning
const ITEM_MAPPINGS = [
  { patterns: [/bnls\s*sknls?\s*(ckn|chkn|chicken)/i, /chicken\s*breast/i, /ckn\s*brst/i], name: 'Chicken Breast (Boneless Skinless)', category: 'Meat & Seafood' },
  { patterns: [/chicken\s*thigh/i, /ckn\s*thigh/i, /shawarma\s*chicken/i], name: 'Chicken Thighs', category: 'Meat & Seafood' },
  { patterns: [/chicken\s*sausage/i, /sausage.*chicken/i, /ckn\s*saus/i], name: 'Chicken Sausage', category: 'Meat & Seafood' },
  { patterns: [/rotisserie/i], name: 'Rotisserie Chicken', category: 'Meat & Seafood' },
  { patterns: [/chicken\s*wing/i], name: 'Chicken Wings', category: 'Meat & Seafood' },
  { patterns: [/chicken\s*drum/i], name: 'Chicken Drumsticks', category: 'Meat & Seafood' },
  { patterns: [/ground\s*chicken/i], name: 'Ground Chicken', category: 'Meat & Seafood' },
  { patterns: [/ground\s*beef/i, /beef\s*ground/i], name: 'Ground Beef', category: 'Meat & Seafood' },
  { patterns: [/steak/i, /ribeye/i, /sirloin/i, /filet/i], name: 'Steak', category: 'Meat & Seafood' },
  { patterns: [/beef\s*stew/i], name: 'Beef Stew Meat', category: 'Meat & Seafood' },
  { patterns: [/bacon/i], name: 'Bacon', category: 'Meat & Seafood' },
  { patterns: [/pork\s*chop/i], name: 'Pork Chops', category: 'Meat & Seafood' },
  { patterns: [/ground\s*pork/i], name: 'Ground Pork', category: 'Meat & Seafood' },
  { patterns: [/sausage/i], name: 'Sausage', category: 'Meat & Seafood' },
  { patterns: [/salmon/i], name: 'Salmon', category: 'Meat & Seafood' },
  { patterns: [/shrimp/i], name: 'Shrimp', category: 'Meat & Seafood' },
  { patterns: [/tilapia/i], name: 'Tilapia', category: 'Meat & Seafood' },
  { patterns: [/cod\b/i], name: 'Cod', category: 'Meat & Seafood' },
  { patterns: [/tuna/i], name: 'Tuna', category: 'Meat & Seafood' },
  { patterns: [/zucchini/i, /r-squash\s*zucchini/i], name: 'Zucchini', category: 'Produce' },
  { patterns: [/yellow\s*squash/i, /squash\s*yellow/i], name: 'Yellow Squash', category: 'Produce' },
  { patterns: [/green\s*bean/i], name: 'Green Beans', category: 'Produce' },
  { patterns: [/broccoli/i], name: 'Broccoli', category: 'Produce' },
  { patterns: [/spinach/i], name: 'Spinach', category: 'Produce' },
  { patterns: [/kale/i], name: 'Kale', category: 'Produce' },
  { patterns: [/lettuce/i, /romaine/i], name: 'Lettuce', category: 'Produce' },
  { patterns: [/carrot/i], name: 'Carrots', category: 'Produce' },
  { patterns: [/onion/i], name: 'Onions', category: 'Produce' },
  { patterns: [/garlic/i], name: 'Garlic', category: 'Produce' },
  { patterns: [/tomato/i], name: 'Tomatoes', category: 'Produce' },
  { patterns: [/potato(?!.*chip)/i, /sweet\s*potato/i], name: 'Potatoes', category: 'Produce' },
  { patterns: [/cucumber/i, /hothouse/i], name: 'Cucumber', category: 'Produce' },
  { patterns: [/pepper\s*(bell)?/i, /bell\s*pepper/i], name: 'Bell Peppers', category: 'Produce' },
  { patterns: [/mushroom/i], name: 'Mushrooms', category: 'Produce' },
  { patterns: [/asparagus/i], name: 'Asparagus', category: 'Produce' },
  { patterns: [/brussels/i], name: 'Brussels Sprouts', category: 'Produce' },
  { patterns: [/cauliflower/i], name: 'Cauliflower', category: 'Produce' },
  { patterns: [/celery/i], name: 'Celery', category: 'Produce' },
  { patterns: [/corn\b/i], name: 'Corn', category: 'Produce' },
  { patterns: [/avocado/i], name: 'Avocados', category: 'Produce' },
  { patterns: [/cabbage/i], name: 'Cabbage', category: 'Produce' },
  { patterns: [/greens/i], name: 'Mixed Greens', category: 'Produce' },
  { patterns: [/banana/i], name: 'Bananas', category: 'Produce' },
  { patterns: [/apple/i], name: 'Apples', category: 'Produce' },
  { patterns: [/orange/i], name: 'Oranges', category: 'Produce' },
  { patterns: [/lemon/i], name: 'Lemons', category: 'Produce' },
  { patterns: [/lime/i], name: 'Limes', category: 'Produce' },
  { patterns: [/strawberr/i], name: 'Strawberries', category: 'Produce' },
  { patterns: [/blueberr/i], name: 'Blueberries', category: 'Produce' },
  { patterns: [/grape(?!fruit)/i], name: 'Grapes', category: 'Produce' },
  { patterns: [/mango/i], name: 'Mango', category: 'Produce' },
  { patterns: [/pineapple/i], name: 'Pineapple', category: 'Produce' },
  { patterns: [/milk\b/i], name: 'Milk', category: 'Dairy & Eggs' },
  { patterns: [/egg/i], name: 'Eggs', category: 'Dairy & Eggs' },
  { patterns: [/butter/i], name: 'Butter', category: 'Dairy & Eggs' },
  { patterns: [/cheese/i, /cheddar/i, /mozzarella/i, /parmesan/i], name: 'Cheese', category: 'Dairy & Eggs' },
  { patterns: [/yogurt/i], name: 'Yogurt', category: 'Dairy & Eggs' },
  { patterns: [/cream\s*cheese/i], name: 'Cream Cheese', category: 'Dairy & Eggs' },
  { patterns: [/sour\s*cream/i], name: 'Sour Cream', category: 'Dairy & Eggs' },
  { patterns: [/half.*half/i, /creamer/i], name: 'Half & Half', category: 'Dairy & Eggs' },
  { patterns: [/bread/i, /loaf/i], name: 'Bread', category: 'Bakery' },
  { patterns: [/bagel/i], name: 'Bagels', category: 'Bakery' },
  { patterns: [/tortilla/i], name: 'Tortillas', category: 'Bakery' },
  { patterns: [/pita/i], name: 'Pita Bread', category: 'Bakery' },
  { patterns: [/roll\b/i, /bun\b/i], name: 'Rolls/Buns', category: 'Bakery' },
  { patterns: [/rice\b/i], name: 'Rice', category: 'Pantry' },
  { patterns: [/pasta/i, /spaghetti/i, /penne/i], name: 'Pasta', category: 'Pantry' },
  { patterns: [/olive\s*oil/i], name: 'Olive Oil', category: 'Pantry' },
  { patterns: [/lobster\s*bisque/i], name: 'Lobster Bisque', category: 'Pantry' },
  { patterns: [/tomato\s*soup/i], name: 'Tomato Soup', category: 'Pantry' },
  { patterns: [/chicken\s*soup/i, /chicken\s*noodle/i], name: 'Chicken Soup', category: 'Pantry' },
  { patterns: [/bean.*can/i, /canned.*bean/i], name: 'Canned Beans', category: 'Pantry' },
  { patterns: [/tomato.*sauce/i, /marinara/i], name: 'Tomato Sauce', category: 'Pantry' },
  { patterns: [/salsa/i], name: 'Salsa', category: 'Pantry' },
  { patterns: [/water\b/i], name: 'Water', category: 'Beverages' },
  { patterns: [/juice/i], name: 'Juice', category: 'Beverages' },
  { patterns: [/coffee/i], name: 'Coffee', category: 'Beverages' },
  { patterns: [/tea\b/i], name: 'Tea', category: 'Beverages' },
  { patterns: [/soda/i, /cola/i], name: 'Soda', category: 'Beverages' },
];

const DEFAULT_EXPIRATION_DAYS = {
  'leafy greens': 5, 'lettuce': 5, 'spinach': 5, 'kale': 7,
  'berries': 5, 'strawberries': 5, 'blueberries': 7,
  'bananas': 7, 'apples': 21, 'oranges': 21, 'lemons': 21, 'limes': 21,
  'avocados': 5, 'tomatoes': 7, 'cucumbers': 7, 'carrots': 14, 'baby carrots': 14,
  'broccoli': 7, 'cauliflower': 7, 'bell peppers': 7, 'onions': 30, 'garlic': 30,
  'potatoes': 21, 'mushrooms': 7, 'zucchini': 7, 'squash': 14,
  'asparagus': 5, 'green beans': 7, 'brussels sprouts': 7, 'celery': 14, 'corn': 3,
  'chicken breast': 3, 'chicken thighs': 3, 'chicken': 3,
  'ground beef': 3, 'steak': 5, 'pork chops': 5, 'bacon': 7, 'sausage': 5,
  'salmon': 2, 'shrimp': 2, 'fish': 2,
  'milk': 10, 'eggs': 28, 'butter': 30, 'cheese': 21, 'yogurt': 14,
  'cream cheese': 14, 'sour cream': 14,
  'bread': 7, 'bagels': 7, 'tortillas': 14,
  'rice': 365, 'pasta': 365, 'canned beans': 730, 'olive oil': 365, 'soup': 365,
  '_Produce': 7, '_Meat & Seafood': 3, '_Dairy & Eggs': 14, '_Bakery': 7,
  '_Frozen': 180, '_Pantry': 180, '_Snacks': 60, '_Beverages': 30, '_Other': 30,
  '_Uncategorized': 7
};

const GROCERY_KEY = 'smartGroceryList_v1';
const GROCERY_CATEGORIES = [
  'Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Pantry & Dry Goods',
  'Spices & Seasonings', 'Frozen', 'Household', 'Other'
];

const PANTRY_STAPLES = ['salt', 'pepper', 'black pepper', 'kosher salt', 'sea salt', 'olive oil', 'extra virgin olive oil', 'vegetable oil', 'cooking spray', 'canola oil', 'water', 'butter', 'unsalted butter', 'sugar', 'brown sugar', 'granulated sugar', 'flour', 'all-purpose flour', 'all purpose flour', 'garlic powder', 'onion powder', 'paprika', 'cumin', 'oregano', 'baking soda', 'baking powder', 'soy sauce', 'vinegar', 'white vinegar', 'apple cider vinegar'];
function isStaple(name) { return PANTRY_STAPLES.some(s => normalizeIngredient(s) === normalizeIngredient(name)); }

const SAVED_RECIPES_KEY = 'savedRecipes';
const FOOD_LOG_KEY = 'foodLog';
const CHEF_API_URL = 'https://chef-claude.iezuri22.workers.dev';
const EFFORT_LEVELS_KEY = 'recipeEffortLevels';
const EFFORT_LEVELS = {
  lazy: { label: 'Lazy', desc: 'under 15 min', color: '#e85d5d', bg: 'rgba(232,93,93,0.15)', border: 'rgba(232,93,93,0.4)' },
  moderate: { label: 'Moderate', desc: '15-45 min', color: '#ffb340', bg: 'rgba(255,179,64,0.15)', border: 'rgba(255,179,64,0.4)' },
  timely: { label: 'Timely', desc: '45+ min', color: '#6e8cbe', bg: 'rgba(110,140,190,0.15)', border: 'rgba(110,140,190,0.4)' }
};
function getRecipeEffortLevels() { try { return JSON.parse(localStorage.getItem(EFFORT_LEVELS_KEY) || '{}'); } catch { return {}; } }
function getRecipeEffort(recipeId) { return getRecipeEffortLevels()[recipeId] || null; }
function setRecipeEffort(recipeId, level) {
  const levels = getRecipeEffortLevels();
  if (level && EFFORT_LEVELS[level]) { levels[recipeId] = level; } else { delete levels[recipeId]; }
  localStorage.setItem(EFFORT_LEVELS_KEY, JSON.stringify(levels));
  syncEffortLevelsToSupabase(levels);
}
function renderEffortPill(level, size) {
  if (!level || !EFFORT_LEVELS[level]) return '';
  const e = EFFORT_LEVELS[level];
  const s = size === 'sm' ? 'font-size:9px;padding:2px 6px;' : 'font-size:11px;padding:3px 8px;';
  return `<span style="${s}background:${e.bg};color:${e.color};border-radius:10px;font-weight:600;white-space:nowrap;">${e.label}</span>`;
}

// ============================================================
// RATINGS & COMMENTS (localStorage per-recipe)
// ============================================================
const RATINGS_KEY = 'yummy_ratings';
const COMMENTS_KEY = 'yummy_comments';

function getRecipeRatings(recipeId) {
  try {
    const all = JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}');
    return all[recipeId] || { userRating: 0, totalRatings: 0, averageRating: 0, distribution: [0,0,0,0,0] };
  } catch { return { userRating: 0, totalRatings: 0, averageRating: 0, distribution: [0,0,0,0,0] }; }
}

function saveRecipeRating(recipeId, stars) {
  const all = JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}');
  if (!all[recipeId]) {
    all[recipeId] = { userRating: 0, totalRatings: 0, averageRating: 0, distribution: [0,0,0,0,0] };
  }
  const data = all[recipeId];
  // If user already rated, remove old rating first
  if (data.userRating > 0) {
    data.distribution[data.userRating - 1] = Math.max(0, data.distribution[data.userRating - 1] - 1);
    data.totalRatings = Math.max(0, data.totalRatings - 1);
  }
  data.userRating = stars;
  data.distribution[stars - 1] += 1;
  data.totalRatings += 1;
  // Recalculate average
  const dist = data.distribution;
  const total = dist.reduce((a, b) => a + b, 0);
  const sum = dist.reduce((a, b, i) => a + b * (i + 1), 0);
  data.averageRating = total > 0 ? (sum / total).toFixed(1) : 0;
  localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
  return data;
}

function getRecipeComments(recipeId) {
  try {
    const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
    return all[recipeId] || [];
  } catch { return []; }
}

function addRecipeComment(recipeId, text, photoUrl) {
  const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
  if (!all[recipeId]) all[recipeId] = [];
  all[recipeId].unshift({
    id: Date.now().toString(),
    username: 'You',
    text: text,
    photo: photoUrl || null,
    timestamp: new Date().toISOString(),
    likes: 0
  });
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
  return all[recipeId];
}

// ============================================================
// SECTION 3: STATE
// ============================================================
const state = {
  currentView: 'home',
  recipes: [],
  ingredientKnowledge: [],
  selectedIngredientId: null,
  ingredientSearchTerm: '',
  ingredientCategoryFilter: 'All',
  mealSelections: [],
  mealOptions: [],
  planData: [],
  groceryItems: [],
  selectedCategory: null,
  freestyleMeals: [],
  recordingNeeds: [],
  seasoningBlends: [],
  cookingTasks: [],
  deletedIngredients: [],
  inventory: [],
  expirationDefaults: {},
  receiptMappings: {},
  purchaseHistory: [],
  receipts: [],
  draggedMeal: null,
  mealPlanTab: 'week',
  finishedTimers: [],
  frequentItems: [],
  activeTimers: [],
  notificationsEnabled: false,
  lastNotificationCheck: null,
  freestyleViewMode: 'list',
  freestyleFilterTag: null,
  freestyleSearchTerm: '',
  mentionDropdownVisible: false,
  mentionDropdownType: null,
  mentionDropdownIndex: 0,
  mentionSearchTerm: '',
  mentionCursorPosition: 0,
  externalMealTypes: [
    { name: 'Eating Out', emoji: '\ud83c\udf7d\ufe0f' },
    { name: 'Takeout/Delivery', emoji: '\ud83e\udd61' },
    { name: 'Leftovers', emoji: '\ud83d\udce6' },
    { name: 'At Family/Friends', emoji: '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67' },
    { name: 'Work Lunch', emoji: '\ud83d\udcbc' },
    { name: 'Meal Prep', emoji: '\ud83e\udd57' }
  ],
  selectedDayForRecipe: null,
  selectedMealForRecipe: null,
  selectedCategory: 'All',
  searchTerm: '',
  recipePickerSearchTerm: '',
  filterFavorites: false,
  filterUserCreated: false,
  filterSourceType: 'all',
  filterIngredientGroup: 'all',
  recipePrimaryFilter: 'all',
  recipeShowSecondaryFilters: false,
  recipeSourceToggles: {},
  recipeEffortToggles: {},
  showTips: false,
  showRecipesOrTips: 'recipes',
  selectedGroceryDate: null,
  selectedGroceryMeal: null,
  selectedGroceryRecipeId: null,
  groceryViewMode: 'recipe',
  currentWeekStartDate: (() => {
    const today = new Date();
    const sunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    return sunday.getFullYear() + '-' + String(sunday.getMonth()+1).padStart(2,'0') + '-' + String(sunday.getDate()).padStart(2,'0');
  })(),
  isLoading: false,
  selectedRecipeViewId: null,
  viewingFromPlan: null,
  recipeDetailTab: 'ingredients',
  recipeDetailDescExpanded: false,
  scrollPositions: {},
  swipeDeck: [],
  swipeIndex: 0,
  swipeMealType: null,
  swipeDate: null,
  currentMealSelection: null,
  mealLogs: [],
  mealDays: {},
  viewingDate: (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); })(),
  swipeContext: { active: false, mealType: null, forDate: null },
  homeTab: 'swipe',
  calendarPickerOpen: false,
  calendarMonth: null,
  todaySwipeMealSlot: null,
  swipeSettings: {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
    setupCompleted: false,
    lastUpdated: null
  },
  swipeSetupExpandedSection: null,
  swipeSetupSearchTerm: '',
  swipeSetupFilter: 'all',
  dataLoaded: false,
  // Batch recipes (Build a Plate)
  batchRecipes: [],
  batchForm: null,
  batchViewId: null,
  batchComponentIndex: 0,
  batchRecipePickerOpen: false,
  batchRecipePickerSearch: '',
  batchPickerMealFilter: null,
  batchPickerEffortFilter: null,
  batchPickerSavedFilter: false,
  // Components & Combos
  components: [],
  combos: []
};

// Bridge: state.today reads/writes state.mealDays[todayDate] for backward compatibility
Object.defineProperty(state, 'today', {
  get() {
    const todayDate = getToday();
    if (!state.mealDays[todayDate]) {
      state.mealDays[todayDate] = {
        date: todayDate,
        meals: {
          breakfast: freshMealSlot(),
          lunch: freshMealSlot(),
          dinner: freshMealSlot(),
          snacks: []
        }
      };
    }
    return state.mealDays[todayDate];
  },
  set(val) {
    const todayDate = val.date || getToday();
    state.mealDays[todayDate] = val;
  },
  configurable: true
});

// ============================================================
// SECTION 4: LOCALSTORAGE STORAGE LAYER
// ============================================================

// Cleanup bloated localStorage entries on every page load
function cleanupStorage() {
  localStorage.removeItem('yummy_chefChatMessages');
}
cleanupStorage();

// Storage usage monitor — call checkStorageUsage() in console to debug
function checkStorageUsage() {
  let total = 0;
  let breakdown = {};
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const size = localStorage[key].length;
      total += size;
      breakdown[key] = (size / 1024).toFixed(1) + ' KB';
    }
  }
  console.log('localStorage usage:', (total / 1024 / 1024).toFixed(2) + ' MB');
  console.log('Breakdown:', breakdown);
  return breakdown;
}
window.checkStorageUsage = checkStorageUsage;

function saveToLS(key, data) {
  try {
    localStorage.setItem('yummy_' + key, JSON.stringify(data));
  } catch(e) {
    if (e.name === 'QuotaExceededError') {
      cleanupStorage();
      try {
        localStorage.setItem('yummy_' + key, JSON.stringify(data));
      } catch(e2) {
        console.error('Storage still full after cleanup:', e2);
        alert('Storage is full. Please clear some data in Settings.');
      }
    }
  }
}

// Temporary debug helper — run debugStorage() in console on any device
window.debugStorage = function() {
  console.log('Batch Recipes:', JSON.parse(localStorage.getItem('yummy_batchRecipes') || '[]'));
  console.log('All localStorage keys:', Object.keys(localStorage));
};

// Comprehensive debug — run debugAll() in console to see everything
window.debugAll = function() {
  console.log('=== FULL DEBUG REPORT ===');
  console.log('localStorage key count:', localStorage.length);
  const breakdown = checkStorageUsage();
  console.log('---');
  console.log('state.recipes:', state.recipes?.length);
  console.log('state.inventory:', state.inventory?.length);
  console.log('state.groceryItems:', state.groceryItems?.length);
  console.log('state.mealDays:', Object.keys(state.mealDays || {}).length, 'days');
  console.log('state.mealLogs:', state.mealLogs?.length);
  console.log('state.planData:', state.planData?.length);
  console.log('state.dataLoaded:', state.dataLoaded);
  console.log('---');
  console.log('foodLog (direct key):', getFoodLog()?.length);
  console.log('savedRecipes (direct key):', getSavedRecipes()?.length);
  console.log('smartGroceryList (direct key):', getSmartGroceryList()?.length);
  console.log('---');
  console.log('Supabase client:', typeof window.supabaseClient !== 'undefined' ? 'loaded' : 'NOT loaded (localStorage-only mode)');
  console.log('=== END DEBUG REPORT ===');
  return breakdown;
};

function loadFromLS(key, defaultVal) {
  try {
    const d = localStorage.getItem('yummy_' + key);
    if (!d) return defaultVal;
    const parsed = JSON.parse(d);
    return parsed;
  } catch(e) {
    console.error('[loadFromLS] Failed to parse key "yummy_' + key + '":', e.message);
    return defaultVal;
  }
}

let _persistTimer = null;
function persistState() {
  clearTimeout(_persistTimer);
  _persistTimer = setTimeout(_doPersistState, 500);
}
function persistStateNow() {
  clearTimeout(_persistTimer);
  _doPersistState();
}
function _doPersistState() {
  saveToLS('recipes', state.recipes);
  saveToLS('inventory', state.inventory);
  saveToLS('planData', state.planData);
  saveToLS('mealSelections', state.mealSelections);
  saveToLS('groceryItems', state.groceryItems);
  saveToLS('freestyleMeals', state.freestyleMeals);
  saveToLS('seasoningBlends', state.seasoningBlends);
  saveToLS('ingredientKnowledge', state.ingredientKnowledge);
  saveToLS('mealDays', state.mealDays);
  saveToLS('swipeSettings', state.swipeSettings);
  saveToLS('expirationDefaults', state.expirationDefaults);
  saveToLS('receiptMappings', state.receiptMappings);
  saveToLS('frequentItems', state.frequentItems);
  saveToLS('deletedIngredients', state.deletedIngredients);
  saveToLS('externalMealTypes', state.externalMealTypes);
  saveToLS('mealLogs', state.mealLogs);
  saveToLS('receipts', state.receipts);
  saveToLS('purchaseHistory', state.purchaseHistory);
  saveToLS('cookingTasks', state.cookingTasks);
  saveToLS('recordingNeeds', state.recordingNeeds);
  saveToLS('mealOptions', state.mealOptions);
  saveToLS('batchRecipes', state.batchRecipes);
  if (state.components && state.components.length > 0) saveToLS('components', state.components);
  if (state.combos && state.combos.length > 0) saveToLS('combos', state.combos);
}

function loadAllState() {
  debugLog('[loadAllState] Starting data load from localStorage...');
  state.recipes = loadFromLS('recipes', []);
  seedTestVideoClips();
  state.inventory = loadFromLS('inventory', []);
  state.planData = loadFromLS('planData', []);
  state.mealSelections = loadFromLS('mealSelections', []);
  state.groceryItems = loadFromLS('groceryItems', []);
  state.freestyleMeals = loadFromLS('freestyleMeals', []);
  state.seasoningBlends = loadFromLS('seasoningBlends', []);
  state.ingredientKnowledge = loadFromLS('ingredientKnowledge', []);
  state.mealDays = loadFromLS('mealDays', {});
  state.swipeSettings = loadFromLS('swipeSettings', state.swipeSettings);
  state.expirationDefaults = loadFromLS('expirationDefaults', {});
  state.receiptMappings = loadFromLS('receiptMappings', {});
  state.frequentItems = loadFromLS('frequentItems', []);
  state.deletedIngredients = loadFromLS('deletedIngredients', []);
  state.externalMealTypes = loadFromLS('externalMealTypes', state.externalMealTypes);
  state.mealLogs = loadFromLS('mealLogs', []);
  state.receipts = loadFromLS('receipts', []);
  state.purchaseHistory = loadFromLS('purchaseHistory', []);
  state.cookingTasks = loadFromLS('cookingTasks', []);
  state.recordingNeeds = loadFromLS('recordingNeeds', []);
  state.mealOptions = loadFromLS('mealOptions', []);
  state.batchRecipes = loadFromLS('batchRecipes', []);
  state.components = loadFromLS('components', []);
  state.combos = loadFromLS('combos', []);
  if (!Array.isArray(state.batchRecipes)) { console.warn('[loadAllState] batchRecipes was not an array, resetting'); state.batchRecipes = []; }

  // Also load food log and grocery list (stored with direct keys, not yummy_ prefix)
  const foodLog = getFoodLog();
  const savedRecipes = getSavedRecipes();
  const smartGrocery = getSmartGroceryList();

  debugLog('[loadAllState] Data loaded — recipes:', state.recipes.length,
    '| inventory:', state.inventory.length,
    '| mealDays:', Object.keys(state.mealDays).length,
    '| groceryItems:', state.groceryItems.length,
    '| smartGrocery:', smartGrocery.length,
    '| foodLog:', foodLog.length,
    '| savedRecipes:', savedRecipes.length,
    '| mealLogs:', state.mealLogs.length,
    '| planData:', state.planData.length);

  if (state.recipes.length === 0 && state.inventory.length === 0 && foodLog.length === 0 && smartGrocery.length === 0) {
    console.warn('[loadAllState] ⚠️ ALL DATA IS EMPTY — localStorage may have been cleared!');
    console.warn('[loadAllState] Check: localStorage has', localStorage.length, 'keys total');
    console.warn('[loadAllState] yummy_recipes raw:', localStorage.getItem('yummy_recipes')?.substring(0, 100) || '(null)');
    console.warn('[loadAllState] foodLog raw:', localStorage.getItem('foodLog')?.substring(0, 100) || '(null)');
    console.warn('[loadAllState] smartGroceryList_v1 raw:', localStorage.getItem('smartGroceryList_v1')?.substring(0, 100) || '(null)');
  }

  // Ensure today exists in mealDays
  const todayDate = getToday();
  if (!state.mealDays[todayDate]) {
    state.mealDays[todayDate] = { date: todayDate, meals: { breakfast: freshMealSlot(), lunch: freshMealSlot(), dinner: freshMealSlot(), snacks: [] } };
  }
  state.dataLoaded = true;
  cleanupCookingData();
  migrateOldGroceryData();
}

// One-time migration: old groceryItems → smartGroceryList_v1
function migrateOldGroceryData() {
  const newList = getSmartGroceryList();
  if (newList.length > 0) return; // new system already has data
  const oldItems = state.groceryItems;
  if (!oldItems || oldItems.length === 0) return;
  const migrated = oldItems.map(item => ({
    id: item.id || ('gro_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)),
    name: item.name || item.ingredientKey || '',
    category: item.category || item.group || 'Other',
    qty: item.quantity || item.qty || '',
    unit: item.unit || '',
    checked: !!item.checked,
    manual: true,
    sourceMeals: [],
    addedAt: item.addedAt ? new Date(item.addedAt).getTime() : Date.now()
  })).filter(item => item.name);
  if (migrated.length > 0) {
    saveSmartGroceryList(migrated);
    debugLog('[migrateGroceryData] Migrated ' + migrated.length + ' items from old groceryItems to smartGroceryList_v1');
  }
}

// One-time cleanup: reset fake timesCooked/cookCount data on recipes.
// The ONLY source of truth for cooking history is the food log (entries with status === 'cooked' or 'logged' or 'eaten').
function cleanupCookingData() {
  if (localStorage.getItem('cookingDataCleaned')) return;

  // Build real cook counts from food log
  const log = getFoodLog();
  const realCounts = {};
  log.forEach(entry => {
    const rid = entry.recipeId;
    if (!rid) return;
    realCounts[rid] = (realCounts[rid] || 0) + 1;
  });

  // Also count from mealDays logged entries
  Object.values(state.mealDays).forEach(day => {
    if (!day.meals) return;
    ['breakfast', 'lunch', 'dinner'].forEach(mt => {
      const meal = day.meals[mt];
      if (!meal || meal.status !== 'logged') return;
      const rid = meal.actualRecipeId || meal.plannedRecipeId;
      if (!rid) return;
      realCounts[rid] = (realCounts[rid] || 0) + 1;
    });
  });

  // Reset all recipes: remove fake timesCooked/cookCount, set to real count
  let changed = false;
  state.recipes.forEach(r => {
    const id = r.__backendId || r.id;
    const realCount = realCounts[id] || 0;
    if (r.timesCooked !== undefined || r.cookCount !== undefined || r.cookedDates !== undefined || r.lastCooked !== undefined) {
      delete r.timesCooked;
      delete r.cookCount;
      delete r.cookedDates;
      delete r.lastCooked;
      changed = true;
    }
  });

  if (changed) {
    saveToLS('recipes', state.recipes);
  }

  localStorage.setItem('cookingDataCleaned', 'true');
}

// Storage object - uses Supabase for CRUD, falls back to localStorage
const storage = {
  _data: [],
  _handler: null,
  async init(handler) {
    this._handler = handler;
    // Load from localStorage first for immediate display
    loadAllState();
    handler?.onDataChanged?.([]);
    return { isOk: true };
  },
  async create(item) {
    if (!item || !item.id) return { isOk: false };
    const prefix = item.id.split('_')[0];
    switch(prefix) {
      case 'recipe': state.recipes.push(item); break;
      case 'inventory': case 'inv': state.inventory.push(item); break;
      case 'ingredient': if (item.type === 'ingredient_knowledge') state.ingredientKnowledge.push(item); break;
      case 'plan': { const idx = state.planData.findIndex(p => p.id === item.id); if (idx >= 0) state.planData[idx] = item; else state.planData.push(item); } break;
      case 'receipt': state.receipts.push(item); break;
      case 'freestyle': state.freestyleMeals.push(item); break;
      case 'blend': state.seasoningBlends.push(item); break;
      case 'task': state.cookingTasks.push(item); break;
      case 'recording': state.recordingNeeds.push(item); break;
      case 'frequent': state.frequentItems.push(item); break;
      case 'meallog': state.mealLogs.push(item); break;
      case 'mealSel': state.mealSelections.push(item); break;
      case 'mealOption': state.mealOptions.push(item); break;
      case 'history': state.purchaseHistory.push(item); break;
      case 'mapping': state.receiptMappings[item.rawText] = { name: item.correctedName, category: item.category, ingredientId: item.ingredientId || null }; break;
      case 'expdefault': state.expirationDefaults[item.itemName] = item.days; break;
      case 'todayMeals': { const dateStr = item.date || item.id.replace('todayMeals_', ''); if (item.meals) state.mealDays[dateStr] = { date: dateStr, meals: item.meals }; } break;
      case 'batch': { const idx = state.batchRecipes.findIndex(b => b.id === item.id); if (idx >= 0) state.batchRecipes[idx] = item; else state.batchRecipes.push(item); } break;
      case 'component': { const idx = state.components.findIndex(c => c.id === item.id); if (idx >= 0) state.components[idx] = item; else state.components.push(item); } break;
      case 'combo': { const idx = state.combos.findIndex(c => c.id === item.id); if (idx >= 0) state.combos[idx] = item; else state.combos.push(item); } break;
      case 'savedRecipes': break; // handled via localStorage directly
      case 'config': break;
      default: break;
    }
    // Guard against realtime events overwriting this save
    state.ignoreRealtimeUntil = Date.now() + 3000;
    persistState();
    // Sync to Supabase
    await this._syncCreate(item);
    return { isOk: true };
  },
  async update(item) {
    if (!item || !item.id) return { isOk: false };
    const prefix = item.id.split('_')[0];
    const updateInArray = (arr) => {
      const idx = arr.findIndex(x => x.id === item.id);
      if (idx >= 0) { arr[idx] = { ...arr[idx], ...item }; return true; }
      // Item not found in array — push it so the update isn't silently lost
      console.warn('[storage.update] Item not found in array, pushing:', item.id);
      arr.push(item);
      return true;
    };
    switch(prefix) {
      case 'recipe': updateInArray(state.recipes); break;
      case 'inventory': case 'inv': updateInArray(state.inventory); break;
      case 'ingredient': if (item.type === 'ingredient_knowledge') updateInArray(state.ingredientKnowledge); break;
      case 'plan': updateInArray(state.planData); break;
      case 'receipt': updateInArray(state.receipts); break;
      case 'freestyle': updateInArray(state.freestyleMeals); break;
      case 'blend': updateInArray(state.seasoningBlends); break;
      case 'task': updateInArray(state.cookingTasks); break;
      case 'recording': updateInArray(state.recordingNeeds); break;
      case 'frequent': updateInArray(state.frequentItems); break;
      case 'meallog': updateInArray(state.mealLogs); break;
      case 'mealSel': updateInArray(state.mealSelections); break;
      case 'mealOption': updateInArray(state.mealOptions); break;
      case 'history': updateInArray(state.purchaseHistory); break;
      case 'mapping': state.receiptMappings[item.rawText] = { name: item.correctedName, category: item.category, ingredientId: item.ingredientId || null }; break;
      case 'expdefault': state.expirationDefaults[item.itemName] = item.days; break;
      case 'todayMeals': { const dateStr = item.date || item.id.replace('todayMeals_', ''); if (item.meals) state.mealDays[dateStr] = { date: dateStr, meals: item.meals }; } break;
      case 'batch': updateInArray(state.batchRecipes); break;
      case 'component': updateInArray(state.components); break;
      case 'combo': updateInArray(state.combos); break;
      default: break;
    }
    // Guard against realtime events overwriting this save
    state.ignoreRealtimeUntil = Date.now() + 3000;
    persistState();
    // Sync to Supabase (upsert to handle missing rows)
    await this._syncUpdate(item);
    return { isOk: true };
  },
  async delete(item) {
    if (!item || !item.id) return { isOk: false };
    const prefix = item.id.split('_')[0];
    const removeFromArray = (arr) => {
      const idx = arr.findIndex(x => x.id === item.id);
      if (idx >= 0) { arr.splice(idx, 1); return true; }
      return false;
    };
    switch(prefix) {
      case 'recipe': removeFromArray(state.recipes); break;
      case 'inventory': case 'inv': removeFromArray(state.inventory); break;
      case 'ingredient': removeFromArray(state.ingredientKnowledge); break;
      case 'plan': removeFromArray(state.planData); break;
      case 'receipt': removeFromArray(state.receipts); break;
      case 'freestyle': removeFromArray(state.freestyleMeals); break;
      case 'blend': removeFromArray(state.seasoningBlends); break;
      case 'task': removeFromArray(state.cookingTasks); break;
      case 'recording': removeFromArray(state.recordingNeeds); break;
      case 'frequent': removeFromArray(state.frequentItems); break;
      case 'meallog': removeFromArray(state.mealLogs); break;
      case 'batch': removeFromArray(state.batchRecipes); break;
      case 'component': removeFromArray(state.components); break;
      case 'combo': removeFromArray(state.combos); break;
      default: break;
    }
    // Guard against realtime events overwriting this delete
    state.ignoreRealtimeUntil = Date.now() + 3000;
    persistState();
    // Sync to Supabase
    await this._syncDelete(item);
    return { isOk: true };
  },
  async loadData() {
    if (window.supabaseClient) {
      await loadDataFromSupabase();
    } else {
      loadAllState();
    }
  },
  // Supabase sync helpers
  async _syncCreate(item) {
    if (!window.supabaseClient) return;
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      const user = session?.user;
      if (!user) return;
      const { error } = await window.supabaseClient
        .from('meal_planner_data')
        .insert({ id: item.id, user_id: user.id, data: item });
      if (error) console.error('Supabase create error:', error);
    } catch (e) { console.error('Sync create failed:', e); }
  },
  async _syncUpdate(item) {
    if (!window.supabaseClient) return;
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      const user = session?.user;
      if (!user) return;
      // Use upsert so items that only exist locally get created in Supabase
      const { error } = await window.supabaseClient
        .from('meal_planner_data')
        .upsert({ id: item.id, user_id: user.id, data: item }, { onConflict: 'id' });
      if (error) console.error('Supabase update error:', error);
    } catch (e) { console.error('Sync update failed:', e); }
  },
  async _syncDelete(item) {
    if (!window.supabaseClient) return;
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      const user = session?.user;
      if (!user) return;
      const { error } = await window.supabaseClient
        .from('meal_planner_data')
        .delete()
        .eq('id', item.id)
        .eq('user_id', user.id);
      if (error) console.error('Supabase delete error:', error);
    } catch (e) { console.error('Sync delete failed:', e); }
  },
  async query(filterFn) {
    // Helper to query across all data
    const allData = [
      ...state.recipes, ...state.inventory, ...state.ingredientKnowledge,
      ...state.planData, ...state.receipts,
      ...state.freestyleMeals, ...state.seasoningBlends, ...state.cookingTasks,
      ...state.frequentItems, ...state.mealLogs
    ];
    return allData.filter(filterFn);
  }
};

// ============================================================
// SECTION 5: DATA HANDLER
// ============================================================
const dataHandler = {
  onDataChanged(data) {
    // For localStorage version, data comes pre-loaded into state
    // Just ensure today exists and render
    const todayDate = getToday();
    if (!state.mealDays[todayDate]) {
      state.mealDays[todayDate] = {
        date: todayDate,
        meals: { breakfast: freshMealSlot(), lunch: freshMealSlot(), dinner: freshMealSlot(), snacks: [] }
      };
    }
    state.dataLoaded = true;
    if (typeof render === 'function') render();
  }
};

async function saveMealDay(dateStr) {
  dateStr = dateStr || state.viewingDate;
  const day = getDayData(dateStr);
  const record = {
    id: `todayMeals_${dateStr}`,
    type: 'todayMeals',
    date: dateStr,
    meals: day.meals
  };
  state.ignoreRealtimeUntil = Date.now() + 3000;
  const result = await storage.update(record);
  if (!result?.isOk) {
    await storage.create(record);
  }
}

async function saveTodayMeals() {
  return saveMealDay(getToday());
}

// ============================================================
// SECTION 6: UTILITY FUNCTIONS
// ============================================================

function guessIngredientCategory(name) {
  const lower = name.toLowerCase();
  for (const [keyword, category] of Object.entries(INGREDIENT_CATEGORY_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return 'Other';
}

function guessGroceryCategory(name) {
  if (typeof ITEM_MAPPINGS !== 'undefined') {
    for (const mapping of ITEM_MAPPINGS) {
      for (const pattern of mapping.patterns) {
        if (pattern.test(name)) return mapping.category;
      }
    }
  }
  const lower = name.toLowerCase();
  if (lower.match(/chicken|beef|pork|salmon|fish|shrimp|turkey|sausage|meat|steak|bacon/)) return 'Meat & Seafood';
  if (lower.match(/milk|cheese|yogurt|butter|cream|egg/)) return 'Dairy & Eggs';
  if (lower.match(/bread|bagel|tortilla|roll|bun/)) return 'Bakery';
  if (lower.match(/apple|banana|orange|berry|fruit|grape|melon|mango/)) return 'Produce';
  if (lower.match(/lettuce|spinach|kale|carrot|broccoli|tomato|onion|potato|vegetable|greens|pepper|cucumber|squash|zucchini/)) return 'Produce';
  if (lower.match(/frozen|ice cream/)) return 'Frozen';
  if (lower.match(/soup|sauce|pasta|rice|bean|can|oil/)) return 'Pantry';
  if (lower.match(/chip|snack|cookie|cracker/)) return 'Snacks';
  if (lower.match(/water|juice|soda|drink|coffee|tea/)) return 'Beverages';
  return 'Other';
}

// Custom ingredient images
let customIngredientImages = {};

function loadCustomIngredientImages() {
  const saved = localStorage.getItem('custom_ingredient_images');
  if (saved) {
    try { customIngredientImages = JSON.parse(saved); } catch (e) { customIngredientImages = {}; }
  }
}

function saveCustomIngredientImages() {
  localStorage.setItem('custom_ingredient_images', JSON.stringify(customIngredientImages));
  syncCustomImagestoSupabase();
}

// Load on startup
loadCustomIngredientImages();

// Ingredient photo library — persists across sessions
let ingredientPhotos = {};

function loadIngredientPhotos() {
  try {
    const saved = localStorage.getItem('yummy_ingredientPhotos');
    if (saved) ingredientPhotos = JSON.parse(saved);
  } catch (e) { ingredientPhotos = {}; }
}

function saveIngredientPhotos() {
  localStorage.setItem('yummy_ingredientPhotos', JSON.stringify(ingredientPhotos));
  syncIngredientPhotosToSupabase();
}

function setIngredientPhoto(name, url) {
  if (!name || !url) return;
  const key = name.toLowerCase().trim();
  ingredientPhotos[key] = url;
  // Also store under simplified versions for fuzzy reuse
  // e.g. "Boneless Skinless Chicken Breast" → also store "chicken breast", "chicken"
  const words = key.split(/\s+/);
  for (let start = 0; start < words.length; start++) {
    for (let end = start + 1; end <= words.length; end++) {
      const sub = words.slice(start, end).join(' ');
      if (sub !== key && sub.length >= 3 && !ingredientPhotos[sub]) {
        ingredientPhotos[sub] = url;
      }
    }
  }
  console.log('Saved photo for:', name);
  saveIngredientPhotos();
}

function removeIngredientPhoto(name) {
  if (!name) return;
  const key = name.toLowerCase().trim();
  delete ingredientPhotos[key];
  // Also remove fuzzy matches
  for (const k of Object.keys(ingredientPhotos)) {
    if (key.includes(k) || k.includes(key)) delete ingredientPhotos[k];
  }
  saveIngredientPhotos();
}

function getIngredientPhotoFromLibrary(name) {
  return findIngredientPhoto(name);
}

function findIngredientPhoto(itemName) {
  if (!itemName) return null;
  const name = itemName.toLowerCase().trim();
  const photos = ingredientPhotos;
  // 1. Exact match
  if (photos[name]) return photos[name];
  // 2. Fuzzy match — longest matching key wins
  let bestMatch = null;
  let bestLength = 0;
  for (const key of Object.keys(photos)) {
    // stored key is contained in the item name
    if (name.includes(key) && key.length > bestLength) {
      bestMatch = photos[key];
      bestLength = key.length;
    }
    // item name is contained in stored key
    if (key.includes(name) && name.length > bestLength) {
      bestMatch = photos[key];
      bestLength = name.length;
    }
  }
  return bestMatch;
}

// Load on startup
loadIngredientPhotos();

/**
 * Opens a photo expand overlay showing an enlarged view of a grocery item photo.
 * @param {string} photoUrl - The photo URL to display
 * @param {string} ingredientName - The ingredient name to display below the photo
 */
function openPhotoExpandOverlay(photoUrl, ingredientName) {
  const existing = document.getElementById('photoExpandOverlay');
  if (existing) existing.remove();

  const escapedName = ingredientName.replace(/'/g, "\\'");

  const overlay = document.createElement('div');
  overlay.id = 'photoExpandOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;flex-direction:column;animation:photoExpandFadeIn 200ms ease-out;';
  overlay.onclick = function(e) { if (e.target === overlay) closePhotoExpandOverlay(); };

  overlay.innerHTML = `
    <style>
      @keyframes photoExpandFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @media (min-width: 768px) { #photoExpandImg { max-width: 500px !important; } }
    </style>
    <button onclick="closePhotoExpandOverlay()" style="position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;color:white;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:1;">&times;</button>
    <img id="photoExpandImg" src="${esc(photoUrl)}" style="max-width:300px;max-height:60vh;border-radius:12px;object-fit:contain;box-shadow:0 8px 32px rgba(0,0,0,0.5);" />
    <div style="color:white;font-size:16px;margin-top:16px;font-family:${CONFIG.font_family};text-align:center;">${esc(ingredientName)}</div>
    <button onclick="closePhotoExpandOverlay();openPhotoSearch('${escapedName}',function(url){setIngredientPhoto('${escapedName}',url);render();})"
      style="margin-top:20px;padding:10px 24px;background:${CONFIG.surface_elevated};color:${CONFIG.text_color};border:none;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;font-family:${CONFIG.font_family};">
      Change photo
    </button>
    <button onclick="_removePhotoAndClose('${escapedName}')"
      style="margin-top:10px;padding:8px 20px;background:none;border:none;color:${CONFIG.danger_color || '#ff6b6b'};font-size:13px;cursor:pointer;font-family:${CONFIG.font_family};">
      Remove photo
    </button>
  `;

  document.body.appendChild(overlay);
}

function closePhotoExpandOverlay() {
  const overlay = document.getElementById('photoExpandOverlay');
  if (overlay) overlay.remove();
}

function _removePhotoAndClose(ingredientName) {
  removeIngredientPhoto(ingredientName);
  closePhotoExpandOverlay();
  if (typeof render === 'function') render();
}

function getIngredientImage(ingredientName, category) {
  if (!ingredientName) return null;
  const name = ingredientName.toLowerCase().trim();
  const knowledge = state.ingredientKnowledge.find(k => k.name.toLowerCase() === name);
  if (knowledge?.image_url) return knowledge.image_url;
  if (customIngredientImages[name]) return customIngredientImages[name];
  // Check global ingredient photo library
  if (ingredientPhotos[name]) return ingredientPhotos[name];
  if (INGREDIENT_IMAGES[name]) return INGREDIENT_IMAGES[name];
  for (const [key, url] of Object.entries(customIngredientImages)) {
    if (name.includes(key) || key.includes(name)) return url;
  }
  for (const [key, url] of Object.entries(ingredientPhotos)) {
    if (name.includes(key) || key.includes(name)) return url;
  }
  for (const [key, url] of Object.entries(INGREDIENT_IMAGES)) {
    if (name.includes(key) || key.includes(name)) return url;
  }
  return null;
}

// Image compression
async function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
          debugLog(`Compressed: ${(file.size/1024).toFixed(0)}KB -> ${(compressedFile.size/1024).toFixed(0)}KB`);
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Upload photo - converts to base64 data URL (no Supabase)
async function uploadPhoto(file) {
  if (!file.type.startsWith('image/')) {
    showError('Please select an image file');
    return null;
  }
  if (file.size > 10 * 1024 * 1024) {
    showError('Image must be less than 10MB');
    return null;
  }

  // Try Supabase storage upload if available
  if (window.supabaseClient) {
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      const user = session?.user;
      if (user) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        showToast('Uploading photo...', 'info');
        const { data, error } = await window.supabaseClient.storage
          .from('meal-photos')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (error) {
          console.error('Upload error:', error);
          showError('Failed to upload photo: ' + error.message);
          return null;
        }
        const { data: urlData } = window.supabaseClient.storage
          .from('meal-photos')
          .getPublicUrl(fileName);
        showToast('Photo uploaded!', 'success');
        return urlData.publicUrl;
      }
    } catch (e) {
      console.error('Supabase upload failed, falling back to local:', e);
    }
  }

  // Fallback: local data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => { resolve(e.target.result); };
    reader.onerror = () => { showError('Failed to read image'); resolve(null); };
    reader.readAsDataURL(file);
  });
}

// ── Admin Detection ──────────────────────────────────
async function isAppAdmin() {
  if (!window.supabaseClient) return false;
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    return session?.user?.email === 'iezuri22@gmail.com';
  } catch (e) { return false; }
}

// ── Video Thumbnail Generation ───────────────────────
async function generateVideoThumbnail(file) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => { resolve(null); }, 5000);
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objUrl = URL.createObjectURL(file);
      video.src = objUrl;
      video.onloadeddata = () => { video.currentTime = 0.5; };
      video.onseeked = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 320;
          canvas.height = 180;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, 320, 180);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(objUrl);
            resolve(blob);
          }, 'image/jpeg', 0.7);
        } catch (e) {
          URL.revokeObjectURL(objUrl);
          resolve(null);
        }
      };
      video.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(objUrl);
        resolve(null);
      };
    } catch (e) {
      clearTimeout(timeout);
      resolve(null);
    }
  });
}

// ── Step Video Upload ────────────────────────────────
async function uploadStepVideo(file, componentId, stepId) {
  if (!file.type.startsWith('video/')) {
    showToast('Please select a video file', 'error');
    return null;
  }
  if (file.size > 50 * 1024 * 1024) {
    showToast('Video must be under 50MB', 'error');
    return null;
  }
  if (!window.supabaseClient) {
    showToast('Upload unavailable — no connection', 'error');
    return null;
  }
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    const user = session?.user;
    if (!user) { showToast('Please log in to upload', 'error'); return null; }

    const isAdmin = user.email === 'iezuri22@gmail.com';
    const basePath = isAdmin
      ? `defaults/${componentId}/${stepId}`
      : `user/${user.id}/${componentId}/${stepId}`;

    // Upload video
    const { data: videoData, error: videoError } = await window.supabaseClient.storage
      .from('component-videos')
      .upload(`${basePath}.mp4`, file, {
        contentType: file.type || 'video/mp4',
        cacheControl: '3600',
        upsert: true
      });
    if (videoError) {
      console.error('Video upload error:', videoError);
      showToast('Failed to upload video: ' + videoError.message, 'error');
      return null;
    }

    // Generate and upload thumbnail
    let thumbnailUrl = null;
    const thumbBlob = await generateVideoThumbnail(file);
    if (thumbBlob) {
      const { error: thumbError } = await window.supabaseClient.storage
        .from('component-videos')
        .upload(`${basePath}-thumb.jpg`, thumbBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        });
      if (!thumbError) {
        const { data: thumbUrlData } = window.supabaseClient.storage
          .from('component-videos')
          .getPublicUrl(`${basePath}-thumb.jpg`);
        thumbnailUrl = thumbUrlData.publicUrl;
      }
    }

    // Get public URL for video
    const { data: urlData } = window.supabaseClient.storage
      .from('component-videos')
      .getPublicUrl(`${basePath}.mp4`);

    return {
      videoUrl: urlData.publicUrl,
      thumbnailUrl: thumbnailUrl,
      storagePath: `${basePath}.mp4`
    };
  } catch (e) {
    console.error('Video upload failed:', e);
    showToast('Video upload failed', 'error');
    return null;
  }
}

// ── Step Video Delete ────────────────────────────────
async function deleteStepVideo(storagePath) {
  if (!storagePath || !window.supabaseClient) return false;
  try {
    const { error } = await window.supabaseClient.storage
      .from('component-videos')
      .remove([storagePath]);
    if (error) {
      console.error('Video delete error:', error);
      return false;
    }
    // Also try to delete thumbnail
    const thumbPath = storagePath.replace(/\.mp4$/, '-thumb.jpg');
    await window.supabaseClient.storage
      .from('component-videos')
      .remove([thumbPath]);
    return true;
  } catch (e) {
    console.error('Video delete failed:', e);
    return false;
  }
}

// String utilities
function capitalize(str) {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, function(char) { return char.toUpperCase(); });
}

function normalizeString(str) {
  return (str || '').toLowerCase().trim();
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getWeekDates(startDate) {
  const dates = [];
  const start = new Date(startDate + 'T00:00:00');
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(_localDateStr(date));
  }
  return dates;
}

function formatDateDisplay(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function normalizeIngredient(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

// Debounced render
const _debouncedRenderTimers = {};
function _debouncedRender(inputEl, key, delay) {
  delay = delay || 300;
  clearTimeout(_debouncedRenderTimers[key]);
  _debouncedRenderTimers[key] = setTimeout(() => {
    const id = inputEl && inputEl.id;
    const cursorPos = inputEl ? inputEl.selectionStart : 0;
    if (typeof render === 'function') render();
    if (id) {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) { el.focus(); el.setSelectionRange(cursorPos, cursorPos); }
      }, 0);
    }
  }, delay);
}

function showError(message) { showToast(message, 'error'); }

async function withLoading(fn) {
  state.isLoading = true;
  if (typeof render === 'function') render();
  try { return await fn(); }
  catch (error) { console.error('Operation failed:', error); showError('Something went wrong. Please try again.'); throw error; }
  finally { state.isLoading = false; if (typeof render === 'function') render(); }
}

function renderSkeleton(type) {
  if (type === 'card-grid') {
    return `<div class="skeleton-grid">${Array(6).fill(`<div class="skeleton-card"><div class="skeleton-card-media skeleton-shimmer"></div><div class="skeleton-card-title skeleton-shimmer"></div><div class="skeleton-card-meta skeleton-shimmer"></div></div>`).join('')}</div>`;
  }
  if (type === 'hero') {
    return `<div class="skeleton-hero skeleton-shimmer"></div>`;
  }
  if (type === 'carousel') {
    return `<div class="skeleton-carousel">${Array(4).fill(`<div class="skeleton-carousel-item"><div class="skeleton-carousel-media skeleton-shimmer"></div><div class="skeleton-carousel-title skeleton-shimmer"></div></div>`).join('')}</div>`;
  }
  return '';
}

function emptyState(icon, message, buttonLabel, buttonAction) {
  return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: ${CONFIG.space_lg} ${CONFIG.space_md}; text-align: center;">
      <div style="font-size: 36px; margin-bottom: ${CONFIG.space_sm}; opacity: 0.3;">${icon}</div>
      <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_body}; margin-bottom: ${CONFIG.space_md}; max-width: 240px;">${message}</div>
      ${buttonLabel ? `<button onclick="${buttonAction}" style="background: ${CONFIG.primary_action_color}; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 500; font-size: ${CONFIG.type_caption}; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer;">${buttonLabel}</button>` : ''}
    </div>`;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast fixed top-4 right-4 z-50';
  toast.style.background = '#242432';
  toast.style.color = '#f5f5f7';
  toast.style.borderRadius = '12px';
  toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
  toast.style.padding = '12px 16px';
  if (type === 'success') {
    toast.innerHTML = `<div style="display:flex; align-items:center; gap:8px;"><svg width="20" height="20" viewBox="0 0 20 20" style="flex-shrink:0;"><circle cx="10" cy="10" r="9" fill="none" stroke="#32d74b" stroke-width="2"/><path d="M6 10l3 3 5-5" fill="none" stroke="#32d74b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>${message}</span></div>`;
  } else if (type === 'error' || type === 'danger') {
    toast.innerHTML = `<div style="display:flex; align-items:center; gap:8px;"><svg width="20" height="20" viewBox="0 0 20 20" style="flex-shrink:0;"><circle cx="10" cy="10" r="9" fill="none" stroke="#ff453a" stroke-width="2"/><path d="M7 7l6 6M13 7l-6 6" fill="none" stroke="#ff453a" stroke-width="2" stroke-linecap="round"/></svg><span>${message}</span></div>`;
  } else {
    toast.textContent = message;
  }
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================================
// SECTION 7: SAVED RECIPES & FOOD LOG
// ============================================================
function getSavedRecipes() { try { return JSON.parse(localStorage.getItem(SAVED_RECIPES_KEY) || '[]'); } catch { return []; } }
function toggleSaveRecipe(recipeId) {
  let saved = getSavedRecipes();
  if (saved.includes(recipeId)) { saved = saved.filter(id => id !== recipeId); showToast('Removed from saved', 'success'); }
  else { saved.push(recipeId); showToast('Saved!', 'success'); }
  localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(saved));
  syncSavedRecipesToSupabase(saved);
  if (typeof render === 'function') render();
}

async function syncSavedRecipesToSupabase(saved) {
  if (!window.supabaseClient) return;
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session?.user) return;
    const item = { id: 'savedRecipes_list', type: 'savedRecipes', recipeIds: saved };
    await window.supabaseClient
      .from('meal_planner_data')
      .upsert({ id: item.id, user_id: session.user.id, data: item }, { onConflict: 'id' });
  } catch (e) { console.error('Sync saved recipes failed:', e); }
}
function isRecipeSaved(recipeId) { return getSavedRecipes().includes(recipeId); }

// --- Supabase sync helpers for localStorage-only data ---

async function syncFoodLogToSupabase(log) {
  if (!window.supabaseClient) return;
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session?.user) return;
    const item = { id: 'foodLog_list', type: 'foodLog', entries: log };
    await window.supabaseClient
      .from('meal_planner_data')
      .upsert({ id: item.id, user_id: session.user.id, data: item }, { onConflict: 'id' });
  } catch (e) { console.error('Sync food log failed:', e); }
}

async function syncGroceryListToSupabase(list) {
  if (!window.supabaseClient) return;
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session?.user) return;
    const item = { id: 'groceryList_list', type: 'groceryList', entries: list };
    await window.supabaseClient
      .from('meal_planner_data')
      .upsert({ id: item.id, user_id: session.user.id, data: item }, { onConflict: 'id' });
  } catch (e) { console.error('Sync grocery list failed:', e); }
}

async function syncIngredientPhotosToSupabase() {
  if (!window.supabaseClient) return;
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session?.user) return;
    const item = { id: 'ingredientPhotos_data', type: 'ingredientPhotos', photos: ingredientPhotos };
    await window.supabaseClient
      .from('meal_planner_data')
      .upsert({ id: item.id, user_id: session.user.id, data: item }, { onConflict: 'id' });
  } catch (e) { console.error('Sync ingredient photos failed:', e); }
}

async function syncCustomImagestoSupabase() {
  if (!window.supabaseClient) return;
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session?.user) return;
    const item = { id: 'customImages_data', type: 'customImages', images: customIngredientImages };
    await window.supabaseClient
      .from('meal_planner_data')
      .upsert({ id: item.id, user_id: session.user.id, data: item }, { onConflict: 'id' });
  } catch (e) { console.error('Sync custom images failed:', e); }
}

async function syncEffortLevelsToSupabase(levels) {
  if (!window.supabaseClient) return;
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session?.user) return;
    const item = { id: 'effortLevels_data', type: 'effortLevels', levels: levels };
    await window.supabaseClient
      .from('meal_planner_data')
      .upsert({ id: item.id, user_id: session.user.id, data: item }, { onConflict: 'id' });
  } catch (e) { console.error('Sync effort levels failed:', e); }
}

function getFoodLog() { try { return JSON.parse(localStorage.getItem(FOOD_LOG_KEY) || '[]'); } catch { return []; } }
function saveFoodLog(log) { localStorage.setItem(FOOD_LOG_KEY, JSON.stringify(log)); syncFoodLogToSupabase(log); }

function addFoodLogEntry(entry) {
  const log = getFoodLog();
  let dateCooked = entry.dateCooked || new Date().toISOString();
  if (entry.dateStr) { dateCooked = entry.dateStr + 'T12:00:00'; }
  const logEntry = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    recipeId: entry.recipeId || null, recipeName: entry.recipeName || 'Unknown',
    image: entry.image || null, ingredients: entry.ingredients || [],
    category: entry.category || 'Other', mealType: entry.mealType || detectMealType(),
    dateCooked: dateCooked, photo: entry.photo || null, myPhoto: entry.myPhoto || null,
    notes: entry.notes || null, wouldMakeAgain: null, status: entry.status || 'planned',
    batchId: entry.batchId || null
  };
  // Allow multiple meals per slot (stacking) - no longer replace existing entries
  log.unshift(logEntry);
  saveFoodLog(log);
  return logEntry;
}

function updateFoodLogEntry(logId, updates) {
  const log = getFoodLog();
  const idx = log.findIndex(e => e.id === logId);
  if (idx === -1) return null;
  Object.assign(log[idx], updates);
  saveFoodLog(log);
  return log[idx];
}

function deleteFoodLogEntry(logId) { saveFoodLog(getFoodLog().filter(e => e.id !== logId)); }
function getFoodLogEntryForSlot(dateStr, mealType) { return getFoodLog().find(e => e.dateCooked.split('T')[0] === dateStr && e.mealType === mealType) || null; }

function swapFoodLogEntry(oldLogId, newEntry) {
  const log = getFoodLog();
  const oldIdx = log.findIndex(e => e.id === oldLogId);
  const oldEntry = oldIdx !== -1 ? log[oldIdx] : null;
  if (oldIdx !== -1) log.splice(oldIdx, 1);
  saveFoodLog(log);
  const created = addFoodLogEntry(newEntry);
  return { oldEntry, newEntry: created };
}

function markFoodLogEaten(logId) { updateFoodLogEntry(logId, { status: 'eaten' }); }

function getFoodLogGroupedByDate() {
  const log = getFoodLog();
  const groups = {};
  log.forEach(entry => { const date = entry.dateCooked.split('T')[0]; if (!groups[date]) groups[date] = []; groups[date].push(entry); });
  Object.values(groups).forEach(g => g.sort((a, b) => new Date(b.dateCooked) - new Date(a.dateCooked)));
  return { groups, sortedDates: Object.keys(groups).sort((a, b) => b.localeCompare(a)) };
}

function getFoodLogDateLabel(dateStr) {
  const today = getToday();
  const yesterday = getYesterday();
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

// ===== ADD TO MY MEALS MODAL =====
function showAddToMealsModal(recipeId) {
  const r = getRecipeById(recipeId);
  if (!r) return;

  // Auto-detect meal type from recipe category
  const catLower = (r.category || '').toLowerCase();
  let defaultMeal = 'dinner';
  if (catLower === 'breakfast') defaultMeal = 'breakfast';
  else if (catLower === 'lunch') defaultMeal = 'lunch';
  else if (catLower === 'snack') defaultMeal = 'snack';

  const todayStr = getToday();

  // Store modal state on window for callbacks
  window._addToMealsState = {
    recipeId: recipeId,
    selectedMeal: defaultMeal,
    selectedDate: todayStr,
    weekOffset: 0
  };

  _renderAddToMealsModalContent();
}

function _renderAddToMealsModalContent() {
  const ms = window._addToMealsState;
  if (!ms) return;
  const r = getRecipeById(ms.recipeId);
  if (!r) return;

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'snack', label: 'Snack' }
  ];

  // Build week days (using local dates to avoid timezone issues)
  const today = new Date();
  const todayStr = _localDateStr(today);
  // Get Monday of current week + offset
  const refDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  refDate.setDate(refDate.getDate() - ((refDate.getDay() + 6) % 7) + (ms.weekOffset * 7));
  const weekDays = [];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() + i);
    const ds = _localDateStr(d);
    weekDays.push({
      dateStr: ds,
      dayNum: d.getDate(),
      label: dayLabels[i],
      isToday: ds === todayStr
    });
  }

  // Format selected date
  const selDate = new Date(ms.selectedDate + 'T12:00:00');
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const formattedDate = `${dayNames[selDate.getDay()]}, ${monthNames[selDate.getMonth()]} ${selDate.getDate()}`;

  // Check for existing meal in slot
  let conflictNotice = '';
  const existingEntries = getFoodLog().filter(e => e.dateCooked.split('T')[0] === ms.selectedDate && e.mealType.toLowerCase() === ms.selectedMeal);
  if (existingEntries.length > 0) {
    const existingName = existingEntries[0].recipeName || 'a meal';
    const mealLabel = ms.selectedMeal.charAt(0).toUpperCase() + ms.selectedMeal.slice(1);
    const dayLabel = ms.selectedDate === todayStr ? 'Today' : dayNames[selDate.getDay()];
    conflictNotice = `
      <div style="margin-top:12px; padding:10px 12px; background:rgba(255,214,10,0.1); border:1px solid rgba(255,214,10,0.2); border-radius:10px; font-size:13px; color:${CONFIG.warning_color}; display:flex; align-items:center; gap:8px;">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
        <span>${mealLabel} on ${dayLabel} already has ${esc(existingName)}. Adding this will stack it.</span>
      </div>
    `;
  }

  const content = `
    <div style="color:${CONFIG.text_color};">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
        <h3 style="font-size:17px; font-weight:700; margin:0;">Add to My Meals</h3>
        <button onclick="closeModal()" style="background:none; border:none; color:${CONFIG.text_muted}; cursor:pointer; padding:4px;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Recipe preview -->
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px; padding:12px; background:${CONFIG.surface_color}; border-radius:12px;">
        ${recipeThumb(r) ? `<img src="${esc(recipeThumb(r))}" style="width:48px; height:48px; border-radius:8px; object-fit:cover;" />` : `<div style="width:48px; height:48px; border-radius:8px; background:${CONFIG.background_color}; display:flex; align-items:center; justify-content:center; font-size:20px;">🍽️</div>`}
        <div style="flex:1; min-width:0;">
          <div style="font-size:15px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(r.title)}</div>
          ${r.category ? `<div style="font-size:12px; color:${CONFIG.text_muted};">${esc(r.category)}</div>` : ''}
        </div>
      </div>

      <!-- Meal type pills -->
      <div style="margin-bottom:20px;">
        <div style="font-size:13px; font-weight:600; color:${CONFIG.text_muted}; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Meal Type</div>
        <div style="display:flex; gap:8px;">
          ${mealTypes.map(m => {
            const active = ms.selectedMeal === m.key;
            return `<button onclick="window._addToMealsState.selectedMeal='${m.key}'; _renderAddToMealsModalContent();"
              style="flex:1; padding:10px 0; border-radius:12px; border:1px solid ${active ? CONFIG.primary_action_color : 'rgba(255,255,255,0.1)'}; background:${active ? 'rgba(232,93,93,0.15)' : 'transparent'}; color:${active ? CONFIG.primary_action_color : CONFIG.text_color}; font-size:13px; font-weight:${active ? '600' : '400'}; cursor:pointer; font-family:inherit;">
              ${m.label}
            </button>`;
          }).join('')}
        </div>
      </div>

      <!-- Date picker -->
      <div style="margin-bottom:8px;">
        <div style="font-size:13px; font-weight:600; color:${CONFIG.text_muted}; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Date</div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button onclick="window._addToMealsState.weekOffset--; _renderAddToMealsModalContent();"
            style="width:32px; height:32px; border-radius:50%; border:1px solid rgba(255,255,255,0.1); background:transparent; color:${CONFIG.text_color}; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
          </button>
          <div style="display:flex; gap:6px; flex:1; justify-content:space-between;">
            ${weekDays.map(d => {
              const selected = ms.selectedDate === d.dateStr;
              const isToday = d.isToday;
              return `<button onclick="window._addToMealsState.selectedDate='${d.dateStr}'; _renderAddToMealsModalContent();"
                style="display:flex; flex-direction:column; align-items:center; gap:2px; padding:6px 0; flex:1; border-radius:10px; border:${selected ? '2px solid ' + CONFIG.primary_action_color : '1px solid transparent'}; background:${selected ? 'rgba(232,93,93,0.15)' : 'transparent'}; cursor:pointer; color:${selected ? CONFIG.primary_action_color : CONFIG.text_color};">
                <span style="font-size:10px; color:${selected ? CONFIG.primary_action_color : CONFIG.text_muted}; font-weight:500;">${d.label}</span>
                <span style="width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:${selected || isToday ? '700' : '400'}; ${isToday && !selected ? 'border:1px solid rgba(255,255,255,0.2);' : ''}">${d.dayNum}</span>
              </button>`;
            }).join('')}
          </div>
          <button onclick="window._addToMealsState.weekOffset++; _renderAddToMealsModalContent();"
            style="width:32px; height:32px; border-radius:50%; border:1px solid rgba(255,255,255,0.1); background:transparent; color:${CONFIG.text_color}; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </button>
        </div>
        <div style="text-align:center; margin-top:8px; font-size:14px; color:${CONFIG.text_color}; font-weight:500;">${formattedDate}</div>
      </div>

      ${conflictNotice}

      <!-- Action buttons -->
      <div style="display:flex; gap:10px; margin-top:20px;">
        <button onclick="closeModal()"
          style="flex:1; padding:14px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:${CONFIG.text_color}; font-size:15px; font-weight:600; cursor:pointer; font-family:inherit;">
          Cancel
        </button>
        <button onclick="confirmAddToMeals()"
          style="flex:1; padding:14px; border-radius:12px; border:none; background:${CONFIG.primary_action_color}; color:white; font-size:15px; font-weight:600; cursor:pointer; font-family:inherit;">
          Add to plan
        </button>
      </div>
    </div>
  `;

  openModal(content);
}

function confirmAddToMeals() {
  const ms = window._addToMealsState;
  if (!ms) return;
  const r = getRecipeById(ms.recipeId);
  if (!r) return;

  const ingredients = recipeIngList(r).map(i => i.name);

  addFoodLogEntry({
    recipeId: r.__backendId || r.id,
    recipeName: r.title,
    image: recipeThumb(r),
    ingredients: ingredients,
    category: r.category || '',
    mealType: ms.selectedMeal,
    dateStr: ms.selectedDate,
    photo: recipeThumb(r),
    myPhoto: null,
    notes: null,
    status: 'planned'
  });

  // Also set the meal slot in mealDays for home screen integration
  const day = getDayData(ms.selectedDate);
  if (ms.selectedMeal === 'snack') {
    day.meals.snacks = day.meals.snacks || [];
    day.meals.snacks.push({ recipeId: r.__backendId || r.id, recipeName: r.title, image: recipeThumb(r), addedAt: new Date().toISOString() });
  } else {
    const slot = day.meals[ms.selectedMeal];
    if (slot && slot.status === 'none') {
      slot.status = 'planned';
      slot.plannedRecipeId = r.__backendId || r.id;
      slot.selectedAt = new Date().toISOString();
    }
  }
  persistState();

  // Format toast message
  const mealLabel = ms.selectedMeal.charAt(0).toUpperCase() + ms.selectedMeal.slice(1);
  const selDate = new Date(ms.selectedDate + 'T12:00:00');
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateLabel = `${dayNames[selDate.getDay()]} ${monthNames[selDate.getMonth()]} ${selDate.getDate()}`;

  closeModal();
  showToast(`Added ${r.title} to ${mealLabel} on ${dateLabel}`, 'success');

  window._addToMealsState = null;
}

function getCookAgainMeals() {
  const log = getFoodLog(); const seen = new Set();
  return log.filter(e => { if (e.wouldMakeAgain !== true) return false; const key = e.recipeId || e.recipeName; if (seen.has(key)) return false; seen.add(key); return true; });
}

function formatLogTime(isoStr) {
  const d = new Date(isoStr);
  let h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function detectMealType() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 21) return 'dinner';
  if (hour >= 21) return 'dinner';
  return 'breakfast';
}

// ============================================================
// SECTION 8: GROCERY LIST FUNCTIONS
// ============================================================
function mapToGroceryCategory(group) {
  const map = { 'Produce': 'Produce', 'Beef': 'Meat & Seafood', 'Poultry': 'Meat & Seafood', 'Pork': 'Meat & Seafood', 'Lamb & Goat': 'Meat & Seafood', 'Seafood': 'Meat & Seafood', 'Dairy & Eggs': 'Dairy & Eggs', 'Grains & Pasta': 'Pantry & Dry Goods', 'Pantry': 'Pantry & Dry Goods', 'Spices & Seasonings': 'Spices & Seasonings', 'Prepared': 'Frozen', 'Other': 'Other' };
  return map[group] || 'Other';
}

function getSmartGroceryList() { try { return JSON.parse(localStorage.getItem(GROCERY_KEY) || '[]'); } catch { return []; } }
function saveSmartGroceryList(list) { localStorage.setItem(GROCERY_KEY, JSON.stringify(list)); state.ignoreRealtimeUntil = Date.now() + 5000; syncGroceryListToSupabase(list); }
function getGroceryBadgeCount() { return getSmartGroceryList().filter(i => !i.checked).length; }

function getFrequentMeals() {
  const log = getFoodLog(); const recipeCount = {};
  log.forEach(entry => { const key = entry.recipeId || entry.recipeName; if (!key) return; if (!recipeCount[key]) recipeCount[key] = { recipeId: entry.recipeId, name: entry.recipeName, image: entry.image, count: 0, wouldMakeAgain: false, ingredients: entry.ingredients || [] }; recipeCount[key].count++; if (entry.wouldMakeAgain === true) recipeCount[key].wouldMakeAgain = true; });
  Object.values(state.mealDays).forEach(day => { if (!day.meals) return; ['breakfast', 'lunch', 'dinner'].forEach(mt => { const meal = day.meals[mt]; if (!meal || meal.status !== 'logged') return; const rid = meal.actualRecipeId || meal.plannedRecipeId; if (!rid) return; const recipe = getRecipeById(rid); if (!recipe) return; const key = rid; if (!recipeCount[key]) recipeCount[key] = { recipeId: rid, name: recipe.title, image: recipe.image_url, count: 0, wouldMakeAgain: false, ingredients: recipeIngList(recipe).map(i => i.name) }; recipeCount[key].count++; }); });
  return Object.values(recipeCount).filter(m => m.count >= 2 || m.wouldMakeAgain).sort((a, b) => b.count - a.count);
}

function getSuggestedIngredients() {
  const frequentMeals = getFrequentMeals(); const ingredientMap = {};
  frequentMeals.forEach(meal => {
    const recipe = meal.recipeId ? getRecipeById(meal.recipeId) : null;
    const ingredients = recipe ? recipeIngList(recipe) : [];
    if (ingredients.length > 0) {
      ingredients.forEach(ing => { const key = normalizeIngredient(ing.name); if (!key) return; if (!ingredientMap[key]) ingredientMap[key] = { name: ing.name, category: mapToGroceryCategory(ing.group || 'Other'), qty: ing.qty || '', unit: ing.unit || '', mealCount: 0, mealNames: [] }; ingredientMap[key].mealCount += meal.count; if (!ingredientMap[key].mealNames.includes(meal.name)) ingredientMap[key].mealNames.push(meal.name); });
    } else if (meal.ingredients && meal.ingredients.length > 0) {
      meal.ingredients.forEach(ingName => { const key = normalizeIngredient(ingName); if (!key) return; if (!ingredientMap[key]) ingredientMap[key] = { name: ingName, category: 'Other', qty: '', unit: '', mealCount: 0, mealNames: [] }; ingredientMap[key].mealCount += meal.count; if (!ingredientMap[key].mealNames.includes(meal.name)) ingredientMap[key].mealNames.push(meal.name); });
    }
  });
  return Object.values(ingredientMap).sort((a, b) => b.mealCount - a.mealCount);
}

function getCategorizedSuggestions() {
  const today = getToday();
  const listKeys = new Set(getSmartGroceryList().map(i => normalizeIngredient(i.name)));
  const seenKeys = new Set();

  // 1. Planned meals (today + future from mealDays)
  const planned = [];
  const plannedRecipeIds = new Set();
  const dates = Object.keys(state.mealDays).filter(d => d >= today).sort();
  dates.forEach(dateStr => {
    const dayData = state.mealDays[dateStr];
    if (!dayData || !dayData.meals) return;
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      const meal = dayData.meals[mealType];
      if (!meal) return;
      if (meal.status === 'selected' || meal.status === 'pending' || meal.status === 'logged') {
        const rid = meal.plannedRecipeId || meal.actualRecipeId;
        if (!rid || plannedRecipeIds.has(rid)) return;
        const recipe = getRecipeById(rid);
        if (!recipe) return;
        const ings = recipeIngList(recipe);
        if (ings.length === 0) return;
        plannedRecipeIds.add(rid);
        ings.forEach(ing => {
          const key = normalizeIngredient(ing.name);
          if (!key || listKeys.has(key) || isStaple(ing.name) || seenKeys.has(key)) return;
          seenKeys.add(key);
          planned.push({ name: ing.name, category: mapToGroceryCategory(ing.group || 'Other'), qty: ing.qty || '', unit: ing.unit || '', mealNames: [recipe.title], recipeName: recipe.title, dateLabel: getDateLabel(dateStr) });
        });
      }
    });
  });

  // 2. Frequent ingredient suggestions removed — "Things you make often"
  //    now shows meal cards (in grocery.js renderGroceryList) instead of
  //    individual ingredient pills from cooking history.
  const frequent = [];

  return { planned, frequent };
}

function addSuggestedToGrocery(name, category, qty, unit, mealNames) {
  const list = getSmartGroceryList(); const nameLower = name.toLowerCase().trim();
  const existing = list.find(i => i.name.toLowerCase().trim() === nameLower);
  if (existing) { saveSmartGroceryList(list.filter(i => i.name.toLowerCase().trim() !== nameLower)); return false; }
  list.push({ id: 'gro_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8), name, category: category || 'Other', qty: qty || '', unit: unit || '', checked: false, manual: false, sourceMeals: mealNames || [], addedAt: Date.now() });
  saveSmartGroceryList(list); return true;
}

function addMealToGrocery(recipeId) {
  // Now opens ingredient picker instead of auto-adding all
  showMealIngredientPicker(recipeId);
}

function showMealIngredientPicker(recipeId) {
  debugLog('[grocery] showMealIngredientPicker called — recipeId:', recipeId);
  const recipe = getRecipeById(recipeId);
  if (!recipe) { console.error('[grocery] Recipe not found:', recipeId); showToast('Recipe not found', 'error'); return; }
  const ingredients = recipeIngList(recipe);
  if (ingredients.length === 0) { showToast('No ingredients found', 'info'); return; }

  const listKeys = new Set(getSmartGroceryList().map(i => normalizeIngredient(i.name)));

  // Build ingredient list with default checked state
  // Staples unchecked by default, already-on-list items marked
  const ingData = ingredients.map((ing, idx) => {
    const key = normalizeIngredient(ing.name);
    const onList = listKeys.has(key);
    const staple = isStaple(ing.name);
    return { idx, name: ing.name, group: ing.group || 'Other', qty: ing.qty || '', unit: ing.unit || '', key, onList, staple, checked: !staple };
  });

  const imgHtml = recipe.image_url
    ? `<img src="${esc(recipe.image_url)}" style="width: 56px; height: 56px; border-radius: 12px; object-fit: cover; flex-shrink: 0;">`
    : `<div style="width: 56px; height: 56px; border-radius: 12px; background: ${CONFIG.surface_elevated}; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">&#127869;</div>`;

  const ingRowsHtml = ingData.map(ing => {
    const qtyLabel = ing.qty ? `${ing.qty}${ing.unit ? ' ' + ing.unit : ''}` : '';
    return `<div data-picker-idx="${ing.idx}" onclick="togglePickerIngredient(${ing.idx})"
      style="display: flex; align-items: center; gap: 10px; padding: 10px; min-height: 44px; cursor: pointer; border-radius: 8px; margin-bottom: 2px; background: ${CONFIG.surface_color}; -webkit-tap-highlight-color: transparent;" class="card-press">
      <div class="picker-cb" data-picker-cb="${ing.idx}"
        style="width: 20px; height: 20px; border: 1.5px solid ${ing.checked ? CONFIG.primary_action_color : CONFIG.text_muted}; border-radius: 5px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: ${ing.checked ? CONFIG.primary_action_color : 'transparent'}; transition: all 150ms ease;">
        ${ing.checked ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: baseline; gap: 6px;">
          <span style="color: ${CONFIG.text_color}; font-size: 13px;">${esc(toTitleCase(ing.name))}</span>
          ${qtyLabel ? `<span style="color: ${CONFIG.text_muted}; font-size: 11px;">${esc(qtyLabel)}</span>` : ''}
        </div>
        ${ing.onList ? `<div style="font-size: 10px; color: ${CONFIG.primary_action_color}; margin-top: 1px;">Already on list</div>` : ''}
        ${ing.staple ? `<div style="font-size: 10px; color: ${CONFIG.text_muted}; margin-top: 1px;">Pantry staple</div>` : ''}
      </div>
    </div>`;
  }).join('');

  // Store picker state globally for toggle/submit
  window._pickerIngredients = ingData;
  window._pickerRecipeId = recipeId;

  const modalHtml = `<div style="color: ${CONFIG.text_color}; max-height: 80vh; display: flex; flex-direction: column;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
      ${imgHtml}
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 17px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(recipe.title)}</div>
        <div style="font-size: 12px; color: ${CONFIG.text_muted}; margin-top: 2px;">${ingredients.length} ingredient${ingredients.length !== 1 ? 's' : ''}</div>
      </div>
    </div>
    <div style="display: flex; gap: 8px; margin-bottom: 10px;">
      <button onclick="pickerSelectAll(true)" style="flex: 1; padding: 8px; min-height: 36px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: ${CONFIG.text_color}; font-size: 12px; cursor: pointer;">Select all</button>
      <button onclick="pickerSelectAll(false)" style="flex: 1; padding: 8px; min-height: 36px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: ${CONFIG.text_color}; font-size: 12px; cursor: pointer;">Deselect all</button>
    </div>
    <div style="overflow-y: auto; flex: 1; margin: 0 -16px; padding: 0 16px; max-height: 50vh;">
      ${ingRowsHtml}
    </div>
    <button onclick="submitPickerIngredients()" style="margin-top: 12px; padding: 12px; min-height: 44px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%;">Add selected to grocery list</button>
  </div>`;

  openModal(modalHtml);
}

function togglePickerIngredient(idx) {
  const ing = window._pickerIngredients && window._pickerIngredients[idx];
  if (!ing) return;
  ing.checked = !ing.checked;
  const cb = document.querySelector('[data-picker-cb="' + idx + '"]');
  if (cb) {
    cb.style.background = ing.checked ? CONFIG.primary_action_color : 'transparent';
    cb.style.borderColor = ing.checked ? CONFIG.primary_action_color : CONFIG.text_muted;
    cb.innerHTML = ing.checked ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '';
  }
}

function pickerSelectAll(selectAll) {
  if (!window._pickerIngredients) return;
  window._pickerIngredients.forEach(ing => {
    ing.checked = selectAll;
    const cb = document.querySelector('[data-picker-cb="' + ing.idx + '"]');
    if (cb) {
      cb.style.background = selectAll ? CONFIG.primary_action_color : 'transparent';
      cb.style.borderColor = selectAll ? CONFIG.primary_action_color : CONFIG.text_muted;
      cb.innerHTML = selectAll ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '';
    }
  });
}

function submitPickerIngredients() {
  const ingData = window._pickerIngredients;
  const recipeId = window._pickerRecipeId;
  if (!ingData || !recipeId) return;
  const recipe = getRecipeById(recipeId);
  if (!recipe) return;

  const selected = ingData.filter(i => i.checked);
  if (selected.length === 0) { showToast('No ingredients selected', 'info'); return; }

  const list = getSmartGroceryList();
  let added = 0;
  selected.forEach(ing => {
    const nameLower = ing.name.toLowerCase().trim();
    if (!nameLower) return;
    const existing = list.find(i => i.name.toLowerCase().trim() === nameLower);
    if (existing) {
      if (!existing.sourceMeals.includes(recipe.title)) existing.sourceMeals.push(recipe.title);
    } else {
      list.push({ id: 'gro_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8), name: ing.name, category: mapToGroceryCategory(ing.group || 'Other'), qty: ing.qty || '', unit: ing.unit || '', checked: false, manual: false, sourceMeals: [recipe.title], addedAt: Date.now() });
      added++;
    }
  });
  saveSmartGroceryList(list);
  closeModal();
  showToast(`Added ${selected.length} ingredient${selected.length !== 1 ? 's' : ''} to grocery list`, 'success');
  if (typeof render === 'function') render();
}

function showBatchIngredientPicker(batchId) {
  const batch = getBatchRecipeById(batchId);
  if (!batch) { showToast('Plate not found', 'error'); return; }
  const allIngs = getBatchRecipeIngredients(batch);
  if (allIngs.length === 0) { showToast('No ingredients found', 'info'); return; }

  const listKeys = new Set(getSmartGroceryList().map(i => normalizeIngredient(i.name)));
  const ingData = allIngs.map((ing, idx) => {
    const key = normalizeIngredient(ing.name);
    const onList = listKeys.has(key);
    const staple = isStaple(ing.name);
    return { idx, name: ing.name, group: ing.group || 'Other', qty: ing.qty || '', unit: ing.unit || '', key, onList, staple, checked: !staple, componentName: ing.componentName, componentId: ing.componentId };
  });

  // Group by component
  const compGroups = {};
  ingData.forEach(ing => {
    if (!compGroups[ing.componentId]) compGroups[ing.componentId] = { name: ing.componentName, items: [] };
    compGroups[ing.componentId].items.push(ing);
  });

  let rowsHtml = '';
  Object.values(compGroups).forEach(group => {
    rowsHtml += `<div style="margin-bottom:12px;">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 0;cursor:pointer;" onclick="var s=this.nextElementSibling;s.style.display=s.style.display==='none'?'block':'none';this.querySelector('.batch-chev').style.transform=s.style.display==='none'?'':'rotate(90deg)';">
        <span class="batch-chev" style="color:${CONFIG.text_muted};font-size:12px;transition:transform 150ms;display:inline-block;transform:rotate(90deg);">&#9656;</span>
        <span style="font-size:13px;font-weight:600;color:${CONFIG.primary_action_color};">${esc(group.name)}</span>
        <span style="font-size:11px;color:${CONFIG.text_muted};">${group.items.length} items</span>
      </div>
      <div>`;
    group.items.forEach(ing => {
      const qtyLabel = ing.qty ? `${ing.qty}${ing.unit ? ' ' + ing.unit : ''}` : '';
      rowsHtml += `<div data-picker-idx="${ing.idx}" onclick="togglePickerIngredient(${ing.idx})"
        style="display:flex;align-items:center;gap:10px;padding:10px;min-height:44px;cursor:pointer;border-radius:8px;margin-bottom:2px;background:${CONFIG.surface_color};" class="card-press">
        <div class="picker-cb" data-picker-cb="${ing.idx}"
          style="width:20px;height:20px;border:1.5px solid ${ing.checked ? CONFIG.primary_action_color : CONFIG.text_muted};border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:${ing.checked ? CONFIG.primary_action_color : 'transparent'};transition:all 150ms ease;">
          ${ing.checked ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:baseline;gap:6px;">
            <span style="color:${CONFIG.text_color};font-size:13px;">${esc(toTitleCase(ing.name))}</span>
            ${qtyLabel ? `<span style="color:${CONFIG.text_muted};font-size:11px;">${esc(qtyLabel)}</span>` : ''}
          </div>
          ${ing.onList ? `<div style="font-size:10px;color:${CONFIG.primary_action_color};margin-top:1px;">Already on list</div>` : ''}
          ${ing.staple ? `<div style="font-size:10px;color:${CONFIG.text_muted};margin-top:1px;">Pantry staple</div>` : ''}
        </div>
      </div>`;
    });
    rowsHtml += '</div></div>';
  });

  window._pickerIngredients = ingData;
  window._pickerBatchId = batchId;

  const modalHtml = `<div style="color:${CONFIG.text_color};max-height:80vh;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
      <div style="width:56px;height:56px;border-radius:12px;background:${CONFIG.surface_elevated};display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;">
        ${getBatchCoverPhoto(batch) ? `<img src="${esc(getBatchCoverPhoto(batch))}" style="width:100%;height:100%;object-fit:cover;">` : `<svg width="28" height="28" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 003.75 9v.878m0 0c.235-.083.487-.128.75-.128h10.5m3.75.128A2.25 2.25 0 0120.25 9v.878m0 0A2.25 2.25 0 0118 12H6a2.25 2.25 0 01-2.25-2.122"/></svg>`}
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:17px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(batch.name)}</div>
        <div style="font-size:12px;color:${CONFIG.text_muted};margin-top:2px;">${allIngs.length} ingredient${allIngs.length !== 1 ? 's' : ''} across ${batch.components.length} components</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:10px;">
      <button onclick="pickerSelectAll(true)" style="flex:1;padding:8px;min-height:36px;background:${CONFIG.surface_color};border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:${CONFIG.text_color};font-size:12px;cursor:pointer;">Select all</button>
      <button onclick="pickerSelectAll(false)" style="flex:1;padding:8px;min-height:36px;background:${CONFIG.surface_color};border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:${CONFIG.text_color};font-size:12px;cursor:pointer;">Deselect all</button>
    </div>
    <div style="overflow-y:auto;flex:1;margin:0 -16px;padding:0 16px;max-height:50vh;">
      ${rowsHtml}
    </div>
    <button onclick="submitBatchPickerIngredients()" style="margin-top:12px;padding:12px;min-height:44px;background:${CONFIG.primary_action_color};color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;width:100%;">Add selected to grocery list</button>
  </div>`;

  openModal(modalHtml);
}

function submitBatchPickerIngredients() {
  const ingData = window._pickerIngredients;
  const batchId = window._pickerBatchId;
  if (!ingData || !batchId) return;
  const batch = getBatchRecipeById(batchId);
  if (!batch) return;

  const selected = ingData.filter(i => i.checked);
  if (selected.length === 0) { showToast('No ingredients selected', 'info'); return; }

  const list = getSmartGroceryList();
  selected.forEach(ing => {
    const key = normalizeIngredient(ing.name);
    if (!key) return;
    const existing = list.find(i => normalizeIngredient(i.name) === key);
    if (existing) {
      if (!existing.sourceMeals.includes(batch.name)) existing.sourceMeals.push(batch.name);
    } else {
      list.push({ id: 'gro_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8), name: ing.name, category: mapToGroceryCategory(ing.group || 'Other'), qty: ing.qty || '', unit: ing.unit || '', checked: false, manual: false, sourceMeals: [batch.name], addedAt: Date.now() });
    }
  });
  saveSmartGroceryList(list);
  closeModal();
  showToast(`Added ${selected.length} ingredient${selected.length !== 1 ? 's' : ''} to grocery list`, 'success');
  if (typeof render === 'function') render();
}

function addManualGroceryItemSmart() {
  const input = document.getElementById('groceryManualInput'); if (!input) return;
  const name = input.value.trim(); if (!name) return;
  const list = getSmartGroceryList();
  if (list.find(i => i.name.toLowerCase().trim() === name.toLowerCase().trim())) { showToast('Already on your list', 'info'); input.value = ''; return; }
  const catInput = document.getElementById('groceryManualCategory');
  const category = (catInput && catInput.value) ? catInput.value : 'Other';
  list.push({ id: 'gro_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8), name, category, qty: '', unit: '', checked: false, manual: true, sourceMeals: [], addedAt: Date.now() });
  saveSmartGroceryList(list); input.value = '';
  if (catInput) catInput.value = 'Other';
  showToast(`${toTitleCase(name)} added to ${category}`, 'success');
  if (typeof render === 'function') render();
  setTimeout(() => { const newInput = document.getElementById('groceryManualInput'); if (newInput) newInput.focus(); }, 50);
}

function toggleSmartGroceryItem(itemId) {
  const list = getSmartGroceryList(); const item = list.find(i => i.id === itemId); if (!item) return;
  item.checked = !item.checked; saveSmartGroceryList(list);
  const row = document.querySelector(`[data-gro-id="${itemId}"]`);
  if (row) { const cb = row.querySelector('.gro-checkbox'); const label = row.querySelector('.gro-label'); if (item.checked) { if (cb) { cb.style.background = 'var(--accent-green)'; cb.style.borderColor = 'var(--accent-green)'; cb.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; } if (label) { label.style.textDecoration = 'line-through'; label.style.opacity = '0.4'; } } else { if (cb) { cb.style.background = 'transparent'; cb.style.borderColor = 'var(--text-secondary)'; cb.innerHTML = ''; } if (label) { label.style.textDecoration = 'none'; label.style.opacity = '1'; } } }
  _updateGroceryBadge();
  clearTimeout(state._smartGroceryRenderTimeout);
  state._smartGroceryRenderTimeout = setTimeout(() => {
    if (['grocery-list'].includes(state.currentView) && typeof render === 'function') {
      const scrollEl = document.getElementById('app');
      const scrollPos = scrollEl ? scrollEl.scrollTop : window.scrollY;
      render();
      requestAnimationFrame(() => {
        if (scrollEl) scrollEl.scrollTop = scrollPos;
        else window.scrollTo(0, scrollPos);
      });
    }
  }, 1200);
}

function removeSmartGroceryItem(itemId) {
  let list = getSmartGroceryList(); list = list.filter(i => i.id !== itemId); saveSmartGroceryList(list);
  const row = document.querySelector(`[data-gro-id="${itemId}"]`);
  if (row) { row.style.transition = 'opacity 150ms, transform 150ms'; row.style.opacity = '0'; row.style.transform = 'translateX(-20px)'; setTimeout(() => row.remove(), 150); }
  _updateGroceryBadge();
  clearTimeout(state._smartGroceryRenderTimeout);
  state._smartGroceryRenderTimeout = setTimeout(() => {
    if (['grocery-list'].includes(state.currentView) && typeof render === 'function') {
      const scrollEl = document.getElementById('app');
      const scrollPos = scrollEl ? scrollEl.scrollTop : window.scrollY;
      render();
      requestAnimationFrame(() => {
        if (scrollEl) scrollEl.scrollTop = scrollPos;
        else window.scrollTo(0, scrollPos);
      });
    }
  }, 600);
}

function clearCheckedGrocery() { saveSmartGroceryList(getSmartGroceryList().filter(i => !i.checked)); showToast('Checked items cleared', 'success'); if (typeof render === 'function') render(); }
function clearAllGrocerySmart() { if (!confirm('Clear your entire grocery list?')) return; saveSmartGroceryList([]); showToast('Grocery list cleared', 'success'); if (typeof render === 'function') render(); }

function _updateGroceryBadge() {
  const badge = document.getElementById('grocery-badge');
  const count = getGroceryBadgeCount();
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
}

let _cachedSuggestions = [];
function handleSuggestClick(idx) { const s = _cachedSuggestions[idx]; if (!s) return; const added = addSuggestedToGrocery(s.name, s.category, s.qty, s.unit, s.mealNames); showToast(added ? `${toTitleCase(s.name)} added` : `${toTitleCase(s.name)} removed`, added ? 'success' : 'info'); if (typeof render === 'function') render(); }

// --- Add from a meal: filter state ---
window._mealPickerFilters = { search: '', saved: false, mealType: null, effort: null };

function showAddFromMealModal() {
  debugLog('[grocery] showAddFromMealModal called — total recipes:', state.recipes?.length, 'mealDays:', Object.keys(state.mealDays || {}).length, 'foodLog:', getFoodLog()?.length);
  window._mealPickerFilters = { search: '', saved: false, mealType: null, effort: null };

  const savedIds = new Set(getSavedRecipes());
  const allItems = [];
  const seen = new Set();

  // Helper to add a recipe to the list
  function addRecipeItem(r, mealCategory) {
    const id = r.id || r.__backendId;
    if (!id || seen.has(id)) return;
    seen.add(id);
    const effort = getRecipeEffort(id);
    const cat = (mealCategory || r.category || '').toLowerCase();
    allItems.push({
      recipeId: id,
      name: r.title || '',
      image: r.image_url || '',
      category: mealCategory || r.category || '',
      catLower: cat,
      effort: effort,
      isSaved: savedIds.has(id),
      ingredients: recipeIngList(r).map(i => (i.name || '').toLowerCase())
    });
  }

  // 1. All non-draft recipes (removed ingredientsRows requirement — show all recipes)
  state.recipes.filter(r => !r.isDraft && !r.isTip).forEach(r => addRecipeItem(r));

  // 2. Recipes from planned meals (mealDays) — catches meals the user has planned
  Object.values(state.mealDays || {}).forEach(day => {
    if (!day || !day.meals) return;
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      const meal = day.meals[mealType];
      if (!meal) return;
      const rid = meal.plannedRecipeId || meal.actualRecipeId;
      if (!rid || seen.has(rid)) return;
      const recipe = getRecipeById(rid);
      if (recipe) addRecipeItem(recipe, mealType);
    });
  });

  // 3. Recipes from food log (frequently cooked)
  try {
    const log = getFoodLog();
    log.forEach(entry => {
      if (!entry.recipeId || seen.has(entry.recipeId)) return;
      const recipe = getRecipeById(entry.recipeId);
      if (recipe) addRecipeItem(recipe);
    });
  } catch (e) { console.error('[grocery] Error reading food log:', e); }

  // 4. Recipes from meal options (swipe picks)
  (state.mealOptions || []).forEach(option => {
    if (!option.recipeId || seen.has(option.recipeId)) return;
    const recipe = getRecipeById(option.recipeId);
    if (recipe) addRecipeItem(recipe, option.category);
  });

  window._mealPickerAllItems = allItems;
  debugLog('[grocery] showAddFromMealModal — total meals found:', allItems.length, '(recipes:', state.recipes?.length, ', with ingredients:', allItems.filter(i => i.ingredients.length > 0).length, ')');

  const modalHtml = `<div style="color:${CONFIG.text_color};max-height:80vh;display:flex;flex-direction:column;">
    <h2 style="font-size:17px;font-weight:600;margin-bottom:12px;">Add from a meal</h2>
    <input id="mealPickerSearch" type="text" placeholder="Search meals or ingredients..."
      oninput="window._mealPickerFilters.search=this.value;_renderMealPickerResults();"
      style="width:100%;padding:10px 12px;margin-bottom:10px;background:${CONFIG.background_color};color:${CONFIG.text_color};border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:14px;box-sizing:border-box;outline:none;">
    <div id="mealPickerPills" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:10px;margin-bottom:8px;-webkit-overflow-scrolling:touch;scrollbar-width:none;flex-shrink:0;"></div>
    <div id="mealPickerResults" style="overflow-y:auto;flex:1;margin:0 -16px;padding:0 16px;min-height:0;"></div>
    <button onclick="closeModal()" style="margin-top:12px;padding:10px;min-height:44px;background:${CONFIG.surface_elevated};color:${CONFIG.text_color};border:none;border-radius:10px;cursor:pointer;width:100%;font-size:14px;flex-shrink:0;">Done</button>
  </div>`;

  openModal(modalHtml);
  _renderMealPickerPills();
  _renderMealPickerResults();
}

function _mealPickerToggleFilter(type, value) {
  const f = window._mealPickerFilters;
  if (type === 'saved') {
    f.saved = !f.saved;
  } else if (type === 'mealType') {
    f.mealType = f.mealType === value ? null : value;
  } else if (type === 'effort') {
    f.effort = f.effort === value ? null : value;
  }
  _renderMealPickerPills();
  _renderMealPickerResults();
}

function _renderMealPickerPills() {
  const container = document.getElementById('mealPickerPills');
  if (!container) return;
  const f = window._mealPickerFilters;
  const noFilters = !f.saved && !f.mealType && !f.effort;

  const pills = [
    { label: 'All', active: noFilters, onclick: "window._mealPickerFilters={search:window._mealPickerFilters.search,saved:false,mealType:null,effort:null};_renderMealPickerPills();_renderMealPickerResults();" },
    { label: 'Saved', active: f.saved, onclick: "_mealPickerToggleFilter('saved')" },
    { label: 'Breakfast', active: f.mealType === 'breakfast', onclick: "_mealPickerToggleFilter('mealType','breakfast')" },
    { label: 'Lunch', active: f.mealType === 'lunch', onclick: "_mealPickerToggleFilter('mealType','lunch')" },
    { label: 'Dinner', active: f.mealType === 'dinner', onclick: "_mealPickerToggleFilter('mealType','dinner')" },
    { label: 'Snack', active: f.mealType === 'snack', onclick: "_mealPickerToggleFilter('mealType','snack')" },
    { label: 'Lazy', active: f.effort === 'lazy', onclick: "_mealPickerToggleFilter('effort','lazy')", effortKey: 'lazy' },
    { label: 'Moderate', active: f.effort === 'moderate', onclick: "_mealPickerToggleFilter('effort','moderate')", effortKey: 'moderate' },
    { label: 'Timely', active: f.effort === 'timely', onclick: "_mealPickerToggleFilter('effort','timely')", effortKey: 'timely' }
  ];

  container.innerHTML = pills.map(p => {
    let bg, border, txt;
    if (p.effortKey && p.active) {
      const e = EFFORT_LEVELS[p.effortKey];
      bg = e.bg; border = e.border; txt = e.color;
    } else if (p.active) {
      bg = 'rgba(232,93,93,0.15)'; border = 'rgba(232,93,93,0.4)'; txt = '#e85d5d';
    } else {
      bg = 'transparent'; border = 'rgba(255,255,255,0.1)'; txt = CONFIG.text_muted;
    }
    return `<button onclick="${p.onclick}" style="padding:5px 12px;border-radius:14px;border:1px solid ${border};background:${bg};color:${txt};font-size:12px;font-weight:${p.active ? '600' : '400'};cursor:pointer;white-space:nowrap;flex-shrink:0;-webkit-tap-highlight-color:transparent;">${p.label}</button>`;
  }).join('');
}

function _renderMealPickerResults() {
  const container = document.getElementById('mealPickerResults');
  if (!container) return;
  const f = window._mealPickerFilters;
  const items = window._mealPickerAllItems || [];
  const searchLower = (f.search || '').toLowerCase().trim();

  const filtered = items.filter(item => {
    // Search filter: match name or ingredients
    if (searchLower) {
      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const ingMatch = item.ingredients.some(ing => ing.includes(searchLower));
      if (!nameMatch && !ingMatch) return false;
    }
    // Saved filter
    if (f.saved && !item.isSaved) return false;
    // Meal type filter
    if (f.mealType && item.catLower !== f.mealType) return false;
    // Effort filter
    if (f.effort && item.effort !== f.effort) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:32px 16px;color:${CONFIG.text_muted};font-size:14px;">No matching meals found.</div>`;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const imgHtml = item.image
      ? `<img src="${esc(item.image)}" style="width:48px;height:48px;border-radius:10px;object-fit:cover;flex-shrink:0;" loading="lazy">`
      : `<div style="width:48px;height:48px;border-radius:10px;background:${CONFIG.surface_elevated};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">&#127869;</div>`;

    const catPill = item.category
      ? `<span style="font-size:10px;padding:2px 7px;background:rgba(255,255,255,0.06);color:${CONFIG.text_muted};border-radius:8px;white-space:nowrap;">${esc(item.category)}</span>`
      : '';
    const effortPill = renderEffortPill(item.effort, 'sm');
    const ingCount = item.ingredients.length;
    const ingLabel = ingCount > 0 ? `${ingCount} ingredient${ingCount !== 1 ? 's' : ''}` : 'No ingredients listed';

    return `<div onclick="showMealIngredientPicker('${esc(item.recipeId)}')"
      style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;cursor:pointer;margin-bottom:4px;background:${CONFIG.surface_color};-webkit-tap-highlight-color:transparent;" class="card-press">
      ${imgHtml}
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;">${esc(item.name)}</div>
        <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">${catPill}${effortPill}<span style="font-size:10px;color:${CONFIG.text_tertiary};">${ingLabel}</span></div>
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// SECTION 9: MODAL & UI COMPONENTS
// ============================================================
function openModal(content) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');
  if (modal && modalContent) {
    modalContent.innerHTML = content;
    modal.style.display = 'flex';
    requestAnimationFrame(() => { modal.classList.add('modal-open'); });
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.remove('modal-open');
  const onEnd = () => { modal.style.display = 'none'; modal.removeEventListener('transitionend', onEnd); };
  const content = document.getElementById('modal-content');
  if (content && getComputedStyle(content).transitionDuration !== '0s') {
    content.addEventListener('transitionend', onEnd, { once: true });
    setTimeout(onEnd, 400); // Fallback if transitionend doesn't fire
  } else {
    modal.style.display = 'none';
  }
}

// Click outside to close modal
document.addEventListener('click', (e) => {
  const modal = document.getElementById('modal');
  if (e.target === modal) closeModal();
});

// ============================================================
// SECTION 9a: PHOTO SEARCH SYSTEM
// ============================================================

// API Keys (replace with real keys)
const UNSPLASH_ACCESS_KEY = 'bRX98BNJez65z3Y8QZYmp_HlrIedG2Qi6n6xkaODjCw';
const SERPER_API_KEY = 'baa03e69b94509f224023258927f66385c2e261a';

// Grocery photo toggle removed — photos always shown

// Photo search state
let _photoSearchState = {
  query: '',
  tab: 'unsplash', // 'unsplash' | 'google'
  results: [],
  selectedIdx: -1,
  selectedUrl: '',
  loading: false,
  error: null,
  callback: null,
  debounceTimer: null
};

/**
 * Opens the photo search modal.
 * @param {string} defaultQuery - Pre-filled search query
 * @param {function} callback - Called with selected image URL (or base64 for uploads)
 */
function openPhotoSearch(defaultQuery, callback) {
  _photoSearchState = {
    query: defaultQuery || '',
    tab: 'unsplash',
    results: [],
    selectedIdx: -1,
    selectedUrl: '',
    loading: !!defaultQuery,
    error: null,
    callback: callback || null,
    debounceTimer: null
  };
  _renderPhotoSearchModal();
  // Auto-search on open
  if (defaultQuery) {
    _photoSearchFetch(defaultQuery, 'unsplash');
  }
}

function _renderPhotoSearchModal() {
  const s = _photoSearchState;
  const overlay = document.getElementById('photoSearchOverlay');
  if (overlay) overlay.remove();

  const div = document.createElement('div');
  div.id = 'photoSearchOverlay';
  div.style.cssText = `position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.85);display:flex;align-items:flex-end;justify-content:center;`;
  div.onclick = function(e) { if (e.target === div) _closePhotoSearch(); };

  div.innerHTML = `
    <div id="photoSearchPanel" style="
      width:100%;max-width:500px;max-height:92dvh;
      background:${CONFIG.surface_elevated};
      border-radius:16px 16px 0 0;
      display:flex;flex-direction:column;
      font-family:${CONFIG.font_family};
      animation:photoSearchSlideUp 250ms ease-out;
    ">
      <style>
        @keyframes photoSearchSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (min-width: 768px) {
          #photoSearchPanel {
            border-radius: 16px !important;
            margin: auto !important;
            max-height: 80vh !important;
          }
          #photoSearchOverlay {
            align-items: center !important;
          }
        }
      </style>

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 16px 12px;">
        <div style="font-size:17px;font-weight:600;color:${CONFIG.text_color};">Search Photos</div>
        <button onclick="_closePhotoSearch()" style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.1);border:none;color:${CONFIG.text_color};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;">&times;</button>
      </div>

      <!-- Search bar -->
      <div style="padding:0 16px 10px;">
        <input id="photoSearchInput" type="text" value="${esc(s.query)}"
          placeholder="Search for photos..."
          oninput="_onPhotoSearchInput(this.value)"
          style="width:100%;padding:10px 14px;height:44px;box-sizing:border-box;background:${CONFIG.background_color};border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:${CONFIG.text_color};font-size:15px;outline:none;font-family:${CONFIG.font_family};" />
      </div>

      <!-- Tabs -->
      <div style="display:flex;gap:0;padding:0 16px 8px;">
        <button onclick="_switchPhotoTab('unsplash')" id="photoTabUnsplash"
          style="flex:1;padding:8px 0;border:none;border-radius:20px 0 0 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:${CONFIG.font_family};
          ${s.tab === 'unsplash' ? `background:${CONFIG.primary_action_color};color:white;` : `background:${CONFIG.surface_color};color:${CONFIG.text_muted};`}">
          Photos
        </button>
        <button onclick="_switchPhotoTab('google')" id="photoTabGoogle"
          style="flex:1;padding:8px 0;border:none;border-radius:0 20px 20px 0;font-size:13px;font-weight:600;cursor:pointer;font-family:${CONFIG.font_family};
          ${s.tab === 'google' ? `background:${CONFIG.primary_action_color};color:white;` : `background:${CONFIG.surface_color};color:${CONFIG.text_muted};`}">
          Google
        </button>
      </div>

      <!-- Upload link -->
      <div style="padding:0 16px 10px;">
        <input id="photoSearchUploadInput" type="file" accept="image/*" capture="environment" style="display:none;" onchange="_handlePhotoSearchUpload(this)" />
        <button onclick="document.getElementById('photoSearchUploadInput').click()"
          style="background:none;border:none;color:${CONFIG.primary_action_color};font-size:13px;cursor:pointer;padding:0;font-family:${CONFIG.font_family};">
          Or upload your own
        </button>
      </div>

      <!-- Results grid -->
      <div id="photoSearchResults" style="flex:1;overflow-y:auto;padding:0 16px 16px;-webkit-overflow-scrolling:touch;">
        ${_renderPhotoSearchResults()}
      </div>

      <!-- Use this photo button -->
      <div id="photoSearchAction" style="padding:12px 16px;${s.selectedIdx >= 0 ? '' : 'display:none;'}">
        <button onclick="_confirmPhotoSelection()"
          style="width:100%;height:44px;border:none;border-radius:10px;background:${CONFIG.primary_action_color};color:white;font-size:15px;font-weight:600;cursor:pointer;font-family:${CONFIG.font_family};">
          Use this photo
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(div);

  // Focus search input
  setTimeout(() => {
    const input = document.getElementById('photoSearchInput');
    if (input) input.focus();
  }, 100);
}

function _renderPhotoSearchResults() {
  const s = _photoSearchState;

  if (s.loading) {
    return `<div style="display:flex;align-items:center;justify-content:center;padding:40px 0;">
      <div style="width:28px;height:28px;border:3px solid rgba(255,255,255,0.1);border-top-color:${CONFIG.primary_action_color};border-radius:50%;animation:photoSearchSpin 0.6s linear infinite;"></div>
      <style>@keyframes photoSearchSpin { to { transform: rotate(360deg); } }</style>
    </div>`;
  }

  if (s.error) {
    return `<div style="text-align:center;padding:40px 16px;color:${CONFIG.danger_color || '#ff6b6b'};font-size:14px;line-height:1.5;">
      ${esc(s.error)}<br><span style="color:${CONFIG.text_muted};font-size:12px;margin-top:8px;display:block;">You can still upload your own photo above.</span>
    </div>`;
  }

  if (s.query && s.results.length === 0) {
    return `<div style="text-align:center;padding:40px 16px;color:${CONFIG.text_muted};font-size:14px;line-height:1.5;">
      No results found.<br>Try a different search or upload your own.
    </div>`;
  }

  if (s.results.length === 0) {
    return `<div style="text-align:center;padding:40px 16px;color:${CONFIG.text_muted};font-size:14px;">
      Search for ingredient or product photos above.
    </div>`;
  }

  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px;">
    ${s.results.map((img, i) => {
      const thumb = img.thumb;
      const isSelected = i === s.selectedIdx;
      return `<div onclick="_selectPhotoResult(${i})" style="position:relative;cursor:pointer;aspect-ratio:1/1;overflow:hidden;${isSelected ? `outline:3px solid ${CONFIG.primary_action_color};outline-offset:-3px;border-radius:4px;` : ''}">
        <img src="${esc(thumb)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.style.display='none';" />
        ${isSelected ? `<div style="position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:${CONFIG.primary_action_color};display:flex;align-items:center;justify-content:center;">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

function _updatePhotoSearchResults() {
  const container = document.getElementById('photoSearchResults');
  if (container) container.innerHTML = _renderPhotoSearchResults();

  const action = document.getElementById('photoSearchAction');
  if (action) action.style.display = _photoSearchState.selectedIdx >= 0 ? '' : 'none';
}

function _onPhotoSearchInput(value) {
  _photoSearchState.query = value;
  _photoSearchState.selectedIdx = -1;
  _photoSearchState.selectedUrl = '';
  _updatePhotoSearchResults();

  clearTimeout(_photoSearchState.debounceTimer);
  if (!value.trim()) {
    _photoSearchState.loading = false;
    _photoSearchState.results = [];
    _updatePhotoSearchResults();
    return;
  }
  _photoSearchState.debounceTimer = setTimeout(() => {
    _photoSearchFetch(value.trim(), _photoSearchState.tab);
  }, 500);
}

function _switchPhotoTab(tab) {
  _photoSearchState.tab = tab;
  _photoSearchState.selectedIdx = -1;
  _photoSearchState.selectedUrl = '';
  _photoSearchState.results = [];

  // Update tab styles
  const unsplashTab = document.getElementById('photoTabUnsplash');
  const googleTab = document.getElementById('photoTabGoogle');
  if (unsplashTab) {
    unsplashTab.style.background = tab === 'unsplash' ? CONFIG.primary_action_color : CONFIG.surface_color;
    unsplashTab.style.color = tab === 'unsplash' ? 'white' : CONFIG.text_muted;
  }
  if (googleTab) {
    googleTab.style.background = tab === 'google' ? CONFIG.primary_action_color : CONFIG.surface_color;
    googleTab.style.color = tab === 'google' ? 'white' : CONFIG.text_muted;
  }

  _updatePhotoSearchResults();

  if (_photoSearchState.query.trim()) {
    _photoSearchFetch(_photoSearchState.query.trim(), tab);
  }
}

async function _photoSearchFetch(query, source) {
  _photoSearchState.loading = true;
  _photoSearchState.results = [];
  _updatePhotoSearchResults();

  try {
    if (source === 'unsplash') {
      if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_KEY') {
        console.error('Unsplash search error: API key not configured. Replace YOUR_UNSPLASH_KEY in js/shared.js with a real Unsplash Access Key from https://unsplash.com/developers');
        _photoSearchState.results = [];
        _photoSearchState.error = 'Unsplash API key not configured. Add your key in js/shared.js';
        _photoSearchState.loading = false;
        _updatePhotoSearchResults();
        return;
      }
      const resp = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=21&client_id=${UNSPLASH_ACCESS_KEY}`);
      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        console.error('Unsplash search error:', resp.status, resp.statusText, errText);
        throw new Error(`Unsplash API error: ${resp.status} ${resp.statusText}`);
      }
      const data = await resp.json();
      _photoSearchState.results = (data.results || []).map(r => ({
        thumb: r.urls.small,
        full: r.urls.regular
      }));
    } else {
      if (!SERPER_API_KEY || SERPER_API_KEY === 'YOUR_SERPER_KEY') {
        console.error('Serper search error: API key not configured. Replace YOUR_SERPER_KEY in js/shared.js');
        _photoSearchState.results = [];
        _photoSearchState.error = 'Google search API key not configured. Add your key in js/shared.js';
        _photoSearchState.loading = false;
        _updatePhotoSearchResults();
        return;
      }
      const resp = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, num: 21 })
      });
      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        console.error('Serper search error:', resp.status, resp.statusText, errText);
        throw new Error(`Serper API error: ${resp.status} ${resp.statusText}`);
      }
      const data = await resp.json();
      _photoSearchState.results = (data.images || []).map(r => ({
        thumb: r.thumbnailUrl,
        full: r.imageUrl
      }));
    }
    _photoSearchState.error = null;
  } catch (e) {
    console.error('Photo search error:', e);
    _photoSearchState.results = [];
    _photoSearchState.error = e.message || 'Search failed';
  }

  _photoSearchState.loading = false;
  _updatePhotoSearchResults();
}

function _selectPhotoResult(idx) {
  const s = _photoSearchState;
  if (idx === s.selectedIdx) {
    // Deselect
    s.selectedIdx = -1;
    s.selectedUrl = '';
  } else {
    s.selectedIdx = idx;
    s.selectedUrl = s.results[idx]?.full || '';
  }
  _updatePhotoSearchResults();
}

function _confirmPhotoSelection() {
  const s = _photoSearchState;
  if (s.selectedUrl && s.callback) {
    s.callback(s.selectedUrl);
  }
  _closePhotoSearch();
}

function _handlePhotoSearchUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    // Compress before returning
    const img = new Image();
    img.onerror = function() {
      showToast('Could not load image. Try a different file.', 'error');
      _closePhotoSearch();
    };
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxSize = 800;
      let w = img.width, h = img.height;
      if (w > h) { if (w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize; } }
      else { if (h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      if (_photoSearchState.callback) {
        _photoSearchState.callback(base64);
      }
      _closePhotoSearch();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function _closePhotoSearch() {
  clearTimeout(_photoSearchState.debounceTimer);
  const overlay = document.getElementById('photoSearchOverlay');
  if (overlay) overlay.remove();
}

// ============================================================
// SECTION 9b: FULLSCREEN VIDEO OVERLAY
// ============================================================

// State for the fullscreen video overlay
if (!state.videoOverlay) state.videoOverlay = null; // { type: 'recipe'|'batch', id, sequence, currentIndex, muted }

function openVideoOverlay(type, id) {
  let sequence = [];
  if (type === 'recipe') {
    const clips = getRecipeVideoClips(id);
    clips.forEach(clip => {
      sequence.push({ type: 'clip', ...clip, componentName: null });
    });
  } else if (type === 'batch') {
    const batch = getBatchRecipeById(id);
    if (batch) sequence = getBatchVideoSequence(batch);
  }
  if (sequence.length === 0) return;
  state.videoOverlay = { type, id, sequence, currentIndex: 0, muted: true };
  document.body.style.overflow = 'hidden';
  renderVideoOverlay();
}

function closeVideoOverlay() {
  state.videoOverlay = null;
  document.body.style.overflow = '';
  const overlay = document.getElementById('videoFullscreenOverlay');
  if (overlay) overlay.remove();
}

function videoOverlayGoTo(idx) {
  if (!state.videoOverlay) return;
  const seq = state.videoOverlay.sequence;
  if (idx < 0 || idx >= seq.length) return;
  state.videoOverlay.currentIndex = idx;
  renderVideoOverlay();
}

function toggleVideoOverlayMute() {
  if (!state.videoOverlay) return;
  state.videoOverlay.muted = !state.videoOverlay.muted;
  renderVideoOverlay();
}

function renderVideoOverlay() {
  if (!state.videoOverlay) return;
  const { sequence, currentIndex, muted, type } = state.videoOverlay;
  const item = sequence[currentIndex];
  if (!item) return;

  const isClip = item.type === 'clip';
  const isDivider = item.type === 'divider';
  const total = sequence.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  // Build video area
  let videoAreaHtml = '';
  if (isClip) {
    const embedUrl = getStreamEmbedUrl(item.cloudflareVideoId, { autoplay: true, muted: muted, controls: false, loop: true });
    videoAreaHtml = `
      <div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#000;">
        <div style="position:relative; width:100%; max-width:500px; height:100%;">
          <iframe id="videoOverlayIframe" src="${embedUrl}"
            style="width:100%; height:100%; border:none;"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowfullscreen></iframe>
          <!-- Mute/unmute button -->
          <button onclick="toggleVideoOverlayMute()" style="position:absolute; bottom:12px; right:12px; width:36px; height:36px; border-radius:50%; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:10;">
            ${muted ? `
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
            ` : `
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            `}
          </button>
          <!-- Left arrow nav -->
          ${!isFirst && total > 1 ? `
          <button onclick="videoOverlayGoTo(${currentIndex - 1})" style="position:absolute; left:8px; top:50%; transform:translateY(-50%); width:48px; height:48px; border-radius:50%; background:rgba(255,255,255,0.2); backdrop-filter:blur(4px); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:10;">
            <svg width="24" height="24" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>` : ''}
          <!-- Right arrow nav -->
          ${!isLast && total > 1 ? `
          <button onclick="videoOverlayGoTo(${currentIndex + 1})" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); width:48px; height:48px; border-radius:50%; background:rgba(255,255,255,0.2); backdrop-filter:blur(4px); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:10;">
            <svg width="24" height="24" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>` : ''}
        </div>
      </div>
    `;
  } else {
    // Divider card
    const compIdx = sequence.filter((s, i) => i <= currentIndex && s.type === 'divider').length;
    const totalComps = sequence.filter(s => s.type === 'divider').length + 1;
    videoAreaHtml = `
      <div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:${CONFIG.surface_color}; position:relative;">
        <div style="color:${CONFIG.text_muted}; font-size:14px; margin-bottom:12px;">Up next</div>
        <div style="color:${CONFIG.text_color}; font-size:20px; font-weight:700; text-align:center; padding:0 24px;">${esc(item.componentName)}</div>
        <div style="color:${CONFIG.text_muted}; font-size:13px; margin-top:12px;">Step ${compIdx + 1} of ${totalComps}</div>
        <!-- Left arrow nav on divider -->
        ${!isFirst && total > 1 ? `
        <button onclick="videoOverlayGoTo(${currentIndex - 1})" style="position:absolute; left:8px; top:50%; transform:translateY(-50%); width:48px; height:48px; border-radius:50%; background:rgba(255,255,255,0.2); backdrop-filter:blur(4px); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:10;">
          <svg width="24" height="24" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>` : ''}
        <!-- Right arrow nav on divider -->
        ${!isLast && total > 1 ? `
        <button onclick="videoOverlayGoTo(${currentIndex + 1})" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); width:48px; height:48px; border-radius:50%; background:rgba(255,255,255,0.2); backdrop-filter:blur(4px); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:10;">
          <svg width="24" height="24" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>` : ''}
      </div>
    `;
  }

  // Progress bar (Instagram-stories style segments)
  let progressBarHtml = '';
  if (total > 1) {
    progressBarHtml = `
      <div style="display:flex; align-items:center; gap:8px; padding:8px 16px 4px;">
        <div style="display:flex; flex:1; gap:3px;">
          ${sequence.map((s, i) => {
            let segColor;
            if (i === currentIndex) segColor = CONFIG.primary_action_color;
            else if (i < currentIndex) segColor = 'rgba(255,255,255,0.85)';
            else segColor = 'rgba(255,255,255,0.2)';
            return `<button onclick="videoOverlayGoTo(${i})" style="flex:1; height:3px; border-radius:2px; border:none; padding:0; background:${segColor}; cursor:pointer; transition:background 0.2s;"></button>`;
          }).join('')}
        </div>
        <div style="color:${CONFIG.text_muted}; font-size:13px; white-space:nowrap; flex-shrink:0;">${currentIndex + 1} of ${total}</div>
      </div>
    `;
  }

  // Build instructions area
  let instructionsHtml = '';
  if (isClip) {
    const caption = item.caption || '';
    const instructions = item.instructions || '';
    const fromLabel = (type === 'batch' && item.componentName) ? `<div style="color:${CONFIG.text_muted}; font-size:14px; margin-bottom:6px;">From: ${esc(item.componentName)}</div>` : '';
    instructionsHtml = `
      ${fromLabel}
      ${caption ? `<div style="color:#fff; font-size:20px; font-weight:700; margin-bottom:8px;">${esc(caption)}</div>` : ''}
      ${instructions ? `<div style="color:#fff; font-size:16px; line-height:1.5; white-space:pre-line;">${esc(instructions)}</div>` : `<div style="color:${CONFIG.text_muted}; font-size:16px; font-style:italic;">No instructions for this clip</div>`}
    `;
  } else {
    instructionsHtml = `
      <div style="color:${CONFIG.text_muted}; font-size:16px; text-align:center;">Swipe or tap arrows to continue</div>
    `;
  }

  // Skip controls (Previous / Next or Done)
  let skipControlsHtml = '';
  if (total > 1) {
    const prevBtn = !isFirst
      ? `<button onclick="videoOverlayGoTo(${currentIndex - 1})" style="background:none; border:none; color:${CONFIG.text_muted}; font-size:15px; cursor:pointer; padding:8px 0;">\u2190 Previous</button>`
      : `<div></div>`;
    const nextBtn = !isLast
      ? `<button onclick="videoOverlayGoTo(${currentIndex + 1})" style="background:none; border:none; color:${CONFIG.primary_action_color}; font-size:15px; font-weight:600; cursor:pointer; padding:8px 0;">Next \u2192</button>`
      : `<button onclick="closeVideoOverlay()" style="background:none; border:none; color:${CONFIG.primary_action_color}; font-size:15px; font-weight:600; cursor:pointer; padding:8px 0;">Done</button>`;
    skipControlsHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.08);">
        ${prevBtn}
        ${nextBtn}
      </div>
    `;
  }

  const overlayHtml = `
    <div id="videoFullscreenOverlay" style="position:fixed; top:0; left:0; width:100%; height:100dvh; background:#000; z-index:9999; display:flex; flex-direction:column;">
      <!-- Close button -->
      <button onclick="closeVideoOverlay()" style="position:absolute; top:12px; right:12px; z-index:10001; width:36px; height:36px; background:rgba(0,0,0,0.6); backdrop-filter:blur(8px); border:none; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;">
        <svg width="20" height="20" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>

      <!-- Video area: 75% on desktop, 65% on mobile -->
      <div id="videoOverlayVideoArea" style="flex:0 0 68vh; overflow:hidden; position:relative;">
        ${videoAreaHtml}
      </div>

      <!-- Progress bar segments -->
      ${progressBarHtml}

      <!-- Instructions area -->
      <div style="flex:1; overflow-y:auto; padding:16px; -webkit-overflow-scrolling:touch;">
        ${instructionsHtml}
        ${skipControlsHtml}
      </div>

      <!-- Safe area bottom spacer -->
      <div style="flex-shrink:0; height:env(safe-area-inset-bottom, 0px);"></div>
    </div>
    <style>
      @media (min-width: 768px) {
        #videoOverlayVideoArea { flex: 0 0 78vh !important; }
      }
      @media (max-width: 767px) {
        #videoOverlayVideoArea { flex: 0 0 65vh !important; }
      }
    </style>
  `;

  // Insert or replace the overlay in the DOM
  let existing = document.getElementById('videoFullscreenOverlay');
  if (existing) {
    existing.outerHTML = overlayHtml;
  } else {
    document.body.insertAdjacentHTML('beforeend', overlayHtml);
  }

  // Init swipe gestures on the overlay
  setTimeout(initVideoOverlaySwipe, 50);
}

function initVideoOverlaySwipe() {
  const videoArea = document.getElementById('videoOverlayVideoArea');
  if (!videoArea || !state.videoOverlay || state.videoOverlay.sequence.length <= 1) return;

  // Remove old listeners by replacing element
  const clone = videoArea.cloneNode(true);
  videoArea.parentNode.replaceChild(clone, videoArea);

  let startX = 0, currentX = 0, swiping = false;

  clone.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    currentX = startX;
    swiping = true;
  }, { passive: true });

  clone.addEventListener('touchmove', e => {
    if (!swiping) return;
    currentX = e.touches[0].clientX;
  }, { passive: true });

  clone.addEventListener('touchend', () => {
    if (!swiping) return;
    swiping = false;
    const diff = currentX - startX;
    const threshold = 60;
    const idx = state.videoOverlay.currentIndex;
    const max = state.videoOverlay.sequence.length - 1;
    if (diff < -threshold && idx < max) {
      videoOverlayGoTo(idx + 1);
    } else if (diff > threshold && idx > 0) {
      videoOverlayGoTo(idx - 1);
    }
  });
}

// Keyboard navigation for video overlay (ESC, left/right arrows)
document.addEventListener('keydown', (e) => {
  if (!state.videoOverlay) return;
  if (e.key === 'Escape') {
    closeVideoOverlay();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    videoOverlayGoTo(state.videoOverlay.currentIndex - 1);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    videoOverlayGoTo(state.videoOverlay.currentIndex + 1);
  }
});

// ============================================================
// SECTION 10: RECIPE HELPERS
// ============================================================
function getRecipeById(id) {
  if (!id) return null;
  if (!state.recipes || !Array.isArray(state.recipes)) return null;
  return state.recipes.find(r => r.__backendId === id || r.id === id);
}

function recipeThumb(r) {
  const u = (r?.image_url || '').trim();
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
  return 'https://' + u;
}

function recipeUrl(r) {
  const u = (r?.recipe_url || '').trim();
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return 'https://' + u;
}

function recipeIngList(r) {
  if (!r) return [];
  if (Array.isArray(r.ingredientsRows) && r.ingredientsRows.length) {
    return r.ingredientsRows.map(x => ({ qty: (x.qty || '').trim(), unit: (x.unit || '').trim(), name: (x.name || '').trim(), group: x.group || 'Other' })).filter(x => x.name);
  }
  return [];
}

// ============================================================
// SECTION 10a: PLACEHOLDER GRADIENTS & CAROUSEL SCROLL BUTTONS
// ============================================================

function getPlaceholderGradient(recipe) {
  const name = (recipe && (recipe.name || recipe.title)) || '';
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const gradients = [
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #2d1b3d 0%, #1a1a2e 50%, #16213e 100%)',
    'linear-gradient(135deg, #0f3460 0%, #1a1a2e 50%, #16213e 100%)',
    'linear-gradient(135deg, #1b2838 0%, #203a43 50%, #2c5364 100%)',
    'linear-gradient(135deg, #232526 0%, #414345 50%, #232526 100%)',
    'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    'linear-gradient(135deg, #373b44 0%, #4286f4 100%)',
    'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
  ];
  return gradients[hash % gradients.length];
}

function initCarouselScrollButtons() {
  document.querySelectorAll('.recipe-carousel, .home-carousel, [class*="carousel"]').forEach(carousel => {
    // Skip if already wrapped, is a scroll button, or is not scrollable
    if (carousel.closest('.carousel-wrapper') || carousel.classList.contains('carousel-scroll-btn')) return;
    if (carousel.classList.contains('skeleton-carousel')) return;
    if (carousel.scrollWidth <= carousel.clientWidth) return;

    // Wrap the carousel in a .carousel-wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'carousel-wrapper';
    carousel.parentNode.insertBefore(wrapper, carousel);
    wrapper.appendChild(carousel);

    // Add left/right buttons
    const leftBtn = document.createElement('button');
    leftBtn.className = 'carousel-scroll-btn left';
    leftBtn.innerHTML = '\u2039';
    leftBtn.setAttribute('aria-label', 'Scroll left');

    const rightBtn = document.createElement('button');
    rightBtn.className = 'carousel-scroll-btn right';
    rightBtn.innerHTML = '\u203A';
    rightBtn.setAttribute('aria-label', 'Scroll right');

    wrapper.appendChild(leftBtn);
    wrapper.appendChild(rightBtn);

    // Click handlers — scroll by full visible width
    leftBtn.addEventListener('click', () => {
      const scrollAmount = carousel.clientWidth - 40;
      carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    rightBtn.addEventListener('click', () => {
      const scrollAmount = carousel.clientWidth - 40;
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Hide left button when at the start, hide right when at the end
    function updateButtonVisibility() {
      leftBtn.style.display = carousel.scrollLeft <= 10 ? 'none' : 'flex';
      rightBtn.style.display = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10 ? 'none' : 'flex';
    }

    carousel.addEventListener('scroll', updateButtonVisibility, { passive: true });
    updateButtonVisibility();
  });
}

// ============================================================
// SECTION 10b: CLOUDFLARE STREAM VIDEO HELPERS
// ============================================================
const CLOUDFLARE_STREAM_SUBDOMAIN = 'customer-3z4sk2e6gw4kp3xc.cloudflarestream.com';

function getStreamEmbedUrl(videoId, opts = {}) {
  const { autoplay = false, muted = true, controls = true, loop = true } = opts;
  const poster = encodeURIComponent(`https://${CLOUDFLARE_STREAM_SUBDOMAIN}/${videoId}/thumbnails/thumbnail.jpg?time=&height=600`);
  return `https://${CLOUDFLARE_STREAM_SUBDOMAIN}/${videoId}/iframe?muted=${muted}&preload=true&loop=${loop}&autoplay=${autoplay}&controls=${controls}&poster=${poster}`;
}

function getStreamThumbnail(videoId) {
  return `https://${CLOUDFLARE_STREAM_SUBDOMAIN}/${videoId}/thumbnails/thumbnail.jpg?time=&height=400`;
}

function getStreamHLSUrl(videoId) {
  return `https://${CLOUDFLARE_STREAM_SUBDOMAIN}/${videoId}/manifest/video.m3u8`;
}

function getRecipePreviewVideoId(recipeId) {
  const r = getRecipeById(recipeId);
  if (!r || !Array.isArray(r.videoClips) || r.videoClips.length === 0) return null;
  const sorted = r.videoClips.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  return sorted[0].cloudflareVideoId || null;
}

function getRecipeVideoClips(recipeId) {
  const r = getRecipeById(recipeId);
  if (!r || !Array.isArray(r.videoClips) || r.videoClips.length === 0) return [];

  // Parse recipe instructions into steps for dynamic linking
  const rawInstr = Array.isArray(r.instructions)
    ? r.instructions.join('\n')
    : (r.instructions || '').trim();
  let recipeSteps = [];
  if (rawInstr) {
    const lines = rawInstr.split('\n');
    let currentStep = null;
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (/^\d+[\.\)]\s*/.test(trimmed)) {
        if (currentStep) recipeSteps.push(currentStep);
        currentStep = trimmed.replace(/^\d+[\.\)]\s*/, '');
      } else if (currentStep) {
        currentStep += ' ' + trimmed;
      } else {
        recipeSteps.push(trimmed);
        currentStep = null;
      }
    });
    if (currentStep) recipeSteps.push(currentStep);
  }

  return r.videoClips.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).map(c => {
    // If clip has linkedSteps, dynamically build instructions from current recipe steps
    let instructions = c.instructions || '';
    if (Array.isArray(c.linkedSteps) && c.linkedSteps.length > 0 && recipeSteps.length > 0) {
      const stepsText = c.linkedSteps
        .filter(n => n >= 1 && n <= recipeSteps.length)
        .map(n => `${n}. ${recipeSteps[n - 1]}`)
        .join('\n');
      const notesText = (c.notes || '').trim();
      instructions = stepsText;
      if (notesText) instructions += (instructions ? '\n\n' : '') + notesText;
    }
    return {
      cloudflareVideoId: c.cloudflareVideoId,
      caption: c.caption || '',
      instructions,
      order: c.order
    };
  });
}

function recipeHasVideo(recipeId) {
  const r = getRecipeById(recipeId);
  return r && Array.isArray(r.videoClips) && r.videoClips.length > 0;
}

// Build a Plate: stitch all component videos into one sequence
// Uses custom videoOrder if available, otherwise falls back to component order
// No chapter dividers — component name shown on each clip instead
function getBatchVideoSequence(batch) {
  if (!batch || !batch.components || batch.components.length === 0) return [];

  // If plate has a custom videoOrder, use it
  if (batch.videoOrder && batch.videoOrder.length > 0) {
    const sequence = [];
    batch.videoOrder.forEach(ref => {
      const r = getRecipeById(ref.recipeId);
      if (!r) return;
      const clips = getRecipeVideoClips(ref.recipeId);
      const clip = clips[ref.clipIndex];
      if (!clip) return;
      sequence.push({ type: 'clip', ...clip, componentName: r.title });
    });
    return sequence;
  }

  // Fallback: component order, no dividers
  const sequence = [];
  batch.components.forEach(comp => {
    let compName = comp.name || 'Component';
    let clips = [];
    if (comp.type === 'recipe' && comp.recipeId) {
      const r = getRecipeById(comp.recipeId);
      if (r) {
        compName = r.title;
        clips = getRecipeVideoClips(comp.recipeId);
      }
    }
    if (clips.length === 0) return;
    clips.forEach(clip => {
      sequence.push({ type: 'clip', ...clip, componentName: compName });
    });
  });
  return sequence;
}

let _videoClipsSeeded = false;
function seedTestVideoClips() {
  if (_videoClipsSeeded) return;
  _videoClipsSeeded = true;
  const testVideoId = '68c030875f569b166db2964f7237d7d9';
  const recipes = state.recipes || [];
  const testClipSets = [
    [
      { cloudflareVideoId: testVideoId, caption: 'Prep ingredients', order: 1, instructions: 'Wash and chop all vegetables. Mince the garlic and dice the onions. Measure out your spices and set everything in small bowls for easy access.' },
      { cloudflareVideoId: testVideoId, caption: 'Cook and plate', order: 2, instructions: 'Heat oil in a large skillet over medium-high heat. Add the aromatics first and cook until fragrant, about 30 seconds. Add the main ingredients and cook for 5-7 minutes, stirring occasionally. Plate on a warm dish and garnish.' }
    ],
    [
      { cloudflareVideoId: testVideoId, caption: 'Season and sear', order: 1, instructions: 'Pat the protein dry with paper towels. Season generously with salt and pepper on both sides. Heat a cast iron skillet until smoking. Place skin-side down and don\'t move it for 4 minutes until golden and crispy.' },
      { cloudflareVideoId: testVideoId, caption: 'Make the sauce', order: 2, instructions: 'Remove the protein and set aside. In the same pan, add shallots and deglaze with wine. Reduce by half, then add stock and butter. Swirl until the sauce is glossy and coats the back of a spoon.' },
      { cloudflareVideoId: testVideoId, caption: 'Plate and serve', order: 3, instructions: 'Slice the protein against the grain. Fan slices on the plate. Spoon sauce over the top and around the plate. Add a sprinkle of flaky salt and fresh herbs to finish.' }
    ],
    [
      { cloudflareVideoId: testVideoId, caption: 'Mix the batter', order: 1, instructions: 'Whisk together dry ingredients in a large bowl. In a separate bowl, combine wet ingredients. Make a well in the dry ingredients and pour in the wet mixture. Fold gently — a few lumps are fine. Do not overmix.' },
      { cloudflareVideoId: testVideoId, caption: 'Bake and cool', order: 2, instructions: 'Pour batter into a prepared pan. Bake at 350°F for 25-30 minutes or until a toothpick comes out clean. Let cool in the pan for 10 minutes, then transfer to a wire rack.' }
    ]
  ];
  const testClipSet4 = [
    { cloudflareVideoId: testVideoId, caption: 'Toast the spices', order: 1, instructions: 'Add whole spices to a dry skillet over medium heat. Toast for 1-2 minutes, shaking the pan frequently, until fragrant and slightly darkened. Transfer to a mortar and pestle or spice grinder and grind to a fine powder.' },
    { cloudflareVideoId: testVideoId, caption: 'Build the base', order: 2, instructions: 'Heat oil and sauté onions until deeply golden, about 10 minutes. Add garlic, ginger, and the ground spice blend. Cook for 1 minute until the raw smell disappears. Add tomatoes and simmer for 15 minutes.' }
  ];
  testClipSets.push(testClipSet4);
  let seeded = 0;
  for (let i = 0; i < recipes.length && seeded < 4; i++) {
    const r = recipes[i];
    if (r.isTip) continue;
    if (Array.isArray(r.videoClips) && r.videoClips.length > 0) { seeded++; continue; }
    r.videoClips = testClipSets[seeded];
    seeded++;
  }
}

// ============================================================
// SECTION 10b: BATCH RECIPE (Build a Plate) HELPERS
// ============================================================
function getBatchRecipeById(id) {
  if (!id) return null;
  return (state.batchRecipes || []).find(b => b.id === id);
}

function newBatchRecipeDraft() {
  return {
    id: null,
    name: '',
    coverPhoto: null,
    mealType: 'dinner',
    effort: null,
    components: [],
    createdAt: null
  };
}

function newBatchComponent(type) {
  return {
    id: 'comp_' + Date.now() + '_' + Math.random().toString(36).slice(2),
    type: type, // 'recipe' or 'freeform'
    recipeId: null,
    name: '',
    photo: null,
    ingredients: [],
    instructions: '',
    order: 0,
    notes: '',
    timing: '',
    effort: null
  };
}

function saveBatchRecipe(batch) {
  debugLog('[saveBatchRecipe] Called with batch id:', batch.id, 'name:', batch.name);
  // Ensure state.batchRecipes is always an array
  if (!Array.isArray(state.batchRecipes)) {
    console.warn('[saveBatchRecipe] state.batchRecipes was not an array, resetting to []');
    state.batchRecipes = [];
  }
  if (!batch.id) {
    batch.id = 'batch_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    batch.createdAt = new Date().toISOString();
    debugLog('[saveBatchRecipe] New plate, assigned id:', batch.id);
    state.batchRecipes.push(batch);
  } else {
    const idx = state.batchRecipes.findIndex(b => b.id === batch.id);
    if (idx >= 0) { state.batchRecipes[idx] = batch; debugLog('[saveBatchRecipe] Updated existing at index', idx); }
    else { state.batchRecipes.push(batch); debugLog('[saveBatchRecipe] Appended (id existed but not found in array)'); }
  }
  debugLog('[saveBatchRecipe] state.batchRecipes length:', state.batchRecipes.length);
  try {
    persistState();
    debugLog('[saveBatchRecipe] persistState() succeeded');
  } catch (e) {
    console.error('[saveBatchRecipe] persistState() failed:', e);
    // Try saving just batchRecipes directly as fallback
    try {
      saveToLS('batchRecipes', state.batchRecipes);
      debugLog('[saveBatchRecipe] Fallback saveToLS succeeded');
    } catch (e2) {
      console.error('[saveBatchRecipe] Fallback save also failed:', e2);
      throw e2; // Re-throw so caller knows save failed
    }
  }
  // Sync to Supabase
  syncBatchRecipeToSupabase(batch);
}

async function syncBatchRecipeToSupabase(batch) {
  if (!window.supabaseClient) return;
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session?.user) return;
    await window.supabaseClient
      .from('meal_planner_data')
      .upsert({ id: batch.id, user_id: session.user.id, data: batch }, { onConflict: 'id' });
  } catch (e) { console.error('Sync batch recipe failed:', e); }
}

function getBatchEffortLevel(batch) {
  const order = { lazy: 1, moderate: 2, timely: 3 };
  let highest = null;
  let highestOrder = 0;
  (batch.components || []).forEach(comp => {
    let effort = null;
    if (comp.type === 'recipe' && comp.recipeId) {
      effort = getRecipeEffort(comp.recipeId);
    } else if (comp.type === 'freeform') {
      effort = comp.effort || null;
    }
    if (effort && order[effort] > highestOrder) {
      highest = effort;
      highestOrder = order[effort];
    }
  });
  return highest;
}

function saveFreeformAsRecipe(compId) {
  if (!state.batchForm) return;
  const comp = state.batchForm.components.find(c => c.id === compId);
  if (!comp || comp.type !== 'freeform') return;

  // Create a new recipe from the freeform data
  const newRecipe = {
    id: 'recipe_' + Date.now() + '_' + Math.random().toString(36).slice(2),
    type: 'recipe',
    title: comp.name || 'Untitled Recipe',
    category: capitalize(state.batchForm.mealType || 'Dinner'),
    recipe_url: '',
    image_url: comp.photo || '',
    tags: '',
    notes: '',
    instructions: comp.instructions || '',
    ingredients: (comp.ingredients || []).map(ing => ({ qty: '', unit: '', name: ing.trim(), group: 'Other' })),
    sourceType: 'user',
    isDraft: false,
    isTip: false
  };
  state.recipes.push(newRecipe);

  // Set effort on the new recipe if the freeform had one
  if (comp.effort) {
    setRecipeEffort(newRecipe.id, comp.effort);
  }

  // Convert the component from freeform to recipe
  comp.type = 'recipe';
  comp.recipeId = newRecipe.id;

  try { persistState(); } catch (e) { console.error('Persist error:', e); }
  showToast('Saved as a new recipe!', 'success');
  render();
}

function deleteBatchRecipe(batchId) {
  state.batchRecipes = state.batchRecipes.filter(b => b.id !== batchId);
  persistState();
  // Sync deletion to Supabase
  (async () => {
    if (!window.supabaseClient) return;
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (!session?.user) return;
      await window.supabaseClient.from('meal_planner_data').delete().eq('id', batchId).eq('user_id', session.user.id);
    } catch (e) { console.error('Sync batch delete failed:', e); }
  })();
}

function getBatchRecipeIngredients(batch) {
  const allIngs = [];
  (batch.components || []).forEach(comp => {
    if (comp.type === 'recipe' && comp.recipeId) {
      const r = getRecipeById(comp.recipeId);
      if (r) {
        recipeIngList(r).forEach(ing => {
          allIngs.push({ ...ing, componentName: r.title, componentId: comp.id });
        });
      }
    } else if (comp.type === 'freeform' && comp.ingredients) {
      comp.ingredients.forEach(ingName => {
        if (ingName.trim()) {
          allIngs.push({ qty: '', unit: '', name: ingName.trim(), group: 'Other', componentName: comp.name, componentId: comp.id });
        }
      });
    }
  });
  return allIngs;
}

function getBatchCombinedIngredients(batch) {
  const allIngs = getBatchRecipeIngredients(batch);
  const combined = {};
  allIngs.forEach(ing => {
    const key = normalizeIngredient(ing.name);
    if (!combined[key]) {
      combined[key] = { name: ing.name, qty: ing.qty, unit: ing.unit, group: ing.group, components: [ing.componentName] };
    } else {
      if (!combined[key].components.includes(ing.componentName)) {
        combined[key].components.push(ing.componentName);
      }
      if (ing.qty && combined[key].qty) {
        const a = parseFloat(combined[key].qty) || 0;
        const b = parseFloat(ing.qty) || 0;
        if (a && b && combined[key].unit === ing.unit) {
          combined[key].qty = String(a + b);
        }
      }
    }
  });
  return Object.values(combined);
}

function getBatchTotalTime(batch) {
  let total = 0;
  (batch.components || []).forEach(comp => {
    if (comp.timing) {
      const m = comp.timing.match(/(\d+)\s*min/i);
      if (m) total += parseInt(m[1]);
    }
  });
  return total;
}

function getBatchCoverPhoto(batch) {
  if (batch.coverPhoto) return batch.coverPhoto;
  for (const comp of (batch.components || [])) {
    if (comp.type === 'recipe' && comp.recipeId) {
      const r = getRecipeById(comp.recipeId);
      if (r) { const t = recipeThumb(r); if (t) return t; }
    }
    if (comp.photo) return comp.photo;
  }
  return '';
}

function newRecipeDraft() {
  return { type: 'recipe', title: '', category: 'Breakfast', tipCategory: 'Prep Techniques', recipe_url: '', image_url: '', tags: '', notes: '', instructions: '', ingredientsRows: [{ qty: '', unit: '', name: '', group: 'Produce' }], sourceType: 'user', isDraft: false, isTip: false, videoClips: [] };
}

function ensureRecipeForm() {
  if (!state.recipeForm) state.recipeForm = newRecipeDraft();
  if (!Array.isArray(state.recipeForm.ingredientsRows)) state.recipeForm.ingredientsRows = [];
  if (state.recipeForm.ingredientsRows.length === 0) state.recipeForm.ingredientsRows.push({ qty: '', unit: '', name: '', group: 'Produce' });
}

function setRecipeField(field, value) { ensureRecipeForm(); state.recipeForm[field] = value; }

function handleImageUpload(event) {
  const file = event.target.files[0]; if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showError('Image size must be less than 5MB'); event.target.value = ''; return; }
  if (!file.type.startsWith('image/')) { showError('Please select an image file'); event.target.value = ''; return; }
  const reader = new FileReader();
  reader.onload = (e) => { setRecipeField('image_url', e.target.result); if (typeof render === 'function') render(); showToast('Image uploaded successfully!', 'success'); };
  reader.onerror = () => { showError('Failed to read image file'); event.target.value = ''; };
  reader.readAsDataURL(file);
}

function removeImage() { setRecipeField('image_url', ''); const fi = document.getElementById('imageUploadInput'); if (fi) fi.value = ''; if (typeof render === 'function') render(); }

function addIngRow() { ensureRecipeForm(); state.recipeForm.ingredientsRows.push({ qty: '', unit: '', name: '', group: 'Produce' }); if (typeof render === 'function') render(); }

function showBulkImportModal() {
  openModal(`<div style="color: ${CONFIG.text_color};"><h2 class="text-2xl font-bold mb-4">Bulk Import Ingredients</h2><p class="mb-4">Paste your ingredient list below.</p><textarea id="bulkIngredientInput" class="w-full p-3 border rounded" rows="12" placeholder="Paste ingredients here..." style="font-family: monospace; font-size: 14px;"></textarea><div class="flex gap-2 justify-end mt-4"><button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">Cancel</button><button onclick="processBulkIngredients()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.primary_action_color}; color: white;">Import</button></div></div>`);
}

function processBulkIngredients() {
  const textarea = document.getElementById('bulkIngredientInput'); const text = textarea.value.trim();
  if (!text) { showError('Please paste some ingredients first'); return; }
  const lines = text.split('\n').filter(line => line.trim()); const parsedIngredients = [];
  lines.forEach(line => { const parsed = parseIngredientLine(line); if (parsed.name) parsedIngredients.push(parsed); });
  if (parsedIngredients.length === 0) { showError('No valid ingredients found'); return; }
  ensureRecipeForm(); state.recipeForm.ingredientsRows = parsedIngredients;
  closeModal(); if (typeof render === 'function') render(); showToast(`Imported ${parsedIngredients.length} ingredients!`, 'success');
}

function parseIngredientLine(line) {
  line = line.trim().replace(/^[\u2022\-\*]\s*/, '');
  const units = ['lb','lbs','pound','pounds','oz','ounce','ounces','g','gram','grams','kg','kilogram','kilograms','tsp','teaspoon','teaspoons','tbsp','tablespoon','tablespoons','cup','cups','ml','milliliter','milliliters','l','liter','liters','can','cans','piece','pieces','slice','slices','clove','cloves','inch','inches'];
  const regex = /^([\d\/\.\s]+)?\s*([a-zA-Z\-]+)?\s*(.*)$/;
  const match = line.match(regex);
  if (!match) return { qty: '', unit: '', name: capitalize(line), group: 'Other' };
  let [, quantity, possibleUnit, rest] = match;
  quantity = (quantity || '').trim(); possibleUnit = (possibleUnit || '').trim(); rest = (rest || '').trim();
  let unit = '', name = '';
  if (possibleUnit && units.includes(possibleUnit.toLowerCase())) { unit = possibleUnit.toLowerCase(); name = rest; }
  else if (possibleUnit) { name = rest ? possibleUnit + ' ' + rest : possibleUnit; }
  else { name = rest; }
  const cleanName = name.replace(/\([^)]*\)$/g, '').trim();
  const finalName = cleanName.replace(/,\s*$/, '').trim();
  const group = detectIngredientGroup(finalName);
  return { qty: quantity, unit, name: capitalize(finalName), group };
}

function detectIngredientGroup(name) {
  const nameLower = name.toLowerCase();
  if (nameLower.match(/\b(salt|pepper|spice|cumin|coriander|turmeric|cayenne|paprika|cinnamon|nutmeg|clove|cardamom|bay leaf|bay leaves|thyme|rosemary|oregano|basil|sage|dill|tarragon|chive|mint|parsley|cilantro|masala|garam masala|curry powder|chili powder|red pepper flakes|garlic powder|onion powder|ginger powder|fennel seed|caraway|anise|saffron|vanilla|extract|seasoning)\b/)) return 'Spices & Seasonings';
  if (nameLower.match(/\b(beef|steak|ground beef|chuck|brisket|ribeye|sirloin|tenderloin|filet mignon|t-bone|flank|skirt)\b/)) return 'Beef';
  if (nameLower.match(/\b(chicken|turkey|duck|poultry|breast|thigh|wing|drumstick)\b/)) return 'Poultry';
  if (nameLower.match(/\b(pork|bacon|ham|sausage|prosciutto|pancetta|chorizo)\b/)) return 'Pork';
  if (nameLower.match(/\b(lamb|goat|mutton)\b/)) return 'Lamb & Goat';
  if (nameLower.match(/\b(fish|salmon|tuna|shrimp|prawns?|crab|lobster|seafood|cod|tilapia|halibut|scallops?|clams?|mussels?)\b/)) return 'Seafood';
  if (nameLower.match(/\b(milk|cream|butter|cheese|cheddar|mozzarella|parmesan|feta|yogurt|egg|eggs|sour cream)\b/)) return 'Dairy & Eggs';
  if (nameLower.match(/\b(rice|pasta|noodles?|spaghetti|bread|tortilla|flour|quinoa|oats?|couscous|cereal)\b/)) return 'Grains & Pasta';
  if (nameLower.match(/\b(oil|vinegar|sauce|sugar|honey|syrup|broth|stock|canned|paste|beans?|chickpeas?|coconut|peanut|almonds?|walnuts?)\b/)) return 'Pantry';
  if (nameLower.match(/\b(lettuce|spinach|kale|tomato|onion|garlic|carrot|celery|broccoli|cauliflower|pepper|cucumber|avocado|potato|corn|mushroom|zucchini|squash|eggplant|asparagus|cabbage|apple|banana|orange|lemon|lime|strawberr|blueberr|mango|pineapple|grapes?|peach)\b/)) return 'Produce';
  return 'Other';
}

// ============================================================
// SECTION 11: EXPIRATION & INVENTORY
// ============================================================
function getExpirationDays(itemName, category) {
  const lowerName = itemName.toLowerCase();
  if (state.expirationDefaults[lowerName]) return state.expirationDefaults[lowerName];
  for (const [key, days] of Object.entries(DEFAULT_EXPIRATION_DAYS)) { if (!key.startsWith('_') && lowerName.includes(key)) return days; }
  return DEFAULT_EXPIRATION_DAYS['_' + category] || 7;
}

function suggestExpirationDate(itemName, category, purchaseDate) {
  const days = getExpirationDays(itemName, category);
  const date = new Date(purchaseDate || new Date());
  date.setDate(date.getDate() + days);
  return _localDateStr(date);
}

function getExpiringItems() { return getInventoryItems().filter(item => { const status = getExpirationStatus(item); return status === 'expired' || status === 'expiring-soon'; }); }

function checkExpirationNotifications() {
  const expiringItems = getExpiringItems(); if (expiringItems.length === 0) return;
  const todayCheck = getToday();
  const dismissKey = 'yummy_expiration_dismissed_' + todayCheck;
  if (sessionStorage.getItem(dismissKey) || state.lastNotificationCheck === todayCheck) return;
  state.lastNotificationCheck = todayCheck;
  sessionStorage.setItem(dismissKey, '1');
  const expired = expiringItems.filter(i => getExpirationStatus(i) === 'expired');
  const expiringSoon = expiringItems.filter(i => getExpirationStatus(i) === 'expiring-soon');
  let message = '';
  if (expired.length > 0) message += `${expired.length} item${expired.length > 1 ? 's' : ''} expired! `;
  if (expiringSoon.length > 0) message += `${expiringSoon.length} item${expiringSoon.length > 1 ? 's' : ''} expiring soon.`;
  if (message) showExpirationAlert(message, expiringItems);
  if (state.notificationsEnabled && Notification.permission === 'granted') { new Notification('Meal Planner', { body: message }); }
}

function dismissExpirationAlert() {
  document.getElementById('expirationAlert')?.remove();
  sessionStorage.setItem('yummy_expiration_dismissed_' + getToday(), '1');
}

function showExpirationAlert(message, items) {
  document.getElementById('expirationAlert')?.remove();
  const alertHtml = `<div id="expirationAlert" class="fixed top-16 left-4 right-4 z-50 p-4 rounded-lg shadow-lg" style="background:${CONFIG.danger_color}; max-width:400px; margin:0 auto;"><div class="flex items-start gap-3"><div style="font-size:1.5rem;">&#9888;&#65039;</div><div class="flex-1"><div style="color:white; font-weight:600; margin-bottom:4px;">Items Need Attention</div><div style="color:rgba(255,255,255,0.9); font-size:14px; margin-bottom:8px;">${message}</div><div class="flex gap-2"><button onclick="navigateTo('inventory'); dismissExpirationAlert();" class="px-3 py-1 rounded text-sm" style="background:white; color:${CONFIG.danger_color}; font-weight:500;">View Inventory</button><button onclick="dismissExpirationAlert();" class="px-3 py-1 rounded text-sm" style="background:rgba(255,255,255,0.2); color:white;">Dismiss</button></div></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend', alertHtml);
  setTimeout(() => { document.getElementById('expirationAlert')?.remove(); }, 10000);
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) { showToast('Browser notifications not supported', 'error'); return; }
  const permission = await Notification.requestPermission();
  if (permission === 'granted') { state.notificationsEnabled = true; showToast('Notifications enabled!', 'success'); }
  else { showToast('Notification permission denied', 'error'); }
}

function getExpirationStatus(item) {
  if (item.isFrozen) return 'frozen';
  if (!item.expirationDate) return 'unknown';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const expDate = new Date(item.expirationDate);
  const daysUntil = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return 'expired';
  if (daysUntil <= 2) return 'expiring-soon';
  if (daysUntil <= 5) return 'expiring';
  return 'fresh';
}

function getExpirationColor(status) {
  switch (status) { case 'expired': return CONFIG.danger_color; case 'expiring-soon': return '#f97316'; case 'expiring': return '#eab308'; case 'fresh': return '#22c55e'; case 'frozen': return '#3b82f6'; default: return '#6b7280'; }
}

function getInventoryItems() { return state.inventory || []; }

async function addInventoryItem(item) {
  const purchaseDate = item.purchaseDate || getToday();
  const category = item.category || 'Uncategorized';
  const isFromReceipt = item.fromReceipt || false;
  const inventoryItem = { id: `inventory_${Date.now()}_${Math.random().toString(36).slice(2)}`, name: item.name, quantity: item.quantity || 1, unit: item.unit || '', category, purchaseDate, expirationDate: item.expirationDate || suggestExpirationDate(item.name, category, purchaseDate), price: item.price || null, image_url: item.image_url || null, isFrozen: item.isFrozen || false, fromReceipt: isFromReceipt, expirationVerified: !isFromReceipt };
  await storage.create(inventoryItem);
  trackFrequentItem(item.name, item.category);
  return inventoryItem;
}

async function saveExpirationDefault(itemName, days) {
  const lowerName = itemName.toLowerCase();
  const existingId = `expdefault_${lowerName.replace(/\s+/g, '_')}`;
  const defaultItem = { id: existingId, itemName: lowerName, days };
  try { const existing = state.expirationDefaults[lowerName]; if (existing) await storage.update(defaultItem); else await storage.create(defaultItem); state.expirationDefaults[lowerName] = days; }
  catch (error) { console.error('saveExpirationDefault failed:', error); showError('Failed to save expiration default'); }
}

async function updateInventoryItem(id, updates) {
  const item = state.inventory.find(i => i.id === id); if (!item) return;
  try { const updated = { ...item, ...updates }; await storage.update(updated); } catch (error) { console.error('updateInventoryItem failed:', error); showError('Failed to update item'); }
}

async function deleteInventoryItem(id) {
  const item = state.inventory.find(i => i.id === id); if (!item) return;
  try { await storage.delete(item); showToast('Item removed', 'success'); } catch (error) { console.error('deleteInventoryItem failed:', error); showError('Failed to remove item'); }
}

async function confirmDeleteInventoryItem(id) {
  const item = state.inventory.find(i => i.id === id); if (!item) return;
  if (confirm(`Delete "${item.name}" permanently?`)) await deleteInventoryItem(id);
}

// Receipt functions
function extractItemsFromReceipt(text) {
  const lines = text.split('\n'); const items = []; const seenItems = new Set();
  const skipPatterns = /^(TOTAL|SUBTOTAL|TAX|BALANCE|CHANGE|CASH|CREDIT|DEBIT|VISA|MASTERCARD|THANK|SALE|TRANSACTION|STORE|OPEN|CLOSE|TEL|PHONE|ADDRESS|DATE|TIME|RECEIPT|CUSTOMER|CARD|PAYMENT|APPROVED|SIGNATURE|PIN|VERIFIED|SAVINGS|DISCOUNT|COUPON|MEMBER|LOYALTY|REWARDS)/i;
  for (const line of lines) {
    const trimmed = line.trim(); if (!trimmed || trimmed.length < 5) continue;
    if (skipPatterns.test(trimmed)) continue;
    const priceMatch = trimmed.match(/(\d{1,3}\.\d{2})\s*$/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1]); if (price < 0.25 || price > 50) continue;
      let name = trimmed.slice(0, trimmed.lastIndexOf(priceMatch[1])).trim().replace(/^[\d\s]+/, '').replace(/[|\\\/\[\]{}]+/g, '').replace(/\s+/g, ' ').trim();
      if (name.length < 3 || !/[a-zA-Z]{2,}/.test(name)) continue;
      name = formatItemName(name);
      const key = name.toLowerCase(); if (seenItems.has(key)) continue; seenItems.add(key);
      items.push({ name, rawText: name, price, quantity: 1, category: guessGroceryCategory(name) });
    }
  }
  items.sort((a, b) => b.price - a.price);
  return items.slice(0, 20);
}

function getLearnedMapping(rawText) { return state.receiptMappings[(rawText || '').toLowerCase().trim()] || null; }

function formatItemName(name, rawText = null) {
  const learned = getLearnedMapping(rawText || name); if (learned) return learned.name || learned;
  for (const mapping of ITEM_MAPPINGS) { for (const pattern of mapping.patterns) { if (pattern.test(name)) return mapping.name; } }
  return name.toLowerCase().replace(/\b(bnls|sknls|skns|nat|natl|r-|wt|t\b)\b/gi, '').replace(/\borg\b/gi, 'Organic').replace(/\blb\b/gi, '').replace(/\boz\b/gi, '').replace(/\s+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase());
}

function findMatchingIngredient(itemName) {
  if (!itemName) return null; const name = itemName.toLowerCase().trim();
  for (const knowledge of state.ingredientKnowledge) { const ingName = knowledge.name.toLowerCase(); if (name.includes(ingName) || ingName.includes(name)) return knowledge; }
  for (const key of Object.keys(INGREDIENT_IMAGES)) { if (name.includes(key) || key.includes(name)) { return getIngredientKnowledge(key) || { name: key, category: 'Other' }; } }
  return null;
}

async function saveReceiptMapping(rawText, cleanName, category, ingredientId = null) {
  const normalizedRaw = rawText.toLowerCase().trim();
  const mapping = { id: `mapping_${normalizedRaw.replace(/[^a-z0-9]/g, '_')}`, type: 'receipt_mapping', rawText: normalizedRaw, correctedName: cleanName, category, ingredientId, updatedAt: new Date().toISOString() };
  try { state.receiptMappings[normalizedRaw] = { name: cleanName, category, ingredientId }; await storage.create(mapping); } catch (error) { console.error('saveReceiptMapping failed:', error); }
}

// Receipt scan state
let receiptScanState = { isScanning: false, imageUrl: null, extractedText: '', extractedItems: [], claudeResult: null, detectedTotal: null, store: null, receiptDate: null, showModal: false };

function closeReceiptModal() { receiptScanState = { isScanning: false, imageUrl: null, extractedText: '', extractedItems: [], claudeResult: null, detectedTotal: null, store: null, receiptDate: null, showModal: false }; if (typeof render === 'function') render(); }
function showReceiptModal() { receiptScanState = { isScanning: false, imageUrl: null, extractedItems: [], claudeResult: null, detectedTotal: null, store: null, receiptDate: null, showModal: true }; if (typeof render === 'function') render(); }

async function handleReceiptUpload(event) {
  const file = event.target.files[0]; if (!file) return;
  receiptScanState.isScanning = true; receiptScanState.showModal = true; receiptScanState.extractedText = ''; receiptScanState.detectedTotal = null;
  if (typeof render === 'function') render();
  try {
    showToast('Compressing photo...', 'info');
    const compressedFile = await compressImage(file, 1200, 0.8);
    showToast('Processing receipt...', 'info');
    const imageUrl = await uploadPhoto(compressedFile);
    if (!imageUrl) { receiptScanState.isScanning = false; if (typeof render === 'function') render(); return; }
    receiptScanState.imageUrl = imageUrl; if (typeof render === 'function') render();
    showToast('Reading receipt...', 'info');
    const result = await Tesseract.recognize(imageUrl, 'eng', { logger: m => { if (m.status === 'recognizing text') { const pct = Math.round(m.progress * 100); document.getElementById('ocrProgress')?.style.setProperty('width', pct + '%'); } } });
    receiptScanState.extractedText = result.data.text;
    receiptScanState.detectedTotal = extractTotalFromReceipt(result.data.text);
    receiptScanState.isScanning = false;
    showToast('Receipt scanned!', 'success');
    if (typeof render === 'function') render();
  } catch (e) { console.error('Receipt scan error:', e); showError('Failed to scan receipt'); receiptScanState.isScanning = false; if (typeof render === 'function') render(); }
  event.target.value = '';
}

function extractTotalFromReceipt(text) {
  const dollarAmounts = text.match(/\$\s*(\d{1,3}(?:,?\d{3})*\.\d{2})/g) || [];
  const parsedDollarAmounts = dollarAmounts.map(a => parseFloat(a.replace(/[$,\s]/g, ''))).filter(n => n > 0 && n < 5000);
  const patterns = [ /total[:\s]*\$?\s*(\d{1,3}(?:,?\d{3})*\.?\d{0,2})/i, /grand\s*total[:\s]*\$?\s*(\d{1,3}(?:,?\d{3})*\.?\d{0,2})/i, /amount\s*due[:\s]*\$?\s*(\d{1,3}(?:,?\d{3})*\.?\d{0,2})/i, /balance\s*due[:\s]*\$?\s*(\d{1,3}(?:,?\d{3})*\.?\d{0,2})/i, /you\s*paid[:\s]*\$?\s*(\d{1,3}(?:,?\d{3})*\.?\d{0,2})/i ];
  for (const pattern of patterns) { const match = text.match(pattern); if (match && match[1]) { const amount = parseFloat(match[1].replace(/,/g, '')); if (amount > 0 && amount < 5000) return amount; } }
  if (parsedDollarAmounts.length > 0) { const inRange = parsedDollarAmounts.filter(a => a >= 20 && a <= 500); if (inRange.length > 0) return Math.max(...inRange); return Math.max(...parsedDollarAmounts); }
  return null;
}

// Claude receipt scanner functions
async function scanReceiptWithClaude(imageBase64) {
  const systemPrompt = `You are a receipt scanning assistant. Analyze the receipt image and extract all items. Respond in JSON: { "store": "...", "date": "YYYY-MM-DD", "total": 45.67, "items": [{ "name": "...", "rawText": "...", "price": 3.99, "quantity": 1, "category": "...", "daysUntilExpiration": 3 }] }`;
  try {
    const response = await fetch(CHEF_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ systemPrompt, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } }, { type: 'text', text: 'Please scan this receipt and extract all the information.' }] }] }) });
    if (!response.ok) throw new Error('Failed to analyze receipt');
    const data = await response.json(); const content = data.response || data.content?.[0]?.text || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/); if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Could not parse receipt data');
  } catch (error) { console.error('Claude receipt scan error:', error); throw error; }
}

async function handleClaudeReceiptUpload(event) {
  const file = event.target.files[0]; if (!file) return;
  receiptScanState.isScanning = true; receiptScanState.showModal = true; receiptScanState.extractedItems = []; receiptScanState.claudeResult = null;
  if (typeof render === 'function') render();
  try {
    showToast('Processing receipt...', 'info');
    const compressedFile = await compressImage(file, 1200, 0.8);
    const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = (e) => resolve(e.target.result.split(',')[1]); reader.onerror = () => reject(new Error('Failed to read file')); reader.readAsDataURL(compressedFile); });
    uploadPhoto(compressedFile).then(url => { receiptScanState.imageUrl = url; if (typeof render === 'function') render(); }).catch(() => {});
    showToast('AI is reading your receipt...', 'info');
    const result = await Promise.race([ scanReceiptWithClaude(base64), new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 60000)) ]);
    receiptScanState.claudeResult = result;
    const items = (result.items || []).map(item => { const rawText = (item.rawText || item.name || '').toLowerCase().trim(); const savedMapping = state.receiptMappings[rawText]; if (savedMapping) return { ...item, name: savedMapping.name, category: savedMapping.category, rawText: item.rawText || item.name, isRemembered: true }; const matched = findMatchingIngredient(item.name); if (matched) return { ...item, rawText: item.rawText || item.name, linkedIngredient: matched.name }; return { ...item, rawText: item.rawText || item.name, isNew: true }; });
    receiptScanState.extractedItems = items; receiptScanState.detectedTotal = result.total; receiptScanState.store = result.store; receiptScanState.receiptDate = result.date; receiptScanState.isScanning = false;
    showToast(`Found ${result.items?.length || 0} items!`, 'success'); if (typeof render === 'function') render();
  } catch (e) { console.error('Claude receipt scan error:', e); showError('Failed to scan receipt'); receiptScanState.isScanning = false; if (typeof render === 'function') render(); }
  event.target.value = '';
}

function renderClaudeReceiptModal() { if (!receiptScanState.showModal) return ''; return '<!-- Claude receipt modal rendered by page -->'; }
function renderReceiptModal() { if (!receiptScanState.showModal) return ''; return '<!-- Receipt modal rendered by page -->'; }

async function addReceiptItemsToInventory() {
  const items = receiptScanState.extractedItems || []; const itemsToAdd = [];
  const purchaseDate = receiptScanState.receiptDate || getToday();
  const purchaseDateObj = new Date(purchaseDate + 'T00:00:00');
  for (let i = 0; i < items.length; i++) {
    const checkbox = document.getElementById(`receiptItem${i}`); if (!checkbox?.checked) continue;
    const item = items[i]; const quantity = item.quantity || 1; const pricePerItem = (item.price || 0) / quantity;
    let expirationDate = null;
    if (item.daysUntilExpiration) { const expDate = new Date(purchaseDateObj); expDate.setDate(expDate.getDate() + item.daysUntilExpiration); expirationDate = _localDateStr(expDate); }
    for (let q = 0; q < quantity; q++) { itemsToAdd.push({ id: `inventory_${Date.now()}_${i}_${q}_${Math.random().toString(36).slice(2)}`, type: 'inventory', name: item.name, category: item.category || 'Other', quantity: 1, unit: '', purchasePrice: pricePerItem, purchaseDate, expirationDate, store: receiptScanState.store || '', image_url: getIngredientImage(item.name, item.category) || '', fromReceipt: true, expirationVerified: false }); }
  }
  showToast(`Adding ${itemsToAdd.length} items...`, 'info');
  for (const inventoryItem of itemsToAdd) { try { await storage.create(inventoryItem); state.inventory.push(inventoryItem); } catch (e) { console.error('Failed to add item:', e); } }
  showToast(`Added ${itemsToAdd.length} items to pantry!`, 'success'); closeReceiptModal(); if (typeof render === 'function') render();
}


function editReceiptItem(idx) { /* Complex modal - rendered by page JS */ }
function closeReceiptItemEdit() { document.getElementById('receiptItemEditOverlay')?.remove(); }
async function saveReceiptItemEdit(idx) { /* Handled by page JS */ }
function editReceiptDetails() { /* Rendered by page JS */ }
function closeReceiptDetailsEdit() { document.getElementById('receiptDetailsEditOverlay')?.remove(); }
function saveReceiptDetailsEdit() { /* Handled by page JS */ }
function renderReceiptScannerModal() {
  if (!state.receiptScannerOpen) return '';

  const hasPhoto = !!state.receiptPhoto;
  const isLoading = state.receiptLoading;
  const analysis = state.receiptAnalysis;

  let content = '';
  if (!hasPhoto) {
    content = `
      <div class="receipt-capture">
        <div class="capture-area" onclick="captureReceipt()">
          <span class="capture-icon">📷</span>
          <span class="capture-text">Take photo of receipt</span>
        </div>
        <p class="capture-hint">Make sure the total is visible</p>
      </div>`;
  } else if (isLoading) {
    content = `
      <div class="receipt-loading">
        <div class="receipt-spinner"></div>
        <p>Analyzing receipt...</p>
      </div>`;
  } else if (analysis) {
    content = `
      <div class="receipt-results">
        <div class="receipt-preview">
          <img src="${state.receiptPhoto}" alt="Receipt" />
        </div>
        <div class="receipt-details">
          ${analysis.store ? `
            <div class="receipt-detail-row">
              <span class="receipt-detail-label">Store</span>
              <span class="receipt-detail-value">${analysis.store}</span>
            </div>
          ` : ''}
          <div class="receipt-detail-row total">
            <span class="receipt-detail-label">Total</span>
            <input type="number" id="receiptTotal" value="${analysis.total || ''}" step="0.01" />
          </div>
          ${analysis.items && analysis.items.length > 0 ? `
            <div class="receipt-items">
              <span class="items-label">${analysis.items.length} items detected</span>
              <div class="items-list">
                ${analysis.items.slice(0, 5).map(item => `
                  <span class="item-tag">${item}</span>
                `).join('')}
                ${analysis.items.length > 5 ? `<span class="item-more">+${analysis.items.length - 5} more</span>` : ''}
              </div>
            </div>
          ` : ''}
          <div class="receipt-detail-row">
            <span class="receipt-detail-label">Category</span>
            <select id="receiptCategory">
              <option value="grocery" ${analysis.category === 'grocery' ? 'selected' : ''}>🛒 Grocery</option>
              <option value="takeout" ${analysis.category === 'takeout' ? 'selected' : ''}>🥡 Takeout</option>
              <option value="coffee" ${analysis.category === 'coffee' ? 'selected' : ''}>☕ Coffee</option>
              <option value="other" ${analysis.category === 'other' ? 'selected' : ''}>📝 Other</option>
            </select>
          </div>
        </div>
        <button class="receipt-btn-primary" onclick="saveReceiptExpense()">Add Expense</button>
        <button class="receipt-btn-secondary" onclick="retakeReceipt()">Retake Photo</button>
      </div>`;
  } else {
    content = `
      <div class="receipt-preview">
        <img src="${state.receiptPhoto}" alt="Receipt" />
        <button class="receipt-btn-primary" onclick="analyzeReceipt()" style="margin-top: 12px;">Analyze Receipt</button>
      </div>`;
  }

  return `
    <div class="receipt-modal-overlay" onclick="closeReceiptScanner()">
      <div class="receipt-modal" onclick="event.stopPropagation()">
        <h3>Scan Receipt</h3>
        ${content}
        <button class="receipt-btn-cancel" onclick="closeReceiptScanner()">Cancel</button>
      </div>
    </div>`;
}

async function saveReceiptExpense() {
  const amountInput = document.getElementById('receiptAmount'); const noteInput = document.getElementById('receiptNote');
  const amount = parseFloat(amountInput?.value); const note = noteInput?.value || '';
  if (!amount || amount <= 0) { showError('Please enter a valid amount'); return; }
  state.isLoading = true;
  const itemCheckboxes = document.querySelectorAll('[id^="receiptItem_"]:checked');
  const itemsToAdd = Array.from(itemCheckboxes).map(cb => ({ name: cb.dataset.name, price: parseFloat(cb.dataset.price), category: cb.dataset.category, fromReceipt: true }));
  closeReceiptModal(); if (typeof render === 'function') render();
  try {
    const expense = { id: `expense_${Date.now()}_${Math.random().toString(36).slice(2)}`, type: 'grocery', amount, date: getToday(), note, receipt_url: receiptScanState.imageUrl };
    await storage.create(expense);
    for (const item of itemsToAdd) { await addInventoryItem(item); }
    showToast(`Grocery expense logged!${itemsToAdd.length > 0 ? ` + ${itemsToAdd.length} items added` : ''}`, 'success');
  } catch (e) { console.error(e); showError('Failed to save expense'); } finally { state.isLoading = false; if (typeof render === 'function') render(); }
}

// ============================================================
// SECTION 12: DATE HELPERS
// ============================================================
function freshMealSlot() { return { status: 'none', plannedRecipeId: null, selectedAt: null, actualType: null, actualRecipeId: null, takeoutInfo: null, remixInfo: null, photoUrl: null, loggedAt: null }; }
function _localDateStr(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function getToday() { return _localDateStr(new Date()); }
function isToday(dateStr) { return dateStr === getToday(); }
function isPastDate(dateStr) { return dateStr < getToday(); }
function isFutureDate(dateStr) { return dateStr > getToday(); }
function getYesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return _localDateStr(d); }
function getTomorrow() { const d = new Date(); d.setDate(d.getDate() + 1); return _localDateStr(d); }

function getDayData(dateStr) {
  if (!state.mealDays[dateStr]) { state.mealDays[dateStr] = { date: dateStr, meals: { breakfast: freshMealSlot(), lunch: freshMealSlot(), dinner: freshMealSlot(), snacks: [] } }; }
  return state.mealDays[dateStr];
}

function getDateLabel(dateStr) {
  if (dateStr === getToday()) return 'Today';
  if (dateStr === getYesterday()) return 'Yesterday';
  if (dateStr === getTomorrow()) return 'Tomorrow';
  return formatDateShort(dateStr);
}

function formatDateShort(dateStr) { const d = new Date(dateStr + 'T12:00:00'); return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }
function formatDateFull(dateStr) { const d = new Date(dateStr + 'T12:00:00'); return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); }
function formatMonthYear(date) { return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); }

function hasMealsOnDate(dateStr) {
  const dayData = state.mealDays[dateStr]; if (!dayData) return false;
  return Object.values(dayData.meals).some(meal => meal && typeof meal === 'object' && !Array.isArray(meal) && (meal.status === 'selected' || meal.status === 'pending' || meal.status === 'logged'));
}

function generateCalendarWeeks(date) {
  const year = date.getFullYear(); const month = date.getMonth();
  const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0);
  const weeks = []; let currentWeek = [];
  for (let i = 0; i < firstDay.getDay(); i++) currentWeek.push(null);
  for (let day = 1; day <= lastDay.getDate(); day++) { currentWeek.push(new Date(year, month, day)); if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; } }
  if (currentWeek.length > 0) { while (currentWeek.length < 7) currentWeek.push(null); weeks.push(currentWeek); }
  return weeks;
}

function ensureTodayDateCurrent() { getDayData(getToday()); state.todaySwipeMealSlot = null; }

function checkMealAutoTransitions() {
  ensureTodayDateCurrent(); const todayDate = getToday(); const todayDay = getDayData(todayDate);
  const hour = new Date().getHours(); const transitions = { breakfast: 10, lunch: 14, dinner: 21 }; let changed = false;
  for (const [meal, cutoffHour] of Object.entries(transitions)) { const slot = todayDay.meals[meal]; if (slot.status === 'selected' && hour >= cutoffHour) { slot.status = 'pending'; changed = true; } }
  if (changed) saveMealDay(todayDate); return changed;
}

// ============================================================
// SECTION 13: TIMER FUNCTIONS
// ============================================================
let activeAlarms = [];

function playTimerSound(timerId) {
  const audioCtx = window._timerAudioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume();
  function playBeeps() { [0, 0.2, 0.4].forEach(delay => { try { const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination); osc.frequency.value = 880; osc.type = 'sine'; gain.gain.setValueAtTime(0.5, audioCtx.currentTime + delay); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.15); osc.start(audioCtx.currentTime + delay); osc.stop(audioCtx.currentTime + delay + 0.15); } catch(e) {} }); }
  playBeeps(); const interval = setInterval(playBeeps, 1000);
  activeAlarms.push({ id: timerId, interval, audioCtx });
}

function stopTimerSound(timerId) {
  if (timerId) { const alarm = activeAlarms.find(a => a.id === timerId); if (alarm) { clearInterval(alarm.interval); activeAlarms = activeAlarms.filter(a => a.id !== timerId); } }
  else { activeAlarms.forEach(alarm => clearInterval(alarm.interval)); activeAlarms = []; }
}

function startTimer(minutes, label = 'Timer') {
  const timer = { id: `timer_${Date.now()}`, label, duration: minutes * 60, remaining: minutes * 60, startedAt: Date.now(), interval: null };
  timer.interval = setInterval(() => { timer.remaining = Math.max(0, timer.duration - Math.floor((Date.now() - timer.startedAt) / 1000)); renderTimerWidget(); if (timer.remaining <= 0) { clearInterval(timer.interval); timerFinished(timer); } }, 1000);
  state.activeTimers.push(timer); renderTimerWidget(); showToast(`Timer started: ${label} (${minutes} min)`, 'success');
}

function startTimerSeconds(totalSeconds, label = 'Timer') {
  try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const osc = ctx.createOscillator(); osc.connect(ctx.destination); osc.start(); osc.stop(); window._timerAudioCtx = ctx; } catch(e) {}
  const timer = { id: `timer_${Date.now()}`, label, duration: totalSeconds, remaining: totalSeconds, startedAt: Date.now(), interval: null };
  timer.interval = setInterval(() => { timer.remaining = Math.max(0, timer.duration - Math.floor((Date.now() - timer.startedAt) / 1000)); renderTimerWidget(); if (timer.remaining <= 0) { clearInterval(timer.interval); timerFinished(timer); } }, 1000);
  state.activeTimers.push(timer); renderTimerWidget();
  const mins = Math.floor(totalSeconds / 60); const secs = totalSeconds % 60;
  showToast(`Timer started: ${label} (${mins > 0 ? mins + 'm ' : ''}${secs}s)`, 'success');
}

function stopTimer(timerId) { const timer = state.activeTimers.find(t => t.id === timerId); if (timer?.interval) clearInterval(timer.interval); state.activeTimers = state.activeTimers.filter(t => t.id !== timerId); renderTimerWidget(); }

function timerFinished(timer) {
  try { playTimerSound(timer.id); } catch (e) {}
  if (Notification.permission === 'granted') { new Notification('Timer Done!', { body: timer.label }); }
  if (!state.finishedTimers) state.finishedTimers = [];
  state.finishedTimers.push(timer);
  state.activeTimers = state.activeTimers.filter(t => t.id !== timer.id);
  renderAlarmWidget();
}

function renderAlarmWidget() {
  document.getElementById('alarmWidget')?.remove();
  if (!state.finishedTimers || state.finishedTimers.length === 0) { renderTimerWidget(); return; }
  const widgetHtml = `<div id="alarmWidget" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.8);"><div class="rounded-xl p-6 text-center" style="background:${CONFIG.surface_color}; max-width:90%; width:350px;"><div style="font-size:4rem; margin-bottom:1rem;">&#9200;</div><h2 style="color:${CONFIG.text_color}; font-size:1.5rem; font-weight:bold; margin-bottom:1rem;">${state.finishedTimers.length === 1 ? 'Timer Done!' : state.finishedTimers.length + ' Timers Done!'}</h2><div class="space-y-2 mb-4">${state.finishedTimers.map(timer => `<div class="flex items-center justify-between p-2 rounded" style="background:rgba(255,255,255,0.1);"><span style="color:${CONFIG.text_color};">${esc(timer.label)}</span><button onclick="dismissSingleAlarm('${timer.id}')" class="px-3 py-1 rounded" style="background:${CONFIG.danger_color}; color:white; font-size:0.9rem;">Stop</button></div>`).join('')}</div>${state.finishedTimers.length > 1 ? `<button onclick="dismissAllAlarms()" class="w-full px-6 py-3 rounded-lg font-bold" style="background:${CONFIG.danger_color}; color:white; font-size:1.1rem;">Stop All Alarms</button>` : ''}</div></div>`;
  document.body.insertAdjacentHTML('beforeend', widgetHtml);
}

function dismissSingleAlarm(timerId) { stopTimerSound(timerId); state.finishedTimers = state.finishedTimers.filter(t => t.id !== timerId); renderAlarmWidget(); if (state.finishedTimers.length === 0) showToast('Alarm dismissed', 'success'); }
function dismissAllAlarms() { stopTimerSound(); state.finishedTimers = []; renderAlarmWidget(); showToast('All alarms dismissed', 'success'); }

function formatTime(seconds) { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins}:${secs.toString().padStart(2, '0')}`; }

function renderTimerWidget() {
  document.getElementById('timerWidget')?.remove();
  if (state.activeTimers.length === 0) return;
  const widgetHtml = `<div id="timerWidget" class="fixed top-20 right-4 z-40 rounded-lg shadow-lg p-3" style="background:${CONFIG.surface_color}; min-width:150px;"><div style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.8}px; font-weight:600; margin-bottom:8px;">&#9200; Timers</div>${state.activeTimers.map(timer => `<div class="flex items-center justify-between gap-2 mb-2"><div><div style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.85}px;">${esc(timer.label)}</div><div style="color:${timer.remaining < 60 ? CONFIG.danger_color : CONFIG.primary_action_color}; font-size:${CONFIG.font_size * 1.2}px; font-weight:bold;">${formatTime(timer.remaining)}</div></div><button onclick="stopTimer('${timer.id}')" class="px-2 py-1 rounded text-xs" style="background:${CONFIG.danger_color}; color:white;">&#10005;</button></div>`).join('')}</div>`;
  document.body.insertAdjacentHTML('beforeend', widgetHtml);
}

function showTimerModal() {
  openModal(`<div style="color: ${CONFIG.text_color};"><h2 class="text-2xl font-bold mb-4">Set Timer</h2><div class="mb-4"><label class="block mb-2 font-semibold">Timer Label:</label><input type="text" id="timerLabel" value="Cooking Timer" class="w-full px-3 py-2 border rounded" /></div><div class="mb-4 flex gap-4"><div class="flex-1"><label class="block mb-2 font-semibold">Minutes:</label><input type="number" id="timerMinutes" value="0" min="0" max="180" class="w-full px-3 py-2 border rounded" /></div><div class="flex-1"><label class="block mb-2 font-semibold">Seconds:</label><input type="number" id="timerSeconds" value="30" min="0" max="59" class="w-full px-3 py-2 border rounded" /></div></div><div class="mb-4"><label class="block mb-2 font-semibold text-sm" style="color: ${CONFIG.text_muted};">Quick presets:</label><div class="flex flex-wrap gap-2">${[1,5,10,15,20,30,45,60].map(m => `<button type="button" onclick="document.getElementById('timerMinutes').value=${m}" class="px-3 py-1 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">${m} min</button>`).join('')}</div></div><div class="flex gap-2 justify-end"><button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">Cancel</button><button onclick="startTimerFromModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.success_color}; color: white;">Start Timer</button></div></div>`);
}

function startTimerFromModal() {
  const label = document.getElementById('timerLabel')?.value || 'Timer';
  const minutes = parseInt(document.getElementById('timerMinutes')?.value) || 0;
  const seconds = parseInt(document.getElementById('timerSeconds')?.value) || 0;
  const totalSeconds = (minutes * 60) + seconds;
  if (totalSeconds < 1) { showError('Please set at least 1 second'); return; }
  closeModal(); startTimerSeconds(totalSeconds, label);
}

// ============================================================
// SECTION 14: FREQUENT ITEMS
// ============================================================
async function trackFrequentItem(itemName, category) {
  const key = itemName.toLowerCase().trim();
  const id = `frequent_${key.replace(/[^a-z0-9]/g, '_').slice(0, 50)}`;
  const existing = state.frequentItems.find(f => f.id === id);
  if (existing) { existing.count = (existing.count || 1) + 1; existing.lastUsed = new Date().toISOString(); await storage.update(existing); }
  else { const newItem = { id, name: itemName, category: category || 'Other', count: 1, lastUsed: new Date().toISOString() }; await storage.create(newItem); state.frequentItems.push(newItem); }
}

function getFrequentItems(limit = 10) { return [...state.frequentItems].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, limit); }

function formatChefMessage(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/__(.+?)__/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/_(.+?)_/g, '<em>$1</em>').replace(/^(\d+)\.\s+(.+)$/gm, '<div style="margin-left:1rem;">$1. $2</div>').replace(/^[-\u2022]\s+(.+)$/gm, '<div style="margin-left:1rem;">\u2022 $1</div>').replace(/\n/g, '<br>');
}

// ============================================================
// SECTION 16: INGREDIENT KNOWLEDGE
// ============================================================
function getIngredientKnowledge(ingredientName) {
  const name = ingredientName.toLowerCase().trim();
  return state.ingredientKnowledge.find(k => k.name.toLowerCase() === name);
}

function createDefaultIngredientKnowledge(name) {
  return { id: `ingredient_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, type: 'ingredient_knowledge', name, category: 'Other', season: 'Year-round', storage: { location: 'Fridge', duration: '' }, freezable: null, freezingInfo: { blanch: '', duration: '', instructions: '' }, cookingMethods: [], techniques: [], pairings: [], notes: [], createdAt: new Date().toISOString() };
}

async function saveIngredientKnowledge(knowledge) {
  try {
    const existing = state.ingredientKnowledge.find(k => k.id === knowledge.id);
    if (existing) { Object.assign(existing, knowledge); await storage.update(knowledge); }
    else { state.ingredientKnowledge.push(knowledge); await storage.create(knowledge); }
  } catch (error) { console.error('saveIngredientKnowledge failed:', error); showError('Failed to save ingredient data'); }
}

// Syncing functions
async function syncAllIngredientImages() {
  if (!confirm('Add all preset ingredients to your library?')) return;
  closeModal(); state.isLoading = true; if (typeof render === 'function') render();
  showToast('Syncing ingredients...', 'info');
  try { const count = await syncIngredientImagesToKnowledge(); if (count > 0) showToast(`Added ${count} ingredients!`, 'success'); else showToast('All ingredients already in library', 'info'); }
  catch (error) { console.error('Sync error:', error); showError('Failed to sync ingredients'); }
  finally { state.isLoading = false; if (typeof render === 'function') render(); }
}

async function syncIngredientImagesToKnowledge() {
  const allImages = { ...INGREDIENT_IMAGES, ...customIngredientImages }; let addedCount = 0;
  const existingNames = new Set((state.ingredientKnowledge || []).map(k => k.name.toLowerCase()));
  const deletedNames = new Set(state.deletedIngredients || []);
  for (const [name, imageUrl] of Object.entries(allImages)) {
    const normalizedName = name.toLowerCase();
    if (existingNames.has(normalizedName) || deletedNames.has(normalizedName)) continue;
    const knowledge = { id: `ingredient_${Date.now()}_${Math.random().toString(36).slice(2)}`, type: 'ingredient_knowledge', name: normalizedName, category: guessIngredientCategory(normalizedName), season: 'Year-round', image_url: imageUrl, storage: { location: 'Fridge', duration: '' }, freezable: null, freezingInfo: { blanch: '', duration: '', instructions: '' }, cookingMethods: [], techniques: [], pairings: [], notes: [], createdAt: new Date().toISOString() };
    state.ingredientKnowledge.push(knowledge); await storage.create(knowledge); addedCount++;
    if (addedCount % 10 === 0) await new Promise(resolve => setTimeout(resolve, 100));
  }
  return addedCount;
}

function showIngredientImagesManager() { /* Complex modal - rendered by page JS if needed */ openModal(`<div style="color:${CONFIG.text_color};"><h2>Ingredient Images Manager</h2><p>This feature is available from the Kitchen page.</p><button onclick="closeModal()" class="px-4 py-2 rounded" style="background:${CONFIG.surface_elevated}; color:${CONFIG.text_color}; margin-top:12px;">Close</button></div>`); }
function addCustomIngredientImage() { const name = document.getElementById('newIngredientName')?.value.trim().toLowerCase(); const url = document.getElementById('newIngredientUrl')?.value.trim(); if (!name) { showError('Please enter an ingredient name'); return; } if (!url) { showError('Please enter an image URL'); return; } customIngredientImages[name] = url; saveCustomIngredientImages(); showToast(`Image added for "${name}"`, 'success'); }
function editIngredientImage(name) { /* Rendered by page JS */ }
function saveEditedIngredientImage(name) { const url = document.getElementById('editIngredientUrl')?.value.trim(); if (!url) { showError('Please enter an image URL'); return; } customIngredientImages[name] = url; saveCustomIngredientImages(); showToast(`Image updated`, 'success'); }
function deleteIngredientImage(name) { if (customIngredientImages[name]) { delete customIngredientImages[name]; saveCustomIngredientImages(); showToast(`Custom image removed`, 'success'); } }


// ============================================================
// SECTION 18: NAVIGATION
// ============================================================
function navigateTo(view) {
  if (view === 'swipe' || view === 'swipe-setup' || view === 'swipe-confirm') view = 'home';
  if (view === 'my-meals') view = 'home';
  if (view === 'grocery') view = 'grocery-list';
  if (view === 'pantry') view = 'inventory';
  if (view === 'my-plates' || view === 'cooking-journal') { view = 'saved'; }
  if (view === 'plates-page') { view = 'recipes'; }

  const pageMap = {
    'home': '/index.html', 'food-log-detail': '/index.html',
    'my-meals': '/index.html',
    'recipes': '/recipes.html', 'my-picks': '/my-picks.html', 'recipe-view': '/recipes.html', 'recipe-edit': '/recipes.html', 'freestyle-edit': '/recipes.html', 'batch-edit': '/recipes.html', 'batch-view': '/recipes.html',
    'kitchen': '/kitchen.html', 'inventory': '/kitchen.html', 'ingredients': '/kitchen.html', 'ingredient-detail': '/kitchen.html',
    'kitchen-detail': '/kitchen-detail.html', 'kitchen-ingredient-meals': '/kitchen-detail.html',
    'recipe-detail': '/recipe-detail.html',
    'grocery-list': '/grocery.html', 'grocery-select-meals': '/grocery.html', 'grocery-ingredients': '/grocery.html',
    'saved': '/saved.html',
    'components': '/components.html', 'component-detail': '/components.html', 'build-plate': '/components.html', 'cook-mode': '/components.html', 'combos': '/components.html'
  };

  const targetPage = pageMap[view] || '/index.html';
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const targetFile = targetPage.split('/').pop();

  if (targetFile !== currentPage) {
    sessionStorage.setItem('yummy_target_view', view);
    window.location.href = targetPage;
  } else {
    // Save scroll position
    const app = document.getElementById('app');
    if (app && state.currentView) state.scrollPositions[state.currentView] = app.scrollTop;
    // Clear viewing flags
    if (view !== 'recipe-view') { state.viewingFromPlan = null; state.viewingFromStats = false; state.viewingFromTips = false; state.viewingFromMealOptions = false; state.viewingFromSwipe = false; state.viewingFromKitchen = false; }
    state.currentView = view;
    if (document.startViewTransition && typeof render === 'function') {
      document.startViewTransition(() => {
        render();
        setTimeout(() => { const app = document.getElementById('app'); if (app && state.scrollPositions[view] !== undefined) app.scrollTop = state.scrollPositions[view]; else if (app) app.scrollTop = 0; }, 0);
      });
    } else {
      if (typeof render === 'function') render();
      setTimeout(() => { const app = document.getElementById('app'); if (app && state.scrollPositions[view] !== undefined) app.scrollTop = state.scrollPositions[view]; else if (app) app.scrollTop = 0; }, 0);
    }
  }
}

// ============================================================
// SECTION 19: NAV RENDERING
// ============================================================
function renderDesktopPageTitle() {
  const pageTitles = { 'recipes': 'Recipes', 'my-picks': 'My Picks', 'my-meals': 'Home', 'food-log-detail': 'Meal Detail', 'recipe-edit': 'Edit Recipe', 'recipe-view': 'Recipe', 'freestyle-edit': 'Freestyle', 'batch-edit': 'Build a Plate', 'batch-view': 'Plate', 'grocery-list': 'Grocery', 'grocery-select-meals': 'Select Meals', 'grocery-ingredients': 'Ingredients', 'inventory': 'Pantry', 'ingredients': 'Ingredients', 'ingredient-detail': 'Ingredient', 'kitchen': 'My Kitchen', 'kitchen-detail': 'Ingredient', 'home': 'Home', 'saved': 'Cooking Journal', 'components': 'Components', 'component-detail': 'Component', 'build-plate': 'Build a Plate', 'cook-mode': 'Cook Mode', 'combos': 'Combos' };
  const title = pageTitles[state.currentView] || 'PotLuck';
  return `<div class="desktop-page-title-bar" style="display: none; padding-bottom: 24px;"><h1 style="font-size: 28px; font-weight: 700; color: ${CONFIG.text_color}; margin: 0;">${title}</h1></div>`;
}

function renderNav() {
  if (state.currentView === 'home' || state.currentView === 'kitchen-detail' || state.currentView === 'kitchen-ingredient-meals' || state.currentView === 'recipe-view') return '';
  const pageTitles = { 'recipes': 'Recipes', 'my-picks': 'My Picks', 'my-meals': 'Home', 'food-log-detail': 'Meal Detail', 'recipe-edit': 'Edit Recipe', 'recipe-view': 'Recipe', 'freestyle-edit': 'Freestyle', 'batch-edit': 'Build a Plate', 'batch-view': 'Plate', 'grocery-list': 'Grocery', 'grocery-select-meals': 'Select Meals', 'grocery-ingredients': 'Ingredients', 'inventory': 'Pantry', 'ingredients': 'Ingredients', 'ingredient-detail': 'Ingredient', 'kitchen': 'My Kitchen', 'kitchen-detail': 'Ingredient', 'saved': 'Cooking Journal', 'components': 'Components', 'component-detail': 'Component', 'build-plate': 'Build a Plate', 'cook-mode': 'Cook Mode', 'combos': 'Combos' };
  const pageTitle = pageTitles[state.currentView] || 'PotLuck';
  const expiringItems = getExpiringItems(); const expiringCount = expiringItems.length;
  // Main nav pages don't get a back arrow (they're reachable from bottom nav)
  const mainNavPages = ['home', 'recipes', 'my-picks', 'kitchen', 'grocery-list', 'components'];
  const isMainNavPage = mainNavPages.includes(state.currentView);
  const backTarget = state.currentView === 'food-log-detail' ? 'home' : state.currentView === 'kitchen-detail' ? 'kitchen' : state.currentView === 'batch-edit' || state.currentView === 'batch-view' ? 'recipes' : 'home';
  const directNavViews = ['batch-view', 'batch-edit', 'food-log-detail'];
  const useDirectNav = directNavViews.includes(state.currentView);
  const backAction = state.currentView === 'food-log-detail'
    ? "state.currentView='my-meals'; render();"
    : useDirectNav ? `navigateTo('${backTarget}')` : `if(window.history.length>1){window.history.back();}else{navigateTo('${backTarget}');}`;
  const backButton = isMainNavPage ? '' : `<button onclick="${backAction}" style="color: ${CONFIG.text_color}; background: none; border: none; cursor: pointer; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; padding: 0;"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg></button>`;
  return `<nav style="background: ${CONFIG.background_color}; height: 48px; display: flex; align-items: center; padding: 0 12px; position: sticky; top: 0; z-index: 50;"><div style="display: flex; align-items: center; justify-content: space-between; width: 100%;"><div style="display: flex; align-items: center; gap: 8px;">${backButton}<span style="color: ${CONFIG.text_color}; font-weight: 700; font-size: 18px;">${pageTitle}</span></div><div style="display: flex; align-items: center; gap: 2px;">${state.currentView === 'my-meals' ? `<button onclick="navigateTo('my-plates')" style="color: ${CONFIG.text_color}; background: transparent; border: none; cursor: pointer; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px;" title="Cooking Journal"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg></button>` : ''}<button onclick="showTimerModal()" style="position: relative; color: ${CONFIG.text_color}; background: ${state.activeTimers.length > 0 ? 'rgba(232,93,93,0.15)' : 'transparent'}; border: none; cursor: pointer; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px;"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>${state.activeTimers.length > 0 ? `<span style="position:absolute; top:2px; right:2px; background:${CONFIG.danger_color}; color:white; font-size:10px; padding:2px 5px; border-radius:10px;">${state.activeTimers.length}</span>` : ''}</button>${expiringCount > 0 ? `<button onclick="navigateTo('inventory')" style="position: relative; color: ${CONFIG.text_color}; background: rgba(232,93,93,0.15); border: none; cursor: pointer; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px;"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg><span style="position:absolute; top:2px; right:2px; background:${CONFIG.danger_color}; color:white; font-size:10px; padding:2px 5px; border-radius:10px;">${expiringCount}</span></button>` : ''}</div></div></nav>`;
}

function renderBottomNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = [
    { id: 'home', label: 'Home', href: '/index.html', pages: ['index.html', 'my-meals.html'] },
    { id: 'recipes', label: 'Recipes', href: '/recipes.html', pages: ['recipes.html'] },
    { id: 'my-picks', label: 'My Picks', href: '/my-picks.html', pages: ['my-picks.html'] },
    { id: 'kitchen', label: 'Kitchen', href: '/kitchen.html', pages: ['kitchen.html', 'kitchen-detail.html'] },
    { id: 'grocery', label: 'Grocery', href: '/grocery.html', pages: ['grocery.html'] }
  ];

  const navIcons = {
    home: { inactive: '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>', active: '<svg width="24" height="24" fill="currentColor" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>' },
    recipes: { inactive: '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>', active: '<svg width="24" height="24" fill="currentColor" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>' },
    'my-picks': { inactive: '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>', active: '<svg width="24" height="24" fill="currentColor" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>' },
    'my-meals': { inactive: '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M2.25 18.75V7.5a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25v11.25m-19.5 0a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25m-19.5 0v-7.5a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25v7.5"/></svg>', active: '<svg width="24" height="24" fill="currentColor" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M2.25 18.75V7.5a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25v11.25m-19.5 0a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25m-19.5 0v-7.5a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25v7.5"/></svg>' },
    kitchen: { inactive: '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.496v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12"/></svg>', active: '<svg width="24" height="24" fill="currentColor" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.496v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12"/></svg>' },
    grocery: { inactive: '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>', active: '<svg width="24" height="24" fill="currentColor" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>' }
  };

  return `<nav class="bottom-nav" style="position: fixed; bottom: 0; left: 0; right: 0; transform: translateZ(0); background: ${CONFIG.surface_color}; box-shadow: 0 -1px 8px rgba(0,0,0,0.3); z-index: 40; padding-bottom: env(safe-area-inset-bottom);"><div style="display: flex; justify-content: space-around; align-items: center; padding: 6px 0 4px;">${navItems.map(item => {
    const isActive = item.pages.includes(currentPage);
    const icons = navIcons[item.id] || navIcons.home;
    const iconSvg = isActive ? icons.active.replace('width="24" height="24"', 'width="20" height="20"') : icons.inactive.replace('width="24" height="24"', 'width="20" height="20"');
    const iconStyle = isActive ? `color: ${CONFIG.primary_action_color}; filter: drop-shadow(0 0 4px rgba(232,93,93,0.3));` : `color: ${CONFIG.text_muted};`;
    const groceryBadge = item.id === 'grocery' ? (() => { const count = getGroceryBadgeCount(); return count > 0 ? `<span id="grocery-badge" style="position: absolute; top: -2px; right: -4px; background: ${CONFIG.danger_color}; color: white; font-size: 8px; font-weight: 700; min-width: 14px; height: 14px; border-radius: 7px; display: flex; align-items: center; justify-content: center; padding: 0 3px;">${count}</span>` : '<span id="grocery-badge" style="display:none;"></span>'; })() : '';
    return `<a href="${item.href}" style="display: flex; flex-direction: column; align-items: center; padding: 2px 6px; text-decoration: none; gap: 1px;"><span style="position: relative; ${iconStyle}">${iconSvg}${groceryBadge}</span><span style="font-size: 10px; font-weight: 500; letter-spacing: 0.3px; color: ${isActive ? CONFIG.primary_action_color : CONFIG.text_muted};">${item.label}</span></a>`;
  }).join('')}<button onclick="showMoreMenu()" style="display: flex; flex-direction: column; align-items: center; padding: 2px 6px; border: none; background: transparent; cursor: pointer; gap: 1px;"><span style="color: ${CONFIG.text_muted};"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg></span><span style="font-size: 10px; font-weight: 500; letter-spacing: 0.3px; color: ${CONFIG.text_muted};">More</span></button></div></nav>`;
}

// ============================================================
// SECTION 19b: DESKTOP SIDEBAR NAV
// ============================================================
function renderDesktopSidebar() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const sidebarPref = localStorage.getItem('sidebarCollapsed');
  const collapsed = sidebarPref === null ? true : sidebarPref === 'true';
  const sidebarItems = [
    { id: 'home', label: 'Home', href: '/index.html', pages: ['index.html', 'my-meals.html'], icon: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>' },
    { id: 'recipes', label: 'Recipes', href: '/recipes.html', pages: ['recipes.html'], icon: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>' },
    { id: 'my-picks', label: 'My Picks', href: '/my-picks.html', pages: ['my-picks.html'], icon: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>' },
    { id: 'components', label: 'Components', href: '/components.html', pages: ['components.html'], icon: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875S10.5 3.089 10.5 4.125c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.4 48.4 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"/></svg>' },
    { id: 'saved', label: 'Journal', href: '/saved.html', pages: ['saved.html'], icon: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/></svg>' },
    { id: 'kitchen', label: 'Kitchen', href: '/kitchen.html', pages: ['kitchen.html', 'kitchen-detail.html'], icon: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.496v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12"/></svg>' },
    { id: 'grocery', label: 'Grocery', href: '/grocery.html', pages: ['grocery.html'], icon: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>' },
    { id: 'settings', label: 'Settings', href: '#', pages: [], icon: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>', action: 'showSettingsMenu && showSettingsMenu()' }
  ];

  const groceryCount = typeof getGroceryBadgeCount === 'function' ? getGroceryBadgeCount() : 0;

  return `<aside class="desktop-sidebar ${collapsed ? 'collapsed' : ''}">
    <div class="sidebar-logo">
      <span style="font-size: 24px; ${collapsed ? '' : 'margin-right: 10px;'}">🍽️</span>
      <span style="font-size: 20px; font-weight: 800; color: ${CONFIG.accent_color}; letter-spacing: -0.5px;">PotLuck</span>
    </div>
    <nav class="sidebar-nav">
      ${sidebarItems.map(item => {
        const isActive = item.pages.includes(currentPage);
        const badge = item.id === 'grocery' && groceryCount > 0 ? `<span class="sidebar-badge">${groceryCount}</span>` : '';
        const onclick = item.action ? `onclick="${item.action}; return false;"` : '';
        return `<a href="${item.action ? '#' : item.href}" ${onclick} class="sidebar-link ${isActive ? 'active' : ''}" ${collapsed ? `title="${item.label}"` : ''}>
          <span class="sidebar-icon">${item.icon}</span>
          <span class="sidebar-label">${item.label}</span>
          ${badge}
        </a>`;
      }).join('')}
    </nav>
    <div class="sidebar-footer">
      <button onclick="toggleSidebarCollapse()" class="sidebar-collapse-btn" title="${collapsed ? 'Expand sidebar' : 'Collapse sidebar'}">
        ${collapsed
          ? '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>'
          : '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>'
        }
      </button>
    </div>
  </aside>`;
}

function getAppShellClass() {
  const sidebarPref = localStorage.getItem('sidebarCollapsed');
  const collapsed = sidebarPref === null ? true : sidebarPref === 'true';
  return 'app-shell' + (collapsed ? ' sidebar-collapsed' : '');
}

function toggleSidebarCollapse() {
  const sidebarPref = localStorage.getItem('sidebarCollapsed');
  const collapsed = sidebarPref === null ? true : sidebarPref === 'true';
  const newState = !collapsed;
  localStorage.setItem('sidebarCollapsed', String(newState));
  const sidebar = document.querySelector('.desktop-sidebar');
  const appShell = document.querySelector('.app-shell');
  if (sidebar) sidebar.classList.toggle('collapsed', newState);
  if (appShell) appShell.classList.toggle('sidebar-collapsed', newState);
  // Update collapse button arrow and title
  const btn = document.querySelector('.sidebar-collapse-btn');
  if (btn) btn.title = newState ? 'Expand sidebar' : 'Collapse sidebar';
}

// ============================================================
// SECTION 20: MORE MENU & MISC
// ============================================================
function showMoreMenu() {
  const menuItems = [
    { id: 'components', icon: '', label: 'Components', href: '/components.html', iconSvg: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875S10.5 3.089 10.5 4.125c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.4 48.4 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"/></svg>' },
    { id: 'saved', icon: '', label: 'Journal', href: '/saved.html', iconSvg: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/></svg>' },
    { id: 'manage-videos', icon: '', label: 'Manage Videos', href: '/admin.html', iconSvg: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>' },
    { id: 'settings', icon: '', label: 'Settings', action: 'showSettingsMenu && showSettingsMenu()', iconSvg: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' },
  ];
  document.getElementById('moreMenuOverlay')?.remove();
  const isDesktop = window.innerWidth >= 768;
  const popupStyle = isDesktop
    ? `position: fixed; left: 230px; bottom: 60px; background: ${CONFIG.surface_color}; border-radius: 12px; padding: 6px; box-shadow: 0 4px 24px rgba(0,0,0,0.3); min-width: 180px;`
    : `position: fixed; bottom: 56px; left: 50%; transform: translateX(-50%); background: ${CONFIG.surface_color}; border-radius: 12px; padding: 6px; box-shadow: 0 4px 24px rgba(0,0,0,0.15); min-width: 180px;`;
  const menuHtml = `<div id="moreMenuOverlay" onclick="closeMoreMenu()" style="position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 70;"><div onclick="event.stopPropagation()" style="${popupStyle}">${menuItems.map(item => {
    const onclick = item.href ? `window.location.href='${item.href}'` : (item.action ? item.action : `navigateTo('${item.id}')`);
    const iconHtml = item.iconSvg ? `<span style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;color:${CONFIG.text_muted};">${item.iconSvg}</span>` : `<span style="font-size: 18px;">${item.icon}</span>`;
    return `<button onclick="${onclick}; closeMoreMenu();" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; border: none; background: transparent; cursor: pointer; border-radius: 10px; text-align: left;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'">${iconHtml}<span style="color: ${CONFIG.text_color}; font-size: 14px; font-weight: 500;">${item.label}</span></button>`;
  }).join('')}</div></div>`;
  document.body.insertAdjacentHTML('beforeend', menuHtml);
}

function closeMoreMenu() { document.getElementById('moreMenuOverlay')?.remove(); }

function showWhatCanICook() {
  const inventoryNames = state.inventory.map(i => i.name.toLowerCase());
  const recipesWithMatches = state.recipes.filter(r => !r.isDraft && !r.isTip).map(recipe => { const ingredients = recipeIngList(recipe); const matchedIngredients = ingredients.filter(ing => inventoryNames.some(inv => inv.includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(inv))); const matchPercent = ingredients.length > 0 ? Math.round((matchedIngredients.length / ingredients.length) * 100) : 0; return { ...recipe, matchedIngredients, matchPercent, totalIngredients: ingredients.length }; }).filter(r => r.matchPercent > 0).sort((a, b) => b.matchPercent - a.matchPercent).slice(0, 10);
  if (recipesWithMatches.length === 0) { openModal(`<div style="color: ${CONFIG.text_color}; text-align: center; padding: 20px;"><div style="font-size: 48px; margin-bottom: 16px;">&#129300;</div><h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">No Matches Found</h2><p style="color: ${CONFIG.text_muted}; margin-bottom: 16px;">Add items to your inventory or more recipes!</p><button onclick="closeModal();" style="padding: 10px 20px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">Close</button></div>`); return; }
  openModal(`<div style="color: ${CONFIG.text_color};"><h2 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">What Can I Cook?</h2><p style="color: ${CONFIG.text_muted}; font-size: 14px; margin-bottom: 16px;">Based on your ${state.inventory.length} inventory items</p><div style="max-height: 400px; overflow-y: auto;">${recipesWithMatches.map(recipe => `<div onclick="closeModal(); navigateTo('recipe-view'); state.selectedRecipeViewId = '${recipe.id}';" style="display: flex; align-items: center; gap: 12px; padding: 12px; margin-bottom: 8px; background: ${CONFIG.background_color}; border-radius: 12px; cursor: pointer;"><div style="flex: 1; min-width: 0;"><div style="font-weight: 600; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(recipe.title)}</div><div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption};">${recipe.matchedIngredients.length} of ${recipe.totalIngredients} ingredients</div></div><div style="background: ${recipe.matchPercent >= 80 ? CONFIG.success_color : recipe.matchPercent >= 50 ? CONFIG.warning_color : CONFIG.text_muted}; color: white; padding: 4px 10px; border-radius: 20px; font-size: ${CONFIG.type_caption}; font-weight: 600;">${recipe.matchPercent}%</div></div>`).join('')}</div><button onclick="closeModal()" style="width: 100%; margin-top: 12px; padding: 12px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Close</button></div>`);
}

// Export/Import
function exportData() {
  const data = { recipes: state.recipes, inventory: state.inventory, mealDays: state.mealDays, ingredientKnowledge: state.ingredientKnowledge, swipeSettings: state.swipeSettings, frequentItems: state.frequentItems, seasoningBlends: state.seasoningBlends, freestyleMeals: state.freestyleMeals };
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a'); link.href = url; link.download = `meal-planner-backup-${getToday()}.json`; link.click();
  URL.revokeObjectURL(url); showToast('Data exported successfully!', 'success');
}

function showImportModal() {
  openModal(`<div style="color: ${CONFIG.text_color};"><h2 class="text-2xl font-bold mb-4">Import Data</h2><p class="mb-4">Upload a previously exported JSON file.</p><p class="mb-4 font-semibold" style="color: ${CONFIG.danger_color};">Warning: This will replace all current data!</p><input type="file" id="importFile" accept=".json" class="mb-4 w-full p-2 border rounded"><div class="flex gap-2 justify-end"><button onclick="closeModal()" class="px-4 py-2 rounded" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">Cancel</button><button onclick="importData()" class="px-4 py-2 rounded" style="background: ${CONFIG.primary_action_color}; color: white;">Import</button></div></div>`);
}

function importData() {
  const fileInput = document.getElementById('importFile'); const file = fileInput.files[0];
  if (!file) { showError('Please select a file to import'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.recipes) state.recipes = data.recipes;
      if (data.inventory) state.inventory = data.inventory;
      if (data.mealDays) state.mealDays = data.mealDays;
      if (data.ingredientKnowledge) state.ingredientKnowledge = data.ingredientKnowledge;
      if (data.swipeSettings) state.swipeSettings = data.swipeSettings;
      if (data.frequentItems) state.frequentItems = data.frequentItems;
      if (data.seasoningBlends) state.seasoningBlends = data.seasoningBlends;
      if (data.freestyleMeals) state.freestyleMeals = data.freestyleMeals;
      persistState(); closeModal(); showToast('Data imported successfully!', 'success'); navigateTo('home');
    } catch (err) { showError('Failed to import data: Invalid file'); console.error(err); }
  };
  reader.readAsText(file);
}

// ============================================================
// AUTH FUNCTIONS (Supabase)
// ============================================================

function showLoginModal() {
  openModal(`
    <div style="color: ${CONFIG.text_color}; max-width: 360px; margin: 0 auto; padding: 24px 24px 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 28px; margin-bottom: 6px;">🍽️</div>
        <div style="font-size: 20px; font-weight: 800; color: ${CONFIG.accent_color}; letter-spacing: -0.5px;">PotLuck</div>
        <div style="font-size: 13px; color: ${CONFIG.text_muted}; margin-top: 4px;">Sign in to sync your data</div>
      </div>
      <div style="margin-bottom: 12px;">
        <label style="font-size: 13px; color: ${CONFIG.text_muted}; display: block; margin-bottom: 4px;">Email</label>
        <input type="email" id="loginEmail" placeholder="your@email.com"
          style="width: 100%; height: 44px; padding: 0 12px; font-size: 14px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; border: 1px solid ${CONFIG.divider_color}; border-radius: 8px; box-sizing: border-box;" />
      </div>
      <div style="margin-bottom: 16px;">
        <label style="font-size: 13px; color: ${CONFIG.text_muted}; display: block; margin-bottom: 4px;">Password</label>
        <input type="password" id="loginPassword" placeholder="••••••••"
          style="width: 100%; height: 44px; padding: 0 12px; font-size: 14px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; border: 1px solid ${CONFIG.divider_color}; border-radius: 8px; box-sizing: border-box;" />
      </div>
      <button onclick="handleLogin()" style="width: 100%; height: 44px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 8px;">Sign In</button>
      <button onclick="handleSignup()" style="width: 100%; height: 44px; background: transparent; color: ${CONFIG.text_muted}; border: 1px solid ${CONFIG.divider_color}; border-radius: 8px; font-size: 14px; cursor: pointer;">Create Account</button>
      <div style="text-align: center; margin-top: 12px; font-size: 12px; color: ${CONFIG.text_tertiary};">Data syncs to the cloud when signed in</div>
    </div>
  `);
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showError('Please enter email and password');
    return;
  }

  if (!window.supabaseClient) {
    showError('Supabase not loaded — please refresh and try again');
    return;
  }

  try {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      showError('Login failed: ' + error.message);
      return;
    }

    closeModal();
    showToast('Logged in successfully!', 'success');

    // Migrate localStorage data to Supabase if any
    try { await migrateLocalStorageToSupabase(); } catch(e) { console.error('Migration failed (non-fatal):', e); }
    try { await migrateSavedAndPlatesToSupabase(); } catch(e) { console.error('Saved/plates migration failed (non-fatal):', e); }

    // Load data and render
    await loadDataFromSupabase();
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (user) {
      subscribeToChanges(user.id);
      updateUserIndicator(user.email);
    }
    if (typeof render === 'function') render();
  } catch (e) {
    console.error('Login error:', e);
    showError('Login failed: ' + e.message);
  }
}

async function handleSignup() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showError('Please enter email and password');
    return;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }

  if (!window.supabaseClient) {
    showError('Supabase not loaded — please refresh and try again');
    return;
  }

  try {
    const { data, error } = await window.supabaseClient.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      showError('Signup failed: ' + error.message);
      return;
    }

    closeModal();
    showToast('Account created! Check your email to verify.', 'success');
    showLoginModal();
  } catch (e) {
    console.error('Signup error:', e);
    showError('Signup failed: ' + e.message);
  }
}

async function handleLogout() {
  clearAuthCache();
  localStorage.removeItem('meal_planner_data_v1');
  if (window.supabaseClient) {
    try { await window.supabaseClient.auth.signOut(); } catch(e) { console.error('Signout error:', e); }
  }
  showToast('Logged out', 'success');
  location.reload();
}

async function migrateLocalStorageToSupabase() {
  const STORAGE_KEY = 'meal_planner_data_v1';
  const localData = localStorage.getItem(STORAGE_KEY);

  if (!localData) {
    debugLog('No local data to migrate');
    return;
  }

  try {
    const items = JSON.parse(localData);
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    const user = session?.user;

    if (!user || items.length === 0) return;

    showToast('Migrating your data to cloud...', 'info');

    for (const item of items) {
      await window.supabaseClient
        .from('meal_planner_data')
        .insert({
          id: item.id,
          user_id: user.id,
          data: item
        });
    }

    showToast(`Migrated ${items.length} items to cloud!`, 'success');
    localStorage.removeItem(STORAGE_KEY);
    debugLog('Migration complete, localStorage cleared');
  } catch (e) {
    console.error('Migration error:', e);
    showError('Failed to migrate data. Please try again.');
  }
}

async function migrateSavedAndPlatesToSupabase() {
  if (!window.supabaseClient) return;
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session?.user) return;
    const userId = session.user.id;

    // Migrate saved recipes list
    const saved = getSavedRecipes();
    if (saved.length > 0) {
      const item = { id: 'savedRecipes_list', type: 'savedRecipes', recipeIds: saved };
      await window.supabaseClient.from('meal_planner_data')
        .upsert({ id: item.id, user_id: userId, data: item }, { onConflict: 'id' });
      debugLog('[migrate] Synced', saved.length, 'saved recipe IDs to Supabase');
    }

    // Migrate batch recipes (plates)
    const batches = state.batchRecipes || [];
    for (const batch of batches) {
      if (batch.id) {
        await window.supabaseClient.from('meal_planner_data')
          .upsert({ id: batch.id, user_id: userId, data: batch }, { onConflict: 'id' });
      }
    }
    if (batches.length > 0) debugLog('[migrate] Synced', batches.length, 'plates to Supabase');

    // Migrate food log
    const foodLog = getFoodLog();
    if (foodLog.length > 0) {
      const item = { id: 'foodLog_list', type: 'foodLog', entries: foodLog };
      await window.supabaseClient.from('meal_planner_data')
        .upsert({ id: item.id, user_id: userId, data: item }, { onConflict: 'id' });
      debugLog('[migrate] Synced', foodLog.length, 'food log entries to Supabase');
    }

    // Migrate smart grocery list
    const groceryList = getSmartGroceryList();
    if (groceryList.length > 0) {
      const item = { id: 'groceryList_list', type: 'groceryList', entries: groceryList };
      await window.supabaseClient.from('meal_planner_data')
        .upsert({ id: item.id, user_id: userId, data: item }, { onConflict: 'id' });
      debugLog('[migrate] Synced', groceryList.length, 'grocery items to Supabase');
    }

    // Migrate ingredient photos
    if (Object.keys(ingredientPhotos).length > 0) {
      const item = { id: 'ingredientPhotos_data', type: 'ingredientPhotos', photos: ingredientPhotos };
      await window.supabaseClient.from('meal_planner_data')
        .upsert({ id: item.id, user_id: userId, data: item }, { onConflict: 'id' });
      debugLog('[migrate] Synced', Object.keys(ingredientPhotos).length, 'ingredient photos to Supabase');
    }

    // Migrate custom ingredient images
    if (Object.keys(customIngredientImages).length > 0) {
      const item = { id: 'customImages_data', type: 'customImages', images: customIngredientImages };
      await window.supabaseClient.from('meal_planner_data')
        .upsert({ id: item.id, user_id: userId, data: item }, { onConflict: 'id' });
      debugLog('[migrate] Synced', Object.keys(customIngredientImages).length, 'custom images to Supabase');
    }

    // Migrate recipe effort levels
    const effortLevels = getRecipeEffortLevels();
    if (Object.keys(effortLevels).length > 0) {
      const item = { id: 'effortLevels_data', type: 'effortLevels', levels: effortLevels };
      await window.supabaseClient.from('meal_planner_data')
        .upsert({ id: item.id, user_id: userId, data: item }, { onConflict: 'id' });
      debugLog('[migrate] Synced', Object.keys(effortLevels).length, 'effort levels to Supabase');
    }

    // Migrate components (starter + user-created)
    const components = state.components || [];
    for (const comp of components) {
      if (comp.id) {
        await window.supabaseClient.from('meal_planner_data')
          .upsert({ id: comp.id, user_id: userId, data: comp }, { onConflict: 'id' });
      }
    }
    if (components.length > 0) debugLog('[migrate] Synced', components.length, 'components to Supabase');

    // Migrate combos
    const combos = state.combos || [];
    for (const combo of combos) {
      if (combo.id) {
        await window.supabaseClient.from('meal_planner_data')
          .upsert({ id: combo.id, user_id: userId, data: combo }, { onConflict: 'id' });
      }
    }
    if (combos.length > 0) debugLog('[migrate] Synced', combos.length, 'combos to Supabase');
  } catch (e) { console.error('Migration of saved/plates failed (non-fatal):', e); }
}

function updateUserIndicator(email) {
  const displayText = email || 'Not logged in';
  const indicator = document.getElementById('userIndicator');
  const emailSpan = document.getElementById('userEmail');
  if (indicator && emailSpan) { emailSpan.textContent = displayText; indicator.style.display = 'block'; }
  const indicatorMobile = document.getElementById('userIndicatorMobile');
  const emailSpanMobile = document.getElementById('userEmailMobile');
  if (indicatorMobile && emailSpanMobile) { emailSpanMobile.textContent = displayText; indicatorMobile.style.display = 'block'; }
}

// ============================================================
// SUPABASE DATA LOADING
// ============================================================

async function loadDataFromSupabase() {
  if (!window.supabaseClient) return;
  // Use getSession() (local cache) instead of getUser() (network call)
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (!session || !session.user) return;
  const user = session.user;

  const { data, error } = await window.supabaseClient
    .from('meal_planner_data')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Load error:', error);
    return;
  }

  const items = data.map(row => ({ id: row.id, ...row.data }));
  applySupabaseData(items);
}

function applySupabaseData(data) {
  // Skip if we're in the middle of an optimistic update
  if (state.ignoreRealtimeUntil && Date.now() < state.ignoreRealtimeUntil) {
    debugLog('Skipping realtime update during optimistic period');
    return;
  }

  state.recipes = data.filter(d => d.id && d.id.startsWith('recipe_'));
  // Seed test video clips on first 3 recipes (if they don't already have clips)
  seedTestVideoClips();
  state.inventory = data.filter(d => d.id && (d.id.startsWith('inventory_') || d.id.startsWith('inv_')));

  // Expiration defaults
  const expDefaults = data.filter(d => d.id && d.id.startsWith('expdefault_'));
  state.expirationDefaults = {};
  expDefaults.forEach(d => { state.expirationDefaults[d.itemName] = d.days; });

  // Receipt mappings
  const mappings = data.filter(d => d.id && d.id.startsWith('mapping_'));
  state.receiptMappings = {};
  mappings.forEach(d => {
    state.receiptMappings[d.rawText] = { name: d.correctedName, category: d.category || 'Other', ingredientId: d.ingredientId || null };
  });

  state.purchaseHistory = data.filter(d => d.id && d.id.startsWith('history_'));
  state.receipts = data.filter(d => d.id && d.id.startsWith('receipt_'));


  state.frequentItems = data.filter(d => d.id?.startsWith('frequent_'));
  state.ingredientKnowledge = data.filter(d => d.id?.startsWith('ingredient_') && d.type === 'ingredient_knowledge');

  let planData = data.filter(d => d.date && d.id && d.id.startsWith('plan_'));
  planData = planData.map(plan => {
    const needsMigration = typeof plan.breakfast === 'string' || typeof plan.lunch === 'string' || typeof plan.dinner === 'string';
    if (needsMigration) {
      return { ...plan, breakfast: plan.breakfast ? [plan.breakfast] : [], lunch: plan.lunch ? [plan.lunch] : [], dinner: plan.dinner ? [plan.dinner] : [] };
    }
    return { ...plan, breakfast: plan.breakfast || [], lunch: plan.lunch || [], dinner: plan.dinner || [] };
  });
  state.planData = planData;

  state.mealSelections = data.filter(d => d.id && d.id.startsWith('mealSel_'));
  state.groceryItems = data.filter(d => d.ingredientKey);
  state.mealOptions = data.filter(d => d.id && d.id.startsWith('mealOption_'));
  state.freestyleMeals = data.filter(d => d.id && d.id.startsWith('freestyle_'));
  state.recordingNeeds = data.filter(d => d.id && d.id.startsWith('recording_'));
  state.seasoningBlends = data.filter(d => d.id && d.id.startsWith('blend_'));
  state.cookingTasks = data.filter(d => d.id && d.id.startsWith('task_'));
  state.mealLogs = data.filter(d => d.id && d.id.startsWith('meallog_'));

  // Load batch recipes (plates) from Supabase — always overwrite from Supabase (source of truth)
  state.batchRecipes = data.filter(d => d.id && d.id.startsWith('batch_'));
  saveToLS('batchRecipes', state.batchRecipes);

  // Load components and combos from Supabase
  // Only overwrite if Supabase actually has data — prevents wiping locally-seeded starter components
  const supaComponents = data.filter(d => d.id && d.id.startsWith('component_'));
  if (supaComponents.length > 0) {
    state.components = supaComponents;
  }
  const supaCombos = data.filter(d => d.id && d.id.startsWith('combo_'));
  if (supaCombos.length > 0) {
    state.combos = supaCombos;
  }

  // If components are still empty and never seeded, try seeding now (handles case where Supabase loads before components.js init)
  if (state.components.length === 0) {
    if (typeof seedStarterComponents === 'function') {
      seedStarterComponents();
    }
  }

  // Load saved recipe IDs from Supabase
  const savedRecipesRow = data.find(d => d.id === 'savedRecipes_list');
  if (savedRecipesRow && Array.isArray(savedRecipesRow.recipeIds)) {
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipesRow.recipeIds));
  }

  // Load food log from Supabase
  const foodLogRow = data.find(d => d.id === 'foodLog_list');
  if (foodLogRow && Array.isArray(foodLogRow.entries)) {
    localStorage.setItem(FOOD_LOG_KEY, JSON.stringify(foodLogRow.entries));
  }

  // Load grocery list from Supabase (skip if local changes are in-flight)
  if (!(state.ignoreRealtimeUntil && Date.now() < state.ignoreRealtimeUntil)) {
    const groceryListRow = data.find(d => d.id === 'groceryList_list');
    if (groceryListRow && Array.isArray(groceryListRow.entries)) {
      localStorage.setItem(GROCERY_KEY, JSON.stringify(groceryListRow.entries));
    }
  }

  // Load ingredient photos from Supabase
  const ingredientPhotosRow = data.find(d => d.id === 'ingredientPhotos_data');
  if (ingredientPhotosRow && ingredientPhotosRow.photos && typeof ingredientPhotosRow.photos === 'object') {
    ingredientPhotos = ingredientPhotosRow.photos;
    localStorage.setItem('yummy_ingredientPhotos', JSON.stringify(ingredientPhotos));
  }

  // Load custom ingredient images from Supabase
  const customImagesRow = data.find(d => d.id === 'customImages_data');
  if (customImagesRow && customImagesRow.images && typeof customImagesRow.images === 'object') {
    customIngredientImages = customImagesRow.images;
    localStorage.setItem('custom_ingredient_images', JSON.stringify(customIngredientImages));
  }

  // Load recipe effort levels from Supabase
  const effortLevelsRow = data.find(d => d.id === 'effortLevels_data');
  if (effortLevelsRow && effortLevelsRow.levels && typeof effortLevelsRow.levels === 'object') {
    localStorage.setItem(EFFORT_LEVELS_KEY, JSON.stringify(effortLevelsRow.levels));
  }

  // Load mealDays (last 90 days)
  const todayDate = getToday();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  const cutoff = _localDateStr(cutoffDate);
  const mealDayRecords = data.filter(d => d.id && d.id.startsWith('todayMeals_') && d.date >= cutoff);
  state.mealDays = {};
  mealDayRecords.forEach(record => {
    if (record.meals) {
      const day = { date: record.date, meals: record.meals };
      ['breakfast', 'lunch', 'dinner'].forEach(m => {
        if (!day.meals[m]) day.meals[m] = freshMealSlot();
      });
      if (!Array.isArray(day.meals.snacks)) day.meals.snacks = [];
      state.mealDays[record.date] = day;
    }
  });
  if (!state.mealDays[todayDate]) {
    state.mealDays[todayDate] = { date: todayDate, meals: { breakfast: freshMealSlot(), lunch: freshMealSlot(), dinner: freshMealSlot(), snacks: [] } };
  }

  state.dataLoaded = true;
  // Also persist to localStorage as cache
  persistState();
}

let _realtimeDebounceTimer = null;
function subscribeToChanges(userId) {
  const channel = window.supabaseClient
    .channel('meal_planner_changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'meal_planner_data', filter: `user_id=eq.${userId}` },
      (payload) => {
        if (state.ignoreRealtimeUntil && Date.now() < state.ignoreRealtimeUntil) return;
        clearTimeout(_realtimeDebounceTimer);
        _realtimeDebounceTimer = setTimeout(() => {
          loadDataFromSupabase().then(() => {
            if (typeof render === 'function') {
              const scrollEl = document.getElementById('app');
              const scrollPos = scrollEl ? scrollEl.scrollTop : window.scrollY;
              render();
              requestAnimationFrame(() => {
                if (scrollEl) scrollEl.scrollTop = scrollPos;
                else window.scrollTo(0, scrollPos);
              });
            }
          });
        }, 1000);
      }
    )
    .subscribe();
}

function showClearDataModal() {
  openModal(`<div style="color: ${CONFIG.text_color};"><h2 class="text-2xl font-bold mb-4">Clear All Data</h2><p class="mb-4 font-semibold" style="color: ${CONFIG.danger_color};">Warning: This will permanently delete all your data!</p><p class="mb-4">Consider exporting your data first.</p><div class="flex gap-2 justify-end"><button onclick="closeModal()" class="px-4 py-2 rounded" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">Cancel</button><button onclick="clearAllData()" class="px-4 py-2 rounded" style="background: ${CONFIG.danger_color}; color: white;">Clear All Data</button></div></div>`);
}

async function clearAllData() {
  // Clear all yummy_ prefixed localStorage keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key.startsWith('yummy_')) keysToRemove.push(key); }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  localStorage.removeItem(FOOD_LOG_KEY); localStorage.removeItem(GROCERY_KEY); localStorage.removeItem(SAVED_RECIPES_KEY);
  localStorage.removeItem('custom_ingredient_images'); localStorage.removeItem(EFFORT_LEVELS_KEY);
  localStorage.removeItem('weeklyBudgetsBackup');
  // Also clear Supabase data
  if (window.supabaseClient) {
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session?.user) {
        await window.supabaseClient.from('meal_planner_data').delete().eq('user_id', session.user.id);
      }
    } catch (e) { console.error('Failed to clear Supabase data:', e); }
  }
  loadAllState(); closeModal(); showToast('All data cleared', 'success'); navigateTo('home');
}

// ============================================================
// SUPABASE DEBUG — call window.testSupabase() from console
// ============================================================
window.testSupabase = async function() {
  try {
    if (!window.supabaseClient) {
      console.error('Supabase client not loaded!');
      return;
    }
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    console.log('Auth session:', session ? { user: session.user?.email, expires: session.expires_at } : 'NO SESSION');

    if (!session?.user) {
      console.log('Not logged in — cannot query tables');
      return;
    }

    // Try to read from the main data table
    const { data, error } = await window.supabaseClient
      .from('meal_planner_data')
      .select('id')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('meal_planner_data query error:', error.message);
    } else {
      console.log('meal_planner_data: ' + (data?.length || 0) + ' rows');
      if (data && data.length > 0) {
        const prefixes = {};
        data.forEach(row => {
          const prefix = row.id?.split('_')[0] || 'unknown';
          prefixes[prefix] = (prefixes[prefix] || 0) + 1;
        });
        console.log('Row breakdown by prefix:', prefixes);
      }
    }
  } catch(e) {
    console.error('Supabase test failed:', e);
  }
};

// ============================================================
// CROSS-PAGE NAVIGATION FALLBACKS
// When a function is called from a page where it isn't defined
// (e.g. openRecipeView from home.js), these stubs redirect to
// the correct page via navigateTo().
// ============================================================
if (typeof openRecipeView === 'undefined') {
  window.openRecipeView = function(id) {
    state.selectedRecipeViewId = id;
    navigateTo('recipe-view');
  };
}

if (typeof openFoodLogDetail === 'undefined') {
  window.openFoodLogDetail = function(logId) {
    state.selectedFoodLogId = logId;
    navigateTo('food-log-detail');
  };
}

if (typeof showIngredientDetail === 'undefined') {
  window.showIngredientDetail = function(ingredientId) {
    state.selectedIngredientId = ingredientId;
    navigateTo('ingredient-detail');
  };
}

if (typeof showInventoryItemDetail === 'undefined') {
  window.showInventoryItemDetail = function(itemId) {
    state.selectedInventoryItemId = itemId;
    navigateTo('inventory');
  };
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') { e.preventDefault(); exportData(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); showImportModal(); }
    if (e.key === 'Escape') { const modal = document.getElementById('modal'); if (modal && modal.style.display === 'flex') closeModal(); else if (state.currentView !== 'home') navigateTo('home'); }
    if (e.key === 'h' && state.currentView !== 'home') navigateTo('home');
    if (e.key === 'r' && state.currentView !== 'recipes') navigateTo('recipes');
    if (e.key === 'g' && state.currentView !== 'grocery-list') navigateTo('grocery-list');
  });
}

function getExternalMealType(name) {
  const type = state.externalMealTypes.find(t => typeof t === 'string' ? t === name : t.name === name);
  if (!type) return { name: name, emoji: '\ud83c\udf7d\ufe0f' };
  return typeof type === 'string' ? { name: type, emoji: '\ud83c\udf7d\ufe0f' } : type;
}

// ============================================================
// SECTION 21a: SETTINGS & KEYBOARD SHORTCUTS
// ============================================================

async function showSettingsMenu() {
  const userEmail = localStorage.getItem('yummy_auth_user_email') || 'Not logged in';

  const settingRow = (onclick, icon, label, desc, color) => `
    <button onclick="${onclick}" style="display: flex; align-items: center; gap: 12px; width: 100%; height: 44px; padding: 0 12px; border: none; background: transparent; cursor: pointer; border-radius: 8px; text-align: left;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
      <span style="font-size: 16px; width: 20px; text-align: center;">${icon}</span>
      <span style="flex: 1; font-size: 14px; color: ${color || CONFIG.text_color}; font-weight: 500;">${label}</span>
      ${desc ? `<span style="font-size: 13px; color: ${CONFIG.text_tertiary};">${desc}</span>` : ''}
      <svg width="14" height="14" fill="none" stroke="${CONFIG.text_tertiary}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
    </button>`;

  openModal(`
    <div style="color: ${CONFIG.text_color}; max-width: 400px; margin: 0 auto; padding: 12px;">
      <div style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">Settings</div>
      <div style="font-size: 13px; color: ${CONFIG.text_muted}; margin-bottom: 12px;">${userEmail}</div>

      <div style="border-top: 1px solid ${CONFIG.divider_color}; padding-top: 4px;">
        ${settingRow("exportData(); closeModal();", "📥", "Export Data", "Ctrl+E")}
        ${settingRow("closeModal(); showImportModal();", "📤", "Import Data", "Ctrl+I")}
        ${settingRow("closeModal(); syncAllIngredientImages();", "🔄", "Sync Images", "")}
        ${settingRow("closeModal(); showKeyboardShortcuts();", "⌨️", "Keyboard Shortcuts", "")}
        ${settingRow("window.location.href='admin.html'", "🎬", "Manage Videos", "")}
      </div>

      <div style="border-top: 1px solid ${CONFIG.divider_color}; margin-top: 4px; padding-top: 4px;">
        <div style="display: flex; align-items: center; gap: 12px; height: 36px; padding: 0 12px;">
          <span style="font-size: 13px; color: ${CONFIG.text_tertiary};">${state.recipes.length} recipes · ${state.planData.length} plans · ${state.groceryItems.length} grocery</span>
        </div>
      </div>

      <div style="border-top: 1px solid ${CONFIG.divider_color}; margin-top: 4px; padding-top: 4px;">
        ${settingRow("closeModal(); showClearDataModal();", "🗑️", "Clear All Data", "", CONFIG.danger_color)}
        ${settingRow("closeModal(); handleLogout();", "🚪", "Logout", "", CONFIG.danger_color)}
      </div>

      <button onclick="closeModal()" style="width: 100%; height: 40px; margin-top: 8px; background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; font-size: 13px; cursor: pointer;">Close</button>
    </div>
  `);
}

function showKeyboardShortcuts() {
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h2 class="text-2xl font-bold mb-4">⌨️ Keyboard Shortcuts</h2>

      <div class="space-y-4">
        <div>
          <h3 class="font-semibold text-lg mb-2">Navigation</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between"><span>Go Home</span><span class="kbd">H</span></div>
            <div class="flex justify-between"><span>Go to Recipes</span><span class="kbd">R</span></div>
            <div class="flex justify-between"><span>Go to Weekly Plan</span><span class="kbd">W</span></div>
            <div class="flex justify-between"><span>Go to Grocery List</span><span class="kbd">G</span></div>
            <div class="flex justify-between"><span>Go Back / Close</span><span class="kbd">Esc</span></div>
          </div>
        </div>

        <div>
          <h3 class="font-semibold text-lg mb-2">Actions</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between"><span>New Recipe (on Recipes page)</span><span class="kbd">N</span></div>
            <div class="flex justify-between"><span>Export Data</span><span class="kbd">Ctrl+E</span></div>
            <div class="flex justify-between"><span>Import Data</span><span class="kbd">Ctrl+I</span></div>
          </div>
        </div>

        <div>
          <h3 class="font-semibold text-lg mb-2">Weekly Plan</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between"><span>Previous Week</span><span class="kbd">←</span></div>
            <div class="flex justify-between"><span>Next Week</span><span class="kbd">→</span></div>
          </div>
        </div>
      </div>

      <div class="flex gap-2 justify-end mt-6">
        <button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">
          Close
        </button>
      </div>
    </div>
 `);
}


function changeWeek(direction) {
  const date = new Date(state.currentWeekStartDate + 'T12:00:00');
  date.setDate(date.getDate() + (direction * 7));
  state.currentWeekStartDate = _localDateStr(date);
  render();
}

// ============================================================
// SECTION 21c: PHOTO CAPTURE
// ============================================================

function showPhotoCapture(meal) {
  openModal(`
    <div style="color: ${CONFIG.text_color}; text-align: center;">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: ${CONFIG.space_md};">Take a Photo</h3>
      <p style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; margin-bottom: ${CONFIG.space_lg};">Snap a pic of your meal</p>
      <input type="file" id="mealPhotoInput" accept="image/*" capture="environment" style="display: none;"
        onchange="handleMealPhotoCapture(event, '${meal}')" />
      <button onclick="document.getElementById('mealPhotoInput').click()"
        style="width: 100%; padding: 16px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: ${CONFIG.space_sm};">
        Open Camera
      </button>
      <button onclick="closeModal(); logMealAsMatched('${meal}', null)"
        style="width: 100%; padding: 14px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 12px; font-size: 14px; cursor: pointer;">
        Skip photo
      </button>
    </div>
  `);
}

async function handleMealPhotoCapture(event, meal) {
  const file = event.target.files[0];
  if (!file) return;
  const compressed = await compressImage(file, 800, 0.7);
  const reader = new FileReader();
  reader.onload = async (e) => {
    closeModal();
    await logMealAsMatched(meal, e.target.result);
    showToast('Meal logged with photo!', 'success');
  };
  reader.readAsDataURL(compressed);
}

// ============================================================
// SECTION 21d: EXTERNAL MEAL TYPES MANAGEMENT
// ============================================================

function showManageExternalMealTypes() {
  // Convert old string format to new object format if needed
  const types = state.externalMealTypes.map(t =>
    typeof t === 'string' ? { name: t, emoji: '🍽️' } : t
  );

  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h2 class="text-2xl font-bold mb-4">Manage External Meal Types</h2>

      <div class="mb-4">
        <label class="block mb-2 font-semibold">Current Types:</label>
        <div class="space-y-2">
          ${types.map((type, idx) => `
            <div class="flex items-center justify-between p-2 rounded" style="background: ${CONFIG.surface_color};">
              <div class="flex items-center gap-2">
                <span style="font-size: 1.5rem;">${type.emoji || '🍽️'}</span>
                <span>${esc(type.name)}</span>
              </div>
              <div class="flex gap-2">
                <button onclick="editExternalMealType(${idx})"
                        class="px-3 py-1 rounded button-hover" style="background: ${CONFIG.primary_action_color}; color: white;">
                  Edit
                </button>
                <button onclick="removeExternalMealType(${idx})"
                        class="px-3 py-1 rounded button-hover" style="background: ${CONFIG.danger_color}; color: white;">
                  Delete
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="mb-4">
        <label class="block mb-2 font-semibold">Add New Type:</label>
        <div class="flex gap-2">
          <input type="text" id="newExternalMealEmoji"
                 class="w-16 px-3 py-2 border rounded text-center text-xl"
                 placeholder="🍽️"
                 maxlength="2"
                 value="🍽️" />
          <input type="text" id="newExternalMealType"
                 class="flex-1 px-3 py-2 border rounded"
                 placeholder="e.g., Office Cafeteria" />
          <button onclick="addExternalMealType()"
                  class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.primary_action_color}; color: white;">
            Add
          </button>
        </div>
      </div>

      <div class="flex gap-2 justify-end mt-6">
        <button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">
          Done
        </button>
      </div>
    </div>
  `);
}

async function addExternalMealType() {
  const nameInput = document.getElementById('newExternalMealType');
  const emojiInput = document.getElementById('newExternalMealEmoji');
  const newName = nameInput.value.trim();
  const newEmoji = emojiInput.value.trim() || '🍽️';

  if (!newName) {
    showError('Please enter a meal type name');
    return;
  }

  // Convert old format if needed
  state.externalMealTypes = state.externalMealTypes.map(t =>
    typeof t === 'string' ? { name: t, emoji: '🍽️' } : t
  );

  if (state.externalMealTypes.some(t => t.name === newName)) {
    showError('This type already exists');
    return;
  }

  state.externalMealTypes.push({ name: newName, emoji: newEmoji });
  await saveExternalMealTypesConfig();
  showManageExternalMealTypes();
}

function editExternalMealType(idx) {
  // Convert old format if needed
  state.externalMealTypes = state.externalMealTypes.map(t =>
    typeof t === 'string' ? { name: t, emoji: '🍽️' } : t
  );

  const type = state.externalMealTypes[idx];

  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h2 class="text-2xl font-bold mb-4">Edit External Meal Type</h2>

      <div class="mb-4">
        <label class="block mb-2 font-semibold">Emoji:</label>
        <input type="text" id="editExternalMealEmoji"
               class="w-20 px-3 py-2 border rounded text-center text-2xl"
               maxlength="2"
               value="${type.emoji || '🍽️'}" />
      </div>

      <div class="mb-4">
        <label class="block mb-2 font-semibold">Name:</label>
        <input type="text" id="editExternalMealName"
               class="w-full px-3 py-2 border rounded"
               value="${esc(type.name)}" />
      </div>

      <div class="flex gap-2 justify-end mt-6">
        <button onclick="showManageExternalMealTypes()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">
          Cancel
        </button>
        <button onclick="saveEditedExternalMealType(${idx})"
                class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.primary_action_color}; color: white;">
          Save
        </button>
      </div>
    </div>
  `);
}

async function saveEditedExternalMealType(idx) {
  const nameInput = document.getElementById('editExternalMealName');
  const emojiInput = document.getElementById('editExternalMealEmoji');
  const newName = nameInput.value.trim();
  const newEmoji = emojiInput.value.trim() || '🍽️';

  if (!newName) {
    showError('Please enter a meal type name');
    return;
  }

  state.externalMealTypes[idx] = { name: newName, emoji: newEmoji };
  await saveExternalMealTypesConfig();
  showManageExternalMealTypes();
}

async function removeExternalMealType(index) {
  if (!confirm('Delete this external meal type?')) return;

  // Convert old format if needed
  state.externalMealTypes = state.externalMealTypes.map(t =>
    typeof t === 'string' ? { name: t, emoji: '🍽️' } : t
  );

  state.externalMealTypes.splice(index, 1);
  await saveExternalMealTypesConfig();
  showManageExternalMealTypes();
}

async function saveExternalMealTypesConfig() {
  const config = {
    id: 'config_externalMealTypes',
    types: state.externalMealTypes
  };

  const existing = storage._data.find(d => d.id === 'config_externalMealTypes');
  if (existing) {
    await storage.update(config);
  } else {
    await storage.create(config);
  }
}

// ============================================================
// SECTION 21e: MEAL ACTION SHEET (shared between home.js and my-meals.js)
// ============================================================

function showMealActionSheet(mealType, dateStr, swapLogId) {
  if (!dateStr) dateStr = state.myMealsDate || getToday();
  if (!mealType) mealType = detectMealType ? detectMealType() : 'dinner';
  const label = capitalize(mealType);
  const dateLabel = typeof getFoodLogDateLabel === 'function' ? getFoodLogDateLabel(dateStr) : getDateLabel(dateStr);
  const isSwap = !!swapLogId;
  const title = isSwap ? `Swap ${label}` : `Add ${label}`;

  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">${title}</h3>
      <div style="font-size: 13px; color: ${CONFIG.text_muted}; margin-bottom: ${CONFIG.space_lg};">${dateLabel}</div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button onclick="closeModal(); startSwipeForSlot('${mealType}', '${dateStr}'${isSwap ? `, '${swapLogId}'` : ''})"
          style="width: 100%; padding: 16px; background: ${CONFIG.surface_elevated}; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: ${CONFIG.text_color}; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 14px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(232,93,93,0.12); display: flex; align-items: center; justify-content: center;">
            <svg width="22" height="22" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008M6 18h.008M18 6h.008M18 18h.008M3 6a3 3 0 013-3h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75H6a3 3 0 00-3 3V6zm0 12a3 3 0 003 3h1.5a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75H6a3 3 0 01-3-3v3zm18-12a3 3 0 00-3-3h-1.5a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75H18a3 3 0 013 3V6zm0 12a3 3 0 01-3 3h-1.5a.75.75 0 01-.75-.75v-1.5c0-.414.336-.75.75-.75H18a3 3 0 003-3v3z"/></svg>
          </div>
          <div style="text-align: left;">
            <div style="font-weight: 600;">Swipe for it</div>
            <div style="font-size: 12px; color: ${CONFIG.text_muted}; margin-top: 2px;">Browse recipes by swiping</div>
          </div>
        </button>

        <button onclick="closeModal(); showRecipePickerForSlot('${mealType}', '${dateStr}'${isSwap ? `; window._swapLogIdForPicker = '${swapLogId}'` : ''})"
          style="width: 100%; padding: 16px; background: ${CONFIG.surface_elevated}; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: ${CONFIG.text_color}; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 14px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(232,93,93,0.12); display: flex; align-items: center; justify-content: center;">
            <svg width="22" height="22" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>
          </div>
          <div style="text-align: left;">
            <div style="font-weight: 600;">Pick from recipes</div>
            <div style="font-size: 12px; color: ${CONFIG.text_muted}; margin-top: 2px;">Choose from your recipe collection</div>
          </div>
        </button>

        <button onclick="closeModal(); showQuickLogModalForSlot('${mealType}', '${dateStr}')"
          style="width: 100%; padding: 16px; background: ${CONFIG.surface_elevated}; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: ${CONFIG.text_color}; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 14px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(232,93,93,0.12); display: flex; align-items: center; justify-content: center;">
            <svg width="22" height="22" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"/></svg>
          </div>
          <div style="text-align: left;">
            <div style="font-weight: 600;">Log manually</div>
            <div style="font-size: 12px; color: ${CONFIG.text_muted}; margin-top: 2px;">Type what you ate, add a photo</div>
          </div>
        </button>
      </div>

      <button onclick="closeModal()" style="width: 100%; margin-top: 12px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);
}

function startSwipeForSlot(mealType, dateStr, swapLogId) {
  state.viewingDate = dateStr;
  if (swapLogId) {
    state._swapTargetLogId = swapLogId;
    state._swapMealType = mealType;
    state._swapDateStr = dateStr;
    state._returnToFoodLog = true;
  }
  state.homeTab = 'swipe';
  state.swipeMealType = mealType;
  state.todaySwipeMealSlot = mealType;
  state.swipeDeck = state.swipeSettings.setupCompleted ? buildSwipeDeckFiltered(mealType) : buildSwipeDeck(mealType);
  state.swipeIndex = 0;
  navigateTo('home');
}

function openAddMealForSlot(mealType, dateStr) {
  showMealActionSheet(mealType, dateStr);
}

function showRecipePickerForSlot(mealType, dateStr) {
  const recipes = (state.recipes || []).filter(r => !r.isDraft && !r.isTip);
  state._pickerMealType = mealType;
  state._pickerDateStr = dateStr;
  state._pickerSearch = '';

  state._pickerLimit = 30;

  const renderPickerGrid = (searchTerm) => {
    let filtered = recipes;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = recipes.filter(r => (r.title || '').toLowerCase().includes(s));
      state._pickerLimit = 30;
    }
    const totalCount = filtered.length;
    const limited = filtered.slice(0, state._pickerLimit);
    let html = limited.map(r => {
      const id = r.__backendId || r.id;
      const img = recipeThumb(r);
      return `
        <div onclick="selectRecipeForSlot('${id}', '${esc(mealType)}', '${esc(dateStr)}')" class="card-press"
          style="cursor: pointer; border-radius: 8px; overflow: hidden; background: ${CONFIG.surface_color};">
          <div style="width: 100%; aspect-ratio: 1; overflow: hidden; background: ${CONFIG.surface_elevated};">
            ${img ? `<img loading="lazy" src="${esc(img)}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:8px;"><span style="color:${CONFIG.text_color};font-size:11px;font-weight:600;text-align:center;-webkit-line-clamp:3;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden;">${esc(r.title)}</span></div>`}
          </div>
          <div style="padding: 4px 4px 6px; font-size: 13px; font-weight: 600; color: ${CONFIG.text_color}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;">${esc(r.title)}</div>
        </div>`;
    }).join('');
    if (totalCount > state._pickerLimit) {
      html += `<div style="grid-column: 1 / -1; text-align: center; padding: 12px;">
        <button onclick="state._pickerLimit += 30; document.getElementById('recipePickerGrid').innerHTML = window._renderPickerGrid(document.getElementById('recipePickerSearch')?.value || '');"
          style="padding: 10px 24px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: ${CONFIG.text_color}; font-size: 13px; font-weight: 500; cursor: pointer;">
          Load more (${totalCount - state._pickerLimit} remaining)
        </button>
      </div>`;
    }
    return html;
  };

  openModal(`
    <div style="color: ${CONFIG.text_color}; max-height: 80vh; display: flex; flex-direction: column;">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: ${CONFIG.space_sm};">Pick from Recipes</h3>
      <input type="text" id="recipePickerSearch" placeholder="Search recipes..."
        oninput="document.getElementById('recipePickerGrid').innerHTML = window._renderPickerGrid(this.value);"
        style="width: 100%; padding: 10px 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; margin-bottom: ${CONFIG.space_sm};" />
      <div id="recipePickerGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; overflow-y: auto; max-height: 55vh; padding-bottom: 8px;">
        ${renderPickerGrid('')}
      </div>
      <button onclick="closeModal()" style="width: 100%; margin-top: 8px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);
  // Expose render function for search filtering
  window._renderPickerGrid = renderPickerGrid;
}

function selectRecipeForSlot(recipeId, mealType, dateStr) {
  const recipe = state.recipes.find(r => (r.__backendId || r.id) === recipeId);
  if (!recipe) { closeModal(); return; }
  closeModal();
  const isFuture = isFutureDate(dateStr);
  // Pre-fill with recipe data, then let user add their photo
  state._quickLogPhoto = null;
  state._quickLogMealType = mealType;
  state._quickLogDateStr = dateStr;
  state._selectedRecipeForLog = recipe;
  const ingredients = recipeIngList(recipe).map(i => i.name).filter(Boolean);
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">Log ${esc(recipe.title)}</h3>
      <div style="font-size: 13px; color: ${CONFIG.text_muted}; margin-bottom: ${CONFIG.space_md};">${capitalize(mealType)} — ${getFoodLogDateLabel(dateStr)}</div>

      ${recipeThumb(recipe) ? `<div style="width: 100%; height: 120px; border-radius: 12px; overflow: hidden; margin-bottom: ${CONFIG.space_md}; background: ${CONFIG.surface_elevated};"><img src="${esc(recipeThumb(recipe))}" style="width:100%;height:100%;object-fit:cover;" /></div>` : ''}

      <div style="margin-bottom: ${CONFIG.space_md};">
        <button onclick="document.getElementById('quickLogPhotoInput').click()" id="quickLogPhotoBtn"
          style="width: 100%; padding: 14px; border: 1px dashed rgba(255,255,255,0.15); border-radius: 12px; background: transparent; color: ${CONFIG.text_muted}; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
          Add my photo
        </button>
        <input type="file" id="quickLogPhotoInput" accept="image/*" capture="environment" style="display:none;" onchange="handleQuickLogPhoto(this)" />
      </div>

      <div style="margin-bottom: ${CONFIG.space_md};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Notes <span style="opacity: 0.5;">(optional)</span></label>
        <textarea id="quickLogNotes" rows="2" placeholder="How was it?"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; resize: vertical; font-family: ${CONFIG.font_family};"></textarea>
      </div>

      <button onclick="submitRecipeSlotLog()"
        style="width: 100%; padding: 14px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">
        Add to meal plan
      </button>
      <button onclick="closeModal()" style="width: 100%; margin-top: 8px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);
}

function submitRecipeSlotLog() {
  const recipe = state._selectedRecipeForLog;
  if (!recipe) return;
  const notes = document.getElementById('quickLogNotes')?.value.trim() || null;
  const dateStr = state._quickLogDateStr || getToday();
  const isFuture = isFutureDate(dateStr);
  const ingredients = recipeIngList(recipe).map(i => i.name).filter(Boolean);
  addFoodLogEntry({
    recipeId: recipe.__backendId || recipe.id,
    recipeName: recipe.title,
    image: recipeThumb(recipe) || null,
    ingredients,
    category: recipe.category,
    mealType: state._quickLogMealType || 'dinner',
    myPhoto: state._quickLogPhoto || null,
    photo: state._quickLogPhoto || null,
    notes,
    dateStr: dateStr,
    status: 'planned'
  });
  closeModal();
  showToast(isFuture ? 'Meal planned!' : 'Meal logged!', 'success');
  state._selectedRecipeForLog = null;
  render();
}

function showQuickLogModalForSlot(mealType, dateStr) {
  state._quickLogPhoto = null;
  state._quickLogMealType = mealType;
  state._quickLogDateStr = dateStr;
  const isFuture = isFutureDate(dateStr);
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">Log ${capitalize(mealType)}</h3>
      <div style="font-size: 13px; color: ${CONFIG.text_muted}; margin-bottom: ${CONFIG.space_lg};">${getFoodLogDateLabel(dateStr)}</div>

      <div style="margin-bottom: ${CONFIG.space_sm};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">What did you eat?</label>
        <input type="text" id="quickLogName" placeholder="e.g., Chicken tacos, leftover pizza"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" autofocus />
      </div>

      <div style="margin-bottom: ${CONFIG.space_md};">
        <button onclick="document.getElementById('quickLogPhotoInput').click()" id="quickLogPhotoBtn"
          style="width: 100%; padding: 14px; border: 1px dashed rgba(255,255,255,0.15); border-radius: 12px; background: transparent; color: ${CONFIG.text_muted}; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
          Add a photo
        </button>
        <input type="file" id="quickLogPhotoInput" accept="image/*" capture="environment" style="display:none;" onchange="handleQuickLogPhoto(this)" />
      </div>

      <div style="margin-bottom: ${CONFIG.space_md};">
        <label style="font-size: ${CONFIG.type_micro}; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Notes <span style="opacity: 0.5;">(optional)</span></label>
        <textarea id="quickLogNotes" rows="2" placeholder="How was it?"
          style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; resize: vertical; font-family: ${CONFIG.font_family};"></textarea>
      </div>

      <button onclick="submitQuickLogForSlot()"
        style="width: 100%; padding: 14px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;">
        Add to meal plan
      </button>
      <button onclick="closeModal()" style="width: 100%; margin-top: 8px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
    </div>
  `);
}

function submitQuickLogForSlot() {
  const name = document.getElementById('quickLogName')?.value.trim();
  if (!name) {
    showToast('Please enter what you ate', 'error');
    return;
  }
  const notes = document.getElementById('quickLogNotes')?.value.trim() || null;
  const dateStr = state._quickLogDateStr || getToday();
  const isFuture = isFutureDate(dateStr);
  addFoodLogEntry({
    recipeName: name,
    mealType: state._quickLogMealType || 'dinner',
    photo: state._quickLogPhoto || null,
    notes,
    dateStr: dateStr,
    status: 'planned'
  });
  closeModal();
  showToast(isFuture ? 'Meal planned!' : 'Meal logged!', 'success');
  render();
}

// ============================================================
// ============================================================
// SECTION 20b: MISSING FUNCTIONS (extracted from index.original.html)
// ============================================================

// --- Audio context initialization for timers ---
// Pre-initialize audio on user interaction (needed for mobile)
document.addEventListener('click', function initAudio() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume();
  } catch (e) { console.warn('Audio context init error:', e); }
  document.removeEventListener('click', initAudio);
}, { once: true });

// --- Save swipe settings ---
async function saveSwipeSettings() {
  // Always save to localStorage first (reliable)
  saveToLS('swipeSettings', state.swipeSettings);

  // Then sync to Supabase
  const config = {
    id: 'config_swipeSettings',
    type: 'config',
    breakfast: state.swipeSettings.breakfast,
    lunch: state.swipeSettings.lunch,
    dinner: state.swipeSettings.dinner,
    snack: state.swipeSettings.snack,
    setupCompleted: state.swipeSettings.setupCompleted,
    lastUpdated: Date.now()
  };
  state.swipeSettings.lastUpdated = config.lastUpdated;

  try {
    // Try update first (most common case), then create if it doesn't exist
    const result = await storage.update(config);
    if (!result?.isOk) {
      await storage.create(config);
    }
  } catch (e) {
    console.warn('Supabase swipe settings save failed (localStorage save succeeded):', e);
  }
}

// --- Save plan ---
async function savePlan(date, meal, recipeId) {
  const planId = `plan_${date}`;
  let plan = state.planData.find(p => p.date === date);

  state.isLoading = true;
  render();

  const mealKey = meal.toLowerCase();

  try {
    if (plan) {
      // Add to array (no limit)
      const currentMeals = plan[mealKey] || [];
      const updatedMeals = [...currentMeals, recipeId];
      const updatedPlan = { ...plan, [mealKey]: updatedMeals };
      await storage.update(updatedPlan);
    } else {
      if (state.planData.length >= 999) {
        showError('Maximum limit of 999 plans reached');
        return;
      }
      const newPlan = {
        id: planId,
        date: date,
        breakfast: mealKey === 'breakfast' ? [recipeId] : [],
        lunch: mealKey === 'lunch' ? [recipeId] : [],
        dinner: mealKey === 'dinner' ? [recipeId] : []
      };
      await storage.create(newPlan);
    }
  } finally {
    state.isLoading = false;
    render();
  }
}

// --- Claude API key management ---
function getClaudeApiKey() {
  return localStorage.getItem('claudeApiKey') || '';
}

function setClaudeApiKey(key) {
  localStorage.setItem('claudeApiKey', key);
}

// --- Recipe picker ---
function openRecipePicker(date, meal) {
  // Save scroll position
  const app = document.getElementById('app');
  if (app && state.currentView) {
    state.scrollPositions[state.currentView] = app.scrollTop;
  }

  state.selectedDayForRecipe = date;
  state.selectedMealForRecipe = meal;
  // Auto-select the matching category
  state.selectedCategory = meal; // meal is "Breakfast", "Lunch", or "Dinner"
  state.recipePickerSearchTerm = ''; // Clear recipe picker search
  state.currentView = 'recipe-picker';
  render();

  // Scroll to top for recipe picker
  setTimeout(() => {
    const app = document.getElementById('app');
    if (app) app.scrollTop = 0;
  }, 0);
}

async function handleRecipePickerSelect(recipeId) {
  await savePlan(state.selectedDayForRecipe, state.selectedMealForRecipe, recipeId);
  state.selectedDayForRecipe = null;
  state.selectedMealForRecipe = null;
  navigateTo('home');
}

// --- Search handler ---
let searchTimeout = null;
function handleSearchInput(value) {
  state.recipePickerSearchTerm = value;

  // Cancel previous timeout
  if (searchTimeout) clearTimeout(searchTimeout);

  // Only render after user stops typing for 300ms
  searchTimeout = setTimeout(() => {
    const input = document.getElementById('recipeSearchInput');
    const cursorPos = input ? input.selectionStart : 0;

    render();

    // Restore focus and cursor position after render
    setTimeout(() => {
      const newInput = document.getElementById('recipeSearchInput');
      if (newInput) {
        newInput.focus();
        newInput.setSelectionRange(cursorPos, cursorPos);
      }
    }, 0);
  }, 600);
}

// --- Recipe suggestions ---
function getRecipeSuggestions(filterTerm = '') {
  let recipes = state.recipes.filter(r => !r.isDraft && !r.isTip && r.id?.startsWith('recipe_'));
  if (recipes.length === 0) return [];

  // Apply user's filter if provided
  if (filterTerm) {
    const term = filterTerm.toLowerCase();
    recipes = recipes.filter(r => {
      if (r.title?.toLowerCase().includes(term)) return true;
      if (r.category?.toLowerCase().includes(term)) return true;
      if (r.ingredients?.some(ing => ing.item?.toLowerCase().includes(term))) return true;
      if (Array.isArray(r.tags) && r.tags.some(tag => tag.toLowerCase().includes(term))) return true;
      return false;
    });
  }

  const usageMap = {};

  state.planData.forEach(plan => {
    ['breakfast', 'lunch', 'dinner'].forEach(meal => {
      (plan[meal] || []).forEach(id => {
        if (!usageMap[id]) {
          usageMap[id] = { count: 0, lastUsed: null };
        }
        usageMap[id].count++;
        if (!usageMap[id].lastUsed || plan.date > usageMap[id].lastUsed) {
          usageMap[id].lastUsed = plan.date;
        }
      });
    });
  });

  const scored = recipes.map(recipe => {
    const id = recipe.__backendId || recipe.id;
    const usage = usageMap[id] || { count: 0, lastUsed: null };

    let score = 0;

    if (usage.count === 0) {
      score = 1000;
    } else {
      if (usage.lastUsed) {
        const daysSince = Math.floor((new Date() - new Date(usage.lastUsed)) / (1000 * 60 * 60 * 24));
        score = daysSince;
      }
    }

    return { recipe, score, usage };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 10);
}

function filterSuggestions() {
  const filterValue = document.getElementById('suggestionFilter')?.value || '';
  debugLog('Filtering for:', filterValue);

  const suggestions = getRecipeSuggestions(filterValue);
  debugLog('Found suggestions:', suggestions.length);

  const container = document.getElementById('suggestionsContainer');
  debugLog('Container found:', !!container);

  if (container) {
    container.innerHTML = suggestions.length === 0 ? `
      <div class="text-center py-8" style="color: ${CONFIG.text_muted};">
        No recipes found matching "${esc(filterValue)}". Try a different search term.
      </div>
    ` : suggestions.map(({ recipe, score, usage }) => {
      const neverUsed = usage.count === 0;
      const daysSince = usage.lastUsed ?
        Math.floor((new Date() - new Date(usage.lastUsed)) / (1000 * 60 * 60 * 24)) : null;

      return `
        <div class="flex items-center gap-3 p-3 rounded-lg" style="border: 1px solid ${CONFIG.divider_color}; background: ${CONFIG.surface_color};">
          ${recipeThumb(recipe) ? `
            <img loading="lazy" src="${esc(recipeThumb(recipe))}"
                 style="width:60px; height:60px; object-fit:cover; border-radius:8px;" />
          ` : `
            <div style="width:60px; height:60px; background:${CONFIG.surface_elevated}; border-radius:8px; display:flex; align-items:center; justify-content:center; padding:6px;">
              <span style="font-size:10px;font-weight:700;color:${CONFIG.text_muted};text-align:center;line-height:1.2;-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden;">${esc(recipe.title)}</span>
            </div>
          `}
          <div class="flex-1">
            <div class="font-semibold">${esc(recipe.title)}</div>
            <div class="text-sm" style="color: ${CONFIG.text_muted};">
              ${neverUsed ? '✨ Never made!' :
                daysSince !== null ? 'Last made ' + daysSince + ' day' + (daysSince !== 1 ? 's' : '') + ' ago' :
                'Made ' + usage.count + ' time' + (usage.count !== 1 ? 's' : '')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Update the description text
    const descEl = document.getElementById('suggestionsDescription');
    if (descEl) {
      descEl.textContent = filterValue ?
        'Showing recipes matching "' + filterValue + '":' :
        'Based on what you haven\'t made recently:';
    }
  }
}

// --- External meal handling ---
async function saveExternalMeal(date, meal, externalType) {
  const planId = `plan_${date}`;
  let plan = state.planData.find(p => p.date === date);

  state.isLoading = true;
  render();

  const mealKey = meal.toLowerCase();
  const externalMealId = `external_${externalType}_${Date.now()}`;

  try {
    if (plan) {
      const currentMeals = plan[mealKey] || [];
      const updatedMeals = [...currentMeals, externalMealId];
      const updatedPlan = { ...plan, [mealKey]: updatedMeals };
      await storage.update(updatedPlan);
    } else {
      if (state.planData.length >= 999) {
        showError('Maximum limit of 999 plans reached');
        return;
      }
      const newPlan = {
        id: planId,
        date: date,
        breakfast: mealKey === 'breakfast' ? [externalMealId] : [],
        lunch: mealKey === 'lunch' ? [externalMealId] : [],
        dinner: mealKey === 'dinner' ? [externalMealId] : []
      };
      await storage.create(newPlan);
    }

    // Create external meal record
    const externalMeal = {
      id: externalMealId,
      type: 'external',
      externalType: externalType,
      title: externalType
    };
    await storage.create(externalMeal);

  } finally {
    state.isLoading = false;
    render();
  }
}

function openExternalMealPicker(date, meal) {
  state.selectedDayForRecipe = date;
  state.selectedMealForRecipe = meal;
  state.currentView = 'external-meal-picker';
  render();
}

async function handleExternalMealSelect(externalType) {
  await saveExternalMeal(state.selectedDayForRecipe, state.selectedMealForRecipe, externalType);
  state.selectedDayForRecipe = null;
  state.selectedMealForRecipe = null;
  navigateTo('home');
}

// --- Inventory helpers ---
function showInventoryItemMenu(itemId) {
  const item = state.inventory.find(i => i.id === itemId);
  if (!item) return;

  const hasKnowledge = getIngredientKnowledge(item.name) || INGREDIENT_IMAGES[item.name.toLowerCase()];

  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        ${(() => {
          const imgUrl = item.image_url || getIngredientImage(item.name, item.category);
          if (imgUrl) {
            return `<img loading="lazy" src="${esc(imgUrl)}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 12px;" onerror="this.style.display='none'" />`;
          }
          return `<div style="width: 60px; height: 60px; background: ${CONFIG.background_color}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">📦</div>`;
        })()}
        <div>
          <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 2px;">${esc(item.name)}</h2>
          <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption};">${item.quantity || 1}${item.unit ? ' ' + item.unit : ''}</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button onclick="closeModal(); viewIngredientFromInventory('${esc(item.name)}')"
          style="display: flex; align-items: center; gap: 12px; padding: 14px; background: ${CONFIG.background_color}; border: none; border-radius: 12px; cursor: pointer; text-align: left;">
          <span style="font-size: 20px;">🥗</span>
          <div>
            <div style="color: ${CONFIG.text_color}; font-weight: 600;">Cooking Tips</div>
            <div style="color: ${CONFIG.text_muted}; font-size: 12px;">How to store, cook & prep</div>
          </div>
        </button>

        <button onclick="closeModal(); askChefAboutIngredient('${esc(item.name)}')"
          style="display: flex; align-items: center; gap: 12px; padding: 14px; background: ${CONFIG.background_color}; border: none; border-radius: 12px; cursor: pointer; text-align: left;">
          <span style="font-size: 20px;">👨‍🍳</span>
          <div>
            <div style="color: ${CONFIG.text_color}; font-weight: 600;">Ask Chef Claude</div>
            <div style="color: ${CONFIG.text_muted}; font-size: 12px;">Get cooking advice</div>
          </div>
        </button>

        <button onclick="closeModal(); searchRecipesByIngredient('${esc(item.name)}')"
          style="display: flex; align-items: center; gap: 12px; padding: 14px; background: ${CONFIG.background_color}; border: none; border-radius: 12px; cursor: pointer; text-align: left;">
          <span style="font-size: 20px;">🔍</span>
          <div>
            <div style="color: ${CONFIG.text_color}; font-weight: 600;">Find Recipes</div>
            <div style="color: ${CONFIG.text_muted}; font-size: 12px;">Recipes using ${esc(item.name)}</div>
          </div>
        </button>

        <button onclick="closeModal(); showEditInventoryModal('${item.id}')"
          style="display: flex; align-items: center; gap: 12px; padding: 14px; background: ${CONFIG.background_color}; border: none; border-radius: 12px; cursor: pointer; text-align: left;">
          <span style="font-size: 20px;">✏️</span>
          <div>
            <div style="color: ${CONFIG.text_color}; font-weight: 600;">Edit Item</div>
            <div style="color: ${CONFIG.text_muted}; font-size: 12px;">Update details or expiration</div>
          </div>
        </button>

        <button onclick="closeModal(); useInventoryItem('${item.id}')"
          style="display: flex; align-items: center; gap: 12px; padding: 14px; background: rgba(72, 187, 120, 0.1); border: none; border-radius: 12px; cursor: pointer; text-align: left;">
          <span style="font-size: 20px;">✓</span>
          <div>
            <div style="color: ${CONFIG.success_color}; font-weight: 600;">Mark as Used</div>
            <div style="color: ${CONFIG.text_muted}; font-size: 12px;">Remove from inventory</div>
          </div>
        </button>

        <button onclick="closeModal(); showSplitInventoryItem('${item.id}')"
          style="display: flex; align-items: center; gap: 12px; padding: 14px; background: rgba(232, 93, 93, 0.1); border: none; border-radius: 12px; cursor: pointer; text-align: left;">
          <span style="font-size: 20px;">✂️</span>
          <div>
            <div style="color: ${CONFIG.primary_action_color}; font-weight: 600;">Split Item</div>
            <div style="color: ${CONFIG.text_muted}; font-size: 12px;">Separate into fridge & freezer</div>
          </div>
        </button>

        <button onclick="closeModal(); toggleFreezeItem('${item.id}')"
          style="display: flex; align-items: center; gap: 12px; padding: 14px; background: rgba(59, 130, 246, 0.1); border: none; border-radius: 12px; cursor: pointer; text-align: left;">
          <span style="font-size: 20px;">${item.isFrozen ? '🔥' : '❄️'}</span>
          <div>
            <div style="color: #3b82f6; font-weight: 600;">${item.isFrozen ? 'Thaw Item' : 'Freeze Item'}</div>
            <div style="color: ${CONFIG.text_muted}; font-size: 12px;">${item.isFrozen ? 'Move back to fridge' : 'Extend shelf life'}</div>
          </div>
        </button>

        <button onclick="closeModal(); confirmDeleteInventoryItem('${item.id}')"
          style="display: flex; align-items: center; gap: 12px; padding: 14px; background: rgba(232, 93, 93, 0.1); border: none; border-radius: 12px; cursor: pointer; text-align: left;">
          <span style="font-size: 20px;">🗑️</span>
          <div>
            <div style="color: ${CONFIG.danger_color}; font-weight: 600;">Delete</div>
            <div style="color: ${CONFIG.text_muted}; font-size: 12px;">Remove without tracking</div>
          </div>
        </button>
      </div>

      <button onclick="closeModal()" style="width: 100%; margin-top: 12px; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; cursor: pointer;">
        Cancel
      </button>
    </div>
  `);
}

function viewIngredientFromInventory(ingredientName) {
  state.selectedIngredientId = ingredientName.toLowerCase();
  navigateTo('ingredient-detail');
}

function searchRecipesByIngredient(ingredientName) {
  state.searchByIngredient = true;
  state.searchTerm = ingredientName;
  state.recipeTab = 'user';
  navigateTo('recipes');
}

async function toggleFreezeItem(itemId) {
  const item = state.inventory.find(i => i.id === itemId);
  if (!item) return;

  item.isFrozen = !item.isFrozen;

  if (item.isFrozen) {
    item.frozenDate = getToday();
    // Extend expiration by 90 days when freezing
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 90);
    item.expirationDate = _localDateStr(newExpiry);
    showToast(`${item.name} moved to freezer`, 'success');
  } else {
    // When thawing, set expiration to 2-3 days from now
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 3);
    item.expirationDate = _localDateStr(newExpiry);
    showToast(`${item.name} thawed - use within 3 days`, 'info');
  }

  await storage.update(item);
  render();
}

async function addIngredientToInventory(ingredientName) {
  const displayName = capitalize(ingredientName);

  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">📦 Add ${esc(displayName)} to Inventory</h2>

      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px; font-weight: 500;">Quantity</label>
        <div style="display: flex; gap: 8px;">
          <input type="number" id="addInvQuantity" value="1" min="1"
            style="flex: 1; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color};" />
          <select id="addInvUnit" style="padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color};">
            <option value="">-</option>
            <option value="lb">lb</option>
            <option value="oz">oz</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="pieces">pieces</option>
            <option value="bunch">bunch</option>
            <option value="bag">bag</option>
            <option value="can">can</option>
            <option value="box">box</option>
          </select>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 4px; font-weight: 500;">Expiration Date (optional)</label>
        <input type="date" id="addInvExpiration"
          style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color};" />
      </div>

      <div style="display: flex; gap: 8px;">
        <button onclick="closeModal()" style="flex: 1; padding: 12px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">
          Cancel
        </button>
        <button onclick="confirmAddIngredientToInventory('${esc(ingredientName)}')" style="flex: 1; padding: 12px; background: ${CONFIG.success_color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Add to Inventory
        </button>
      </div>
    </div>
  `);
}

async function confirmAddIngredientToInventory(ingredientName) {
  const quantity = parseFloat(document.getElementById('addInvQuantity')?.value) || 1;
  const unit = document.getElementById('addInvUnit')?.value || '';
  const expiration = document.getElementById('addInvExpiration')?.value || '';

  const knowledge = getIngredientKnowledge(ingredientName);
  const category = knowledge?.category === 'Proteins' ? 'Meat & Seafood' :
                   knowledge?.category === 'Vegetables' || knowledge?.category === 'Fruits' ? 'Produce' :
                   knowledge?.category === 'Dairy' ? 'Dairy & Eggs' :
                   knowledge?.category === 'Grains' ? 'Pantry' : 'Other';

  const newItem = {
    id: `inv_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type: 'inventory',
    name: capitalize(ingredientName),
    category: category,
    quantity: quantity,
    unit: unit,
    expirationDate: expiration || null,
    purchaseDate: getToday(),
    image_url: getIngredientImage(ingredientName) || ''
  };

  await storage.create(newItem);
  state.inventory.push(newItem);

  closeModal();
  showToast(`${newItem.name} added to inventory!`, 'success');
  render();
}

// --- Show "ate something else" option ---
function showAteSomethingElse(meal) {
  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h3 style="font-size: 18px; font-weight: 700; margin-bottom: ${CONFIG.space_md};">What did you eat?</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button onclick="closeModal(); showDifferentRecipePicker('${meal}')"
          style="padding: 14px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: ${CONFIG.text_color}; cursor: pointer; text-align: left; font-size: 15px;">
          A different recipe
        </button>
        <button onclick="closeModal(); showTakeoutLogger('${meal}')"
          style="padding: 14px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: ${CONFIG.text_color}; cursor: pointer; text-align: left; font-size: 15px;">
          Takeout / Eating out
        </button>
        <button onclick="closeModal()" style="width: 100%; padding: 12px; background: transparent; color: ${CONFIG.text_muted}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
      </div>
    </div>
  `);
}

// --- Suggestions modal ---
function showSuggestionsModal(filterTerm = '') {
  const suggestions = getRecipeSuggestions(filterTerm);

  if (suggestions.length === 0 && !filterTerm) {
    showToast('No recipes to suggest. Add some recipes first!', 'info');
    return;
  }

  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h2 class="text-2xl font-bold mb-4">💡 Recipe Suggestions</h2>

      <div class="mb-4">
        <input type="text" id="suggestionFilter"
               value="${esc(filterTerm)}"
               placeholder="What are you in the mood for? (e.g., chicken, quick, breakfast)"
               class="w-full px-3 py-2 border rounded"
               onkeyup="if(event.key === 'Enter') { filterSuggestions(); }" />
        <button onclick="filterSuggestions()"
                class="mt-2 px-4 py-2 rounded button-hover w-full" style="background: ${CONFIG.primary_action_color}; color: white;">
          Search
        </button>
      </div>

      <p id="suggestionsDescription" class="mb-4" style="color: ${CONFIG.text_muted};">
        ${filterTerm ? 'Showing recipes matching "' + esc(filterTerm) + '":' : 'Based on what you haven\'t made recently:'}
      </p>

      <div id="suggestionsContainer" class="space-y-3 max-h-96 overflow-y-auto">
        ${suggestions.length === 0 ? `
          <div class="text-center py-8" style="color: ${CONFIG.text_muted};">
            No recipes found matching "${esc(filterTerm)}". Try a different search term.
          </div>
        ` : suggestions.map(({ recipe, score, usage }) => {
          const neverUsed = usage.count === 0;
          const daysSince = usage.lastUsed ?
            Math.floor((new Date() - new Date(usage.lastUsed)) / (1000 * 60 * 60 * 24)) : null;

          return `
            <div class="flex items-center gap-3 p-3 rounded-lg" style="border: 1px solid ${CONFIG.divider_color}; background: ${CONFIG.surface_color};">
              ${recipeThumb(recipe) ? `
                <img loading="lazy" src="${esc(recipeThumb(recipe))}"
                     style="width:60px; height:60px; object-fit:cover; border-radius:8px;" />
              ` : `
                <div style="width:60px; height:60px; background:${CONFIG.surface_elevated}; border-radius:8px; display:flex; align-items:center; justify-content:center; padding:6px;">
                  <span style="font-size:10px;font-weight:700;color:${CONFIG.text_muted};text-align:center;line-height:1.2;-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden;">${esc(recipe.title)}</span>
                </div>
              `}
              <div class="flex-1">
                <div class="font-semibold">${esc(recipe.title)}</div>
                <div class="text-sm" style="color: ${CONFIG.text_muted};">
                  ${neverUsed ? '✨ Never made!' :
                    daysSince !== null ? 'Last made ' + daysSince + ' day' + (daysSince !== 1 ? 's' : '') + ' ago' :
                    'Made ' + usage.count + ' time' + (usage.count !== 1 ? 's' : '')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="flex justify-end mt-4">
        <button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">
          Close
        </button>
      </div>
    </div>
  `);
}

// ============================================================
// SECTION 20B: RECIPE DETAIL V2 (ChefIQ-style)
// ============================================================

function renderRecipeDetailV2(recipeId, opts = {}) {
  const r = getRecipeById(recipeId);
  if (!r) return `<div style="padding:40px 20px;text-align:center;color:var(--text-secondary);">
    <div style="font-size:48px;margin-bottom:16px;">🍽️</div>
    <div style="font-size:18px;font-weight:600;color:var(--text-primary);margin-bottom:8px;">Recipe not found</div>
    <div style="margin-bottom:24px;">This recipe may have been removed.</div>
    <a href="#" onclick="${esc(opts.onBack || 'history.back()')}; return false;" style="color:var(--accent);text-decoration:none;font-weight:600;">Go back</a>
  </div>`;

  const id = r.__backendId || r.id;
  const img = recipeThumb(r);
  const saved = isRecipeSaved(id);
  const hasVideo = recipeHasVideo(id);
  const clips = getRecipeVideoClips(id);
  const externalUrl = (r.recipe_url || '').trim() ? recipeUrl(r) : '';
  const sourceLabel = r.sourceType === 'chefiq' ? 'ChefIQ Guided' :
                      r.sourceType === 'imported' ? 'Imported' :
                      r.sourceType === 'claude' ? 'Chef Claude' : 'User-Created';

  // Parse ingredients
  let rows = [];
  if (Array.isArray(r.ingredientsRows) && r.ingredientsRows.length > 0) {
    rows = r.ingredientsRows;
  } else if (Array.isArray(r.ingredients) && r.ingredients.length > 0) {
    rows = r.ingredients.map(ing => ({ qty: ing.amount || '', unit: ing.unit || '', name: ing.item || ing.name || '', group: ing.group || 'Other' }));
  }
  const grouped = {};
  rows.forEach(x => { const g = x.group || 'Other'; if (!grouped[g]) grouped[g] = []; grouped[g].push(x); });
  const groupOrder = Object.keys(grouped);

  // Parse instructions
  const rawInstructions = Array.isArray(r.instructions) ? r.instructions.join('\n') : (r.instructions || '').trim();
  const instructionSteps = [];
  if (rawInstructions) {
    const lines = rawInstructions.split('\n');
    let currentStep = null;
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (/^\d+[\.\)]\s*/.test(trimmed)) {
        if (currentStep) instructionSteps.push(currentStep);
        currentStep = { header: trimmed, details: [] };
      } else if (currentStep) {
        currentStep.details.push(trimmed);
      } else {
        instructionSteps.push({ header: null, details: [trimmed] });
      }
    });
    if (currentStep) instructionSteps.push(currentStep);
  }

  // Parse tags
  const tagList = Array.isArray(r.tags) ? r.tags : (r.tags || '').split(',').map(t => t.trim()).filter(Boolean);

  // Ratings data
  const ratingsData = getRecipeRatings(id);

  // Comments data
  const comments = getRecipeComments(id);

  // Stat pills data
  const effort = getRecipeEffort(id);
  const effortLabel = effort ? (EFFORT_LEVELS[effort] ? EFFORT_LEVELS[effort].label : '') : '';
  const prepTime = (r.prepTime || '').trim();
  const cookTime = (r.cookTime || '').trim();
  let totalTime = '';
  if (prepTime && cookTime) {
    const pMin = parseInt(prepTime) || 0;
    const cMin = parseInt(cookTime) || 0;
    if (pMin + cMin > 0) totalTime = (pMin + cMin) + ' Min';
  } else if (cookTime) {
    totalTime = cookTime;
  }
  const servings = r.servings ? r.servings + ' Servings' : '';
  const description = (r.notes || '').trim();

  // Active tab
  const activeTab = state.recipeDetailTab || 'ingredients';

  // Edit action depends on context
  const editAction = opts.standalone
    ? `editRecipeFromDetail('${id}')`
    : `openEditRecipe('${id}')`;

  // Highlight time mentions in instruction text
  function highlightTimes(text) {
    return esc(text).replace(/(\d+\s*(?:min(?:ute)?s?|hrs?|hours?|seconds?))/gi, '<span class="time-highlight">$1</span>');
  }

  // Find related recipes for "Homemade Ingredient Options"
  function getRelatedRecipes() {
    if (!state.recipes || rows.length === 0) return [];
    const ingNames = new Set(rows.map(x => (x.name || '').toLowerCase().trim()));
    const related = [];
    for (const recipe of state.recipes) {
      if ((recipe.__backendId || recipe.id) === id) continue;
      if (recipe.isTip) continue;
      let rRows = [];
      if (Array.isArray(recipe.ingredientsRows)) rRows = recipe.ingredientsRows;
      else if (Array.isArray(recipe.ingredients)) rRows = recipe.ingredients.map(i => ({ name: i.item || i.name || '' }));
      let shared = 0;
      for (const row of rRows) {
        if (ingNames.has((row.name || '').toLowerCase().trim())) shared++;
      }
      if (shared >= 2 || (r.category && recipe.category === r.category)) {
        related.push(recipe);
      }
      if (related.length >= 6) break;
    }
    return related;
  }

  const relatedRecipes = getRelatedRecipes();

  return `
    <div style="flex:1;overflow-x:hidden;max-width:100vw;box-sizing:border-box;">
      <!-- HERO -->
      <div class="detail-hero">
        ${hasVideo && clips.length > 0 ? `
          <img src="${getStreamThumbnail(clips[0].cloudflareVideoId)}" alt="" class="detail-hero-media" onerror="this.style.display='none'">
          <button class="detail-play-btn" onclick="openVideoOverlay('recipe','${id}')">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <div class="detail-progress-bar"><div class="detail-progress-fill" style="width:0%"></div></div>
          <button class="detail-speaker-btn" onclick="openVideoOverlay('recipe','${id}')">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/></svg>
          </button>
        ` : img ? `
          <img src="${esc(img)}" alt="${esc(r.title)}" class="detail-hero-media" onerror="this.parentElement.querySelector('.detail-hero-placeholder').style.display='flex';this.style.display='none';">
          <div class="detail-hero-placeholder" style="display:none;"><span>${esc(r.title)}</span></div>
        ` : `
          <div class="detail-hero-placeholder"><span>${esc(r.title)}</span></div>
        `}
        <div class="detail-hero-overlay"></div>
        <button class="detail-hero-back" onclick="${esc(opts.onBack || 'history.back()')}">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <button class="detail-hero-edit" onclick="${esc(editAction)}" title="Edit recipe">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
        </button>
      </div>

      <!-- SOCIAL ROW -->
      <div class="detail-social-row">
        <div class="detail-rating">
          <div class="detail-stars">${_renderStars(parseFloat(ratingsData.averageRating) || 0)}</div>
          <span class="detail-rating-count">${ratingsData.totalRatings || 0}</span>
        </div>
        <button class="detail-likes" onclick="toggleSaveRecipe('${id}'); ${opts.standalone ? 'render()' : 'render()'};">
          <svg width="20" height="20" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" class="heart-icon ${saved ? 'liked' : ''}"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
          <span>${saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      <!-- CTA BUTTON -->
      ${hasVideo ? `
        <button class="guided-cooking-btn" onclick="openVideoOverlay('recipe','${id}')">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          ${r.sourceType === 'chefiq' ? 'Resume Guided Cooking' : 'Watch Cooking Video'}
        </button>
      ` : ''}

      <!-- SOURCE + TITLE -->
      <div class="detail-source">${esc(sourceLabel)}${r.category ? ' · ' + esc(r.category) : ''}</div>
      <h1 class="detail-title">${esc(r.title)}</h1>

      ${externalUrl ? `<a href="${esc(externalUrl)}" target="_blank" rel="noopener noreferrer" class="detail-external-link">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
        View original recipe &rarr;
      </a>` : ''}

      <!-- DELIVERY PROMPT CARD -->
      ${rows.length > 0 ? `
        <div class="delivery-prompt-card" onclick="showMealIngredientPicker('${id}')">
          <span class="delivery-icon">🛒</span>
          <p>Missing ingredients? Tap to add them to your grocery list.</p>
        </div>
      ` : ''}

      <!-- STAT PILLS -->
      ${(effortLabel || prepTime || totalTime || servings) ? `
        <div class="stat-pills">
          ${effortLabel ? `<div class="stat-pill"><span class="stat-label">Difficulty</span><span class="stat-value">${esc(effortLabel)}</span></div>` : ''}
          ${prepTime ? `<div class="stat-pill"><span class="stat-label">Active Time</span><span class="stat-value">${esc(prepTime)}</span></div>` : ''}
          ${totalTime ? `<div class="stat-pill"><span class="stat-label">Total Time</span><span class="stat-value">${esc(totalTime)}</span></div>` : ''}
          ${servings ? `<div class="stat-pill"><span class="stat-label">Yield</span><span class="stat-value">${esc(servings)}</span></div>` : ''}
          ${rows.length > 0 ? `<div class="stat-pill"><span class="stat-label">Ingredients</span><span class="stat-value">${rows.length}</span></div>` : ''}
        </div>
      ` : ''}

      <!-- DIET/TAG PILLS -->
      ${tagList.length > 0 ? `
        <div class="diet-tags">
          ${tagList.map(t => `<span class="diet-tag">${esc(t)}</span>`).join('')}
        </div>
      ` : ''}

      <!-- DESCRIPTION -->
      ${description ? `
        <div class="detail-description ${!state.recipeDetailDescExpanded ? 'truncated' : ''}" id="rd-description-text">
          ${esc(description)}
        </div>
        ${description.length > 120 ? `
          <div style="padding:0 20px 16px;">
            <button class="read-more-btn" id="rd-read-more-btn" onclick="toggleRecipeDescription()">
              ${state.recipeDetailDescExpanded ? 'Read Less' : 'Read More'}
            </button>
          </div>
        ` : ''}
      ` : ''}

      <!-- EFFORT SELECTOR -->
      <div style="padding:0 20px 16px;">
        <div style="color:var(--text-tertiary);font-size:12px;margin-bottom:6px;">Set Effort Level</div>
        <div style="display:flex;gap:8px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;">
          ${Object.entries(EFFORT_LEVELS).map(([key, e]) => {
            const active = effort === key;
            return `<button onclick="setRecipeEffort('${id}', ${active ? 'null' : `'${key}'`}); render();"
              style="padding:6px 16px;border-radius:20px;border:1px solid ${active ? e.border : 'rgba(255,255,255,0.12)'};background:${active ? e.bg : 'transparent'};color:${active ? e.color : 'var(--text-tertiary)'};font-size:13px;font-weight:${active ? '600' : '400'};cursor:pointer;white-space:nowrap;font-family:var(--font-sans);">
              ${e.label}
            </button>`;
          }).join('')}
        </div>
      </div>

      <!-- TABS -->
      <div class="detail-tabs">
        <button class="detail-tab ${activeTab === 'ingredients' ? 'active' : ''}" id="rd-tab-btn-ingredients" onclick="switchRecipeDetailTab('ingredients')">Ingredients</button>
        <button class="detail-tab ${activeTab === 'instructions' ? 'active' : ''}" id="rd-tab-btn-instructions" onclick="switchRecipeDetailTab('instructions')">Instructions</button>
      </div>

      <!-- INGREDIENTS PANEL -->
      <div id="rd-tab-ingredients" style="display:${activeTab === 'ingredients' ? 'block' : 'none'};">
        ${groupOrder.length ? `
          <div class="ingredient-list">
            ${groupOrder.map(g => `
              ${groupOrder.length > 1 ? `<div class="ingredient-group-label">${esc(g)}</div>` : ''}
              ${grouped[g].map(x => {
                const qty = (x.qty || '').trim();
                const unit = (x.unit || '').trim();
                const name = (x.name || '').trim();
                const amount = [qty, unit].filter(Boolean).join(' ');
                return `<div class="ingredient-row">
                  <span class="ingredient-name">${esc(capitalize(name))}</span>
                  ${amount ? `<span class="ingredient-amount">${esc(amount)}</span>` : ''}
                </div>`;
              }).join('')}
            `).join('')}
          </div>
          <button class="add-to-basket-btn" onclick="showMealIngredientPicker('${id}')">
            Add (${rows.length}) to Cart
          </button>
        ` : `
          <div style="padding:40px 20px;text-align:center;color:var(--text-tertiary);">No ingredients listed.</div>
        `}
      </div>

      <!-- INSTRUCTIONS PANEL -->
      <div id="rd-tab-instructions" style="display:${activeTab === 'instructions' ? 'block' : 'none'};">
        ${instructionSteps.length ? `
          <div class="instruction-phase">
            ${instructionSteps.map((step, idx) => `
              <div class="instruction-step">
                <div class="step-content">
                  <div class="step-number">Step ${idx + 1}</div>
                  <div class="step-text">
                    ${step.header ? highlightTimes(step.header.replace(/^\d+[\.\)]\s*/, '')) : ''}
                    ${step.details.map(d => highlightTimes(d)).join('<br>')}
                  </div>
                </div>
                <span class="step-chevron">
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
                </span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="padding:40px 20px;text-align:center;color:var(--text-tertiary);">No instructions available.</div>
        `}
      </div>

      <!-- HOMEMADE INGREDIENT OPTIONS -->
      ${relatedRecipes.length > 0 ? `
        <div class="homemade-section">
          <div class="homemade-section-title">Related Recipes</div>
          <div class="recipe-carousel">
            ${relatedRecipes.map(rel => {
              const relId = rel.__backendId || rel.id;
              const relImg = recipeThumb(rel);
              const relSource = rel.sourceType === 'chefiq' ? 'ChefIQ' : rel.sourceType === 'imported' ? 'Imported' : rel.sourceType === 'claude' ? 'Chef Claude' : 'User';
              return `<div class="recipe-carousel-card" onclick="${opts.standalone ? `window.location.href='/recipe-detail.html?id=${relId}'` : `openRecipeView('${relId}')`}">
                <div class="carousel-card-media">
                  ${relImg ? `<img src="${esc(relImg)}" alt="${esc(rel.title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
                    <div class="no-photo" style="display:none;background:${getPlaceholderGradient(rel)};"></div>` : `<div class="no-photo" style="background:${getPlaceholderGradient(rel)};"></div>`}
                </div>
                <div class="carousel-card-info">
                  <span class="card-source">${esc(relSource)}</span>
                  <h3 class="card-title">${esc(rel.title)}</h3>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- RATINGS -->
      <div class="ratings-section" id="rd-ratings-container">
        ${_renderRatingsSection(id, ratingsData)}
      </div>

      <!-- COMMENTS -->
      <div class="comments-section" id="rd-comments-container">
        ${_renderCommentsSection(id, comments)}
      </div>

      <!-- ACTION BUTTONS -->
      ${!r.isTip ? `
        <div class="detail-actions-row">
          <button class="detail-action-btn primary" onclick="showAddToMealsModal('${id}')">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
            Add to My Meals
          </button>
          <button class="detail-action-btn secondary" onclick="toggleSaveRecipe('${id}'); render();">
            <svg width="18" height="18" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/></svg>
            ${saved ? 'Saved' : 'Save'}
          </button>
        </div>
      ` : ''}

      <div style="height:24px;"></div>
    </div>
  `;
}

// Helper: render star icons for a rating value
function _renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      html += '<span style="color:var(--accent);">★</span>';
    } else if (i - rating < 1 && i - rating > 0) {
      html += '<span style="color:var(--accent);">★</span>'; // half-star as full for simplicity
    } else {
      html += '<span style="color:var(--text-tertiary);">★</span>';
    }
  }
  return html;
}

// Helper: render the ratings section inner HTML
function _renderRatingsSection(recipeId, data) {
  const avg = parseFloat(data.averageRating) || 0;
  const total = data.totalRatings || 0;
  const userRating = data.userRating || 0;
  const dist = data.distribution || [0,0,0,0,0];
  const maxDist = Math.max(...dist, 1);

  return `
    <div class="ratings-section-title">Ratings</div>
    <div class="rating-summary">
      <div><span class="score-number">${avg > 0 ? avg : '—'}</span><span class="score-label"> / 5 Stars</span></div>
      <span class="rating-count">${total} Rating${total !== 1 ? 's' : ''}</span>
    </div>
    <div class="tap-to-rate">
      <div class="rate-stars">
        ${[1,2,3,4,5].map(s => `<button class="rate-star ${s <= userRating ? 'filled' : ''}" onclick="rateRecipe('${recipeId}', ${s})">★</button>`).join('')}
      </div>
      <span class="tap-to-rate-label">${userRating > 0 ? 'Your rating: ' + userRating + '/5' : 'Tap to rate'}</span>
    </div>
    <div class="star-distribution">
      ${[5,4,3,2,1].map(s => {
        const count = dist[s - 1] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `<div class="star-bar">
          <span class="star-bar-label">${s} STAR</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        </div>`;
      }).join('')}
    </div>
  `;
}

// Helper: render comments section inner HTML
function _renderCommentsSection(recipeId, comments) {
  function timeAgo(isoStr) {
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    if (days < 7) return days + 'd ago';
    return new Date(isoStr).toLocaleDateString();
  }

  return `
    <div class="comments-section-title">Comments (${comments.length})</div>
    ${comments.length > 0 ? comments.map(c => `
      <div class="comment">
        <div class="comment-avatar">${(c.username || 'U').charAt(0).toUpperCase()}</div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-username">${esc(c.username || 'User')}</span>
            <span class="comment-time">${timeAgo(c.timestamp)}</span>
          </div>
          <div class="comment-text">${esc(c.text)}</div>
          ${c.photo ? `<img src="${esc(c.photo)}" class="comment-photo" alt="Comment photo">` : ''}
          <div class="comment-actions">
            <button class="comment-action">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.75a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 5.25c0 .372-.063.734-.163 1.073a5.088 5.088 0 01-.582 1.189l-.13.197c-.155.234-.236.5-.236.775V9.5h4.362a2.25 2.25 0 012.178 2.828l-2.263 8.572a2.25 2.25 0 01-2.178 1.672H6.633z"/></svg>
              ${c.likes || 0}
            </button>
            <button class="comment-action">Reply</button>
          </div>
        </div>
      </div>
    `).join('') : `
      <div style="text-align:center;color:var(--text-tertiary);padding:16px 0;">No comments yet. Be the first!</div>
    `}
    <div class="comment-input-row">
      <input type="text" class="comment-input" id="rd-comment-input" placeholder="Add a comment..." onkeydown="if(event.key==='Enter')submitRecipeComment('${recipeId}')">
      <button class="comment-submit-btn" onclick="submitRecipeComment('${recipeId}')">Post</button>
    </div>
  `;
}

// Interactive functions for recipe detail
function switchRecipeDetailTab(tab) {
  const ingPanel = document.getElementById('rd-tab-ingredients');
  const instrPanel = document.getElementById('rd-tab-instructions');
  const ingTab = document.getElementById('rd-tab-btn-ingredients');
  const instrTab = document.getElementById('rd-tab-btn-instructions');
  if (!ingPanel || !instrPanel) return;
  if (tab === 'ingredients') {
    ingPanel.style.display = 'block';
    instrPanel.style.display = 'none';
    ingTab && ingTab.classList.add('active');
    instrTab && instrTab.classList.remove('active');
  } else {
    ingPanel.style.display = 'none';
    instrPanel.style.display = 'block';
    ingTab && ingTab.classList.remove('active');
    instrTab && instrTab.classList.add('active');
  }
  state.recipeDetailTab = tab;
}

function rateRecipe(recipeId, stars) {
  const data = saveRecipeRating(recipeId, stars);
  const container = document.getElementById('rd-ratings-container');
  if (container) container.innerHTML = _renderRatingsSection(recipeId, data);
  showToast('Thanks for rating!', 'success');
}

function submitRecipeComment(recipeId) {
  const input = document.getElementById('rd-comment-input');
  const text = (input ? input.value : '').trim();
  if (!text) return;
  const comments = addRecipeComment(recipeId, text, null);
  const container = document.getElementById('rd-comments-container');
  if (container) container.innerHTML = _renderCommentsSection(recipeId, comments);
  showToast('Comment posted!', 'success');
}

function toggleRecipeDescription() {
  state.recipeDetailDescExpanded = !state.recipeDetailDescExpanded;
  const desc = document.getElementById('rd-description-text');
  const btn = document.getElementById('rd-read-more-btn');
  if (desc) desc.classList.toggle('truncated');
  if (btn) btn.textContent = state.recipeDetailDescExpanded ? 'Read Less' : 'Read More';
}

// SECTION 21: INITIALIZATION
// ============================================================

// On page load, check for target view from navigation
(function initShared() {
  // Load from localStorage first for immediate display (Supabase data will override when loaded)
  loadAllState();
  loadCustomIngredientImages();

  // Check if we navigated here from another page
  const targetView = sessionStorage.getItem('yummy_target_view');
  if (targetView) {
    state.currentView = targetView;
    sessionStorage.removeItem('yummy_target_view');
  }

  // Setup keyboard shortcuts
  setupKeyboardShortcuts();
})();
