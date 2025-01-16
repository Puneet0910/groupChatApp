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
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    alert("Please Login to Continue");
    location.href = "./index.html";
    return;
  }
});
