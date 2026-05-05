import React from "react";
import { Link, useParams } from "react-router-dom";
import "./services.css";

import servicesData from "../../assets/info/services_full.json";
import {
  AutoEntitySections,
  getItemCode,
  getItemName,
  getPreviewText,
  getPrimaryImage,
} from "../../utils/cms";

const SERVICES = Array.isArray(servicesData?.items) ? servicesData.items : [];
const CONSULTATION_BOT_URL = "https://t.me/surgerymgu_bot";

function isOnlineConsultation(item) {
  return getItemCode(item) === "onlayn-konsultirovanie";
}

function replaceLegacyConsultationButton(html = "") {
  return String(html)
    .replace(
      /<button\b[^>]*class=(["'])[^"']*btn-consultation[^"']*\1[^>]*>[\s\S]*?<\/button>/gi,
      `<a class="svcTelegramButton" href="${CONSULTATION_BOT_URL}" target="_blank" rel="noreferrer">Записаться на консультацию</a>`
    )
    .replace(
      /<button\b[^>]*>[\s\S]*?Записаться на консультацию[\s\S]*?<\/button>/gi,
      `<a class="svcTelegramButton" href="${CONSULTATION_BOT_URL}" target="_blank" rel="noreferrer">Записаться на консультацию</a>`
    )
    .replace(/\s*v-on:click=(["'])openHeaderDialog\1/gi, "")
    .replace(/<\.p>/gi, "</p>");
}

function prepareServiceItemForRender(item) {
  if (!isOnlineConsultation(item)) {
    return item;
  }

  const preparedItem = structuredClone(item);

  if (preparedItem?.properties?.COMMON_TEXT) {
    delete preparedItem.properties.COMMON_TEXT;
  }

  const parts = preparedItem?.properties?.PARTS?.values;

  if (Array.isArray(parts)) {
    preparedItem.properties.PARTS.values = parts.map((part) => {
      const text = part?.value?.TEXT;

      if (typeof text !== "string") {
        return part;
      }

      return {
        ...part,
        value: {
          ...part.value,
          TEXT: replaceLegacyConsultationButton(text),
        },
      };
    });
  }

  return preparedItem;
}

export function ServiceDetail() {
  const { slug } = useParams();
  const item = SERVICES.find((entry) => getItemCode(entry) === slug);

  if (!item) {
    return (
      <section className="svc">
        <div className="svc__container">
          <div className="svc__hero">
            <div className="svc__breadcrumbs">
              <Link to="/" className="svc__bcLink">
                Главная
              </Link>
              <span className="svc__bcSep">/</span>
              <Link to="/services" className="svc__bcLink">
                Услуги
              </Link>
            </div>
            <h1 className="svc__title">Услуга не найдена</h1>
          </div>
        </div>
      </section>
    );
  }

  const image = getPrimaryImage(item);
  const name = getItemName(item);
  const previewText = getPreviewText(item);
  const preparedItem = prepareServiceItemForRender(item);
  const showConsultationButton = isOnlineConsultation(item);

  return (
    <section className="svc">
      <div className="svc__container">
        <div className="svcDetail">
          <div className="svc__breadcrumbs">
            <Link to="/" className="svc__bcLink">
              Главная
            </Link>
            <span className="svc__bcSep">/</span>
            <Link to="/services" className="svc__bcLink">
              Услуги
            </Link>
            <span className="svc__bcSep">/</span>
            <span className="svc__bcCurrent">{name}</span>
          </div>

          <div className="svcDetailHero">
            {image ? (
              <div className="svcDetailHero__media">
                <img src={image} alt={name} className="svcDetailHero__img" />
              </div>
            ) : null}

            <div className="svcDetailHero__text">
              <h1 className="svcDetailHero__title">{name}</h1>

              {previewText ? (
                <p className="svcDetailHero__lead">{previewText}</p>
              ) : null}

              {showConsultationButton ? (
                <a
                  className="svcConsultationButton"
                  href={CONSULTATION_BOT_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Записаться на консультацию
                </a>
              ) : null}
            </div>
          </div>

          <AutoEntitySections item={preparedItem} />
        </div>
      </div>
    </section>
  );
}

export default function Services() {
  return (
    <section className="svc">
      <div className="svc__container">
        <div className="svc__hero">
          <div className="svc__breadcrumbs">
            <Link to="/" className="svc__bcLink">
              Главная
            </Link>
            <span className="svc__bcSep">/</span>
            <span className="svc__bcCurrent">Услуги</span>
          </div>
          <h1 className="svc__title">Услуги</h1>
        </div>

        <main className="svc__main">
          <div className="svc__grid">
            {SERVICES.map((item) => {
              const image = getPrimaryImage(item);
              const desc = getPreviewText(item);
              const code = getItemCode(item);
              const name = getItemName(item);

              return (
                <article className="svcCard" key={item?.fields?.ID || code}>
                  {image ? (
                    <Link to={`/services/${code}`} className="svcCard__mediaBtn">
                      <span className="svcCard__imgWrap">
                        <img src={image} alt={name} className="svcCard__img" />
                      </span>
                      <span className="svcCard__overlay">
                        <span className="svcCard__overlayPill">Подробнее</span>
                      </span>
                    </Link>
                  ) : null}

                  <div className="svcCard__body">
                    <h3 className="svcCard__title">
                      <Link to={`/services/${code}`} className="svcCard__titleLink">
                        {name}
                      </Link>
                    </h3>

                    <p className={`svcCard__desc ${desc ? "" : "svcCard__desc--empty"}`}>
                      {desc}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </section>
  );
}