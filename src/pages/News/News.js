// src/pages/News/News.js
import React from "react";
import { NavLink } from "react-router-dom";
import "./news.css";

const newsItems = [
  { slug: "news-1", date: "01.01.2024", title: "Заголовок новости", img: null },
  { slug: "news-2", date: "15.02.2024", title: "Заголовок новости", img: null },
  // добавьте новости
];

export default function News() {
  return (
    <main className="newsPage">
      <div className="newsContainer">
        <h1 className="newsTitle">Новости клиники</h1>
        <div className="newsGrid">
          {newsItems.map((item) => (
            <NavLink key={item.slug} to={`/news/${item.slug}`} className="newsCard">
              <div className="newsMedia">
                {item.img ? (
                  <img className="newsImg" src={item.img} alt={item.title} />
                ) : (
                  <div className="newsPlaceholder" />
                )}
              </div>
              <div className="newsBody">
                <div className="newsDate">{item.date}</div>
                <div className="newsCardTitle">{item.title}</div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </main>
  );
}