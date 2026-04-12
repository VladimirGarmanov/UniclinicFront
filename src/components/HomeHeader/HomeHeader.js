import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./homeheader.css";

const navItems = [
  { to: "/", label: "Главная", end: true },
  { to: "/team", label: "Команда" },
  { to: "/technologies", label: "Технологии" },
  { to: "/prices", label: "Цены" },
  { to: "/services", label: "Услуги" },
  { to: "/diseases", label: "Заболевания" },
  { to: "/reviews", label: "Отзывы" },
  { to: "/contacts", label: "Контакты" },
];

const patientsDropdownItems = [
  { type: "link", to: "/about", label: "О клинике" },
  { type: "link", to: "/news", label: "Новости" },
  { type: "link", to: "/articles", label: "Статьи" },
];

export default function HomeHeader() {
  const stickyShellRef = useRef(null);
  const patientsMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const [isStuck, setIsStuck] = useState(false);
  const [stickyH, setStickyH] = useState(0);
  const [isPatientsOpen, setIsPatientsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobilePatientsOpen, setIsMobilePatientsOpen] = useState(false);

  useEffect(() => {
    const el = stickyShellRef.current;
    if (!el) return;

    const measure = () => setStickyH(el.offsetHeight);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const onScroll = () => {
      setIsStuck(window.scrollY > 0);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (
        patientsMenuRef.current &&
        !patientsMenuRef.current.contains(event.target)
      ) {
        setIsPatientsOpen(false);
      }

      if (
        mobileMenuRef.current &&
        isMobileMenuOpen &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".hhBurger")
      ) {
        setIsMobileMenuOpen(false);
        setIsMobilePatientsOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsPatientsOpen(false);
        setIsMobileMenuOpen(false);
        setIsMobilePatientsOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  function closeMenus() {
    setIsPatientsOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobilePatientsOpen(false);
  }

  function renderPatientsItem(item, mobile = false) {
    return (
      <Link
        key={item.label}
        to={item.to}
        className={mobile ? "hhMobileDropdownLink" : "hhDropLink"}
        onClick={closeMenus}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <header className="hh">
      {isStuck ? <div style={{ height: stickyH }} /> : null}

      <div
        ref={stickyShellRef}
        style={
          isStuck
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10050,
              }
            : {
                position: "static",
              }
        }
      >
        <div className="hhTop">
          <div className="hhTopInner">
            <div className="hhTopText">
              Запишитесь на бесплатную онлайн-консультацию!
            </div>
            <a className="hhTopLink" href="#consult">
              Подробнее
            </a>
          </div>
        </div>

        <div className="hhNav">
          <div className="hhNavInner">
            <nav className="hhMenu">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={!!item.end}
                  className={({ isActive }) =>
                    "hhItem" + (isActive ? " isActive" : "")
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div
                ref={patientsMenuRef}
                className={`hhDrop ${isPatientsOpen ? "isOpen" : ""}`}
              >
                <button
                  type="button"
                  className={`hhItem hhDropBtn ${isPatientsOpen ? "isActive" : ""}`}
                  onClick={() => setIsPatientsOpen((prev) => !prev)}
                >
                  Пациентам ▾
                </button>

                {isPatientsOpen && (
                  <div className="hhDropMenu">
                    {patientsDropdownItems.map((item) => renderPatientsItem(item))}
                  </div>
                )}
              </div>
            </nav>

            <div className="hhRight">
              <a className="hhPhone" href="tel:+79671367706">
                +7 (967)136 77 06
              </a>

              <div className="hhIcons">
                <a className="hhIcon" href="https://wa.me/" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                  WA
                </a>
                <a className="hhIcon" href="https://vk.com/" target="_blank" rel="noreferrer" aria-label="VK">
                  VK
                </a>
                <a className="hhIcon" href="https://t.me/" target="_blank" rel="noreferrer" aria-label="Telegram">
                  TG
                </a>
                <button className="hhIconBtn" type="button" aria-label="Search">
                  🔍
                </button>
                <button
                  className="hhBurger"
                  type="button"
                  aria-label="Открыть меню"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="hhMobileOverlay">
          <div className="hhMobileSheet" ref={mobileMenuRef}>
            <div className="hhMobileTop">
              <div className="hhMobileTitle">Меню</div>
              <button
                className="hhMobileClose"
                type="button"
                onClick={closeMenus}
              >
                ✕
              </button>
            </div>

            <div className="hhMobileBody">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={!!item.end}
                  className={({ isActive }) =>
                    `hhMobileLink ${isActive ? "isActive" : ""}`
                  }
                  onClick={closeMenus}
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="hhMobileDrop">
                <button
                  type="button"
                  className={`hhMobileLink hhMobileDropBtn ${
                    isMobilePatientsOpen ? "isActive" : ""
                  }`}
                  onClick={() => setIsMobilePatientsOpen((prev) => !prev)}
                >
                  Пациентам ▾
                </button>

                {isMobilePatientsOpen && (
                  <div className="hhMobileDropdown">
                    {patientsDropdownItems.map((item) =>
                      renderPatientsItem(item, true)
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}