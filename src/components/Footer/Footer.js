import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";

// КАРТИНКИ — ТОЛЬКО ИМПОРТЫ. ПУТИ МЕНЯЕШЬ ПОД СЕБЯ.
import footerLogoImg from "../../assets/components/footer_photo.png";
import iconYoutubeImg from "../../assets/components/youtube.png";
import iconTelegramImg from "../../assets/components/telegram.png";
import iconWhatsappImg from "../../assets/components/whatsapp.png";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ftr">
      <div className="ftrTop">
        <div className="ftrContainer">
          <div className="ftrGrid">
            {/* Колонка 1 */}
            <div className="ftrCol">
              <div className="ftrTitle">ИНФОРМАЦИЯ</div>

              <Link className="ftrLink" to="/team">Наша команда</Link>
              <Link className="ftrLink" to="/diseases">Заболевания</Link>
              <Link className="ftrLink" to="/reviews">Отзывы</Link>
              <Link className="ftrLink" to="/faq">Вопросы</Link>
              <Link className="ftrLink" to="/prices">Цены</Link>
              <Link className="ftrLink" to="/video">Видео</Link>
              <Link className="ftrLink" to="/stories">Истории пациентов</Link>
            </div>

            {/* Колонка 2 */}
            <div className="ftrCol">
              <div className="ftrTitle">КЛИНИКА</div>

              <Link className="ftrLink" to="/about">О клинике</Link>
              <Link className="ftrLink" to="/news">Новости клиники</Link>
              <Link className="ftrLink" to="/articles">Статьи</Link>
              <Link className="ftrLink" to="/contacts">Контакты</Link>

              <Link className="ftrLink" to="/personal-data">Обработка персональных данных</Link>
              <Link className="ftrLink" to="/privacy">Политика конфиденциальности</Link>
              <Link className="ftrLink" to="/licenses">Правовая информация</Link>
            </div>

            {/* Правая часть */}
            <div className="ftrRight">
              <div className="ftrRightHead">
                <img className="ftrLogo" src={footerLogoImg} alt="Логотип" />

                <div className="ftrRightText">
                  <div className="ftrRightTitle">ОТДЕЛЕНИЕ ХИРУРГИИ</div>
                  <div className="ftrRightSub">МНОЦ МГУ имени М. В. Ломоносова</div>
                </div>
              </div>

              <a className="ftrPhone" href="tel:+79671367706">+7 (967)136 77 06</a>
              <a className="ftrEmail" href="mailto:info@uniclinic.pro">info@uniclinic.pro</a>
              <div className="ftrAddr">Москва, Ломоносовский пр-кт 27, 10</div>

              <div className="ftrSocial">
                <a className="ftrSocBtn" href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                  <img className="ftrSocIcon" src={iconYoutubeImg} alt="" />
                </a>
                <a className="ftrSocBtn" href="https://t.me" target="_blank" rel="noreferrer" aria-label="Telegram">
                  <img className="ftrSocIcon" src={iconTelegramImg} alt="" />
                </a>
                <a className="ftrSocBtn" href="https://wa.me/79671367706" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                  <img className="ftrSocIcon" src={iconWhatsappImg} alt="" />
                </a>
              </div>
            </div>
          </div>

          <div className="ftrLine" />
        </div>
      </div>

      <div className="ftrBottom">
        <div className="ftrContainer ftrBottomRow">
          <div className="ftrBottomText">
            © {year} Отделение хирургии университетской клиники МГУ им. М.В. Ломоносова
          </div>

          <Link className="ftrBottomLink" to="/sitemap">Карта сайта</Link>

          <a className="ftrBottomLink ftrBottomLinkRight" href="https://webformula.pro" target="_blank" rel="noreferrer">
            Программирование сайта - webformula.pro
          </a>
        </div>
      </div>
    </footer>
  );
}