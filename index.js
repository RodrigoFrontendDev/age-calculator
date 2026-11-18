const form = document.getElementById("age-form");
const birthdayInput = document.getElementById("birthday");
const message = document.getElementById("form-message");
const placeholder = document.getElementById("result-placeholder");
const placeholderCopy = document.getElementById("placeholder-copy");
const resultContent = document.getElementById("result-content");
const yearsOutput = document.getElementById("age-years");
const yearsLabel = document.getElementById("years-label");
const monthsOutput = document.getElementById("age-months");
const daysOutput = document.getElementById("age-days");
const caption = document.getElementById("age-caption");
const birthdayNote = document.getElementById("birthday-note");

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getLocalDateParts(date = new Date()) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function formatDateInput({ year, month, day }) {
  return [
    year,
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function parseDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const date = {
    year: Number(yearText),
    month: Number(monthText),
    day: Number(dayText),
  };
  const candidate = new Date(Date.UTC(date.year, date.month - 1, date.day));

  if (
    candidate.getUTCFullYear() !== date.year ||
    candidate.getUTCMonth() + 1 !== date.month ||
    candidate.getUTCDate() !== date.day
  ) {
    return null;
  }

  return date;
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function toUtcDayNumber({ year, month, day }) {
  return Date.UTC(year, month - 1, day) / DAY_IN_MS;
}

function calculateAge(birthDate, today) {
  let totalMonths =
    (today.year - birthDate.year) * 12 + today.month - birthDate.month;

  const anniversaryThisMonth = Math.min(
    birthDate.day,
    daysInMonth(today.year, today.month),
  );

  if (today.day < anniversaryThisMonth) {
    totalMonths -= 1;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const birthMonthIndex = birthDate.month - 1 + totalMonths;
  const anniversaryYear =
    birthDate.year + Math.floor(birthMonthIndex / 12);
  const anniversaryMonth = (birthMonthIndex % 12) + 1;
  const anniversaryDay = Math.min(
    birthDate.day,
    daysInMonth(anniversaryYear, anniversaryMonth),
  );

  const elapsedDays =
    toUtcDayNumber(today) -
    toUtcDayNumber({
      year: anniversaryYear,
      month: anniversaryMonth,
      day: anniversaryDay,
    });

  return { years, months, days: elapsedDays };
}

function getNextBirthday(birthDate, today) {
  let year = today.year;
  let month = birthDate.month;
  let day = Math.min(birthDate.day, daysInMonth(year, month));

  let nextBirthday = { year, month, day };

  if (toUtcDayNumber(nextBirthday) <= toUtcDayNumber(today)) {
    year += 1;
    day = Math.min(birthDate.day, daysInMonth(year, month));
    nextBirthday = { year, month, day };
  }

  return toUtcDayNumber(nextBirthday) - toUtcDayNumber(today);
}

function clearMessage() {
  message.textContent = "";
  birthdayInput.removeAttribute("aria-invalid");
}

function showError(text) {
  message.textContent = text;
  birthdayInput.setAttribute("aria-invalid", "true");
  placeholderCopy.textContent = "Revisá la fecha para ver el resultado.";
  placeholder.hidden = false;
  resultContent.hidden = true;
  birthdayInput.focus();
}

function renderResult(age, birthDate, today) {
  yearsOutput.textContent = age.years;
  yearsLabel.textContent = age.years === 1 ? "año" : "años";
  monthsOutput.textContent = age.months;
  daysOutput.textContent = age.days;
  caption.textContent =
    age.years === 0 && age.months === 0 && age.days === 0
      ? "¡Hoy empieza tu primer día!"
      : "Así se ve tu tiempo hasta hoy.";

  const birthdayToday =
    birthDate.month === today.month && birthDate.day === today.day;

  const observedBirthdayDay = Math.min(
    birthDate.day,
    daysInMonth(today.year, birthDate.month),
  );
  const isBirthdayToday =
    birthDate.month === today.month && observedBirthdayDay === today.day;

  if (isBirthdayToday) {
    birthdayNote.textContent = "¡Feliz cumpleaños!";
  } else {
    const daysUntilBirthday = getNextBirthday(birthDate, today);
    birthdayNote.textContent =
      daysUntilBirthday === 1
        ? "Falta 1 día para tu próximo cumpleaños."
        : `Tu próximo cumpleaños es en ${daysUntilBirthday} días.`;
  }

  placeholderCopy.textContent = "Tu resultado va a aparecer acá.";
  placeholder.hidden = true;
  resultContent.hidden = false;
}

function handleSubmit(event) {
  event.preventDefault();
  clearMessage();

  if (!birthdayInput.value) {
    showError("Ingresá tu fecha de nacimiento para continuar.");
    return;
  }

  const birthDate = parseDateInput(birthdayInput.value);
  if (!birthDate) {
    showError("La fecha ingresada no es válida. Revisala e intentá otra vez.");
    return;
  }

  const today = getLocalDateParts();
  if (toUtcDayNumber(birthDate) > toUtcDayNumber(today)) {
    showError("La fecha de nacimiento no puede estar en el futuro.");
    return;
  }

  const age = calculateAge(birthDate, today);
  renderResult(age, birthDate, today);
}

birthdayInput.max = formatDateInput(getLocalDateParts());
form.addEventListener("submit", handleSubmit);
birthdayInput.addEventListener("input", clearMessage);
