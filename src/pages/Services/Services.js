import React from "react";
import { Link, useParams } from "react-router-dom";
import "./services.css";

import servicesData from "../../assets/info/services_full.json";
import { AutoEntitySections, DetailTopBlock, getItemCode, getItemName, getPreviewText, getPrimaryImage } from "../../utils/cms";

const SERVICES = Array.isArray(servicesData?.items) ? servicesData.items : [];

export function ServiceDetail() {
  const { slug } = useParams();
  const item = SERVICES.find((entry) => getItemCode(entry) === slug);

  if (!item) {
    return (
      <section className="svc">
        <div className="svc__container">
          <div className="svc__hero">
            <div className="svc__breadcrumbs">
              <Link to="/" className="svc__bcLink">Главная</Link>
              <span className="svc__bcSep">/</span>
              <Link to="/services" className="svc__bcLink">Услуги</Link>
            </div>
            <h1 className="svc__title">Услуга не найдена</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="svc">
      <div className="svc__container">
        <div style={{ padding: "24px 0 56px" }}>
          <DetailTopBlock item={item} backLabel="Услуги" backTo="/services" />
          <AutoEntitySections item={item} />
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
            <Link to="/" className="svc__bcLink">Главная</Link>
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
                      <img src={image} alt={name} className="svcCard__img" />
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