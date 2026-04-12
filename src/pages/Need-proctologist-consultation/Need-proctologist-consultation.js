import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./need-proctologist-consultation.css";

const QUESTIONS = [
  {
    id: "pain",
    title: "Имеются у вас неприятные (болезненные) ощущения в области заднего прохода?",
    options: [
      { value: "0", label: "Нет" },
      { value: "1", label: "Да" },
    ],
  },
  {
    id: "discharge",
    title: "Имеются ли у вас непроизвольное отхождение из прямой кишки",
    options: [
      { value: "0", label: "Нет" },
      { value: "1", label: "Да" },
    ],
  },
  {
    id: "blood-noticed",
    title: "Замечали ли Вы кровь?",
    options: [
      { value: "0", label: "Нет" },
      { value: "1", label: "Да" },
    ],
  },
  {
    id: "blood-type",
    title: "Замечали ли вы кровь когда-либо кровь?",
    options: [
      { value: "0", label: "Нет" },
      { value: "1", label: "В кале" },
      { value: "2", label: "На туалетной бумаге" },
      { value: "3", label: "На нижнем белье" },
    ],
  },
  {
    id: "stool-frequency",
    title: "Частота акта дефекации?",
    options: [
      { value: "0", label: "Нет" },
      { value: "0.5", label: "Регулярно, 1 раз в сутки" },
      { value: "1", label: "Чаще, чем 1 раз в сутки" },
      { value: "1", label: "Реже, чем 1 раз в сутки" },
    ],
  },
  {
    id: "emptying-difficulty",
    title:
      "Есть ли у вас сложности с опорожнением прямой кишки (приходится тужиться, дефекация в 2-3 приема, необходимость использования клизм, свечей)",
    options: [
      { value: "0", label: "нет" },
      { value: "1", label: "да" },
    ],
  },
];

function getResultText(total) {
  if (total === 0) {
    return "По результатам ответов выраженных показаний к срочной консультации не выявлено. При появлении жалоб обратитесь к специалисту.";
  }

  if (total <= 2) {
    return "Имеются отдельные симптомы, при которых желательна плановая консультация проктолога.";
  }

  if (total <= 4) {
    return "Есть несколько жалоб, которые могут указывать на проктологическую проблему. Рекомендуется записаться на консультацию проктолога.";
  }

  return "Количество жалоб значительное. Рекомендуется очная консультация проктолога в ближайшее время.";
}

export default function NeedProctologistConsultationPage() {
  const initialState = useMemo(() => {
    const state = {};
    QUESTIONS.forEach((question) => {
      state[question.id] = "";
    });
    return state;
  }, []);

  const [answers, setAnswers] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = QUESTIONS.every((question) => answers[question.id] !== "");

  const totalScore = Object.values(answers).reduce((sum, value) => {
    return sum + Number(value || 0);
  }, 0);

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (!allAnswered) {
      const firstUnanswered = QUESTIONS.find((question) => !answers[question.id]);
      if (firstUnanswered) {
        const element = document.getElementById(firstUnanswered.id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  };

  return (
    <section className="npcPage">
      <div className="npcHero">
        <div className="npcContainer">
          <div className="npcBreadcrumbs">
            <Link to="/" className="npcBreadcrumbLink">
              Главная
            </Link>
            <span className="npcBreadcrumbSep">/</span>
            <span className="npcBreadcrumbCurrent">Нужна ли вам консультация проктолога?</span>
          </div>

          <h1 className="npcTitle">Нужна ли вам консультация проктолога?</h1>
        </div>
      </div>

      <div className="npcMain">
        <div className="npcContainer">
          <div className="npcCard">
            <h2 className="npcInnerTitle">Нужна ли вам консультация проктолога?</h2>

            <p className="npcSubtitle">Для получения результата заполните ответы на все вопросы.</p>

            {!allAnswered && submitted ? (
              <div className="npcAlert">
                Пожалуйста, ответьте на все вопросы, чтобы получить результат.
              </div>
            ) : null}

            {submitted && allAnswered ? (
              <div className="npcResult">
                <div className="npcResultLabel">Результат</div>
                <div className="npcResultText">{getResultText(totalScore)}</div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate>
              {QUESTIONS.map((question, index) => (
                <fieldset
                  key={question.id}
                  id={question.id}
                  className={`npcQuestion ${
                    submitted && !answers[question.id] ? "isInvalid" : ""
                  }`}
                >
                  <legend className="npcQuestionTitle">
                    <span className="npcQuestionNumber">
                      {String(index + 1).padStart(2, "0")}.
                    </span>
                    <span>{question.title}</span>
                  </legend>

                  <div className="npcOptions">
                    {question.options.map((option, optionIndex) => {
                      const inputId = `${question.id}-${optionIndex}`;

                      return (
                        <label key={inputId} htmlFor={inputId} className="npcOption">
                          <input
                            id={inputId}
                            type="radio"
                            name={question.id}
                            value={option.value}
                            checked={answers[question.id] === option.value}
                            onChange={() => handleChange(question.id, option.value)}
                            className="npcOptionInput"
                          />
                          <span className="npcOptionMark" />
                          <span className="npcOptionText">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              <button type="submit" className="npcSubmit">
                Ответить
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}