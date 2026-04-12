import React from "react";
import { Link } from "react-router-dom";

export const ENTITY_BASE_BY_IBLOCK = {
  11: "/doctors",
  15: "/diseases",
  16: "/services",
  17: "/articles",
  22: "/technologies",
};

export function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export function hasHtml(value) {
  return typeof value === "string" && /<\/?[a-z][\s\S]*>/i.test(value);
}

export function stripHtml(html = "") {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function getItemCode(item) {
  return item?.fields?.CODE || "";
}

export function getItemName(item) {
  return item?.fields?.NAME || "";
}

export function getPrimaryImage(item) {
  if (item?.detail_picture?.src) return item.detail_picture.src;
  if (item?.preview_picture?.src) return item.preview_picture.src;
  return "";
}

export function getPreviewText(item) {
  return stripHtml(item?.fields?.PREVIEW_TEXT || "");
}

export function getDetailHtml(item) {
  return item?.fields?.DETAIL_TEXT || "";
}

export function getPublicFileUrl(src = "") {
  return src || "";
}

export function makeEntityUrlFromElement(element) {
  const iblockId = Number(element?.IBLOCK_ID || 0);
  const code = element?.CODE || "";
  const base = ENTITY_BASE_BY_IBLOCK[iblockId];

  if (base && code) return `${base}/${code}`;
  return "";
}

export function normalizeLabel(key = "") {
  const map = {
    PREVIEW_TEXT: "Краткое описание",
    DETAIL_TEXT: "Подробное описание",
    COMMON_TEXT: "Общая информация",
    PARTS: "Разделы",
    MORE_PHOTO: "Фотографии",
    ADVANTAGES: "Преимущества",
    AUTHOR: "Автор",
    DOCTORS: "Врачи",
    DISEASES: "Заболевания",
    SERVICES: "Услуги",
    FAQ: "FAQ",
    PROF: "Профессия",
    STAZH: "Стаж",
    DOLZHNOST: "Должность",
    STEPEN: "Ученая степень",
    SPEC: "Специализация",
    OPIT: "Опыт работы",
    SKILLS: "Ключевые навыки",
    CERTIFICAT: "Сертификаты",
    SERTIFICAT: "Сертификаты",
    SHOW_PRICE_BLOCK: "Показывать блок цен",
    PRICE_LIST: "Блок цен",
    PRICE_LIST_ELS: "Элементы цен",
    TAGS: "Теги",
    OBRAZOVANIE: "Образование",
    CONFERENCE: "Конференции",
    NAUCH_LIST: "Научная деятельность",
    NAUCH_TEXT: "Научная деятельность",
    PUBLICATIONS: "Публикации",
    AWARDS: "Награды и достижения",
    PRODOCTOROV: "Отзывы",
    ZAPIS: "Запись",
  };

  return map[key] || key;
}

function isMeaningfulScalar(value) {
  if (value === null || value === undefined) return false;
  if (value === false) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

function fieldIsRenderable(fieldKey) {
  const blocked = new Set([
    "ID",
    "IBLOCK_ID",
    "IBLOCK_SECTION_ID",
    "CODE",
    "XML_ID",
    "SORT",
    "ACTIVE",
    "DATE_ACTIVE_FROM",
    "DATE_ACTIVE_TO",
    "LIST_PAGE_URL",
    "DETAIL_PAGE_URL",
    "TIMESTAMP_X",
    "DATE_CREATE",
    "CREATED_BY",
    "MODIFIED_BY",
    "PREVIEW_TEXT_TYPE",
    "DETAIL_TEXT_TYPE",
  ]);

  return !blocked.has(fieldKey);
}

export function getRenderableFields(item) {
  const fields = item?.fields || {};
  return Object.entries(fields)
    .filter(([key, value]) => fieldIsRenderable(key) && isMeaningfulScalar(value))
    .map(([key, value]) => ({
      key,
      label: normalizeLabel(key),
      value,
    }));
}

function extractValue(value) {
  if (value === null || value === undefined || value === false) return null;

  if (typeof value === "string" || typeof value === "number") {
    return isMeaningfulScalar(value) ? value : null;
  }

  if (typeof value === "object") {
    if (value?.TEXT !== undefined) {
      return value.TEXT ? value.TEXT : null;
    }

    if (value?.element) {
      return value.element;
    }

    if (value?.section) {
      return value.section;
    }

    if (value?.enum?.VALUE) {
      return value.enum.VALUE;
    }

    if (value?.src) {
      return value;
    }
  }

  return null;
}

function extractAllPropertyValues(prop) {
  const rawValues = ensureArray(prop?.values);

  const extracted = rawValues
    .map((entry) => extractValue(entry?.value))
    .filter(Boolean);

  if (extracted.length) return extracted;

  const single = extractValue(prop?.value?.value);
  if (single) return [single];

  return [];
}

function allValuesAreStrings(values) {
  return values.length > 0 && values.every((v) => typeof v === "string" || typeof v === "number");
}

function allValuesAreFiles(values) {
  return values.length > 0 && values.every((v) => v?.src);
}

function allValuesAreElements(values) {
  return values.length > 0 && values.every((v) => v?.ID && v?.NAME && v?.IBLOCK_ID);
}

function allValuesAreSections(values) {
  return values.length > 0 && values.every((v) => v?.ID && v?.NAME && !v?.IBLOCK_ID === false);
}

export function renderScalarValue(value) {
  if (!isMeaningfulScalar(value)) return null;

  if (typeof value === "string" && hasHtml(value)) {
    return <div dangerouslySetInnerHTML={{ __html: value }} />;
  }

  return (
    <p style={{ margin: 0, color: "#374151", lineHeight: 1.7 }}>
      {String(value)}
    </p>
  );
}

export function renderFileCard(file, keyPrefix = "file") {
  if (!file?.src) return null;

  const src = getPublicFileUrl(file.src);
  const fileName = file?.original_name || file?.file_name || "Файл";
  const contentType = file?.content_type || "";

  if (contentType.startsWith("image/")) {
    return (
      <a
        key={`${keyPrefix}-${src}`}
        href={src}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "block",
          textDecoration: "none",
          color: "inherit",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <img
          src={src}
          alt={fileName}
          style={{
            display: "block",
            width: "100%",
            height: 220,
            objectFit: "cover",
          }}
        />
        <div style={{ padding: "10px 12px", fontSize: 14, color: "#374151" }}>
          {fileName}
        </div>
      </a>
    );
  }

  return (
    <a
      key={`${keyPrefix}-${src}`}
      href={src}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "block",
        padding: "12px 14px",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        color: "#244b6a",
        textDecoration: "none",
        background: "#fff",
      }}
    >
      {fileName}
    </a>
  );
}

