import { useEffect } from "react";

export default function ImageLightbox({ images, index, onClose, onNavigate }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        onNavigate((index - 1 + images.length) % images.length);
      } else if (event.key === "ArrowRight") {
        onNavigate((index + 1) % images.length);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [index, images.length, onClose, onNavigate]);

  return (
    <div
      className="lightbox-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="圖片放大檢視"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <button type="button" className="lightbox-close-btn" aria-label="關閉" onClick={onClose}>
        ×
      </button>
      {images.length > 1 && (
        <button
          type="button"
          className="gallery-nav-btn prev"
          aria-label="上一張圖片"
          onClick={() => onNavigate((index - 1 + images.length) % images.length)}
        >
          ‹
        </button>
      )}
      <img src={images[index]} alt={`圖片 ${index + 1}`} />
      {images.length > 1 && (
        <button
          type="button"
          className="gallery-nav-btn next"
          aria-label="下一張圖片"
          onClick={() => onNavigate((index + 1) % images.length)}
        >
          ›
        </button>
      )}
      <div className="lightbox-counter">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
