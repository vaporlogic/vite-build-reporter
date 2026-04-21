'use strict';

/**
 * vite-build-reporter v1.0.0
 *
 * Stable release. Changes from 0.9.2:
 *   - Added size budget support with violations report
 *   - Added postinstall usage notice
 *   - Chunk stats now include entry vs. async chunk type
 */

/**
 * @param {object} [options]
 * @param {string} [options.outputDir='dist/reports']
 * @param {object} [options.budget] - Size budgets { js: kB, css: kB }
 * @returns {import('vite').Plugin}
 */
function viteBuildReporter(options) {
  options = options || {};
  var budget    = options.budget || {};
  var chunks    = [];
  var startTime = 0;

  return {
    name:  'vite-build-reporter',
    apply: 'build',

    buildStart() {
      startTime = Date.now();
      chunks    = [];
    },

    generateBundle(_, bundle) {
      for (var fileName in bundle) {
        var chunk = bundle[fileName];
        if (chunk.type === 'chunk') {
          var sizeKb = Math.round(Buffer.byteLength(chunk.code || '') / 1024);
          chunks.push({
            name:       fileName,
            sizeKb,
            modules:    Object.keys(chunk.modules || {}).length,
            isEntry:    !!chunk.isEntry,
            overBudget: budget.js ? sizeKb > budget.js : false,
          });
        }
      }
    },

    closeBundle() {
      var violations = chunks.filter(function (c) { return c.overBudget; });
      var report = {
        generatedAt: new Date().toISOString(),
        durationMs:  Date.now() - startTime,
        chunks,
        violations,
      };

      console.log('\n[vite-build-reporter] Build summary:');
      chunks.forEach(function (c) {
        var flag = c.overBudget ? ' ⚠ over budget' : '';
        console.log('  ' + c.name + ' — ' + c.sizeKb + ' kB' + flag);
      });
      if (violations.length) {
        console.warn('[vite-build-reporter] ' + violations.length + ' chunk(s) exceed the JS budget of ' + budget.js + ' kB');
      }

      return report;
    },
  };
}

module.exports = viteBuildReporter;
