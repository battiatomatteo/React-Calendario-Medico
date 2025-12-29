import React, { useState } from "react";
import { usePatientFolderLogic } from "../Logic/usePatientFolderLogic";
import "../style/PatientFolder.css";

type Props = {
  patientName: string;
};

const PatientFolder: React.FC<Props> = ({ patientName }) => {
  const { 
    patientData, 
    medicineList, 
    somministrazioni, 
    allFarmaci, 
    loading, 
    error, 
    saveTherapyOldStyle,
    deleteTherapy,
    refresh
  } = usePatientFolderLogic(patientName);


  const [therapyMode, setTherapyMode] = useState(false);

  console.log("allFarmaci : ", allFarmaci);

  // 👇 stato unico per nuove terapie
  const [newTherapies, setNewTherapies] = useState<
    {
      nome_medicina: string;
      dosaggio_medicina: string;
      note_medicina: string;
      tipo_medicina: string;
      tempo_ogni_dosaggio: string;
      dataAggiunta: string;
      data_fine: string;
    }[]
  >([]);

  // 👇 aggiunge una nuova riga con data di oggi
  const addNewTherapyRow = () => {
    const today = new Date();
    const formattedToday = today.toLocaleDateString("it-IT"); // formato dd/MM/yyyy
    const formattedTodayDash = formattedToday.replace(/\//g, "-"); // dd-MM-yyyy

    setNewTherapies([
      ...newTherapies,
      {
        nome_medicina: "",
        dosaggio_medicina: "",
        note_medicina: "",
        tipo_medicina: "",
        tempo_ogni_dosaggio: "",
        dataAggiunta: formattedTodayDash,
        data_fine: "",
      },
    ]);
  };

  if (loading) return <p>Caricamento cartella...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="patient-folder">
      <h2>Cartella di {patientName}</h2>

      {/* 🔹 Dati anagrafici */}
      {patientData && (
        <div className="section">
          <h3>Dati anagrafici : </h3>
          <ul>
            <li><strong>Nome:</strong> {patientData.nome || "-"}</li>
            <li><strong>Cognome:</strong> {patientData.cognome || "-"}</li>
            <li><strong>Codice Fiscale:</strong> {patientData.codice_fiscale || "-"}</li>
            <li><strong>Mail:</strong> {patientData.mail || "-"}</li>
            <li><strong>Telefono:</strong> {patientData.numero_di_telefono || "-"}</li>
            <li><strong>Città:</strong> {patientData.città || "-"}</li>
            <li><strong>Data di nascita:</strong> {patientData.data_di_nascita || "-"}</li>
          </ul>
        </div>
      )}

      {/* 🔹 Medicine prescritte */}
      <div className="section">
        <h3>Medicine prescritte</h3>
        <div>
          <table className="medicine-table">
            <thead>
              <tr>
                <th>Nome Medicina</th>
                <th>Dosaggio</th>
                <th>Tempo</th>
                <th>Note</th>
                <th>Tipo</th>
                <th>Date terapia</th>
                <th>Elimina</th>
              </tr>
            </thead>
            <tbody>
              {medicineList.map((med) => (
                <tr key={med.id}>
                  <td>{med.nome_medicina || med.id}</td>
                  <td>{med.countVolte || "-"}</td>
                  <td>{med.tempo_ogni_dosaggio || "-"}</td>
                  <td>{med.note_medicina || "-"}</td>
                  <td>{med.tipo_medicina || "-"}</td>
                  <td>{med.dataAggiunta + " fino a " + med.data_fine || "-"}</td>

                  {/* BOTTONE ELIMINA */}
                  <td>
                    <button
                      className="delete-button"
                      onClick={async () => {
                        if (window.confirm("Sei sicuro di voler eliminare questa terapia?")) {
                          try {
                            await deleteTherapy(med.id);
                            alert("Terapia eliminata.");
                          } catch {
                            alert("Errore durante l'eliminazione.");
                          }
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}


              {/* 🔹 nuove terapie da aggiungere */}
              {therapyMode && newTherapies.map((t, idx) => (
                <tr key={`new-${idx}`}>
                  <td>
                    <select
                      value={t.nome_medicina}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const copy = [...newTherapies];
                        copy[idx].nome_medicina = selectedId;

                        // 👇 cerca il farmaco selezionato in allFarmaci
                        const selectedFarmaco = allFarmaci.find(f => f.id === selectedId);
                        if (selectedFarmaco) {
                          copy[idx].tempo_ogni_dosaggio = selectedFarmaco.tempo_dosaggio || "-";
                          copy[idx].note_medicina = selectedFarmaco.note || "-";
                          copy[idx].tipo_medicina = selectedFarmaco.tipo_farmaco || "-";
                        }

                        setNewTherapies(copy);
                      }}
                    >
                      <option value="">-- Seleziona farmaco --</option>
                      {allFarmaci.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nome || f.id}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={t.dosaggio_medicina}
                      onChange={(e) => {
                        const copy = [...newTherapies];
                        copy[idx].dosaggio_medicina = e.target.value;
                        setNewTherapies(copy);
                      }}
                    />
                  </td>
                  <td>
                    <input type="text" value={t.tempo_ogni_dosaggio} readOnly />
                  </td>
                  <td>
                    <input type="text" value={t.note_medicina} readOnly />
                  </td>
                  <td>
                    <input type="text" value={t.tipo_medicina} readOnly />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input type="text" value={t.dataAggiunta} /> 
                      <input
                        type="text"
                        placeholder="gg-mm-aaaa"
                        value={t.data_fine}
                        onChange={(e) => {
                          const copy = [...newTherapies];
                          copy[idx].data_fine = e.target.value;
                          setNewTherapies(copy);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {therapyMode && newTherapies.length > 0 && (
            <button
              className="close-button"
              onClick={async () => {
                const last = newTherapies[newTherapies.length - 1];

                // last.nome_medicina deve essere l’ID del farmaco (selectedValue “vecchio stile”)
                try {
                  await saveTherapyOldStyle({
                    selectedValue: last.nome_medicina,
                    dos: last.dosaggio_medicina,
                    giornof: last.data_fine.split("-")[0],
                    mesef:   last.data_fine.split("-")[1],
                    annof:   last.data_fine.split("-")[2],
                  });

                  // aggiorna automaticamente la cartella
                  refresh();

                  setTherapyMode(false);
                  setNewTherapies([]);
                  alert("Terapia salvata correttamente.");

                } catch {
                  alert("Errore nel salvataggio della terapia.");
                }
              }}
            >
              Salva terapia
            </button>
            
          )}

          <br />
          {therapyMode ? (
            <button
              className="close-button"
              onClick={() => {
                setTherapyMode(false);
                setNewTherapies([]); 
              }}
            >
              Chiudi
            </button>
          ) : (
            <button
              className="close-button"
              onClick={() => {
                setTherapyMode(true);
                addNewTherapyRow(); 
              }}
            >
              Nuova terapia
            </button>
          )}
        </div>
      </div>

      {/* 🔹 Somministrazioni */}
      <div className="section">
        <h3>Somministrazioni</h3>
        {somministrazioni.length > 0 ? (
          <table className="somministrazioni-table">
            <thead>
              <tr>
                <th>Numero somm</th>
                <th>Data</th>
                <th>Ora</th>
                <th>Medicina</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {somministrazioni.map((somm) => (
                <tr key={`${somm.medicinaId}-${somm.id}`}>
                  <td>{somm.id}</td>
                  <td>{somm.data_somministrazione}</td>
                  <td>{somm.ore}</td>
                  <td>{somm.nome_medicina}</td>
                  <td>{somm.stato ? "✓ Assunta" : "✗ Non assunta"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nessuna somministrazione registrata.</p>
        )}
      </div>
    </div>
  );
};

export default PatientFolder;
