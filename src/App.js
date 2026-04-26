import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./App.css";

import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";

import Home from "./pages/Home/Home";
import Team, { DoctorDetail } from "./pages/Team/Team";
import Technologies, { TechnologyDetail } from "./pages/Technologies/Technologies";
import Prices from "./pages/Prices/Prices";
import Services, { ServiceDetail } from "./pages/Services/Services";
import Diseases, { DiseaseDetail } from "./pages/Diseases/Diseases";
import Reviews, { ReviewDetail } from "./pages/Reviews/Reviews";
import Contacts from "./pages/Contacts/Contacts";
import NotFound from "./pages/NotFound/NotFound";
import ClinicalCases, {ClinicalCaseDetail} from "./pages/Clinicalcases/Clinicalcases";
import About from "./pages/About/About";
import News, {NewsDetail} from "./pages/News/News";
import Licences from "./pages/Licenses/Licenses";
import Articles, { ArticleDetail } from "./pages/Articles/Articles";
import FecalIncontinenceScalePage from "./pages/ Fecal-incontinence-scale/Fecal-incontinence-scale";
import NeedProctologistConsultationPage from "./pages/Need-proctologist-consultation/Need-proctologist-consultation";
import Questions, {QuestionDetail} from "./pages/Questions/Questions";
import AdminPanel from "./pages/AdminPanel/AdminPanel";
function DefaultLayout() {
  return (
    <div className="appShell">
      <div className="appMain">
        <Header />
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

function HomeLayout() {
  return (
    <div className="homeShell">
      <Outlet />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<HomeLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route element={<DefaultLayout />}>
        <Route path="/team" element={<Team />} />
          <Route path="/clinicalcases" element={<ClinicalCases />} />
          <Route path="/clinicalcases/:slug" element={<ClinicalCaseDetail />} />
        <Route path="/doctors/:slug" element={<DoctorDetail />} />
        <Route path="/fecal-incontinence-scale" element={<FecalIncontinenceScalePage />} />
        <Route path="/need-proctologist-consultation" element={<NeedProctologistConsultationPage />} />
        <Route path="/technologies" element={<Technologies />} />
        <Route path="/technologies/:slug" element={<TechnologyDetail />} />

        <Route path="/prices" element={<Prices />} />

        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />

        <Route path="/diseases" element={<Diseases />} />
        <Route path="/diseases/:slug" element={<DiseaseDetail />} />

<Route path="/reviews" element={<Reviews />} />
<Route path="/reviews/:slug" element={<ReviewDetail />} />

        <Route path="/reviews" element={<Reviews />} />
        <Route path="/contacts" element={<Contacts />} />

        <Route path="/about" element={<About />} />
        <Route path="/news" element={<News />} />
          <Route path="/news:slug" element={<NewsDetail />} />
          <Route path="/questions" element={<Questions />} />
        <Route path="/questions/:slug" element={<QuestionDetail />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
        <Route path="/licenses" element={<Licences />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/questions/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;