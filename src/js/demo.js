export function initDemoVideo() {
  document.querySelectorAll('.video-facade').forEach((facade) => {
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
  });
}
