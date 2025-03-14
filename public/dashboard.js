const token = localStorage.getItem("token");
const endPoint = "http://localhost:3000/";

async function sendMsg(event) {
  event.preventDefault();
  const message = document.getElementById("msg").value;
  try {
    await axios.post(
      `${endPoint}msg/sendMsg`,
      { msg: message },
      {
        headers: { Authorization: token },
      }
    );
    alert("Message Sent");
    document.getElementById("msg").value = "";
    fetchNewMessages(); // Fetch updated messages
  } catch (error) {
    console.log(error);
  }
}

function saveMessagesToLocalStorage(messages) {
  let storedMessages = JSON.parse(localStorage.getItem("messages")) || [];

  if (!Array.isArray(storedMessages)) {
    storedMessages = [];
  }

  if (!Array.isArray(messages)) {
    console.error(
      "saveMessagesToLocalStorage received non-array data:",
      messages
    );
    return;
  }

  storedMessages.push(...messages); // Now messages will always be an array

  if (storedMessages.length > 10) {
    storedMessages = storedMessages.slice(-10);
  }

  localStorage.setItem("messages", JSON.stringify(storedMessages));
}

function loadMessagesFromLocalStorage() {
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.innerHTML = ""; // Clear messages before loading new ones

  const storedMessages = JSON.parse(localStorage.getItem("messages")) || [];

  if (!Array.isArray(storedMessages)) {
    return;
  }

  storedMessages.forEach(({ userName, content, createdAt }) => {
    const chatElement = document.createElement("div");
    chatElement.classList.add("chat-content");
    chatElement.innerHTML = `
      <span class="sender-name">${userName}</span>
      <span class="chat-text">${content}</span>
      <span class="timestamp">${
        createdAt ? new Date(createdAt).toLocaleTimeString() : ""
      }</span>
    `;
    chatContainer.appendChild(chatElement);
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function fetchNewMessages() {
  try {
    const { data } = await axios.get(`${endPoint}msg/getMessages`, {
      headers: { Authorization: token },
    });

    console.log("Fetched data:", data); // Debugging log

    if (!data || !Array.isArray(data.messages)) {
      console.log("No messages found or invalid data format.");
      localStorage.setItem("messages", JSON.stringify([]));
      return;
    }

    saveMessagesToLocalStorage(data.messages); // Now passing the correct array
    loadMessagesFromLocalStorage();
  } catch (error) {
    console.error("Error fetching messages:", error);
    alert("Failed to fetch messages. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    alert("Please login to continue");
    location.href = "./index.html";
  } else {
    fetchNewMessages();
    // setInterval(fetchNewMessages, 3000); // Fetch every 3 seconds
  }
});
