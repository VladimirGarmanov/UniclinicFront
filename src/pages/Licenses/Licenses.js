import Image from "../../components/Shared/Image";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "../../utils/router";
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
  const dialogRef = useRef(null);
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
    const previousFocus = document.activeElement;
    dialogRef.current?.querySelector("button")?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Tab") {
        const buttons = [...dialogRef.current.querySelectorAll('button, a[href], [tabindex="0"]')];
        const first = buttons[0], last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!currentItem) return null;

  return (
    <div ref={dialogRef} className="licModal" role="dialog" aria-modal="true" aria-label={currentTitle}>
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
              <Image src={currentImage} alt={currentTitle} className="licModalImage" />
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
            <Link reloadDocument to="/" className="licCrumbLink">
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
                      <Image src={preview} alt={title} className="licImage" />
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