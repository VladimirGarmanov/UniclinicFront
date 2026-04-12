// src/pages/Reviews/Reviews.js
import React from "react";
import { NavLink } from "react-router-dom";
import "./reviews.css";

const reviews = [
  { slug: "review-1", title: "Отзыв пациента", subtitle: "История выздоровления", img: null },
  { slug: "review-2", title: "Отзыв пациента", subtitle: "", img: null },
  // добавьте отзывы
];

export default function Reviews() {
  return (
    <main className="reviewsPage">
      <div className="reviewsContainer">
        <h1 className="reviewsTitle">Отзывы</h1>
        <div className="reviewsGrid">
          {reviews.map((review) => (
            <NavLink key={review.slug} to={`/reviews/${review.slug}`} className="reviewCard">
              <div className="reviewMedia">
                {review.img ? (
                  <img className="reviewImg" src={review.img} alt={review.title} />
                ) : (
                  <div className="reviewPlaceholder" />
                )}
                <div className="reviewOverlay">
                  <span className="reviewPlay">▶</span>
                </div>
              </div>
              <div className="reviewBody">
                <div className="reviewTitle">{review.title}</div>
                {review.subtitle && <div className="reviewSubtitle">{review.subtitle}</div>}
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </main>
  );
}