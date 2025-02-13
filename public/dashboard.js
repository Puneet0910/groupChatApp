const token = localStorage.getItem("token");
let activeGroupId = null; // Track the active group

// Save messages to localStorage
function saveMessagesToLocalStorage(messages) {
  let storedMessages = JSON.parse(localStorage.getItem("messages")) || [];

  storedMessages.push(...messages);

  if (storedMessages.length > 10) {
    storedMessages = storedMessages.slice(-10); // Keep only the latest 50 messages
  }

  localStorage.setItem("messages", JSON.stringify(storedMessages));
}


// Load messages from localStorage
function loadMessagesFromLocalStorage() {
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.innerHTML = ""; // Clear existing messages
  const storedMessages = JSON.parse(localStorage.getItem("messages")) || [];
  storedMessages.forEach(({ userName, content, createdAt }) => {
    const chatElement = document.createElement("div");
    chatElement.classList.add("chat-content");
    chatElement.innerHTML = `
            <span class="sender-name">${userName}</span>
            <span class="chat-text">${content}</span>
            <span class="timestamp">${new Date(
              createdAt
            ).toLocaleTimeString()}</span>
        `;
    chatContainer.appendChild(chatElement);
  });
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Fetch new messages from backend
async function fetchNewMessages() {
  try {
    const endpoint = activeGroupId
      ? `http://localhost:3000/msg/getMessages?groupId=${activeGroupId}`
      : `http://localhost:3000/msg/getMessages`;

    const { data } = await axios.get(endpoint, {
      headers: { Authorization: token },
    });

    if (!data || data.length === 0) {
      console.log("No messages found.");
      localStorage.setItem("messages", JSON.stringify([])); // Clear stored messages
      loadMessagesFromLocalStorage();
      return;
    }

    saveMessagesToLocalStorage(data);
    loadMessagesFromLocalStorage();
  } catch (error) {
    console.error("Error fetching messages:", error);
    alert("Failed to fetch messages. Please try again.");
  }
}

// Send message
async function sendMsg(event) {
  event.preventDefault();
  const message = document.getElementById("msg").value;
  try {
    const endpoint = "http://localhost:3000/msg/sendMsg";
    await axios.post(
      endpoint,
      { msg: message, groupId: activeGroupId },
      { headers: { Authorization: token } }
    );
    console.log(msg);
    
    document.getElementById("messages").reset();
    fetchNewMessages();
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Failed to send message. Please try again.");
  }
}

// Fetch groups and update UI
async function fetchGroups() {
  try {
    const { data } = await axios.get(
      "http://localhost:3000/groups/userGroups",
      {
        headers: { Authorization: token },
      }
    );

    const groupList = document.getElementById("groupList");
    groupList.innerHTML = "";

    if (!data || data.length === 0) {
      groupList.innerHTML = "<li>No groups available. Create one!</li>";
      return; // Exit if no groups exist
    }

    data.forEach(({ id, name }) => {
      const groupItem = document.createElement("li");
      groupItem.classList.add("group-item");
      groupItem.dataset.groupId = id;
      groupItem.innerHTML = `
                <span>${name}</span>
                <button class="btn btn-sm btn-danger" onclick="leaveGroup(${id})">Leave</button>
            `;
      groupItem.onclick = () => switchGroup(id);
      groupList.appendChild(groupItem);
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    document.getElementById("groupList").innerHTML =
      "<li>Failed to load groups. Please try again.</li>";
  }
}


// Create a new group
async function createGroup() {
  const groupName = prompt("Enter group name:");
  if (!groupName) return;
  try {
    await axios.post(
      "http://localhost:3000/groups/createGroup",
      { name: groupName },
      { headers: { Authorization: token } }
    );
    fetchGroups();
  } catch (error) {
    console.error("Error creating group:", error);
    alert("Failed to create group. Please try again.");
  }
}

// Leave a group
async function leaveGroup(groupId) {
  try {
    await axios.delete(`http://localhost:3000/groups/leave/${groupId}`, {
      headers: { Authorization: token },
    });
    fetchGroups();
    if (groupId === activeGroupId) {
      activeGroupId = null;
      fetchNewMessages();
    }
  } catch (error) {
    console.error("Error leaving group:", error);
    alert("Failed to leave group. Please try again.");
  }
}

// Switch to a group
function switchGroup(groupId) {
  activeGroupId = groupId;
  fetchNewMessages();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    alert("Please login to continue");
    location.href = "./index.html";
  }
  fetchGroups();
  fetchNewMessages();
  // setInterval(fetchNewMessages, 3000);
});

document
  .getElementById("createGroupBtn")
  .addEventListener("click", createGroup);
