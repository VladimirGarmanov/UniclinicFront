import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./fecal-incontinence-scale.css";

const QUESTIONS = [
  {
    id: "solid-stool",
    title: "Бывают ли у Вас эпизоды неудержания плотного кала?",
    options: [
      { value: "0", label: "Никогда" },
      { value: "1", label: "Меньше 1 раза в месяц" },
      { value: "2", label: "Меньше 1 раза в неделю, но больше 1 раза в месяц" },
      { value: "3", label: "Меньше 1 раза в день, но больше 1 раза в неделю" },
      { value: "4", label: "Больше 1 раза в день" },
    ],
  },
  {
    id: "liquid-stool",
    title: "Бывают ли у Вас эпизоды неудержания жидкого кала?",
    options: [
      { value: "0", label: "Никогда" },
      { value: "1", label: "Меньше 1 раза в месяц" },
      { value: "2", label: "Меньше 1 раза в неделю, но больше 1 раза в месяц" },
      { value: "3", label: "Меньше 1 раза в день, но больше 1 раза в неделю" },
      { value: "4", label: "Больше 1 раза в день" },
    ],
  },
  {
    id: "gas",
    title: "Бывают ли у Вас эпизоды неудержания газов?",
    options: [
      { value: "0", label: "Никогда" },
      { value: "1", label: "Меньше 1 раза в месяц" },
      { value: "2", label: "Меньше 1 раза в неделю, но больше 1 раза в месяц" },
      { value: "3", label: "Меньше 1 раза в день, но больше 1 раза в неделю" },
      { value: "4", label: "Больше 1 раза в день" },
    ],
  },
  {
    id: "pads",
    title: "Приходится ли Вам носить прокладки?",
    options: [
      { value: "0", label: "Никогда" },
      { value: "1", label: "Меньше 1 раза в месяц" },
      { value: "2", label: "Меньше 1 раза в неделю, но больше 1 раза в месяц" },
      { value: "3", label: "Меньше 1 раза в день, но больше 1 раза в неделю" },
      { value: "4", label: "Больше 1 раза в день" },
    ],
  },
  {
    id: "lifestyle",
    title: "Изменился ли Ваш образ жизни всвязи с анальным недержанием?",
    options: [
      { value: "0", label: "Нет" },
      { value: "1", label: "Немного" },
      { value: "2", label: "Средне" },
      { value: "3", label: "Существенно" },
      { value: "4", label: "Координально" },
    ],
  },
];

function getResultText(total) {
  if (total <= 4) {
    return `Сумма баллов: ${total}. Выраженных признаков анального недержания по данной шкале не выявлено или они минимальны.`;
  }

  if (total <= 8) {
    return `Сумма баллов: ${total}. Имеются легкие проявления анального недержания. Желательна консультация специалиста при наличии жалоб.`;
  }

  if (total <= 14) {
    return `Сумма баллов: ${total}. Имеются умеренные проявления анального недержания. Рекомендуется очная консультация колопроктолога.`;
  }

  return `Сумма баллов: ${total}. Выраженность симптомов высокая. Рекомендуется как можно скорее обратиться к колопроктологу для обследования и подбора лечения.`;
}

export default function FecalIncontinenceScalePage() {
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
    <section className="fisPage">
      <div className="fisHero">
        <div className="fisContainer">
          <div className="fisBreadcrumbs">
            <Link to="/" className="fisBreadcrumbLink">
              Главная
            </Link>
            <span className="fisBreadcrumbSep">/</span>
            <span className="fisBreadcrumbCurrent">Опрос</span>
          </div>

          <h1 className="fisTitle">Шкала для оценки уровня анального недержания (кала)</h1>
        </div>
      </div>

      <div className="fisMain">
        <div className="fisContainer">
          <div className="fisCard">
            <div className="fisIntro">
              <p>
                Существуют различные классификации недостаточности анального сфинктера, с помощью
                которых можно оценить тяжесть инконтиненции. Самой распространенной является шкала
                Кливлендской клиники (Wexner), по которой пациентом самостоятельно оцениваются
                степень и частота эпизодов инконтиненции, необходимость использования специальных
                гигиенических средств, степень влияния анальной инконтиненции на качество жизни.
              </p>
            </div>

            <p className="fisSubtitle">Для получения результата заполните ответы на все вопросы.</p>

            {!allAnswered && submitted ? (
              <div className="fisAlert">
                Пожалуйста, ответьте на все вопросы, чтобы получить результат.
              </div>
            ) : null}

            {submitted && allAnswered ? (
              <div className="fisResult">
                <div className="fisResultLabel">Результат</div>
                <div className="fisResultText">{getResultText(totalScore)}</div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate>
              {QUESTIONS.map((question, index) => (
                <fieldset
                  key={question.id}
                  id={question.id}
                  className={`fisQuestion ${
                    submitted && !answers[question.id] ? "isInvalid" : ""
                  }`}
                >
                  <legend className="fisQuestionTitle">
                    <span className="fisQuestionNumber">
                      {String(index + 1).padStart(2, "0")}.
                    </span>
                    <span>{question.title}</span>
                  </legend>

                  <div className="fisOptions">
                    {question.options.map((option) => {
                      const inputId = `${question.id}-${option.value}`;

                      return (
                        <label key={inputId} htmlFor={inputId} className="fisOption">
                          <input
                            id={inputId}
                            type="radio"
                            name={question.id}
                            value={option.value}
                            checked={answers[question.id] === option.value}
                            onChange={() => handleChange(question.id, option.value)}
                            className="fisOptionInput"
                          />
                          <span className="fisOptionMark" />
                          <span className="fisOptionText">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              <button type="submit" className="fisSubmit">
                Ответить
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}