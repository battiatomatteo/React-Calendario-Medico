export function logNextNotification(delayMs: number, medicineName: string, time: string) {
  const minutes = Math.round(delayMs / 60000);
  console.log(`⏱️ Prossima notifica tra ${minutes} minuti (${medicineName} alle ${time})`);
}
