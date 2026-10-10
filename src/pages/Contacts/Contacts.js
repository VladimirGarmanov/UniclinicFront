import AppointmentForm from "../../components/Shared/AppointmentForm";
import Image from "../../components/Shared/Image";
import { clinic } from "../../config/site";
import React from "react";
import { Link } from "../../utils/router";
import "./contacts.css";

export default function ContactsPage() {
  return (
    <section className="contactsPage">
      <div className="contactsContainer">
        <div className="contactsHead">
          <div className="contactsBreadcrumbs">
            <Link reloadDocument to="/" className="contactsBreadcrumbLink">
              Главная
            </Link>
            <span className="contactsBreadcrumbSep">/</span>
            <span className="contactsBreadcrumbCurrent">Контакты</span>
          </div>

          <h1 className="contactsTitle">Контакты</h1>
          <p className="contactsLead">
            Медицинский научно-образовательный центр МГУ имени М.В. Ломоносова.
            Здесь вы можете посмотреть адрес, контакты и маршрут до клиники.
          </p>
        </div>

        <div className="contactsTopGrid">
          <div className="contactsMainCard">
            <div className="contactsCardHeader">
              <h2 className="contactsCardTitle">Как нас найти</h2>
              <p className="contactsCardText">
                Университетская клиника МНОЦ МГУ имени М.В. Ломоносова
              </p>
            </div>

            <div className="contactsInfoGrid">
              <div className="contactsInfoItem">
                <div className="contactsInfoLabel">Адрес</div>
                <div className="contactsInfoValue">
                  {clinic.address}
                </div>
              </div>

              <div className="contactsInfoItem">
                <div className="contactsInfoLabel">Телефон</div>
                <a href={clinic.phoneHref} className="contactsInfoLink">
                  {clinic.phone}
                </a>
              </div>

              <div className="contactsInfoItem">
                <div className="contactsInfoLabel">Электронная почта</div>
                <a
                  href={`mailto:${clinic.email}`}
                  className="contactsInfoLink"
                >
                  {clinic.email}
                </a>
              </div>

              <div className="contactsInfoItem">
                <div className="contactsInfoLabel">Часы работы</div>
                <div className="contactsInfoValue">
                  {clinic.hours}
                </div>
              </div>
            </div>

            <div className="contactsActions">
              <a
                href="https://yandex.ru/maps/org/mgu_universitetskaya_klinika/1329676122/"
                target="_blank"
                rel="noreferrer"
                className="contactsBtn contactsBtnPrimary"
              >
                Открыть в Яндекс Картах
              </a>

              <a
                href="https://yandex.ru/maps/?rtext=~55.702234,37.530498&rtt=auto"
                target="_blank"
                rel="noreferrer"
                className="contactsBtn contactsBtnSecondary"
              >
                Построить маршрут
              </a>
            </div>
          </div>

          <aside className="contactsSideCard">
            <h2 className="contactsCardTitle">Как добраться</h2>

            <div className="contactsRouteList">
              <div className="contactsRouteItem">
                <div className="contactsRouteStep">1</div>
                <div className="contactsRouteContent">
                  <div className="contactsRouteTitle">
                    От метро «Ломоносовский проспект»
                  </div>
                  <div className="contactsRouteText">
                    <a href="https://yandex.ru/maps/?rtext=метро%20Ломоносовский%20проспект~55.702234,37.530498&rtt=pd" target="_blank" rel="noopener noreferrer">Пеший маршрут от метро «Ломоносовский проспект» до корпуса 10</a>. Актуальное время в пути указано на карте.
                  </div>
                </div>
              </div>

              <div className="contactsRouteItem">
                <div className="contactsRouteStep">2</div>
                <div className="contactsRouteContent">
                  <div className="contactsRouteTitle">От метро «Университет»</div>
                  <div className="contactsRouteText">
                    <a href="https://yandex.ru/maps/?rtext=метро%20Университет%20Москва~55.702234,37.530498&rtt=pd" target="_blank" rel="noopener noreferrer">Пеший маршрут от метро «Университет» до корпуса 10</a>. Выберите удобный выход и проверьте маршрут перед визитом.
                  </div>
                </div>
              </div>

              <div className="contactsRouteItem">
                <div className="contactsRouteStep">3</div>
                <div className="contactsRouteContent">
                  <div className="contactsRouteTitle">На автомобиле</div>
                  <div className="contactsRouteText">
                    Удобнее всего ехать по Ломоносовскому проспекту. Точный
                    маршрут лучше открыть через Яндекс Карты, чтобы сразу учесть
                    пробки и подъезд к корпусу.
                  </div>
                </div>
              </div>
            </div>

            <div className="contactsNote">
              Перед визитом лучше заранее позвонить и уточнить схему прохода,
              отделение и время приёма.
            </div>
          </aside>
        </div>

        {clinic.contactPhotos.length > 0 && <section className="contentPanel"><h2>Корпус и вход в клинику</h2>
          {clinic.contactPhotos.map(photo => <figure key={photo.src}><Image src={photo.src} alt={photo.description} /><figcaption>{photo.description}</figcaption></figure>)}
        </section>}
        <div className="contactsMapCard">
          <div className="contactsMapHeader">
            <h2 className="contactsCardTitle">Карта</h2>
          </div>

          <div className="contactsMapWrap">
            <iframe loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
              title="Карта МНОЦ МГУ"
              src="https://yandex.ru/map-widget/v1/?ll=37.530498%2C55.702234&mode=search&oid=1329676122&ol=biz&z=17"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>



      </div>
    <AppointmentForm />
</section>
  );
}
