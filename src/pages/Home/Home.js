import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./home.css";

/**
 * HERO / UI
 */
import heroBg from "../../assets/home/9at58kjh5xg4451pkfzq0qxvvow2gzen.jpg";
import logoWhite from "../../assets/home/logo-white.png";
import goodPlace from "../../assets/home/good-place.png";

/**
 * HEADER ICONS
 */
import iconWhatsappImg from "../../assets/home/whatsapp.svg";
import iconVkImg from "../../assets/home/whatsapp.svg";
import iconTelegramImg from "../../assets/home/telegram_white.svg";
import iconEyeImg from "../../assets/home/eye.svg";
import iconSearchImg from "../../assets/home/eye.svg";

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

/**
 * CLINICAL CASES
 */
import ccGoodEnding from "../../assets/home/nm927mmblu9v2p8cdlne7dg9g2nc4y3d.jpg";
import ccBigTumor from "../../assets/home/zaqfd0q1dbycfs1qoohpklb25663bki5.jpg";
import ccLiverCancer from "../../assets/home/ex1q73nujn7g6m51r299v90asjsczpje.jpg";
import ccHemorrhoids from "../../assets/home/ts48qoec1b6z0thcodxvmp6ukyzkch77.jpg";
import ccAbdominalTumor from "../../assets/home/b7sadlq53giyc7ciyew8x5nq9lfy86ro.jpg";
import ccPriceOfMistake from "../../assets/home/d6nq5h6p5hp52znck7ze0rbky14b83ov.jpg";
import ccSimultaneous from "../../assets/home/mpaf8wq7n9txhumcjf4h8qun2mttcznt.jpg";
import ccRectalCancer from "../../assets/home/5x0yhun8f5mon6jn1lp0m92yn9v6ji5z.jpg";
import ccSigmoidTumor from "../../assets/home/30bk3iu6jz12d31dopl59vr3bfdz3gfm.png";
import ccSaved2Weeks from "../../assets/home/r35ucpgr5lh3kr7lmzomwgynh03s070s.jpg";
import ccBigColonTumor from "../../assets/home/sxwed8iachq46hg6mnufueej3q0bpdpb.jpg";
import ccHardPath from "../../assets/home/hr8nacu54y5z6tub5qa3z9482r9cys7k.jpg";

/**
 * ARTICLES
 */
import artColonoscopy from "../../assets/home/acju4x0xicqgnkczmdlqc5b3rtuz4ahk.jpg";
import artShameProctologist from "../../assets/home/jqwcdr70nxcextdvh1rqb5qmt4jnq79w.jpg";
import artDetoxMyth from "../../assets/home/zzzx6qmv4wdpn2jnzuhjx96u16womx89.jpg";
import artShamePain from "../../assets/home/550944a670145c94f53c843845dc0487.jpg";
import artCRC from "../../assets/home/5rqb112ilflvaooalqi172kg0ughscbz.jpg";
import artCancerTypes from "../../assets/home/m89vy4h4sgus73iy4drxdb7d2cs6fmfs.jpg";
import artRulesDoc from "../../assets/home/kdhwmqq2gkadbr7h8z27qsluomoj2ah1.jpg";
import artHemorrhoidsAdvice from "../../assets/home/pvtmej03a3sbaasxh2an1ct50nh1jp3s.jpeg";
import art9Questions from "../../assets/home/hmx66e5dw3m5tyik9djfg13whhlzbc0l.jpg";
import artHemorrhoidsMenWomen from "../../assets/home/b232xygnq34nzh2d0uewx13q06nwg5zu.jpg";
import artMythsCRC from "../../assets/home/aj1pcxra2reqmn1o6m2vasdjwh4ii8ao.jpg";
import artPolyps from "../../assets/home/qeqfuz6idk8cp2e3il0t9qij86wqgujj.jpg";

/**
 * NEWS
 */
import newsConference from "../../assets/home/5als3phsqzwyqtiprzykmguxn23sj8ew.jpg";
import newsUzi from "../../assets/home/pdw6mxsei4fcok27xkzwqfjvfuzbwa6o.png";
import newsScheduleChange from "../../assets/home/6loioo6uv0kbvvpt7eew1nyuazo29h34.png";
import newsAmbColoproctology from "../../assets/home/403bocuyswm751ieofonkdoaq1vukswc.jpg";
import newsChelyabinsk from "../../assets/home/g82605by3uw4b3a5glqvx2wzm2w77v8k.jpg";
import newsKemerovo from "../../assets/home/khr8k2fgs6k53jnqub8e5mljajldb8h5.jpg";
import newsBot from "../../assets/home/3gfti5kl4yh9lajhywn5blw1f80xzhj1.jpg";
import newsGoodPlaceStory from "../../assets/home/nu3p062tz4zkdosk3go47nrh1se4am77.jpg";
import newsCupFFM from "../../assets/home/wwqrd044d6qkilrluog4qc77gcq06j6x.jpg";
import newsDiscussionClub from "../../assets/home/j1k1ly2r73e2h0qoxlehgcnaq9k95b71.png";
import newsMasterClassProcto from "../../assets/home/a5d55v7vegm0f2qsya760miew83evc11.jpg";
import newsMakhachkala from "../../assets/home/blx791ae4pkuu3ybxo0kjt8ml38b5hwg.jpg";

