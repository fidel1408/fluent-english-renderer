/* Should for Advice — boot */
(function (g) {
  'use strict';
  const FE = g.FE;
  FE.finalize();
  FE.ui.build(document.getElementById('root'));
  if (FE.layoutIssues.length) console.warn('LAYOUT ISSUES\n' + FE.layoutIssues.join('\n'));
  g.addEventListener('error', (e) => console.error('window error', e.message));
})(window);
