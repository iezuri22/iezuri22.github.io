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

    // --- Print summary -------------------------------------------------
    const tag = dryRun ? '[DRY-RUN]' : '[APPLY]';
    console.log(`${tag} Ingredient migration scan complete`);
    console.log(`  Library: ${report.library.scanned} scanned`);
    console.log(`    - rename: ${report.library.renamed.length}`);
    console.log(`    - orphan/delete: ${report.library.orphaned.length}`);
    console.log(`    - merge groups: ${report.library.merged.length}`);
    console.log(`    - unchanged: ${report.library.unchanged}`);
    console.log(`  Recipes: ${report.recipes.scanned} scanned, ${report.recipes.rowsChanged.length} need ingredient row updates, ${report.recipes.rowsDropped} rows dropped`);

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

    console.log('Migration applied.');
    if (typeof render === 'function') render();
    return report;
  }

  window.migrateIngredients = migrateIngredients;
  // Convenience aliases
  window.dryRunIngredientMigration = () => migrateIngredients({ dryRun: true });
  window.runIngredientMigration = () => migrateIngredients({ dryRun: false });
})();
