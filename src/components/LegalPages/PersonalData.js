import React from "react";
import { Link } from "react-router-dom";
import "./personaldata.css";

import agreementData from "../../assets/info/agreement_full.json";

function cleanLegalHtml(html = "") {
  return String(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}

function getLegalHtml(data) {
  const html = data?.content?.html || "";
  const text = data?.content?.text || "";

  if (html && html.trim()) {
    return cleanLegalHtml(html);
  }

  return cleanLegalHtml(
    String(text)
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${paragraph.trim()}</p>`)
      .join("")
  );
}

export default function PersonalData() {
  const title = agreementData?.title || "Согласие на обработку персональных данных";
  const sourcePath = agreementData?.source_path || "";
  const exportedAt = agreementData?.exported_at || "";
  const html = getLegalHtml(agreementData);

  return (
    <section className="personalDataWrap">
      <div className="personalDataContainer">
        <div className="personalDataHead">
          <div className="personalDataBreadcrumbs">
            <Link to="/" className="personalDataBreadcrumbLink">
              Главная
            </Link>
            <span className="personalDataBreadcrumbSep">/</span>
            <span className="personalDataBreadcrumbCurrent">{title}</span>
          </div>

          <h1 className="personalDataTitle">{title}</h1>

          <div className="personalDataMeta">
            {sourcePath ? (
              <span className="personalDataMetaItem">Источник: {sourcePath}</span>
            ) : null}

            {exportedAt ? (
              <span className="personalDataMetaItem">
                Дата экспорта: {new Date(exportedAt).toLocaleDateString("ru-RU")}
              </span>
            ) : null}
          </div>
        </div>

        <article className="personalDataCard">
          <div
            className="personalDataContent"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
    </section>
  );
}