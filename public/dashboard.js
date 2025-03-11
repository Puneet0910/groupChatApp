const token = localStorage.getItem("token");
async function sendMsg(event) {
  event.preventDefault();
  const message = document.getElementById("msg").value;
  try {
    const endPoint = "http://localhost:3000/msg/sendMsg";
    await axios.post(
      endPoint,
      { msg: message },
      {
        headers: { Authorization: token },
      }
    );
    alert("Message Sent");
    document.getElementById("msg").value = "";
  } catch (error) {
    console.log(error);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    alert("Please login to continue");
    location.href = "./index.html";
  }
});