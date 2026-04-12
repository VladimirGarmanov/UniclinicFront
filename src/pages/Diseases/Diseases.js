import React from "react";
import { Link, useParams } from "react-router-dom";
import "./diseases.css";

import diseasesData from "../../assets/info/diseases_full.json";
import { AutoEntitySections, DetailTopBlock, getItemCode, getItemName } from "../../utils/cms";

const DISEASES = Array.isArray(diseasesData?.items) ? diseasesData.items : [];

function getFirstLetter(name = "") {
  return String(name).trim().charAt(0).toUpperCase();
}

function getGroupedDiseases(items) {
  const map = new Map();

  items.forEach((item) => {
    const name = getItemName(item);
    const letter = getFirstLetter(name);
    if (!letter) return;

    if (!map.has(letter)) {
      map.set(letter, []);
    }

    map.get(letter).push(item);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b, "ru"))
    .map(([letter, groupItems]) => ({
      letter,
      items: groupItems.sort((a, b) =>
        getItemName(a).localeCompare(getItemName(b), "ru")
      ),
    }));
}

export function DiseaseDetail() {
  const { slug } = useParams();
  const item = DISEASES.find((entry) => getItemCode(entry) === slug);

  if (!item) {
    return (
      <section className="dsg">
        <div className="dsg__container">
          <div className="dsg__hero">
            <div className="dsg__breadcrumbs">
              <Link to="/" className="dsg__bcLink">Главная</Link>
              <span className="dsg__bcSep">/</span>
              <Link to="/diseases" className="dsg__bcLink">Заболевания</Link>
            </div>
            <h1 className="dsg__title">Заболевание не найдено</h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dsg">
      <div className="dsg__container">
        <div style={{ padding: "24px 0 56px" }}>
          <DetailTopBlock item={item} backLabel="Заболевания" backTo="/diseases" />
          <AutoEntitySections item={item} />
        </div>
      </div>
    </section>
  );
}

export default function Diseases() {
  const groups = getGroupedDiseases(DISEASES);

  return (
    <section className="dsg">
      <div className="dsg__container">
        <div className="dsg__hero">
          <div className="dsg__breadcrumbs">
            <Link to="/" className="dsg__bcLink">Главная</Link>
            <span className="dsg__bcSep">/</span>
            <span className="dsg__bcCurrent">Заболевания</span>
          </div>
          <h1 className="dsg__title">Заболевания</h1>
        </div>

        <main className="dsg__main">
          <div className="dsg__grid">
            {groups.map((group) => (
              <section className="dsgBlock" key={group.letter}>
                <div className="dsgBlock__letter">{group.letter}</div>
                <ul className="dsgBlock__list">
                  {group.items.map((item) => (
                    <li className="dsgBlock__item" key={item?.fields?.ID || getItemCode(item)}>
                      <Link to={`/diseases/${getItemCode(item)}`} className="dsgLink">
                        {getItemName(item)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </main>
      </div>
    </section>
  );
}