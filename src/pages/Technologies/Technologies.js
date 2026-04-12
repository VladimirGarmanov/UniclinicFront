import React from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import "./technologies.css";

import technologiesData from "../../assets/info/technologies_full.json";
import { AutoEntitySections, DetailTopBlock, getItemCode, getItemName, getPrimaryImage } from "../../utils/cms";

const TECHNOLOGIES = Array.isArray(technologiesData?.items) ? technologiesData.items : [];

export function TechnologyDetail() {
  const { slug } = useParams();
  const item = TECHNOLOGIES.find((entry) => getItemCode(entry) === slug);

  if (!item) {
    return (
      <section className="techGridWrap">
        <div className="techContainer">
          <div className="techHead">
            <div className="techBreadcrumbs">
              <Link to="/" className="techBreadcrumbLink">Главная</Link>
              <span className="techBreadcrumbSep">/</span>
              <Link to="/technologies" className="techBreadcrumbLink">Технологии</Link>
            </div>
            <h1 className="techTitle">Технология не найдена</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="techGridWrap">
      <div className="techContainer">
        <DetailTopBlock item={item} backLabel="Технологии" backTo="/technologies" />
        <AutoEntitySections item={item} />
      </div>
    </section>
  );
}

export default function Technologies() {
  return (
    <section className="techGridWrap">
      <div className="techContainer">
        <div className="techHead">
          <div className="techBreadcrumbs">
            <Link to="/" className="techBreadcrumbLink">Главная</Link>
            <span className="techBreadcrumbSep">/</span>
            <span className="techBreadcrumbCurrent">Технологии</span>
          </div>
          <h1 className="techTitle">Технологии</h1>
        </div>

        <div className="techGrid" role="list">
          {TECHNOLOGIES.map((item) => {
            const code = getItemCode(item);
            const name = getItemName(item);
            const image = getPrimaryImage(item);

            return (
              <NavLink key={item?.fields?.ID || code} to={`/technologies/${code}`} className="techCard">
                <div className="techMedia">
                  {image ? (
                    <img src={image} alt={name} className="techImg" />
                  ) : null}

                  <div className="techOverlay">
                    <span className="techMore">Подробнее</span>
                  </div>
                </div>

                <div className="techBody">
                  <div className="techCardTitle">{name}</div>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
