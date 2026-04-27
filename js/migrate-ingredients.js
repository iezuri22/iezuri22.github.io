// One-off migration: re-parse every ingredient name in the library AND in
// every recipe's ingredientsRows using the fixed normalizeIngredientName,
// drop orphan entries, and dedupe by normalized name (case-insensitive).
//
// Usage from the browser console (any page that loads shared.js):
//   await migrateIngredients({ dryRun: true });   // preview only
//   await migrateIngredients({ dryRun: false });  // apply
//
// Both modes return a report object you can inspect.

(function () {
  function _scoreKnowledge(k) {
    let s = 0;
    if (k.image_url) s += 5;
    s += (k.cookingMethods || []).length * 2;
    s += (k.notes || []).length * 2;
    s += (k.pairings || []).length;
    s += (k.techniques || []).length;
    if (k.category && k.category !== 'Other') s += 1;
    if (k.defaultExpirationDays) s += 1;
    if (k.freezable !== null && k.freezable !== undefined) s += 1;
    return s;
  }

  function _mergeKnowledge(keeper, dup) {
    if (!keeper.image_url && dup.image_url) keeper.image_url = dup.image_url;
    const mergeArr = (a, b) => Array.from(new Set([...(a || []), ...(b || [])]));
    keeper.cookingMethods = mergeArr(keeper.cookingMethods, dup.cookingMethods);
    keeper.notes = mergeArr(keeper.notes, dup.notes);
    keeper.pairings = mergeArr(keeper.pairings, dup.pairings);
    keeper.techniques = mergeArr(keeper.techniques, dup.techniques);
    if ((!keeper.category || keeper.category === 'Other') && dup.category && dup.category !== 'Other') {
      keeper.category = dup.category;
    }
    if (!keeper.defaultExpirationDays && dup.defaultExpirationDays) {
      keeper.defaultExpirationDays = dup.defaultExpirationDays;
    }
  }

  async function migrateIngredients({ dryRun = true } = {}) {
    if (typeof normalizeIngredientName !== 'function') {
      throw new Error('normalizeIngredientName not loaded. Include shared.js first.');
    }

    const report = {
      dryRun,
      library: {
        scanned: (state.ingredientKnowledge || []).length,
        renamed: [],     // [{ id, oldName, newName }]
        orphaned: [],    // [{ id, oldName }]  (will be deleted)
        merged: [],      // [{ keeperId, keeperName, mergedIds: [...] }]
        unchanged: 0
      },
      recipes: {
        scanned: (state.recipes || []).length,
        rowsChanged: [], // [{ recipeId, recipeTitle, before: [...], after: [...] }]
        rowsDropped: 0,
        recipesUpdated: 0
      },
      inventory: {
        scanned: (state.inventory || []).length,
        renamed: [],     // [{ id, oldName, newName }]
        orphaned: []     // [{ id, oldName }]
      },
      customImages: {
        scanned: 0,
        renamed: [],     // [{ oldKey, newKey }]
        orphaned: []     // [oldKey]
      }
    };

    // --- Library pass --------------------------------------------------
    const surviving = [];          // entries that will remain (one per normalized name)
    const byKey = new Map();       // lowercase normalized name -> keeper entry
    const toDelete = [];           // entries to remove

    for (const k of (state.ingredientKnowledge || [])) {
      const oldName = k.name || '';
      const newName = normalizeIngredientName(oldName);

      if (!newName) {
        report.library.orphaned.push({ id: k.id, oldName });
        toDelete.push(k);
        continue;
      }

      if (newName !== oldName) {
        report.library.renamed.push({ id: k.id, oldName, newName });
      } else {
        report.library.unchanged++;
      }

      const key = newName.toLowerCase();
      const existing = byKey.get(key);
      if (!existing) {
        const updated = { ...k, name: newName };
        byKey.set(key, updated);
        surviving.push(updated);
      } else {
        // Decide keeper by data richness
        const updatedDup = { ...k, name: newName };
        if (_scoreKnowledge(updatedDup) > _scoreKnowledge(existing)) {
          _mergeKnowledge(updatedDup, existing);
          // Replace existing in surviving with updatedDup
          const idx = surviving.indexOf(existing);
          if (idx >= 0) surviving[idx] = updatedDup;
          byKey.set(key, updatedDup);
          // Existing now needs to be deleted; track merge under updatedDup
          let entry = report.library.merged.find(m => m.keeperId === updatedDup.id);
          if (!entry) {
            entry = { keeperId: updatedDup.id, keeperName: newName, mergedIds: [] };
            report.library.merged.push(entry);
          }
          entry.mergedIds.push(existing.id);
          toDelete.push(existing);
        } else {
          _mergeKnowledge(existing, updatedDup);
          let entry = report.library.merged.find(m => m.keeperId === existing.id);
          if (!entry) {
            entry = { keeperId: existing.id, keeperName: newName, mergedIds: [] };
            report.library.merged.push(entry);
          }
          entry.mergedIds.push(k.id);
          toDelete.push(k);
        }
      }
    }

    // --- Recipe pass ---------------------------------------------------
    const recipeUpdates = [];
    for (const recipe of (state.recipes || [])) {
      const rows = Array.isArray(recipe.ingredientsRows) ? recipe.ingredientsRows : [];
      if (!rows.length) continue;
      const before = rows.map(r => r.name || '');
      const after = [];
      const newRows = [];
      let changed = false;
      for (const r of rows) {
        const cleanName = normalizeIngredientName(r.name || '');
        if (!cleanName) {
          changed = true;
          report.recipes.rowsDropped++;
          after.push('<dropped>');
          continue;
        }
        if (cleanName !== r.name) changed = true;
        after.push(cleanName);
        newRows.push({ ...r, name: cleanName });
      }
      if (changed) {
        report.recipes.rowsChanged.push({
          recipeId: recipe.id,
          recipeTitle: recipe.title || '(untitled)',
          before,
          after
        });
        recipeUpdates.push({ recipe, newRows });
      }
    }

    // --- Inventory pass ------------------------------------------------
    const inventoryUpdates = [];   // { item, newName }
    const inventoryDeletes = [];   // item
    for (const item of (state.inventory || [])) {
      const oldName = item.name || '';
      const newName = normalizeIngredientName(oldName);
      if (!newName) {
        report.inventory.orphaned.push({ id: item.id, oldName });
        inventoryDeletes.push(item);
        continue;
      }
      if (newName !== oldName) {
        report.inventory.renamed.push({ id: item.id, oldName, newName });
        inventoryUpdates.push({ item, newName });
      }
    }

    // --- customIngredientImages pass -----------------------------------
    // Key/value object {name -> imageUrl}, persisted via saveCustomIngredientImages.
    const customImagesNew = {};
    const customImagesObj = (typeof customIngredientImages !== 'undefined' && customIngredientImages) ? customIngredientImages : {};
    report.customImages.scanned = Object.keys(customImagesObj).length;
    let customImagesChanged = false;
    for (const [oldKey, url] of Object.entries(customImagesObj)) {
      const newKey = normalizeIngredientName(oldKey);
      if (!newKey) {
        report.customImages.orphaned.push(oldKey);
        customImagesChanged = true;
        continue;
      }
      const lookupKey = newKey.toLowerCase();
      if (lookupKey !== oldKey) {
        report.customImages.renamed.push({ oldKey, newKey: lookupKey });
        customImagesChanged = true;
      }
      // Last-write-wins on collision; keys are lowercased to match existing convention.
      customImagesNew[lookupKey] = url;
    }

    // --- Print summary -------------------------------------------------
    const tag = dryRun ? '[DRY-RUN]' : '[APPLY]';
    console.log(`${tag} Ingredient migration scan complete`);
    console.log(`  Library: ${report.library.scanned} scanned`);
    console.log(`    - rename: ${report.library.renamed.length}`);
    console.log(`    - orphan/delete: ${report.library.orphaned.length}`);
    console.log(`    - merge groups: ${report.library.merged.length}`);
    console.log(`    - unchanged: ${report.library.unchanged}`);
    console.log(`  Recipes: ${report.recipes.scanned} scanned, ${report.recipes.rowsChanged.length} need ingredient row updates, ${report.recipes.rowsDropped} rows dropped`);
    console.log(`  Inventory: ${report.inventory.scanned} scanned, ${report.inventory.renamed.length} rename, ${report.inventory.orphaned.length} orphan/delete`);
    console.log(`  Custom images: ${report.customImages.scanned} scanned, ${report.customImages.renamed.length} rename, ${report.customImages.orphaned.length} orphan/delete`);

    if (report.library.renamed.length) {
      console.log('\nRenames:');
      report.library.renamed.forEach(r => console.log(`  "${r.oldName}" -> "${r.newName}"`));
    }
    if (report.library.orphaned.length) {
      console.log('\nOrphans to delete:');
      report.library.orphaned.forEach(r => console.log(`  "${r.oldName}" (id=${r.id})`));
    }
    if (report.library.merged.length) {
      console.log('\nMerges:');
      report.library.merged.forEach(m => console.log(`  Keep "${m.keeperName}" (${m.keeperId}) <- merge ${m.mergedIds.length} dup(s)`));
    }
    if (report.recipes.rowsChanged.length) {
      console.log('\nRecipe ingredient changes:');
      report.recipes.rowsChanged.slice(0, 30).forEach(rc => {
        console.log(`  [${rc.recipeId}] ${rc.recipeTitle}`);
        rc.before.forEach((b, i) => {
          if (b !== rc.after[i]) console.log(`     "${b}" -> "${rc.after[i]}"`);
        });
      });
      if (report.recipes.rowsChanged.length > 30) {
        console.log(`  ... and ${report.recipes.rowsChanged.length - 30} more recipes`);
      }
    }
    if (report.inventory.renamed.length) {
      console.log('\nInventory renames:');
      report.inventory.renamed.slice(0, 50).forEach(r => console.log(`  "${r.oldName}" -> "${r.newName}"`));
      if (report.inventory.renamed.length > 50) console.log(`  ... and ${report.inventory.renamed.length - 50} more`);
    }
    if (report.inventory.orphaned.length) {
      console.log('\nInventory orphans to delete:');
      report.inventory.orphaned.forEach(r => console.log(`  "${r.oldName}" (id=${r.id})`));
    }
    if (report.customImages.renamed.length) {
      console.log('\nCustom-image key renames:');
      report.customImages.renamed.forEach(r => console.log(`  "${r.oldKey}" -> "${r.newKey}"`));
    }
    if (report.customImages.orphaned.length) {
      console.log('\nCustom-image orphan keys:');
      report.customImages.orphaned.forEach(k => console.log(`  "${k}"`));
    }

    if (dryRun) {
      console.log('\nDry-run only — nothing written. Re-run with { dryRun: false } to apply.');
      return report;
    }

    // --- Apply ---------------------------------------------------------
    console.log('\nApplying changes...');

    // 1. Delete orphans + losers from merges
    for (const k of toDelete) {
      try { await storage.delete(k); }
      catch (e) { console.error('Delete failed for', k.id, e); }
    }

    // 2. Upsert survivors (in-memory state.ingredientKnowledge already
    //    points at stale objects; replace it wholesale, then upsert each).
    state.ingredientKnowledge = surviving;
    for (const k of surviving) {
      try { await storage.update(k); }
      catch (e) { console.error('Update failed for', k.id, e); }
    }

    // 3. Update recipes whose rows changed
    for (const { recipe, newRows } of recipeUpdates) {
      recipe.ingredientsRows = newRows;
      try { await storage.update(recipe); report.recipes.recipesUpdated++; }
      catch (e) { console.error('Recipe update failed for', recipe.id, e); }
    }

    // 4. Inventory: delete orphans, rename survivors
    for (const item of inventoryDeletes) {
      try { await storage.delete(item); }
      catch (e) { console.error('Inventory delete failed for', item.id, e); }
    }
    for (const { item, newName } of inventoryUpdates) {
      item.name = newName;
      try { await storage.update(item); }
      catch (e) { console.error('Inventory update failed for', item.id, e); }
    }

    // 5. Custom images: replace whole map and persist
    if (customImagesChanged) {
      try {
        // Mutate in place so other modules holding a reference see the new keys.
        for (const k of Object.keys(customImagesObj)) delete customImagesObj[k];
        Object.assign(customImagesObj, customImagesNew);
        if (typeof saveCustomIngredientImages === 'function') saveCustomIngredientImages();
      } catch (e) { console.error('Custom images update failed', e); }
    }

    console.log('Migration applied.');
    if (typeof render === 'function') render();
    return report;
  }

  // Diagnostic: where do bad-looking ingredient names actually live? Run this
  // from the console if a name shows up in your UI but the dry-run report
  // doesn't mention it — it'll point you at the right table to migrate.
  function whereDoesIngredientLive(needle) {
    const hits = { recipes: [], inventory: [], ingredientKnowledge: [], customIngredientImages: [] };
    const matches = (s) => {
      if (!s) return false;
      if (needle) return String(s).toLowerCase().includes(String(needle).toLowerCase());
      return /^[\-:–—]/.test(s) || /^\d+$/.test(s) || /-Oz|–\d|^\:/i.test(s);
    };
    for (const r of (state.recipes || [])) {
      for (const row of (r.ingredientsRows || [])) {
        if (matches(row.name)) hits.recipes.push({ recipeId: r.id, recipeTitle: r.title, name: row.name });
      }
    }
    for (const i of (state.inventory || [])) {
      if (matches(i.name)) hits.inventory.push({ id: i.id, name: i.name });
    }
    for (const k of (state.ingredientKnowledge || [])) {
      if (matches(k.name)) hits.ingredientKnowledge.push({ id: k.id, name: k.name });
    }
    if (typeof customIngredientImages !== 'undefined' && customIngredientImages) {
      for (const key of Object.keys(customIngredientImages)) {
        if (matches(key)) hits.customIngredientImages.push(key);
      }
    }
    console.log(`Hits${needle ? ' for "' + needle + '"' : ' (default: malformed names)'}:`);
    console.log(`  recipes: ${hits.recipes.length}`);
    hits.recipes.slice(0, 20).forEach(h => console.log(`    [${h.recipeTitle}] "${h.name}"`));
    if (hits.recipes.length > 20) console.log(`    ... and ${hits.recipes.length - 20} more`);
    console.log(`  inventory: ${hits.inventory.length}`);
    hits.inventory.slice(0, 20).forEach(h => console.log(`    "${h.name}" (id=${h.id})`));
    console.log(`  ingredientKnowledge: ${hits.ingredientKnowledge.length}`);
    hits.ingredientKnowledge.slice(0, 20).forEach(h => console.log(`    "${h.name}" (id=${h.id})`));
    console.log(`  customIngredientImages: ${hits.customIngredientImages.length}`);
    hits.customIngredientImages.slice(0, 20).forEach(k => console.log(`    "${k}"`));
    return hits;
  }

  window.migrateIngredients = migrateIngredients;
  window.whereDoesIngredientLive = whereDoesIngredientLive;
  // Convenience aliases
  window.dryRunIngredientMigration = () => migrateIngredients({ dryRun: true });
  window.runIngredientMigration = () => migrateIngredients({ dryRun: false });
})();
