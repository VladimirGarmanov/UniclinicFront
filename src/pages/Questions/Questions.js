import { track } from "../../utils/analytics";
import Consent, { CONSENT_VERSION } from "../../components/Shared/Consent";
import { sanitize } from "../../utils/sanitize";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "../../utils/router";
import legacyQuestionsData from "../../assets/info/questions.json";
import {
  normalizeLegacyQuestion,
  normalizeApiQuestion,
  sortQuestionsDesc,
  hasHtml,
} from "../../utils/questions";
import "./questions.css";

const API_BASE = "";

const LEGACY_QUESTIONS = Array.isArray(legacyQuestionsData?.items)
  ? legacyQuestionsData.items.map(normalizeLegacyQuestion)
  : [];

function QuestionForm() {
  const [form, setForm] = useState({
    patient_name: "",
    email: "",
    phone: "",
    question_text: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
  e.preventDefault();
  setLoading(true);
  setError("");
  setDone("");

  try {
    const payload = { ...form, consent: new FormData(e.currentTarget).get("consent") === "on", consent_version: CONSENT_VERSION };


    const res = await fetch(`${API_BASE}/api/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawText = await res.text();



    let data = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch (_) {
      data = { raw: rawText };
    }

    if (!res.ok) {
      const detail = "Не удалось отправить вопрос. Проверьте поля и повторите попытку.";

      throw new Error(detail);
    }

    track("form_submit_success", "question");
    setDone("Вопрос отправлен. После ответа он появится на сайте.");
    setForm({
      patient_name: "",
      email: "",
      phone: "",
      question_text: "",
    });
  } catch (err) {

    setError(err.message || "Ошибка отправки");
  } finally {
    setLoading(false);
  }
}

  return (
    <section className="askBox">
      <div className="askBoxHead">
        <h2 className="askBoxTitle">Задать вопрос</h2>
        <p className="askBoxText">
          Уважаемый пациент, вы можете отправить вопрос через форму ниже.
          После ответа он будет опубликован на странице.
        </p>
      </div>

      <form data-form="question" className="askForm" onSubmit={onSubmit}>
        <div className="askGrid">
          <label htmlFor="question-patient_name">Ваше имя</label>
<input
            className="askInput"
            type="text"
            placeholder="Ваше имя"
            id="question-patient_name" autoComplete="name" value={form.patient_name}
            onChange={(e) => updateField("patient_name", e.target.value)}
            required
          />
          <label htmlFor="question-email">Email</label>
<input
            className="askInput"
            type="email"
            placeholder="Email"
            id="question-email" autoComplete="email" value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
          />
        </div>

        <label htmlFor="question-phone">Телефон</label>
<input
          className="askInput"
          type="tel" inputMode="tel"
          placeholder="Телефон"
          id="question-phone" autoComplete="tel" value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />

        <label htmlFor="question-question_text">Ваш вопрос</label>
<textarea
          className="askTextarea"
          placeholder="Ваш вопрос"
          id="question-question_text" autoComplete="off" value={form.question_text}
          onChange={(e) => updateField("question_text", e.target.value)}
          minLength={5} maxLength={10000} required
        />

        <Consent />
        <div className="askActions">
          <button className="askButton" type="submit" disabled={loading}>
            {loading ? "Отправка..." : "Отправить вопрос"}
          </button>
        </div>

        {done ? <div role="status" className="askSuccess">{done}</div> : null}
        {error ? <div role="alert" className="askError">{error}</div> : null}
      </form>
    </section>
  );
}

function QuestionCard({ item }) {
  return (
    <article className="qaCard" id={`question-${item.code}`}>
      <div className="qaCardTop">
        <div className="qaAuthorBlock">
          <div className="qaAvatar" />
          <div className="qaAuthorName">{item.patientName || "Пациент"}</div>
        </div>
        <div className="qaDate">{item.date}</div>
      </div>

      <h3 className="qaTitle">
        <Link reloadDocument to={item.source === "db" ? `/questions#question-${item.code}` : `/questions/${item.code}`} className="qaTitleLink">
          {item.title}
        </Link>
      </h3>

      <div className="qaQuestionText">
        {item.previewText}{" "}
        <Link reloadDocument to={item.source === "db" ? `/questions#question-${item.code}` : `/questions/${item.code}`} className="qaReadMore">
          Читать подробнее
        </Link>
      </div>

      {item.detailText ? (
        <div className="qaAnswerBox">
          <div className="qaAnswerLabel">Ответ:</div>
          {item.detailTextType === "html" || hasHtml(item.detailText) ? (
            <div
              className="qaAnswerText"
              dangerouslySetInnerHTML={{ __html: sanitize(item.detailText) }}
            />
          ) : (
            <div className="qaAnswerText">{item.detailText}</div>
          )}
        </div>
      ) : null}
    </article>
  );
}

export function QuestionDetail() {
  const { slug } = useParams();
  const [apiQuestions, setApiQuestions] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/questions`);
        const data = await res.json();
        if (!ignore) {
          const items = Array.isArray(data?.items)
            ? data.items.map(normalizeApiQuestion)
            : [];
          setApiQuestions(items);
        }
      } catch (_) {}
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const allQuestions = useMemo(() => {
    return sortQuestionsDesc([...LEGACY_QUESTIONS, ...apiQuestions]);
  }, [apiQuestions]);

  const item = allQuestions.find((entry) => entry.code === slug);

  if (!item) {
    return (
      <section className="questionsPage">
        <div className="questionsWrap">
          <h1 className="questionsPageTitle">Вопрос не найден</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="questionsPage">
      <div className="questionsWrap">
        <div className="questionsBreadcrumbs">
          <Link reloadDocument to="/" className="questionsBreadcrumbLink">Главная</Link>
          <span className="questionsBreadcrumbSep">/</span>
          <Link reloadDocument to="/questions" className="questionsBreadcrumbLink">Вопросы и ответы</Link>
          <span className="questionsBreadcrumbSep">/</span>
          <span className="questionsBreadcrumbCurrent">{item.title}</span>
        </div>

        <h1 className="questionsPageTitle">{item.title}</h1>
        <QuestionCard item={item} />
      </div>
    </section>
  );
}

export default function Questions() {
  const [apiQuestions, setApiQuestions] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/questions`);
        const data = await res.json();
        if (!ignore) {
          const items = Array.isArray(data?.items)
            ? data.items.map(normalizeApiQuestion)
            : [];
          setApiQuestions(items);
        }
      } catch (_) {}
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const questions = useMemo(() => {
    return sortQuestionsDesc([...LEGACY_QUESTIONS, ...apiQuestions]);
  }, [apiQuestions]);

  return (
    <section className="questionsPage">
      <div className="questionsWrap">
        <div className="questionsHeader">
          <div>
            <div className="questionsBreadcrumbs">
              <Link reloadDocument to="/" className="questionsBreadcrumbLink">Главная</Link>
              <span className="questionsBreadcrumbSep">/</span>
              <span className="questionsBreadcrumbCurrent">Вопросы и ответы</span>
            </div>
            <h1 className="questionsPageTitle">Задать вопрос доктору</h1>
            <p className="questionsLead">
              Уважаемый пациент, мы готовы ответить на ваши вопросы.
            </p>
          </div>
          <a href="#ask-question" className="questionsAskAnchor">
            Задать вопрос
          </a>
        </div>

        <div id="ask-question">
          <QuestionForm />
        </div>

        <div className="qaList">
          {questions.map((item) => (
            <QuestionCard key={`${item.source}-${item.id}-${item.code}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