export function renderLinkedElement(element, idx = 0) {
  if (!element) return null;

  const url = makeEntityUrlFromElement(element);
  const name = element?.NAME || "Элемент";

  if (url) {
    return (
      <li key={`${element?.ID || name}-${idx}`}>
        <Link to={url} style={{ color: "#244b6a", textDecoration: "none", fontWeight: 600 }}>
          {name}
        </Link>
      </li>
    );
  }

  return (
    <li key={`${element?.ID || name}-${idx}`} style={{ color: "#374151" }}>
      {name}
    </li>
  );
}

function renderStandardSection(title, content) {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
        padding: "22px 24px",
        marginBottom: 20,
      }}
    >
      <h2
        style={{
          margin: "0 0 16px",
          fontSize: 26,
          lineHeight: 1.15,
          fontWeight: 800,
          color: "#2a333b",
        }}
      >
        {title}
      </h2>
      {content}
    </section>
  );
}

export function renderPropertyBlock(propKey, prop) {
  const label = normalizeLabel(propKey);

  if (propKey === "PARTS") {
    const values = ensureArray(prop?.values);

    const parts = values
      .map((entry, index) => ({
        id: `${propKey}-${index}`,
        title: entry?.description || "",
        html: entry?.value?.TEXT || entry?.value || "",
      }))
      .filter((part) => String(part.html).trim());

    if (!parts.length) return null;

    return parts.map((part) => (
      <section
        key={part.id}
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
          padding: "22px 24px",
          marginBottom: 20,
        }}
      >
        {part.title ? (
          <h2
            style={{
              margin: "0 0 14px",
              fontSize: 26,
              lineHeight: 1.15,
              fontWeight: 800,
              color: "#2a333b",
            }}
          >
            {part.title}
          </h2>
        ) : null}

        <div
          style={{ color: "#374151", fontSize: 16, lineHeight: 1.72 }}
          dangerouslySetInnerHTML={{ __html: String(part.html) }}
        />
      </section>
    ));
  }

  const values = extractAllPropertyValues(prop);
  if (!values.length) return null;

  if (allValuesAreFiles(values)) {
    return renderStandardSection(
      label,
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {values.map((file, index) => renderFileCard(file, `${propKey}-${index}`))}
      </div>
    );
  }

  if (allValuesAreElements(values)) {
    return renderStandardSection(
      label,
      <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.8 }}>
        {values.map((element, index) => renderLinkedElement(element, index))}
      </ul>
    );
  }

  if (allValuesAreSections(values)) {
    return renderStandardSection(
      label,
      <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.8, color: "#374151" }}>
        {values.map((section, index) => (
          <li key={`${section?.ID || section?.NAME}-${index}`}>{section?.NAME}</li>
        ))}
      </ul>
    );
  }

  if (allValuesAreStrings(values)) {
    const filtered = values
      .map((v) => String(v).trim())
      .filter(Boolean);

    if (!filtered.length) return null;

    const allHtml = filtered.every((v) => hasHtml(v));

    if (allHtml) {
      return renderStandardSection(
        label,
        <div>
          {filtered.map((html, index) => (
            <div
              key={`${propKey}-html-${index}`}
              style={{ color: "#374151", fontSize: 16, lineHeight: 1.72, marginBottom: 14 }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))}
        </div>
      );
    }

    if (filtered.length === 1 && !hasHtml(filtered[0])) {
      return renderStandardSection(
        label,
        <p style={{ margin: 0, color: "#374151", lineHeight: 1.8 }}>{filtered[0]}</p>
      );
    }

    return renderStandardSection(
      label,
      <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.8, color: "#374151" }}>
        {filtered.map((value, index) => {
          if (hasHtml(value)) {
            return (
              <li key={`${propKey}-plain-${index}`}>
                <span dangerouslySetInnerHTML={{ __html: value }} />
              </li>
            );
          }

          if (typeof value === "string" && value.includes("http")) {
            const parts = value.split(/(https?:\/\/[^\s]+)/g);
            return (
              <li key={`${propKey}-plain-${index}`}>
                {parts.map((part, partIndex) => {
                  if (/^https?:\/\//.test(part)) {
                    return (
                      <a
                        key={`${index}-${partIndex}`}
                        href={part}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#244b6a" }}
                      >
                        {part}
                      </a>
                    );
                  }
                  return <React.Fragment key={`${index}-${partIndex}`}>{part}</React.Fragment>;
                })}
              </li>
            );
          }

          return <li key={`${propKey}-plain-${index}`}>{value}</li>;
        })}
      </ul>
    );
  }

  return null;
}

