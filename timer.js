const startBtn = document.querySelector('#start');
const resetBtn = document.querySelector('#stop');
const no = document.querySelector('#no');
const yesText = document.querySelector('#yes-text');
const yesSvg = document.querySelector('#yes-svg');
const hoursDisplay = document.querySelector('#hours');
const minutesDisplay = document.querySelector('#minutes');
const secondsDisplay = document.querySelector('#seconds');
const datePicker = document.querySelector('#datepicker');
const a11yCheckbox = document.querySelector('#a11y-checkbox');
const answerContainer = document.querySelector('#answer-container');

const policy = trustedTypes.createPolicy('timer-policy', {
  createHTML: (input) => DOMPurify.sanitize(input),
});

let timerInterval;

const runTimer = () => {
  // Enable the reset button.
  resetBtn?.addEventListener('click', reset);
  // prevent input clicks from reseting
  datePicker.removeEventListener('click', reset);
  datePicker?.addEventListener('click', disableInput);
  startBtn?.removeEventListener('click', runTimer);
  setTimer();
  // Check if an interval has already been set up.
  timerInterval ??= setInterval(setTimer, 1000);
};

const stopTimer = () => {
  startBtn?.addEventListener('click', runTimer);
  datePicker?.removeEventListener('click', disableInput);
  clearInterval(timerInterval);
  timerInterval = null;
};

const reset = () => {
  stopTimer();
  datePicker.value = policy.createHTML('');
  no.classList.add('hidden');
  yesText.classList.add('hidden');
  yesSvg.classList.add('hidden');
  answerContainer.classList.remove('answer-height');
  hoursDisplay.innerHTML = policy.createHTML('00:');
  minutesDisplay.innerHTML = policy.createHTML('00:');
  secondsDisplay.innerHTML = policy.createHTML('00');
};

startBtn?.addEventListener('click', runTimer);

const disableInput = e => e.preventDefault();

const formatTime = time => {
  return time < 10 ? `0${time}` : time.toString();
};

const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;
const formattedMonth = formatTime(month);
const day = new Date().getDate();
const formattedDay = formatTime(day);
const hours = new Date().getHours();
const formattedHours = formatTime(hours);
const minutes = new Date().getMinutes();
const formattedMinutes = formatTime(minutes);

const min = `${year}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}`;
// Set min attribute to current time to prevent selecting a time in the past.
const input = document.querySelector('#datepicker').setAttribute('min', min);

const setTimer = () => {
  const selectedTime = datePicker?.value;
  if (!selectedTime) {
    return;
  }
  const safeTimeInput = DOMPurify.sanitize(selectedTime);
  const finalTime = new Date(safeTimeInput);
  // Will be reset at each 1000 ms interval.
  const now = Date.now();
  const difference = finalTime.getTime() - now;
  const no = document.querySelector('#no');
  if (difference > 0) {
    no.classList.remove('hidden');
    answerContainer.classList.add('answer-height');
  }

  // Set the answer before 0 ms, to avoid delay at 0 seconds.
  if (difference < 1000 && !(difference <= 0)) {
    no.classList.add('hidden');
    // For opt-out of animation users, show regular text.
    if (a11yCheckbox.checked) {
      yesSvg.classList.remove('hidden');
    } else {
      yesText.classList.remove('hidden');
    }
    datePicker?.addEventListener('click', reset);
  }

  // Stop the clock when it hits zero ms.
  if (difference <= 0) {
    stopTimer();
    return;
  }

  const hours = Math.floor(difference / (1000 * 60 * 60)); // difference divided by ms in an hour
  const safeHours = policy.createHTML(hours);
  hoursDisplay.innerHTML = `${formatTime(safeHours)}:`;
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)); // remainder ms divided by ms in a minute
  const safeMinutes = policy.createHTML(minutes);
  minutesDisplay.innerHTML = `${formatTime(safeMinutes)}:`
  const seconds = Math.floor((difference % (1000 * 60)) / 1000); // remainder ms divided by ms in a second
  const safeSeconds = policy.createHTML(seconds)
  secondsDisplay.innerHTML = formatTime(safeSeconds);
}
