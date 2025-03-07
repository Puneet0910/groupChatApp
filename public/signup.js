async function signup(event) {
  event.preventDefault();
  const name = event.target.name.value;
  const email = event.target.email.value;
  const phone = event.target.phone.value;
  const password = event.target.password.value;
  const userData = { name, email, phone, password };
  // console.log(userData);
  try {
    const response = await axios.post(
      "http://localhost:3000/user/signup",
      userData
    );
    alert(response.data.message);
    // location.href = "index.html";
  } catch (error) {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 409) {
        alert("Email already exists. Please use a different email.");
      } else {
        alert(error.response.data.message || "Something went wrong!");
      }
    } else {
      // Handle other errors (e.g., network issues)
      console.error(error);
      alert("An unexpected error occurred. Please try again.");
    }
  }
}
