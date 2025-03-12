'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2023-11-18T21:31:17.178Z',
    '2023-12-23T07:42:02.383Z',
    '2024-06-28T09:15:04.904Z',
    '2024-08-01T10:17:24.185Z',
    '2024-09-08T14:11:59.604Z',
    '2024-10-27T17:01:17.194Z',
    '2024-12-15T10:36:17.929Z',
    '2024-12-16T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Daria Aleshina',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2023-11-01T13:15:33.035Z',
    '2023-11-30T09:48:16.867Z',
    '2023-12-25T06:04:23.907Z',
    '2024-01-25T14:18:46.235Z',
    '2024-02-05T16:33:06.386Z',
    '2024-04-10T14:43:26.374Z',
    '2024-06-25T18:49:59.371Z',
    '2024-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

// create short usernames
function createUsernames(accounts) {
  accounts.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  })
};

createUsernames(accounts);

const formatMovementDate = (movDate, locale) => {
  const calcDaysPassed = (date1, date2) => Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));


  const date = new Date(movDate);

  const daysPassed = calcDaysPassed(date, new Date());

  const day = `${date.getDate()}`.padStart(2, 0);
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const year = date.getFullYear();

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else return new Intl.DateTimeFormat(locale).format(date);
}

const formatMovement = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(value);
};


// // tests for calcDaysPassed
// const daysPassed1 = calcDaysPassed(new Date(2024, 0, 1), new Date(2025, 0, 1))
// console.log('test 1: ', daysPassed1 === 366);

// const daysPassed2 = calcDaysPassed(new Date(2024, 0, 1), new Date(2024, 0, 11))
// console.log('test 2: ', daysPassed2 === 10);


// Dispay Movements
const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  const combinedMovsDates = account.movements.map((mov, i) =>
    ({ movement: mov, movDate: account.movementsDates.at(i) })
  );

  // const movs = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements;
  if (sort) combinedMovsDates.sort((a, b) => a.movement - b.movement);

  combinedMovsDates.forEach(function (obj, i) {
    const { movement, movDate } = obj;

    const displayMovement = formatMovement(movement, account.locale, 'EUR');

    const type = movement > 0 ? 'deposit' : 'withdrawal';
    const displayDate = formatMovementDate(movDate, account.locale);


    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${displayMovement}</div>
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });

  // [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
  //   if ((i + 1) % 2 === 0) row.style.backgroundColor = '#F0F0F0';
  // })

}

// Update current BALANCE 
const calcBalance = function (account) {
  account.balance = account.movements.reduce((acc, amount) => acc + amount, 0);
  labelBalance.textContent = `${formatMovement(account.balance, account.locale, 'EUR')}`;
};


// Update bottom snapshot of money movements
const calcSummary = function (account) {
  const totalDeposits = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatMovement(totalDeposits, account.locale, 'EUR')}`;

  const totalWithdrawals = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatMovement(totalWithdrawals, account.locale, 'EUR')}`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * account.interestRate / 100)
    .filter(interest => interest >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formatMovement(interest, account.locale, 'EUR')}`;
};

const updateUI = function (account) {
  // display movements
  displayMovements(account);

  // display balance
  calcBalance(account);

  // display summary
  calcSummary(account);
};

const startLogOutTimerMin = function (timeInMin) {

  const tick = function () {
    const displayMin = `${Math.trunc(timeInSec / 60)}`.padStart(2, 0);
    const displaySec = `${timeInSec % 60}`.padStart(2, 0);
    labelTimer.textContent = `${displayMin}:${displaySec}`;

    // log out when expired (0 seconds)
    if (timeInSec === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    };

    timeInSec--;
  };

  // set time to 5 mins
  let timeInSec = timeInMin * 60;
  console.log(timeInSec);
  tick();

  // update timer every second
  const timer = setInterval(tick, 1000);
  return timer;
};


// LogIn Functionality
let currentAccount, timer;


// // FAKE ALWAYS LOGIN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;
// //  end FAKE LOGIN

// displaying date for Currect balance 
// const now = new Date();
// const day = `${now.getDate()}`.padStart(2, 0);
// const month = `${now.getMonth() + 1}`.padStart(2, 0);
// const year = now.getFullYear();
// const hour = `${now.getHours()}`.padStart(2, 0);
// const min = `${now.getMinutes()}`.padStart(2, 0);
// labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min} `;

btnLogin.addEventListener('click', function (event) {

  event.preventDefault();

  if (timer) clearInterval(timer);
  timer = startLogOutTimerMin(5);

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
  console.log(currentAccount);

  if (currentAccount?.pin === +(inputLoginPin.value)) {

    // clear the input fields
    inputLoginUsername.value = inputLoginPin.value = '';

    // add current date & time (INTL)
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'short'
    }

    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

    // display UI and message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]} `;
    containerApp.style.opacity = 100;

    updateUI(currentAccount);

  }
});

btnTransfer.addEventListener('click', function (event) {
  event.preventDefault();
  // get data from form
  const amount = +(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  console.log(amount, receiverAcc);

  if (
    amount > 0 &&
    receiverAcc &&
    amount <= currentAccount.balance &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toISOString());

    inputTransferAmount.value = inputTransferTo.value = '';

    console.log('Transfer valid & executed');
    updateUI(currentAccount);

    // reset the timer
    clearInterval(timer);
    timer = startLogOutTimerMin(5);

  }
});

btnLoan.addEventListener('click', function (event) {
  event.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some(mov => mov >= 0.1 * amount)
  ) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    // reset the timer
    clearInterval(timer);
    timer = startLogOutTimerMin(5);
  }
  inputLoanAmount.value = '';

});

btnClose.addEventListener('click', function (event) {
  event.preventDefault();
  console.log('button Close Account');
  if (
    inputCloseUsername.value === currentAccount.username &&
    inputClosePin.value == currentAccount.pin
  ) {
    console.log('credentials correct');
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  } else {
    console.log('credentials wrong');
  };
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (event) {
  event.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
})

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const generateRandomInt = (min, max) => {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// console.log(generateRandomInt(10, 20));
// console.log(generateRandomInt(0, 3));

// const isEvenNumber = n => n % 2 === 0;

// console.log(isEvenNumber(8));
// console.log(isEvenNumber(3));

// setInterval(() => {
//   const now = new Date();
//   console.log(now);
// }, 1000);