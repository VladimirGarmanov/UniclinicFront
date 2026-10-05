import { clinic } from "../../config/site";
import Image from "../Shared/Image";
import React from "react";
import { Link } from "../../utils/router";
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

              <Link reloadDocument className="ftrLink" to="/team">Наша команда</Link>
              <Link reloadDocument className="ftrLink" to="/diseases">Заболевания</Link>
              <Link reloadDocument className="ftrLink" to="/reviews">Отзывы</Link>
              <Link reloadDocument className="ftrLink" to="/questions">Вопросы</Link>
              <Link reloadDocument className="ftrLink" to="/prices">Цены</Link>
              <Link reloadDocument className="ftrLink" to="/clinicalcases">Истории пациентов</Link>
            </div>

            {/* Колонка 2 */}
            <div className="ftrCol">
              <div className="ftrTitle">КЛИНИКА</div>

              <Link reloadDocument className="ftrLink" to="/news">Новости клиники</Link>
              <Link reloadDocument className="ftrLink" to="/articles">Статьи</Link>
              <Link reloadDocument className="ftrLink" to="/contacts">Контакты</Link>

              <Link reloadDocument className="ftrLink" to="/personal-data">Обработка персональных данных</Link>
              <Link reloadDocument className="ftrLink" to="/privacy">Политика конфиденциальности</Link>
              <Link reloadDocument className="ftrLink" to="/licenses">Правовая информация</Link>
            </div>

            {/* Правая часть */}
            <div className="ftrRight">
              <div className="ftrRightHead">
                <Image loading="eager" className="ftrLogo" src={footerLogoImg} alt="Логотип" />

                <div className="ftrRightText">
                  <div className="ftrRightTitle">ОТДЕЛЕНИЕ ХИРУРГИИ</div>
                  <div className="ftrRightSub">МНОЦ МГУ имени М. В. Ломоносова</div>
                </div>
              </div>

              <a className="ftrPhone" href={clinic.phoneHref}>{clinic.phone}</a>
              <a className="ftrEmail" href={`mailto:${clinic.email}`}>{clinic.email}</a>
              <div className="ftrAddr">{clinic.address}</div>

              <div className="ftrSocial">
                <a className="ftrSocBtn" href="https://wa.me/79671367706" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                  <Image className="ftrSocIcon" src={iconWhatsappImg} alt="" />
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

          <Link reloadDocument className="ftrBottomLink" to="/sitemap">Карта сайта</Link>

          <a className="ftrBottomLink ftrBottomLinkRight" href="https://webformula.pro" target="_blank" rel="noreferrer">
            Программирование сайта - webformula.pro
          </a>
        </div>
      </div>
    </footer>
  );
}