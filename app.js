document.addEventListener("DOMContentLoaded", async () => {
  const baseId = "appw9QR3oaKO3u01m";
  const tableName = "Dramas";
  const API_URL = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  const API_KEY = "Bearer patFyAm6jvrK5DXSo.c4f37b31cbf31e45cc4ac2601d5aa434fa9d01655aa208fcd9b824d39618ab66`;

  const langMap = {
    en: "🔥 Hot Dramas",
    es: "🔥 Dramas Populares",
    fr: "🔥 Dramas Populaires",
    pt: "🔥 Dramas Quentes",
    ar: "🔥 دراما رائجة"
  };

  const lang = navigator.language.slice(0, 2);
  let currentLang = ["en", "es", "fr", "pt", "ar"].includes(lang) ? lang : "en";
  let allRecords = [];

  const fetchDramas = async () => {
    const res = await fetch(API_URL, {
      headers: { Authorization: API_KEY }
    });

    if (!res.ok) {
      console.error("Failed to fetch from Airtable:", res.status);
      return;
    }

    const data = await res.json();
    allRecords = data.records;

    renderCarousel();
    renderDramas();
    renderLanguages();
  };

  const renderCarousel = () => {
    const swiperWrapper = document.getElementById("carousel-track");
    const title = document.getElementById("carousel-title");
    title.textContent = langMap[currentLang] || langMap.en;

    const featured = allRecords.filter(r => r.fields["Is Featured"] && r.fields.Language === currentLang);
    swiperWrapper.innerHTML = "";

    featured.forEach(r => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.onclick = () => window.location.href = r.fields["App Link"] || "#";
      slide.style.backgroundImage = `url('${r.fields.Cover_image?.[0]?.url || ""}')`;
      swiperWrapper.appendChild(slide);
    });

    new Swiper(".swiper", {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      coverflowEffect: {
        rotate: 30,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false
      },
      autoplay: {
        delay: 4000,
        disableOnInteraction: false
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
      },
      loop: true
    });
  };

  const renderDramas = () => {
    const container = document.getElementById("masonry");
    container.innerHTML = "";

    const filtered = allRecords.filter(r => r.fields.Language === currentLang);
    filtered.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

    for (const record of filtered) {
      const cover = record.fields.Cover_image?.[0]?.url || "https://via.placeholder.com/300x450?text=No+Image";
      const title = record.fields["Title (Localized)"] || "Untitled";
      const link = record.fields["App Link"] || "#";

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

  const renderLanguages = () => {
    const dropdown = document.getElementById("language-selector");
    dropdown.innerHTML = "";

    const langs = new Set(allRecords.map(r => r.fields.Language));
    langs.forEach(l => {
      const option = document.createElement("option");
      option.value = l;
      option.textContent = l.toUpperCase();
      if (l === currentLang) option.selected = true;
      dropdown.appendChild(option);
    });

    dropdown.onchange = e => {
      currentLang = e.target.value;
      renderCarousel();
      renderDramas();
    };
  };

  document.getElementById("search-box").addEventListener("input", e => {
    const term = e.target.value.toLowerCase();
    const container = document.getElementById("masonry");
    container.innerHTML = "";

    const filtered = allRecords.filter(r =>
      (r.fields["Title (Localized)"] || "").toLowerCase().includes(term) &&
      r.fields.Language === currentLang
    );

    for (const record of filtered) {
      const cover = record.fields.Cover_image?.[0]?.url || "https://via.placeholder.com/300x450?text=No+Image";
      const title = record.fields["Title (Localized)"] || "Untitled";
      const link = record.fields["App Link"] || "#";

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

  await fetchDramas();
});