const token = localStorage.getItem("token");
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
    document.getElementById('messages').reset();
    displayChats();
  } catch (error) {
    console.log(error);
  }
}

async function displayChats() {
  try {
    const response = await axios.get(`http://localhost:3000/msg/getChats`, {
      headers: { Authorization: token },
    });
    const chats = response.data;
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.innerText = '';
    // Append or prepend messages based on paginati on
    chats.forEach((chat) => {
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
  } catch (error) {
    console.error("Error fetching chats:", error);
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    alert("Please Login to Continue");
    location.href = "./index.html";
    return;
  }
  await displayChats(); // Load chats on page load
});