export function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export function hasHtml(value) {
  return typeof value === "string" && /<\/?[a-z][\s\S]*>/i.test(value);
}

export function stripHtml(html = "") {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#40;/g, "(")
    .replace(/&#41;/g, ")")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseDateRu(value) {
  if (!value) return 0;

  const s = String(value).trim();

  const match = s.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  if (match) {
    const dd = match[1];
    const mm = match[2];
    const yyyy = match[3];

    return new Date(`${yyyy}-${mm}-${dd}T00:00:00`).getTime();
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const onlyDate = s.slice(0, 10);
    return new Date(`${onlyDate}T00:00:00`).getTime();
  }

  return 0;
}

export function normalizeLegacyQuestion(item) {
  return {
    id: item?.id ?? null,
    code: item?.code || "",
    title: item?.name || "",
    previewText: stripHtml(item?.preview_text || ""),
    detailText: item?.detail_text || "",
    detailTextType: item?.detail_text_type || "text",
    patientName: item?.properties?.NAME?.value || "",
    email: item?.properties?.EMAIL?.value || "",
    date: item?.date_active_from || item?.date_create || "",
    timestamp: parseDateRu(item?.date_active_from || item?.date_create || ""),
    source: "legacy",
  };
}

export function normalizeApiQuestion(item) {
  return {
    id: item?.id ?? null,
    code: item?.code || "",
    title: item?.name || "Вопрос пациента",
    previewText: stripHtml(item?.question_text || item?.preview_text || ""),
    detailText: item?.detail_text || "",
    detailTextType: item?.detail_text_type || "text",
    patientName: item?.patient_name || "",
    email: item?.email || "",
    date: item?.date_active_from || item?.created_at || "",
    timestamp: parseDateRu(item?.date_active_from || item?.created_at || ""),
    source: "db",
  };
}

export function sortQuestionsDesc(items) {
  return [...items].sort((a, b) => {
    if (a.timestamp !== b.timestamp) return b.timestamp - a.timestamp;
    return String(b.code).localeCompare(String(a.code));
  });
}