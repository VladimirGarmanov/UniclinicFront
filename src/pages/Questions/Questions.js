import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import legacyQuestionsData from "../../assets/info/questions.json";
import {
  normalizeLegacyQuestion,
  normalizeApiQuestion,
  sortQuestionsDesc,
  hasHtml,
} from "../../utils/questions";
import "./questions.css";

const API_BASE = "http://localhost:8000";

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
    const payload = { ...form };
    console.log("POST /api/questions payload:", payload);

    const res = await fetch(`${API_BASE}/api/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawText = await res.text();
    console.log("POST /api/questions status:", res.status);
    console.log("POST /api/questions raw response:", rawText);

    let data = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch (_) {
      data = { raw: rawText };
    }

    if (!res.ok) {
      const detail =
        Array.isArray(data?.detail)
          ? data.detail.map((x) => `${x.loc?.join(".")}: ${x.msg}`).join(" | ")
          : data?.detail || data?.error || data?.raw || "Ошибка отправки";

      throw new Error(detail);
    }

    setDone("Вопрос отправлен. После ответа он появится на сайте.");
    setForm({
      patient_name: "",
      email: "",
      phone: "",
      question_text: "",
    });
  } catch (err) {
    console.error("POST /api/questions failed:", err);
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

      <form className="askForm" onSubmit={onSubmit}>
        <div className="askGrid">
          <input
            className="askInput"
            type="text"
            placeholder="Ваше имя"
            value={form.patient_name}
            onChange={(e) => updateField("patient_name", e.target.value)}
            required
          />
          <input
            className="askInput"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
          />
        </div>

        <input
          className="askInput"
          type="text"
          placeholder="Телефон"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
        />

        <textarea
          className="askTextarea"
          placeholder="Ваш вопрос"
          value={form.question_text}
          onChange={(e) => updateField("question_text", e.target.value)}
          required
        />

        <div className="askActions">
          <button className="askButton" type="submit" disabled={loading}>
            {loading ? "Отправка..." : "Отправить вопрос"}
          </button>
        </div>

        {done ? <div className="askSuccess">{done}</div> : null}
        {error ? <div className="askError">{error}</div> : null}
      </form>
    </section>
  );
}

function QuestionCard({ item }) {
  return (
    <article className="qaCard">
      <div className="qaCardTop">
        <div className="qaAuthorBlock">
          <div className="qaAvatar" />
          <div className="qaAuthorName">{item.patientName || "Пациент"}</div>
        </div>
        <div className="qaDate">{item.date}</div>
      </div>

      <h3 className="qaTitle">
        <Link to={`/questions/${item.code}`} className="qaTitleLink">
          {item.title}
        </Link>
      </h3>

      <div className="qaQuestionText">
        {item.previewText}{" "}
        <Link to={`/questions/${item.code}`} className="qaReadMore">
          Читать подробнее
        </Link>
      </div>

      {item.detailText ? (
        <div className="qaAnswerBox">
          <div className="qaAnswerLabel">Ответ:</div>
          {item.detailTextType === "html" || hasHtml(item.detailText) ? (
            <div
              className="qaAnswerText"
              dangerouslySetInnerHTML={{ __html: item.detailText }}
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
          <Link to="/" className="questionsBreadcrumbLink">Главная</Link>
          <span className="questionsBreadcrumbSep">/</span>
          <Link to="/questions" className="questionsBreadcrumbLink">Вопросы и ответы</Link>
          <span className="questionsBreadcrumbSep">/</span>
          <span className="questionsBreadcrumbCurrent">{item.title}</span>
        </div>

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
              <Link to="/" className="questionsBreadcrumbLink">Главная</Link>
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
