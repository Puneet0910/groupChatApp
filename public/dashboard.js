const token = localStorage.getItem("token");
const endPoint = "http://localhost:3000/";
let currentGroupName = null; // Track the active group

async function sendMsg(event) {
  event.preventDefault();
  const message = document.getElementById("msg").value;

  try {
    await axios.post(
      `${endPoint}msg/sendMsg`,
      { msg: message, groupName: currentGroupName }, // Include group name
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
    const endpoint = currentGroupName
      ? `${endPoint}groups/getGroupMessages?groupName=${encodeURIComponent(
          currentGroupName
        )}`
      : `${endPoint}msg/getMessages`;

    const { data } = await axios.get(endpoint, {
      headers: { Authorization: token },
    });

    console.log("Fetched data from API:", data); // Debugging

    if (!data || !Array.isArray(data.messages)) {
      console.error("No messages found or invalid data format.");
      localStorage.setItem("messages", JSON.stringify([]));
      return;
    }

    localStorage.setItem("messages", JSON.stringify(data.messages)); // Replace, don't append
    loadMessagesFromLocalStorage();
  } catch (error) {
    console.error("Error fetching messages:", error);
    alert("Failed to fetch messages. Please try again.");
  }
}

async function fetchAllUsers() {
  try {
    const response = await axios.get(`${endPoint}user/getUsers`, {
      headers: { Authorization: token },
    });
    displayUsers(response.data);
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

    // "Add to Group" Button
    const addToGroupBtn = document.createElement("button");
    addToGroupBtn.textContent = "Add to Group";
    addToGroupBtn.classList.add("btn", "btn-success", "btn-sm");
    addToGroupBtn.onclick = () => addUserToGroup(user.name);
    buttonContainer.appendChild(addToGroupBtn);

    userItem.appendChild(userName);
    userItem.appendChild(buttonContainer);
    userList.appendChild(userItem);
  });
}

