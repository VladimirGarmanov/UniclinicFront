import React, { useState } from "react";
import { track } from "../../utils/analytics";
import Consent, { CONSENT_VERSION } from "./Consent";
import "../../pages/Questions/questions.css";
const API_BASE = "";
export default function QuestionForm() {
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
    setDone("Вопрос отправлен. Публикация возможна после проверки и обезличивания.");
    setForm({
      patient_name: "",
      email: "",
      phone: "",
      question_text: "",
    });
  } catch (err) {
    track("form_submit_error", "question");
    setError(err.message || "Ошибка отправки");
  } finally {
    setLoading(false);
  }
}

  return (
    <section id="ask-question" className="askBox">
      <div className="askBoxHead">
        <h2 className="askBoxTitle">Задать вопрос</h2>
        <p className="askBoxText">
          Уважаемый пациент, вы можете отправить вопрос через форму ниже.
          Публикация возможна только после отдельной проверки и обезличивания обращения.
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
