// ============================================================
// KITCHEN PAGE - js/kitchen.js
// All kitchen-page-specific functions
// ============================================================

// ===== KITCHEN CATEGORY GRADIENTS =====
const KITCHEN_CATEGORY_GRADIENTS = {
  'Proteins': 'linear-gradient(135deg, #8b1a1a, #3d0c0c)',
  'Grains & Pasta': 'linear-gradient(135deg, #b8860b, #3e2723)',
  'Vegetables': 'linear-gradient(135deg, #2e7d32, #1b3a1b)',
  'Dairy': 'linear-gradient(135deg, #455a64, #1a237e)',
  'Pantry Staples': 'linear-gradient(135deg, #8d6e63, #2c2c2c)',
  'Spices': 'linear-gradient(135deg, #bf5700, #5c1a00)',
  'Other': 'linear-gradient(135deg, #424242, #1a1a1a)'
};

// ===== KITCHEN INGREDIENTS DATA =====
const KITCHEN_INGREDIENTS = {
  'Proteins': {
    items: [
      { name: 'Chicken', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop', tips: { methods: ['Pan-sear skin-side down 6-7 min for crispy skin, flip and finish 5 min', 'Bake boneless breasts at 425\u00b0F for 18-22 min', 'Poach in barely simmering broth for 12-15 min for juicy shredded chicken', 'Grill thighs over medium-high heat 5-6 min per side'], storage: 'Raw 1-2 days in fridge, cooked 3-4 days. Freeze raw up to 9 months.', prep: 'Pat dry with paper towels before cooking for better browning. Pound breasts to even thickness.', pairings: 'Lemon, garlic, thyme, rosemary, paprika, honey, soy sauce' } },
      { name: 'Beef', image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=200&h=200&fit=crop', tips: { methods: ['Sear in a ripping hot cast iron pan 3-4 min per side for steak', 'Braise tough cuts low and slow at 300\u00b0F for 3-4 hours', 'Brown ground beef over medium-high heat, breaking into pieces', 'Reverse sear: oven at 250\u00b0F until 10\u00b0 below target, then sear'], storage: 'Raw steaks 3-5 days in fridge, ground beef 1-2 days. Freeze up to 12 months.', prep: 'Let steaks come to room temperature 30-45 min before cooking. Season generously with salt.', pairings: 'Black pepper, garlic, mushrooms, red wine, blue cheese, onions' } },
      { name: 'Salmon', image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=200&h=200&fit=crop', tips: { methods: ['Pan-sear skin-side down 4 min, flip and cook 2-3 min more', 'Bake at 400\u00b0F for 12-15 min until flaky', 'Broil 4-6 inches from heat for 8-10 min', 'Poach in court bouillon at a gentle simmer for 10 min'], storage: 'Fresh 1-2 days in fridge. Freeze up to 3 months wrapped tightly.', prep: 'Remove pin bones with tweezers. Pat skin dry for crispier results.', pairings: 'Dill, lemon, capers, soy sauce, ginger, avocado, asparagus' } },
      { name: 'Shrimp', image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=200&h=200&fit=crop', tips: { methods: ['Saut\u00e9 over high heat 2-3 min per side until pink and curled', 'Grill on skewers over medium-high 2 min per side', 'Poach in seasoned water just until pink, about 3 min'], storage: 'Fresh 1-2 days in fridge. Frozen shrimp keeps up to 6 months.', prep: 'Devein by running a knife along the back. Thaw frozen shrimp under cold running water.', pairings: 'Garlic, butter, lemon, chili flakes, Old Bay, coconut milk, lime' } },
      { name: 'Tofu', image: 'https://images.unsplash.com/photo-1628689469838-524a4a973b8e?w=200&h=200&fit=crop', tips: { methods: ['Press 20 min, cube and pan-fry in oil until golden on all sides', 'Bake at 400\u00b0F for 25-30 min, flipping halfway', 'Crumble and scramble like eggs with turmeric and veggies', 'Deep fry cubes at 375\u00b0F for 3-4 min until crispy shell forms'], storage: 'Opened tofu lasts 3-5 days submerged in water, changed daily. Freeze to change texture.', prep: 'Press firm tofu 20-30 min between towels with weight to remove excess water.', pairings: 'Soy sauce, sesame oil, ginger, garlic, scallions, chili, peanuts' } },
      { name: 'Eggs', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop', tips: { methods: ['Scramble over low heat, stirring constantly for creamy curds', 'Fry in butter over medium-low, basting whites with hot fat', 'Soft-boil 6.5 min in boiling water, ice bath immediately', 'Hard-boil 10-12 min in boiling water, then ice bath'], storage: 'Raw eggs 3-5 weeks in fridge. Hard-boiled eggs 1 week in fridge.', prep: 'Bring to room temperature for more even cooking. Crack on a flat surface to avoid shell fragments.', pairings: 'Cheese, herbs, bacon, avocado, hot sauce, toast, smoked salmon' } },
      { name: 'Pork', image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=200&h=200&fit=crop', tips: { methods: ['Sear chops 4 min per side, rest 5 min before serving', 'Slow roast shoulder at 275\u00b0F for 6-8 hours until fork tender', 'Stir-fry thin slices over high heat for 3-4 min', 'Grill tenderloin over medium heat 15-20 min, turning occasionally'], storage: 'Raw 3-5 days in fridge, cooked 3-4 days. Freeze raw up to 6 months.', prep: 'Brine chops in saltwater 30 min for juicier results. Score fat cap on roasts.', pairings: 'Apple, sage, garlic, mustard, brown sugar, ginger, fennel' } },
      { name: 'Turkey', image: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=200&h=200&fit=crop', tips: { methods: ['Roast whole bird at 325\u00b0F, about 13 min per pound', 'Brown ground turkey over medium-high heat 6-8 min', 'Pan-sear cutlets 3-4 min per side', 'Smoke at 275\u00b0F for about 30 min per pound'], storage: 'Raw 1-2 days in fridge, cooked 3-4 days. Freeze raw up to 9 months.', prep: 'Dry brine overnight with salt for crispier skin and juicier meat.', pairings: 'Cranberry, sage, thyme, stuffing, gravy, sweet potatoes, rosemary' } },
      { name: 'Tuna', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop', tips: { methods: ['Sear over highest heat 1-2 min per side for rare center', 'Grill steaks over high heat 2 min per side', 'Make poke bowls with sushi-grade tuna cubed raw'], storage: 'Fresh sushi-grade 1 day in fridge. Canned tuna 3-5 days after opening.', prep: 'Pat very dry. Use sushi-grade only for raw preparations.', pairings: 'Sesame, soy sauce, wasabi, avocado, ginger, sriracha, seaweed' } }
    ]
  },
  'Grains & Pasta': {
    items: [
      { name: 'Rice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop', tips: { methods: ['Simmer white rice 1:1.5 ratio covered for 18 min, rest 5 min', 'Rice cooker with measured water for foolproof results', 'Toast in oil before adding water for nutty pilaf flavor', 'Bake in oven at 350\u00b0F covered for 25 min'], storage: 'Cooked rice 4-6 days in fridge. Cool quickly to prevent bacteria. Freeze up to 6 months.', prep: 'Rinse rice 2-3 times until water runs clear to remove excess starch.', pairings: 'Soy sauce, sesame, beans, curry, stir-fry vegetables, lime, cilantro' } },
      { name: 'Pasta', image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=200&h=200&fit=crop', tips: { methods: ['Boil in heavily salted water until al dente, 1-2 min less than package', 'Finish cooking in the sauce with reserved pasta water', 'Bake in casseroles at 375\u00b0F for 25-30 min'], storage: 'Cooked pasta 3-5 days in fridge tossed with a little oil. Dry pasta keeps 1-2 years.', prep: 'Use 4-6 quarts of water per pound. Salt water like the sea. Save a cup of pasta water.', pairings: 'Tomato sauce, garlic, parmesan, olive oil, basil, cream, mushrooms' } },
      { name: 'Bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop', tips: { methods: ['Toast slices at 350\u00b0F or in toaster for 2-3 min', 'Make croutons by cubing and baking at 375\u00b0F for 10-12 min with oil', 'Grill thick slices brushed with olive oil for 1-2 min per side'], storage: 'Room temperature 2-3 days in paper bag. Freeze sliced bread up to 3 months.', prep: 'Stale bread is perfect for breadcrumbs, croutons, and French toast.', pairings: 'Butter, olive oil, garlic, cheese, soups, eggs, avocado' } },
      { name: 'Quinoa', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop', tips: { methods: ['Simmer 1:2 ratio for 15 min until water absorbed and tails visible', 'Toast dry in pan 2 min before adding water for nuttier flavor', 'Cook in broth instead of water for more flavor'], storage: 'Cooked quinoa 5-7 days in fridge. Freeze cooked quinoa up to 8 months.', prep: 'Rinse thoroughly to remove bitter saponin coating. Fluff with fork after cooking.', pairings: 'Black beans, avocado, lemon, feta, roasted vegetables, cilantro, lime' } },
      { name: 'Oats', image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=200&h=200&fit=crop', tips: { methods: ['Stovetop porridge: 1:2 ratio, simmer 5 min stirring occasionally', 'Overnight oats: equal parts oats and milk, refrigerate 6+ hours', 'Baked oatmeal at 350\u00b0F for 35-40 min'], storage: 'Dry oats keep 1-2 years in airtight container. Overnight oats 3-4 days in fridge.', prep: 'Use rolled oats for porridge, steel-cut for chewier texture (cook 20-30 min).', pairings: 'Banana, berries, honey, cinnamon, peanut butter, maple syrup, nuts' } }
    ]
  },
  'Vegetables': {
    items: [
      { name: 'Broccoli', image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=200&h=200&fit=crop', tips: { methods: ['Roast florets at 425\u00b0F for 20-25 min until charred edges', 'Steam 4-5 min until bright green and crisp-tender', 'Stir-fry over high heat 3-4 min with garlic', 'Blanch 2 min then shock in ice water to preserve color'], storage: 'Fresh 3-5 days in fridge in a loose bag. Freeze blanched florets up to 12 months.', prep: 'Cut into even-sized florets. Peel and slice the stem too \u2014 it is delicious.', pairings: 'Garlic, lemon, parmesan, sesame, soy sauce, cheddar, chili flakes' } },
      { name: 'Spinach', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop', tips: { methods: ['Saut\u00e9 with garlic in olive oil 1-2 min until just wilted', 'Add raw to smoothies or salads', 'Wilt into soups and pasta at the very end of cooking'], storage: 'Fresh 5-7 days in fridge wrapped in paper towel in a bag. Freeze blanched up to 10 months.', prep: 'Wash thoroughly as spinach can be sandy. Remove thick stems from mature spinach.', pairings: 'Garlic, lemon, nutmeg, feta, eggs, cream, pine nuts, mushrooms' } },
      { name: 'Peppers', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop', tips: { methods: ['Roast whole under broiler turning until charred all over, then steam peel', 'Saut\u00e9 strips over medium-high heat 5-6 min', 'Stuff halved peppers and bake at 375\u00b0F for 25-30 min', 'Grill halves over medium heat 4-5 min per side'], storage: 'Whole peppers 1-2 weeks in fridge. Cut peppers 3-5 days. Freeze chopped up to 6 months.', prep: 'Remove seeds and white membranes. Slice along natural ridges for even pieces.', pairings: 'Onions, garlic, cumin, cheese, rice, beans, lime, cilantro' } },
      { name: 'Onions', image: 'https://images.unsplash.com/photo-1518977676601-b28d17ceb46e?w=200&h=200&fit=crop', tips: { methods: ['Caramelize sliced onions over low heat 35-45 min stirring occasionally', 'Saut\u00e9 diced over medium heat 5-7 min until translucent', 'Roast wedges at 400\u00b0F for 30-35 min', 'Quick pickle sliced red onion in vinegar 30 min'], storage: 'Whole onions 2-3 months in cool dark place. Cut onions 7-10 days in fridge.', prep: 'Chill before cutting to reduce tears. Cut in half through root, then slice.', pairings: 'Garlic, butter, thyme, balsamic, beef, peppers, tomatoes' } },
      { name: 'Tomatoes', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200&h=200&fit=crop', tips: { methods: ['Slow roast halved at 275\u00b0F for 2-3 hours for concentrated flavor', 'Saut\u00e9 with garlic for quick pan sauce in 10 min', 'Blister cherry tomatoes in hot pan 3-4 min', 'Raw in salads when in season for best flavor'], storage: 'Never refrigerate whole tomatoes \u2014 store at room temperature. Cut tomatoes 2-3 days in fridge.', prep: 'Score bottom with X and blanch 30 sec for easy peeling. Remove seeds for less watery sauces.', pairings: 'Basil, mozzarella, garlic, olive oil, balsamic, oregano, onions' } },
      { name: 'Potatoes', image: 'https://images.unsplash.com/photo-1518977676601-b28d17ceb46e?w=200&h=200&fit=crop', tips: { methods: ['Roast cubed at 425\u00b0F for 30-35 min, tossing halfway', 'Boil whole starting in cold salted water 20-25 min until fork tender', 'Mash boiled potatoes with butter and warm cream', 'Bake whole at 400\u00b0F for 50-60 min directly on rack'], storage: 'Cool dark place 2-3 weeks. Do not refrigerate raw \u2014 starch converts to sugar. Cooked 3-5 days in fridge.', prep: 'Scrub well. Soak cut potatoes in cold water 30 min to remove starch for crispier results.', pairings: 'Butter, rosemary, garlic, cheese, sour cream, chives, bacon' } },
      { name: 'Garlic', image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2571?w=200&h=200&fit=crop', tips: { methods: ['Mince and saut\u00e9 30-60 seconds until fragrant \u2014 burns quickly', 'Roast whole head at 400\u00b0F for 40 min wrapped in foil for sweet spread', 'Slice thin and fry in oil for crispy garlic chips', 'Add raw to dressings and marinades for sharp flavor'], storage: 'Whole head 3-5 months in cool dry place. Peeled cloves 1 week in fridge. Do not freeze raw.', prep: 'Crush clove with side of knife to easy peel. Let minced garlic sit 10 min to develop allicin.', pairings: 'Olive oil, butter, lemon, herbs, pasta, bread, ginger, chili' } },
      { name: 'Mushrooms', image: 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=200&h=200&fit=crop', tips: { methods: ['Saut\u00e9 in single layer over high heat 5-6 min without stirring until golden', 'Roast at 400\u00b0F for 20-25 min until edges crisp', 'Grill large caps over medium heat 4-5 min per side', 'Simmer in broth for rich umami soup base'], storage: 'Fresh 7-10 days in fridge in paper bag \u2014 never plastic. Dried mushrooms keep 1 year.', prep: 'Wipe clean with damp cloth \u2014 never soak. Slice evenly. Do not crowd the pan.', pairings: 'Butter, garlic, thyme, soy sauce, cream, parsley, shallots, wine' } },
      { name: 'Carrots', image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=200&h=200&fit=crop', tips: { methods: ['Roast halved at 400\u00b0F for 25-30 min with honey glaze', 'Steam 5-7 min until just tender', 'Saut\u00e9 coins in butter with thyme 8-10 min', 'Eat raw with dips, or shred into salads'], storage: 'Remove green tops. Store in fridge 3-4 weeks. Freeze blanched up to 12 months.', prep: 'Peel or scrub well. Cut on the bias for more surface area and prettier presentation.', pairings: 'Butter, honey, ginger, cumin, orange, dill, thyme, parsley' } },
      { name: 'Zucchini', image: 'https://images.unsplash.com/photo-1563252722-6434563a2a2f?w=200&h=200&fit=crop', tips: { methods: ['Grill sliced lengthwise over medium heat 3-4 min per side', 'Saut\u00e9 half-moons in olive oil 4-5 min over medium-high', 'Spiralize into zoodles as pasta substitute', 'Roast at 425\u00b0F for 15-20 min until lightly charred'], storage: 'Whole in fridge 4-5 days. Do not freeze raw \u2014 gets mushy. Freeze cooked/shredded up to 3 months.', prep: 'Salt slices and let sit 10 min to draw out moisture for better browning. No need to peel.', pairings: 'Garlic, tomatoes, parmesan, basil, lemon, feta, mint, pine nuts' } }
    ]
  },
  'Dairy': {
    items: [
      { name: 'Cheese', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&h=200&fit=crop', tips: { methods: ['Melt low and slow for sauces \u2014 high heat makes it stringy', 'Grate cold cheese for even melting', 'Bring to room temperature before serving on a board', 'Broil on top of dishes for golden bubbly finish'], storage: 'Wrap in parchment then plastic. Hard cheese 3-4 weeks, soft cheese 1-2 weeks in fridge.', prep: 'Grate your own \u2014 pre-shredded has anti-caking agents that affect melting.', pairings: 'Bread, wine, fruit, honey, nuts, crackers, tomatoes, basil' } },
      { name: 'Butter', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop', tips: { methods: ['Brown butter in saucepan over medium heat until nutty and golden', 'Cream softened butter with herbs for compound butter', 'Use cold cubed butter for flaky pastry', 'Clarify by simmering and skimming for high-heat cooking'], storage: 'Fridge 1-2 months, counter 1-2 days in butter dish. Freeze up to 6 months.', prep: 'Soften at room temperature 30-45 min \u2014 do not microwave. Cut into cubes for faster softening.', pairings: 'Garlic, lemon, herbs, bread, pasta, steak, vegetables, baking' } },
      { name: 'Cream', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=200&h=200&fit=crop', tips: { methods: ['Whip cold heavy cream with chilled bowl and whisk to soft peaks', 'Simmer to reduce for thick pan sauces', 'Add to soups at end of cooking for richness'], storage: 'Heavy cream 2-3 weeks in fridge unopened. Once opened, use within 5-7 days.', prep: 'Chill bowl, whisk, and cream for best whipping results. Temper before adding to hot liquids.', pairings: 'Pasta, berries, chocolate, coffee, mushrooms, soups, potatoes' } },
      { name: 'Yogurt', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop', tips: { methods: ['Use as marinade tenderizer for meats 2-24 hours', 'Stir into sauces off heat as cream substitute', 'Base for dressings and dips with herbs and garlic'], storage: 'Fridge 1-2 weeks past sell date. Do not freeze \u2014 texture changes.', prep: 'Strain through cheesecloth 2+ hours for thick Greek-style yogurt.', pairings: 'Honey, berries, granola, cucumber, dill, mint, cumin, garlic' } },
      { name: 'Milk', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop', tips: { methods: ['Scald by heating to 180\u00b0F for custards and bread doughs', 'Make bechamel by whisking into butter-flour roux', 'Steam and froth for lattes and cappuccinos'], storage: 'Fridge up to 1 week after opening. Do not leave at room temperature over 2 hours.', prep: 'Bring to room temperature for baking. Whole milk gives richer results than skim.', pairings: 'Coffee, cereal, chocolate, baking, sauces, mashed potatoes, pancakes' } }
    ]
  },
  'Pantry Staples': {
    items: [
      { name: 'Olive Oil', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop', tips: { methods: ['Drizzle extra virgin raw over finished dishes for flavor', 'Saut\u00e9 over medium heat \u2014 smoke point around 375\u00b0F', 'Emulsify into dressings with acid and mustard', 'Infuse with herbs and garlic for flavored oil'], storage: 'Cool dark place up to 2 years unopened. Use opened bottles within 3-6 months. Never near stove.', prep: 'Use extra virgin for finishing and dressings, regular/light for high-heat cooking.', pairings: 'Garlic, lemon, basil, bread, tomatoes, pasta, vegetables, vinegar' } },
      { name: 'Soy Sauce', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200&h=200&fit=crop', tips: { methods: ['Add to stir-fries in last 1-2 min of cooking', 'Use as base for marinades with ginger and garlic', 'Mix into dipping sauces with rice vinegar and sesame oil', 'Splash into soups and stews for umami depth'], storage: 'Pantry 2-3 years unopened. Refrigerate after opening for best quality, lasts 1-2 years.', prep: 'Start with less than you think \u2014 you can always add more. Use low-sodium to control salt.', pairings: 'Ginger, garlic, sesame, rice, noodles, tofu, honey, lime, chili' } },
      { name: 'Flour', image: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=200&h=200&fit=crop', tips: { methods: ['Make roux by cooking equal parts flour and fat for sauces', 'Dredge proteins before pan-frying for crispy coating', 'Combine with water for simple thickening slurry'], storage: 'Airtight container in cool dry place 6-8 months. Whole wheat flour 3 months or freeze.', prep: 'Spoon and level for accurate measuring \u2014 scooping packs too much. Sift for lighter baked goods.', pairings: 'Butter, sugar, eggs, baking powder, milk, yeast, chocolate, vanilla' } },
      { name: 'Beans', image: 'https://images.unsplash.com/photo-1551463652-600572e9d8df?w=200&h=200&fit=crop', tips: { methods: ['Simmer soaked dried beans 1-2 hours until creamy', 'Pressure cook dried beans 25-35 min without soaking', 'Mash cooked beans for dips and spreads', 'Add canned beans to soups in last 15 min'], storage: 'Dried beans 1-2 years in airtight container. Cooked beans 3-5 days in fridge, freeze up to 6 months.', prep: 'Soak dried beans 8+ hours or quick soak by boiling 1 min then resting 1 hour. Salt after cooking.', pairings: 'Rice, cumin, garlic, onions, tomatoes, cilantro, lime, chili' } },
      { name: 'Lentils', image: 'https://images.unsplash.com/photo-1585996839363-2a23aa79dfc0?w=200&h=200&fit=crop', tips: { methods: ['Simmer red lentils 15-20 min until they break down for dal', 'Cook green/brown lentils 25-30 min for salads \u2014 they hold shape', 'Add to soups and stews for protein and body'], storage: 'Dried lentils 1 year in airtight container. Cooked 3-5 days in fridge, freeze up to 3 months.', prep: 'Rinse and pick through for debris. No soaking needed \u2014 much faster than beans.', pairings: 'Cumin, turmeric, garlic, onions, tomatoes, spinach, lemon, curry' } },
      { name: 'Coconut Milk', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop', tips: { methods: ['Simmer as base for curries and soups', 'Whip chilled full-fat coconut cream for dairy-free topping', 'Use in smoothies for creamy tropical flavor', 'Cook rice in coconut milk for fragrant side dish'], storage: 'Canned 2-5 years in pantry. Opened 4-6 days in fridge. Shake can well before opening.', prep: 'Full-fat for cooking and richness, light for lighter dishes. Stir well as it separates.', pairings: 'Curry, lemongrass, ginger, lime, chili, rice, mango, basil, shrimp' } }
    ]
  }
};

// ===== INGREDIENT SYNONYMS =====
const INGREDIENT_SYNONYMS = {
  'chicken': ['chkn', 'poultry', 'hen', 'wing', 'wings', 'drumstick', 'drumsticks', 'thigh', 'thighs', 'breast', 'breasts', 'tender', 'tenders'],
  'beef': ['ground beef', 'steak', 'sirloin', 'ribeye', 'brisket', 'chuck', 'flank', 'filet', 'mignon', 'roast', 'short rib', 'short ribs'],
  'pork': ['bacon', 'ham', 'sausage', 'chorizo', 'prosciutto', 'pancetta', 'tenderloin', 'chop', 'chops', 'pulled pork', 'ribs'],
  'salmon': ['smoked salmon', 'lox', 'salmon fillet'],
  'shrimp': ['prawn', 'prawns', 'scampi'],
  'tuna': ['ahi', 'seared tuna', 'tuna steak'],
  'turkey': ['ground turkey', 'turkey breast'],
  'pasta': ['spaghetti', 'penne', 'linguine', 'fettuccine', 'rigatoni', 'macaroni', 'fusilli', 'orzo', 'lasagna', 'noodles', 'noodle', 'angel hair', 'bucatini', 'ziti', 'rotini', 'farfalle', 'tortellini', 'ravioli'],
  'rice': ['jasmine rice', 'basmati', 'fried rice', 'risotto', 'wild rice', 'brown rice', 'white rice', 'sticky rice', 'arborio', 'sushi rice'],
  'bread': ['toast', 'baguette', 'ciabatta', 'sourdough', 'pita', 'naan', 'focaccia', 'brioche', 'roll', 'rolls', 'bun', 'buns', 'tortilla', 'tortillas', 'flatbread'],
  'cheese': ['cheddar', 'mozzarella', 'parmesan', 'gruyere', 'feta', 'gouda', 'brie', 'swiss', 'provolone', 'ricotta', 'cream cheese', 'goat cheese', 'mascarpone', 'pecorino', 'jack', 'colby'],
  'cream': ['heavy cream', 'whipping cream', 'sour cream', 'cr\u00e8me fra\u00eeche', 'half and half'],
  'milk': ['whole milk', 'skim milk', 'almond milk', 'oat milk', 'coconut milk', 'buttermilk', 'evaporated milk', 'condensed milk'],
  'yogurt': ['greek yogurt', 'plain yogurt'],
  'butter': ['unsalted butter', 'salted butter', 'ghee', 'clarified butter'],
  'eggs': ['egg', 'egg whites', 'egg yolks', 'yolk', 'yolks'],
  'tomatoes': ['tomato', 'cherry tomatoes', 'grape tomatoes', 'roma', 'sun-dried tomatoes', 'tomato paste', 'tomato sauce', 'crushed tomatoes', 'diced tomatoes', 'marinara'],
  'peppers': ['pepper', 'bell pepper', 'bell peppers', 'jalape\u00f1o', 'jalapeno', 'serrano', 'habanero', 'poblano', 'chili', 'chili pepper', 'chipotle', 'cayenne'],
  'onions': ['onion', 'red onion', 'white onion', 'yellow onion', 'sweet onion', 'shallot', 'shallots', 'scallion', 'scallions', 'green onion', 'green onions', 'spring onion', 'leek', 'leeks', 'chive', 'chives'],
  'potatoes': ['potato', 'sweet potato', 'sweet potatoes', 'yukon', 'russet', 'fingerling', 'red potato', 'mashed potato', 'hash brown'],
  'garlic': ['garlic clove', 'garlic cloves', 'minced garlic', 'garlic powder'],
  'mushrooms': ['mushroom', 'shiitake', 'portobello', 'cremini', 'button mushroom', 'oyster mushroom', 'chanterelle', 'porcini', 'enoki'],
  'spinach': ['baby spinach'],
  'broccoli': ['broccolini', 'broccoli rabe'],
  'carrots': ['carrot', 'baby carrots'],
  'zucchini': ['courgette', 'summer squash'],
  'beans': ['black beans', 'kidney beans', 'pinto beans', 'cannellini', 'white beans', 'navy beans', 'chickpeas', 'garbanzo', 'lima beans', 'edamame'],
  'lentils': ['lentil', 'red lentils', 'green lentils', 'brown lentils', 'dal', 'daal'],
  'tofu': ['firm tofu', 'silken tofu', 'extra firm tofu', 'tempeh'],
  'flour': ['all-purpose flour', 'bread flour', 'whole wheat flour', 'cake flour', 'self-rising flour', 'almond flour', 'coconut flour'],
  'olive oil': ['extra virgin olive oil', 'evoo'],
  'soy sauce': ['soya sauce', 'tamari', 'shoyu', 'liquid aminos'],
  'coconut milk': ['coconut cream', 'coconut'],
  'oats': ['oatmeal', 'rolled oats', 'steel cut oats', 'instant oats', 'overnight oats'],
  'quinoa': ['quinoa salad']
};

// ===== KITCHEN INGREDIENT FUNCTIONS =====

function getIngredientPhoto(ingredientName) {
  const custom = localStorage.getItem('kitchenIngredientPhoto_' + ingredientName);
  if (custom) return custom;
  const customIngs = getCustomKitchenIngredients();
  const ci = customIngs.find(i => i.name === ingredientName);
  if (ci && ci.photo && ci.photo.startsWith('data:')) return ci.photo;
  let hardcodedImg = '';
  Object.values(KITCHEN_INGREDIENTS).forEach(cat => {
    cat.items.forEach(item => {
      if (item.name === ingredientName && item.image) hardcodedImg = item.image;
    });
  });
  if (hardcodedImg) return hardcodedImg;
  const recipes = (state.recipes || []).filter(r => !r.isDraft && !r.isTip);
  const lowerName = ingredientName.toLowerCase();
  for (const r of recipes) {
    const ings = recipeIngList(r);
    const hasIng = ings.some(ing => {
      const n = (ing.name || '').toLowerCase();
      return n.includes(lowerName) || lowerName.includes(n);
    });
    if (hasIng) {
      const thumb = recipeThumb(r);
      if (thumb) return thumb;
    }
  }
  return '';
}

function saveIngredientPhoto(ingredientName, dataUrl) {
  localStorage.setItem('kitchenIngredientPhoto_' + ingredientName, dataUrl);
}

function handleIngredientPhotoUpload(ingredientName, input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxSize = 400;
      let w = img.width, h = img.height;
      if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
      else { w = Math.round(w * maxSize / h); h = maxSize; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      saveIngredientPhoto(ingredientName, compressed);
      render();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}

function getIngredientGradient(ingredientName) {
  const customIngs = getCustomKitchenIngredients();
  for (const ci of customIngs) {
    if (ci.name === ingredientName) return KITCHEN_CATEGORY_GRADIENTS[ci.category] || KITCHEN_CATEGORY_GRADIENTS['Other'];
  }
  for (const [catName, catData] of Object.entries(KITCHEN_INGREDIENTS)) {
    for (const item of catData.items) {
      if (item.name === ingredientName) return KITCHEN_CATEGORY_GRADIENTS[catName] || KITCHEN_CATEGORY_GRADIENTS['Other'];
    }
  }
  return KITCHEN_CATEGORY_GRADIENTS['Other'];
}

function getCustomKitchenIngredients() {
  try { return JSON.parse(localStorage.getItem('customKitchenIngredients') || '[]'); }
  catch { return []; }
}

function saveCustomKitchenIngredients(items) {
  localStorage.setItem('customKitchenIngredients', JSON.stringify(items));
}

function addCustomKitchenIngredient(name, category, photoDataUrl) {
  const items = getCustomKitchenIngredients();
  if (items.some(i => i.name.toLowerCase() === name.toLowerCase())) {
    showToast('Ingredient already exists');
    return;
  }
  items.push({ name, category: category || 'Other', photo: photoDataUrl || '', tips: null });
  saveCustomKitchenIngredients(items);
  autoLinkRecipesToIngredient(name);
  showToast(name + ' added to Kitchen');
  state._showAddIngredientModal = false;
  render();
}

function deleteKitchenIngredient(ingredientName) {
  const customs = getCustomKitchenIngredients();
  const updated = customs.filter(ci => ci.name !== ingredientName);
  saveCustomKitchenIngredients(updated);
  localStorage.removeItem('kitchenRecipeLinks_' + ingredientName);
  localStorage.removeItem('kitchenCustomTips_' + ingredientName);
  localStorage.removeItem('kitchenIngredientPhoto_' + ingredientName);
  state._showDeleteIngredientModal = false;
  state.kitchenSelectedIngredient = null;
  showToast(ingredientName + ' deleted from Kitchen');
  navigateTo('kitchen');
}

function isHardcodedIngredient(ingredientName) {
  for (const catData of Object.values(KITCHEN_INGREDIENTS)) {
    if (catData.items.some(item => item.name === ingredientName)) return true;
  }
  return false;
}

function renderDeleteIngredientModal(ingredientName) {
  if (!state._showDeleteIngredientModal) return '';
  const isHardcoded = isHardcodedIngredient(ingredientName);
  return `
    <div onclick="if(event.target===this){state._showDeleteIngredientModal=false;render();}" style="position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:24px;">
      <div style="background:${CONFIG.surface_elevated};border-radius:16px;width:100%;max-width:340px;padding:24px;box-shadow:0 8px 32px rgba(0,0,0,0.5);text-align:center;">
        <h3 style="font-size:18px;font-weight:700;color:${CONFIG.text_color};margin:0 0 12px;">Delete ${esc(ingredientName)} from your kitchen?</h3>
        <p style="font-size:14px;color:${CONFIG.text_muted};margin:0 0 24px;line-height:1.5;">This won't delete any recipes or food log entries.</p>
        <div style="display:flex;gap:10px;">
          <button onclick="state._showDeleteIngredientModal=false;render();" style="flex:1;padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:none;color:${CONFIG.text_color};font-size:15px;cursor:pointer;font-family:${CONFIG.font_family};">Cancel</button>
          <button onclick="${isHardcoded ? `hideHardcodedIngredient('${esc(ingredientName)}')` : `deleteKitchenIngredient('${esc(ingredientName)}')`}" style="flex:1;padding:12px;border-radius:10px;border:none;background:#e53e3e;color:white;font-size:15px;font-weight:600;cursor:pointer;font-family:${CONFIG.font_family};">Delete</button>
        </div>
      </div>
    </div>
  `;
}

function getHiddenIngredients() {
  try { return JSON.parse(localStorage.getItem('hiddenKitchenIngredients') || '[]'); }
  catch { return []; }
}

function hideHardcodedIngredient(ingredientName) {
  const hidden = getHiddenIngredients();
  if (!hidden.includes(ingredientName)) hidden.push(ingredientName);
  localStorage.setItem('hiddenKitchenIngredients', JSON.stringify(hidden));
  localStorage.removeItem('kitchenRecipeLinks_' + ingredientName);
  localStorage.removeItem('kitchenCustomTips_' + ingredientName);
  localStorage.removeItem('kitchenIngredientPhoto_' + ingredientName);
  state._showDeleteIngredientModal = false;
  state.kitchenSelectedIngredient = null;
  showToast(ingredientName + ' removed from Kitchen');
  navigateTo('kitchen');
}

function getKitchenRecipeLinks(ingredientName) {
  try { return JSON.parse(localStorage.getItem('kitchenRecipeLinks_' + ingredientName) || '{}'); }
  catch { return {}; }
}

function saveKitchenRecipeLinks(ingredientName, links) {
  localStorage.setItem('kitchenRecipeLinks_' + ingredientName, JSON.stringify(links));
}

function removeRecipeFromIngredient(ingredientName, recipeId) {
  const links = getKitchenRecipeLinks(ingredientName);
  links[recipeId] = 'excluded';
  saveKitchenRecipeLinks(ingredientName, links);
  const recipe = getRecipeById(recipeId);
  const recipeName = recipe ? recipe.title : 'Recipe';
  showToast('Removed ' + recipeName + ' from ' + ingredientName + '.');
  render();
}

function addRecipeToIngredient(ingredientName, recipeId) {
  const links = getKitchenRecipeLinks(ingredientName);
  links[recipeId] = 'included';
  saveKitchenRecipeLinks(ingredientName, links);
  state._showLinkRecipeModal = false;
  render();
}

function autoLinkRecipesToIngredient(ingredientName) {
  // No-op - matching is computed at render time with exclusion/inclusion overrides
}

function getAllKitchenIngredientNames() {
  const names = [];
  Object.values(KITCHEN_INGREDIENTS).forEach(cat => cat.items.forEach(item => names.push(item.name)));
  getCustomKitchenIngredients().forEach(ci => names.push(ci.name));
  return names;
}

function getMatchingRecipesForIngredient(ingredientName) {
  const recipes = (state.recipes || []).filter(r => !r.isDraft && !r.isTip);
  const links = getKitchenRecipeLinks(ingredientName);
  const lowerName = ingredientName.toLowerCase();
  const autoMatched = recipes.filter(r => {
    const ings = recipeIngList(r);
    return ings.some(ing => {
      const ingName = (ing.name || '').toLowerCase();
      return ingName.includes(lowerName) || lowerName.includes(ingName);
    });
  });
  const resultMap = {};
  autoMatched.forEach(r => {
    const id = r.__backendId || r.id;
    if (links[id] !== 'excluded') resultMap[id] = r;
  });
  recipes.forEach(r => {
    const id = r.__backendId || r.id;
    if (links[id] === 'included') resultMap[id] = r;
  });
  return Object.values(resultMap);
}

// ===== KITCHEN GRID RENDERING =====

function renderKitchenIngredientCard(item, catName) {
  const count = getMatchingRecipesForIngredient(item.name).length;
  const gradient = KITCHEN_CATEGORY_GRADIENTS[catName] || KITCHEN_CATEGORY_GRADIENTS['Other'];
  const photo = getIngredientPhoto(item.name);
  const hasPhoto = !!photo;
  const escapedName = esc(item.name).replace(/'/g, "\\'");
  return `
    <div class="kitchen-card-swipe-container" data-ingredient="${esc(item.name)}" style="position:relative;overflow:hidden;border-radius:10px;">
      <div class="kitchen-card-content card-press" onclick="openKitchenIngredient('${escapedName}')"
        style="cursor:pointer;border-radius:10px;overflow:hidden;background:${CONFIG.surface_color};box-shadow:0 2px 8px rgba(0,0,0,0.3);position:relative;z-index:1;transition:transform 0.2s ease;">
        <div style="width:100%;aspect-ratio:1;overflow:hidden;display:flex;align-items:center;justify-content:center;${hasPhoto ? '' : 'background:' + gradient + ';'}">
          ${hasPhoto
            ? `<img loading="lazy" src="${esc(photo)}" style="width:100%;height:100%;object-fit:cover;" />`
            : `<span style="font-size:20px;font-weight:700;color:#f5f5f7;text-align:center;padding:12px;line-height:1.2;word-break:break-word;">${esc(item.name)}</span>`
          }
        </div>
        <div style="padding:4px 6px;">
          <div style="font-size:12px;font-weight:600;color:${CONFIG.text_color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(item.name)}</div>
          <div style="font-size:10px;color:${CONFIG.text_muted};margin-top:2px;">${count} recipe${count !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div class="kitchen-card-delete-btn" onclick="event.stopPropagation();confirmDeleteKitchenIngredient('${escapedName}')"
        style="position:absolute;right:0;top:0;bottom:0;width:70px;background:#e53e3e;display:flex;align-items:center;justify-content:center;color:white;font-size:13px;font-weight:600;cursor:pointer;border-radius:0 12px 12px 0;z-index:0;font-family:${CONFIG.font_family};">
        Delete
      </div>
    </div>
  `;
}

function confirmDeleteKitchenIngredient(ingredientName) {
  state.kitchenSelectedIngredient = ingredientName;
  state._showDeleteIngredientModal = true;
  state._deleteFromGrid = true;
  render();
}

function initKitchenCardSwipeGestures() {
  const containers = document.querySelectorAll('.kitchen-card-swipe-container');
  containers.forEach(container => {
    if (container._swipeInit) return;
    container._swipeInit = true;
    const content = container.querySelector('.kitchen-card-content');
    if (!content) return;
    let startX = 0, currentX = 0, swiping = false;
    content.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      currentX = startX;
      swiping = true;
      content.style.transition = 'none';
    }, { passive: true });
    content.addEventListener('touchmove', function(e) {
      if (!swiping) return;
      currentX = e.touches[0].clientX;
      const dx = currentX - startX;
      if (dx < 0) {
        const offset = Math.max(dx, -70);
        content.style.transform = `translateX(${offset}px)`;
      } else if (dx > 0 && content.style.transform && content.style.transform !== 'translateX(0px)') {
        const offset = Math.min(0, -70 + dx);
        content.style.transform = `translateX(${offset}px)`;
      }
    }, { passive: true });
    content.addEventListener('touchend', function() {
      if (!swiping) return;
      swiping = false;
      content.style.transition = 'transform 0.2s ease';
      const dx = currentX - startX;
      if (dx < -35) {
        content.style.transform = 'translateX(-70px)';
      } else {
        content.style.transform = 'translateX(0px)';
      }
    });
  });
}

function renderAddIngredientModal() {
  if (!state._showAddIngredientModal) return '';
  const categories = ['Proteins', 'Grains & Pasta', 'Vegetables', 'Dairy', 'Pantry Staples', 'Spices', 'Other'];
  return `
    <div onclick="if(event.target===this){state._showAddIngredientModal=false;render();}" style="position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:24px;">
      <div style="background:${CONFIG.surface_elevated};border-radius:16px;width:100%;max-width:380px;padding:24px;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
        <h3 style="font-size:20px;font-weight:700;color:${CONFIG.text_color};margin:0 0 20px 0;">Add Ingredient</h3>
        <div style="margin-bottom:16px;">
          <label style="font-size:13px;font-weight:600;color:${CONFIG.text_muted};display:block;margin-bottom:6px;">Ingredient Name *</label>
          <input id="addIngName" type="text" placeholder="e.g. Avocado" style="width:100%;padding:10px 12px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:15px;background:${CONFIG.background_color};color:${CONFIG.text_color};box-sizing:border-box;font-family:${CONFIG.font_family};outline:none;" />
        </div>
        <div style="margin-bottom:16px;">
          <label style="font-size:13px;font-weight:600;color:${CONFIG.text_muted};display:block;margin-bottom:6px;">Category</label>
          <select id="addIngCategory" style="width:100%;padding:10px 12px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:15px;background:${CONFIG.background_color};color:${CONFIG.text_color};box-sizing:border-box;font-family:${CONFIG.font_family};outline:none;-webkit-appearance:none;">
            ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div style="margin-bottom:20px;">
          <label style="font-size:13px;font-weight:600;color:${CONFIG.text_muted};display:block;margin-bottom:6px;">Photo (optional)</label>
          <div style="display:flex;align-items:center;gap:12px;">
            <div id="addIngPhotoPreview" style="width:64px;height:64px;border-radius:10px;background:${CONFIG.surface_color};display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">
              <svg width="24" height="24" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"/></svg>
            </div>
            <input id="addIngPhotoInput" type="file" accept="image/*" capture="environment" style="display:none;" onchange="handleAddIngredientPhoto(this)" />
            <button onclick="document.getElementById('addIngPhotoInput').click()" style="padding:8px 16px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:none;color:${CONFIG.text_color};font-size:13px;cursor:pointer;font-family:${CONFIG.font_family};">Choose Photo</button>
          </div>
        </div>
        <div style="display:flex;gap:10px;">
          <button onclick="state._showAddIngredientModal=false;render();" style="flex:1;padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:none;color:${CONFIG.text_color};font-size:15px;cursor:pointer;font-family:${CONFIG.font_family};">Cancel</button>
          <button onclick="submitAddIngredient()" style="flex:1;padding:12px;border-radius:10px;border:none;background:${CONFIG.primary_action_color};color:white;font-size:15px;font-weight:600;cursor:pointer;font-family:${CONFIG.font_family};">Add to Kitchen</button>
        </div>
      </div>
    </div>
  `;
}

function handleAddIngredientPhoto(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    state._addIngredientPhoto = e.target.result;
    const preview = document.getElementById('addIngPhotoPreview');
    if (preview) preview.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;" />';
  };
  reader.readAsDataURL(input.files[0]);
}

function submitAddIngredient() {
  const nameEl = document.getElementById('addIngName');
  const catEl = document.getElementById('addIngCategory');
  if (!nameEl || !nameEl.value.trim()) { showToast('Please enter an ingredient name'); return; }
  addCustomKitchenIngredient(nameEl.value.trim(), catEl ? catEl.value : 'Other', state._addIngredientPhoto || '');
  state._addIngredientPhoto = '';
}

function renderKitchen() {
  const searchTerm = state.kitchenSearch || '';
  const customIngredients = getCustomKitchenIngredients();
  const hiddenIngredients = getHiddenIngredients();
  const allCategories = {};
  Object.entries(KITCHEN_INGREDIENTS).forEach(([catName, catData]) => {
    allCategories[catName] = { items: catData.items.filter(item => !hiddenIngredients.includes(item.name)) };
  });
  customIngredients.forEach(ci => {
    const cat = ci.category || 'Other';
    if (!allCategories[cat]) allCategories[cat] = { items: [] };
    allCategories[cat].items.push({ name: ci.name, photo: ci.photo || '', tips: ci.tips });
  });
  let categoriesHtml = '';
  Object.entries(allCategories).forEach(([catName, catData]) => {
    let items = catData.items;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(s));
    }
    if (items.length === 0) return;
    categoriesHtml += `
      <div style="margin-bottom: 12px;">
        <h3 style="font-size: 15px; font-weight: 600; color: ${CONFIG.text_color}; margin-bottom: 6px;">${catName}</h3>
        <div class="kitchen-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;">
          ${items.map(item => renderKitchenIngredientCard(item, catName)).join('')}
        </div>
      </div>
    `;
  });
  if (!categoriesHtml && searchTerm) {
    categoriesHtml = `
      <div style="text-align: center; padding: ${CONFIG.space_xl} ${CONFIG.space_md};">
        <div style="font-size: 40px; opacity: 0.3; margin-bottom: ${CONFIG.space_sm};">
          <svg width="40" height="40" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
        </div>
        <div style="color: ${CONFIG.text_muted}; font-size: 14px;">No ingredients match "${esc(searchTerm)}"</div>
      </div>
    `;
  }
  const activeTab = state.kitchenActiveTab || 'ingredients';
  const inventoryCount = (state.inventory || []).length;
  const tabsHtml = `
    <div style="display: flex; gap: 4px; padding: 8px 12px; background: ${CONFIG.background_color};">
      <button onclick="state.kitchenActiveTab = 'ingredients'; render();"
        style="flex: 1; padding: 8px 0; border-radius: 20px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: ${CONFIG.font_family};
        background: ${activeTab === 'ingredients' ? CONFIG.primary_action_color : CONFIG.surface_color};
        color: ${activeTab === 'ingredients' ? 'white' : CONFIG.text_muted};">
        Ingredients
      </button>
      <button onclick="state.kitchenActiveTab = 'inventory'; render();"
        style="flex: 1; padding: 8px 0; border-radius: 20px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: ${CONFIG.font_family};
        background: ${activeTab === 'inventory' ? CONFIG.primary_action_color : CONFIG.surface_color};
        color: ${activeTab === 'inventory' ? 'white' : CONFIG.text_muted};">
        My Inventory${inventoryCount > 0 ? ' (' + inventoryCount + ')' : ''}
      </button>
    </div>
  `;

  if (activeTab === 'inventory') {
    return `
      <div style="padding: 0; flex: 1;">
        ${tabsHtml}
        ${renderInventory()}
      </div>
    `;
  }

  return `
    <div style="padding: 0; flex: 1;">
      ${tabsHtml}
      <div class="kitchen-sticky-search" style="padding: 8px 12px; background: ${CONFIG.background_color};">
        <div style="display: flex; gap: 8px; align-items: center;">
          <div style="position: relative; flex: 1;">
            <svg width="16" height="16" fill="none" stroke="${CONFIG.text_tertiary}" stroke-width="1.5" viewBox="0 0 24 24" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%);"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            <input type="text" id="kitchenSearch" placeholder="Search an ingredient..." value="${esc(searchTerm)}"
              oninput="state.kitchenSearch = this.value; render();"
              style="width: 100%; height: 40px; padding: 0 10px 0 34px; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; font-size: 14px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; box-sizing: border-box; font-family: ${CONFIG.font_family};" />
          </div>
          <button onclick="state._showAddIngredientModal=true;state._addIngredientPhoto='';render();" style="height: 40px; padding: 0 12px; border-radius: 10px; border: none; background: ${CONFIG.primary_action_color}; color: white; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: ${CONFIG.font_family}; display: flex; align-items: center; gap: 4px;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Add
          </button>
        </div>
      </div>
      <div style="padding: 0 12px;">
        ${categoriesHtml}
      </div>
    </div>
    ${renderAddIngredientModal()}
    ${state._showDeleteIngredientModal && state.kitchenSelectedIngredient ? renderDeleteIngredientModal(state.kitchenSelectedIngredient) : ''}
  `;
}

function openKitchenIngredient(name) {
  state.selectedKitchenIngredient = name;
  window.location.href = '/kitchen-detail.html?ingredient=' + encodeURIComponent(name);
}

// ===== KITCHEN DETAIL: CUSTOM TIPS =====

function getKitchenCustomTips(ingredientName) {
  try { return JSON.parse(localStorage.getItem('kitchenCustomTips_' + ingredientName) || 'null'); }
  catch { return null; }
}

function saveKitchenCustomTips(ingredientName, tips) {
  localStorage.setItem('kitchenCustomTips_' + ingredientName, JSON.stringify(tips));
}

function _toTipArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) return [val.trim()];
  return [];
}

function getMergedTips(ingredientName, baseTips) {
  const custom = getKitchenCustomTips(ingredientName);
  if (!custom && !baseTips) return null;
  const base = baseTips || {};
  const c = custom || {};
  return {
    methods: c.methods || (base.methods ? [...base.methods] : []),
    storage: _toTipArray(c.storage !== undefined ? c.storage : base.storage),
    prep: _toTipArray(c.prep !== undefined ? c.prep : base.prep),
    pairings: _toTipArray(c.pairings !== undefined ? c.pairings : base.pairings),
    customNotes: c.customNotes || []
  };
}

function startEditKitchenTip(ingredientName, field, idx) {
  state._editingKitchenTip = { ingredient: ingredientName, field, idx };
  render();
}

function saveKitchenTipEdit(ingredientName, field, idx, newValue) {
  const baseTips = _getBaseTips(ingredientName);
  const merged = getMergedTips(ingredientName, baseTips);
  if (field === 'methods') {
    merged.methods[idx] = newValue;
  } else if (field === 'customNotes') {
    merged.customNotes[idx] = newValue;
  } else if (Array.isArray(merged[field])) {
    merged[field][idx] = newValue;
  } else {
    merged[field] = newValue;
  }
  saveKitchenCustomTips(ingredientName, merged);
  state._editingKitchenTip = null;
  render();
}

function addKitchenCustomNote(ingredientName) {
  const baseTips = _getBaseTips(ingredientName);
  const merged = getMergedTips(ingredientName, baseTips) || { methods: [], storage: '', prep: '', pairings: '', customNotes: [] };
  merged.customNotes = merged.customNotes || [];
  merged.customNotes.push('New tip...');
  saveKitchenCustomTips(ingredientName, merged);
  state._editingKitchenTip = { ingredient: ingredientName, field: 'customNotes', idx: merged.customNotes.length - 1 };
  render();
}

function deleteKitchenCustomNote(ingredientName, idx) {
  const baseTips = _getBaseTips(ingredientName);
  const merged = getMergedTips(ingredientName, baseTips);
  if (merged && merged.customNotes) {
    merged.customNotes.splice(idx, 1);
    saveKitchenCustomTips(ingredientName, merged);
    render();
  }
}

function startAddKitchenSectionTip(ingredientName, field) {
  state._addingKitchenTip = { ingredient: ingredientName, field };
  render();
  setTimeout(() => { const el = document.getElementById('tip-add-' + field); if (el) el.focus(); }, 50);
}

function saveNewKitchenSectionTip(ingredientName, field, value) {
  if (!value || !value.trim()) { state._addingKitchenTip = null; render(); return; }
  const baseTips = _getBaseTips(ingredientName);
  const merged = getMergedTips(ingredientName, baseTips) || { methods: [], storage: '', prep: '', pairings: '', customNotes: [] };
  if (field === 'methods') {
    merged.methods = merged.methods || [];
    merged.methods.push(value.trim());
  } else {
    merged[field] = value.trim();
  }
  saveKitchenCustomTips(ingredientName, merged);
  state._addingKitchenTip = null;
  render();
}

function addKitchenTipToSection(ingredientName, field) {
  const baseTips = _getBaseTips(ingredientName);
  const merged = getMergedTips(ingredientName, baseTips) || { methods: [], storage: '', prep: '', pairings: '', customNotes: [] };
  if (field === 'methods') {
    merged.methods = merged.methods || [];
    merged.methods.push('New method...');
    saveKitchenCustomTips(ingredientName, merged);
    state._editingKitchenTip = { ingredient: ingredientName, field: 'methods', idx: merged.methods.length - 1 };
  } else {
    if (!merged[field]) merged[field] = 'New tip...';
    saveKitchenCustomTips(ingredientName, merged);
    state._editingKitchenTip = { ingredient: ingredientName, field, idx: 0 };
  }
  render();
}

function deleteKitchenTipFromSection(ingredientName, field, idx) {
  const baseTips = _getBaseTips(ingredientName);
  const merged = getMergedTips(ingredientName, baseTips);
  if (!merged) return;
  if (field === 'methods') {
    merged.methods.splice(idx, 1);
  } else if (Array.isArray(merged[field])) {
    merged[field].splice(idx, 1);
  } else {
    merged[field] = '';
  }
  saveKitchenCustomTips(ingredientName, merged);
  render();
}

function _getBaseTips(ingredientName) {
  let d = null;
  Object.values(KITCHEN_INGREDIENTS).forEach(cat => { cat.items.forEach(item => { if (item.name === ingredientName) d = item.tips; }); });
  return d;
}

function openQuickTipModal(ingredientName, field, idx, isNew) {
  state._quickTipModal = { ingredient: ingredientName, field, idx: idx || 0, isNew: !!isNew };
  render();
}

function openQuickTipCategoryModal(ingredientName, field) {
  state._quickTipCategoryModal = { ingredient: ingredientName, field, editingIdx: -1, addingNew: false };
  render();
}

function quickTipCategorySetPrimary(ingredientName, field, idx) {
  const merged = getMergedTips(ingredientName, _getBaseTips(ingredientName)) || { methods: [], storage: [], prep: [], pairings: [], customNotes: [] };
  const arr = merged[field] || [];
  if (idx <= 0 || idx >= arr.length) return;
  const item = arr.splice(idx, 1)[0];
  arr.unshift(item);
  merged[field] = arr;
  saveKitchenCustomTips(ingredientName, merged);
  render();
}

function quickTipCategoryStartEdit(idx) {
  if (state._quickTipCategoryModal) state._quickTipCategoryModal.editingIdx = idx;
  render();
  setTimeout(() => { const el = document.getElementById('qtc-edit-input'); if (el) el.focus(); }, 50);
}

function quickTipCategorySaveEdit(ingredientName, field, idx) {
  const el = document.getElementById('qtc-edit-input');
  if (!el) return;
  const value = el.value.trim();
  const merged = getMergedTips(ingredientName, _getBaseTips(ingredientName)) || { methods: [], storage: [], prep: [], pairings: [], customNotes: [] };
  if (!value) {
    merged[field].splice(idx, 1);
  } else {
    merged[field][idx] = value;
  }
  saveKitchenCustomTips(ingredientName, merged);
  if (state._quickTipCategoryModal) state._quickTipCategoryModal.editingIdx = -1;
  render();
}

function quickTipCategoryDelete(ingredientName, field, idx) {
  const merged = getMergedTips(ingredientName, _getBaseTips(ingredientName)) || { methods: [], storage: [], prep: [], pairings: [], customNotes: [] };
  merged[field].splice(idx, 1);
  saveKitchenCustomTips(ingredientName, merged);
  render();
}

function quickTipCategoryStartAdd() {
  if (state._quickTipCategoryModal) state._quickTipCategoryModal.addingNew = true;
  render();
  setTimeout(() => { const el = document.getElementById('qtc-add-input'); if (el) el.focus(); }, 50);
}

function quickTipCategorySaveNew(ingredientName, field) {
  const el = document.getElementById('qtc-add-input');
  if (!el) return;
  const value = el.value.trim();
  if (!value) { if (state._quickTipCategoryModal) state._quickTipCategoryModal.addingNew = false; render(); return; }
  const merged = getMergedTips(ingredientName, _getBaseTips(ingredientName)) || { methods: [], storage: [], prep: [], pairings: [], customNotes: [] };
  if (!Array.isArray(merged[field])) merged[field] = [];
  merged[field].push(value);
  saveKitchenCustomTips(ingredientName, merged);
  if (state._quickTipCategoryModal) state._quickTipCategoryModal.addingNew = false;
  render();
}

function closeQuickTipCategoryModal() {
  state._quickTipCategoryModal = null;
  render();
}

function saveQuickTipFromModal(ingredientName, field, idx, isNew) {
  const el = document.getElementById('quickTipModalText');
  if (!el) return;
  const value = el.value.trim();
  const merged = getMergedTips(ingredientName, _getBaseTips(ingredientName)) || { methods: [], storage: [], prep: [], pairings: [], customNotes: [] };
  if (isNew) {
    if (!value) { state._quickTipModal = null; render(); return; }
    merged.customNotes = merged.customNotes || [];
    merged.customNotes.push(value);
  } else if (field === 'customNotes') {
    if (!value) { merged.customNotes.splice(idx, 1); }
    else { merged.customNotes[idx] = value; }
  } else {
    if (Array.isArray(merged[field])) {
      if (!value) { merged[field].splice(idx, 1); }
      else { merged[field][idx] = value; }
    } else {
      merged[field] = value ? [value] : [];
    }
  }
  saveKitchenCustomTips(ingredientName, merged);
  state._quickTipModal = null;
  render();
}

function deleteQuickTipFromModal(ingredientName, field, idx) {
  const merged = getMergedTips(ingredientName, _getBaseTips(ingredientName));
  if (!merged) { state._quickTipModal = null; render(); return; }
  if (field === 'customNotes') {
    merged.customNotes.splice(idx, 1);
  } else if (Array.isArray(merged[field])) {
    merged[field].splice(idx, 1);
  } else {
    merged[field] = [];
  }
  saveKitchenCustomTips(ingredientName, merged);
  state._quickTipModal = null;
  render();
}

// ===== KITCHEN INGREDIENT MEALS =====

function showKitchenIngredientMeals(ingredientName) {
  state._kitchenIngredientMealsName = ingredientName;
  state.currentView = 'kitchen-ingredient-meals';
  render();
}

function renderKitchenIngredientMeals() {
  const name = state._kitchenIngredientMealsName;
  if (!name) return '<div style="padding:16px;">Not found</div>';
  const log = getFoodLog();
  const entries = log.filter(e => {
    const ings = (e.ingredients || []).map(i => i.toLowerCase());
    return ings.some(i => i.includes(name.toLowerCase()) || name.toLowerCase().includes(i))
      || (e.recipeName || '').toLowerCase().includes(name.toLowerCase());
  }).sort((a, b) => new Date(b.dateCooked) - new Date(a.dateCooked));

  return `
    <div style="padding-bottom: 80px; max-width: 600px; margin: 0 auto;">
      <div style="position: sticky; top: 0; z-index: 10; background: ${CONFIG.background_color}; padding: 12px ${CONFIG.space_md}; display: flex; align-items: center; gap: 12px;">
        <button onclick="state.kitchenSelectedIngredient = '${esc(name)}'; navigateTo('kitchen-detail')" style="width: 36px; height: 36px; border-radius: 50%; background: ${CONFIG.surface_color}; border: none; color: ${CONFIG.text_color}; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <h1 style="font-size: 20px; font-weight: 700; color: ${CONFIG.text_color}; margin: 0;">Meals with ${esc(name)}</h1>
      </div>
      <div style="padding: 0 ${CONFIG.space_md};">
        ${entries.length === 0 ? `
          <div style="text-align: center; padding: 48px 16px;">
            <div style="font-size: 48px; opacity: 0.3; margin-bottom: 12px;">&#127861;</div>
            <div style="color: ${CONFIG.text_muted}; font-size: 15px;">No logged meals with ${esc(name)} yet</div>
          </div>
        ` : entries.map(e => {
          const photo = e.myPhoto || e.photo || e.image || '';
          const dateStr = new Date(e.dateCooked).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const mealLabel = e.mealType ? e.mealType.charAt(0).toUpperCase() + e.mealType.slice(1) : '';
          return `
            <div onclick="openFoodLogDetail('${e.id}')" class="card-press" style="display: flex; align-items: center; gap: 12px; padding: 12px; cursor: pointer; background: ${CONFIG.surface_color}; border-radius: 12px; margin-bottom: 8px; box-shadow: ${CONFIG.shadow};">
              <div style="width: 64px; height: 64px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: ${CONFIG.surface_elevated};">
                ${photo ? `<img src="${esc(photo)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;opacity:0.3;">&#127861;</div>`}
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 15px; font-weight: 600; color: ${CONFIG.text_color}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(e.recipeName || 'Unknown meal')}</div>
                <div style="font-size: 13px; color: ${CONFIG.text_muted}; margin-top: 2px;">${dateStr}${mealLabel ? ' · ' + mealLabel : ''}</div>
              </div>
              <svg width="16" height="16" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24" style="flex-shrink:0;"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ===== INGREDIENT SEARCH & LINK =====

function getIngredientSearchTerms(ingredientName) {
  const lower = ingredientName.toLowerCase();
  const terms = [lower];
  if (INGREDIENT_SYNONYMS[lower]) {
    terms.push(...INGREDIENT_SYNONYMS[lower]);
  }
  Object.entries(INGREDIENT_SYNONYMS).forEach(([key, synonyms]) => {
    if (synonyms.some(s => s === lower || lower.includes(s) || s.includes(lower))) {
      terms.push(key);
      terms.push(...synonyms);
    }
  });
  return [...new Set(terms)];
}

function fuzzyRecipeMatch(recipe, searchTerms) {
  const title = (recipe.title || '').toLowerCase();
  const ings = recipeIngList(recipe);
  const ingTexts = ings.map(i => (i.name || '').toLowerCase());
  let score = 0;
  for (const term of searchTerms) {
    if (title.includes(term)) score += 10;
    if (ingTexts.some(ing => ing.includes(term) || term.includes(ing))) score += 5;
  }
  return score;
}

function renderLinkRecipeModal(ingredientName) {
  if (!state._showLinkRecipeModal) return '';
  const searchTerm = (state._linkRecipeSearch != null ? state._linkRecipeSearch : ingredientName).toLowerCase();
  const allRecipes = (state.recipes || []).filter(r => !r.isDraft && !r.isTip);
  const alreadyLinked = getMatchingRecipesForIngredient(ingredientName);
  const linkedIds = new Set(alreadyLinked.map(r => r.__backendId || r.id));
  let filtered = allRecipes.filter(r => !linkedIds.has(r.__backendId || r.id));
  if (searchTerm) {
    const searchTerms = getIngredientSearchTerms(searchTerm);
    if (!searchTerms.includes(searchTerm)) searchTerms.push(searchTerm);
    const scored = filtered.map(r => {
      const title = (r.title || '').toLowerCase();
      const ings = recipeIngList(r);
      const ingTexts = ings.map(i => (i.name || '').toLowerCase());
      let score = 0;
      for (const term of searchTerms) {
        if (title.includes(term)) score += 10;
        if (ingTexts.some(ing => ing.includes(term) || term.includes(ing))) score += 5;
      }
      if (title.includes(searchTerm)) score += 10;
      if (ingTexts.some(ing => ing.includes(searchTerm))) score += 5;
      return { recipe: r, score };
    });
    filtered = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).map(s => s.recipe);
  }
  return `
    <div onclick="if(event.target===this){state._showLinkRecipeModal=false;render();}" style="position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.7);display:flex;align-items:flex-end;justify-content:center;">
      <div style="background:${CONFIG.surface_elevated};border-radius:16px 16px 0 0;width:100%;max-width:600px;max-height:70vh;display:flex;flex-direction:column;box-shadow:0 -4px 32px rgba(0,0,0,0.5);">
        <div style="padding:20px 20px 12px;">
          <h3 style="font-size:18px;font-weight:700;color:${CONFIG.text_color};margin:0 0 12px;">Link a Recipe to ${esc(ingredientName)}</h3>
          <input type="text" placeholder="Search recipes..." value="${esc(state._linkRecipeSearch != null ? state._linkRecipeSearch : ingredientName)}"
            oninput="state._linkRecipeSearch=this.value;render();"
            style="width:100%;padding:10px 12px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;font-size:15px;background:${CONFIG.background_color};color:${CONFIG.text_color};box-sizing:border-box;font-family:${CONFIG.font_family};outline:none;" />
        </div>
        <div style="overflow-y:auto;padding:0 20px 20px;flex:1;">
          ${filtered.length === 0 ? `<div style="text-align:center;padding:24px;color:${CONFIG.text_muted};font-size:14px;">No recipes found</div>` :
            filtered.slice(0, 30).map(r => {
              const id = r.__backendId || r.id;
              const img = recipeThumb(r);
              return `
                <div onclick="addRecipeToIngredient('${esc(ingredientName)}','${esc(id)}')" class="card-press" style="display:flex;align-items:center;gap:12px;padding:10px;cursor:pointer;background:${CONFIG.surface_color};border-radius:10px;margin-bottom:6px;">
                  <div style="width:48px;height:48px;border-radius:8px;overflow:hidden;flex-shrink:0;background:${CONFIG.surface_elevated};">
                    ${img ? `<img src="${esc(img)}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg></div>`}
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:14px;font-weight:600;color:${CONFIG.text_color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(r.title)}</div>
                    ${r.cookTime ? `<div style="font-size:12px;color:${CONFIG.text_muted};margin-top:2px;">${esc(r.cookTime)}</div>` : ''}
                  </div>
                  <svg width="16" height="16" fill="none" stroke="${CONFIG.primary_action_color}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                </div>
              `;
            }).join('')
          }
        </div>
      </div>
    </div>
  `;
}

// ===== KITCHEN DETAIL VIEW =====
// This is a very large function - the full renderKitchenDetail with all sub-functions
// It is included in the kitchen-detail.html page via the same js/kitchen.js script

function renderKitchenDetail() {
  const name = state.kitchenSelectedIngredient || state.selectedKitchenIngredient;
  if (!name) return '<div style="padding: 16px;">Ingredient not found</div>';

  let ingredientData = null;
  Object.values(KITCHEN_INGREDIENTS).forEach(cat => {
    cat.items.forEach(item => {
      if (item.name === name) ingredientData = item;
    });
  });
  if (!ingredientData) {
    const customIngs = getCustomKitchenIngredients();
    const ci = customIngs.find(i => i.name === name);
    if (ci) ingredientData = { name: ci.name, photo: ci.photo || '', tips: ci.tips };
  }
  if (!ingredientData) ingredientData = { name, photo: '', tips: null };

  const matchingRecipes = getMatchingRecipesForIngredient(name);

  const log = getFoodLog();
  const now = new Date();
  const monthStart = _localDateStr(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEntries = log.filter(e => {
    if (e.dateCooked.split('T')[0] < monthStart) return false;
    const ings = (e.ingredients || []).map(i => i.toLowerCase());
    return ings.some(i => i.includes(name.toLowerCase()) || name.toLowerCase().includes(i))
      || (e.recipeName || '').toLowerCase().includes(name.toLowerCase());
  });

  const tips = getMergedTips(name, ingredientData.tips);
  const editing = state._editingKitchenTip || {};
  const isEditing = (field, idx) => editing.ingredient === name && editing.field === field && editing.idx === idx;
  const _adding = state._addingKitchenTip || {};
  const isAdding = (field) => _adding.ingredient === name && _adding.field === field;

  function renderEditableTipItem(text, field, idx) {
    if (isEditing(field, idx)) {
      return `
        <div style="display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; border-bottom: 1px solid ${CONFIG.divider_color};">
          <input id="tip-edit-${field}-${idx}" type="text" value="${esc(text)}" style="flex:1; background: ${CONFIG.background_color}; border: 1px solid ${CONFIG.primary_action_color}; border-radius: 6px; padding: 6px 8px; color: ${CONFIG.text_color}; font-size: 14px; outline: none;" onkeydown="if(event.key==='Enter'){saveKitchenTipEdit('${esc(name)}','${field}',${idx},this.value)}" />
          <button onclick="saveKitchenTipEdit('${esc(name)}','${field}',${idx},document.getElementById('tip-edit-${field}-${idx}').value)" style="background: none; border: none; color: ${CONFIG.success_color}; cursor: pointer; padding: 6px; font-size: 16px;">&#10003;</button>
        </div>`;
    }
    return `
      <div style="display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid ${CONFIG.divider_color};">
        <span style="color: ${CONFIG.primary_action_color}; font-size: 14px; flex-shrink: 0; margin-top: 2px;">&#8226;</span>
        <span style="font-size: 14px; color: ${CONFIG.text_color}; line-height: 1.4; flex: 1;">${esc(text)}</span>
        <button onclick="startEditKitchenTip('${esc(name)}','${field}',${idx})" style="background: none; border: none; color: ${CONFIG.text_muted}; cursor: pointer; padding: 2px; flex-shrink: 0;">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
        </button>
        <button onclick="deleteKitchenTipFromSection('${esc(name)}','${field}',${idx})" style="background: none; border: none; color: ${CONFIG.danger_color}; cursor: pointer; padding: 2px; flex-shrink: 0;">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
        </button>
      </div>`;
  }

  function renderMethodsSection(methods) {
    const hasItems = methods && methods.length > 0;
    return `
      <div style="background: ${CONFIG.surface_color}; border-radius: 12px; padding: ${CONFIG.space_md}; margin-bottom: 10px; box-shadow: ${CONFIG.shadow};">
        <div style="font-size: 13px; font-weight: 600; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">Cooking Methods</div>
        ${hasItems ? methods.map((m, i) => renderEditableTipItem(m, 'methods', i)).join('') : `<div style="color: ${CONFIG.text_muted}; font-size: 13px; padding: 4px 0;">No methods yet</div>`}
        ${isAdding('methods') ? `
          <div style="display: flex; align-items: flex-start; gap: 8px; padding: 8px 0;">
            <input id="tip-add-methods" type="text" placeholder="Type your method..." autofocus style="flex:1; background: ${CONFIG.background_color}; border: 1px solid ${CONFIG.primary_action_color}; border-radius: 6px; padding: 6px 8px; color: ${CONFIG.text_color}; font-size: 14px; outline: none;" onkeydown="if(event.key==='Enter'){saveNewKitchenSectionTip('${esc(name)}','methods',this.value)}" />
            <button onclick="saveNewKitchenSectionTip('${esc(name)}','methods',document.getElementById('tip-add-methods').value)" style="background: none; border: none; color: ${CONFIG.success_color}; cursor: pointer; padding: 6px; font-size: 16px;">&#10003;</button>
          </div>
        ` : `
          <button onclick="startAddKitchenSectionTip('${esc(name)}','methods')" style="width: 100%; padding: 8px; background: none; border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px; color: ${CONFIG.text_muted}; cursor: pointer; font-size: 13px; margin-top: 6px;">+ Add</button>
        `}
      </div>`;
  }

  // Due to the enormous size of renderKitchenDetail, we include the Quick Tips row rendering inline
  // The full detail view HTML is built from the tipsData

  const tipsData = tips || { methods: [], storage: [], prep: [], pairings: [], customNotes: [] };
  const gradient = getIngredientGradient(name);
  const heroPhoto = getIngredientPhoto(name);

  // Quick tip card helper
  function renderQuickTipCard(tipsArray, field, label, iconSvg) {
    const arr = Array.isArray(tipsArray) ? tipsArray : [];
    const hasContent = arr.length > 0 && arr[0];
    const displayText = hasContent ? arr[0] : 'No tip yet';
    const extraCount = arr.length > 1 ? arr.length - 1 : 0;
    return `
      <div onclick="openQuickTipCategoryModal('${esc(name)}','${field}')" style="min-width:140px;max-width:180px;flex-shrink:0;background:rgba(255,255,255,0.05);border-radius:12px;padding:12px;cursor:pointer;display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="opacity:0.6;">${iconSvg}</div>
        </div>
        <div style="font-size:12px;font-weight:700;color:${CONFIG.text_muted};text-transform:uppercase;letter-spacing:0.5px;">${esc(label)}</div>
        <div style="font-size:13px;color:${hasContent ? CONFIG.text_color : CONFIG.text_muted};line-height:1.3;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${esc(displayText)}</div>
        ${extraCount > 0 ? `<div style="font-size:11px;color:${CONFIG.text_muted};margin-top:2px;">+${extraCount} more</div>` : ''}
      </div>
    `;
  }

  // Quick tip category modal
  function renderQuickTipCategoryModal(tipsData) {
    const modal = state._quickTipCategoryModal;
    if (!modal || modal.ingredient !== name) return '';
    const field = modal.field;
    const fieldLabels = { storage: 'Storage Tips', prep: 'Prep Tips', pairings: 'Seasoning Tips' };
    const modalTitle = fieldLabels[field] || 'Tips';
    const arr = Array.isArray(tipsData[field]) ? tipsData[field] : [];
    const editingIdx = modal.editingIdx;
    const addingNew = modal.addingNew;
    const starSvg = `<svg width="12" height="12" fill="${CONFIG.primary_action_color}" stroke="none" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>`;
    const pencilSvg = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>`;
    const trashSvg = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>`;

    const tipRows = arr.map((tip, i) => {
      if (editingIdx === i) {
        return `<div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid ${CONFIG.divider_color};"><input id="qtc-edit-input" type="text" value="${esc(tip)}" style="flex:1;background:${CONFIG.background_color};border:1px solid ${CONFIG.primary_action_color};border-radius:8px;padding:8px 10px;color:${CONFIG.text_color};font-size:14px;outline:none;font-family:inherit;" onkeydown="if(event.key==='Enter'){quickTipCategorySaveEdit('${esc(name)}','${field}',${i})}" /><button onclick="quickTipCategorySaveEdit('${esc(name)}','${field}',${i})" style="background:none;border:none;color:${CONFIG.success_color};cursor:pointer;padding:4px;font-size:16px;">&#10003;</button></div>`;
      }
      return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid ${CONFIG.divider_color};"><div onclick="quickTipCategorySetPrimary('${esc(name)}','${field}',${i})" style="cursor:pointer;flex:1;display:flex;align-items:flex-start;gap:8px;">${i === 0 ? `<span style="flex-shrink:0;margin-top:2px;" title="Primary">${starSvg}</span>` : `<span style="flex-shrink:0;width:12px;margin-top:2px;"></span>`}<span style="font-size:14px;color:${CONFIG.text_color};line-height:1.4;">${esc(tip)}</span></div>${i === 0 ? `<span style="font-size:10px;color:${CONFIG.primary_action_color};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;flex-shrink:0;">Primary</span>` : ''}<button onclick="event.stopPropagation();quickTipCategoryStartEdit(${i})" style="background:none;border:none;color:${CONFIG.text_muted};cursor:pointer;padding:2px;flex-shrink:0;">${pencilSvg}</button><button onclick="event.stopPropagation();quickTipCategoryDelete('${esc(name)}','${field}',${i})" style="background:none;border:none;color:${CONFIG.danger_color};cursor:pointer;padding:2px;flex-shrink:0;">${trashSvg}</button></div>`;
    }).join('');

    const addRow = addingNew ? `<div style="display:flex;align-items:center;gap:8px;padding:10px 0;"><input id="qtc-add-input" type="text" placeholder="Enter a new tip..." style="flex:1;background:${CONFIG.background_color};border:1px solid ${CONFIG.primary_action_color};border-radius:8px;padding:8px 10px;color:${CONFIG.text_color};font-size:14px;outline:none;font-family:inherit;" onkeydown="if(event.key==='Enter'){quickTipCategorySaveNew('${esc(name)}','${field}')}" /><button onclick="quickTipCategorySaveNew('${esc(name)}','${field}')" style="background:none;border:none;color:${CONFIG.success_color};cursor:pointer;padding:4px;font-size:16px;">&#10003;</button></div>` : `<button onclick="quickTipCategoryStartAdd()" style="width:100%;padding:10px;background:none;border:1px dashed rgba(255,255,255,0.1);border-radius:8px;color:${CONFIG.text_muted};cursor:pointer;font-size:13px;margin-top:8px;font-family:${CONFIG.font_family};">+ Add tip</button>`;

    return `<div onclick="if(event.target===this){closeQuickTipCategoryModal();}" style="position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.7);display:flex;align-items:flex-end;justify-content:center;padding:0;"><div style="background:${CONFIG.surface_elevated};border-radius:16px 16px 0 0;width:100%;max-width:500px;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 -4px 32px rgba(0,0,0,0.5);"><div style="padding:20px 20px 0 20px;flex-shrink:0;"><div style="width:36px;height:4px;background:rgba(255,255,255,0.2);border-radius:2px;margin:0 auto 16px auto;"></div><h3 style="font-size:18px;font-weight:700;color:${CONFIG.text_color};margin:0 0 4px 0;">${modalTitle}</h3><div style="font-size:12px;color:${CONFIG.text_muted};margin-bottom:12px;">Tap a tip to set it as primary (shown on card)</div></div><div style="padding:0 20px;overflow-y:auto;flex:1;">${arr.length === 0 ? `<div style="color:${CONFIG.text_muted};font-size:14px;padding:16px 0;text-align:center;">No tips yet. Add one below.</div>` : tipRows}${addRow}</div><div style="padding:16px 20px;flex-shrink:0;border-top:1px solid ${CONFIG.divider_color};"><button onclick="closeQuickTipCategoryModal()" style="width:100%;padding:12px;border-radius:10px;border:none;background:${CONFIG.primary_action_color};color:white;font-size:15px;font-weight:600;cursor:pointer;font-family:${CONFIG.font_family};">Done</button></div></div></div>`;
  }

  // Quick tips row
  const storageIcon = '<svg width="16" height="16" fill="none" stroke="' + CONFIG.text_color + '" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>';
  const prepIcon = '<svg width="16" height="16" fill="none" stroke="' + CONFIG.text_color + '" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z"/></svg>';
  const seasoningIcon = '<svg width="16" height="16" fill="none" stroke="' + CONFIG.text_color + '" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"/></svg>';
  const noteIcon = '<svg width="16" height="16" fill="none" stroke="' + CONFIG.text_color + '" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>';

  const customNoteCards = (tipsData.customNotes || []).map((note, i) => {
    const hasContent = !!note;
    const displayText = hasContent ? note : 'No tip yet';
    return `<div onclick="openQuickTipModal('${esc(name)}','customNotes',${i})" style="min-width:140px;max-width:180px;flex-shrink:0;background:rgba(255,255,255,0.05);border-radius:12px;padding:12px;cursor:pointer;display:flex;flex-direction:column;gap:6px;"><div style="display:flex;align-items:center;justify-content:space-between;"><div style="opacity:0.6;">${noteIcon}</div></div><div style="font-size:12px;font-weight:700;color:${CONFIG.text_muted};text-transform:uppercase;letter-spacing:0.5px;">Tip ${i + 1}</div><div style="font-size:13px;color:${hasContent ? CONFIG.text_color : CONFIG.text_muted};line-height:1.3;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${esc(displayText)}</div></div>`;
  }).join('');

  // Quick tip modal
  function renderQuickTipModalInline() {
    const modal = state._quickTipModal;
    if (!modal || modal.ingredient !== name) return '';
    const isNew = modal.isNew;
    let currentVal = '';
    let modalTitle = 'New Tip';
    if (!isNew) {
      currentVal = (tipsData.customNotes && tipsData.customNotes[modal.idx]) || '';
      modalTitle = 'Custom Tip';
    }
    return '<div onclick="if(event.target===this){state._quickTipModal=null;render();}" style="position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:24px;">' +
      '<div style="background:' + CONFIG.surface_elevated + ';border-radius:16px;width:100%;max-width:380px;padding:24px;box-shadow:0 8px 32px rgba(0,0,0,0.5);">' +
      '<h3 style="font-size:18px;font-weight:700;color:' + CONFIG.text_color + ';margin:0 0 16px 0;">' + modalTitle + '</h3>' +
      '<textarea id="quickTipModalText" style="width:100%;min-height:100px;background:' + CONFIG.background_color + ';border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;color:' + CONFIG.text_color + ';font-size:15px;line-height:1.5;outline:none;resize:vertical;font-family:inherit;box-sizing:border-box;" placeholder="Enter your tip...">' + esc(currentVal) + '</textarea>' +
      '<div style="display:flex;gap:10px;margin-top:16px;">' +
      (!isNew ? '<button onclick="deleteQuickTipFromModal(\'' + esc(name) + '\',\'' + modal.field + '\',' + modal.idx + ')" style="padding:10px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:none;color:' + CONFIG.danger_color + ';font-size:14px;cursor:pointer;font-family:' + CONFIG.font_family + ';">Delete</button>' : '') +
      '<div style="flex:1;"></div>' +
      '<button onclick="state._quickTipModal=null;render();" style="padding:10px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:none;color:' + CONFIG.text_color + ';font-size:14px;cursor:pointer;font-family:' + CONFIG.font_family + ';">Cancel</button>' +
      '<button onclick="saveQuickTipFromModal(\'' + esc(name) + '\',\'' + modal.field + '\',' + modal.idx + ',' + isNew + ')" style="padding:10px 16px;border-radius:10px;border:none;background:' + CONFIG.primary_action_color + ';color:white;font-size:14px;font-weight:600;cursor:pointer;font-family:' + CONFIG.font_family + ';">Save</button>' +
      '</div></div></div>';
  }

  const quickTipsRowHtml = `
    <div style="margin-bottom: 10px;">
      <div style="font-size: 13px; font-weight: 600; color: ${CONFIG.text_muted}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; padding-left: 4px;">Quick Tips</div>
      <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;scrollbar-width:none;">
        ${renderQuickTipCard(tipsData.storage, 'storage', 'Storage', storageIcon)}
        ${renderQuickTipCard(tipsData.prep, 'prep', 'Prep', prepIcon)}
        ${renderQuickTipCard(tipsData.pairings, 'pairings', 'Seasoning', seasoningIcon)}
        ${customNoteCards}
        <div onclick="openQuickTipModal('${esc(name)}','customNotes',-1,true)" style="min-width:140px;flex-shrink:0;background:none;border:1px dashed rgba(255,255,255,0.1);border-radius:12px;padding:12px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;">
          <svg width="24" height="24" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          <span style="font-size:12px;color:${CONFIG.text_muted};">Add tip</span>
        </div>
      </div>
    </div>
    ${renderQuickTipCategoryModal(tipsData)}
    ${renderQuickTipModalInline()}
  `;

  return `
    <div style="flex: 1;">
      <div style="position: relative; width: 100%; height: 200px; overflow: hidden; background: ${gradient};">
        ${heroPhoto ? `<img src="${esc(heroPhoto)}" style="width:100%;height:100%;object-fit:cover;" />` : `
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:48px;font-weight:700;color:rgba(255,255,255,0.15);text-align:center;padding:24px;">${esc(name)}</span>
          </div>
        `}
        <div style="position: absolute; inset: 0; background: linear-gradient(transparent 40%, rgba(13,13,20,0.9));"></div>
        <button onclick="if(window.history.length>1){window.history.back();}else{window.location.href='/kitchen.html';}" style="position: absolute; top: 12px; left: 12px; width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
        </button>
        <div style="position: absolute; bottom: 12px; left: 12px;">
          <h1 style="font-size: 20px; font-weight: 700; color: white; margin: 0;">${esc(name)}</h1>
        </div>
        <input id="ingredientPhotoInput" type="file" accept="image/*" capture="environment" style="display:none;" onchange="handleIngredientPhotoUpload('${esc(name)}',this)" />
        <button onclick="event.stopPropagation();document.getElementById('ingredientPhotoInput').click();" style="position:absolute;bottom:12px;right:12px;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/></svg>
        </button>
      </div>

      <div style="padding: 0 12px;">
        <div style="margin-top: 16px;">
          <h2 style="font-size: 15px; font-weight: 600; color: ${CONFIG.text_color}; margin-bottom: 8px;">How to cook ${esc(name.toLowerCase())}</h2>
          ${renderMethodsSection(tipsData.methods)}
          ${quickTipsRowHtml}
        </div>

        <div style="margin-top: 16px;">
          <h2 style="font-size: 15px; font-weight: 600; color: ${CONFIG.text_color}; margin-bottom: 8px;">Recipes with ${esc(name)}</h2>
          ${matchingRecipes.length > 0 ? `
            <div class="kitchen-recipe-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
              ${matchingRecipes.map(r => {
                const img = recipeThumb(r);
                const id = r.__backendId || r.id;
                const kSaved = isRecipeSaved(id);
                const kUrl = (r.recipe_url || '').trim() || (typeof recipeUrl === 'function' ? recipeUrl(r) : '');
                return `
                  <div style="position:relative; border-radius: 10px; overflow: hidden; background: ${CONFIG.surface_color}; box-shadow: ${CONFIG.shadow};">
                    <div onclick="window.location.href='/recipe-detail.html?id=${encodeURIComponent(id)}&from=kitchen&ingredient=${encodeURIComponent(name)}'" class="card-press" style="cursor: pointer;">
                      <div style="width: 100%; aspect-ratio: 1/1; overflow: hidden; background: ${CONFIG.surface_elevated};">
                        ${img ? `<img loading="lazy" src="${esc(img)}" style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><svg width="24" height="24" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24" style="opacity:0.3;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg></div>`}
                      </div>
                      <div style="padding: 6px;">
                        <div style="font-size: 13px; font-weight: 600; color: ${CONFIG.text_color}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;">${esc(r.title)}</div>
                      </div>
                    </div>
                    <!-- X button top-left -->
                    <button onclick="event.stopPropagation();removeRecipeFromIngredient('${esc(name)}','${esc(id)}')" style="position:absolute;top:4px;left:4px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,0.7);border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;">
                      <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                    <!-- Bookmark icon top-right -->
                    <button onclick="event.stopPropagation();toggleSaveRecipe('${esc(id)}')" style="position:absolute;top:4px;right:4px;width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);border:none;color:${kSaved ? CONFIG.primary_action_color : 'rgba(255,255,255,0.7)'};cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;padding:0;">
                      <svg width="12" height="12" fill="${kSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/></svg>
                    </button>
                    ${kUrl ? `
                    <!-- External link icon bottom-right -->
                    <a href="${esc(kUrl)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();" style="position:absolute;bottom:30px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);border:none;color:${CONFIG.primary_action_color};cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;text-decoration:none;">
                      <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
                    </a>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div style="text-align: center; padding: ${CONFIG.space_lg}; background: ${CONFIG.surface_color}; border-radius: 12px;">
              <svg width="32" height="32" fill="none" stroke="${CONFIG.text_muted}" stroke-width="1.5" viewBox="0 0 24 24" style="opacity:0.3;margin-bottom:8px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
              <div style="color: ${CONFIG.text_muted}; font-size: 14px;">No recipes yet with ${esc(name)}.</div>
            </div>
          `}
          <button onclick="state._showLinkRecipeModal=true;state._linkRecipeSearch=null;render();" style="width:100%;padding:10px;background:none;border:1px dashed rgba(255,255,255,0.15);border-radius:10px;color:${CONFIG.text_muted};cursor:pointer;font-size:13px;margin-top:10px;font-family:${CONFIG.font_family};display:flex;align-items:center;justify-content:center;gap:6px;">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            Link a recipe
          </button>
        </div>

        <div style="margin-top:${CONFIG.space_2xl};padding-bottom:${CONFIG.space_lg};text-align:center;">
          <span onclick="state._showDeleteIngredientModal=true;render();" style="color:#e53e3e;font-size:14px;cursor:pointer;font-family:${CONFIG.font_family};">Delete ingredient</span>
        </div>
      </div>
    </div>
    ${renderLinkRecipeModal(name)}
    ${renderDeleteIngredientModal(name)}
  `;
}

// ===== GROUP 2: ALL INGREDIENTS VIEW =====

function renderAllIngredients() {
    const ingredients = state.ingredientKnowledge || [];
    const inventory = state.inventory || [];
    const searchTerm = state.ingredientSearchTerm || '';

    const filtered = searchTerm
      ? ingredients.filter(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : ingredients;

    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

    const categories = ['Vegetables', 'Fruits', 'Proteins', 'Dairy', 'Grains', 'Herbs & Spices', 'Pantry', 'Other'];
    const grouped = {};
    categories.forEach(cat => grouped[cat] = []);

    sorted.forEach(ing => {
      const cat = ing.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(ing);
    });

    const getStockCount = (ingName) => {
      return inventory.filter(item =>
        item.name.toLowerCase() === ingName.toLowerCase()
      ).reduce((sum, item) => sum + (item.quantity || 1), 0);
    };

    return `
      <div>
        <!-- Search & Add -->
        <div class="flex gap-2 mb-3">
          <input type="text" id="ingredientSearchInput"
            placeholder="Search ingredients..."
            value="${esc(searchTerm)}"
            oninput="state.ingredientSearchTerm = this.value; _debouncedRender(this, 'ingredientSearch');"
            style="flex:1; padding:10px 12px; border:1px solid rgba(255,255,255,0.1); border-radius:8px; font-size:13px; background:${CONFIG.surface_color}; color:${CONFIG.text_color}; box-sizing:border-box;" />
          <button onclick="showAddIngredientKnowledgeModal()"
            style="padding:10px 14px; background:${CONFIG.primary_action_color}; color:white; border:none; border-radius:8px; font-size:11px; cursor:pointer; white-space:nowrap;">
            + Add
          </button>
        </div>

        ${sorted.length === 0 ? `
          <div class="p-6 rounded-xl text-center" style="background:${CONFIG.surface_color};">
            <div style="font-size:2rem; margin-bottom:8px;">📋</div>
            <div style="font-size:14px; font-weight:600; color:${CONFIG.text_color}; margin-bottom:4px;">
              ${searchTerm ? 'No ingredients found' : 'No ingredients yet'}
            </div>
            <div style="font-size:12px; color:${CONFIG.text_muted}; margin-bottom:12px;">
              ${searchTerm ? 'Try a different search' : 'Add ingredients to build your library'}
            </div>
          </div>
        ` : `
          ${categories.map(cat => {
            const items = grouped[cat];
            if (items.length === 0) return '';

            return `
              <div class="mb-4">
                <div style="color:${CONFIG.text_muted}; font-size:11px; font-weight:600; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">
                  ${cat} (${items.length})
                </div>
                <div class="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  ${items.map(ing => {
                    const stockCount = getStockCount(ing.name);
                    const imgUrl = ing.image_url || getIngredientImage(ing.name, ing.category);

                    return `
                      <div onclick="showIngredientDetail('${ing.id}')"
                        class="rounded-lg overflow-hidden cursor-pointer"
                        style="background:${CONFIG.surface_color}; border:1px solid rgba(255,255,255,0.06);">
                        <div style="height:60px; overflow:hidden; background:${CONFIG.background_color}; position:relative;">
                          ${imgUrl ? `
                            <img loading="lazy" src="${esc(imgUrl)}" style="width:100%; height:100%; object-fit:cover;"
                                 onerror="this.style.display='none';" />
                          ` : `
                            <div style="height:100%; display:flex; align-items:center; justify-content:center; color:${CONFIG.text_muted}; font-size:11px;">
                              No image
                            </div>
                          `}
                          ${stockCount > 0 ? `
                            <div style="position:absolute; top:2px; right:2px; background:${CONFIG.success_color}; color:white; border-radius:3px; padding:1px 5px; font-size:8px;">
                              ${stockCount}
                            </div>
                          ` : ''}
                        </div>
                        <div style="padding:6px;">
                          <div style="color:${CONFIG.text_color}; font-size:10px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            ${esc(capitalize(ing.name))}
                          </div>
                          <div style="color:${CONFIG.text_muted}; font-size:9px;">
                            ${ing.defaultExpirationDays ? ing.defaultExpirationDays + 'd shelf' : '\u2014'}
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        `}
      </div>
    `;
  }

function viewIngredientInfo(ingredientName) {
    const name = ingredientName.toLowerCase().trim();
    let knowledge = (state.ingredientKnowledge || []).find(k => k.name.toLowerCase() === name);

    if (!knowledge) {
      knowledge = createDefaultIngredientKnowledge(name);
      state.ingredientKnowledge.push(knowledge);
      storage.create(knowledge);
    }

    state.selectedIngredientId = name;
    state.currentView = 'ingredient-detail';
    render();
  }

function showIngredientDetail(ingredientId) {
    const ing = (state.ingredientKnowledge || []).find(i => i.id === ingredientId);
    if (!ing) return;

    state.selectedIngredientId = ing.name.toLowerCase();
    state.currentView = 'ingredient-detail';
    render();
  }

function showAddIngredientKnowledgeModal() {
    const categories = ['Vegetables', 'Fruits', 'Proteins', 'Dairy', 'Grains', 'Herbs & Spices', 'Pantry', 'Other'];

    openModal(`
      <div style="color: ${CONFIG.text_color}; max-height: 80vh; overflow-y: auto;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Add New Ingredient</h2>

        <div class="mb-4">
          <label style="display: block; margin-bottom: 6px; font-weight: 500;">Name *</label>
          <input type="text" id="newIngName" placeholder="e.g., Chicken Breast"
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
        </div>

        <div class="mb-4">
          <label style="display: block; margin-bottom: 6px; font-weight: 500;">Category</label>
          <select id="newIngCategory"
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color};">
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
        </div>

        <div class="mb-4">
          <label style="display: block; margin-bottom: 6px; font-weight: 500;">Default Shelf Life (days)</label>
          <input type="number" id="newIngExpDays" placeholder="e.g., 7"
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
        </div>

        <div class="mb-4">
          <label style="display: block; margin-bottom: 6px; font-weight: 500;">Image URL (optional)</label>
          <input type="url" id="newIngImage" placeholder="https://..."
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
        </div>

        <div style="display: flex; gap: 8px;">
          <button onclick="closeModal()"
            style="flex: 1; padding: 12px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">
            Cancel
          </button>
          <button onclick="saveNewIngredientKnowledge()"
            style="flex: 1; padding: 12px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Add Ingredient
          </button>
        </div>
      </div>
    `);
  }

async function saveNewIngredientKnowledge() {
    const name = document.getElementById('newIngName')?.value.trim();
    const category = document.getElementById('newIngCategory')?.value;
    const expDays = document.getElementById('newIngExpDays')?.value;
    const imageUrl = document.getElementById('newIngImage')?.value.trim();

    if (!name) {
      showError('Please enter an ingredient name');
      return;
    }

    const exists = (state.ingredientKnowledge || []).some(ing =>
      ing.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      showError('This ingredient already exists');
      return;
    }

    const ingredient = {
      id: `ingredient_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: 'ingredient_knowledge',
      name: name.toLowerCase(),
      category: category || 'Other',
      defaultExpirationDays: expDays ? parseInt(expDays) : null,
      image_url: imageUrl || null,
      createdAt: new Date().toISOString()
    };

    try {
      await storage.create(ingredient);
      state.ingredientKnowledge.push(ingredient);
      closeModal();
      showToast('Ingredient added!', 'success');
      render();
    } catch (e) {
      console.error('Failed to save ingredient:', e);
      showError('Failed to save ingredient');
    }
  }

// ===== GROUP 3: BLENDS =====

function renderMyBlends() {
    const blends = state.seasoningBlends || [];
    const blendTypes = ['All', 'Seasoning', 'Smoothie', 'Veggie Mix', 'Marinade', 'Other'];
    const filterType = state.blendFilterType || 'All';

    const filteredBlends = filterType === 'All'
      ? blends
      : blends.filter(b => b.blendType === filterType);

    return `
      <div>
        <!-- Header -->
        <div class="flex items-center justify-between mb-3">
          <div style="color:${CONFIG.text_muted}; font-size:12px;">
            ${blends.length} blend${blends.length !== 1 ? 's' : ''}
          </div>
          <button onclick="showAddBlendModal()"
            style="padding:8px 14px; background:${CONFIG.primary_action_color}; color:white; border:none; border-radius:8px; font-size:11px; cursor:pointer;">
            + New Blend
          </button>
        </div>

        <!-- Filters -->
        <div class="flex gap-1 flex-wrap mb-3">
          ${blendTypes.map(type => `
            <button onclick="state.blendFilterType = '${type}'; render();"
              class="px-2 py-1 rounded"
              style="background:${filterType === type ? CONFIG.primary_action_color : CONFIG.surface_color}; color:${filterType === type ? 'white' : CONFIG.text_color}; font-size:10px; border:none;">
              ${type}
            </button>
          `).join('')}
        </div>

        ${filteredBlends.length === 0 ? `
          <div class="p-6 rounded-xl text-center" style="background:${CONFIG.surface_color};">
            <div style="font-size:2rem; margin-bottom:8px;">🧂</div>
            <div style="font-size:14px; font-weight:600; color:${CONFIG.text_color}; margin-bottom:4px;">
              ${blends.length === 0 ? 'No blends yet' : 'No ' + filterType.toLowerCase() + ' blends'}
            </div>
            <div style="font-size:12px; color:${CONFIG.text_muted}; margin-bottom:12px;">
              Create custom seasoning mixes, smoothie combos & more
            </div>
            <button onclick="showAddBlendModal()"
              style="padding:8px 16px; background:${CONFIG.primary_action_color}; color:white; border:none; border-radius:8px; cursor:pointer; font-size:12px;">
              + Create Blend
            </button>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            ${filteredBlends.map(blend => `
              <div onclick="showBlendDetail('${blend.id}')"
                class="rounded-lg p-3 cursor-pointer"
                style="background:${CONFIG.surface_color}; border:1px solid rgba(255,255,255,0.06);">
                <div class="flex items-start justify-between mb-1">
                  <div style="flex:1; min-width:0;">
                    <div style="font-size:13px; font-weight:600; color:${CONFIG.text_color}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${esc(blend.name)}
                    </div>
                    <div style="font-size:10px; color:${CONFIG.text_muted};">
                      ${blend.blendType || 'Other'} \u00b7 ${(blend.ingredients || []).length} items
                    </div>
                  </div>
                </div>
                <div style="font-size:10px; color:${CONFIG.text_muted}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${(blend.ingredients || []).slice(0, 4).map(ing => capitalize(ing.name)).join(', ')}${(blend.ingredients || []).length > 4 ? '...' : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

function showAddBlendModal() {
    state.blendForm = {
      id: null,
      name: '',
      blendType: 'Seasoning',
      ingredients: [],
      notes: '',
      recordingUrl: ''
    };
    renderBlendEditModal();
  }

function showBlendDetail(blendId) {
    const blend = (state.seasoningBlends || []).find(b => b.id === blendId);
    if (!blend) return;

    openModal(`
      <div style="color: ${CONFIG.text_color}; max-height: 80vh; overflow-y: auto;">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 style="font-size: 22px; font-weight: 700;">${esc(blend.name)}</h2>
            <div style="color: ${CONFIG.text_muted}; font-size: 14px;">
              ${blend.blendType || 'Other'} \u2022 ${(blend.ingredients || []).length} ingredients
            </div>
          </div>
          <span style="font-size: 32px;">
            ${blend.blendType === 'Seasoning' ? '🧂' : blend.blendType === 'Smoothie' ? '🥤' : blend.blendType === 'Veggie Mix' ? '🥗' : blend.blendType === 'Marinade' ? '🫗' : '📦'}
          </span>
        </div>

        <!-- Ingredients -->
        <div class="mb-4 p-4 rounded-lg" style="background: ${CONFIG.background_color};">
          <div style="font-weight: 600; margin-bottom: 12px;">Ingredients</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${(blend.ingredients || []).map(ing => `
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${esc(capitalize(ing.name))}</span>
                ${ing.amount ? `<span style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption};">${esc(ing.amount)}${ing.unit ? ' ' + esc(ing.unit) : ''}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        ${blend.notes ? `
          <div class="mb-4 p-4 rounded-lg" style="background: ${CONFIG.background_color};">
            <div style="font-weight: 600; margin-bottom: 8px;">Notes</div>
            <div style="font-size: 14px; white-space: pre-wrap;">${esc(blend.notes)}</div>
          </div>
        ` : ''}

        ${blend.recordingUrl ? `
          <div class="mb-4">
            <a href="${esc(blend.recordingUrl)}" target="_blank"
               style="display: inline-flex; align-items: center; gap: 8px; color: ${CONFIG.primary_action_color};">
              🎥 Watch Recording
            </a>
          </div>
        ` : ''}

        <div class="flex gap-2">
          <button onclick="editBlend('${blend.id}')"
            class="flex-1 py-3 rounded-lg font-medium"
            style="background: ${CONFIG.primary_action_color}; color: white;">
            ✏️ Edit
          </button>
          <button onclick="if(confirm('Delete this blend?')) deleteBlend('${blend.id}')"
            class="py-3 px-4 rounded-lg"
            style="background: rgba(239,68,68,0.1); color: ${CONFIG.danger_color};">
            🗑️
          </button>
        </div>

        <button onclick="closeModal()"
          class="w-full mt-3 py-2 rounded-lg"
          style="background: ${CONFIG.background_color}; color: ${CONFIG.text_color};">
          Close
        </button>
      </div>
    `);
  }

function editBlend(blendId) {
    const blend = (state.seasoningBlends || []).find(b => b.id === blendId);
    if (!blend) return;

    state.blendForm = { ...blend };
    closeModal();
    renderBlendEditModal();
  }

function renderBlendEditModal() {
    const form = state.blendForm;
    if (!form) return;

    const blendTypes = ['Seasoning', 'Smoothie', 'Veggie Mix', 'Marinade', 'Other'];
    const measurementUnits = ['', 'tsp', 'tbsp', 'cup', 'oz', 'g', 'lb', 'pinch', 'dash', 'sprinkle', 'to taste', 'handful', 'scoop'];

    openModal(`
      <div style="color: ${CONFIG.text_color}; max-height: 85vh; overflow-y: auto;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">
          ${form.id ? 'Edit' : 'New'} Blend
        </h2>

        <!-- Name -->
        <div class="mb-4">
          <label style="display: block; margin-bottom: 6px; font-weight: 500;">Blend Name</label>
          <input type="text" id="blendName" value="${esc(form.name || '')}"
            placeholder="e.g., My Chicken Seasoning"
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
        </div>

        <!-- Type -->
        <div class="mb-4">
          <label style="display: block; margin-bottom: 6px; font-weight: 500;">Type</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${blendTypes.map(type => `
              <button type="button" onclick="state.blendForm.blendType = '${type}'; renderBlendEditModal();"
                style="padding: 8px 16px; border-radius: 20px; border: none; cursor: pointer; font-size: 14px;
                       background: ${form.blendType === type ? CONFIG.primary_action_color : CONFIG.background_color};
                       color: ${form.blendType === type ? 'white' : CONFIG.text_color};">
                ${type === 'Seasoning' ? '🧂' : type === 'Smoothie' ? '🥤' : type === 'Veggie Mix' ? '🥗' : type === 'Marinade' ? '🫗' : '📦'} ${type}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Ingredients -->
        <div class="mb-4">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label style="font-weight: 500;">Ingredients</label>
            <button type="button" onclick="addBlendIngredient()"
              style="padding: 6px 12px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 6px; font-size: ${CONFIG.type_caption}; cursor: pointer;">
              + Add
            </button>
          </div>

         <div id="blendIngredientsList" style="display: flex; flex-direction: column; gap: 8px;">
            ${(form.ingredients || []).map((ing, idx) => `
              <div style="display: flex; gap: 8px; align-items: center; padding: 10px; background: ${CONFIG.background_color}; border-radius: 8px;">
                <div style="flex: 2; position: relative;">
                  <input type="text" id="blendIng_${idx}" value="${esc(capitalize(ing.name || ''))}"
                    placeholder="Search ingredient..."
                    oninput="showBlendIngredientDropdown(${idx}, this.value)"
                    onfocus="showBlendIngredientDropdown(${idx}, this.value)"
                    onblur="setTimeout(() => hideBlendIngredientDropdown(${idx}), 200)"
                    autocomplete="off"
                    style="width: 100%; padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 14px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
                  <div id="blendIngDropdown_${idx}" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100; max-height: 200px; overflow-y: auto;"></div>
                </div>
                <input type="text" value="${esc(ing.amount || '')}"
                  placeholder="Amt"
                  onchange="updateBlendIngredient(${idx}, 'amount', this.value)"
                  style="width: 55px; padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 14px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
                <select onchange="updateBlendIngredient(${idx}, 'unit', this.value)"
                  style="width: 75px; padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 14px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color};">
                  ${measurementUnits.map(u => `<option value="${u}" ${ing.unit === u ? 'selected' : ''}>${u || '\u2014'}</option>`).join('')}
                </select>
                <button type="button" onclick="removeBlendIngredient(${idx})"
                  style="padding: 8px; background: rgba(239,68,68,0.1); color: ${CONFIG.danger_color}; border: none; border-radius: 6px; cursor: pointer;">
                  \u2715
                </button>
              </div>
            `).join('')}

            ${(form.ingredients || []).length === 0 ? `
              <div style="padding: 20px; text-align: center; color: ${CONFIG.text_muted}; font-size: 14px;">
                No ingredients yet. Click "+ Add" to start.
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Notes -->
        <div class="mb-4">
          <label style="display: block; margin-bottom: 6px; font-weight: 500;">Notes (optional)</label>
          <textarea id="blendNotes" placeholder="Tips, variations, how to use..."
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; min-height: 80px;">${esc(form.notes || '')}</textarea>
        </div>

        <!-- Recording URL -->
        <div class="mb-4">
          <label style="display: block; margin-bottom: 6px; font-weight: 500;">Recording Link (optional)</label>
          <input type="url" id="blendRecordingUrl" value="${esc(form.recordingUrl || '')}"
            placeholder="https://youtube.com/..."
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 8px;">
          <button onclick="state.blendForm = null; closeModal();"
            style="flex: 1; padding: 12px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">
            Cancel
          </button>
          <button onclick="saveBlend()"
            style="flex: 1; padding: 12px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Save Blend
          </button>
        </div>
      </div>
    `);
  }

function showBlendIngredientDropdown(idx, searchTerm) {
    const dropdown = document.getElementById(`blendIngDropdown_${idx}`);
    if (!dropdown) return;

    const search = normalizeString(searchTerm);

    const allIngredients = new Map();

    state.inventory.forEach(item => {
      const name = item.name.toLowerCase();
      if (!allIngredients.has(name)) {
        allIngredients.set(name, { name: item.name, source: 'pantry' });
      }
    });

    (state.ingredientKnowledge || []).forEach(ing => {
      const name = ing.name.toLowerCase();
      if (!allIngredients.has(name)) {
        allIngredients.set(name, { name: ing.name, source: 'library' });
      }
    });

    Object.keys(INGREDIENT_IMAGES).forEach(name => {
      if (!allIngredients.has(name)) {
        allIngredients.set(name, { name: name, source: 'default' });
      }
    });

    let filtered = Array.from(allIngredients.values())
      .filter(ing => ing.name.toLowerCase().includes(search))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 15);

    if (search && !filtered.some(ing => ing.name.toLowerCase() === search)) {
      filtered.unshift({ name: search, source: 'custom' });
    }

    if (filtered.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    dropdown.innerHTML = filtered.map(ing => `
      <div onclick="selectBlendIngredient(${idx}, '${esc(ing.name)}')"
        style="padding: 10px 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: ${CONFIG.text_color};"
        onmouseover="this.style.background='rgba(232,93,93,0.1)'"
        onmouseout="this.style.background='transparent'">
        <span>${esc(capitalize(ing.name))}</span>
        <span style="font-size: ${CONFIG.type_micro}; opacity: 0.5;">${ing.source === 'custom' ? 'new' : ing.source === 'pantry' ? 'pantry' : ''}</span>
      </div>
    `).join('');

    dropdown.style.display = 'block';
  }

function hideBlendIngredientDropdown(idx) {
    const dropdown = document.getElementById(`blendIngDropdown_${idx}`);
    if (dropdown) {
      dropdown.style.display = 'none';
    }
  }

function selectBlendIngredient(idx, name) {
    const input = document.getElementById(`blendIng_${idx}`);
    if (input) {
      input.value = capitalize(name);
    }
    updateBlendIngredient(idx, 'name', name);
    hideBlendIngredientDropdown(idx);
  }

function addBlendIngredient() {
    if (!state.blendForm) return;
    if (!state.blendForm.ingredients) state.blendForm.ingredients = [];
    state.blendForm.ingredients.push({ name: '', amount: '', unit: '' });
    renderBlendEditModal();
  }

function updateBlendIngredient(idx, field, value) {
    if (!state.blendForm || !state.blendForm.ingredients) return;
    state.blendForm.ingredients[idx][field] = value;
  }

function removeBlendIngredient(idx) {
    if (!state.blendForm || !state.blendForm.ingredients) return;
    state.blendForm.ingredients.splice(idx, 1);
    renderBlendEditModal();
  }

async function saveBlend() {
    const name = document.getElementById('blendName')?.value.trim();
    const notes = document.getElementById('blendNotes')?.value.trim();
    const recordingUrl = document.getElementById('blendRecordingUrl')?.value.trim();

    if (!name) {
      showError('Please enter a blend name');
      return;
    }

    if (!state.blendForm.ingredients || state.blendForm.ingredients.length === 0) {
      showError('Please add at least one ingredient');
      return;
    }

    const ingredients = state.blendForm.ingredients
      .filter(ing => ing.name && ing.name.trim())
      .map(ing => ({
        name: ing.name.trim().toLowerCase(),
        amount: ing.amount?.trim() || '',
        unit: ing.unit || ''
      }));

    if (ingredients.length === 0) {
      showError('Please add at least one ingredient with a name');
      return;
    }

    const blend = {
      id: state.blendForm.id || `blend_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: 'seasoning_blend',
      name: name,
      blendType: state.blendForm.blendType || 'Other',
      ingredients: ingredients,
      notes: notes,
      recordingUrl: recordingUrl,
      updatedAt: new Date().toISOString()
    };

    try {
      if (state.blendForm.id) {
        await storage.update(blend);
        state.seasoningBlends = state.seasoningBlends.map(b => b.id === blend.id ? blend : b);
        showToast('Blend updated!', 'success');
      } else {
        await storage.create(blend);
        state.seasoningBlends.push(blend);
        showToast('Blend created!', 'success');
      }

      state.blendForm = null;
      closeModal();
      render();
    } catch (e) {
      console.error('Failed to save blend:', e);
      showError('Failed to save blend');
    }
  }

async function deleteBlend(blendId) {
    const blend = state.seasoningBlends.find(b => b.id === blendId);
    if (!blend) return;

    try {
      await storage.delete(blend);
      state.seasoningBlends = state.seasoningBlends.filter(b => b.id !== blendId);
      closeModal();
      showToast('Blend deleted', 'success');
      render();
    } catch (e) {
      console.error('Failed to delete blend:', e);
      showError('Failed to delete blend');
    }
  }

// ===== GROUP 1: INVENTORY RENDERING AND MANAGEMENT =====

function renderInventoryItem(item) {
    const status = getExpirationStatus(item);
    const statusColor = getExpirationColor(status);
    const daysUntil = item.expirationDate ?
      Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    let statusText = '';
    if (item.isFrozen) {
      statusText = 'Frozen';
    } else if (daysUntil !== null) {
      statusText = `${daysUntil}d`;
    }

    const imgUrl = item.image_url || getIngredientImage(item.name, item.category || 'Uncategorized');
    const isUrgent = status === 'expired' || status === 'expiring-soon';

    return `
      <div onclick="showInventoryItemDetail('${item.id}')"
        class="rounded-lg overflow-hidden cursor-pointer"
        style="background:${CONFIG.surface_color}; border:${isUrgent ? '2px solid ' + CONFIG.danger_color : item.isFrozen ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)'};">
        <div style="height:60px; overflow:hidden; background:${CONFIG.background_color}; position:relative;">
          ${imgUrl ? `
            <img loading="lazy" src="${esc(imgUrl)}" style="width:100%; height:100%; object-fit:cover;"
                 onerror="this.style.display='none';" />
          ` : `
            <div style="height:100%; display:flex; align-items:center; justify-content:center; color:${CONFIG.text_muted}; font-size:11px;">
              No image
            </div>
          `}
          ${item.wantToUse ? `
            <div style="position:absolute; top:2px; right:2px; background:#34d399; color:white; border-radius:3px; padding:1px 4px; font-size:8px;">
              Use
            </div>
          ` : ''}
          ${item.isFrozen ? `
            <div style="position:absolute; top:2px; left:2px; background:#3b82f6; color:white; border-radius:3px; padding:1px 4px; font-size:8px;">
              \u2744
            </div>
          ` : ''}
        </div>
        <div style="padding:6px;">
          <div style="color:${CONFIG.text_color}; font-size:10px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${esc(item.name)}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
            <span style="color:${CONFIG.text_muted}; font-size:9px;">
              ${item.quantity || 1}${item.unit ? ' ' + item.unit : ''}
            </span>
            ${statusText ? `
              <span style="color:${statusColor}; font-size:9px; font-weight:500;">
                ${statusText}
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

function renderInventoryCategory(cat, items) {
    if (items.length === 0) return '';

    return `
      <div class="mb-4">
        <div style="color:${CONFIG.text_muted}; font-size:11px; font-weight:600; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">
          ${cat} (${items.length})
        </div>
        <div class="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          ${items.map(item => renderInventoryItem(item)).join('')}
        </div>
      </div>
    `;
  }

function renderInventory() {
    const inventory = getInventoryItems();
    const categories = [
      'Uncategorized',
      'Vegetables', 'Fruits', 'Proteins', 'Dairy', 'Grains', 'Herbs & Spices', 'Pantry', 'Other',
      'Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery', 'Frozen', 'Snacks', 'Beverages'
    ];
    const grouped = {};
    categories.forEach(cat => grouped[cat] = []);

    // Category filter pills
    const categoryFilters = [
      { id: 'all', label: 'All' },
      { id: 'Proteins', label: 'Proteins' },
      { id: 'Produce', label: 'Produce' },
      { id: 'Dairy', label: 'Dairy' },
      { id: 'Grains', label: 'Grains' },
      { id: 'Pantry', label: 'Pantry' },
      { id: 'Spices', label: 'Spices' }
    ];
    const activeCatFilter = state.inventoryCategoryFilter || 'all';

    // Category mapping for filter matching
    const categoryFilterMap = {
      'Proteins': ['Proteins', 'Meat & Seafood'],
      'Produce': ['Produce', 'Vegetables', 'Fruits'],
      'Dairy': ['Dairy', 'Dairy & Eggs'],
      'Grains': ['Grains', 'Bakery'],
      'Pantry': ['Pantry', 'Pantry Staples', 'Other', 'Frozen', 'Snacks', 'Beverages'],
      'Spices': ['Herbs & Spices']
    };

    let filteredInventory = inventory;

    // Apply category filter
    if (activeCatFilter !== 'all') {
      const matchCats = categoryFilterMap[activeCatFilter] || [activeCatFilter];
      filteredInventory = filteredInventory.filter(i => matchCats.includes(i.category || 'Uncategorized'));
    }

    // Apply search
    const searchTerm = (state.inventorySearchTerm || '').toLowerCase();
    if (searchTerm) {
      filteredInventory = filteredInventory.filter(i => (i.name || '').toLowerCase().includes(searchTerm));
    }

    filteredInventory.forEach(item => {
      const cat = item.category || 'Uncategorized';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    Object.keys(grouped).forEach(cat => {
      grouped[cat].sort((a, b) => {
        const statusOrder = { 'expired': 0, 'expiring-soon': 1, 'expiring': 2, 'fresh': 3, 'frozen': 4, 'unknown': 5 };
        return (statusOrder[getExpirationStatus(a)] || 5) - (statusOrder[getExpirationStatus(b)] || 5);
      });
    });

    return `
      <div class="p-3 max-w-4xl mx-auto">
        <!-- Action buttons -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex gap-1">
            <button onclick="showAddInventoryModal()"
              class="px-2 py-1 rounded"
              style="background:${CONFIG.primary_action_color}; color:white; font-size:11px; border:none;">
              + Add
            </button>
            <button onclick="showReceiptModal()"
              class="px-2 py-1 rounded"
              style="background:${CONFIG.surface_color}; color:${CONFIG.text_color}; font-size:11px; border:none;">
              Scan
            </button>
          </div>
        </div>

        <!-- Search bar -->
        <div style="position:relative; margin-bottom: 8px;">
          <svg width="16" height="16" fill="none" stroke="${CONFIG.text_tertiary}" stroke-width="1.5" viewBox="0 0 24 24" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%);"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
          <input type="text" id="inventorySearchInput" placeholder="Search inventory..."
            value="${esc(state.inventorySearchTerm || '')}"
            oninput="state.inventorySearchTerm = this.value; render(); setTimeout(() => { const i = document.getElementById('inventorySearchInput'); if(i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 0);"
            style="width:100%; height:40px; padding:0 10px 0 34px; border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:14px; background:${CONFIG.surface_color}; color:${CONFIG.text_color}; box-sizing:border-box; font-family:${CONFIG.font_family};" />
        </div>

        <!-- Category filter pills -->
        <div style="display:flex; gap:6px; overflow-x:auto; margin-bottom:12px; -webkit-overflow-scrolling:touch; scrollbar-width:none;">
          ${categoryFilters.map(f => {
            const active = activeCatFilter === f.id;
            return `<button onclick="state.inventoryCategoryFilter = '${f.id}'; render();"
              style="flex-shrink:0; padding:8px 16px; border-radius:20px; border:none;
              background:${active ? CONFIG.primary_action_color : 'transparent'};
              color:${active ? 'white' : CONFIG.text_muted};
              font-size:13px; font-weight:${active ? '600' : '500'}; cursor:pointer; white-space:nowrap;">
              ${f.label}</button>`;
          }).join('')}
        </div>

        <!-- Empty State -->
        ${filteredInventory.length === 0 ? `
          <div class="p-6 rounded-xl text-center" style="background:${CONFIG.surface_color};">
            <div style="font-size:2rem; margin-bottom:8px;">\ud83d\udce6</div>
            <div style="font-size:14px; font-weight:600; color:${CONFIG.text_color}; margin-bottom:4px;">
              ${searchTerm || activeCatFilter !== 'all' ? 'No matches found' : 'Pantry is empty'}
            </div>
            <div style="font-size:12px; color:${CONFIG.text_muted}; margin-bottom:12px;">
              ${searchTerm || activeCatFilter !== 'all' ? 'Try a different search or filter' : 'Add items to get started'}
            </div>
            ${!searchTerm && activeCatFilter === 'all' ? `
              <div style="display:flex; gap:8px; justify-content:center;">
                <button onclick="showReceiptModal()" style="padding:8px 16px; background:${CONFIG.success_color}; color:white; border:none; border-radius:8px; cursor:pointer; font-size:12px;">
                  Scan Receipt
                </button>
                <button onclick="showAddInventoryModal()" style="padding:8px 16px; background:${CONFIG.primary_action_color}; color:white; border:none; border-radius:8px; cursor:pointer; font-size:12px;">
                  + Add Item
                </button>
              </div>
            ` : `
              <button onclick="state.inventoryCategoryFilter = 'all'; state.inventorySearchTerm = ''; render();" style="padding:8px 16px; background:${CONFIG.surface_color}; color:${CONFIG.primary_action_color}; border:1px solid ${CONFIG.primary_action_color}; border-radius:8px; cursor:pointer; font-size:12px;">
                Show All
              </button>
            `}
          </div>
        ` : `
          <!-- Items Grid -->
          ${categories.map(cat => renderInventoryCategory(cat, grouped[cat])).join('')}
        `}
      </div>
    `;
  }

async function useInventoryItem(id) {
    const item = state.inventory.find(i => i.id === id);
    if (!item) return;

    if (confirm('Mark this item as used/finished?')) {
      const historyItem = {
        id: `history_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image_url: item.image_url,
        purchaseDate: item.purchaseDate,
        usedDate: getToday(),
        originalId: item.id
      };

      await storage.create(historyItem);
      await deleteInventoryItem(id);
      showToast('Item moved to history', 'success');
    }
  }

function selectSuggestion(index, suggestion) {
    const input = document.getElementById(`editItemName_${index}`);
    if (input) {
      input.value = suggestion;
    }
  }

async function confirmItemEdit(index) {
    const input = document.getElementById(`editItemName_${index}`);
    const checkbox = document.getElementById(`receiptItem_${index}`);
    const rememberCheckbox = document.getElementById(`rememberMapping_${index}`);

    if (!input || !checkbox) return;

    const newName = input.value.trim();
    const rawText = checkbox.dataset.raw || window._receiptItems?.[index]?.rawText;

    if (!newName) {
      showError('Please enter an item name');
      return;
    }

    if (window._receiptItems?.[index]) {
      window._receiptItems[index].name = newName;
      window._receiptItems[index].category = guessGroceryCategory(newName);
    }

    checkbox.dataset.name = newName;
    checkbox.dataset.category = guessGroceryCategory(newName);

    if (rememberCheckbox?.checked && rawText && rawText !== newName) {
      await saveReceiptMapping(rawText, newName);
      showToast(`Learned: "${rawText.slice(0, 20)}..." \u2192 "${newName}"`, 'success');
    }

    const row = document.getElementById(`receiptItemRow_${index}`);
    if (row) {
      row.innerHTML = `
        <input type="checkbox" checked
          id="receiptItem_${index}"
          data-name="${esc(newName)}"
          data-raw="${esc(rawText || newName)}"
          data-price="${window._receiptItems?.[index]?.price || 0}"
          data-category="${guessGroceryCategory(newName)}" />
        <div class="flex-1 cursor-pointer" onclick="editReceiptItem(${index})">
          <div style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.85}px;">
            ${esc(newName)}
          </div>
          <div style="color:${CONFIG.text_color}; opacity:0.5; font-size: ${CONFIG.type_micro}; font-weight: ${CONFIG.type_micro_weight}; letter-spacing: ${CONFIG.type_micro_tracking};">
            $${(window._receiptItems?.[index]?.price || 0).toFixed(2)} \u2022 tap to edit
          </div>
        </div>
      `;
    }
  }

function cancelItemEdit(index) {
    const item = window._receiptItems?.[index];
    if (!item) return;

    const row = document.getElementById(`receiptItemRow_${index}`);
    if (row) {
      row.innerHTML = `
        <input type="checkbox" checked
          id="receiptItem_${index}"
          data-name="${esc(item.name)}"
          data-raw="${esc(item.rawText || item.name)}"
          data-price="${item.price}"
          data-category="${item.category}" />
        <div class="flex-1 cursor-pointer" onclick="editReceiptItem(${index})">
          <div style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.85}px;">
            ${esc(item.name)}
          </div>
          <div style="color:${CONFIG.text_color}; opacity:0.5; font-size: ${CONFIG.type_micro}; font-weight: ${CONFIG.type_micro_weight}; letter-spacing: ${CONFIG.type_micro_tracking};">
            $${item.price.toFixed(2)} \u2022 tap to edit
          </div>
        </div>
      `;
    }
  }

function showQuickAddItemModal() {
    const container = document.querySelector('.max-h-32.overflow-y-auto');
    if (!container) return;

    const newItemHtml = `
      <div class="flex items-center gap-2 py-1 mt-2 pt-2" style="border-top: 1px solid ${CONFIG.divider_color};" id="newItemRow">
        <input type="checkbox" checked id="receiptItem_new"
          data-name="" data-price="0" data-category="Other" />
        <input type="text" id="newItemName" placeholder="Item name"
          class="flex-1 px-2 py-1 rounded text-sm"
          style="background:rgba(0,0,0,0.3); color:white; border:1px solid rgba(255,255,255,0.2);" />
        <input type="number" id="newItemPrice" placeholder="0.00" step="0.01"
          class="w-20 px-2 py-1 rounded text-sm"
          style="background:rgba(0,0,0,0.3); color:white; border:1px solid rgba(255,255,255,0.2);" />
        <button onclick="confirmQuickAddItem()" class="px-2 py-1 rounded text-sm"
          style="background:${CONFIG.success_color}; color:white;">\u2713</button>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', newItemHtml);
    document.getElementById('newItemName')?.focus();
  }

function confirmQuickAddItem() {
    const nameInput = document.getElementById('newItemName');
    const priceInput = document.getElementById('newItemPrice');
    const checkbox = document.getElementById('receiptItem_new');

    const name = nameInput?.value.trim();
    const price = parseFloat(priceInput?.value) || 0;

    if (!name) {
      showError('Please enter an item name');
      return;
    }

    if (checkbox) {
      checkbox.dataset.name = name;
      checkbox.dataset.price = price.toString();
      checkbox.dataset.category = guessGroceryCategory(name);
      checkbox.id = `receiptItem_${Date.now()}`;
    }

    const row = document.getElementById('newItemRow');
    if (row) {
      row.innerHTML = `
        <input type="checkbox" checked
          id="${checkbox?.id}"
          data-name="${name}"
          data-price="${price}"
          data-category="${guessGroceryCategory(name)}" />
        <span style="color:white; font-size:14px;">
          ${name} - $${price.toFixed(2)}
        </span>
      `;
      row.id = '';
    }

    showToast('Item added!', 'success');
  }

async function toggleFrozen(id) {
    const item = state.inventory.find(i => i.id === id);
    if (!item) return;

    try {
      const updated = { ...item, isFrozen: !item.isFrozen };
      if (item.isFrozen && !updated.isFrozen) {
        updated.expirationDate = suggestExpirationDate(item.name, item.category, getToday());
      }
      await storage.update(updated);
      showToast(updated.isFrozen ? 'Item frozen' : 'Item unfrozen', 'success');
    } catch (error) {
      console.error('toggleFrozen failed:', error);
      showError('Failed to update item');
    }
  }

function showEditInventoryModal(id) {
    const item = state.inventory.find(i => i.id === id);
    if (!item) return;

    const suggestedDays = getExpirationDays(item.name, item.category);

    openModal(`
      <div style="color: ${CONFIG.text_color};">
        <h2 class="text-2xl font-bold mb-4">Edit ${esc(item.name)}</h2>

        <div class="mb-4">
          <label class="block mb-2 font-semibold">Item Name:</label>
          <input type="text" id="editInvName" value="${esc(item.name)}"
                 class="w-full px-3 py-2 border rounded" />
        </div>

        <div class="mb-4">
          <label class="block mb-2 font-semibold">Photo:</label>
          ${item.image_url ? `
            <img loading="lazy" src="${esc(item.image_url)}" class="w-full h-32 object-cover rounded mb-2" />
          ` : ''}
          <div class="flex gap-2">
            <input type="text" id="editInvImageUrl" value="${esc(item.image_url || '')}"
                   class="flex-1 px-3 py-2 border rounded" placeholder="Paste image URL..." />
            <button type="button" onclick="document.getElementById('editInvImageUpload').click()"
                    class="px-3 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">
              \ud83d\udcf7 Upload
            </button>
            <input type="file" id="editInvImageUpload" accept="image/*" style="display:none;"
                   onchange="handleEditInventoryImageUpload(event)" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block mb-2 font-semibold">Quantity:</label>
            <input type="number" id="editInvQty" value="${item.quantity || 1}"
                   class="w-full px-3 py-2 border rounded" min="1" />
          </div>
          <div>
            <label class="block mb-2 font-semibold">Unit:</label>
            <input type="text" id="editInvUnit" value="${esc(item.unit || '')}"
                   class="w-full px-3 py-2 border rounded" placeholder="lbs, oz, etc." />
          </div>
        </div>

        <div class="mb-4">
          <label class="block mb-2 font-semibold">Category:</label>
          <select id="editInvCategory" class="w-full px-3 py-2 border rounded">
            <option value="Uncategorized" ${item.category === 'Uncategorized' ? 'selected' : ''}>Uncategorized</option>
            <option value="Produce" ${item.category === 'Produce' ? 'selected' : ''}>Produce</option>
            <option value="Meat & Seafood" ${item.category === 'Meat & Seafood' ? 'selected' : ''}>Meat & Seafood</option>
            <option value="Dairy & Eggs" ${item.category === 'Dairy & Eggs' ? 'selected' : ''}>Dairy & Eggs</option>
            <option value="Bakery" ${item.category === 'Bakery' ? 'selected' : ''}>Bakery</option>
            <option value="Frozen" ${item.category === 'Frozen' ? 'selected' : ''}>Frozen</option>
            <option value="Pantry" ${item.category === 'Pantry' ? 'selected' : ''}>Pantry</option>
            <option value="Snacks" ${item.category === 'Snacks' ? 'selected' : ''}>Snacks</option>
            <option value="Beverages" ${item.category === 'Beverages' ? 'selected' : ''}>Beverages</option>
            <option value="Other" ${item.category === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block mb-2 font-semibold">Expiration Date:</label>
          <input type="date" id="editInvExpiration" value="${item.expirationDate || ''}"
                 class="w-full px-3 py-2 border rounded" />
          <div class="text-sm mt-1" style="color: ${CONFIG.text_muted};">
            AI suggests ${suggestedDays} days for this item
          </div>
        </div>

       <div class="mb-4 p-3 rounded" style="background:${CONFIG.surface_elevated};">
          <label class="block mb-2 font-semibold text-sm">Default Expiration for "${esc(item.name)}":</label>
          <div class="flex items-center gap-2">
            <input type="number" id="editInvDefaultDays" value="${suggestedDays}"
                   class="w-20 px-2 py-1 border rounded text-center" min="1" />
            <span class="text-sm">days</span>
            <button type="button" onclick="saveDefaultFromModal('${esc(item.name)}')"
                    class="px-3 py-1 text-sm rounded button-hover" style="background: ${CONFIG.primary_action_color}; color: white;">
              Save as Default
            </button>
          </div>
          <div class="text-xs mt-1" style="color: ${CONFIG.text_muted};">
            AI suggested ${DEFAULT_EXPIRATION_DAYS[item.name.toLowerCase()] || DEFAULT_EXPIRATION_DAYS['_' + item.category] || 7} days.
            ${state.expirationDefaults[item.name.toLowerCase()] ? `Your custom default: ${state.expirationDefaults[item.name.toLowerCase()]} days.` : ''}
          </div>
        </div>

        <div class="mb-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="editInvFrozen" ${item.isFrozen ? 'checked' : ''} />
            <span>\u2744\ufe0f This item is frozen</span>
          </label>
        </div>

        <div class="flex gap-2 justify-end">
          <button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">
            Cancel
          </button>
          <button onclick="saveEditedInventoryItem('${item.id}')"
                  class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.success_color}; color: white;">
            Save Changes
          </button>
        </div>
      </div>
    `);
  }

async function handleEditInventoryImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showToast('Uploading image...', 'info');
    const compressed = await compressImage(file);
    const url = await uploadPhoto(compressed);

    if (url) {
      document.getElementById('editInvImageUrl').value = url;
      showToast('Image uploaded!', 'success');
    }
    event.target.value = '';
  }

async function saveDefaultFromModal(itemName) {
    const daysInput = document.getElementById('editInvDefaultDays');
    const days = parseInt(daysInput?.value);

    if (!days || days < 1) {
      showError('Please enter a valid number of days');
      return;
    }

    await saveExpirationDefault(itemName, days);
    showToast(`Default for "${itemName}" set to ${days} days`, 'success');
  }

async function saveEditedInventoryItem(id) {
    const item = state.inventory.find(i => i.id === id);
    if (!item) return;

    const name = document.getElementById('editInvName').value.trim();
    const quantity = parseInt(document.getElementById('editInvQty').value) || 1;
    const unit = document.getElementById('editInvUnit').value.trim();
    const category = document.getElementById('editInvCategory').value;
    const expirationDate = document.getElementById('editInvExpiration').value;
    const isFrozen = document.getElementById('editInvFrozen').checked;
    const imageUrl = document.getElementById('editInvImageUrl').value.trim();

    if (!name) {
      showError('Please enter an item name');
      return;
    }

    const updated = {
      ...item,
      name,
      quantity,
      unit,
      category,
      expirationDate: expirationDate || null,
      isFrozen,
      image_url: imageUrl || null
    };

    closeModal();
    state.isLoading = true;
    render();

    try {
      await storage.update(updated);
      showToast('Item updated!', 'success');
    } catch (e) {
      console.error(e);
      showError('Failed to update item');
    } finally {
      state.isLoading = false;
      render();
    }
  }

async function consolidateInventory() {
    try {
      const groups = {};
      for (const item of state.inventory) {
        const key = item.name.toLowerCase().trim();
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      }

      let consolidated = 0;
      for (const [key, items] of Object.entries(groups)) {
        if (items.length <= 1) continue;
        const master = items[0];
        if (!master.units) {
          master.units = [{
            id: `unit_${Date.now()}_0`,
            expirationDate: master.expirationDate,
            isFrozen: master.isFrozen || false,
            verified: master.expirationVerified !== false,
            purchaseDate: master.purchaseDate,
            purchasePrice: master.purchasePrice
          }];
        }
        for (let i = 1; i < items.length; i++) {
          const item = items[i];
          master.units.push({
            id: `unit_${Date.now()}_${i}`,
            expirationDate: item.expirationDate,
            isFrozen: item.isFrozen || false,
            verified: item.expirationVerified !== false,
            purchaseDate: item.purchaseDate,
            purchasePrice: item.purchasePrice
          });
          await storage.delete(item);
          consolidated++;
        }
        master.quantity = master.units.length;
        const activeUnits = master.units.filter(u => !u.isFrozen && u.expirationDate);
        if (activeUnits.length > 0) {
          activeUnits.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
          master.expirationDate = activeUnits[0].expirationDate;
        }
        await storage.update(master);
      }

      if (consolidated > 0) {
        const data = await storage.query(d => d.id && (d.id.startsWith('inventory_') || d.id.startsWith('inv_')));
        state.inventory = data;
        showToast(`Consolidated ${consolidated} duplicate items!`, 'success');
        render();
      } else {
        showToast('No duplicates to consolidate', 'info');
      }
    } catch (error) {
      console.error('consolidateInventory failed:', error);
      showError('Failed to consolidate inventory');
    }
  }

function showInventoryItemDetail(itemId) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    if (!item.units || item.units.length === 0) {
      item.units = [{
        id: `unit_${Date.now()}_0`,
        expirationDate: item.expirationDate,
        isFrozen: item.isFrozen || false,
        verified: item.expirationVerified !== false,
        purchaseDate: item.purchaseDate,
        purchasePrice: item.purchasePrice
      }];
    }

    const imgUrl = item.image_url || getIngredientImage(item.name, item.category) || '';

    openModal(`
      <div style="color: ${CONFIG.text_color}; max-height: 85vh; overflow-y: auto;">
        <!-- Header with image -->
        <div style="display: flex; gap: 16px; margin-bottom: 20px;">
          ${imgUrl ? `
            <img loading="lazy" src="${esc(imgUrl)}" style="width: 80px; height: 80px; border-radius: 12px; object-fit: cover;"
                 onerror="this.style.display='none'" />
          ` : ''}
          <div style="flex: 1;">
            <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 4px;">${esc(item.name)}</h2>
            <div style="color: ${CONFIG.text_muted}; font-size: 14px;">
              ${esc(item.category || 'Uncategorized')} \u2022 ${item.units.length} unit${item.units.length > 1 ? 's' : ''}
              ${item.store ? ` \u2022 from ${esc(item.store)}` : ''}
            </div>
          </div>
        </div>

        <!-- Units Section -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="font-weight: 600; font-size: 16px;">\ud83d\udce6 Individual Units</div>
            <button onclick="addUnitToItem('${item.id}')" style="padding: 6px 12px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">
              + Add Unit
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${item.units.map((unit, idx) => {
              const isExpired = unit.expirationDate && new Date(unit.expirationDate) < new Date();
              const isExpiringSoon = unit.expirationDate && !isExpired &&
                (new Date(unit.expirationDate) - new Date()) < (3 * 24 * 60 * 60 * 1000);

              let statusColor = CONFIG.success_color;
              let statusText = 'Fresh';

              if (unit.isFrozen) {
                statusColor = '#3b82f6';
                statusText = '\u2744\ufe0f Frozen';
              } else if (isExpired) {
                statusColor = CONFIG.danger_color;
                statusText = '\u26a0\ufe0f Expired';
              } else if (isExpiringSoon) {
                statusColor = CONFIG.warning_color;
                statusText = '\u26a0\ufe0f Expiring soon';
              } else if (!unit.expirationDate) {
                statusColor = CONFIG.text_muted;
                statusText = 'No expiration';
              }

              return `
                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${CONFIG.background_color}; border-radius: 10px; border-left: 4px solid ${statusColor};">
                  <div style="flex: 1;">
                    <div style="font-weight: 500; color: ${statusColor}; font-size: ${CONFIG.type_caption};">${statusText}</div>
                    <div style="font-size: 12px; color: ${CONFIG.text_muted};">
                      ${unit.expirationDate ? 'Exp: ' + new Date(unit.expirationDate + 'T00:00:00').toLocaleDateString() : 'No expiration'}
                      ${unit.purchaseDate ? ' \u2022 Bought: ' + new Date(unit.purchaseDate + 'T00:00:00').toLocaleDateString() : ''}
                      ${!unit.verified ? ' \u2022 <span style="color: ' + CONFIG.warning_color + ';">Unverified</span>' : ''}
                    </div>
                  </div>
                  <button onclick="editUnit('${item.id}', ${idx})" style="padding: 6px 10px; background: ${CONFIG.surface_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 12px; cursor: pointer; color: ${CONFIG.text_color};">
                    Edit
                  </button>
                  <button onclick="toggleFreezeUnit('${item.id}', ${idx})" style="padding: 6px 10px; background: ${unit.isFrozen ? '#3b82f6' : CONFIG.surface_color}; color: ${unit.isFrozen ? 'white' : CONFIG.text_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 12px; cursor: pointer;">
                    ${unit.isFrozen ? '\ud83d\udd25 Thaw' : '\u2744\ufe0f Freeze'}
                  </button>
                  <button onclick="useUnit('${item.id}', ${idx})" style="padding: 6px 10px; background: ${CONFIG.success_color}; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">
                    \u2713 Use
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

       <!-- Want to Use Toggle -->
        <div style="margin-bottom: 16px; padding: 14px; background: ${item.wantToUse ? 'rgba(52,211,153,0.15)' : CONFIG.background_color}; border-radius: 10px; border: 2px solid ${item.wantToUse ? '#34d399' : 'transparent'};">
          <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <input type="checkbox"
              ${item.wantToUse ? 'checked' : ''}
              onchange="toggleWantToUse('${item.id}')"
              style="width: 20px; height: 20px; cursor: pointer;" />
            <div>
              <div style="font-weight: 600; color: ${CONFIG.text_color}; font-size: 14px;">
                ${item.wantToUse ? '\u2713 Marked to use' : 'I want to use this'}
              </div>
              <div style="color: ${CONFIG.text_muted}; font-size: 12px;">
                ${item.wantToUse ? 'Will appear in suggested recipes' : 'Mark to get recipe suggestions'}
              </div>
            </div>
          </label>
        </div>

        <!-- Actions -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button onclick="closeModal(); viewIngredientInfo('${esc(item.name)}')" style="width: 100%; padding: 12px; background: linear-gradient(135deg, ${CONFIG.primary_action_color} 0%, #8b5cf6 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
            \ud83e\udd57 View Ingredient Info
          </button>
          <button onclick="closeModal(); showEditInventoryModal('${item.id}')" style="width: 100%; padding: 12px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; font-weight: 500;">
            \u270f\ufe0f Edit Item Details
          </button>
          <button onclick="deleteInventoryItemCompletely('${item.id}')" style="width: 100%; padding: 12px; background: rgba(239,68,68,0.1); color: ${CONFIG.danger_color}; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
            \ud83d\uddd1\ufe0f Delete All Units
          </button>
        </div>

        <div style="margin-top: 16px; text-align: center;">
          <button onclick="closeModal()" style="padding: 10px 24px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">
            Close
          </button>
        </div>
      </div>
    `);
  }

async function toggleWantToUse(itemId) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    item.wantToUse = !item.wantToUse;

    try {
      await storage.update(item);
      showToast(item.wantToUse ? 'Marked to use!' : 'Unmarked', 'success');
      showInventoryItemDetail(itemId);
    } catch (error) {
      console.error('Error toggling want to use:', error);
      showError('Failed to update');
    }
  }

async function toggleFreezeUnit(itemId, unitIdx) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item || !item.units || !item.units[unitIdx]) return;

    item.units[unitIdx].isFrozen = !item.units[unitIdx].isFrozen;

    if (item.units[unitIdx].isFrozen) {
      item.units[unitIdx].verified = true;
    }

    updateItemExpirationFromUnits(item);

    await storage.update(item);
    showToast(item.units[unitIdx].isFrozen ? 'Unit frozen! \u2744\ufe0f' : 'Unit thawed! \ud83d\udd25', 'success');
    showInventoryItemDetail(itemId);
  }

async function useUnit(itemId, unitIdx) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item || !item.units) return;

    try {
      item.units.splice(unitIdx, 1);
      item.quantity = item.units.length;

      if (item.units.length === 0) {
        await storage.delete(item);
        state.inventory = state.inventory.filter(i => i.id !== itemId);
        closeModal();
        showToast(`Used last ${item.name}!`, 'success');
      } else {
        updateItemExpirationFromUnits(item);
        await storage.update(item);
        showToast(`Used 1 ${item.name}, ${item.units.length} remaining`, 'success');
        showInventoryItemDetail(itemId);
      }
      render();
    } catch (error) {
      console.error('useUnit failed:', error);
      showError('Failed to update item');
    }
  }

function updateItemExpirationFromUnits(item) {
    if (!item.units || item.units.length === 0) return;

    const activeUnits = item.units.filter(u => !u.isFrozen && u.expirationDate);
    if (activeUnits.length > 0) {
      activeUnits.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
      item.expirationDate = activeUnits[0].expirationDate;
    } else {
      const anyExpiration = item.units.find(u => u.expirationDate);
      item.expirationDate = anyExpiration ? anyExpiration.expirationDate : null;
    }

    item.expirationVerified = item.units.every(u => u.verified !== false);
  }

function editUnit(itemId, unitIdx) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item || !item.units || !item.units[unitIdx]) return;

    const unit = item.units[unitIdx];

    const overlay = document.createElement('div');
    overlay.id = 'unitEditOverlay';
    overlay.style.cssText = 'position: fixed; inset: 0; z-index: 70; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(0,0,0,0.5);';
    overlay.innerHTML = `
      <div style="background: ${CONFIG.surface_color}; border-radius: 16px; padding: 20px; width: 100%; max-width: 350px;">
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: ${CONFIG.text_color};">Edit Unit ${unitIdx + 1}</h3>

        <div style="margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500; color: ${CONFIG.text_color};">Expiration Date</label>
          <input type="date" id="editUnitExp" value="${unit.expirationDate || ''}"
            style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
        </div>

        <div style="margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500; color: ${CONFIG.text_color};">Quick Set</label>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button onclick="document.getElementById('editUnitExp').value=''" style="padding: 6px 10px; background: ${CONFIG.background_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer; font-size: 12px; color: ${CONFIG.text_color};">None</button>
            <button onclick="setUnitExpDays(1)" style="padding: 6px 10px; background: ${CONFIG.background_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer; font-size: 12px; color: ${CONFIG.text_color};">1d</button>
            <button onclick="setUnitExpDays(3)" style="padding: 6px 10px; background: ${CONFIG.background_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer; font-size: 12px; color: ${CONFIG.text_color};">3d</button>
            <button onclick="setUnitExpDays(7)" style="padding: 6px 10px; background: ${CONFIG.background_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer; font-size: 12px; color: ${CONFIG.text_color};">1w</button>
            <button onclick="setUnitExpDays(14)" style="padding: 6px 10px; background: ${CONFIG.background_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer; font-size: 12px; color: ${CONFIG.text_color};">2w</button>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: flex; align-items: center; gap: 8px; color: ${CONFIG.text_color}; cursor: pointer;">
            <input type="checkbox" id="editUnitFrozen" ${unit.isFrozen ? 'checked' : ''} style="width: 18px; height: 18px;" />
            <span>\u2744\ufe0f This unit is frozen</span>
          </label>
        </div>

        <div style="display: flex; gap: 8px;">
          <button onclick="document.getElementById('unitEditOverlay').remove()" style="flex: 1; padding: 10px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">
            Cancel
          </button>
          <button onclick="saveUnitEdit('${itemId}', ${unitIdx})" style="flex: 1; padding: 10px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Save
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

function setUnitExpDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    document.getElementById('editUnitExp').value = _localDateStr(date);
  }

async function saveUnitEdit(itemId, unitIdx) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item || !item.units || !item.units[unitIdx]) return;

    const expDate = document.getElementById('editUnitExp')?.value || null;
    const isFrozen = document.getElementById('editUnitFrozen')?.checked || false;

    item.units[unitIdx].expirationDate = expDate;
    item.units[unitIdx].isFrozen = isFrozen;
    item.units[unitIdx].verified = true;

    updateItemExpirationFromUnits(item);

    await storage.update(item);
    document.getElementById('unitEditOverlay')?.remove();
    showToast('Unit updated!', 'success');
    showInventoryItemDetail(itemId);
    render();
  }

async function addUnitToItem(itemId) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    if (!item.units) {
      item.units = [];
    }

    item.units.push({
      id: `unit_${Date.now()}`,
      expirationDate: item.expirationDate,
      isFrozen: false,
      verified: false,
      purchaseDate: getToday()
    });

    item.quantity = item.units.length;

    await storage.update(item);
    showToast('Unit added!', 'success');
    showInventoryItemDetail(itemId);
    render();
  }

async function deleteInventoryItemCompletely(itemId) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    if (confirm(`Delete all ${item.quantity || 1} units of "${item.name}"?`)) {
      await storage.delete(item);
      state.inventory = state.inventory.filter(i => i.id !== itemId);
      closeModal();
      showToast(`Deleted ${item.name}`, 'success');
      render();
    }
  }

async function confirmClearAllInventory() {
    const count = state.inventory.length;
    if (count === 0) {
      showToast('Pantry is already empty', 'info');
      return;
    }

    if (confirm(`Are you sure you want to delete ALL ${count} items from your pantry? This cannot be undone.`)) {
      state.isLoading = true;
      render();

      try {
        for (const item of [...state.inventory]) {
          await storage.delete(item);
        }
        state.inventory = [];
        showToast(`Cleared ${count} items from pantry`, 'success');
      } catch (e) {
        console.error('Error clearing inventory:', e);
        showError('Failed to clear some items');
      } finally {
        state.isLoading = false;
        render();
      }
    }
  }

async function verifyItem(itemId) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    item.expirationVerified = true;
    await storage.update(item);
    showToast(`${item.name} verified!`, 'success');
    render();
  }

async function verifyAllItems() {
    const unverified = state.inventory.filter(i => i.fromReceipt && i.expirationVerified === false);

    for (const item of unverified) {
      item.expirationVerified = true;
      await storage.update(item);
    }

    showToast(`Verified ${unverified.length} items!`, 'success');
    render();
  }

function showVerifyItemModal(itemId) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    const today = getToday();

    openModal(`
      <div style="color: ${CONFIG.text_color};">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">\ud83d\udccb Verify Expiration</h2>

        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px; background: ${CONFIG.background_color}; border-radius: 8px;">
          <img loading="lazy" src="${item.image_url || getIngredientImage(item.name, item.category) || ''}"
               style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;"
               onerror="this.style.display='none'" />
          <div>
            <div style="font-weight: 600;">${esc(item.name)}</div>
            <div style="font-size: 12px; color: ${CONFIG.text_muted};">
              ${item.category || 'Uncategorized'}
              ${item.store ? ` \u2022 from ${esc(item.store)}` : ''}
            </div>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-weight: 500;">Expiration Date</label>
          <input type="date" id="verifyExpDate" value="${item.expirationDate || ''}"
                 style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-weight: 500;">Quick Set</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button onclick="document.getElementById('verifyExpDate').value=''" style="padding: 8px 12px; background: ${CONFIG.background_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer; color: ${CONFIG.text_color};">
              No expiration
            </button>
            <button onclick="setVerifyExpDays(3)" style="padding: 8px 12px; background: ${CONFIG.background_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer; color: ${CONFIG.text_color};">
              3 days
            </button>
            <button onclick="setVerifyExpDays(7)" style="padding: 8px 12px; background: ${CONFIG.background_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer; color: ${CONFIG.text_color};">
              1 week
            </button>
            <button onclick="setVerifyExpDays(14)" style="padding: 8px 12px; background: ${CONFIG.background_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer; color: ${CONFIG.text_color};">
              2 weeks
            </button>
            <button onclick="setVerifyExpDays(30)" style="padding: 8px 12px; background: ${CONFIG.background_color}; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer; color: ${CONFIG.text_color};">
              1 month
            </button>
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button onclick="closeModal()" style="flex: 1; padding: 12px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">
            Cancel
          </button>
          <button onclick="saveVerifiedItem('${item.id}')" style="flex: 1; padding: 12px; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            \u2713 Verify
          </button>
        </div>
      </div>
    `);
  }

function setVerifyExpDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    document.getElementById('verifyExpDate').value = _localDateStr(date);
  }

async function saveVerifiedItem(itemId) {
    const item = state.inventory.find(i => i.id === itemId);
    if (!item) return;

    const expDate = document.getElementById('verifyExpDate')?.value || null;

    item.expirationDate = expDate;
    item.expirationVerified = true;

    await storage.update(item);
    closeModal();
    showToast(`${item.name} verified!`, 'success');
    render();
  }

function showAddInventoryModal() {
    const today = getToday();
    const prefill = state.prefillInventoryItem || {};
    state.prefillInventoryItem = null;

    const frequentItems = getFrequentItems(8);

    openModal(`
      <div style="color: ${CONFIG.text_color};">
        <h2 class="text-2xl font-bold mb-4">\ud83d\udce6 Add Inventory Item</h2>

        ${!prefill.name && frequentItems.length > 0 ? `
          <div class="mb-4">
            <label class="block mb-2 font-semibold text-sm" style="color: ${CONFIG.text_muted};">Quick Add (frequently bought):</label>
            <div class="flex flex-wrap gap-2">
              ${frequentItems.map(item => `
                <button type="button" onclick="quickAddFrequentItem('${esc(item.name)}', '${esc(item.category)}')"
                  class="px-3 py-1 rounded-full text-sm hover:opacity-80"
                  style="background:#e0e7ff; color:#3730a3;">
                  + ${esc(item.name)}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="mb-4">
          <label class="block mb-2 font-semibold">Item Name:</label>
          <input type="text" id="inventoryName"
                 class="w-full px-3 py-2 border rounded"
                 placeholder="e.g., Chicken Breast"
                 value="${esc(capitalize(prefill.name || ''))}"
                 oninput="updateSuggestedExpiration()" autofocus />
        </div>

        <div class="mb-4">
          <label class="block mb-2 font-semibold">Photo (optional):</label>
          ${prefill.image_url ? `
            <div class="mb-2">
              <img loading="lazy" src="${esc(prefill.image_url)}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" onerror="this.style.display='none'" />
            </div>
          ` : ''}
          <div class="flex gap-2">
            <input type="text" id="inventoryImageUrl"
                   class="flex-1 px-3 py-2 border rounded" placeholder="Paste image URL..."
                   value="${esc(prefill.image_url || '')}" />
            <button type="button" onclick="document.getElementById('inventoryImageUpload').click()"
                    class="px-3 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">
              \ud83d\udcf7 Upload
            </button>
            <input type="file" id="inventoryImageUpload" accept="image/*" style="display:none;"
                   onchange="handleAddInventoryImageUpload(event)" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block mb-2 font-semibold">Quantity:</label>
            <input type="number" id="inventoryQty" value="1"
                   class="w-full px-3 py-2 border rounded" min="1" />
          </div>
          <div>
            <label class="block mb-2 font-semibold">Unit (optional):</label>
            <input type="text" id="inventoryUnit"
                   class="w-full px-3 py-2 border rounded"
                   placeholder="lbs, oz, etc." />
          </div>
        </div>

       <div class="mb-4">
          <label class="block mb-2 font-semibold">Category:</label>
          <select id="inventoryCategory" class="w-full px-3 py-2 border rounded"
                  onchange="updateSuggestedExpiration()">
            <option value="Uncategorized" ${prefill.category === 'Uncategorized' ? 'selected' : ''}>Uncategorized</option>
            <option value="Vegetables" ${prefill.category === 'Vegetables' ? 'selected' : ''}>Vegetables</option>
            <option value="Fruits" ${prefill.category === 'Fruits' ? 'selected' : ''}>Fruits</option>
            <option value="Proteins" ${prefill.category === 'Proteins' ? 'selected' : ''}>Proteins</option>
            <option value="Dairy" ${prefill.category === 'Dairy' ? 'selected' : ''}>Dairy</option>
            <option value="Grains" ${prefill.category === 'Grains' ? 'selected' : ''}>Grains</option>
            <option value="Herbs & Spices" ${prefill.category === 'Herbs & Spices' ? 'selected' : ''}>Herbs & Spices</option>
            <option value="Pantry" ${prefill.category === 'Pantry' ? 'selected' : ''}>Pantry</option>
            <option value="Other" ${prefill.category === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="block mb-2 font-semibold">Purchase Date:</label>
          <input type="date" id="inventoryPurchaseDate" value="${today}"
                 class="w-full px-3 py-2 border rounded"
                 onchange="updateSuggestedExpiration()" />
        </div>

        <div class="mb-4">
          <label class="block mb-2 font-semibold">Expiration Date:</label>
          <input type="date" id="inventoryExpiration"
                 class="w-full px-3 py-2 border rounded" />
          <div id="expirationSuggestion" class="text-sm mt-1" style="color: ${CONFIG.text_muted};"></div>
        </div>

        <div class="mb-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="inventoryFrozen" onchange="updateSuggestedExpiration()" />
            <span>\u2744\ufe0f This item is frozen</span>
          </label>
        </div>

        <div class="flex gap-2 justify-end">
          <button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">
            Cancel
          </button>
          <button onclick="saveManualInventoryItem()"
                  class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.success_color}; color: white;">
            Add Item
          </button>
        </div>
      </div>
    `);

    setTimeout(() => {
      if (prefill.defaultExpirationDays) {
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + prefill.defaultExpirationDays);
        const expInput = document.getElementById('inventoryExpiration');
        if (expInput) {
          expInput.value = _localDateStr(expDate);
        }
      }
      updateSuggestedExpiration();
    }, 100);
  }

async function quickAddFrequentItem(name, category) {
    closeModal();
    state.isLoading = true;
    render();

    try {
      await addInventoryItem({
        name: name,
        category: category,
        quantity: 1,
        purchaseDate: getToday()
      });
      showToast(`${name} added to inventory!`, 'success');
    } catch (e) {
      console.error(e);
      showError('Failed to add item');
    } finally {
      state.isLoading = false;
      render();
    }
  }

function updateSuggestedExpiration() {
    const name = document.getElementById('inventoryName')?.value || '';
    const category = document.getElementById('inventoryCategory')?.value || 'Other';
    const purchaseDate = document.getElementById('inventoryPurchaseDate')?.value;
    const isFrozen = document.getElementById('inventoryFrozen')?.checked;
    const expirationInput = document.getElementById('inventoryExpiration');
    const suggestionDiv = document.getElementById('expirationSuggestion');

    if (!expirationInput || !suggestionDiv) return;

    if (isFrozen) {
      suggestionDiv.textContent = '\u2744\ufe0f Frozen items don\'t expire';
      expirationInput.value = '';
      expirationInput.disabled = true;
    } else {
      expirationInput.disabled = false;
      const days = getExpirationDays(name || category, category);
      const suggestedDate = suggestExpirationDate(name || category, category, purchaseDate);

      if (!expirationInput.value) {
        expirationInput.value = suggestedDate;
      }

      suggestionDiv.textContent = `AI suggests ${days} days for ${name || category}`;
    }
  }

async function handleAddInventoryImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showToast('Uploading image...', 'info');
    const compressed = await compressImage(file);
    const url = await uploadPhoto(compressed);

    if (url) {
      document.getElementById('inventoryImageUrl').value = url;
      showToast('Image uploaded!', 'success');
    }
    event.target.value = '';
  }

async function saveManualInventoryItem() {
    const name = document.getElementById('inventoryName').value.trim();
    const quantity = parseInt(document.getElementById('inventoryQty').value) || 1;
    const unit = document.getElementById('inventoryUnit').value.trim();
    const category = document.getElementById('inventoryCategory').value;
    const purchaseDate = document.getElementById('inventoryPurchaseDate').value;
    const expirationDate = document.getElementById('inventoryExpiration').value;
    const isFrozen = document.getElementById('inventoryFrozen').checked;
    const imageUrl = document.getElementById('inventoryImageUrl')?.value.trim();

    if (!name) {
      showError('Please enter an item name');
      return;
    }

    closeModal();
    state.isLoading = true;
    render();

    try {
      await addInventoryItem({
        name,
        quantity,
        unit,
        category,
        purchaseDate,
        expirationDate: isFrozen ? null : expirationDate,
        isFrozen,
        image_url: imageUrl || null
      });
      showToast('Item added to inventory!', 'success');
    } catch (e) {
      console.error(e);
      showError('Failed to add item');
    } finally {
      state.isLoading = false;
      render();
    }
  }

// ===== GROUP 4: INGREDIENT LIBRARY =====

let ingredientSearchTimeout = null;

function renderIngredientLibrary() {
    const allIngredients = new Set([
      ...Object.keys(INGREDIENT_IMAGES),
      ...state.ingredientKnowledge.map(k => k.name.toLowerCase())
    ]);

    let ingredientList = Array.from(allIngredients)
      .filter(name => !state.deletedIngredients.includes(name.toLowerCase()))
      .sort();

    if (state.ingredientSearchTerm) {
      const search = state.ingredientSearchTerm.toLowerCase();
      ingredientList = ingredientList.filter(name => name.includes(search));
    }

    if (state.ingredientCategoryFilter && state.ingredientCategoryFilter !== 'All') {
      ingredientList = ingredientList.filter(name => {
        const knowledge = getIngredientKnowledge(name);
        return knowledge?.category === state.ingredientCategoryFilter;
      });
    }

    return `
      <div class="p-4 max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold" style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 1.5}px;">
            \ud83e\udd57 Ingredients
          </h2>
          <button onclick="showAddIngredientModal()"
            style="padding: 10px 16px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px;">
            \u2795 Add
          </button>
        </div>

        <!-- Search & Filter -->
        <div class="mb-4 p-3 rounded-lg" style="background:${CONFIG.surface_color};">
          <input type="text" placeholder="Search ingredients..." id="ingredientSearchInput"
            class="w-full px-3 py-2 rounded-lg mb-3"
            style="background:${CONFIG.background_color}; color:${CONFIG.text_color}; border:1px solid rgba(255,255,255,0.1); font-size: 16px;"
            value="${esc(state.ingredientSearchTerm || '')}"
            oninput="handleIngredientSearchInput(this.value)" />

          <div class="flex gap-2 flex-wrap">
            <button onclick="state.ingredientCategoryFilter = 'All'; render();"
              class="px-3 py-1 rounded-full text-sm"
              style="background:${state.ingredientCategoryFilter === 'All' ? CONFIG.primary_action_color : CONFIG.background_color}; color:${state.ingredientCategoryFilter === 'All' ? 'white' : CONFIG.text_color};">
              All
            </button>
            ${INGREDIENT_CATEGORIES.map(cat => `
              <button onclick="state.ingredientCategoryFilter = '${cat}'; render();"
                class="px-3 py-1 rounded-full text-sm"
                style="background:${state.ingredientCategoryFilter === cat ? CONFIG.primary_action_color : CONFIG.background_color}; color:${state.ingredientCategoryFilter === cat ? 'white' : CONFIG.text_color};">
                ${cat}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Ingredient Grid -->
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          ${ingredientList.map(name => {
            const knowledge = getIngredientKnowledge(name);
            const img = getIngredientImage(name) || '';
            const hasKnowledge = knowledge && (knowledge.cookingMethods?.length > 0 || knowledge.notes?.length > 0);

            return `
              <div onclick="openIngredientDetail('${esc(name)}')"
                class="rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                style="background:${CONFIG.surface_color};">
                <div style="height:80px; overflow:hidden; background:rgba(255,255,255,0.05);">
                  ${img ? `
                    <img loading="lazy" src="${esc(img)}" style="width:100%; height:100%; object-fit:cover;"
                         onerror="this.style.display='none'" />
                  ` : `
                    <div style="height:100%; display:flex; align-items:center; justify-content:center; font-size:2rem;">\ud83e\udd57</div>
                  `}
                </div>
                <div class="p-2">
                  <div class="text-center truncate" style="color:${CONFIG.text_color}; font-size:${CONFIG.font_size * 0.75}px; text-transform:capitalize;">
                    ${esc(name)}
                  </div>
                  ${hasKnowledge ? `
                    <div class="text-center" style="color:${CONFIG.primary_action_color}; font-size: ${CONFIG.type_micro};">
                      \u2713 Info saved
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        ${ingredientList.length === 0 ? `
          <div class="text-center p-8" style="color:${CONFIG.text_color}; opacity:0.6;">
            No ingredients found
          </div>
        ` : ''}
      </div>
    `;
  }

function handleIngredientSearchInput(value) {
    state.ingredientSearchTerm = value;

    if (ingredientSearchTimeout) clearTimeout(ingredientSearchTimeout);

    ingredientSearchTimeout = setTimeout(() => {
      const input = document.getElementById('ingredientSearchInput');
      const cursorPos = input ? input.selectionStart : 0;

      render();

      setTimeout(() => {
        const newInput = document.getElementById('ingredientSearchInput');
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
    }, 300);
  }

function showAddIngredientModal() {
    openModal(`
      <div style="color: ${CONFIG.text_color};">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">\u2795 Add New Ingredient</h2>

        <div style="margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500;">Ingredient Name</label>
          <input type="text" id="newIngredientName" placeholder="e.g., Quinoa"
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
        </div>

        <div style="margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500;">Category</label>
          <select id="newIngredientCategory"
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;">
            <option value="">Select category...</option>
            ${INGREDIENT_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
        </div>

        <div style="margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500;">Image URL (optional)</label>
          <input type="text" id="newIngredientImage" placeholder="https://..."
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 4px; font-weight: 500;">Notes (optional)</label>
          <textarea id="newIngredientNotes" placeholder="Storage tips, cooking notes, etc."
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; min-height: 80px; resize: vertical;"></textarea>
        </div>

        <div style="display: flex; gap: 8px;">
          <button onclick="closeModal()" style="flex: 1; padding: 12px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">
            Cancel
          </button>
          <button onclick="saveNewIngredient()" style="flex: 1; padding: 12px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Add Ingredient
          </button>
        </div>
      </div>
    `);
  }

async function saveNewIngredient() {
    const name = document.getElementById('newIngredientName')?.value.trim();
    const category = document.getElementById('newIngredientCategory')?.value;
    const imageUrl = document.getElementById('newIngredientImage')?.value.trim();
    const notes = document.getElementById('newIngredientNotes')?.value.trim();

    if (!name) {
      showError('Please enter an ingredient name');
      return;
    }

    const normalizedName = name.toLowerCase();

    const existing = state.ingredientKnowledge.find(k => k.name.toLowerCase() === normalizedName);
    if (existing) {
      showError('This ingredient already exists');
      return;
    }

    const knowledge = {
      id: `ingredient_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type: 'ingredient_knowledge',
      name: normalizedName,
      category: category || 'Other',
      image_url: imageUrl || '',
      notes: notes ? [notes] : [],
      cookingMethods: [],
      pairings: [],
      favorite: false,
      createdAt: new Date().toISOString()
    };

    try {
      await storage.create(knowledge);
      state.ingredientKnowledge.push(knowledge);
      if (imageUrl) {
        INGREDIENT_IMAGES[normalizedName] = imageUrl;
      }
      closeModal();
      showToast(`${name} added!`, 'success');
      render();
    } catch (error) {
      console.error('saveNewIngredient failed:', error);
      showError('Failed to save ingredient');
    }
  }

async function deleteIngredient(name) {
    if (!confirm(`Delete ${name} from your ingredient library?`)) return;

    const normalizedName = name.toLowerCase();
    try {
      const knowledge = state.ingredientKnowledge.find(k => k.name.toLowerCase() === normalizedName);
      if (knowledge) {
        state.ingredientKnowledge = state.ingredientKnowledge.filter(k => k.id !== knowledge.id);
        await storage.delete(knowledge);
      }

      if (!state.deletedIngredients.includes(normalizedName)) {
        state.deletedIngredients.push(normalizedName);
        const deletionRecord = {
          id: `deleted_ingredient_${normalizedName}`,
          type: 'deleted_ingredient',
          name: normalizedName,
          deletedAt: new Date().toISOString()
        };
        await storage.create(deletionRecord);
      }

      showToast(`${name} deleted`, 'success');
      navigateTo('ingredients');
    } catch (error) {
      console.error('deleteIngredient failed:', error);
      showError('Failed to delete ingredient');
    }
  }

function openIngredientDetail(name) {
    state.selectedIngredientId = name.toLowerCase();
    state.currentView = 'ingredient-detail';
    render();
  }

// ===== GROUP 5: INGREDIENT DETAIL =====

async function saveIngredientKnowledge(knowledge) {
    try {
      const existing = state.ingredientKnowledge.find(k => k.id === knowledge.id);
      if (existing) {
        Object.assign(existing, knowledge);
        await storage.update(knowledge);
      } else {
        state.ingredientKnowledge.push(knowledge);
        await storage.create(knowledge);
      }
    } catch (error) {
      console.error('saveIngredientKnowledge failed:', error);
      showError('Failed to save ingredient data');
    }
  }

function renderIngredientDetailHeader(name, knowledge, img, displayName, inInventory) {
    return `
      <div class="flex items-center justify-between mb-4">
        <button onclick="state.pantryTab = 'ingredients'; navigateTo('inventory')"
          class="px-3 py-2 rounded-lg"
          style="background:${CONFIG.surface_color}; color:${CONFIG.text_color}; box-shadow: ${CONFIG.shadow};">
          \u2190 Back
        </button>
        <div class="flex gap-2">
          <button onclick="toggleIngredientFavorite('${esc(name)}')" class="px-3 py-2 rounded-lg"
            style="background:${CONFIG.surface_color}; color:${CONFIG.text_color}; box-shadow: ${CONFIG.shadow};">
            ${knowledge.favorite ? '\u2b50' : '\u2606'}
          </button>
          <button onclick="editIngredientKnowledge('${esc(name)}')" class="px-3 py-2 rounded-lg"
            style="background:${CONFIG.primary_action_color}; color:white;">\u270f\ufe0f Edit</button>
          <button onclick="if(confirm('Delete this ingredient?')) deleteIngredientKnowledgeFull('${esc(name)}')"
            class="px-3 py-2 rounded-lg" style="background: rgba(220,38,38,0.1); color: ${CONFIG.danger_color};">\ud83d\uddd1\ufe0f</button>
        </div>
      </div>
      <div class="rounded-xl overflow-hidden mb-4" style="background:${CONFIG.surface_color}; box-shadow: ${CONFIG.shadow};">
        <div class="flex flex-col sm:flex-row">
          <div class="sm:w-1/3" style="min-height:180px; background:${CONFIG.background_color};">
            ${img ? `<img loading="lazy" src="${esc(img)}" style="width:100%; height:100%; min-height:180px; object-fit:cover;"
              onerror="this.parentElement.innerHTML='<div style=\\'height:180px; display:flex; align-items:center; justify-content:center; font-size:4rem;\\'>\\ud83e\\udd57</div>'" />`
            : `<div style="height:180px; display:flex; align-items:center; justify-content:center; font-size:4rem;">\ud83e\udd57</div>`}
          </div>
          <div class="flex-1 p-4">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
              <h1 style="color:${CONFIG.text_color}; font-size:24px; font-weight:bold; margin: 0;">${esc(displayName)}</h1>
              ${inInventory ? `<span style="background: ${CONFIG.success_color}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">\u2713 In Stock</span>` : ''}
            </div>
            <div style="color:${CONFIG.text_muted}; margin-bottom:12px; font-size: 14px;">
              ${esc(knowledge.category || 'Uncategorized')}
              ${knowledge.season && knowledge.season !== 'Year-round' ? ` \u2022 \ud83d\udcc5 ${knowledge.season}` : ''}
            </div>
            <div class="flex gap-2 flex-wrap">
              ${knowledge.storage?.duration ? `<div class="px-3 py-2 rounded-lg text-sm" style="background:${CONFIG.background_color}; color:${CONFIG.text_color};">\ud83d\udce6 ${esc(knowledge.storage.location || 'Store')}: ${esc(knowledge.storage.duration)}</div>` : ''}
              ${knowledge.freezable !== null ? `<div class="px-3 py-2 rounded-lg text-sm" style="background:${knowledge.freezable ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.2)'}; color:${CONFIG.text_color};">${knowledge.freezable ? '🧊 Freezable' : '\u274c Cannot Freeze'}</div>` : ''}
              ${knowledge.defaultExpirationDays ? `<div class="px-3 py-2 rounded-lg text-sm" style="background:${CONFIG.background_color}; color:${CONFIG.text_color};">\u23f0 ${knowledge.defaultExpirationDays} days shelf life</div>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

function renderIngredientDetailCooking(name, knowledge) {
    const methods = knowledge.cookingMethods || [];

    // Group methods by cutType
    const groups = {};
    methods.forEach((method, idx) => {
      const groupKey = (method.cutType || '').trim() || 'General';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push({ ...method, _idx: idx });
    });

    // Sort: "General" first, then alphabetical
    const groupKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'General') return -1;
      if (b === 'General') return 1;
      return a.localeCompare(b);
    });

    return `
      <div class="rounded-xl mb-4" style="background:${CONFIG.surface_color}; box-shadow: ${CONFIG.shadow};">
        <div class="p-4" style="border-bottom: 1px solid rgba(255,255,255,0.06);">
          <div class="flex items-center justify-between">
            <h2 style="color:${CONFIG.text_color}; font-size:16px; font-weight:600; display: flex; align-items: center; gap: 8px;">\u23f1\ufe0f Cooking Times</h2>
            <div class="flex gap-2">
              <button onclick="askClaudeForSection('${esc(name)}', 'cooking')" class="px-2 py-1 rounded text-xs" style="background: ${CONFIG.surface_elevated}; color:white;">\ud83e\udd16 Ask Claude</button>
              <button onclick="addCookingMethod('${esc(name)}')" class="px-2 py-1 rounded text-sm" style="background:${CONFIG.primary_action_color}; color:white;">+ Add</button>
            </div>
          </div>
        </div>
        <div class="p-4">
          ${methods.length > 0 ? groupKeys.map(groupKey => `
            <div style="margin-bottom: 16px;">
              ${groupKeys.length > 1 || groupKey !== 'General' ? `
                <div style="color:${CONFIG.primary_action_color}; font-size:13px; font-weight:600; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">
                  ${esc(groupKey)}
                </div>
              ` : ''}
              <div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch;">
                ${groups[groupKey].map(method => `
                  <div class="flex-shrink-0 p-3 rounded-lg" style="background:${CONFIG.background_color}; min-width: 160px; max-width: 220px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <div style="color:${CONFIG.warning_color}; font-size:1.5rem;">\ud83d\udd25</div>
                      <div style="color:${CONFIG.text_color}; font-weight:600; font-size: 15px;">${esc(method.method)}</div>
                    </div>
                    ${method.cutType ? `<div style="color:${CONFIG.primary_action_color}; font-size:12px; font-weight:600; margin-bottom:4px;">${esc(method.cutType)}</div>` : ''}
                    <div style="color:${CONFIG.text_color}; font-size: 14px; font-weight: 500; margin-bottom: 4px;">
                      ${method.temp ? esc(method.temp) : ''}${method.temp && method.time ? ' \u2022 ' : ''}${esc(method.time)}
                    </div>
                    ${method.notes ? `<div style="color:${CONFIG.text_muted}; font-size: 12px; margin-bottom: 8px;">${esc(method.notes)}</div>` : ''}
                    <div style="display:flex; gap:6px;">
                      <button onclick="event.stopPropagation(); editCookingMethod('${esc(name)}', ${method._idx})"
                        style="padding: 4px 8px; background: rgba(255,255,255,0.08); border: none; border-radius: 4px; color: ${CONFIG.text_muted}; cursor: pointer; font-size: ${CONFIG.type_micro};">✏️ Edit</button>
                      <button onclick="event.stopPropagation(); deleteCookingMethod('${esc(name)}', ${method._idx})"
                        style="padding: 4px 8px; background: rgba(239,68,68,0.1); border: none; border-radius: 4px; color: ${CONFIG.danger_color}; cursor: pointer; font-size: ${CONFIG.type_micro};">\ud83d\uddd1\ufe0f Remove</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('') : `<div class="text-center p-6" style="color:${CONFIG.text_muted};">No cooking times added yet</div>`}
        </div>
      </div>
    `;
  }

function renderIngredientDetailTechniques(name, knowledge) {
    return `
      <div class="rounded-xl mb-4" style="background:${CONFIG.surface_color}; box-shadow: ${CONFIG.shadow};">
        <div class="p-4" style="border-bottom: 1px solid rgba(255,255,255,0.06);">
          <div class="flex items-center justify-between">
            <h2 style="color:${CONFIG.text_color}; font-size:16px; font-weight:600; display: flex; align-items: center; gap: 8px;">\ud83d\udc68\u200d\ud83c\udf73 Techniques</h2>
            <div class="flex gap-2">
              <button onclick="askClaudeForSection('${esc(name)}', 'techniques')" class="px-2 py-1 rounded text-xs" style="background: ${CONFIG.surface_elevated}; color:white;">\ud83e\udd16 Ask Claude</button>
              <button onclick="addTechnique('${esc(name)}')" class="px-2 py-1 rounded text-sm" style="background:${CONFIG.primary_action_color}; color:white;">+ Add</button>
            </div>
          </div>
        </div>
        <div class="p-4">
          ${knowledge.techniques && knowledge.techniques.length > 0 ? `
            <div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch;">
              ${knowledge.techniques.map((tech, idx) => `
                <div class="flex-shrink-0 rounded-lg" style="background:${CONFIG.background_color}; min-width: 220px; max-width: 280px; padding: 12px;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <div style="color:${CONFIG.warning_color}; font-size:1.3rem;">\ud83c\udfaf</div>
                    <div style="color:${CONFIG.text_color}; font-weight:600; font-size: 14px;">${esc(tech.result)}</div>
                  </div>
                  <div style="color:${CONFIG.primary_action_color}; font-weight:500; font-size:13px; margin-bottom: 6px;">${esc(tech.method)}</div>
                  <div style="color:${CONFIG.text_muted}; font-size:12px; line-height: 1.5; max-height: 60px; overflow: hidden; text-overflow: ellipsis;">
                    ${esc(tech.steps).slice(0, 100)}${tech.steps.length > 100 ? '...' : ''}
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
                    <button onclick="viewTechniqueDetail('${esc(name)}', ${idx})" style="padding: 4px 8px; background: rgba(232,93,93,0.1); border: none; border-radius: 4px; color: ${CONFIG.primary_action_color}; cursor: pointer; font-size: ${CONFIG.type_micro};">View Full</button>
                    <button onclick="event.stopPropagation(); deleteTechnique('${esc(name)}', ${idx})" style="padding: 4px 8px; background: rgba(239,68,68,0.1); border: none; border-radius: 4px; color: ${CONFIG.danger_color}; cursor: pointer; font-size: ${CONFIG.type_micro};">\ud83d\uddd1\ufe0f</button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `<div class="text-center p-6" style="color:${CONFIG.text_muted};">No techniques added yet</div>`}
        </div>
      </div>
    `;
  }

function renderIngredientDetailPairings(name, knowledge) {
    return `
      <div class="rounded-xl mb-4" style="background:${CONFIG.surface_color}; box-shadow: ${CONFIG.shadow};">
        <div class="p-4" style="border-bottom: 1px solid rgba(255,255,255,0.06);">
          <div class="flex items-center justify-between">
            <h2 style="color:${CONFIG.text_color}; font-size:16px; font-weight:600; display: flex; align-items: center; gap: 8px;">\ud83e\uddc2 Pairs Well With</h2>
            <div class="flex gap-2">
              <button onclick="askClaudeForSection('${esc(name)}', 'pairings')" class="px-2 py-1 rounded text-xs" style="background: ${CONFIG.surface_elevated}; color:white;">\ud83e\udd16 Ask Claude</button>
              <button onclick="showAddPairingModal('${esc(name)}')" class="px-2 py-1 rounded text-sm" style="background:${CONFIG.primary_action_color}; color:white;">+ Add</button>
            </div>
          </div>
        </div>
        <div class="p-4">
          ${knowledge.pairings && knowledge.pairings.length > 0 ? `
            <div class="flex flex-wrap gap-2">
              ${knowledge.pairings.map((pairing, idx) => `
                <div class="flex items-center gap-1 px-3 py-2 rounded-lg" style="background:${CONFIG.background_color}; color:${CONFIG.text_color};">
                  <span style="text-transform:capitalize;">${esc(pairing)}</span>
                  <button onclick="deletePairing('${esc(name)}', ${idx})" style="margin-left: 4px; background: none; border: none; color: ${CONFIG.text_muted}; cursor: pointer; font-size: 14px;">\u00d7</button>
                </div>
              `).join('')}
            </div>
          ` : `<div class="text-center p-6" style="color:${CONFIG.text_muted};">No pairings added yet</div>`}
        </div>
      </div>
    `;
  }

function renderIngredientDetailFreezing(name, knowledge) {
    const fi = knowledge.freezingInfo || {};
    const hasFreezingInfo = fi.blanch || fi.duration || fi.defrostMethod || fi.instructions;

    function freezingInfoCard(icon, label, value) {
      if (!value) return '';
      return `<div class="flex-shrink-0 p-3 rounded-lg" style="background: rgba(59,130,246,0.1); min-width: 140px;">
        <div style="color: #3b82f6; font-size: 1.2rem; margin-bottom: 4px;">${icon}</div>
        <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_micro}; margin-bottom: 2px;">${label}</div>
        <div style="color: ${CONFIG.text_color}; font-weight: 600; font-size: 14px;">${esc(value)}</div>
      </div>`;
    }

    return `
      <div class="rounded-xl mb-4" style="background:${CONFIG.surface_color}; box-shadow: ${CONFIG.shadow};">
        <div class="p-4" style="border-bottom: 1px solid rgba(255,255,255,0.06);">
          <div class="flex items-center justify-between">
            <h2 style="color:${CONFIG.text_color}; font-size:16px; font-weight:600; display: flex; align-items: center; gap: 8px;">🧊 Freezing Guide</h2>
            <div class="flex gap-2">
              <button onclick="askClaudeForSection('${esc(name)}', 'freezing')" class="px-2 py-1 rounded text-xs" style="background: ${CONFIG.surface_elevated}; color:white;">\ud83e\udd16 Ask Claude</button>
              <button onclick="editFreezingInfo('${esc(name)}')" class="px-2 py-1 rounded text-sm" style="background:${CONFIG.primary_action_color}; color:white;">\u270f\ufe0f Edit</button>
            </div>
          </div>
        </div>
        <div class="p-4">
          ${knowledge.freezable === false ? `
            <div class="p-4 rounded-lg" style="background: rgba(239,68,68,0.1);">
              <div style="color: ${CONFIG.danger_color}; font-weight: 500;">\u274c This ingredient is not recommended for freezing</div>
            </div>
          ` : hasFreezingInfo ? `
            <div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch;">
              ${freezingInfoCard('\ud83e\udee7', 'Blanch', fi.blanch)}
              ${freezingInfoCard('🧊', 'Freezer Life', fi.duration)}
              ${freezingInfoCard('\ud83d\udd25', 'Defrost Method', fi.defrostMethod)}
              ${freezingInfoCard('\u23f1\ufe0f', 'Defrost Time', fi.defrostTime)}
              ${freezingInfoCard('\ud83d\udcc5', 'After Defrost', fi.afterDefrost)}
            </div>
            ${fi.instructions ? `<div style="margin-top: 12px; padding: 12px; background: ${CONFIG.background_color}; border-radius: 8px;">
              <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_micro}; margin-bottom: 4px;">Notes</div>
              <div style="color: ${CONFIG.text_color}; font-size: ${CONFIG.type_caption}; line-height: 1.5;">${esc(fi.instructions)}</div>
            </div>` : ''}
          ` : `<div class="text-center p-6" style="color:${CONFIG.text_muted};">No freezing info added yet</div>`}
        </div>
      </div>
    `;
  }

function renderIngredientDetailNotes(name, knowledge) {
    return `
      <div class="rounded-xl mb-4" style="background:${CONFIG.surface_color}; box-shadow: ${CONFIG.shadow};">
        <div class="p-4" style="border-bottom: 1px solid rgba(255,255,255,0.06);">
          <div class="flex items-center justify-between">
            <h2 style="color:${CONFIG.text_color}; font-size:16px; font-weight:600; display: flex; align-items: center; gap: 8px;">\ud83d\udcdd Notes & Tips</h2>
            <div class="flex gap-2">
              <button onclick="askClaudeForSection('${esc(name)}', 'notes')" class="px-2 py-1 rounded text-xs" style="background: ${CONFIG.surface_elevated}; color:white;">\ud83e\udd16 Ask Claude</button>
              <button onclick="addIngredientNote('${esc(name)}')" class="px-2 py-1 rounded text-sm" style="background:${CONFIG.primary_action_color}; color:white;">+ Add</button>
            </div>
          </div>
        </div>
        <div class="p-4">
          ${knowledge.notes && knowledge.notes.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${knowledge.notes.map((note, idx) => `
                <div class="p-3 rounded-lg" style="background:${CONFIG.background_color};">
                  <div style="color:${CONFIG.text_color}; font-size:14px; line-height: 1.6; white-space: pre-wrap;">${esc(note)}</div>
                  <div class="flex justify-end gap-2 mt-2">
                    <button onclick="editIngredientNote('${esc(name)}', ${idx})" style="padding: 4px 8px; background: rgba(232,93,93,0.1); border: none; border-radius: 4px; color: ${CONFIG.primary_action_color}; cursor: pointer; font-size: 12px;">\u270f\ufe0f Edit</button>
                    <button onclick="deleteIngredientNote('${esc(name)}', ${idx})" style="padding: 4px 8px; background: rgba(239,68,68,0.1); border: none; border-radius: 4px; color: ${CONFIG.danger_color}; cursor: pointer; font-size: 12px;">\ud83d\uddd1\ufe0f</button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `<div class="text-center p-6" style="color:${CONFIG.text_muted};">No notes yet</div>`}
        </div>
      </div>
    `;
  }

function renderIngredientDetailRecipes(name, displayName, relatedRecipes) {
    return `
      <div class="rounded-xl mb-4" style="background:${CONFIG.surface_color}; box-shadow: ${CONFIG.shadow};">
        <div class="p-4" style="border-bottom: 1px solid rgba(255,255,255,0.06);">
          <h2 style="color:${CONFIG.text_color}; font-size:16px; font-weight:600; display: flex; align-items: center; gap: 8px;">
            \ud83c\udf7d\ufe0f Recipes with ${esc(displayName)}
          </h2>
        </div>
        <div class="p-4">
          ${relatedRecipes.length > 0 ? `
            <div class="flex gap-3 overflow-x-auto pb-2" style="-webkit-overflow-scrolling:touch;">
              ${relatedRecipes.map(r => {
                const recipeImg = recipeThumb(r);
                const rId = r.__backendId || r.id;
                const rSaved = isRecipeSaved(rId);
                const rUrl = (r.recipe_url || '').trim() || (typeof recipeUrl === 'function' ? recipeUrl(r) : '');
                return `
                  <div style="position:relative; width:130px; flex-shrink:0;">
                    <div onclick="openRecipeView('${rId}')"
                      class="rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                      style="background:${CONFIG.background_color};">
                      <div style="height:90px; overflow:hidden;">
                        ${recipeImg ? `<img loading="lazy" src="${esc(recipeImg)}" style="width:100%; height:100%; object-fit:cover;" />`
                        : `<div style="height:100%; display:flex; align-items:center; justify-content:center; font-size:2rem; background: ${CONFIG.background_color};">\ud83c\udf7d\ufe0f</div>`}
                      </div>
                      <div class="p-2"><div class="truncate" style="color:${CONFIG.text_color}; font-size:12px; font-weight: 500;">${esc(r.title)}</div></div>
                    </div>
                    <!-- Bookmark icon top-right -->
                    <button onclick="event.stopPropagation();toggleSaveRecipe('${esc(rId)}')" style="position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);border:none;color:${rSaved ? CONFIG.primary_action_color : 'rgba(255,255,255,0.7)'};cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;padding:0;">
                      <svg width="11" height="11" fill="${rSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/></svg>
                    </button>
                    ${rUrl ? `
                    <!-- External link icon top-left -->
                    <a href="${esc(rUrl)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();" style="position:absolute;top:4px;left:4px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);border:none;color:${CONFIG.primary_action_color};cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;text-decoration:none;">
                      <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
                    </a>
                    ` : ''}
                  </div>`;
              }).join('')}
            </div>
          ` : `<div class="text-center p-6" style="color:${CONFIG.text_muted};">No recipes found with this ingredient</div>`}
        </div>
      </div>
    `;
  }

function renderIngredientDetailInventory(name, inInventory) {
    return `
      <div class="rounded-xl mb-4" style="background:${CONFIG.surface_color}; box-shadow: ${CONFIG.shadow};">
        <div class="p-4">
          ${inInventory ? `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">\ud83d\udce6</span>
                <div>
                  <div style="color: ${CONFIG.text_color}; font-weight: 600;">In Your Inventory</div>
                  <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption};">${inInventory.quantity || 1}${inInventory.unit ? ' ' + inInventory.unit : ''}</div>
                </div>
              </div>
              <button onclick="closeModal(); showInventoryItemDetail('${inInventory.id}')"
                style="padding: 8px 16px; background: ${CONFIG.background_color}; border: none; border-radius: 8px; color: ${CONFIG.text_color}; cursor: pointer; font-size: 14px;">View \u2192</button>
            </div>
          ` : `
            <button onclick="addIngredientToInventoryDirect('${esc(name)}')"
              style="width: 100%; padding: 14px; background: ${CONFIG.success_color}; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 15px;">\ud83d\udce6 Add to Inventory</button>
          `}
        </div>
      </div>
    `;
  }

function renderIngredientDetail() {
    const name = state.selectedIngredientId;
    if (!name) return '<div class="p-4">Ingredient not found</div>';

    let knowledge = getIngredientKnowledge(name);
    if (!knowledge) knowledge = createDefaultIngredientKnowledge(name);

    const img = getIngredientImage(name) || '';
    const displayName = capitalize(name);

    const relatedRecipes = state.recipes.filter(r => {
      if (r.isDraft || r.isTip) return false;
      const ingredients = (r.ingredientsRows || []).map(i => (i.name || '').toLowerCase());
      return ingredients.some(i => i.includes(name) || name.includes(i));
    }).slice(0, 8);

    const inInventory = state.inventory.find(i =>
      i.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(i.name.toLowerCase())
    );

    return `
      <div class="p-4 max-w-4xl mx-auto">
        ${renderIngredientDetailHeader(name, knowledge, img, displayName, inInventory)}
        ${renderIngredientDetailCooking(name, knowledge)}
        ${renderIngredientDetailTechniques(name, knowledge)}
        ${renderIngredientDetailPairings(name, knowledge)}
        ${renderIngredientDetailFreezing(name, knowledge)}
        ${renderIngredientDetailNotes(name, knowledge)}
        ${renderIngredientDetailRecipes(name, displayName, relatedRecipes)}
        ${renderIngredientDetailInventory(name, inInventory)}
      </div>
    `;
  }

function addIngredientToInventoryDirect(ingredientName) {
    const knowledge = getIngredientKnowledge(ingredientName);
    state.prefillInventoryItem = {
      name: ingredientName,
      category: knowledge?.category,
      defaultExpirationDays: knowledge?.defaultExpirationDays,
      image_url: knowledge?.image_url || getIngredientImage(ingredientName)
    };
    showAddInventoryModal();
  }

function showAddPairingModal(ingredientName) {
    const allIngredients = new Set();
    state.inventory.forEach(item => allIngredients.add(item.name.toLowerCase()));
    (state.ingredientKnowledge || []).forEach(ing => allIngredients.add(ing.name.toLowerCase()));
    Object.keys(INGREDIENT_IMAGES).forEach(name => allIngredients.add(name));
    const sortedIngredients = Array.from(allIngredients).sort();

    openModal(`
      <div style="color: ${CONFIG.text_color};">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">\ud83e\uddc2 Add Pairing</h2>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Search or select ingredient:</label>
          <input type="text" id="pairingSearch" placeholder="Type to search..."
            oninput="filterPairingOptions(this.value)"
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; margin-bottom: 8px;" />

          <div id="pairingOptions" style="max-height: 200px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
            ${sortedIngredients.slice(0, 50).map(ing => `
              <div onclick="selectPairingOption('${esc(ingredientName)}', '${esc(ing)}')"
                class="pairing-option"
                style="padding: 10px 12px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.06);"
                onmouseover="this.style.background='rgba(232,93,93,0.1)'"
                onmouseout="this.style.background='transparent'">
                ${esc(capitalize(ing))}
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Or enter custom:</label>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="customPairing" placeholder="e.g., lemon zest"
              style="flex: 1; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 16px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color};" />
            <button onclick="addCustomPairing('${esc(ingredientName)}')"
              style="padding: 12px 20px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
              Add
            </button>
          </div>
        </div>

        <button onclick="closeModal()"
          style="width: 100%; padding: 12px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">
          Cancel
        </button>
      </div>
    `);
  }

function filterPairingOptions(searchTerm) {
    const allIngredients = new Set();
    state.inventory.forEach(item => allIngredients.add(item.name.toLowerCase()));
    (state.ingredientKnowledge || []).forEach(ing => allIngredients.add(ing.name.toLowerCase()));
    Object.keys(INGREDIENT_IMAGES).forEach(name => allIngredients.add(name));

    const filtered = Array.from(allIngredients)
      .filter(ing => ing.includes(searchTerm.toLowerCase()))
      .sort()
      .slice(0, 50);

    const container = document.getElementById('pairingOptions');
    if (container) {
      container.innerHTML = filtered.map(ing => `
        <div onclick="selectPairingOption('${state.selectedIngredientId}', '${esc(ing)}')"
          class="pairing-option"
          style="padding: 10px 12px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.06);"
          onmouseover="this.style.background='rgba(232,93,93,0.1)'"
          onmouseout="this.style.background='transparent'">
          ${esc(capitalize(ing))}
        </div>
      `).join('');
    }
  }

async function selectPairingOption(ingredientName, pairing) {
    await savePairing(ingredientName, pairing);
    closeModal();
  }

async function addCustomPairing(ingredientName) {
    const input = document.getElementById('customPairing');
    if (input && input.value.trim()) {
      await savePairing(ingredientName, input.value.trim());
      closeModal();
    }
  }

function editFreezingInfo(ingredientName) {
    let knowledge = getIngredientKnowledge(ingredientName);
    if (!knowledge) {
      knowledge = createDefaultIngredientKnowledge(ingredientName);
    }

    openModal(`
      <div style="color: ${CONFIG.text_color}; max-height: 80vh; overflow-y: auto;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">🧊 Edit Freezing Info</h2>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Can this be frozen?</label>
          <div style="display: flex; gap: 12px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" name="freezable" value="yes" ${knowledge.freezable === true ? 'checked' : ''} />
              Yes
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" name="freezable" value="no" ${knowledge.freezable === false ? 'checked' : ''} />
              No
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              <input type="radio" name="freezable" value="unknown" ${knowledge.freezable === null ? 'checked' : ''} />
              Unknown
            </label>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div>
            <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px;">\ud83e\udee7 Blanch Time</label>
            <input type="text" id="freezeBlanch" value="${esc(knowledge.freezingInfo?.blanch || '')}"
              placeholder="e.g., 3-4 min"
              style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
          </div>
          <div>
            <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px;">🧊 Freezer Life</label>
            <input type="text" id="freezeDuration" value="${esc(knowledge.freezingInfo?.duration || '')}"
              placeholder="e.g., 10-12 months"
              style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div>
            <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px;">\ud83d\udd25 Defrost Method</label>
            <input type="text" id="freezeDefrostMethod" value="${esc(knowledge.freezingInfo?.defrostMethod || '')}"
              placeholder="e.g., Fridge overnight"
              style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
          </div>
          <div>
            <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px;">\u23f1\ufe0f Defrost Time</label>
            <input type="text" id="freezeDefrostTime" value="${esc(knowledge.freezingInfo?.defrostTime || '')}"
              placeholder="e.g., 8-12 hours"
              style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px;">\ud83d\udcc5 After Defrost (how long it lasts)</label>
          <input type="text" id="freezeAfterDefrost" value="${esc(knowledge.freezingInfo?.afterDefrost || '')}"
            placeholder="e.g., Use within 2-3 days"
            style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box;" />
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px;">\ud83d\udcdd Additional Notes</label>
          <textarea id="freezeInstructions" rows="2"
            placeholder="Any other freezing tips..."
            style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 14px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; resize: vertical;">${esc(knowledge.freezingInfo?.instructions || '')}</textarea>
        </div>

        <input type="hidden" id="freezeIngName" value="${esc(ingredientName)}" />

        <div style="display: flex; gap: 8px;">
          <button onclick="closeModal()"
            style="flex: 1; padding: 12px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">
            Cancel
          </button>
          <button onclick="saveFreezingInfo()"
            style="flex: 1; padding: 12px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Save
          </button>
        </div>
      </div>
    `);
  }

async function saveFreezingInfo() {
    const ingredientName = document.getElementById('freezeIngName').value;
    const freezableVal = document.querySelector('input[name="freezable"]:checked')?.value;

    let knowledge = getIngredientKnowledge(ingredientName);
    if (!knowledge) {
      knowledge = createDefaultIngredientKnowledge(ingredientName);
    }

    knowledge.freezable = freezableVal === 'yes' ? true : freezableVal === 'no' ? false : null;
    knowledge.freezingInfo = {
      blanch: document.getElementById('freezeBlanch').value.trim(),
      duration: document.getElementById('freezeDuration').value.trim(),
      defrostMethod: document.getElementById('freezeDefrostMethod').value.trim(),
      defrostTime: document.getElementById('freezeDefrostTime').value.trim(),
      afterDefrost: document.getElementById('freezeAfterDefrost').value.trim(),
      instructions: document.getElementById('freezeInstructions').value.trim()
    };

    await saveIngredientKnowledge(knowledge);
    closeModal();
    showToast('Freezing info saved!', 'success');
    render();
  }

async function deleteIngredientKnowledgeFull(ingredientName) {
    const knowledge = getIngredientKnowledge(ingredientName);
    if (knowledge) {
      await storage.delete(knowledge);
      state.ingredientKnowledge = state.ingredientKnowledge.filter(k => k.name.toLowerCase() !== ingredientName.toLowerCase());
    }
    state.pantryTab = 'ingredients';
    navigateTo('inventory');
    showToast('Ingredient deleted', 'success');
  }

function askClaudeForSection(ingredientName, section) {
    const displayName = capitalize(ingredientName);
    const prompts = {
      cooking: `${displayName} cooking: List 3 methods. Format each as: "Method: temp, time". Example: "Air Fry: 400\u00b0F, 15 min". No other text.`,
      techniques: `${displayName} technique. Reply EXACTLY in this format:\nRESULT: [what you get]\nMETHOD: [technique name]\nSTEPS: [numbered steps, brief]`,
      pairings: `${displayName} pairs with: List 8 ingredients, comma-separated, nothing else.`,
      freezing: `${displayName} freezing guide. Reply EXACTLY:\nFREEZABLE: Yes/No\nBLANCH: [time if needed]\nFREEZE DURATION: [how long]\nDEFROST METHOD: [how to defrost]\nDEFROST TIME: [how long]\nAFTER DEFROST: [how long it lasts]`,
      notes: `${displayName}: One essential tip under 15 words.`
    };
    const sectionLabels = { cooking: 'Cooking Times', techniques: 'Techniques', pairings: 'Pairs Well With', freezing: 'Freezing Guide', notes: 'Notes & Tips' };

    openModal(`
      <div style="color: ${CONFIG.text_color};">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">\ud83e\udd16 Ask Claude: ${sectionLabels[section]}</h2>
        <div style="color: ${CONFIG.text_muted}; font-size: ${CONFIG.type_caption}; margin-bottom: 16px;">About ${displayName}</div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Your question:</label>
          <textarea id="claudeSectionQuestion" rows="3"
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 15px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; box-sizing: border-box; resize: vertical; min-height: 80px;"
            oninput="this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px';"
          >${prompts[section]}</textarea>
        </div>

        <div id="claudeSectionResponse" style="display: none; margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Claude's response:</label>
          <div id="claudeSectionResponseText" style="padding: 12px; background: rgba(232,93,93,0.1); border-radius: 8px; font-size: 14px; line-height: 1.6; max-height: 300px; overflow-y: auto;"></div>
        </div>

        <input type="hidden" id="claudeSectionName" value="${esc(ingredientName)}" />
        <input type="hidden" id="claudeSectionType" value="${section}" />

        <div id="claudeSectionButtons" style="display: flex; gap: 8px;">
          <button onclick="closeModal()"
            style="flex: 1; padding: 12px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">
            Cancel
          </button>
          <button id="askClaudeSectionBtn" onclick="submitClaudeForSection()"
            style="flex: 1; padding: 12px; background: ${CONFIG.surface_elevated}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            \ud83e\udd16 Ask Claude
          </button>
        </div>

        <div id="claudeSectionSaveButtons" style="display: none; gap: 8px;">
          <button onclick="closeModal()"
            style="flex: 1; padding: 12px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">
            Cancel
          </button>
          <button onclick="saveClaudeResponseToSection()"
            style="flex: 1; padding: 12px; background: ${CONFIG.success_color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            \u2713 Save to ${sectionLabels[section]}
          </button>
        </div>
      </div>
    `);
  }

async function submitClaudeForSection() {
    const question = document.getElementById('claudeSectionQuestion').value;
    const btn = document.getElementById('askClaudeSectionBtn');
    btn.disabled = true;
    btn.innerHTML = '\u23f3 Asking Claude...';

    try {
      const response = await fetch(CHEF_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'You give extremely brief answers. Maximum 20 words. No explanations. No markdown. Just facts.',
          messages: [{ role: 'user', content: question }]
        })
      });

      const data = await response.json();
      const responseText = data.content?.[0]?.text || data.error || 'No response received';

      document.getElementById('claudeSectionResponse').style.display = 'block';

      let formattedResponse = responseText
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/^[-\u2022]\s*/gm, '\u2022 ')
        .replace(/(\d+)\.\s+/g, '<strong>$1.</strong> ');

      document.getElementById('claudeSectionResponseText').innerHTML = `
        <div style="font-size: 14px; line-height: 1.5; color: ${CONFIG.text_color};">
          ${formattedResponse}
        </div>
      `;
      document.getElementById('claudeSectionButtons').style.display = 'none';
      document.getElementById('claudeSectionSaveButtons').style.display = 'flex';

      state.claudeSectionResponse = responseText;

    } catch (error) {
      console.error('Claude API error:', error);
      showError('Failed to get response from Claude');
      btn.disabled = false;
      btn.innerHTML = '\ud83e\udd16 Ask Claude';
    }
  }

async function saveClaudeResponseToSection() {
    const ingredientName = document.getElementById('claudeSectionName')?.value;
    const section = document.getElementById('claudeSectionType')?.value;
    const response = state.claudeSectionResponse;

    if (!response) { showError('No response to save'); return; }
    if (!ingredientName || !section) { showError('Missing ingredient or section info'); return; }

    let knowledge = getIngredientKnowledge(ingredientName);
    if (!knowledge) { knowledge = createDefaultIngredientKnowledge(ingredientName); }

    switch (section) {
      case 'cooking':
        const methods = parseClaudeCookingMethods(response);
        knowledge.cookingMethods = [...(knowledge.cookingMethods || []), ...methods];
        break;
      case 'techniques':
        knowledge.techniques = knowledge.techniques || [];
        const resultMatch = response.match(/RESULT:\s*(.+?)(?=METHOD:|$)/is);
        const methodMatch = response.match(/METHOD:\s*(.+?)(?=STEPS:|$)/is);
        const stepsMatch = response.match(/STEPS:\s*(.+)/is);
        knowledge.techniques.push({
          result: resultMatch ? resultMatch[1].trim() : 'Claude Suggestion',
          method: methodMatch ? methodMatch[1].trim() : 'Technique',
          steps: stepsMatch ? stepsMatch[1].trim() : response
        });
        break;
      case 'pairings':
        const pairings = response.split(/[,\n]/)
          .map(p => p.trim().toLowerCase().replace(/[\u2022\-\*]/g, '').trim())
          .filter(p => p && p.length > 1 && p.length < 50);
        knowledge.pairings = [...new Set([...(knowledge.pairings || []), ...pairings])];
        break;
      case 'freezing':
        const freezableMatch = response.match(/FREEZABLE:\s*(yes|no)/i);
        const blanchMatch = response.match(/BLANCH:\s*(.+?)(?=FREEZE DURATION:|$)/is);
        const durationMatch = response.match(/FREEZE DURATION:\s*(.+?)(?=DEFROST METHOD:|$)/is);
        const defrostMethodMatch = response.match(/DEFROST METHOD:\s*(.+?)(?=DEFROST TIME:|$)/is);
        const defrostTimeMatch = response.match(/DEFROST TIME:\s*(.+?)(?=AFTER DEFROST:|$)/is);
        const afterDefrostMatch = response.match(/AFTER DEFROST:\s*(.+)/is);
        knowledge.freezable = freezableMatch ? freezableMatch[1].toLowerCase() === 'yes' : response.toLowerCase().includes('yes');
        knowledge.freezingInfo = {
          blanch: blanchMatch ? blanchMatch[1].trim() : '',
          duration: durationMatch ? durationMatch[1].trim() : '',
          defrostMethod: defrostMethodMatch ? defrostMethodMatch[1].trim() : '',
          defrostTime: defrostTimeMatch ? defrostTimeMatch[1].trim() : '',
          afterDefrost: afterDefrostMatch ? afterDefrostMatch[1].trim() : '',
          instructions: ''
        };
        break;
      case 'notes':
        knowledge.notes = knowledge.notes || [];
        knowledge.notes.push(response);
        break;
    }

    await saveIngredientKnowledge(knowledge);
    closeModal();
    showToast('Saved to ingredient!', 'success');
    render();
  }

function parseClaudeCookingMethods(response) {
    const methods = [];
    const lines = response.split(/[\n,]/).filter(l => l.trim());
    lines.forEach(line => {
      const methodMatch = line.match(/(?:air\s*fry|roast|bake|grill|saut[e\u00e9]|steam|boil|pan[\s-]*fry|broil|braise|poach|simmer)/i);
      const tempMatch = line.match(/(\d+)\s*\u00b0?\s*[FC]/i);
      const timeMatch = line.match(/(\d+(?:\s*-\s*\d+)?)\s*(?:min(?:ute)?s?|hour?s?|hr)/i);
      if (methodMatch) {
        methods.push({
          method: capitalize(methodMatch[0].replace(/[\s-]+/g, ' ')),
          temp: tempMatch ? tempMatch[0].replace(/\s/g, '') : '',
          time: timeMatch ? timeMatch[0] : '',
          notes: ''
        });
      }
    });
    if (methods.length === 0 && response.trim()) {
      const parts = response.split(/[;.]/).filter(p => p.trim());
      parts.forEach(part => {
        const methodMatch = part.match(/(?:air\s*fry|roast|bake|grill|saut[e\u00e9]|steam|boil|pan[\s-]*fry|broil|braise|poach|simmer)/i);
        if (methodMatch) {
          const tempMatch = part.match(/(\d+)\s*\u00b0?\s*[FC]/i);
          const timeMatch = part.match(/(\d+(?:\s*-\s*\d+)?)\s*(?:min(?:ute)?s?|hour?s?|hr)/i);
          methods.push({
            method: capitalize(methodMatch[0]),
            temp: tempMatch ? tempMatch[0] : '',
            time: timeMatch ? timeMatch[0] : '',
            notes: ''
          });
        }
      });
    }
    return methods;
  }

function editIngredientKnowledge(name) {
    let knowledge = getIngredientKnowledge(name);
    if (!knowledge) { knowledge = createDefaultIngredientKnowledge(name); }
    const currentImage = knowledge.image_url || INGREDIENT_IMAGES[name.toLowerCase()] || '';

    openModal(`
      <div style="color: ${CONFIG.text_color}; max-height: 80vh; overflow-y: auto;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">\u270f\ufe0f Edit ${esc(capitalize(name))}</h2>
        <div class="mb-4">
          <label class="block mb-2 font-semibold">Image URL:</label>
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            ${currentImage ? `<img loading="lazy" src="${esc(currentImage)}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" onerror="this.style.display='none'" />` : `<div style="width: 80px; height: 80px; background: ${CONFIG.background_color}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">\ud83e\udd57</div>`}
            <input type="text" id="editIngImageUrl" class="flex-1 px-3 py-2 border rounded"
                   style="background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: 1px solid rgba(255,255,255,0.1);"
                   value="${esc(currentImage)}" placeholder="https://example.com/image.jpg" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block mb-2 font-semibold">Category:</label>
            <select id="editIngCategory" class="w-full px-3 py-2 border rounded" style="background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: 1px solid rgba(255,255,255,0.1);">
              ${INGREDIENT_CATEGORIES.map(c => `<option value="${c}" ${knowledge.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block mb-2 font-semibold">Season:</label>
            <select id="editIngSeason" class="w-full px-3 py-2 border rounded" style="background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: 1px solid rgba(255,255,255,0.1);">
              ${SEASONS.map(s => `<option value="${s}" ${knowledge.season === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block mb-2 font-semibold">Storage Location:</label>
            <select id="editIngStorageLoc" class="w-full px-3 py-2 border rounded" style="background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: 1px solid rgba(255,255,255,0.1);">
              ${STORAGE_LOCATIONS.map(l => `<option value="${l}" ${knowledge.storage?.location === l ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block mb-2 font-semibold">Storage Duration:</label>
            <input type="text" id="editIngStorageDur" class="w-full px-3 py-2 border rounded"
                   style="background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: 1px solid rgba(255,255,255,0.1);"
                   value="${esc(knowledge.storage?.duration || '')}" placeholder="e.g., 5-7 days" />
          </div>
        </div>
        <div class="mb-4">
          <label class="block mb-2 font-semibold">Freezable:</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2"><input type="radio" name="freezable" value="yes" ${knowledge.freezable === true ? 'checked' : ''} /> Yes</label>
            <label class="flex items-center gap-2"><input type="radio" name="freezable" value="no" ${knowledge.freezable === false ? 'checked' : ''} /> No</label>
            <label class="flex items-center gap-2"><input type="radio" name="freezable" value="unknown" ${knowledge.freezable === null ? 'checked' : ''} /> Unknown</label>
          </div>
        </div>
        <div class="mb-4 p-3 rounded" style="background: ${CONFIG.background_color};">
          <label class="block mb-2 font-semibold">🧊 Freezing Info:</label>
          <div class="grid grid-cols-2 gap-2 mb-2">
            <input type="text" id="editIngBlanch" class="px-3 py-2 border rounded" style="background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; border: 1px solid rgba(255,255,255,0.1);" value="${esc(knowledge.freezingInfo?.blanch || '')}" placeholder="Blanch time" />
            <input type="text" id="editIngFreezeDur" class="px-3 py-2 border rounded" style="background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; border: 1px solid rgba(255,255,255,0.1);" value="${esc(knowledge.freezingInfo?.duration || '')}" placeholder="Freezer life" />
          </div>
          <textarea id="editIngFreezeInst" class="w-full px-3 py-2 border rounded" rows="2" style="background: ${CONFIG.surface_color}; color: ${CONFIG.text_color}; border: 1px solid rgba(255,255,255,0.1);" placeholder="Freezing instructions...">${esc(knowledge.freezingInfo?.instructions || '')}</textarea>
        </div>
        <input type="hidden" id="editIngName" value="${esc(name)}" />
        <input type="hidden" id="editIngId" value="${esc(knowledge.id)}" />
        <div class="flex gap-2 justify-end">
          <button onclick="closeModal()" style="padding: 10px 20px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
          <button onclick="saveEditedIngredientKnowledge()" style="padding: 10px 20px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Save</button>
        </div>
      </div>
    `);
  }

async function saveEditedIngredientKnowledge() {
    const name = document.getElementById('editIngName').value;
    const id = document.getElementById('editIngId').value;
    const imageUrl = document.getElementById('editIngImageUrl')?.value.trim() || '';
    const freezableVal = document.querySelector('input[name="freezable"]:checked')?.value;

    const knowledge = {
      id: id, type: 'ingredient_knowledge', name: name,
      category: document.getElementById('editIngCategory').value,
      season: document.getElementById('editIngSeason').value,
      image_url: imageUrl,
      storage: { location: document.getElementById('editIngStorageLoc').value, duration: document.getElementById('editIngStorageDur').value.trim() },
      freezable: freezableVal === 'yes' ? true : freezableVal === 'no' ? false : null,
      freezingInfo: { blanch: document.getElementById('editIngBlanch').value.trim(), duration: document.getElementById('editIngFreezeDur').value.trim(), instructions: document.getElementById('editIngFreezeInst').value.trim() },
      cookingMethods: getIngredientKnowledge(name)?.cookingMethods || [],
      pairings: getIngredientKnowledge(name)?.pairings || [],
      notes: getIngredientKnowledge(name)?.notes || [],
      updatedAt: new Date().toISOString()
    };

    if (imageUrl) { INGREDIENT_IMAGES[name.toLowerCase()] = imageUrl; }
    await saveIngredientKnowledge(knowledge);
    closeModal();
    showToast('Ingredient info saved!', 'success');
    render();
  }

function addCookingMethod(name) {
    openModal(`
      <div style="color: ${CONFIG.text_color};">
        <h2 class="text-xl font-bold mb-4">\ud83d\udd25 Add Cooking Method</h2>
        <div class="mb-4"><label class="block mb-2 font-semibold">Cut or type (optional):</label>
          <input type="text" id="newMethodCutType" class="w-full px-3 py-2 border rounded" placeholder="e.g., Drumsticks, Thighs, Ground" />
        </div>
        <div class="mb-4"><label class="block mb-2 font-semibold">Method:</label>
          <select id="newMethodType" class="w-full px-3 py-2 border rounded">${COOKING_METHODS.map(m => `<option value="${m}">${m}</option>`).join('')}</select>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div><label class="block mb-2 font-semibold">Temperature:</label><input type="text" id="newMethodTemp" class="w-full px-3 py-2 border rounded" placeholder="e.g., 400\u00b0F, Med-Hi" /></div>
          <div><label class="block mb-2 font-semibold">Time:</label><input type="text" id="newMethodTime" class="w-full px-3 py-2 border rounded" placeholder="e.g., 15-20 min" /></div>
        </div>
        <div class="mb-4"><label class="block mb-2 font-semibold">Notes (optional):</label><input type="text" id="newMethodNotes" class="w-full px-3 py-2 border rounded" placeholder="e.g., flip halfway, until golden" /></div>
        <input type="hidden" id="methodIngName" value="${esc(name)}" />
        <input type="hidden" id="methodEditIndex" value="-1" />
        <div class="flex gap-2 justify-end">
          <button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">Cancel</button>
          <button onclick="saveCookingMethod()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.success_color}; color: white;">Add</button>
        </div>
      </div>
    `);
  }

async function saveCookingMethod() {
    const name = document.getElementById('methodIngName').value;
    const editIndex = parseInt(document.getElementById('methodEditIndex').value);
    const cutType = document.getElementById('newMethodCutType').value.trim();
    const method = {
      method: document.getElementById('newMethodType').value,
      temp: document.getElementById('newMethodTemp').value.trim(),
      time: document.getElementById('newMethodTime').value.trim(),
      notes: document.getElementById('newMethodNotes').value.trim(),
      cutType: cutType || ''
    };
    if (!method.time) { showError('Please enter a cooking time'); return; }
    let knowledge = getIngredientKnowledge(name);
    if (!knowledge) { knowledge = createDefaultIngredientKnowledge(name); }
    knowledge.cookingMethods = knowledge.cookingMethods || [];
    if (editIndex >= 0 && editIndex < knowledge.cookingMethods.length) {
      knowledge.cookingMethods[editIndex] = method;
    } else {
      knowledge.cookingMethods.push(method);
    }
    saveIngredientKnowledge(knowledge);
    closeModal();
    showToast(editIndex >= 0 ? 'Cooking method updated!' : 'Cooking method added!', 'success');
    requestAnimationFrame(() => render());
  }

async function deleteCookingMethod(name, index) {
    const knowledge = getIngredientKnowledge(name);
    if (knowledge && knowledge.cookingMethods) { knowledge.cookingMethods.splice(index, 1); await saveIngredientKnowledge(knowledge); render(); }
  }

  function editCookingMethod(name, index) {
    const knowledge = getIngredientKnowledge(name);
    if (!knowledge || !knowledge.cookingMethods || !knowledge.cookingMethods[index]) return;
    const m = knowledge.cookingMethods[index];
    openModal(`
      <div style="color: ${CONFIG.text_color};">
        <h2 class="text-xl font-bold mb-4">\ud83d\udd25 Edit Cooking Method</h2>
        <div class="mb-4"><label class="block mb-2 font-semibold">Cut or type (optional):</label>
          <input type="text" id="newMethodCutType" class="w-full px-3 py-2 border rounded" placeholder="e.g., Drumsticks, Thighs, Ground" value="${esc(m.cutType || '')}" />
        </div>
        <div class="mb-4"><label class="block mb-2 font-semibold">Method:</label>
          <select id="newMethodType" class="w-full px-3 py-2 border rounded">${COOKING_METHODS.map(cm => `<option value="${cm}" ${cm === m.method ? 'selected' : ''}>${cm}</option>`).join('')}</select>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div><label class="block mb-2 font-semibold">Temperature:</label><input type="text" id="newMethodTemp" class="w-full px-3 py-2 border rounded" placeholder="e.g., 400\u00b0F, Med-Hi" value="${esc(m.temp || '')}" /></div>
          <div><label class="block mb-2 font-semibold">Time:</label><input type="text" id="newMethodTime" class="w-full px-3 py-2 border rounded" placeholder="e.g., 15-20 min" value="${esc(m.time || '')}" /></div>
        </div>
        <div class="mb-4"><label class="block mb-2 font-semibold">Notes (optional):</label><input type="text" id="newMethodNotes" class="w-full px-3 py-2 border rounded" placeholder="e.g., flip halfway, until golden" value="${esc(m.notes || '')}" /></div>
        <input type="hidden" id="methodIngName" value="${esc(name)}" />
        <input type="hidden" id="methodEditIndex" value="${index}" />
        <div class="flex gap-2 justify-end">
          <button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">Cancel</button>
          <button onclick="saveCookingMethod()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.success_color}; color: white;">Save</button>
        </div>
      </div>
    `);
  }

function addTechnique(name) {
    openModal(`
      <div style="color: ${CONFIG.text_color};">
        <h2 class="text-xl font-bold mb-4">\ud83d\udc68\u200d\ud83c\udf73 Add Technique</h2>
        <div class="mb-4"><label class="block mb-2 font-semibold">\ud83c\udfaf Result (what you'll get):</label><input type="text" id="newTechResult" class="w-full px-3 py-2 border rounded" placeholder="e.g., Juicy with crispy skin" /><div class="text-xs mt-1" style="color: ${CONFIG.text_muted};">This is what a novice cook will see first</div></div>
        <div class="mb-4"><label class="block mb-2 font-semibold">Method name:</label><input type="text" id="newTechMethod" class="w-full px-3 py-2 border rounded" placeholder="e.g., Sear then Bake" /></div>
        <div class="mb-4"><label class="block mb-2 font-semibold">Steps:</label><textarea id="newTechSteps" class="w-full px-3 py-2 border rounded" rows="4" placeholder="1. Sear 2-3 min per side on stovetop&#10;2. Transfer to 400\u00b0F oven for 15-20 min&#10;3. Rest 5 min before cutting"></textarea></div>
        <input type="hidden" id="techIngName" value="${esc(name)}" />
        <div class="flex gap-2 justify-end">
          <button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">Cancel</button>
          <button onclick="saveTechnique()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.success_color}; color: white;">Add Technique</button>
        </div>
      </div>
    `);
  }

async function saveTechnique() {
    const name = document.getElementById('techIngName').value;
    const technique = { result: document.getElementById('newTechResult').value.trim(), method: document.getElementById('newTechMethod').value.trim(), steps: document.getElementById('newTechSteps').value.trim() };
    if (!technique.result) { showError('Please enter the result'); return; }
    if (!technique.steps) { showError('Please enter the steps'); return; }
    let knowledge = getIngredientKnowledge(name);
    if (!knowledge) { knowledge = createDefaultIngredientKnowledge(name); }
    knowledge.techniques = knowledge.techniques || [];
    knowledge.techniques.push(technique);
    try { await saveIngredientKnowledge(knowledge); closeModal(); showToast('Saved to ingredient!', 'success'); state.claudeSectionResponse = null; render(); } catch (error) { console.error('Save error:', error); showError('Failed to save'); }
  }

async function deleteTechnique(name, index) {
    const knowledge = getIngredientKnowledge(name);
    if (knowledge && knowledge.techniques) { knowledge.techniques.splice(index, 1); await saveIngredientKnowledge(knowledge); render(); }
  }

function viewTechniqueDetail(name, idx) {
    const knowledge = getIngredientKnowledge(name);
    if (!knowledge || !knowledge.techniques || !knowledge.techniques[idx]) return;
    const tech = knowledge.techniques[idx];
    openModal(`
      <div style="color: ${CONFIG.text_color};">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <span style="font-size: 1.5rem;">\ud83c\udfaf</span>
          <h2 style="font-size: 20px; font-weight: 700; margin: 0;">${esc(tech.result)}</h2>
        </div>
        <div style="margin-bottom: 16px;">
          <div style="color: ${CONFIG.primary_action_color}; font-weight: 600; font-size: 15px; margin-bottom: 8px;">${esc(tech.method)}</div>
          <div style="color: ${CONFIG.text_color}; font-size: 14px; line-height: 1.7; white-space: pre-line; background: ${CONFIG.background_color}; padding: 12px; border-radius: 8px;">${esc(tech.steps)}</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="closeModal()" style="flex: 1; padding: 12px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">Close</button>
          <button onclick="closeModal(); deleteTechnique('${esc(name)}', ${idx})" style="padding: 12px 20px; background: rgba(239,68,68,0.1); color: ${CONFIG.danger_color}; border: none; border-radius: 8px; cursor: pointer;">\ud83d\uddd1\ufe0f Delete</button>
        </div>
      </div>
    `);
  }

function addPairing(name) {
    const pairing = prompt('Enter an ingredient that pairs well with ' + name + ':');
    if (pairing && pairing.trim()) { savePairing(name, pairing.trim()); }
  }

async function savePairing(name, pairing) {
    let knowledge = getIngredientKnowledge(name);
    if (!knowledge) { knowledge = createDefaultIngredientKnowledge(name); }
    knowledge.pairings = knowledge.pairings || [];
    if (!knowledge.pairings.includes(pairing.toLowerCase())) { knowledge.pairings.push(pairing.toLowerCase()); await saveIngredientKnowledge(knowledge); showToast('Pairing added!', 'success'); render(); }
  }

async function deletePairing(name, index) {
    const knowledge = getIngredientKnowledge(name);
    if (knowledge && knowledge.pairings) { knowledge.pairings.splice(index, 1); await saveIngredientKnowledge(knowledge); render(); }
  }

function addIngredientNote(name) {
    const note = prompt('Add a note about ' + name + ':');
    if (note && note.trim()) { saveIngredientNote(name, note.trim()); }
  }

async function saveIngredientNote(name, note) {
    let knowledge = getIngredientKnowledge(name);
    if (!knowledge) { knowledge = createDefaultIngredientKnowledge(name); }
    knowledge.notes = knowledge.notes || [];
    knowledge.notes.push(note);
    await saveIngredientKnowledge(knowledge);
    showToast('Note added!', 'success');
    render();
  }

function editIngredientNote(name, index) {
    const knowledge = getIngredientKnowledge(name);
    if (!knowledge || !knowledge.notes || !knowledge.notes[index]) return;
    const note = knowledge.notes[index];
    const lines = note.split('\n');
    let noteTitle = lines[0].replace(/^\ud83d\udccc\s*/, '').trim();
    const noteContent = lines.slice(1).join('\n').trim();
    openModal(`
      <div style="color: ${CONFIG.text_color}; max-height: 80vh; overflow-y: auto;">
        <h2 class="text-xl font-bold mb-4">\u270f\ufe0f Edit Note</h2>
        <div class="mb-4"><label class="block mb-2 font-semibold">Title:</label><input type="text" id="editNoteTitle" class="w-full px-3 py-2 border rounded" value="${esc(noteTitle)}" placeholder="Note title" /></div>
        <div class="mb-4"><label class="block mb-2 font-semibold">Content:</label><textarea id="editNoteContent" class="w-full px-3 py-2 border rounded" rows="10" placeholder="Note content...">${esc(noteContent)}</textarea></div>
        <input type="hidden" id="editNoteIngName" value="${esc(name)}" />
        <input type="hidden" id="editNoteIndex" value="${index}" />
        <div class="flex gap-2 justify-end">
          <button onclick="closeModal()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.surface_elevated}; color: ${CONFIG.text_color};">Cancel</button>
          <button onclick="saveEditedNote()" class="px-4 py-2 rounded button-hover" style="background: ${CONFIG.success_color}; color: white;">Save</button>
        </div>
      </div>
    `);
  }

async function saveEditedNote() {
    const name = document.getElementById('editNoteIngName').value;
    const index = parseInt(document.getElementById('editNoteIndex').value);
    const title = document.getElementById('editNoteTitle').value.trim();
    const content = document.getElementById('editNoteContent').value.trim();
    if (!title) { showError('Please enter a title'); return; }
    const knowledge = getIngredientKnowledge(name);
    if (!knowledge || !knowledge.notes) return;
    knowledge.notes[index] = `\ud83d\udccc ${title}\n\n${content}`;
    await saveIngredientKnowledge(knowledge);
    closeModal();
    showToast('Note updated!', 'success');
    render();
  }

async function deleteIngredientNote(name, index) {
    const knowledge = getIngredientKnowledge(name);
    if (knowledge && knowledge.notes) { knowledge.notes.splice(index, 1); await saveIngredientKnowledge(knowledge); render(); }
  }

function toggleIngredientFavorite(name) {
    let knowledge = getIngredientKnowledge(name);
    if (!knowledge) { knowledge = createDefaultIngredientKnowledge(name); }
    knowledge.favorite = !knowledge.favorite;
    saveIngredientKnowledge(knowledge);
    render();
  }



// ===== PAGE RENDER & INIT (for kitchen.html) =====

const VIEW_RENDERERS = {
  'kitchen': renderKitchen,
  'kitchen-detail': renderKitchenDetail,
  'kitchen-ingredient-meals': renderKitchenIngredientMeals,
  'ingredient-detail': renderIngredientDetail
};

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  if (state.currentView === 'inventory') {
    state.kitchenActiveTab = 'inventory';
    state.currentView = 'kitchen';
  }
  if (state.currentView === 'ingredients') {
    state.kitchenActiveTab = 'inventory';
    state.pantryTab = 'ingredients';
    state.currentView = 'kitchen';
  }

  const renderer = VIEW_RENDERERS[state.currentView];
  let content;
  if (renderer) {
    content = renderer();
  } else {
    content = renderKitchen();
    state.currentView = 'kitchen';
  }

  app.innerHTML = `
    <div class="${getAppShellClass()}" style="background: ${CONFIG.background_color}; min-height: 100dvh; padding-bottom: 56px;">
      ${renderDesktopSidebar()}
      ${renderNav()}
      <div class="desktop-content-area">
        ${renderDesktopPageTitle()}
        ${content}
      </div>
      ${typeof renderClaudeReceiptModal === 'function' ? renderClaudeReceiptModal() : ''}
      ${typeof renderReceiptScannerModal === 'function' ? renderReceiptScannerModal() : ''}
      ${renderBottomNav()}
    </div>
  `;

  if (state.currentView === 'kitchen') initKitchenCardSwipeGestures();
}

function showSplitInventoryItem(itemId) {
  const item = state.inventory.find(i => i.id === itemId);
  if (!item) return;

  openModal(`
    <div style="color: ${CONFIG.text_color};">
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">✂️ Split ${esc(item.name)}</h2>
      <p style="color: ${CONFIG.text_muted}; font-size: 14px; margin-bottom: 16px;">Create separate entries for fridge and freezer</p>

      <div style="background: ${CONFIG.background_color}; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="font-size: 32px;">🧊</div>
          <div style="flex: 1;">
            <div style="font-weight: 600;">Freeze</div>
            <div style="color: ${CONFIG.text_muted}; font-size: 12px;">Goes in freezer with extended expiry</div>
          </div>
          <input type="number" id="splitFreezeQty" value="1" min="0" max="99"
            style="width: 60px; padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; text-align: center; font-size: 18px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color};" />
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 32px;">🥶</div>
          <div style="flex: 1;">
            <div style="font-weight: 600;">Keep in Fridge</div>
            <div style="color: ${CONFIG.text_muted}; font-size: 12px;">Stays fresh with current expiry</div>
          </div>
          <input type="number" id="splitFridgeQty" value="1" min="0" max="99"
            style="width: 60px; padding: 8px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; text-align: center; font-size: 18px; background: ${CONFIG.surface_color}; color: ${CONFIG.text_color};" />
        </div>
      </div>

      <div style="display: flex; gap: 8px;">
        <button onclick="closeModal()" style="flex: 1; padding: 12px; background: ${CONFIG.background_color}; color: ${CONFIG.text_color}; border: none; border-radius: 8px; cursor: pointer;">
          Cancel
        </button>
        <button onclick="confirmSplitInventoryItem('${item.id}')" style="flex: 1; padding: 12px; background: ${CONFIG.primary_action_color}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Split Item
        </button>
      </div>
    </div>
  `);
}

async function confirmSplitInventoryItem(itemId) {
  const item = state.inventory.find(i => i.id === itemId);
  if (!item) return;

  const freezeQty = parseInt(document.getElementById('splitFreezeQty')?.value) || 0;
  const fridgeQty = parseInt(document.getElementById('splitFridgeQty')?.value) || 0;

  if (freezeQty === 0 && fridgeQty === 0) {
    showError('Please enter at least 1 for either option');
    return;
  }

  // Delete original item
  state.inventory = state.inventory.filter(i => i.id !== itemId);
  await storage.delete(item);

  // Create freezer items
  const frozenItems = [];
  for (let i = 0; i < freezeQty; i++) {
    frozenItems.push({
      ...item,
      id: `inv_${Date.now()}_freeze_${i}_${Math.random().toString(36).slice(2)}`,
      quantity: 1,
      isFrozen: true,
      frozenDate: getToday(),
      expirationDate: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 90);
        return _localDateStr(d);
      })()
    });
  }

  // Create fridge items
  const fridgeItems = [];
  for (let i = 0; i < fridgeQty; i++) {
    fridgeItems.push({
      ...item,
      id: `inv_${Date.now()}_fridge_${i}_${Math.random().toString(36).slice(2)}`,
      quantity: 1,
      isFrozen: false
    });
  }

  // Add all to state immediately (optimistic)
  state.inventory.push(...frozenItems, ...fridgeItems);

  // Save all to storage in parallel
  await Promise.all([
    ...frozenItems.map(fi => storage.create(fi)),
    ...fridgeItems.map(fi => storage.create(fi))
  ]);

  closeModal();
  showToast(`Split into ${freezeQty} frozen + ${fridgeQty} fresh`, 'success');
  render();
}

// markRecipeCooked removed — cooking is only tracked via My Meals food log

function init() {
  loadAllState();
  loadCustomIngredientImages();
  const targetView = sessionStorage.getItem('yummy_target_view');
  if (targetView === 'inventory' || targetView === 'ingredients') {
    sessionStorage.removeItem('yummy_target_view');
    state.kitchenActiveTab = 'inventory';
    if (targetView === 'ingredients') state.pantryTab = 'ingredients';
    state.currentView = 'kitchen';
  } else if (targetView && VIEW_RENDERERS[targetView]) {
    sessionStorage.removeItem('yummy_target_view');
    state.currentView = targetView;
  } else {
    state.currentView = 'kitchen';
  }
  setupKeyboardShortcuts();
  render();
}

init();
