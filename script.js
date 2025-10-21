document.addEventListener('DOMContentLoaded', function() {
  // 【！關鍵！】請將您的 Apps Script 網址中間那段最長的 ID，替換掉下方 SCRIPT_ID 引號中的內容。
  const SCRIPT_ID = 'AKfycbzQcq9waeFs2vahNRoduEMGR9jBjGeuc0WE8SKuaFeph_MLQvmNVm0xS-vSFetk3wFpuA'; // <--- 請修改這裡，貼上您自己的 ID

  const API_URL = 'https://script.google.com/macros/s/' + SCRIPT_ID + '/exec';
  
  let allEvents = [];
  let uniqueTags = new Set();
  
  const exploreBtn = document.getElementById('explore-btn');
  const datePicker = document.getElementById('date-picker');
  const countySelect = document.getElementById('county-select');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');
  const tagsContainer = document.getElementById('tags-container');
  const resultsContainer = document.getElementById('results-container');
  const loader = document.getElementById('loader');
  const noResults = document.getElementById('no-results');

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  datePicker.value = `${yyyy}-${mm}-${dd}`;

  exploreBtn.addEventListener('click', fetchDataAndShowTags);
  
  async function fetchDataAndShowTags() {
    loader.style.display = 'block';
    noResults.style.display = 'none';
    tagsContainer.innerHTML = '';
    resultsContainer.innerHTML = '';
    step2.style.display = 'block';
    step3.style.display = 'block';

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('網路回應錯誤');
      }
      const data = await response.json();
      allEvents = data.events;
      processTags();
      filterAndDisplayEvents();
    } catch (error) {
      console.error('無法獲取活動資料:', error);
      resultsContainer.innerHTML = '<p>抱歉，載入活動時發生錯誤。</p>';
    } finally {
        loader.style.display = 'none';
    }
  }
  
  function processTags() {
      uniqueTags = new Set();
      allEvents.forEach(event => {
          const eventTags = event.Tags.split(',').map(tag => tag.trim());
          eventTags.forEach(tag => uniqueTags.add(tag));
      });

      tagsContainer.innerHTML = ''; 
      uniqueTags.forEach(tag => {
          const tagElement = document.createElement('div');
          tagElement.classList.add('tag');
          tagElement.textContent = tag;
          tagElement.dataset.tag = tag;
          tagElement.addEventListener('click', () => {
            const isActive = tagElement.classList.contains('active');
            if (isActive) {
                tagElement.classList.remove('active');
            } else {
                tagsContainer.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
                tagElement.classList.add('active');
            }
            filterAndDisplayEvents();
          });
          tagsContainer.appendChild(tagElement);
      });
      
      const allTagElement = document.createElement('div');
      allTagElement.classList.add('tag', 'active');
      allTagElement.textContent = '不分類別';
      allTagElement.dataset.tag = 'all';
      allTagElement.addEventListener('click', () => {
          tagsContainer.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
          allTagElement.classList.add('active');
          filterAndDisplayEvents();
      });
      tagsContainer.prepend(allTagElement);
  }

  function filterAndDisplayEvents() {
    const selectedDate = new Date(datePicker.value);
    const selectedCounty = countySelect.value;
    const activeTagElement = tagsContainer.querySelector('.tag.active');
    const selectedTag = activeTagElement ? activeTagElement.dataset.tag : 'all';

    const filteredEvents = allEvents.filter(event => {
        const startDate = new Date(event.StartDate);
        const endDate = new Date(event.EndDate);
        const isDateMatch = selectedDate >= startDate && selectedDate <= endDate;
        const isCountyMatch = event.County === selectedCounty;
        const isTagMatch = selectedTag === 'all' || event.Tags.includes(selectedTag);
        return isDateMatch && isCountyMatch && isTagMatch;
    });
    displayEvents(filteredEvents);
  }

  function displayEvents(events) {
    resultsContainer.innerHTML = '';
    if (events.length === 0) {
      noResults.style.display = 'block';
    } else {
      noResults.style.display = 'none';
      events.forEach(event => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
          <img src="${event.ImageURL}" alt="${event.EventName}" onerror="this.src='https://placehold.co/600x400/e2e8f0/718096?text=Image'; this.onerror=null;">
          <div class="card-content">
            <h4>${event.EventName}</h4>
            <p>${event.VenueName}</p>
          </div>
        `;
        resultsContainer.appendChild(card);
      });
    }
  }
});

