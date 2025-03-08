async function login(event) {
  event.preventDefault();
  const email = event.target.email.value;
  const password = event.target.password.value;
  const loginDetails = { email, password };
  // console.log(loginDetails);

  try {
    const response = await axios.post(
      "http://localhost:3000/user/login",
      loginDetails
    );
    const token = response.data.token;
    localStorage.setItem("token", token);
    alert("Login Successfull");
    location.href = "dashboard.html";
  } catch (error) {
    if (error.response) {
      alert(error.response.data.message);
    } else {
      console.error(error);
      alert("An unexpected error occurred. Please try again.");
    }
  }
}
