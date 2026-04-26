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
  { to: "/about", label: "О клинике" },
  { to: "/news", label: "Новости" },
  { to: "/articles", label: "Статьи" },
];

export default function HomeHeader() {
  const shellRef = useRef(null);
  const desktopDropRef = useRef(null);
  const mobileSheetRef = useRef(null);

  const [isStuck, setIsStuck] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isPatientsOpen, setIsPatientsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobilePatientsOpen, setIsMobilePatientsOpen] = useState(false);

  useEffect(() => {
    const measure = () => {
      if (shellRef.current) {
        setHeaderHeight(shellRef.current.offsetHeight);
      }
    };

    const onScroll = () => {
      setIsStuck(window.scrollY > 0);
    };

    measure();
    onScroll();

    const ro = new ResizeObserver(measure);
    if (shellRef.current) {
      ro.observe(shellRef.current);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (
        desktopDropRef.current &&
        !desktopDropRef.current.contains(event.target)
      ) {
        setIsPatientsOpen(false);
      }

      if (
        isMobileMenuOpen &&
        mobileSheetRef.current &&
        !mobileSheetRef.current.contains(event.target) &&
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

  const closeAllMenus = () => {
    setIsPatientsOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobilePatientsOpen(false);
  };

  return (
    <header className="hh">
      {isStuck ? <div className="hhPlaceholder" style={{ height: headerHeight }} /> : null}

      <div
        ref={shellRef}
        className="hhShell"
        style={
          isStuck
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10050,
              }
            : undefined
        }
      >
        <div className="hhTop">
          <div className="hhTopInner">
            <div className="hhTopText">
              Запишитесь на бесплатную онлайн-консультацию!
            </div>
            <a className="hhTopLink" href="/services/onlayn-konsultirovanie/">
              Подробнее
            </a>
          </div>
        </div>

        <div className="hhNav">
          <div className="hhNavInner">
            <nav className="hhMenu" aria-label="Основная навигация">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={!!item.end}
                  className={({ isActive }) =>
                    `hhItem ${isActive ? "isActive" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div ref={desktopDropRef} className="hhDrop">
                <button
                  type="button"
                  className={`hhItem hhDropBtn ${isPatientsOpen ? "isActive" : ""}`}
                  onClick={() => setIsPatientsOpen((prev) => !prev)}
                >
                  Пациентам <span className="hhCaret">▾</span>
                </button>

                {isPatientsOpen && (
                  <div className="hhDropMenu">
                    {patientsDropdownItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="hhDropLink"
                        onClick={closeAllMenus}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            <div className="hhRight">
              <a className="hhPhone" href="tel:+79671367706">
                +7 (967)136 77 06
              </a>

              <div className="hhIcons">
                <a
                  className="hhIcon"
                  href="https://wa.me/79671367706"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                >
                  WA
                </a>
                <a
                  className="hhIcon"
                  href="https://vk.com/surgerymgy"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="VK"
                >
                  VK
                </a>
                <a
                  className="hhIcon"
                  href="https://t.me/surgerymgu_bot"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                >
                  TG
                </a>

                <button className="hhIconBtn" type="button" aria-label="Поиск">
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
          <div className="hhMobileSheet" ref={mobileSheetRef}>
            <div className="hhMobileTop">
              <div className="hhMobileTitle">Меню</div>
              <button
                className="hhMobileClose"
                type="button"
                aria-label="Закрыть меню"
                onClick={closeAllMenus}
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
                  onClick={closeAllMenus}
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
                  <span>Пациентам</span>
                  <span>{isMobilePatientsOpen ? "−" : "+"}</span>
                </button>

                {isMobilePatientsOpen && (
                  <div className="hhMobileDropdown">
                    {patientsDropdownItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="hhMobileDropdownLink"
                        onClick={closeAllMenus}
                      >
                        {item.label}
                      </Link>
                    ))}
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