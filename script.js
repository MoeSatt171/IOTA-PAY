const users = {
  "alpha123": {
    username: "Alpha",
    balance: 100,
    receiveAddress: "iotaddress_ALPHA_123456",
    transactions: [
      { type: "received", text: "Received 60 IOTA from BetaUser at " },
      { type: "received", text: "Received 40 IOTA from Gamma at " }
    ]
  },
  "beta456": {
    username: "Beta",
    balance: 50,
    receiveAddress: "iotaddress_BETA_654321",
    transactions: [
      { type: "received", text: "Received 30 IOTA from Alpha at " },
      { type: "sent", text: "Sent 10 IOTA to Gamma at " }
    ]
  },
  "gamma789": {
    username: "Gamma",
    balance: 75,
    receiveAddress: "iotaddress_GAMMA_987654",
    transactions: [
      { type: "received", text: "Received 75 IOTA from Alpha at " }
    ]
  }
};

let balance = 0;
let transactions = [];
let currentUser = null;

const clearIntervalMs = 3 * 24 * 60 * 60 * 1000;
const now = Date.now();
const lastClear = localStorage.getItem("lastClearTime");

if (!lastClear || now - parseInt(lastClear) > clearIntervalMs) {
  localStorage.setItem("lastClearTime", now.toString());
  balance = 0;
  transactions = [];
}

function login() {
  const code = document.getElementById("secret").value;
  const notice = document.getElementById("loginNotice");

  if (users.hasOwnProperty(code)) {
    currentUser = users[code];
    balance = currentUser.balance;
    transactions = currentUser.transactions.map(t => ({
      type: t.type,
      text: t.text + getDateTime()
    }));

    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("homePage").classList.remove("hidden");
    document.getElementById("balanceSection").classList.remove("hidden");

    updateTransactions();
  } else {
    notice.textContent = "Incorrect secret code. Please try again.";
  }
}

function getDateTime() {
  const d = new Date();
  return d.toLocaleString();
}

function updateTransactions() {
  const container = document.getElementById("transactions");
  container.innerHTML = '';
  transactions.slice().reverse().forEach(tx => {
    const div = document.createElement("div");
    div.className = "transaction " + tx.type;
    div.textContent = tx.text;
    container.appendChild(div);
  });
  document.getElementById("balance").textContent = balance;
}

function goToSend() {
  document.getElementById("homePage").classList.add("hidden");
  document.getElementById("sendPage").classList.remove("hidden");
}

function goToReceive() {
  document.getElementById("homePage").classList.add("hidden");
  document.getElementById("receivePage").classList.remove("hidden");

  const addr = currentUser.receiveAddress;
  document.getElementById("receiveAddress").textContent = addr;

  const link = "https://explorer.iota.org/mainnet/addr/" + addr;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(addr)}&size=200x200`;

  document.getElementById("receiveLink").href = link;
  document.getElementById("receiveImage").src = qr;
}

function sendIOTA() {
  const address = document.getElementById("iotaAddress").value;
  const amount = parseFloat(document.getElementById("iotaAmount").value);
  if (!address || isNaN(amount) || amount <= 0) {
    alert("Enter a valid address and amount");
    return;
  }
  if (amount > balance) {
    alert("Insufficient balance");
    return;
  }
  balance -= amount;
  transactions.push({
    type: "sent",
    text: `Sent ${amount} IOTA to ${address.slice(0, 10)}******* at ${getDateTime()}`
  });
  goHome();
}

function goHome() {
  document.getElementById("sendPage").classList.add("hidden");
  document.getElementById("receivePage").classList.add("hidden");
  document.getElementById("homePage").classList.remove("hidden");
  updateTransactions();
}

function copyAddress() {
  const text = document.getElementById("receiveAddress").textContent;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    alert("Address copied to clipboard!");
  } catch (err) {
    alert("Failed to copy address");
  }
  document.body.removeChild(textarea);
}

function logout() {
  location.reload();
}

function showHelp() {
  alert("This is your offline IOTA PAY wallet.\nUse Send/Receive to manage IOTA.\nNeed support? Join us on Telegram.");
}
