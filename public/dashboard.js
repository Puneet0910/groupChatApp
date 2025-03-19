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

    saveMessagesToLocalStorage(data.messages);
    loadMessagesFromLocalStorage();
  } catch (error) {
    console.error("Error fetching messages:", error);
    alert("Failed to fetch messages. Please try again.");
  }
}
async function fetchAllUsers() {
  try {
    const response = await axios.get(`${endPoint}user/getUsers`); // Await the response
    displayUsers(response.data); // Pass the actual data (array of users)
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

function displayUsers(users) {
  const userList = document.getElementById("usersList");
  userList.innerHTML = ""; // Clear the list before appending

  users.forEach((user) => {
    const userItem = document.createElement("li");
    userItem.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );

    // User name
    const userName = document.createElement("span");
    userName.textContent = user.name;

    // Buttons Container
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("user-btns");

    // "Send Message" Button
    const sendMsgBtn = document.createElement("button");
    sendMsgBtn.textContent = "Send Message";
    sendMsgBtn.classList.add("btn", "btn-primary", "btn-sm");
    sendMsgBtn.onclick = () => sendMessageToUser(user.name);

    // "Add to Group" Button
    const addToGroupBtn = document.createElement("button");
    addToGroupBtn.textContent = "Add to Group";
    addToGroupBtn.classList.add("btn", "btn-success", "btn-sm");
    addToGroupBtn.onclick = () => addUserToGroup(user.name);

    // Append buttons to container
    buttonContainer.appendChild(sendMsgBtn);
    buttonContainer.appendChild(addToGroupBtn);

    // Append elements to the user list item
    userItem.appendChild(userName);
    userItem.appendChild(buttonContainer);
    userList.appendChild(userItem);
  });
}

// Placeholder function for sending a message to a user
function sendMessageToUser(userName) {
  alert(`Sending message to ${userName} (Feature in progress...)`);
}

// Placeholder function for adding a user to a group
function addUserToGroup(userName) {
  alert(`Adding ${userName} to a group (Feature in progress...)`);
}



document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    alert("Please login to continue");
    location.href = "./index.html";
  } else {
    fetchNewMessages();
    fetchAllUsers();
  }
});
