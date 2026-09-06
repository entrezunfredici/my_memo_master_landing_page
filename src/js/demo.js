export function initDemoVideo() {
  const facade = document.getElementById('demoVideoFacade');
  if (!facade) return;

  const frame = facade.parentElement;
  const src = facade.dataset.src;

  facade.addEventListener('click', () => {
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;

    frame.replaceChild(video, facade);
    video.play().catch(() => {});
  });
}
