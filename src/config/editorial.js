// Content revision, not a claim of medical review. Keep this date stable between builds.
export const auditRevision = '2026-10-10';
export const hemorrhoidSources = [
  { name: 'Минздрав России. Геморрой: клинические рекомендации, 2024 (взрослые)', url: 'https://apicr.minzdrav.gov.ru/api.ashx?id=178_2&op=GetClinrecPdf' },
  { name: 'ASCRS. Hemorrhoids: Expanded Information', url: 'https://www.fascrs.org/Web/Patients/Diseases-and-Conditions/A-Z/Hemorrhoids-Expanded-Information.aspx?WebsiteKey=72e24489-68dc-44d0-8248-ea73cb810d39' },
];
export const hemorrhoidFaq = [
  { question: 'Почему появляется геморрой?', answer: 'Развитие геморроя связано с изменениями кровообращения и тканей, удерживающих геморроидальные узлы. Натуживание и нарушения стула могут способствовать появлению симптомов. Причину жалоб устанавливает врач: кровотечение не всегда связано с геморроем.' },
  { question: 'Можно ли лечить геморрой без операции?', answer: 'У части пациентов симптомы уменьшаются после коррекции питания и стула и назначенного врачом консервативного лечения. Если этого недостаточно, врач рассматривает малоинвазивные вмешательства или операцию с учётом формы заболевания и жалоб.' },
  { question: 'Какая операция лучше всего при геморрое?', answer: 'Универсального метода для всех пациентов нет. Выбор зависит от внутренних и наружных узлов, стадии, симптомов и результатов предыдущего лечения. Показания, риски и альтернативы обсуждают с колопроктологом после осмотра.' },
];

// Add only an actual completed review: reviewerCode must match an existing doctor;
// reviewedAt is the date of that review, not a build date.
export const medicalReviews = {};

export const topicPairs = [
  ['gemorroy', 'lechenie-gemorroya', 'Геморрой', ['геморро']],
  ['analnaya-treshina', 'lechenie-analnoy-treschiny', 'Анальная трещина', ['трещин']],
  ['paraproktit-svishi-pryamoy-kishki', 'lechenie-paraproktita', 'Парапроктит и свищи', ['парапрокт', 'свищ']],
  ['epitelialnyy-kopchikovyy-khod-ekkh', 'lechenie-epitelialnogo-kopchikovogo-khoda', 'Эпителиальный копчиковый ход', ['копчиков', 'экх']],
  ['analnye-kondilomy', 'lechenie-analnoy-kondilomy', 'Анальные кондиломы', ['кондилом']],
  ['rak-pryamoy-kishki', 'lechenie-raka-pryamoy-kishki', 'Рак прямой кишки', ['рак прямой', 'рака прямой']],
  ['rak-tolstoy-kishki', 'lechenie-raka-tolstoy-kishki', 'Рак толстой кишки', ['рак толстой', 'рака толстой', 'колоректальн']],
  ['pakhovaya-gryzha', 'lechenie-pakhovoy-gryzhi', 'Паховая грыжа', ['пахов']],
  ['pupochnaya-gryzha', 'lechenie-pupochnoy-gryzhi', 'Пупочная грыжа', ['пупочн']],
  ['kholecistit', 'lechenie-kholetsistita', 'Холецистит', ['холецистит']],
];
