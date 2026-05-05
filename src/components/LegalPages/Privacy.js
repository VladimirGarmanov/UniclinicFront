import React from "react";
import { Link } from "react-router-dom";
import "./privacy.css";

import politicsData from "../../assets/info/politics_full.json";

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

export default function Privacy() {
  const title = politicsData?.title || "Политика конфиденциальности";
  const sourcePath = politicsData?.source_path || "";
  const exportedAt = politicsData?.exported_at || "";
  const html = getLegalHtml(politicsData);

  return (
    <section className="privacyWrap">
      <div className="privacyContainer">
        <div className="privacyHead">
          <div className="privacyBreadcrumbs">
            <Link to="/" className="privacyBreadcrumbLink">
              Главная
            </Link>
            <span className="privacyBreadcrumbSep">/</span>
            <span className="privacyBreadcrumbCurrent">{title}</span>
          </div>

          <h1 className="privacyTitle">{title}</h1>

          <div className="privacyMeta">
            {sourcePath ? (
              <span className="privacyMetaItem">Источник: {sourcePath}</span>
            ) : null}

            {exportedAt ? (
              <span className="privacyMetaItem">
                Дата экспорта: {new Date(exportedAt).toLocaleDateString("ru-RU")}
              </span>
            ) : null}
          </div>
        </div>

        <article className="privacyCard">
          <div
            className="privacyContent"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
    </section>
  );
}