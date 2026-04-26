import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./reviews.css";

import reviewsData from "../../assets/info/reviews.json";

const API_BASE = "http://0.0.0.0:8000";

const RAW_REVIEWS = Array.isArray(reviewsData?.items) ? reviewsData.items : [];

function stripHtml(value = "") {
  return String(value)
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

function normalizeSpaces(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseRuDate(value = "") {
  const raw = String(value || "").trim();

  const match = raw.match(
    /^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/
  );

  if (!match) {
    const fallback = new Date(raw);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  const [, dd, mm, yyyy, hh = "00", min = "00", ss = "00"] = match;

  const date = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh),
    Number(min),
    Number(ss)
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value = "") {
  const date = parseRuDate(value);

  if (!date) {
    return normalizeSpaces(value);
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getReviewAuthor(item) {
  return (
    normalizeSpaces(item?.review_fields?.name) ||
    normalizeSpaces(item?.flat_properties?.NAME) ||
    normalizeSpaces(item?.name) ||
    "Пациент"
  );
}

function getReviewText(item) {
  return stripHtml(item?.preview_text || item?.detail_text || "");
}

function getReviewTitle(item) {
  const title = normalizeSpaces(item?.name);

  if (title && !/^Отзыв\s+\d{2}\.\d{2}\.\d{4}/i.test(title)) {
    return title;
  }

  const text = getReviewText(item);

  if (!text) {
    return "Отзыв пациента";
  }

  return text.length > 95 ? `${text.slice(0, 95).trim()}...` : text;
}

function getReviewDate(item) {
  return item?.active_from || item?.date_create || item?.timestamp_x || "";
}

function getReviewMark(item) {
  const raw = item?.review_fields?.mark ?? item?.flat_properties?.MARK ?? null;
  const mark = Number(raw);

  if (!Number.isFinite(mark)) {
    return null;
  }

  if (mark < 1) {
    return null;
  }

  if (mark > 5) {
    return 5;
  }

  return mark;
}

function getReviewCity(item) {
  return normalizeSpaces(item?.review_fields?.city || item?.flat_properties?.CITY || "");
}

function getReviewSlug(item) {
  return `review-${item?.id}`;
}

function getReviewBySlug(slug) {
  return RAW_REVIEWS.find((item) => getReviewSlug(item) === slug);
}

function getVisibleReviews() {
  return RAW_REVIEWS
    .filter((item) => item?.active !== false)
    .sort((a, b) => {
      const dateA = parseRuDate(getReviewDate(a));
      const dateB = parseRuDate(getReviewDate(b));

      const timeA = dateA ? dateA.getTime() : 0;
      const timeB = dateB ? dateB.getTime() : 0;

      return timeB - timeA;
    });
}

function Stars({ value = 0, interactive = false, onChange = null }) {
  const current = Number(value) || 0;

  return (
    <div className={interactive ? "reviewsStars reviewsStarsInteractive" : "reviewsStars"}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= current;

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              className={filled ? "reviewsStar reviewsStarFilled" : "reviewsStar"}
              onClick={() => onChange?.(star)}
              aria-label={`Оценка ${star}`}
            >
              ★
            </button>
          );
        }

        return (
          <span
            key={star}
            className={filled ? "reviewsStar reviewsStarFilled" : "reviewsStar"}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

function ReviewMeta({ item }) {
  const author = getReviewAuthor(item);
  const date = getReviewDate(item);
  const city = getReviewCity(item);
  const mark = getReviewMark(item);

  return (
    <div className="reviewsMeta">
      <span>{author}</span>

      {city ? (
        <>
          <span className="reviewsMetaDot">•</span>
          <span>{city}</span>
        </>
      ) : null}

      {date ? (
        <>
          <span className="reviewsMetaDot">•</span>
          <span>{formatDate(date)}</span>
        </>
      ) : null}

      {mark ? (
        <>
          <span className="reviewsMetaDot">•</span>
          <Stars value={mark} />
        </>
      ) : null}
    </div>
  );
}

function ReviewForm() {
  const [form, setForm] = useState({
    reviewer_name: "",
    email: "",
    phone: "",
    city: "",
    mark: 5,
    doctor_name: "",
    service_name: "",
    review_text: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function submitReview(event) {
    event.preventDefault();

    setStatus({
      loading: true,
      error: "",
      success: "",
    });

    try {
      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reviewer_name: form.reviewer_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          city: form.city.trim() || null,
          mark: Number(form.mark),
          doctor_name: form.doctor_name.trim() || null,
          service_name: form.service_name.trim() || null,
          review_text: form.review_text.trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const detail = data?.detail;

        if (Array.isArray(detail)) {
          throw new Error("Проверьте правильность заполнения полей.");
        }

        throw new Error(detail || "Не удалось отправить отзыв.");
      }

      setForm({
        reviewer_name: "",
        email: "",
        phone: "",
        city: "",
        mark: 5,
        doctor_name: "",
        service_name: "",
        review_text: "",
      });

      setStatus({
        loading: false,
        error: "",
        success: "Спасибо. Отзыв отправлен и появится на сайте после проверки.",
      });
    } catch (error) {
      setStatus({
        loading: false,
        error: error?.message || "Не удалось отправить отзыв.",
        success: "",
      });
    }
  }

  return (
    <section className="reviewsFormSection" id="add-review">
      <div className="reviewsFormHead">
        <h2 className="reviewsSectionTitle">Добавить отзыв</h2>
        <p className="reviewsFormLead">
          Заполните форму ниже. После проверки отзыв сможет быть опубликован на сайте.
        </p>
      </div>

      <form className="reviewsForm" onSubmit={submitReview}>
        <div className="reviewsFormGrid">
          <label className="reviewsField">
            <span>Автор отзыва *</span>
            <input
              type="text"
              value={form.reviewer_name}
              onChange={(event) => updateField("reviewer_name", event.target.value)}
              placeholder="Например, Анна"
              maxLength={255}
              required
            />
          </label>

          <label className="reviewsField">
            <span>Email *</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="name@example.com"
              maxLength={255}
              required
            />
          </label>

          <label className="reviewsField">
            <span>Телефон</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+7..."
              maxLength={255}
            />
          </label>

          <label className="reviewsField">
            <span>Город</span>
            <input
              type="text"
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              placeholder="Москва"
              maxLength={255}
            />
          </label>

          <label className="reviewsField">
            <span>Врач</span>
            <input
              type="text"
              value={form.doctor_name}
              onChange={(event) => updateField("doctor_name", event.target.value)}
              placeholder="ФИО врача"
              maxLength={255}
            />
          </label>

          <label className="reviewsField">
            <span>Услуга / направление</span>
            <input
              type="text"
              value={form.service_name}
              onChange={(event) => updateField("service_name", event.target.value)}
              placeholder="Например, хирургия"
              maxLength={255}
            />
          </label>
        </div>

        <div className="reviewsRatingField">
          <span>Оценка *</span>
          <Stars
            value={form.mark}
            interactive
            onChange={(value) => updateField("mark", value)}
          />
        </div>

        <label className="reviewsField reviewsTextareaField">
          <span>Текст отзыва *</span>
          <textarea
            value={form.review_text}
            onChange={(event) => updateField("review_text", event.target.value)}
            placeholder="Напишите ваш отзыв"
            minLength={5}
            maxLength={10000}
            required
          />
        </label>

        {status.error ? (
          <div className="reviewsFormMessage reviewsFormMessageError">
            {status.error}
          </div>
        ) : null}

        {status.success ? (
          <div className="reviewsFormMessage reviewsFormMessageSuccess">
            {status.success}
          </div>
        ) : null}

        <button className="reviewsSubmit" type="submit" disabled={status.loading}>
          {status.loading ? "Отправка..." : "Отправить отзыв"}
        </button>
      </form>
    </section>
  );
}

export function ReviewDetail() {
  const { slug } = useParams();
  const item = getReviewBySlug(slug);

  if (!item) {
    return (
      <section className="reviewsPage">
        <div className="reviewsWrap">
          <div className="reviewsBreadcrumbs">
            <Link to="/" className="reviewsCrumbLink">Главная</Link>
            <span className="reviewsSep">/</span>
            <Link to="/reviews" className="reviewsCrumbLink">Отзывы</Link>
          </div>

          <h1 className="reviewsH1">Отзыв не найден</h1>
        </div>
      </section>
    );
  }

  const title = getReviewTitle(item);
  const text = getReviewText(item);
  const doctors = Array.isArray(item?.flat_properties?.DOCTORS)
    ? item.flat_properties.DOCTORS
    : [];
  const services = Array.isArray(item?.flat_properties?.SERVICES)
    ? item.flat_properties.SERVICES
    : [];

  return (
    <section className="reviewsPage">
      <div className="reviewsWrap">
        <div className="reviewsBreadcrumbs">
          <Link to="/" className="reviewsCrumbLink">Главная</Link>
          <span className="reviewsSep">/</span>
          <Link to="/reviews" className="reviewsCrumbLink">Отзывы</Link>
          <span className="reviewsSep">/</span>
          <span className="reviewsCrumbActive">Отзыв</span>
        </div>

        <h1 className="reviewsH1">{title}</h1>

        <article className="reviewsDetail">
          <ReviewMeta item={item} />

          {text ? (
            <div className="reviewsDetailText">
              {text.split("\n").map((paragraph, index) => {
                const clean = paragraph.trim();

                if (!clean) {
                  return null;
                }

                return <p key={index}>{clean}</p>;
              })}
            </div>
          ) : null}

          <div className="reviewsDetailInfo">
            <h2 className="reviewsSectionTitle">Данные отзыва</h2>

            <dl className="reviewsInfoList">
              <div>
                <dt>Автор</dt>
                <dd>{getReviewAuthor(item)}</dd>
              </div>

              {getReviewCity(item) ? (
                <div>
                  <dt>Город</dt>
                  <dd>{getReviewCity(item)}</dd>
                </div>
              ) : null}

              {getReviewDate(item) ? (
                <div>
                  <dt>Дата</dt>
                  <dd>{formatDate(getReviewDate(item))}</dd>
                </div>
              ) : null}

              {getReviewMark(item) ? (
                <div>
                  <dt>Оценка</dt>
                  <dd>
                    <Stars value={getReviewMark(item)} />
                  </dd>
                </div>
              ) : null}

              {doctors.length ? (
                <div>
                  <dt>Врачи</dt>
                  <dd>{doctors.join(", ")}</dd>
                </div>
              ) : null}

              {services.length ? (
                <div>
                  <dt>Услуги</dt>
                  <dd>{services.join(", ")}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </article>
      </div>
    </section>
  );
}

export default function Reviews() {
  const visibleReviews = useMemo(() => getVisibleReviews(), []);

  return (
    <section className="reviewsPage">
      <div className="reviewsWrap">
        <div className="reviewsBreadcrumbs">
          <Link to="/" className="reviewsCrumbLink">Главная</Link>
          <span className="reviewsSep">/</span>
          <span className="reviewsCrumbActive">Отзывы</span>
        </div>

        <div className="reviewsTop">
          <div>
            <h1 className="reviewsH1">Отзывы</h1>
            <p className="reviewsLead">
              Отзывы пациентов о клинике, врачах и проведённом лечении.
            </p>
          </div>

          <a className="reviewsAddLink" href="#add-review">
            Оставить отзыв
          </a>
        </div>

        <div className="reviewsGrid">
          {visibleReviews.map((item) => {
            const slug = getReviewSlug(item);
            const title = getReviewTitle(item);
            const text = getReviewText(item);

            return (
              <article className="reviewsCard" key={item?.id || slug}>
                <div className="reviewsCardBody">
                  <ReviewMeta item={item} />

                  <h3 className="reviewsCardTitle">
                    <Link to={`/reviews/${slug}`} className="reviewsCardTitleLink">
                      {title}
                    </Link>
                  </h3>

                  {text ? <p className="reviewsCardDesc">{text}</p> : null}

                  <Link to={`/reviews/${slug}`} className="reviewsMoreLink">
                    Подробнее
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <ReviewForm />
      </div>
    </section>
  );
}