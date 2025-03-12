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
    fetchMsg(); // Refresh messages after sending
  } catch (error) {
    console.log(error);
  }
}

async function fetchMsg() {
  try {
    const msgResponse = await axios.get(`${endPoint}msg/getMessages`, {
      headers: { Authorization: token },
    });

    displayMessages(msgResponse.data.messages); // Access correct response data
  } catch (error) {
    console.log(error, "error fetching msg");
  }
}

function displayMessages(messages) {
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.innerHTML = "";
  messages.forEach(({ user, content, createdAt }) => {
    const chatElement = document.createElement("div");
    chatElement.classList.add("chat-content");
    chatElement.innerHTML = `
      <span class="sender-name">${user.name}</span>
      <span class="chat-text">${content}</span>
      <span class="timestamp">${new Date(createdAt).toLocaleTimeString()}</span>
    `;
    chatContainer.appendChild(chatElement);
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    alert("Please login to continue");
    location.href = "./index.html";
  } else {
    fetchMsg(); // Fetch messages on page load
    setInterval(fetchMsg, 1000);
  }
});
