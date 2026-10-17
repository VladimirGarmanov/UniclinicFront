import QuestionForm from "../../components/Shared/QuestionForm";
import LiveEditorial from "../../components/Shared/LiveEditorial";
import Header from "../../components/Header/Header";
import homeContent from "../../assets/info/home-content.json";
import AppointmentForm from "../../components/Shared/AppointmentForm";
import Image from "../../components/Shared/Image";
import { normalizeUrl } from "../../config/urls";
import { clinic } from "../../config/site";
import React, { useMemo } from "react";

import "./home.css";

/**
 * HERO / UI
 */
import heroBg from "../../assets/home/9at58kjh5xg4451pkfzq0qxvvow2gzen.jpg";
import logoWhite from "../../assets/home/logo-white.png";
import goodPlace from "../../assets/home/good-place.png";

/**
 * SERVICE ICONS
 */
import iconAmbulanceSvg from "../../assets/home/ambulance.svg";
import iconHeartSvg from "../../assets/home/heart.svg";
import iconStethoSvg from "../../assets/home/stethoscope.svg";

/**
 * DOCTORS
 */
import docGallyamov from "../../assets/team/galyamov.jpg";
import docMarkaryan from "../../assets/team/markaryan.jpg";
import docKubyshkin from "../../assets/team/kubyshkin.jpg";
import docGarmanova from "../../assets/team/garmanova.png";
import docAgapov from "../../assets/team/agapov.jpg";
import docBabadzhanyan from "../../assets/team/babadzhanyan.jpg";

