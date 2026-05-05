import React from "react";
import { Link, NavLink, useParams } from "react-router-dom";
import "./clinicalcases.css";

import clinicalCasesData from "../../assets/info/clinicalcases_full.json";
import {
  AutoEntitySections,
  getItemCode,
  stripHtml,
} from "../../utils/cms";

const CLINICAL_CASES = Array.isArray(clinicalCasesData?.items)
  ? clinicalCasesData.items
  : [];

function getPreviewPlainText(html = "") {
  return stripHtml(html).trim();
}

function getCaseImage(item) {
  return item?.detail_picture?.src || item?.preview_picture?.src || "";
}

function getCaseTitle(item) {
  return item?.fields?.NAME || "";
}

export function ClinicalCaseDetail() {
  const { slug } = useParams();
  const item = CLINICAL_CASES.find((entry) => getItemCode(entry) === slug);

  if (!item) {
    return (
      <section className="ccWrap">
        <div className="ccContainer">
          <div className="ccHead">
            <div className="ccBreadcrumbs">
              <Link to="/" className="ccBreadcrumbLink">
                Главная
              </Link>
              <span className="ccBreadcrumbSep">/</span>
              <Link to="/clinicalcases" className="ccBreadcrumbLink">
                Истории пациентов
              </Link>
            </div>

            <h1 className="ccTitle">История пациента не найдена</h1>
          </div>
        </div>
      </section>
    );
  }

  const image = getCaseImage(item);
  const title = getCaseTitle(item);
  const previewText = getPreviewPlainText(item?.fields?.PREVIEW_TEXT || "");

  return (
    <section className="ccWrap">
      <div className="ccContainer">
        <div className="ccDetail">
          <div className="ccBreadcrumbs">
            <Link to="/" className="ccBreadcrumbLink">
              Главная
            </Link>
            <span className="ccBreadcrumbSep">/</span>
            <Link to="/clinicalcases" className="ccBreadcrumbLink">
              Истории пациентов
            </Link>
            <span className="ccBreadcrumbSep">/</span>
            <span className="ccBreadcrumbCurrent">{title}</span>
          </div>

          <div className="ccDetailHero">
            {image ? (
              <div className="ccDetailMedia">
                <img src={image} alt={title} className="ccDetailImg" />
              </div>
            ) : null}

            <div className="ccDetailText">
              <h1 className="ccDetailTitle">{title}</h1>
              {previewText ? <p className="ccDetailPreview">{previewText}</p> : null}
            </div>
          </div>

          <AutoEntitySections item={item} />
        </div>
      </div>
    </section>
  );
}

export default function ClinicalCases() {
  return (
    <section className="ccWrap">
      <div className="ccContainer">
        <div className="ccHead">
          <div className="ccBreadcrumbs">
            <Link to="/" className="ccBreadcrumbLink">
              Главная
            </Link>
            <span className="ccBreadcrumbSep">/</span>
            <span className="ccBreadcrumbCurrent">Истории пациентов</span>
          </div>

          <h1 className="ccTitle">Истории пациентов</h1>
        </div>

        <div className="ccGrid" role="list">
          {CLINICAL_CASES.map((item) => {
            const code = getItemCode(item);
            const image = getCaseImage(item);
            const title = getCaseTitle(item);
            const previewText = getPreviewPlainText(item?.fields?.PREVIEW_TEXT || "");

            return (
              <NavLink
                key={item?.fields?.ID || code}
                to={`/clinicalcases/${code}`}
                className="ccCard"
              >
                <div className="ccMedia">
                  {image ? (
                    <span className="ccImgFrame">
                      <img src={image} alt={title} className="ccImg" />
                    </span>
                  ) : (
                    <div className="ccImgFallback" />
                  )}
                </div>

                <div className="ccBody">
                  <div className="ccCardTitle">{title}</div>

                  {previewText ? (
                    <div className="ccCardText">{previewText}</div>
                  ) : null}
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
