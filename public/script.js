const socket = io();
const name = localStorage.getItem("chatName");

if (!name) window.location = "/";

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const fileInput = document.getElementById("file");

function addMessage(msg) {
  const li = document.createElement("li");

  if (msg.file) {
    li.innerHTML = `<b>${msg.name}:</b> <a href="${msg.file}" target="_blank">${msg.fileName}</a>`;
  } else {
    li.innerHTML = `<b>${msg.name}:</b> ${msg.text}`;
  }

  messages.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);
}

fetch("/history")
  .then(res => res.json())
  .then(history => history.forEach(addMessage));

form.addEventListener("submit", async e => {
  e.preventDefault();

  if (fileInput.files.length > 0) {
    const data = new FormData();
    data.append("file", fileInput.files[0]);

    const res = await fetch("/upload", {
      method: "POST",
      body: data
    });

    const file = await res.json();

    const msg = {
      name,
      file: file.filePath,
      fileName: file.fileName
    };

    socket.emit("chat message", msg);
    fileInput.value = "";
  } else if (input.value) {
    const msg = { name, text: input.value };
    socket.emit("chat message", msg);
    input.value = "";
  }
});

socket.on("chat message", addMessage);
