(()=>{
'use strict';
// Portal auth is now handled by the main app plus the direct recovery layer.
// This file intentionally performs no reloads so two recovery paths cannot
// fight each other and bounce an authorized player back to the PIN screen.
if(!new URLSearchParams(location.search).get('portal'))return;
})();
