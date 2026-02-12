import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:24px;font-family:sans-serif">Root element not found.</div>';
} else {
  try {
    createRoot(rootEl).render(<App />);
  } catch (err) {
    rootEl.innerHTML = `
      <div style="padding:24px;font-family:sans-serif;max-width:480px">
        <h2 style="margin:0 0 8px">Something went wrong</h2>
        <p style="margin:0 0 16px;color:#666">${err instanceof Error ? err.message : String(err)}</p>
        <button onclick="location.reload()" style="padding:8px 16px">Reload</button>
      </div>
    `;
    console.error("App failed to render:", err);
  }
}
