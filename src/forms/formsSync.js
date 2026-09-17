const FORMS_URL = "https://forms.googleapis.com/v1/forms";

async function formsFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Error de Google Forms (${res.status}): ${text}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Crea un formulari nou amb una pregunta de "Nom i cognoms" i una pregunta de caselles
// per a cada categoria del pla d'activitats (rebut com a paràmetre — aquest mòdul no en
// té cap còpia pròpia, per no duplicar-lo). Torna l'identificador del formulari, l'enllaç
// per compartir-lo i el mapa de questionId de cada pregunta (necessari per llegir-ne
// després les respostes de manera fiable).
export async function createActivityForm(token, activityPlan, groupLabel) {
  const created = await formsFetch(FORMS_URL, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ info: { title: `Preferències d'activitats FCT — ${groupLabel}` } }),
  });
  const formId = created.formId;

  const requests = [
    {
      createItem: {
        item: {
          title: "Nom i cognoms de l'alumne/a",
          questionItem: { question: { required: true, textQuestion: {} } },
        },
        location: { index: 0 },
      },
    },
    ...activityPlan.map((cat, i) => ({
      createItem: {
        item: {
          title: `${cat.id}. ${cat.title}`,
          questionItem: {
            question: {
              choiceQuestion: {
                type: "CHECKBOX",
                options: cat.items.map((it) => ({ value: `${it.id} — ${it.text}` })),
              },
            },
          },
        },
        location: { index: i + 1 },
      },
    })),
  ];
  await formsFetch(`${FORMS_URL}/${formId}:batchUpdate`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requests }),
  });

  // Torna a llegir el formulari sencer per saber el questionId real de cada pregunta
  // (l'API no el retorna directament en crear-la).
  const full = await formsFetch(`${FORMS_URL}/${formId}`, token);
  const items = full.items || [];
  const nameQuestionId = items[0] && items[0].questionItem && items[0].questionItem.question.questionId;
  const categoryQuestionIds = {};
  activityPlan.forEach((cat, i) => {
    const item = items[i + 1];
    categoryQuestionIds[cat.id] = item && item.questionItem && item.questionItem.question.questionId;
  });

  return { formId, responderUri: full.responderUri, nameQuestionId, categoryQuestionIds };
}

// Llegeix totes les respostes del formulari i les torna en un format senzill:
// [{ name: "...", activityIds: ["1.1", "2.3", ...] }]. Mai modifica ni esborra res.
export async function fetchFormResponses(token, formId, nameQuestionId, categoryQuestionIds) {
  const data = await formsFetch(`${FORMS_URL}/${formId}/responses`, token);
  const responses = data.responses || [];
  return responses.map((r) => {
    const answers = r.answers || {};
    const nameAnswer = answers[nameQuestionId];
    const name = (nameAnswer && nameAnswer.textAnswers && nameAnswer.textAnswers.answers[0] && nameAnswer.textAnswers.answers[0].value) || "";
    const activityIds = [];
    Object.entries(categoryQuestionIds || {}).forEach(([, qId]) => {
      const a = answers[qId];
      const values = (a && a.textAnswers && a.textAnswers.answers) || [];
      values.forEach((v) => {
        const m = v.value.match(/^([\d.]+)\s/);
        if (m) activityIds.push(m[1]);
      });
    });
    return { name, activityIds };
  });
}
