(async () => {
  'use strict';
  const uncertaintyItems = [...document.querySelectorAll('[data-uncertainty-step]')];
  const filterButtons = [...document.querySelectorAll('[data-uncertainty-filter]')];
  for (const button of filterButtons) button.addEventListener('click', () => {
    const filter = button.dataset.uncertaintyFilter;
    for (const item of uncertaintyItems) item.hidden = filter !== 'all' && item.dataset.uncertaintyStep !== filter;
    for (const candidate of filterButtons) candidate.setAttribute('aria-pressed', String(candidate === button));
    const shown = uncertaintyItems.filter(item => !item.hidden).length;
    document.querySelector('#uncertainty-count').textContent = `Showing ${shown} of ${uncertaintyItems.length} uncertainties.`;
  });
  try {
    const response = await fetch('review-data.json', {cache: 'no-cache'});
    if (!response.ok) throw new Error('Snapshot data HTTP ' + response.status);
    const data = await response.json();
    if (data.fabricationReady || data.fullBoardComplete || data.electricalOperationVerified) throw new Error('Review template requires explicit revision before a release claim');
    const values = {...data, dimensions: data.boardMm.join(' × '), ignoredCount: data.ignoredChecks.length, exclusionCount: data.drcExclusions.length};
    for (const node of document.querySelectorAll('[data-field]')) {
      if (values[node.dataset.field] === undefined) throw new Error('Missing snapshot field: ' + node.dataset.field);
      node.textContent = values[node.dataset.field];
    }
    document.querySelector('#routed-signals').textContent = data.routedSignals.join(', ');
    document.querySelector('#remaining-nets').textContent = Object.entries(data.remainingByNet).map(([name, count]) => `${name}: ${count}`).join(' · ');
    window.FPGA_REVIEW = Object.freeze({data, getState: () => ({loaded: true, boardSha256: data.boardSha256, fabricationReady: false})});
    document.documentElement.dataset.reviewReady = 'true';
  } catch (error) {
    document.querySelector('#load-error').hidden = false;
    console.error(error);
  }
})();
