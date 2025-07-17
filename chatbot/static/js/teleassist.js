// teleassist.js

async function fetchSessions() {
    const res = await fetch('/teleassist/sessions');
    const data = await res.json();
    const pendingList = document.getElementById('pendingSessionsList');
    pendingList.innerHTML = '';
    if (data.pending.length === 0) {
        pendingList.innerHTML = '<li class="list-group-item">No hay sesiones pendientes</li>';
    } else {
        data.pending.forEach(session => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <div>
                    <strong>#${session.session_id}</strong><br>
                    ${session.issue}
                </div>
                <button class='btn btn-sm btn-success accept-btn' data-session-id='${session.session_id}'>Aceptar</button>
            `;
            pendingList.appendChild(li);
        });
    }
    // Add event listeners to accept buttons
    document.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const sessionId = this.getAttribute('data-session-id');
            await fetch(`/teleassist/accept_session/${sessionId}`, { method: 'POST' });
            alert(`Sesión aceptada: ${sessionId}`);
            fetchSessions();
        });
    });
}

document.getElementById('sessionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user_id = document.getElementById('userId').value;
    const issue = document.getElementById('issue').value;
    const remote_tool = document.getElementById('remoteTool').value;
    await fetch('/teleassist/create_session?user_id=' + encodeURIComponent(user_id) + '&issue=' + encodeURIComponent(issue) + '&remote_tool=' + encodeURIComponent(remote_tool), {
        method: 'POST'
    });
    alert('Sesión creada');
    fetchSessions();
});

window.onload = fetchSessions; 