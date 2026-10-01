/* 90-main: boot, start screen */
(function () {
  'use strict';
  const FE = window.FE, { $ } = FE;
  function boot() {
    FE.UI.build();
    const st = new FE.Stage({ scene: $('#scene'), light: $('#light'), fx: $('#fx'), bubbles: $('#bubbles') });
    FE.R.init(st); FE.stage = st;
    const total = FE.plan();
    $('#vtitle').innerHTML = FE.U('{m:May}, {m:Might}, and {m:Could}');
    $('#vtitle').style.cssText = '--fs:96px';
    $('#vsub').innerHTML = FE.U('An adult English class');
    $('#vsub').style.cssText = '--fs:40px';
    $('#goClass').innerHTML = FE.U('Start Class Mode'); $('#goDemo').innerHTML = FE.U('Start Demo Mode');
    $('#goClass').style.setProperty('--fs', '34px'); $('#goDemo').style.setProperty('--fs', '34px');
    const go = (mode) => { $('#startVeil').remove(); FE.R.mode = mode; FE.R.load(0, 0); FE.R.setMode(mode); FE.R.play(); };
    $('#goClass').onclick = () => go('class'); $('#goDemo').onclick = () => go('demo');
    $('#goClass').focus();
    FE.R.load(0, 0); // paint the first frame behind the veil
    window.__total = total;
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else addEventListener('load', boot);
})();
