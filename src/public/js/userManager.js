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


async function deleteInactiveUsers() {
    try {
        const response = await fetch('http://localhost:8080/api/users', {
        method: 'DELETE',
        });

        if (response.ok) {
            await Swal.fire({
                title: "Usuarios eliminados",
                text: "Se eliminaron y notificaron los usuarios",
                icon: "success",
            });
            socket.emit("reloadPage")
        } else {
            await Swal.fire({
                title: "Error",
                text: "Error al eliminar los usuarios",
                icon: "error",
        });
    }
    } catch (error) {
        console.error('Error en la solicitud DELETE:', error);
    }
}


