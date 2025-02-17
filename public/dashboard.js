const token = localStorage.getItem("token");
let activeGroupId = null; // Track the active group

// Save messages to localStorage
function saveMessagesToLocalStorage(messages, groupId) {
  let storedMessages = JSON.parse(localStorage.getItem("messages")) || {};

  if (!storedMessages[groupId]) {
    storedMessages[groupId] = [];
  }

  storedMessages[groupId].push(...messages);

  if (storedMessages[groupId].length > 10) {
    storedMessages[groupId] = storedMessages[groupId].slice(-10); // Keep only the latest 10 messages per group
  }

  localStorage.setItem("messages", JSON.stringify(storedMessages));
}


// Load messages from localStorage
function loadMessagesFromLocalStorage() {
  const chatContainer = document.getElementById("chatContainer");
  chatContainer.innerHTML = ""; // Clear messages before loading new ones

  const storedMessages = JSON.parse(localStorage.getItem("messages")) || {};

  // Only load messages for the selected group or global chat
  const messages = storedMessages[activeGroupId] || [];

  messages.forEach(({ userName, content, createdAt }) => {
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
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.innerHTML = ""; // Clear chat container before loading new messages

    const endpoint = activeGroupId
      ? `http://localhost:3000/msg/getMessages?groupId=${activeGroupId}`
      : `http://localhost:3000/msg/getMessages`;

    const { data } = await axios.get(endpoint, {
      headers: { Authorization: token },
    });

    if (!data || data.length === 0) {
      console.log("No messages found.");
      localStorage.setItem("messages", JSON.stringify({})); // Clear stored messages
      return;
    }

    saveMessagesToLocalStorage(data, activeGroupId);
    loadMessagesFromLocalStorage(); // Load only relevant messages
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

    document.getElementById("msg").value = ""; // Reset the input field
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
      groupItem.onclick = () => switchGroup(id); // When clicked, switch to this group
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
  if (activeGroupId === groupId) return; // Prevent unnecessary reloading

  activeGroupId = groupId;
  localStorage.setItem("activeGroupId", groupId); // Store active group

  fetchNewMessages();
  updateActiveGroupUI(groupId);
}



// Update the UI to highlight the active group
function updateActiveGroupUI(groupId) {
  const groupItems = document.querySelectorAll(".group-item");
  groupItems.forEach((item) => {
    if (groupId && item.dataset.groupId == groupId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Hide "Leave Group" button if switching to global chat
  const leaveGroupBtn = document.getElementById("leaveGroupBtn");
  if (leaveGroupBtn) {
    leaveGroupBtn.style.display = groupId ? "block" : "none";
  }
}

document.getElementById("exitGroupLink").addEventListener("click", (event) => {
  event.preventDefault(); // Prevent default link behavior
  activeGroupId = null; // Reset active group (switch back to global chat)
  fetchNewMessages();
  updateActiveGroupUI(null); // Remove active group highlighting
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    alert("Please login to continue");
    location.href = "./index.html";
  }
  fetchGroups();
  fetchNewMessages();
  // setInterval(fetchNewMessages, 3000); // Optional, fetch messages every 3 seconds
});

document
  .getElementById("createGroupBtn")
  .addEventListener("click", createGroup);

document.getElementById("send-msg").addEventListener("click", sendMsg);

async function inviteToGroup(groupId, email) {
  try {
    await axios.post(
      "http://localhost:3000/groups/inviteUser",
      { groupId, email },
      { headers: { Authorization: token } }
    );
    alert("User invited successfully!");
  } catch (error) {
    console.error("Error inviting user:", error);
    alert("Failed to invite user.");
  }
}
