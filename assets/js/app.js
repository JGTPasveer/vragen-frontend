/**
 * Set API URL
 * Replace with your Render backend URL
 */
//const API_BASE = 'https://your-backend.onrender.com';
const API_BASE = 'https://vragen-backend.onrender.com';

/**
 * Page Navigation
 */
let currentPage = 0;
const pages = [
  'section-page-1',
  'section-page-2',
  'section-page-3',
  'section-page-4',
  'section-page-5'
];


document.getElementById('start-button').addEventListener('click', () => {
  const name = document.getElementById('participant-name').value.trim();
  if (!name) {
    alert("Vul alstublieft uw naam in.");
    return;
  }

  // store in localStorage for later use
  localStorage.setItem('participantCode', name);

  // hide landing page
  pageVisibility('landing-page', 'none');

  // show progress bar and nav
  document.getElementById('progress-bar-div').style.display = 'block';
  document.getElementById('next-page-button').style.display = 'block';

  // reset progress
  currentPage = 0;
  updateNavElements();
  updateQuestionnairePage();
  window.scrollTo({ top: 0, behavior: 'instant' });
});



document.getElementById('next-page-button').addEventListener('click', () => {
  if (checkPageFields()) {
    currentPage++;
    updateNavElements();
    updateQuestionnairePage();
    window.scrollTo({ top: 0, behavior: 'instant' });
  } else {
    alert("Vul alstublieft alle vragen in om verder te gaan.");
  }
});


document.getElementById('prev-page-button').addEventListener('click', () => {
  if (currentPage > 0) {
    currentPage--;
    updateNavElements();
    updateQuestionnairePage();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
});

document.getElementById('submit-button').addEventListener('click', () => {
  submitSurvey();
});

function pageVisibility(docId, visibilityType) {
  document.getElementById(docId).style.display = visibilityType;
}

function updateQuestionnairePage() {
  pages.forEach((page, index) => {
    pageVisibility(page, index === currentPage ? 'block' : 'none');
  });
}

function updateNavElements() {
  const progress = (currentPage / (pages.length - 1)) * 100;
  document.getElementById('progress-bar').style.width = progress + '%';
  document.getElementById('progress-bar-text').innerText =
    'Pagina ' + (currentPage + 1) + ' van de ' + pages.length;

  document.getElementById('prev-page-button').style.display = currentPage === 0 ? 'none' : 'block';
  document.getElementById('next-page-button').style.display = currentPage === pages.length - 1 ? 'none' : 'block';
  document.getElementById('submit-button').style.display = currentPage === pages.length - 1 ? 'block' : 'none';
}

function collectAnswers() {
  const responses = {};

  pages.forEach((pageId, sectionIndex) => {
    const section = {};
    const page = document.getElementById(pageId);

    page.querySelectorAll('.question-block').forEach((block, qIndex) => {
      const level = block.querySelector('select').value;
      const explanation = block.querySelector('textarea')?.value || '';

      section[`q${qIndex + 1}`] = { level };
      if (explanation.trim() !== '') {
        section[`q${qIndex + 1}`].explanation = explanation;
      }
    });

    responses[`section${sectionIndex + 1}`] = section;
  });

  return responses;
}



/**
 * Submit survey
 */
async function submitSurvey() {
  const responses = collectAnswers();
  const participantCode = localStorage.getItem('participantCode') || prompt("Enter your participant code:");
  localStorage.setItem('participantCode', participantCode);

  try {
    const res = await fetch(`${API_BASE}/api/submit-survey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantCode,
        language: 'en',
        responses
      })
    });

    const result = await res.json();
    if (result.ok) {
      alert("Bedankt voor het invullen van de vragenlijst!");
      // show a completion page
      pageVisibility(pages[currentPage], 'none');
      pageVisibility('thank-you-page', 'block');
    }
  } catch (err) {
    console.error("Error submitting survey:", err);
    alert("Something went wrong. Please try again later.");
  }
}

/**
 * Simple validation for current page
 */
function checkPageFields() {
  const pageId = pages[currentPage];
  const page = document.getElementById(pageId);
  let allFilled = true;

  page.querySelectorAll('.question-block select').forEach(sel => {
    if (!sel.value) {
      allFilled = false;
    }
  });

  return allFilled;
}
