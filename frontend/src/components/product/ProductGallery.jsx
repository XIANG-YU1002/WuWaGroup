import { useRef, useState } from "react";
import ImageLightbox from "../common/ImageLightbox.jsx";

export default function ProductGallery({ images, alt }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef(null);

  const count = images.length;

  function goTo(index) {
    setActiveIndex((index + count) % count);
  }

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      goTo(activeIndex + (deltaX < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  }

  return (
    <div className="gallery">
      <div
        className="gallery-main"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[activeIndex]}
          alt={alt}
          onClick={() => setLightboxOpen(true)}
        />
        {count > 1 && (
          <>
            <button
              type="button"
              className="gallery-nav-btn prev"
              aria-label="上一張圖片"
              onClick={() => goTo(activeIndex - 1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="gallery-nav-btn next"
              aria-label="下一張圖片"
              onClick={() => goTo(activeIndex + 1)}
            >
              ›
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="gallery-thumbs">
          {images.map((image, index) => (
            <img
              key={image + index}
              src={image}
              alt={`${alt} 縮圖 ${index + 1}`}
              className={index === activeIndex ? "active" : ""}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          index={activeIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={goTo}
        />
      )}
    </div>
  );
}
