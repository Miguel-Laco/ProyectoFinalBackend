/* userManager.js */
const socket = io();

function changeUserRole (email){
    socket.emit("changeUserRole", email)
}

function deleteUser (email) {
    socket.emit("deleteUser", email )
}

socket.on("reloadManager", () => {
    window.location.reload();
})