export default function Home() {
  const serviceCards = useMemo(
    () => [
      {
        icon: iconAmbulanceSvg,
        title: "Бесплатное лечение по полису ОМС",
        href: "/services/prices/besplatnoe-lechenie-po-polisu-oms/",
        desc:
          "Вид социального страхования граждан Российской Федерации, представляющий собой обеспечение гарантий бесплатного оказания медицинской помощи при выявлении хирургических заболеваний.",
      },
      {
        icon: iconHeartSvg,
        title: "Лечение по квоте (ВМП)",
        href: "/services/prices/lechenie-po-kvote-po-programme-vmp/",
        desc:
          "Оказание медицинской помощи при наиболее тяжелых заболеваниях ЖКТ, требующих обязательного использования дорогостоящего инструментария и/или применения сложных хирургических методик.",
      },
      {
        icon: iconStethoSvg,
        title: "Лечение на платной основе",
        href: "/services/prices/lechenie-na-platnoy-osnove/",
        desc:
          "Предполагает возможность получения медицинской помощи при любом хирургическом заболевании, независимо от наличия полиса ОМС, без необходимости оформления дополнительных документов и получения квоты, для граждан всех стран мира.",
      },
    ],
    []
  );

  const diseases = useMemo(
    () => [
      {
        title: "Лапароскопическая хирургия",
        items: [
          { label: "Диастаз прямых мышц живота", href: "/diseases/diastaz-pryamykh-myshts-zhivota/" },
          { label: "Паховая грыжа", href: "/diseases/pakhovaya-gryzha-foto-simptomy-lechenie/" },
          { label: "Пупочная грыжа", href: "/diseases/pupochnaya-gryzha/" },
          { label: "Грыжа пищеводного отверстия диафрагмы", href: "/diseases/gryzha-pishevodnogo-otverstiya-diafragmy/" },
          { label: "Послеоперационная грыжа", href: "/diseases/posleoperacionnaya-gryzha/" },
          { label: "Холецистит", href: "/diseases/kholecistit/" },
          { label: "Грыжа белой линии живота", href: "/diseases/gryzha-beloy-linii-zhivota/" },
        ],
      },
      {
        title: "Колопроктология",
        items: [
          { label: "Анальная трещина", href: "/diseases/analnaya-treshina/" },
          { label: "Анальные кондиломы", href: "/diseases/analnye-kondilomy/" },
          { label: "Геморрой", href: "/diseases/gemorroy/" },
          { label: "Запор", href: "/diseases/zapor/" },
          { label: "Свищи прямой кишки", href: "/diseases/paraproktit-svishi-pryamoy-kishki/" },
          { label: "Эпителиальный копчиковый ход (ЭКХ)", href: "/diseases/epitelialnyy-kopchikovyy-khod-ekkh/" },
          { label: "Стома после операций на кишечнике", href: "/diseases/stoma-posle-operaciy-na-kishechnike/" },
        ],
      },
      {
        title: "Онкология",
        items: [
          { label: "Метастатическое поражение печени", href: "/diseases/metastaticheskoe-porazhenie-pecheni/" },
          { label: "Рак желудка", href: "/diseases/rak-zheludka/" },
          { label: "Рак печени", href: "/diseases/rak-pecheni/" },
          { label: "Рак прямой кишки", href: "/diseases/rak-pryamoy-kishki/" },
          { label: "Рак толстой кишки", href: "/diseases/rak-tolstoy-kishki/" },
          { label: "Рак поджелудочной железы", href: "/diseases/rak-podzheludochnoy-zhelezy/" },
          { label: "Обследование на раковые заболевания", href: "/diseases/obsledovanie-na-rakovye-zabolevaniya/" },
        ],
      },
    ],
    []
  );

  const doctors = useMemo(
    () => [
      {
        name: "Галлямов Эдуард Абдулхаевич",
        role: "Врач-хирург, онколог",
        exp: "32 года",
        degree: "доктор медицинских наук, профессор",
        job: "заместитель директора по хирургии",
        href: "/doctors/gallyamov-eduard-abdulkhaevich/",
        img: docGallyamov,
      },
      {
        name: "Маркарьян Даниил Рафаэлевич",
        role: "Врач-колопроктолог, онколог, хирург",
        exp: "15 лет",
        degree: "кандидат медицинских наук",
        job: "заведующий хирургическим отделением",
        href: "/doctors/markaryan-daniil-rafaelevich/",
        img: docMarkaryan,
      },
      {
        name: "Кубышкин Валерий Алексеевич",
        role: "Врач-хирург",
        exp: null,
        degree: "академик РАН, доктор медицинских наук, профессор",
        job: "руководитель отдела хирургии МНОЦ МГУ",
        href: "/doctors/kubyshkin-valeriy-alekseevich/",
        img: docKubyshkin,
      },
      {
        name: "Гарманова Татьяна Николаевна",
        role: "Врач-колопроктолог, онколог, хирург",
        exp: "14 лет",
        degree: "кандидат медицинских наук",
        job: null,
        href: "/doctors/garmanova-tatyana-nikolaevna/",
        img: docGarmanova,
      },
      {
        name: "Агапов Михаил Андреевич",
        role: "Врач-хирург, онколог, колопроктолог",
        exp: "16 лет",
        degree: "доктор медицинских наук, профессор",
        job: null,
        href: "/doctors/agapov-mikhail-andreevich/",
        img: docAgapov,
      },
      {
        name: "Бабаджанян Арутюн Радионович",
        role: "Врач-эндоскопист, колопроктолог, онколог, хирург",
        exp: "10 лет",
        degree: "кандидат медицинских наук",
        job: "Заведующий эндоскопическим отделением",
        href: "/doctors/babadzhanyan-arutyun-radionovich-/",
        img: docBabadzhanyan,
      },
    ],
    []
  );

  const clinicalCases = homeContent.clinicalcases || [];
  const articles = homeContent.articles || [];
  const news = homeContent.news || [];

  return (
    <div className="homePage">
      <Header showBrand={false} />
      <main id="main-content" className="homeMain">
      <section
        className="homeHero"
      >
        <Image className="homeHeroImage" src={heroBg} alt="" loading="eager" fetchPriority="high" sizes="100vw" />
        <div className="homeHeroInfo">
          <div className="homeContainer homeHeroInfoInner">
            <a className="homeHeroBrand" href="/">
              <Image loading="eager" className="homeHeroLogo" src={logoWhite} alt={clinic.name} />
              <div className="homeHeroBrandText">
                <div className="homeHeroBrandTitle">{clinic.name}</div>
                <div className="homeHeroBrandSub">МНОЦ МГУ имени М. В. Ломоносова</div>
              </div>
            </a>

            <div className="homeHeroMeta">
              <a className="homeHeroGoodPlace" href="/news/khoroshee-mesto">
                <Image src={goodPlace} alt="Хорошее место" />
              </a>

              <div className="homeHeroMetro">
                <div className="homeHeroMetroRow">
                  <span className="dot dotRed" />
                  <span>Метро «Университет»</span>
                  <span className="homeHeroMetroGap"> · </span>
                  <span className="dot dotYellow" />
                  <span>Метро «Ломоносовский пр-кт»</span>
                </div>
                <div className="homeHeroAddr">{clinic.address}</div>
                <div className="homeHeroHours">{clinic.hours}</div>
              </div>
            </div>

            <a
              className="homeHeroCta"
              href="#appointment"
            >
              Онлайн запись
            </a>


          </div>
        </div>

        <div className="homeHeroText">
          <div className="homeContainer">
            <h1 className="homeHeroTitle">
              Отделение хирургии и торакоабдоминальной онкологии. Центр экспертной проктологии
            </h1>
            <div className="homeHeroLine" />
            <p className="homeHeroDesc">
              Комплексный подход в лечении пациентов с хирургическими, онкологическими и проктологическими заболеваниями
            </p>

            <div className="homeHeroScroll">
              <span>Узнать больше</span>
              <span className="homeHeroChevron">⌄</span>
            </div>
          </div>
        </div>
      </section>

      <section className="homeContactSection homeContainer" aria-labelledby="contact-title">
        <h2 id="contact-title">Свяжитесь с клиникой</h2>
        <div className="homeContactActions">
          <a href="https://t.me/surgerymgu_bot?start=website" target="_blank" rel="noopener noreferrer"><strong>Написать в Telegram</strong><span>Помощник соберёт обращение и передаст команде клиники</span></a>
          <a href="#appointment"><strong>Перезвоните мне</strong><span>Оставьте имя и телефон для обратного звонка</span></a>
          <a href="#ask-question"><strong>Задать вопрос</strong><span>Отправьте вопрос через сайт</span></a>
        </div>
        <AppointmentForm initialType="callback" compact />
        <QuestionForm />
      </section>
      <LiveEditorial />
        <section className="homeSection">
          <div className="homeContainer">
            <h2 className="homeH1">
              Хирургическое отделение университетской клиники МГУ им. М.В. Ломоносова
            </h2>

            <div className="homeServiceGrid">
              {serviceCards.map((s) => (
                <a key={s.href} href={normalizeUrl(s.href)} className="homeServiceCard">
                  <div className="homeServiceIcon">
                    <Image src={s.icon} alt="" />
                  </div>
                  <div className="homeServiceBody">
                    <div className="homeServiceTitle">{s.title}</div>
                    <div className="homeServiceText">{s.desc}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="homeText">
              <p>
                Основным направлением работы отделения хирургии Университетской клиники МГУ им. М.В. Ломоносова является лечение пациентов с
                доброкачественными и злокачественными заболеваниями органов брюшной полости, малого таза и промежности.
              </p>
              <p>
                В нашей работе мы используем новейшие минимально-инвазивные технологии, что позволяет нам выполнять весь спектр лапароскопических
                операций при злокачественных и доброкачественных заболеваниях органов брюшной полости.
              </p>
              <p>
                Применение лапароскопических методов лечения позволяет нам использовать принципы хирургии быстрого восстановления «Fast track
                surgery», что ведет к более быстрой и комфортной реабилитации пациентов и значительно сокращает сроки пребывания в стационаре.
              </p>
              <p>
                Отделение хирургии является клинической базой кафедры хирургии Факультета Фундаментальной Медицины МГУ им. М.В.Ломоносова
                (заведующий кафедрой – Академик РАН, профессор Валерий Алексеевич Кубышкин).
              </p>
              <p>
                Консультации пациентов сотрудниками отделения проводятся по предварительной записи. Часы работы: {clinic.hours}.
              </p>
            </div>

            <h3 className="homeH2">Что мы лечим</h3>

            <div className="homeDiseasesGrid">
              {diseases.map((b) => (
                <div key={b.title} className="homeDiseaseBlock">
                  <div className="homeDiseaseTitle">{b.title}</div>
                  <ul className="homeList">
                    {b.items.map((it) => (
                      <li key={it.href}>
                        <a href={normalizeUrl(it.href)}>{it.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="homeSection homeSectionAlt">
          <div className="homeContainer">
            <h3 className="homeCenterTitle">НАШИ СПЕЦИАЛИСТЫ</h3>

            <div className="homeDoctorsGrid">
              {doctors.map((d) => (
                <a key={d.href} href={normalizeUrl(d.href)} className="homeDoctorCard">
                  <div className="homeDoctorImgWrap">
                    <Image src={d.img} alt={d.name} className="homeDoctorImg" />
                  </div>
                  <div className="homeDoctorBody">
                    <div className="homeDoctorName">{d.name}</div>
                    <div className="homeDoctorRole">{d.role}</div>
                    {d.exp && <div className="homeDoctorMeta">Стаж: {d.exp}</div>}
                    {d.degree && <div className="homeDoctorDegree">{d.degree}</div>}
                    {d.job && <div className="homeDoctorMeta">{d.job}</div>}
                  </div>
                </a>
              ))}
            </div>

            <div className="homeCenterBtnRow">
              <a className="homeOutlineBtn" href="/team">
                Все специалисты
              </a>
            </div>
          </div>
        </section>

        <section className="homeSection">
          <div className="homeContainer">
            <h3 className="homeCenterTitle">ИСТОРИИ ПАЦИЕНТОВ</h3>

            <div className="homeCards3">
              {clinicalCases.map((c) => (
                <a key={c.href} href={normalizeUrl(c.href)} className="homeMediaCard">
                  <div className="homeMediaImgWrap">
                    <Image src={c.img} alt={c.title} className="homeMediaImg" />
                  </div>
                  <div className="homeMediaBody">
                    <div className="homeMediaTitle">{c.title}</div>
                    <div className="homeMediaText">{c.subtitle}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="homeCenterBtnRow">
              <a className="homeOutlineBtn" href="/clinicalcases">
                Ещё кейсы
              </a>
            </div>
          </div>
        </section>

        <section className="homeSection homeSectionAlt">
          <div className="homeContainer">
            <h3 className="homeCenterTitle">ПОСЛЕДНИЕ СТАТЬИ</h3>

            <div className="homeCards3">
              {articles.map((a) => (
                <a key={a.href} href={normalizeUrl(a.href)} className="homeMediaCard">
                  <div className="homeMediaImgWrap">
                    <Image src={a.img} alt={a.title} className="homeMediaImg" />
                  </div>
                  <div className="homeMediaBody">
                    <div className="homeMediaMeta">{a.date}</div>
                    <div className="homeMediaTitle">{a.title}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="homeCenterBtnRow">
              <a className="homeOutlineBtn" href="/articles">
                Все статьи
              </a>
            </div>
          </div>
        </section>

        <section className="homeSection">
          <div className="homeContainer">
            <h3 className="homeCenterTitle">АРХИВ НОВОСТЕЙ КЛИНИКИ</h3>

            <div className="homeCards3">
              {news.map((n) => (
                <a key={n.href} href={normalizeUrl(n.href)} className="homeMediaCard">
                  <div className="homeMediaImgWrap">
                    <Image src={n.img} alt={n.title} className="homeMediaImg" />
                  </div>
                  <div className="homeMediaBody">
                    <div className="homeMediaMeta">{n.date}</div>
                    <div className="homeMediaTitle">{n.title}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="homeCenterBtnRow">
              <a className="homeOutlineBtn" href="/news">
                Все новости
              </a>
            </div>
          </div>
        </section>

</main>

    </div>
  );
}
