document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "https://api.airtable.com/v0/appw9QR3oaKO3u01m/Drama";
  const API_KEY = "Bearer patFyAm6jvrK5DXSo";

  const lang = navigator.language.startsWith('es') ? 'es' :
               navigator.language.startsWith('fr') ? 'fr' : 'en';

  let currentLang = lang;
  let allRecords = [];

  const fetchDramas = async () => {
    const res = await fetch(API_URL, {
      headers: { Authorization: API_KEY }
    });
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
      const card = document.createElement("div");
      card.className = "drama-card";
      card.onclick = () => window.location.href = record.fields.deep_link;
      card.innerHTML = `
        <img src="${record.fields.cover_image[0].url}" />
        <h3>${record.fields.title}</h3>
      `;
      container.appendChild(card);
    }
  };

  const renderCarousel = () => {
    const carousel = document.getElementById("carousel");
    const featured = allRecords.filter(r => r.fields.featured && r.fields.language === currentLang);
    carousel.innerHTML = featured.map(r => `
      <img src="\${r.fields.cover_image[0].url}" style="width: 100%; margin-bottom: 1rem;" onclick="window.location.href='\${r.fields.deep_link}'"/>
    `).join("");
  };

  const searchBox = document.getElementById("search-box");
  searchBox.addEventListener("input", () => {
    const term = searchBox.value.toLowerCase();
    const filtered = allRecords.filter(r =>
      r.fields.title.toLowerCase().includes(term) &&
      r.fields.language === currentLang
    );
    const container = document.getElementById("masonry");
    container.innerHTML = "";
    for (const record of filtered) {
      const card = document.createElement("div");
      card.className = "drama-card";
      card.onclick = () => window.location.href = record.fields.deep_link;
      card.innerHTML = `
        <img src="\${record.fields.cover_image[0].url}" />
        <h3>\${record.fields.title}</h3>
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
