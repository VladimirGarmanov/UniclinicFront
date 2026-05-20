import React, { useEffect, useState } from "react";
import "./admin-panel.css";

const API_BASE = "https://uniclinic.ru:8000";

function LoginForm({ onLoggedIn }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Ошибка входа");
      }

      onLoggedIn();
    } catch (err) {
      setError(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="adminPanelLoginPage">
      <form className="adminPanelLoginCard" onSubmit={handleSubmit}>
        <h1 className="adminPanelTitle">Админ-панель вопросов</h1>
        <p className="adminPanelText">
          Введите пароль администратора для входа.
        </p>

        <input
          className="adminPanelInput"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="adminPanelButton" type="submit" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </button>

        {error ? <div className="adminPanelError">{error}</div> : null}
      </form>
    </div>
  );
}

function QuestionCard({ item, onSaved }) {
  const [title, setTitle] = useState(item.title || "Вопрос пациента");
  const [answerText, setAnswerText] = useState(item.answer_text || "");
  const [answerHtml, setAnswerHtml] = useState(Boolean(item.answer_html));
  const [isPublished, setIsPublished] = useState(Boolean(item.is_published));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/admin/questions/${item.id}/answer`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          answer_text: answerText,
          answer_html: answerHtml,
          is_published: isPublished,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Ошибка сохранения");
      }

      setMessage("Сохранено");
      onSaved();
    } catch (err) {
      setMessage(err.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="adminPanelCard">
      <div className="adminPanelMeta">
        <div><strong>ID:</strong> {item.id}</div>
        <div><strong>Код:</strong> {item.public_code}</div>
        <div><strong>Дата:</strong> {item.created_at}</div>
        <div><strong>Статус:</strong> {item.status}</div>
      </div>

      <div className="adminPanelInfo">
        <div><strong>Имя:</strong> {item.patient_name}</div>
        <div><strong>Email:</strong> {item.email}</div>
        <div><strong>Телефон:</strong> {item.phone || "—"}</div>
      </div>

      <div className="adminPanelQuestion">
        <div className="adminPanelLabel">Вопрос</div>
        <div className="adminPanelQuestionText">{item.question_text}</div>
      </div>

      <div className="adminPanelField">
        <label className="adminPanelLabel">Заголовок на сайте</label>
        <input
          className="adminPanelInput"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Консультация по лечению"
        />
      </div>

      <div className="adminPanelField">
        <label className="adminPanelLabel">Ответ</label>
        <textarea
          className="adminPanelTextarea"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="Введите текст ответа"
        />
      </div>

      <label className="adminPanelCheck">
        <input
          type="checkbox"
          checked={answerHtml}
          onChange={(e) => setAnswerHtml(e.target.checked)}
        />
        <span>Ответ содержит HTML</span>
      </label>

      <label className="adminPanelCheck">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
        />
        <span>Опубликовать на сайте</span>
      </label>

      <div className="adminPanelActions">
        <button
          className="adminPanelButton"
          type="button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Сохранение..." : "Сохранить ответ"}
        </button>

        {message ? <div className="adminPanelMessage">{message}</div> : null}
      </div>
    </article>
  );
}

export default function AdminPanel() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkAuth() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/me`, {
        credentials: "include",
      });
      const data = await res.json();
      setAuthenticated(Boolean(data?.authenticated));
    } catch (_) {
      setAuthenticated(false);
    } finally {
      setAuthChecked(true);
    }
  }

  async function loadQuestions() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/admin/questions`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Не удалось загрузить вопросы");
      }

      setQuestions(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setError(err.message || "Не удалось загрузить вопросы");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch(`${API_BASE}/api/admin/logout`, {
      method: "POST",
      credentials: "include",
    });

    setAuthenticated(false);
    setQuestions([]);
  }

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadQuestions();
    }
  }, [authenticated]);

  if (!authChecked) {
    return <div className="adminPanelLoading">Загрузка...</div>;
  }

  if (!authenticated) {
    return (
      <LoginForm
        onLoggedIn={() => {
          setAuthenticated(true);
          setAuthChecked(true);
        }}
      />
    );
  }

  return (
    <section className="adminPanelPage">
      <div className="adminPanelWrap">
        <div className="adminPanelTop">
          <div>
            <h1 className="adminPanelTitle">Админ-панель вопросов</h1>
            <p className="adminPanelText">
              Здесь можно отвечать на новые вопросы и публиковать их на сайте.
            </p>
          </div>

          <button
            className="adminPanelButton adminPanelButtonGhost"
            type="button"
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>

        {loading ? <div className="adminPanelLoading">Загрузка вопросов...</div> : null}
        {error ? <div className="adminPanelError">{error}</div> : null}

        <div className="adminPanelList">
          {questions.map((item) => (
            <QuestionCard
              key={item.id}
              item={item}
              onSaved={loadQuestions}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
