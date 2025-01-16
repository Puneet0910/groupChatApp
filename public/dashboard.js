async function sendMsg(event) {
    event.preventDefault();
    const msg = document.getElementById('msg').value;
    // console.log(msg);
    try {
      const response = await axios.post(`http://localhost:3000/msg/sendMsg`, msg);
      alert("Message Sent Successfully");
    } catch (error) {
      console.log(error);
      
    }
    

}