export async function notifyOneSignal(
  subId: string,
  titolo: string,
  messaggio: string
): Promise<string> {
  const response = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Key ${process.env.ONESIGNAL_API_KEY}`
    },
    body: JSON.stringify({
      app_id: "2982dd98-6671-4445-9316-252d4b356462",
      include_subscription_ids: [subId],
      headings: { en: titolo },
      contents: { en: messaggio }
    })
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Errore OneSignal: ${text}`);
  }

  return text;
}
