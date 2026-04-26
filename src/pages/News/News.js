import React from "react";
import { Link, useParams } from "react-router-dom";
import "./news.css";

import newsData from "../../assets/info/news_full.json";

const NEWS = Array.isArray(newsData?.data?.items) ? newsData.data.items : [];

function stripHtml(html = "") {
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
    .replace(/&#40;/g, "(")
    .replace(/&#41;/g, ")")
    .replace(/\s+/g, " ")
    .trim();
}

function hasHtml(value) {
  return typeof value === "string" && /<\/?[a-z][\s\S]*>/i.test(value);
}

function getNewsCode(item) {
  return item?.code || "";
}

function getNewsName(item) {
  return item?.name || "";
}

function getNewsImage(item) {
  if (item?.preview_picture?.src) return item.preview_picture.src;
  if (item?.detail_picture?.src) return item.detail_picture.src;

  const morePhoto = item?.properties?.MORE_PHOTO?.value;
  if (Array.isArray(morePhoto) && morePhoto[0]?.src) return morePhoto[0].src;

  return "";
}

function getNewsMorePhotos(item) {
  const morePhoto = item?.properties?.MORE_PHOTO?.value;
  return Array.isArray(morePhoto) ? morePhoto.filter((img) => img?.src) : [];
}

function formatNewsDate(raw) {
  if (!raw) return "";

  const normalized = String(raw).trim();

  const match = normalized.match(
    /(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
  );

  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    const hour = Number(match[4] || 0);
    const minute = Number(match[5] || 0);
    const second = Number(match[6] || 0);

    const date = new Date(year, month, day, hour, minute, second);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    }
  }

  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parsed);
  }

  return normalized;
}

function getNewsDate(item) {
  return formatNewsDate(
    item?.active_from ||
      item?.date_create ||
      item?.timestamp_x ||
      ""
  );
}

function getNewsExcerpt(item) {
  const preview = stripHtml(item?.preview_text || "");
  if (preview) return preview;

  const detail = stripHtml(item?.detail_text || "");
  if (detail) return detail;

  return "";
}

function renderHtmlOrText(value) {
  if (!value) return null;

  if (hasHtml(value)) {
    return <div dangerouslySetInnerHTML={{ __html: value }} />;
  }

  return <p>{value}</p>;
}

function NewsCard({ item }) {
  const code = getNewsCode(item);
  const title = getNewsName(item);
  const image = getNewsImage(item);
  const date = getNewsDate(item);
  const excerpt = getNewsExcerpt(item);

  return (
    <article className="newsCard">
      <Link to={`/news/${code}`} className="newsCardLink" aria-label={title}>
        <div className="newsImageBox">
          {image ? (
            <img src={image} alt={title} className="newsImage" />
          ) : (
            <div className="newsImagePlaceholder" />
          )}
        </div>

        <div className="newsCardBody">
          {date ? <div className="newsDate">{date}</div> : null}
          <h2 className="newsTitle">{title}</h2>
          {excerpt ? <p className="newsExcerpt">{excerpt}</p> : null}
        </div>
      </Link>
    </article>
  );
}

export function NewsDetail() {
  const { slug } = useParams();
  const item = NEWS.find((entry) => getNewsCode(entry) === slug);

  if (!item) {
    return (
      <section className="newsPage">
        <div className="newsHero">
          <div className="newsWrap">
            <div className="newsBreadcrumbs">
              <Link to="/" className="newsCrumbLink">
                Главная
              </Link>
              <span className="newsSep">/</span>
              <Link to="/news" className="newsCrumbLink">
                Новости
              </Link>
            </div>
            <h1 className="newsH1">Новость не найдена</h1>
          </div>
        </div>
      </section>
    );
  }

  const title = getNewsName(item);
  const image = getNewsImage(item);
  const date = getNewsDate(item);
  const preview = stripHtml(item?.preview_text || "");
  const detail = item?.detail_text || "";
  const morePhotos = getNewsMorePhotos(item);

  return (
    <section className="newsPage">
      <div className="newsWrap newsDetailWrap">
        <div className="newsBreadcrumbs newsBreadcrumbsDetail">
          <Link to="/" className="newsCrumbLink">
            Главная
          </Link>
          <span className="newsSep">/</span>
          <Link to="/news" className="newsCrumbLink">
            Новости
          </Link>
          <span className="newsSep">/</span>
          <span className="newsCrumbActive">{title}</span>
        </div>

        <h1 className="newsDetailTitle">{title}</h1>

        {date ? <div className="newsDetailDate">{date}</div> : null}

        {image ? (
          <div className="newsDetailImageWrap">
            <img src={image} alt={title} className="newsDetailImage" />
          </div>
        ) : null}

        {preview ? <p className="newsDetailLead">{preview}</p> : null}

        {detail ? (
          <section className="newsDetailSection newsDetailContent">
            {renderHtmlOrText(detail)}
          </section>
        ) : null}

        {morePhotos.length ? (
          <section className="newsDetailSection">
            <h2 className="newsSectionTitle">Фотографии</h2>
            <div className="newsGallery">
              {morePhotos.map((photo, index) => (
                <a
                  key={`${photo?.id || photo?.src || index}`}
                  href={photo.src}
                  target="_blank"
                  rel="noreferrer"
                  className="newsGalleryItem"
                >
                  <img
                    src={photo.src}
                    alt={photo?.original_name || `${title} ${index + 1}`}
                    className="newsGalleryImage"
                  />
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}

export default function News() {
  const visibleNews = NEWS.filter((item) => item?.active === "Y");

  return (
    <section className="newsPage">
      <div className="newsHero">
        <div className="newsWrap">
          <div className="newsBreadcrumbs">
            <Link to="/" className="newsCrumbLink">
              Главная
            </Link>
            <span className="newsSep">/</span>
            <span className="newsCrumbActive">Новости</span>
          </div>

          <h1 className="newsH1">Новости</h1>
        </div>
      </div>

      <div className="newsWrap">
        <div className="newsGrid">
          {visibleNews.map((item) => (
            <NewsCard
              key={item?.id || item?.code || item?.name}
              item={item}
            />
          ))}
        </div>
      </div>
    </section>
  );
}