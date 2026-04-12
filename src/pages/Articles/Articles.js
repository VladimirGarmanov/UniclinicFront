import React from "react";
import { Link, useParams } from "react-router-dom";
import "./articles.css";

import articlesData from "../../assets/info/articles_full.json";
import { AutoEntitySections, DetailTopBlock, getItemCode, getItemName, getPreviewText, getPrimaryImage } from "../../utils/cms";

const ARTICLES = Array.isArray(articlesData?.items) ? articlesData.items : [];

export function ArticleDetail() {
  const { slug } = useParams();
  const item = ARTICLES.find((entry) => getItemCode(entry) === slug);

  if (!item) {
    return (
      <section className="articlesPage">
        <div className="articlesWrap">
          <div className="articlesBreadcrumbs">
            <Link to="/" className="articlesCrumbLink">Главная</Link>
            <span className="articlesSep">/</span>
            <Link to="/articles" className="articlesCrumbLink">Статьи</Link>
          </div>
          <h1 className="articlesH1">Статья не найдена</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="articlesPage">
      <div className="articlesWrap">
        <DetailTopBlock item={item} backLabel="Статьи" backTo="/articles" />
        <AutoEntitySections item={item} />
      </div>
    </section>
  );
}

export default function Articles() {
  return (
    <section className="articlesPage">
      <div className="articlesWrap">
        <div className="articlesBreadcrumbs">
          <Link to="/" className="articlesCrumbLink">Главная</Link>
          <span className="articlesSep">/</span>
          <span className="articlesCrumbActive">Статьи</span>
        </div>

        <h1 className="articlesH1">Статьи</h1>

        <div className="articlesGrid">
          {ARTICLES.map((item) => {
            const image = getPrimaryImage(item);
            const desc = getPreviewText(item);
            const code = getItemCode(item);
            const name = getItemName(item);

            return (
              <article className="articlesCard" key={item?.fields?.ID || code}>
                {image ? (
                  <Link to={`/articles/${code}`} className="articlesCardMediaLink">
                    <img src={image} alt={name} className="articlesCardImage" />
                    <span className="articlesCardOverlay">
                      <span className="articlesCardOverlayPill">Подробнее</span>
                    </span>
                  </Link>
                ) : null}

                <div className="articlesCardBody">
                  <h3 className="articlesCardTitle">
                    <Link to={`/articles/${code}`} className="articlesCardTitleLink">
                      {name}
                    </Link>
                  </h3>

                  {desc ? <p className="articlesCardDesc">{desc}</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}