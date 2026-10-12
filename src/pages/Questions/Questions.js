import QuestionForm from "../../components/Shared/QuestionForm";
import { track } from "../../utils/analytics";
import Consent, { CONSENT_VERSION } from "../../components/Shared/Consent";
import { sanitize } from "../../utils/sanitize";
import React, { useState } from "react";
import { Link, useParams, useLocation } from "../../utils/router";
import legacyQuestionsData from "../../assets/info/questions.json";
import {
  normalizeLegacyQuestion,
  normalizeApiQuestion,
  sortQuestionsDesc,
  hasHtml,
} from "../../utils/questions";
import "./questions.css";

import Pagination from "../../components/Shared/Pagination";
import RecentPublications from "../../components/Shared/RecentPublications";
import { archivePage } from "../../utils/pagination";
const API_BASE = "";

const LEGACY_QUESTIONS = Array.isArray(legacyQuestionsData?.items)
  ? legacyQuestionsData.items.map(normalizeLegacyQuestion)
  : [];


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
  const item = LEGACY_QUESTIONS.find((entry) => entry.code === slug);

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
  const { search } = useLocation();
  const pagination = archivePage(legacyQuestionsData, sortQuestionsDesc(LEGACY_QUESTIONS), search);
  const questions = pagination.items;

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

        <RecentPublications kind="questions" />
        <div className="qaList">
          {questions.map((item) => (
            <QuestionCard key={`${item.source}-${item.id}-${item.code}`} item={item} />
          ))}
        </div>
        <Pagination base="/questions" {...pagination} />
      </div>
    </section>
  );
}
