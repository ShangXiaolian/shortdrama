document.addEventListener("DOMContentLoaded", async () => {
  const baseId = "appw9QR3oaKO3u01m";
  const tableName = "Dramas";
  const API_URL = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  const API_KEY = "Bearer patFyAm6jvrK5DXSo.c4f37b31cbf31e45cc4ac2601d5aa434fa9d01655aa208fcd9b824d39618ab66";

  const lang = navigator.language.slice(0, 2);
  let currentLang = ["en", "es", "fr", "pt", "ar"].includes(lang) ? lang : "en";
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
    renderCarousel();
    renderDramas();
  };

  const renderCarousel = () => {
    const carousel = document.getElementById("carousel-track");
    if (!carousel) return;

    const featured = allRecords.filter(r => r.fields["Is Featured"] && r.fields.Language === currentLang);
    carousel.innerHTML = "";

    featured.forEach((r, i) => {
      const cover = r.fields.Cover_image?.[0]?.url || "";
      const link = r.fields["App Link"] || "#";
      const card = document.createElement("div");
      card.className = "carousel-card";
      if (i === 0) card.classList.add("center");
      else if (i === 1) card.classList.add("right");
      else if (i === featured.length - 1) card.classList.add("left");

      card.style.backgroundImage = `url('${cover}')`;
      card.style.opacity = "0";
      card.onclick = () => window.location.href = link;

      setTimeout(() => {
        card.style.transition = "opacity 0.5s ease-in";
        card.style.opacity = "1";
      }, 100);

      carousel.appendChild(card);
    });

    updateCarousel();
  };

  const renderDramas = () => {
    const container = document.getElementById("masonry");
    container.innerHTML = "";

    const filtered = allRecords.filter(r => r.fields.Language === currentLang);
    filtered.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

    for (const record of filtered) {
      const fields = record.fields;
      const cover = fields.Cover_image?.[0]?.url || "https://dummyimage.com/300x450/cccccc/000000&text=No+Image";
      const title = fields["Title (Localized)"] || "Untitled";
      const link = fields["App Link"] || "#";

      const card = document.createElement("div");
      card.className = "drama-card";
      card.onclick = () => window.location.href = link;
      card.innerHTML = `
        <img src="${cover}" loading="lazy" />
        <h3>${title}</h3>
      `;
      container.appendChild(card);
    }
  };

  document.getElementById("language-selector").addEventListener("change", (e) => {
    currentLang = e.target.value;
    renderCarousel();
    renderDramas();
  });

  document.getElementById("search-box").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const container = document.getElementById("masonry");
    container.innerHTML = "";

    const filtered = allRecords.filter(r =>
      (r.fields["Title (Localized)"] || "").toLowerCase().includes(term) &&
      r.fields.Language === currentLang
    );

    for (const record of filtered) {
      const fields = record.fields;
      const cover = fields.Cover_image?.[0]?.url || "https://dummyimage.com/300x450/cccccc/000000&text=No+Image";
      const title = fields["Title (Localized)"] || "Untitled";
      const link = fields["App Link"] || "#";

      const card = document.createElement("div");
      card.className = "drama-card";
      card.onclick = () => window.location.href = link;
      card.innerHTML = `
        <img src="${cover}" loading="lazy" />
        <h3>${title}</h3>
      `;
      container.appendChild(card);
    }
  });

  window.updateCarousel = () => {
    const cards = document.querySelectorAll(".carousel-card");
    if (!cards.length) return;
    cards.forEach(card => card.classList.remove("center", "left", "right"));

    const total = cards.length;
    const center = currentIndex % total;
    const left = (center - 1 + total) % total;
    const right = (center + 1) % total;

    cards[center].classList.add("center");
    cards[left].classList.add("left");
    cards[right].classList.add("right");
  };

  window.moveSlide = (step) => {
    const cards = document.querySelectorAll(".carousel-card");
    if (!cards.length) return;
    currentIndex = (currentIndex + step + cards.length) % cards.length;
    updateCarousel();
  };

  let currentIndex = 0;
  setInterval(() => moveSlide(1), 5000);

  await fetchDramas();
});