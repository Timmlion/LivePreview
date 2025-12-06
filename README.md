# LivePreview (AI Code Tester)

**LivePreview** to narzędzie typu "Paste & View" stworzone, aby błyskawicznie testować kod HTML/CSS/JS generowany przez modele AI (ChatGPT, Claude, DeepSeek) bez konieczności tworzenia lokalnych plików.

![LivePreview Screenshot](https://via.placeholder.com/800x400?text=LivePreview+Screenshot)

## 🚀 Funkcjonalności

*   **Edytor Code-First:** Monaco Editor (znany z VS Code) z kolorowaniem składni HTML.
*   **Live Preview:** Bezpieczny, izolowany podgląd w czasie rzeczywistym (Auto-reload).
*   **RWD Tester:** Przełącznik Desktop / Mobile oraz suwak Zoom do testowania responsywności.
*   **Smart Paste:** Automatycznie dodaje boilerplate HTML5, jeśli wkleisz tylko `<body>` lub CSS.
*   **Download:** Pobieranie gotowego pliku `index.html` jednym kliknięciem.
*   **Dark Mode:** Nowoczesny, ciemny interfejs oparty na Tailwind CSS v4.

## 🛠️ Stack Technologiczny

*   **Frontend:** React 19 + Vite 7
*   **Styling:** Tailwind CSS v4 (z pluginem `@tailwindcss/postcss`)
*   **Editor:** `@monaco-editor/react`
*   **Layout:** `react-resizable-panels`

## 📦 Jak uruchomić lokalnie?

1.  Sklonuj repozytorium.
2.  Zainstaluj zależności:
    ```bash
    npm install
    ```
3.  Uruchom serwer deweloperski:
    ```bash
    npm run dev
    ```
4.  Aplikacja dostępna pod: `http://localhost:5173`

## 🚢 Build & Deploy (Coolify/Vercel)

Aplikacja jest statycznym SPA. Aby zbudować wersję produkcyjną:

```bash
npm run build
```

Pliki do serwowania znajdą się w katalogu `dist/`.

## ☕ Wsparcie

Jeśli narzędzie Ci się podoba, postaw mi kawę:
[https://ko-fi.com/adamsiwek](https://ko-fi.com/adamsiwek)