// Create a new group
async function createGroup() {
  const groupName = document.getElementById("groupName").value;

  if (!groupName) {
    alert("Please enter a group name.");
    return;
  }

  try {
    await axios.post(
      "http://localhost:3000/groups/createGroup",
      { name: groupName },
      { headers: { Authorization: token } }
    );

    alert("Group created successfully!");
    fetchMyGroups();

    // Close the modal after group creation
    const createGroupModalEl = document.getElementById("createGroupModal");
    const createGroupModal = bootstrap.Modal.getInstance(createGroupModalEl);

    if (createGroupModal) {
      createGroupModal.hide();
    }

    // Clear the input field
    document.getElementById("groupName").value = "";
  } catch (error) {
    console.error("Error creating group:", error);
    alert("Failed to create group. Please try again.");
  }
}
async function fetchMyGroups() {
  try {
    const response = await axios.get("http://localhost:3000/groups/getGroups", {
      headers: { Authorization: token },
    });

    const groupList = document.getElementById("groupList");
    groupList.innerHTML = ""; // Clear previous data

    const groups = response.data.groups;
    console.log("Groups Data:", groups); // Debugging purpose

    if (!groups || groups.length === 0) {
      groupList.innerHTML = "<li>No groups available</li>";
      return;
    }

    groups.forEach((group) => {
      const listItem = document.createElement("li");
      listItem.classList.add("group-item");

      // Ensure Group Name is Displayed
      const groupNameSpan = document.createElement("span");
      groupNameSpan.textContent = group || "Unnamed Group"; // Fallback if name is missing
      groupNameSpan.style.color = "#000"; // Ensure it's visible

      const viewButton = document.createElement("button");
      viewButton.textContent = "View Group";
      viewButton.classList.add("btn", "btn-primary", "btn-sm");
      viewButton.onclick = () => viewGroup(group);

      listItem.appendChild(groupNameSpan);
      listItem.appendChild(viewButton);

      // Show delete button if the user is the admin
      if (group.createdBy === response.data.userId) {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Group";
        deleteButton.classList.add("btn", "btn-danger", "btn-sm", "ms-2");
        deleteButton.onclick = () => deleteGroup(group);
        listItem.appendChild(deleteButton);
      }

      groupList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    alert("Failed to load groups. Please try again.");
  }
}

async function deleteGroup(groupName) {
  if (
    !confirm(
      `Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`
    )
  ) {
    return;
  }

  try {
    const response = await axios.delete(
      "http://localhost:3000/groups/deleteGroup",
      {
        headers: { Authorization: token },
        data: { groupName },
      }
    );

    alert(response.data.message);
    fetchMyGroups(); // Refresh the group list
  } catch (error) {
    console.error("Error deleting group:", error);
    alert(
      error.response?.data?.error || "Failed to delete group. Please try again."
    );
  }
}

// Example function to handle viewing a group (customize as needed)
async function viewGroup(groupName) {
  try {
    currentGroupName = groupName;
    localStorage.removeItem("messages");

    // Fetch messages
    let endpoint = groupName
      ? `${endPoint}groups/getGroupMessages?groupName=${encodeURIComponent(
          groupName
        )}`
      : `${endPoint}msg/getMessages`;

    const response = await axios.get(endpoint, {
      headers: { Authorization: token },
    });

    console.log("✅ Group messages:", response.data.messages);

    if (!response.data || !Array.isArray(response.data.messages)) {
      console.error("🚨 No messages found or invalid format.");
      return;
    }

    saveMessagesToLocalStorage(response.data.messages);
    loadMessagesFromLocalStorage();

    // Fetch and show group members
    if (groupName) {
      showGroupMembers(groupName);
    } else {
      document.getElementById("groupSidebar").style.display = "none";
    }

    alert(
      groupName ? `Now viewing group: ${groupName}` : "Now viewing Global Chat"
    );
  } catch (error) {
    console.error("❌ Error viewing messages:", error);
    alert("Failed to load messages. Please try again.");
  }
}

async function showGroupMembers(groupName) {
  try {
    const response = await axios.get(
      `${endPoint}groups/getGroupMembers?groupName=${encodeURIComponent(
        groupName
      )}`,
      {
        headers: { Authorization: token },
      }
    );

    const members = response.data.members;
    const userId = response.data.userId; // The current user
    const isAdmin = response.data.isAdmin;

    const membersList = document.getElementById("groupMembersList");
    membersList.innerHTML = ""; // Clear previous data

    document.getElementById("groupSidebar").style.display = "block";

    members.forEach((member) => {
      const memberItem = document.createElement("li");
      memberItem.classList.add("list-group-item", "member-item");

      const memberName = document.createElement("span");
      memberName.textContent = `${member.name} ${
        member.isAdmin ? "(Admin)" : ""
      }`;
      memberItem.appendChild(memberName);

      // Show remove button if user is admin and member is not the admin
      if (isAdmin && member.userId !== userId) {
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.classList.add("remove-btn");
        removeBtn.onclick = () => removeUserFromGroup(groupName, member.userId);
        memberItem.appendChild(removeBtn);
      }

      membersList.appendChild(memberItem);
    });
  } catch (error) {
    console.error("Error fetching group members:", error);
    alert("Failed to load group members. Please try again.");
  }
}

async function removeUserFromGroup(groupName, userId) {
  if (
    !confirm(`Are you sure you want to remove this user from ${groupName}?`)
  ) {
    return;
  }

  try {
    const response = await axios.post(
      `${endPoint}groups/removeUserFromGroup`,
      { groupName, userId },
      { headers: { Authorization: token } }
    );

    alert(response.data.message);
    showGroupMembers(groupName); // Refresh the members list
  } catch (error) {
    console.error("Error removing user from group:", error);
    alert("Failed to remove user. Please try again.");
  }
}




async function addUserToGroup(userName) {
  try {
    // Fetch the user's groups
    const response = await axios.get("http://localhost:3000/groups/getGroups", {
      headers: { Authorization: token },
    });

    const groups = response.data.groups;

    if (groups.length === 0) {
      alert("You don't have any groups. Please create a group first.");
      return;
    }

    // Create a dropdown to select a group
    const selectedGroup = prompt(
      `Select a group to add ${userName}:\n` +
        groups.map((group, index) => `${index + 1}. ${group}`).join("\n")
    );

    if (!selectedGroup) {
      return; // User canceled the selection
    }

    const groupIndex = parseInt(selectedGroup) - 1;

    if (groupIndex < 0 || groupIndex >= groups.length) {
      alert("Invalid selection. Please try again.");
      return;
    }

    const groupName = groups[groupIndex];

    // Send the request to add the user to the group
    await axios.post(
      "http://localhost:3000/groups/addUserToGroup",
      { groupName, userName },
      { headers: { Authorization: token } }
    );

    alert(`${userName} has been added to ${groupName}!`);
  } catch (error) {
    console.error("Error adding user to group:", error);
    alert("User Already Member of this group");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    alert("Please login to continue");
    location.href = "./index.html";
  } else {
    fetchNewMessages();
    fetchAllUsers();
    fetchMyGroups();
  }
});
// Logout Function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("token"); // Remove the token
    localStorage.removeItem("messages"); // Clear messages
    alert("You have been logged out.");
    window.location.href = "./index.html"; // Redirect to login page
  }
}

// Add event listener to the logout button
document.getElementById("logoutBtn").addEventListener("click", logout);
