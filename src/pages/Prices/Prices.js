import React, { useMemo, useState } from "react";
import "./prices.css";
import { PRICES } from "./pricesData";

const nf = new Intl.NumberFormat("ru-RU");

export default function Prices() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRICES;
    return PRICES.filter((x) => x.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <main className="pricesPage">
      <div className="pricesContainer">
        <h1 className="pricesH1">Цены</h1>

        <div className="pricesSearchWrap">
          <input
            className="pricesSearch"
            placeholder=""
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="pricesSearchIcon" aria-hidden>
            {/* лупа */}
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M10.5 3a7.5 7.5 0 1 0 4.55 13.47l3.74 3.73a1 1 0 0 0 1.42-1.41l-3.73-3.74A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        <div className="pricesTableWrap">
          <table className="pricesTable">
            <thead>
              <tr>
                <th className="pricesThLeft">Услуга</th>
                <th className="pricesThRight">Цена</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={`${row.name}-${idx}`} className="pricesRow">
                  <td className="pricesTdName">{row.name}</td>
                  <td className="pricesTdPrice">{nf.format(row.price)} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="pricesEmpty">Ничего не найдено</div>
          )}
        </div>
      </div>
    </main>
  );
}