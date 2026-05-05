import React from "react";
import { Link, useParams } from "react-router-dom";
import "./team.css";

import doctorsData from "../../assets/info/doctors_full.json";
import {
  AutoEntitySections,
  getItemCode,
  getItemName,
  getPrimaryImage,
} from "../../utils/cms";

const DOCTORS = Array.isArray(doctorsData?.items) ? doctorsData.items : [];

function getPropSingle(item, key) {
  return item?.properties?.[key]?.value?.value || "";
}

export function DoctorDetail() {
  const { slug } = useParams();
  const item = DOCTORS.find((entry) => getItemCode(entry) === slug);

  if (!item) {
    return (
      <section className="teamPage">
        <div className="teamWrap">
          <div className="teamBreadcrumbs">
            <Link to="/" className="teamCrumbLink">
              Главная
            </Link>
            <span className="teamSep">/</span>
            <Link to="/team" className="teamCrumbLink">
              Команда
            </Link>
          </div>
          <h1 className="teamH1">Врач не найден</h1>
        </div>
      </section>
    );
  }

  const photo = getPrimaryImage(item);
  const roles = getPropSingle(item, "PROF");
  const experience = getPropSingle(item, "STAZH");
  const degree = getPropSingle(item, "STEPEN");
  const position = getPropSingle(item, "DOLZHNOST");
  const name = getItemName(item);

  return (
    <section className="teamPage">
      <div className="teamWrap">
        <div className="doctorDetail">
          <div className="teamBreadcrumbs">
            <Link to="/" className="teamCrumbLink">
              Главная
            </Link>
            <span className="teamSep">/</span>
            <Link to="/team" className="teamCrumbLink">
              Команда
            </Link>
            <span className="teamSep">/</span>
            <span className="teamCrumbActive">{name}</span>
          </div>

          <div className="doctorDetailHero">
            {photo ? (
              <div className="doctorDetailPhotoBox">
                <img src={photo} alt={name} className="doctorDetailPhoto" />
              </div>
            ) : null}

            <div className="doctorDetailInfo">
              <h1 className="doctorDetailName">{name}</h1>

              <div className="doctorDetailMeta">
                {roles ? (
                  <p className="doctorDetailMetaItem">
                    <span className="doctorDetailMetaLabel">Специализация</span>
                    {roles}
                  </p>
                ) : null}

                {degree ? (
                  <p className="doctorDetailMetaItem">
                    <span className="doctorDetailMetaLabel">Учёная степень</span>
                    {degree}
                  </p>
                ) : null}

                {position ? (
                  <p className="doctorDetailMetaItem">
                    <span className="doctorDetailMetaLabel">Должность</span>
                    {position}
                  </p>
                ) : null}

                {experience ? (
                  <p className="doctorDetailMetaItem">
                    <span className="doctorDetailMetaLabel">Стаж</span>
                    {experience}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <AutoEntitySections item={item} />
        </div>
      </div>
    </section>
  );
}

export default function Team() {
  return (
    <section className="teamPage">
      <div className="teamWrap">
        <div className="teamBreadcrumbs">
          <Link to="/" className="teamCrumbLink">
            Главная
          </Link>
          <span className="teamSep">/</span>
          <span className="teamCrumbActive">Команда</span>
        </div>

        <h1 className="teamH1">Команда</h1>

        <div className="teamGrid">
          {DOCTORS.map((doctor) => {
            const photo = getPrimaryImage(doctor);
            const roles = getPropSingle(doctor, "PROF");
            const experience = getPropSingle(doctor, "STAZH");
            const degree = getPropSingle(doctor, "STEPEN");
            const position = getPropSingle(doctor, "DOLZHNOST");
            const code = getItemCode(doctor);
            const name = getItemName(doctor);

            return (
              <article className="teamCard" key={doctor?.fields?.ID || code}>
                <div className="teamPhotoBox">
                  {photo ? (
                    <div className="teamPhotoFrame">
                      <img src={photo} alt={name} className="teamPhoto" />
                    </div>
                  ) : null}
                </div>

                <div className="teamText">
                  <Link to={`/doctors/${code}`} className="teamNameLink">
                    {name}
                  </Link>

                  {roles ? <div className="teamRoles">{roles}</div> : null}
                  {degree ? <div className="teamDegree">{degree}</div> : null}
                  {position ? <div className="teamPosition">{position}</div> : null}
                  {experience ? (
                    <div className="teamExp">
                      <span className="teamExpLabel">Стаж:</span> {experience}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
