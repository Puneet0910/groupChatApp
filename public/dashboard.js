const token = localStorage.getItem("token");

// Function to save messages to localStorage
function saveMessagesToLocalStorage(messages) {
  let storedMessages = JSON.parse(localStorage.getItem("messages")) || [];

  // If there are already 10 messages, remove the oldest one
  if (storedMessages.length >= 10) {
    storedMessages.shift(); // Remove the first (oldest) message
  }

  // Add the new messages at the end
  storedMessages.push(...messages);

  // Save the updated list of messages back to localStorage
  localStorage.setItem("messages", JSON.stringify(storedMessages));
}

// Function to load messages from localStorage
function loadMessagesFromLocalStorage() {
  const storedMessages = JSON.parse(localStorage.getItem("messages")) || [];
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.innerHTML = ""; // Clear existing messages

  storedMessages.forEach((chat) => {
    const chatElement = document.createElement("div");
    chatElement.classList.add("chat-message");
    chatElement.innerHTML = `
      <span class="sender-name">${chat.userName}</span>
      <span class="chat-text">${chat.message}</span>
      <span class="timestamp">${new Date(
        chat.createdAt
      ).toLocaleTimeString()}</span>
    `;
    chatContainer.appendChild(chatElement);
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send message function
async function sendMsg(event) {
  event.preventDefault();
  const msg = document.getElementById("msg").value;
  const msgData = { msg };

  try {
    const response = await axios.post(
      `http://localhost:3000/msg/sendMsg`,
      msgData,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    alert("Message Sent Successfully");
    document.getElementById("messages").reset();

    // Add the new message to localStorage and update the chat
    saveMessagesToLocalStorage([
      {
        userName: response.data.userName, // Assuming backend returns userName
        message: msg,
        createdAt: new Date().toISOString(),
      },
    ]);

    loadMessagesFromLocalStorage(); // Reload messages from localStorage
  } catch (error) {
    console.log(error);
  }
}

// Function to fetch new messages from backend
async function fetchNewMessages() {
  try {
    const response = await axios.get("http://localhost:3000/msg/getChats", {
      headers: { Authorization: token },
    });

    const newMessages = response.data;

    // Save new messages to localStorage
    saveMessagesToLocalStorage(newMessages);

    // Reload messages from localStorage to reflect updates
    loadMessagesFromLocalStorage();
  } catch (error) {
    console.error("Error fetching new messages:", error);
  }
}

// Display chats when page loads
document.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    alert("Please Login to Continue");
    location.href = "./index.html";
    return;
  }

  // Load existing messages from localStorage
  loadMessagesFromLocalStorage();

  // Fetch new messages from backend
  await fetchNewMessages();

  // Periodically fetch new chats every 3 seconds
  setInterval(fetchNewMessages, 3000);
});
