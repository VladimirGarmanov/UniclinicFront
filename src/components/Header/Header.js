import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import "./header.css";

import logoImg from "../../assets/components/header_logo.png";
import yandexBadgeImg from "../../assets/components/good-place.png";
import iconWhatsappImg from "../../assets/components/whatsapp.png";
import iconTelegramImg from "../../assets/components/telegram.png";
import iconEyeImg from "../../assets/components/eye.png";
import iconSearchImg from "../../assets/components/search.png";

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
  {
    type: "link",
    to: "/technologies",
    label: "Лечение",
  },
  {
    type: "external",
    href: "https://t.me/your_bot_username",
    label: "Онлайн консультация онколога, хирурга, колопроктолога",
  },
  {
    type: "link",
    to: "/clinicalcases",
    label: "Истории пациентов",
  },
  {
    type: "link",
    to: "/questions",
    label: "Вопрос-ответ",
  },
  {
    type: "link",
    to: "/articles",
    label: "Статьи",
  },
  {
    type: "link",
    to: "/licenses",
    label: "Лицензии",
  },
  {
    type: "link",
    to: "/fecal-incontinence-scale",
    label: "Шкала для оценки уровня анального недержания (кала)",
  },
  {
    type: "link",
    to: "/need-proctologist-consultation",
    label: "Нужна ли вам консультация проктолога?",
  },
];

export default function Header() {
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
        !event.target.closest(".hdrBurger")
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

  function closeAllMenus() {
    setIsPatientsOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobilePatientsOpen(false);
  }

  function renderPatientsDropdownItem(item, mobile = false) {
    if (item.type === "external") {
      return (
        <a
          key={item.label}
          className={mobile ? "hdrMobileDropdownLink" : "hdrPatientsDropdownLink"}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          onClick={closeAllMenus}
        >
          {item.label}
        </a>
      );
    }

    return (
      <NavLink
        key={item.label}
        to={item.to}
        className={({ isActive }) =>
          `${mobile ? "hdrMobileDropdownLink" : "hdrPatientsDropdownLink"} ${
            isActive ? "isActive" : ""
          }`
        }
        onClick={closeAllMenus}
      >
        {item.label}
      </NavLink>
    );
  }

  return (
    <header className="hdr">
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
        <div className="hdrTop">
          <div className="hdrContainer hdrTopInner">
            <div className="hdrTopText">
              Запишитесь на бесплатную онлайн-консультацию!
            </div>
            <a className="hdrTopLink" href="/about">
              Подробнее
            </a>
          </div>
        </div>

        <div className="hdrMid">
          <div className="hdrContainer hdrMidInner">
            <nav className="hdrMenu" aria-label="Навигация">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={!!item.end}
                  className={({ isActive }) =>
                    `hdrMenuLink ${isActive ? "isActive" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div
                ref={patientsMenuRef}
                className={`hdrPatientsMenu ${isPatientsOpen ? "isOpen" : ""}`}
              >
                <button
                  type="button"
                  className={`hdrMenuLink hdrMenuLink--dropdown ${
                    isPatientsOpen ? "isActive" : ""
                  }`}
                  aria-haspopup="true"
                  aria-expanded={isPatientsOpen}
                  onClick={() => setIsPatientsOpen((prev) => !prev)}
                >
                  Пациентам <span className="hdrCaret">▾</span>
                </button>

                {isPatientsOpen && (
                  <div className="hdrPatientsDropdown" role="menu">
                    {patientsDropdownItems.map((item) =>
                      renderPatientsDropdownItem(item)
                    )}
                  </div>
                )}
              </div>
            </nav>

            <div className="hdrMidRight">
              <a className="hdrPhone" href="tel:+79671367706">
                +7 (967)136 77
                <br />
                06
              </a>

              <div className="hdrIcons">
                <a
                  className="hdrIconBtn"
                  href="https://wa.me/79671367706"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                >
                  <img className="hdrIconImg" src={iconWhatsappImg} alt="" />
                </a>

                <a
                  className="hdrIconBtn"
                  href="https://t.me/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                >
                  <img className="hdrIconImg" src={iconTelegramImg} alt="" />
                </a>

                <button
                  className="hdrIconBtn"
                  type="button"
                  aria-label="Версия для слабовидящих"
                >
                  <img className="hdrIconImg" src={iconEyeImg} alt="" />
                </button>

                <button className="hdrIconBtn" type="button" aria-label="Поиск">
                  <img className="hdrIconImg" src={iconSearchImg} alt="" />
                </button>

                <button
                  className="hdrBurger"
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

      <div className="hdrBot">
        <div className="hdrContainer hdrBotInner">
          <div className="hdrBrand">
            <img className="hdrLogo" src={logoImg} alt="Логотип" />

            <div className="hdrTitleBlock">
              <div className="hdrTitle">
                ОТДЕЛЕНИЕ
                <br />
                ХИРУРГИИ
              </div>
              <div className="hdrSub">МНОЦ МГУ имени М. В. Ломоносова</div>
            </div>
          </div>

          <div className="hdrInfo">
            <img className="hdrYandexImg" src={yandexBadgeImg} alt="Яндекс" />

            <div className="hdrMetro">
              <div className="hdrMetroRow">
                <span className="hdrDot hdrDot--red" />
                <span className="hdrMetroText">Метро «Университет»</span>

                <span className="hdrMetroGap" />

                <span className="hdrDot hdrDot--yellow" />
                <span className="hdrMetroText">
                  Метро «Ломоносовский пр-кт»
                </span>
              </div>

              <div className="hdrAddr">
                Москва, Ломоносовский пр-кт 27, 10
              </div>
              <div className="hdrHours">Пн-Пт: 8:00 – 17:00</div>
            </div>
          </div>

          <a className="hdrCta" href="/online">
            Онлайн запись
          </a>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="hdrMobileOverlay">
          <div className="hdrMobileSheet" ref={mobileMenuRef}>
            <div className="hdrMobileTop">
              <div className="hdrMobileTitle">Меню</div>
              <button
                className="hdrMobileClose"
                type="button"
                onClick={closeAllMenus}
                aria-label="Закрыть меню"
              >
                ✕
              </button>
            </div>

            <div className="hdrMobileBody">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={!!item.end}
                  className={({ isActive }) =>
                    `hdrMobileLink ${isActive ? "isActive" : ""}`
                  }
                  onClick={closeAllMenus}
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="hdrMobileDrop">
                <button
                  type="button"
                  className={`hdrMobileLink hdrMobileDropBtn ${
                    isMobilePatientsOpen ? "isActive" : ""
                  }`}
                  onClick={() => setIsMobilePatientsOpen((prev) => !prev)}
                >
                  Пациентам <span className="hdrCaret">▾</span>
                </button>

                {isMobilePatientsOpen && (
                  <div className="hdrMobileDropdown">
                    {patientsDropdownItems.map((item) =>
                      renderPatientsDropdownItem(item, true)
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