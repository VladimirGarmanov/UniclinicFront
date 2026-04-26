import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./licenses.css";

import licencesData from "../../assets/info/licences_full.json";

const LICENCES = Array.isArray(licencesData?.data?.items)
  ? [...licencesData.data.items].sort(
      (a, b) => Number(a?.sort || 0) - Number(b?.sort || 0)
    )
  : [];

function getLicenceTitle(item, index) {
  const raw = String(item?.name || "").trim();
  if (raw) {
    if (/^\d+$/.test(raw)) return `Лицензия ${raw}`;
    return raw;
  }
  return `Лицензия ${index + 1}`;
}

function getLicencePreview(item) {
  if (item?.preview_picture?.src) return item.preview_picture.src;
  if (item?.detail_picture?.src) return item.detail_picture.src;
  return "";
}

function getLicenceFull(item) {
  if (item?.detail_picture?.src) return item.detail_picture.src;
  if (item?.preview_picture?.src) return item.preview_picture.src;
  return "";
}

function LicenceSlider({ items, startIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const currentItem = items[currentIndex];
  const currentTitle = getLicenceTitle(currentItem, currentIndex);
  const currentImage = getLicenceFull(currentItem);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!currentItem) return null;

  return (
    <div className="licModal" role="dialog" aria-modal="true" aria-label={currentTitle}>
      <div className="licModalBackdrop" onClick={onClose} />

      <div className="licModalContent">
        <button
          type="button"
          className="licModalClose"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>

        {items.length > 1 ? (
          <button
            type="button"
            className="licModalNav licModalNavPrev"
            onClick={goPrev}
            aria-label="Предыдущая лицензия"
          >
            ‹
          </button>
        ) : null}

        <div className="licModalBody">
          <div className="licModalTop">
            <div className="licModalTitle">{currentTitle}</div>
            <div className="licModalCounter">
              {currentIndex + 1} / {items.length}
            </div>
          </div>

          <div className="licModalImageWrap">
            {currentImage ? (
              <img src={currentImage} alt={currentTitle} className="licModalImage" />
            ) : null}
          </div>
        </div>

        {items.length > 1 ? (
          <button
            type="button"
            className="licModalNav licModalNavNext"
            onClick={goNext}
            aria-label="Следующая лицензия"
          >
            ›
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function Licences() {
  const [activeIndex, setActiveIndex] = useState(null);

  const items = useMemo(() => LICENCES, []);

  const openSlider = (index) => {
    setActiveIndex(index);
  };

  const closeSlider = () => {
    setActiveIndex(null);
  };

  return (
    <section className="licPage">
      <div className="licHero">
        <div className="licWrap">
          <div className="licBreadcrumbs">
            <Link to="/" className="licCrumbLink">
              Главная
            </Link>
            <span className="licSep">/</span>
            <span className="licCrumbActive">Лицензии</span>
          </div>

          <h1 className="licH1">Правовая информация и лицензии</h1>
        </div>
      </div>

      <div className="licWrap">
        <div className="licGrid">
          {items.map((item, index) => {
            const title = getLicenceTitle(item, index);
            const preview = getLicencePreview(item);

            return (
              <article className="licCard" key={item?.id || item?.xml_id || index}>
                <button
                  type="button"
                  className="licCardButton"
                  onClick={() => openSlider(index)}
                  aria-label={title}
                  title={title}
                >
                  <div className="licImageBox">
                    {preview ? (
                      <img src={preview} alt={title} className="licImage" />
                    ) : (
                      <div className="licImagePlaceholder" />
                    )}
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </div>

      {activeIndex !== null ? (
        <LicenceSlider items={items} startIndex={activeIndex} onClose={closeSlider} />
      ) : null}
    </section>
  );
}