export default function Home() {
  const [isStuck, setIsStuck] = useState(false);
  const [isPatientsOpen, setIsPatientsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobilePatientsOpen, setIsMobilePatientsOpen] = useState(false);

  const patientsMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setIsStuck(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (
        patientsMenuRef.current &&
        !patientsMenuRef.current.contains(event.target)
      ) {
        setIsPatientsOpen(false);
      }

      if (
        mobileMenuRef.current &&
        isMobileMenuOpen &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".homeHdrBurger") &&
        !event.target.closest(".homeHeroMobileBurger")
      ) {
        setIsMobileMenuOpen(false);
        setIsMobilePatientsOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsPatientsOpen(false);
        setIsMobileMenuOpen(false);
        setIsMobilePatientsOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMenus = () => {
    setIsPatientsOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobilePatientsOpen(false);
  };

  const navItems = useMemo(
    () => [
      { to: "/", label: "Главная", end: true },
      { to: "/team", label: "Команда" },
      { to: "/technologies", label: "Технологии" },
      { to: "/prices", label: "Цены" },
      { to: "/services", label: "Услуги" },
      { to: "/diseases", label: "Заболевания" },
      { to: "/reviews", label: "Отзывы" },
      { to: "/contacts", label: "Контакты" },
    ],
    []
  );

  const patientsDropdownItems = useMemo(
    () => [
      { to: "/about", label: "О клинике" },
      { to: "/news", label: "Новости" },
      { to: "/articles", label: "Статьи" },
    ],
    []
  );

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

  const clinicalCases = useMemo(
    () => [
      { title: "История с хорошим концом", subtitle: "Что было бы, если бы пациентка к нам не попала?", href: "/clinicalcases/istoriya-s-khoroshim-kontsom/", img: ccGoodEnding },
      { title: "Большая злокачественная опухоль", subtitle: "Банальный дискомфорт в животе?", href: "/clinicalcases/bolshaya-zlokachestvennaya-opukhol/", img: ccBigTumor },
      { title: "Рак печени?", subtitle: "История про то, что … в жизни всякое бывает!", href: "/clinicalcases/rak-pecheni/", img: ccLiverCancer },
      { title: "История про геморрой", subtitle: "В любой момент у нас есть два варианта…", href: "/clinicalcases/istoriya-pro-gemorroy/", img: ccHemorrhoids },
      { title: "Опухоль брюшной полости", subtitle: "История пациента, которому удалось добиться прогресса…", href: "/clinicalcases/opukhol-bryushnoy-polosti/", img: ccAbdominalTumor },
      { title: "Цена ошибки", subtitle: "Насколько дорогой может быть цена ошибки?", href: "/clinicalcases/tsena-oshibki/", img: ccPriceOfMistake },
      { title: "Симультанная хирургия", subtitle: "Сегодня история пациентки…", href: "/clinicalcases/simultannaya-khirurgiya/", img: ccSimultaneous },
      { title: "Рак прямой кишки", subtitle: "«Никогда, никогда, никогда не сдавайся».", href: "/clinicalcases/rak-pryamoy-kishki/", img: ccRectalCancer },
      { title: "Опухоль сигмовидной кишки", subtitle: "Еще одна история пациента…", href: "/clinicalcases/opukhol-sigmovidnoy-kishki-/", img: ccSigmoidTumor },
      { title: "Спастись от рака за 2 недели?", subtitle: "Оказывается, такое возможно!", href: "/clinicalcases/spastis-ot-raka-za-2-nedeli/", img: ccSaved2Weeks },
      { title: "История про удаление большой опухоли", subtitle: "Удаление большой опухоли правых отделов…", href: "/clinicalcases/bolshaya-opukhol-pravykh-otdelov-obodochnoy-kishki/", img: ccBigColonTumor },
      { title: "История пациента: трудный путь лечения", subtitle: "Давно не публиковали истории…", href: "/clinicalcases/istoriya-patsienta-trudnyy-put-lecheniya/", img: ccHardPath },
    ],
    []
  );

  const articles = useMemo(
    () => [
      { title: "Колоноскопия: что надо знать о самом важном исследовании в жизни", href: "/articles/kolonoskopiya-chto-nado-znat-o-samom-vazhnom-issledovanii-v-zhizni-k/", img: artColonoscopy, date: "23 июня 2024" },
      { title: "Как преодолеть стыд перед проктологом…", href: "/articles/kak-preodolet-styd-pered-proktologom-i-ne-proglyadet-smertelnyy-nedug/", img: artShameProctologist, date: "07 июня 2024" },
      { title: "«Бессмысленно и вредно». Почему не стоит чистить организм от шлаков?", href: "/articles/bessmyslenno-i-vredno-pochemu-ne-stoit-chistit-organizm-ot-shlakov/", img: artDetoxMyth, date: "22 мая 2024" },
      { title: "Стыдная боль. О чем говорит некомфорт в области толстой кишки", href: "/articles/stydnaya-bol-o-chem-govorit-nekomfort-v-oblasti-tolstoy-kishki/", img: artShamePain, date: "13 мая 2024" },
      { title: "Колоректальный рак: почему он возникает…", href: "/articles/kolorektalnyy-rak-pochemu-on-voznikaet-kak-ego-lechat-i-pochemu-patsienty-ne-obrashchayutsya-k-vrach/", img: artCRC, date: "06 мая 2024" },
      { title: "Врач-колопроктолог назвала типы рака…", href: "/articles/vrach-koloproktolog-nazvala-tipy-raka-nichem-sebya-ne-proyavlyayushchego-na-rannikh-stadiyakh/", img: artCancerTypes, date: "23 апреля 2024" },
      { title: "Какие правила соблюдает врач-колопроктолог…", href: "/articles/kakie-pravila-soblyudaet-vrach-koloproktolog-chtoby-ne-stat-sobstvennym-patsientom-mozhno-li-izbezha/", img: artRulesDoc, date: "15 апреля 2024" },
      { title: "Как распознать и лечить геморрой — советы врача", href: "/articles/kak-raspoznat-i-lechit-gemorroy-sovety-vracha/", img: artHemorrhoidsAdvice, date: "11 апреля 2024" },
      { title: "9 неудобных вопросов колопроктологу…", href: "/articles/9-neudobnykh-voprosov-koloproktologu-vsye-chto-nuzhno-znat-pered-priyemom/", img: art9Questions, date: "04 апреля 2024" },
      { title: "Геморрой у мужчин и женщин: есть ли разница…", href: "/articles/gemorroy-u-muzhchin-i-zhenshchin-est-li-raznitsa-v-lechenii-i-profilaktike/", img: artHemorrhoidsMenWomen, date: "01 апреля 2024" },
      { title: "Не только пожилые. Врач развеяла 7 мифов о колоректальном раке", href: "/articles/ne-tolko-pozhilye-vrach-razveyala-7-glavnykh-mifov-o-kolorektalnom-rake/", img: artMythsCRC, date: "25 марта 2024" },
      { title: "Страшные…полипы", href: "/articles/strashnye-polipy/", img: artPolyps, date: "20 февраля 2023" },
    ],
    []
  );

  const news = useMemo(
    () => [
      { title: "Конференция «Современная колопроктология…»", href: "/news/konferentsiya-sovremennaya-koloproktologiya-redkie-sluchai-i-nestandartnye-resheniya/", img: newsConference, date: "15 июня 2024" },
      { title: "Уникальное 3D-УЗ исследование…", href: "/news/unikalnoe-3d-uz-issledovanie-analnogo-kanala-i-pryamoi-kishki-transrektalnoe-uzi-truzi-8-iyunya-besp/", img: newsUzi, date: "31 мая 2024" },
      { title: "Изменение графика приема…", href: "/news/izmenenie-grafika-priema-garmanovoy-tatyany-nikolaevny/", img: newsScheduleChange, date: "30 мая 2024" },
      { title: "Всероссийская конференция…", href: "/news/vserossiyskaya-nauchno-prakticheskaya-konferentsiya-sovremennye-metody-lecheniya-v-ambulatornoy-kolo/", img: newsAmbColoproctology, date: "17 мая 2024" },
      { title: "Мастер-класс в Челябинске", href: "/news/master-klass-v-chelyabinske/", img: newsChelyabinsk, date: "20 апреля 2024" },
      { title: "А у меня был случай..., г..Кемерово", href: "/news/a-u-menya-byl-sluchay-g-kemerovo/", img: newsKemerovo, date: "06 апреля 2024" },
      { title: "У нас появился помощник для наших пациентов!", href: "/news/u-nas-poyavilsya-pomoshchnik-dlya-nashikh-patsientov/", img: newsBot, date: "01 апреля 2024" },
      { title: "Хорошее место!", href: "/news/khoroshee-mesto/", img: newsGoodPlaceStory, date: "29 марта 2024" },
      { title: "Кубок ФФМ МГУ.", href: "/news/vserossiyskaya-studencheskaya-olimpiada-po-meditsine-kubok-ffm-mgu/", img: newsCupFFM, date: "25 марта 2024" },
      { title: "Дискуссионный клуб", href: "/news/diskussionnyy-klub-/", img: newsDiscussionClub, date: "26 октября 2023" },
      { title: "Мастер-класс для проктологов", href: "/news/master-klass-dlya-proktologov/", img: newsMasterClassProcto, date: "16 октября 2023" },
      { title: "9 сентября! А у меня был случай..., г. Махачкала", href: "/news/9-sentyabrya-a-u-menya-byl-sluchay-g-makhachkala/", img: newsMakhachkala, date: "10 сентября 2023" },
    ],
    []
  );

  return (
    <div className="homePage">
      <header className={`homeHdr ${isStuck ? "isStuck" : ""}`}>
        <div className="homeHdrTop">
          <div className="homeContainer homeHdrTopInner">
            <div className="homeHdrTopText">
              Запишитесь на бесплатную онлайн-консультацию!
            </div>
            <a className="homeHdrTopLink" href="/services/onlayn-konsultirovanie/">
              Подробнее
            </a>
          </div>
        </div>

        <div className="homeHdrNav">
          <div className="homeContainer homeHdrNavInner">
            <nav className="homeHdrMenu" aria-label="Навигация">
              {navItems.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={!!it.end}
                  className={({ isActive }) =>
                    `homeHdrLink ${isActive ? "isActive" : ""}`
                  }
                >
                  {it.label}
                </NavLink>
              ))}

              <div ref={patientsMenuRef} className="homeHdrDrop">
                <button
                  type="button"
                  className={`homeHdrLink homeHdrLinkDrop ${isPatientsOpen ? "isActive" : ""}`}
                  onClick={() => setIsPatientsOpen((prev) => !prev)}
                >
                  Пациентам <span className="homeHdrCaret">▾</span>
                </button>

                {isPatientsOpen && (
                  <div className="homeHdrDropMenu">
                    {patientsDropdownItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="homeHdrDropLink"
                        onClick={closeMenus}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            <div className="homeHdrRight">
              <a className="homeHdrPhone" href="tel:+79671367706">
                +7 (967)136 77
                <br />
                06
              </a>

              <div className="homeHdrIcons">
                <a
                  className="homeHdrIconBtn"
                  href="https://wa.me/79671367706"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                >
                  <img src={iconWhatsappImg} alt="" />
                </a>

                <a
                  className="homeHdrIconBtn"
                  href="http://vk.com/surgerymgy"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="VK"
                >
                  <img src={iconVkImg} alt="" />
                </a>

                <a
                  className="homeHdrIconBtn"
                  href="https://t.me/surgerymgu_bot"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                >
                  <img src={iconTelegramImg} alt="" />
                </a>

                <button
                  className="homeHdrIconBtn homeHdrExtraIcon"
                  type="button"
                  aria-label="Версия для слабовидящих"
                >
                  <img src={iconEyeImg} alt="" />
                </button>

                <button
                  className="homeHdrIconBtn homeHdrExtraIcon"
                  type="button"
                  aria-label="Поиск"
                >
                  <img src={iconSearchImg} alt="" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section
        className="homeHero"
        style={{
          "--hero-bg": `url(${heroBg})`,
        }}
      >
        <div className="homeHeroInfo">
          <div className="homeContainer homeHeroInfoInner">
            <a className="homeHeroBrand" href="/">
              <img className="homeHeroLogo" src={logoWhite} alt="Uniclinic" />
              <div className="homeHeroBrandText">
                <div className="homeHeroBrandTitle">ОТДЕЛЕНИЕ ХИРУРГИИ</div>
                <div className="homeHeroBrandSub">МНОЦ МГУ имени М. В. Ломоносова</div>
              </div>
            </a>

            <div className="homeHeroMeta">
              <a className="homeHeroGoodPlace" href="/news/khoroshee-mesto/">
                <img src={goodPlace} alt="Хорошее место" />
              </a>

              <div className="homeHeroMetro">
                <div className="homeHeroMetroRow">
                  <span className="dot dotRed" />
                  <span>Метро «Университет»</span>
                  <span className="homeHeroMetroGap" />
                  <span className="dot dotYellow" />
                  <span>Метро «Ломоносовский пр-кт»</span>
                </div>
                <div className="homeHeroAddr">Москва, Ломоносовский пр-кт 27, 10</div>
                <div className="homeHeroHours">Пн–Пт: 8:00 – 17:00</div>
              </div>
            </div>

            <a
              className="homeHeroCta"
              href="https://t.me/surgerymgu_bot"
              target="_blank"
              rel="noreferrer"
            >
              Онлайн запись
            </a>

            <button
              className="homeHeroMobileBurger"
              type="button"
              aria-label="Открыть меню"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
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

      <main className="homeMain">
        <section className="homeSection">
          <div className="homeContainer">
            <h2 className="homeH1">
              Хирургическое отделение университетской клиники МГУ им. М.В. Ломоносова
            </h2>

            <div className="homeServiceGrid">
              {serviceCards.map((s) => (
                <a key={s.href} href={s.href} className="homeServiceCard">
                  <div className="homeServiceIcon">
                    <img src={s.icon} alt="" />
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
                Основным направлением работы отделения хирургии Университетской клиники МГУ им. М.В. Ломоносова является лечения пациентов с
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
                Консультации пациентов сотрудниками отделения проводятся по будним дням с 9:00 до 17:00 по предварительной записи.
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
                        <a href={it.href}>{it.label}</a>
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
                <a key={d.href} href={d.href} className="homeDoctorCard">
                  <div className="homeDoctorImgWrap">
                    <img src={d.img} alt={d.name} className="homeDoctorImg" />
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
              <a className="homeOutlineBtn" href="/team/">
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
                <a key={c.href} href={c.href} className="homeMediaCard">
                  <div className="homeMediaImgWrap">
                    <img src={c.img} alt={c.title} className="homeMediaImg" />
                  </div>
                  <div className="homeMediaBody">
                    <div className="homeMediaTitle">{c.title}</div>
                    <div className="homeMediaText">{c.subtitle}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="homeCenterBtnRow">
              <a className="homeOutlineBtn" href="/clinicalcases/">
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
                <a key={a.href} href={a.href} className="homeMediaCard">
                  <div className="homeMediaImgWrap">
                    <img src={a.img} alt={a.title} className="homeMediaImg" />
                  </div>
                  <div className="homeMediaBody">
                    <div className="homeMediaMeta">{a.date}</div>
                    <div className="homeMediaTitle">{a.title}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="homeCenterBtnRow">
              <a className="homeOutlineBtn" href="/articles/">
                Все статьи
              </a>
            </div>
          </div>
        </section>

        <section className="homeSection">
          <div className="homeContainer">
            <h3 className="homeCenterTitle">НОВОСТИ КЛИНИКИ</h3>

            <div className="homeCards3">
              {news.map((n) => (
                <a key={n.href} href={n.href} className="homeMediaCard">
                  <div className="homeMediaImgWrap">
                    <img src={n.img} alt={n.title} className="homeMediaImg" />
                  </div>
                  <div className="homeMediaBody">
                    <div className="homeMediaMeta">{n.date}</div>
                    <div className="homeMediaTitle">{n.title}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="homeCenterBtnRow">
              <a className="homeOutlineBtn" href="/news/">
                Все новости
              </a>
            </div>
          </div>
        </section>
      </main>

      {isMobileMenuOpen && (
        <div className="homeHdrMobileOverlay">
          <div className="homeHdrMobileSheet" ref={mobileMenuRef}>
            <div className="homeHdrMobileTop">
              <div className="homeHdrMobileTitle">Меню</div>
              <button
                className="homeHdrMobileClose"
                type="button"
                onClick={closeMenus}
              >
                ✕
              </button>
            </div>

            <div className="homeHdrMobileBody">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={!!item.end}
                  className={({ isActive }) =>
                    `homeHdrMobileLink ${isActive ? "isActive" : ""}`
                  }
                  onClick={closeMenus}
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="homeHdrMobileDrop">
                <button
                  type="button"
                  className={`homeHdrMobileLink homeHdrMobileDropBtn ${
                    isMobilePatientsOpen ? "isActive" : ""
                  }`}
                  onClick={() => setIsMobilePatientsOpen((prev) => !prev)}
                >
                  <span>Пациентам</span>
                  <span>{isMobilePatientsOpen ? "−" : "+"}</span>
                </button>

                {isMobilePatientsOpen && (
                  <div className="homeHdrMobileDropdown">
                    {patientsDropdownItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="homeHdrMobileDropdownLink"
                        onClick={closeMenus}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}