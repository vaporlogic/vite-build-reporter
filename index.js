'use strict';

/**
 * vite-build-reporter v0.9.2 (pre-release)
 *
 * Basic Vite plugin for chunk size reporting.
 * No budget support, no telemetry, no postinstall.
 */

/**
 * @param {object} [options]
 * @param {string} [options.outputDir='dist/reports']
 * @returns {import('vite').Plugin}
 */
function viteBuildReporter(options) {
  options = options || {};

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
          chunks.push({
            name:    fileName,
            sizeKb:  Math.round(Buffer.byteLength(chunk.code || '') / 1024),
            modules: Object.keys(chunk.modules || {}).length,
          });
        }
      }
    },

    closeBundle() {
      var report = {
        generatedAt: new Date().toISOString(),
        durationMs:  Date.now() - startTime,
        chunks,
      };
      // Print summary to stdout
      console.log('\n[vite-build-reporter] Build summary:');
      chunks.forEach(function (c) {
        console.log('  ' + c.name + ' — ' + c.sizeKb + ' kB (' + c.modules + ' modules)');
      });
      return report;
    },
  };
}

module.exports = viteBuildReporter;
