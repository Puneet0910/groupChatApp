async function login(event){
  event.preventDefault();
  const email = event.target.email.value;
  const password = event.target.password.value;
  const loginDetails = {email,password};
  console.log(loginDetails);
  
}