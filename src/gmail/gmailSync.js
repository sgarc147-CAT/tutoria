const MESSAGES_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages";

async function gmailFetch(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Error de Gmail (${res.status}): ${text}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function getHeader(headers, name) {
  const h = (headers || []).find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : "";
}

// Cerca els correus dels últims `monthsBack` mesos on el domini donat apareix com a
// remitent o destinatari. Només llegeix (mai esborra, modifica ni envia res).
export async function searchEmailsByDomain(token, domain, monthsBack = 6) {
  if (!domain) return [];
  const query = `(from:@${domain} OR to:@${domain}) newer_than:${monthsBack}m`;
  const listUrl = `${MESSAGES_URL}?q=${encodeURIComponent(query)}&maxResults=25`;
  const listData = await gmailFetch(listUrl, token);
  const ids = (listData.messages || []).map((m) => m.id);

  const messages = await Promise.all(
    ids.map(async (id) => {
      const url = `${MESSAGES_URL}/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`;
      const data = await gmailFetch(url, token);
      const headers = data.payload ? data.payload.headers : [];
      return {
        id: data.id,
        threadId: data.threadId,
        subject: getHeader(headers, "Subject") || "(sense assumpte)",
        from: getHeader(headers, "From"),
        to: getHeader(headers, "To"),
        date: getHeader(headers, "Date"),
        snippet: data.snippet || "",
        link: `https://mail.google.com/mail/u/0/#all/${data.id}`,
      };
    })
  );

  // Més recents primer.
  messages.sort((a, b) => new Date(b.date) - new Date(a.date));
  return messages;
}

// Extreu el domini d'una adreça de correu ("info@empresa.cat" -> "empresa.cat").
export function extractDomain(email) {
  if (!email || !email.includes("@")) return "";
  return email.trim().split("@").pop().toLowerCase();
}
