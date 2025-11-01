import React, { useState, useRef } from "react";
import axios from "axios";
import PdfViewer from "./PdfViewer";

export default function App() {
  const [file, setFile] = useState(null);
  const [signedBlob, setSignedBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const PROD_SERVER =
    "https://delta-capita-swart.vercel.app";
  const LOCAL_SERVER = "http://localhost:4000";

  const host =
    typeof window !== "undefined" && window.location && window.location.hostname
      ? window.location.hostname
      : "";
  const isLocal = host === "localhost" || host === "127.0.0.1";
  const serverBase = isLocal ? LOCAL_SERVER : PROD_SERVER;

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type === "application/pdf") setFile(f);
    else alert("Please select a PDF");
  };

  const uploadAndSign = async () => {
    if (!file) return alert("Select a PDF first");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("pdf", file);
      const resp = await axios.post(`${serverBase}/sign`, form, {
        responseType: "blob",
        headers: { "Content-Type": "multipart/form-data" },
      });

      const blob = new Blob([resp.data], { type: "application/pdf" });
      setSignedBlob(blob);
    } catch (err) {
      console.error(err);
      alert("Upload or signing failed");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setFile(null);
    setSignedBlob(null);
    if (inputRef.current) inputRef.current.value = null;
  };

  return (
    <div className="app">
      <header className="header">PDF Signer</header>
      <main className="card">
        <label className="file-label">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={onFileChange}
          />
            <div className="file-control">
            <div className="file-name">{file ? file.name : "Choose a PDF"}</div>
            <button type="button" className="choose" onClick={() => inputRef.current && inputRef.current.click()}>Browse</button>
          </div>
        </label>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            className="primary"
            onClick={uploadAndSign}
            disabled={!file || loading}
          >
            {loading ? "Signing..." : "Upload & Sign"}
          </button>
          <button className="secondary" onClick={clear} disabled={loading}>
            Clear
          </button>
        </div>

        {signedBlob && (
          <div className="viewer">
            <PdfViewer blob={signedBlob} />
          </div>
        )}
      </main>
      <footer className="footer">Delta Capita</footer>
    </div>
  );
}
