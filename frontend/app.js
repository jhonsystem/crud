const API_BASE_URL = window.APP_CONFIG?.API_URL || document.querySelector('meta[name="api-url"]')?.content || "http://localhost:3000";
const API_URL = `${API_BASE_URL.replace(/\/$/, "")}/api/personal`;

const form = document.getElementById("personalForm");
const idInput = document.getElementById("id");
const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");
const cargoInput = document.getElementById("cargo");
const emailInput = document.getElementById("email");
const telefonoInput = document.getElementById("telefono");
const tableBody = document.getElementById("personalTableBody");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const messageBox = document.getElementById("message");

function escapeHtmlAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function showMessage(text, isError = false) {
  messageBox.textContent = text;
  messageBox.classList.toggle("error", isError);
}

function clearMessage() {
  showMessage("");
}

function resetForm() {
  form.reset();
  idInput.value = "";
  submitBtn.textContent = "Guardar";
}

async function getAllPersonal() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error cargando registros");
  return response.json();
}

async function createPersonal(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Error creando registro");
  return payload;
}

async function updatePersonal(id, data) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Error actualizando registro");
  return payload;
}

async function deletePersonal(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Error eliminando registro");
  return payload;
}

function renderRows(rows) {
  tableBody.innerHTML = "";

  if (rows.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="empty">Sin registros</td></tr>`;
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const safeNombre = escapeHtmlAttribute(row.nombre);
    const safeApellido = escapeHtmlAttribute(row.apellido);
    const safeCargo = escapeHtmlAttribute(row.cargo);
    const safeEmail = escapeHtmlAttribute(row.email);
    const safeTelefono = escapeHtmlAttribute(row.telefono || "");

    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.nombre} ${row.apellido}</td>
      <td>${row.cargo}</td>
      <td>${row.email}</td>
      <td>${row.telefono || "-"}</td>
      <td>
        <button
          class="small"
          data-action="edit"
          data-id="${row.id}"
          data-nombre="${safeNombre}"
          data-apellido="${safeApellido}"
          data-cargo="${safeCargo}"
          data-email="${safeEmail}"
          data-telefono="${safeTelefono}"
        >
          Editar
        </button>
        <button class="small danger" data-action="delete" data-id="${row.id}">Eliminar</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

async function refreshTable() {
  try {
    const rows = await getAllPersonal();
    renderRows(rows);
  } catch (error) {
    showMessage(error.message, true);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const data = {
    nombre: nombreInput.value.trim(),
    apellido: apellidoInput.value.trim(),
    cargo: cargoInput.value.trim(),
    email: emailInput.value.trim(),
    telefono: telefonoInput.value.trim(),
  };

  try {
    if (idInput.value) {
      await updatePersonal(idInput.value, data);
      showMessage("Registro actualizado correctamente.");
    } else {
      await createPersonal(data);
      showMessage("Registro creado correctamente.");
    }

    resetForm();
    await refreshTable();
  } catch (error) {
    showMessage(error.message, true);
  }
});

cancelBtn.addEventListener("click", () => {
  resetForm();
  clearMessage();
});

tableBody.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.getAttribute("data-action");
  const id = target.getAttribute("data-id");

  if (!action || !id) return;

  if (action === "edit") {
    idInput.value = id;
    nombreInput.value = target.getAttribute("data-nombre") || "";
    apellidoInput.value = target.getAttribute("data-apellido") || "";
    cargoInput.value = target.getAttribute("data-cargo") || "";
    emailInput.value = target.getAttribute("data-email") || "";
    telefonoInput.value = target.getAttribute("data-telefono") || "";
    submitBtn.textContent = "Actualizar";
    showMessage(`Editando registro #${id}`);
  }

  if (action === "delete") {
    const confirmed = window.confirm("¿Deseas eliminar este registro?");
    if (!confirmed) return;

    try {
      await deletePersonal(id);
      showMessage("Registro eliminado correctamente.");
      if (idInput.value === id) resetForm();
      await refreshTable();
    } catch (error) {
      showMessage(error.message, true);
    }
  }
});

refreshTable();