export function AutoEntitySections({ item }) {
  if (!item) return null;

  const renderableFields = getRenderableFields(item)
    .filter((field) => field.key !== "NAME")
    .filter((field) => field.key !== "PREVIEW_TEXT")
    .filter((field) => field.key !== "DETAIL_TEXT");

  const properties = item?.properties || {};
  const propertyEntries = Object.entries(properties);

  return (
    <>
      {renderableFields.map((field) => (
        <section
          key={field.key}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
            padding: "22px 24px",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: 26,
              lineHeight: 1.15,
              fontWeight: 800,
              color: "#2a333b",
            }}
          >
            {field.label}
          </h2>

          <div style={{ color: "#374151", fontSize: 16, lineHeight: 1.72 }}>
            {renderScalarValue(field.value)}
          </div>
        </section>
      ))}

      {propertyEntries.map(([propKey, prop]) => {
        const rendered = renderPropertyBlock(propKey, prop);
        return rendered;
      })}
    </>
  );
}

export function DetailTopBlock({ item, backLabel, backTo }) {
  const title = getItemName(item);
  const image = getPrimaryImage(item);
  const preview = getPreviewText(item);
  const detailHtml = getDetailHtml(item);

  return (
    <>
      <div style={{ marginBottom: 12, fontSize: 14, color: "#6b7280" }}>
        <Link to="/" style={{ color: "#6b7280", textDecoration: "none" }}>
          Главная
        </Link>
        {" / "}
        <Link to={backTo} style={{ color: "#6b7280", textDecoration: "none" }}>
          {backLabel}
        </Link>
        {" / "}
        <span>{title}</span>
      </div>

      <h1
        style={{
          margin: "0 0 22px",
          fontSize: "clamp(34px, 4vw, 48px)",
          lineHeight: 1.05,
          fontWeight: 800,
          color: "#2a333b",
        }}
      >
        {title}
      </h1>

      {image ? (
        <div
          style={{
            marginBottom: 22,
            overflow: "hidden",
            borderRadius: 14,
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            background: "#eef2f5",
          }}
        >
          <img
            src={image}
            alt={title}
            style={{
              display: "block",
              width: "100%",
              maxHeight: 560,
              objectFit: "cover",
            }}
          />
        </div>
      ) : null}

      {preview ? (
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.7,
            color: "rgba(31,42,51,0.86)",
            fontWeight: 600,
            margin: "0 0 24px",
          }}
        >
          {preview}
        </p>
      ) : null}

      {detailHtml && hasHtml(detailHtml) ? (
        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
            padding: "22px 24px",
            marginBottom: 20,
          }}
        >
          <div
            style={{ color: "#374151", fontSize: 16, lineHeight: 1.72 }}
            dangerouslySetInnerHTML={{ __html: detailHtml }}
          />
        </section>
      ) : null}
    </>
  );
}
