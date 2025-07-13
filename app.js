document.addEventListener("DOMContentLoaded", async () => {
  const baseId = "appw9QR3oaKO3u01m";
  const tableName = "Dramas"; // Correct table name
  const API_URL = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  const API_KEY = "Bearer patFyAm6jvrK5DXSo";

  const lang = navigator.language.startsWith('es') ? 'es' :
               navigator.language.startsWith('fr') ? 'fr' : 'en';

  let currentLang = lang;
  let allRecords = [];

  const fetchDramas = async () => {
    const res = await fetch(API_URL, {
      headers: { Authorization: API_KEY }
    });

    if (!res.ok) {
      console.error("Failed to fetch from Airtable:", res.status, res.statusText);
      return;
    }

    const data = await res.json();
    allRecords = data.records;
    renderDramas();
    renderCarousel();
  };

  const renderDramas = () => {
    const container = document.getElementById("masonry");
    container.innerHTML = "";

    const filtered = allRecords.filter(r => r.fields.language === currentLang);
    filtered.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

    for (const record of filtered) {
      const cover = record.fields.cover_image?.[0]?.url || "https://via.placeholder.com/300x450?text=No+Image";
      const title = record.fields.title || "Untitled";
      const link = record.fields.deep_link || "#";

      const card = document.createElement("div");
      card.className = "drama-card";
      card.onclick = () => window.location.href = link;
      card.innerHTML = `
        <img src="${cover}" alt="${title}" />
        <h3>${title}</h3>
      `;
      container.appendChild(card);
    }
  };

  const renderCarousel = () => {
    const carousel = document.getElementById("carousel");
    const featured = allRecords.filter(r => r.fields.featured && r.fields.language === currentLang);
    carousel.innerHTML = featured.map(r => {
      const cover = r.fields.cover_image?.[0]?.url || "";
      const link = r.fields.deep_link || "#";
      return `<img src="${cover}" style="width: 100%; margin-bottom: 1rem;" onclick="window.location.href='${link}'" />`;
    }).join("");
  };

  const searchBox = document.getElementById("search-box");
  searchBox.addEventListener("input", () => {
    const term = searchBox.value.toLowerCase();
    const container = document.getElementById("masonry");
    container.innerHTML = "";

    const filtered = allRecords.filter(r =>
      (r.fields.title || "").toLowerCase().includes(term) &&
      r.fields.language === currentLang
    );

    for (const record of filtered) {
      const cover = record.fields.cover_image?.[0]?.url || "https://via.placeholder.com/300x450?text=No+Image";
      const title = record.fields.title || "Untitled";
      const link = record.fields.deep_link || "#";

      const card = document.createElement("div");
      card.className = "drama-card";
      card.onclick = () => window.location.href = link;
      card.innerHTML = `
        <img src="${cover}" />
        <h3>${title}</h3>
      `;
      container.appendChild(card);
    }
  });

  document.querySelectorAll("#language-switcher button").forEach(btn => {
    btn.onclick = () => {
      currentLang = btn.getAttribute("data-lang");
      renderDramas();
      renderCarousel();
    };
  });

  await fetchDramas();
});