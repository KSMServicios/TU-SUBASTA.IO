document.addEventListener("DOMContentLoaded", () => {
  // --- Seguridad Básica ---
  // Si el usuario no está logueado como admin, lo redirige al login.
  if (sessionStorage.getItem("isAdmin") !== "true") {
    window.location.href = "login.html";
    return;
  }

  const form = document.getElementById("add-item-form");
  const itemsList = document.getElementById("current-items-list");
  const logoutBtn = document.getElementById("logout-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  const submitBtn = form.querySelector('button[type="submit"]');

  let editingItemId = null; // Variable para saber si estamos editando

  // Cargar los items existentes al iniciar
  loadItems();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const itemName = document.getElementById("item-name").value;
    const startPrice = parseFloat(document.getElementById("start-price").value);
    const minBid = parseFloat(document.getElementById("min-bid").value);
    const imageUrl = document.getElementById("item-image").value;
    const durationHours = parseInt(document.getElementById("duration").value);

    // Calcular la fecha de finalización
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + durationHours);

    if (editingItemId) {
      // --- Lógica para ACTUALIZAR un item existente ---
      let items = getItems();
      const itemIndex = items.findIndex((item) => item.id === editingItemId);
      if (itemIndex > -1) {
        items[itemIndex].name = itemName;
        items[itemIndex].price = startPrice;
        items[itemIndex].minBid = minBid;
        items[itemIndex].image = imageUrl;
        // No actualizamos la duración/endTime al editar por simplicidad, pero podría añadirse.
      }
      localStorage.setItem("auctionItems", JSON.stringify(items));
    } else {
      // --- Lógica para CREAR un nuevo item (la que ya existía) ---
      const newItem = {
        id: Date.now(), // ID único basado en la fecha actual
        name: itemName,
        price: startPrice,
        minBid: minBid,
        image: imageUrl,
        endTime: endTime.toISOString(), // Guardar en formato estándar
      };
      saveItem(newItem);
    }

    resetFormState();
    loadItems(); // Recargar la lista
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("isAdmin");
    window.location.href = "INDEX.HTML";
  });

  cancelEditBtn.addEventListener("click", () => {
    resetFormState();
  });

  function getItems() {
    return JSON.parse(localStorage.getItem("auctionItems")) || [];
  }

  function saveItem(item) {
    const items = getItems();
    items.push(item);
    localStorage.setItem("auctionItems", JSON.stringify(items));
  }

  function loadItems() {
    const items = getItems();
    itemsList.innerHTML = ""; // Limpiar la lista antes de recargar

    if (items.length === 0) {
      itemsList.innerHTML = "<p>No hay subastas activas.</p>";
      return;
    }

    items.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "auction-card-admin"; // Usaremos un estilo simple
      itemElement.innerHTML = `
                <img src="${item.image}" alt="${
        item.name
      }" class="admin-thumbnail">
                <div class="admin-item-details">
                  <p>${item.name}</p>
                  <small>Precio: $${item.price.toFixed(2)} - Puja Mín: $${(
        item.minBid || 0
      ).toFixed(2)}</small>
                </div>
                <button class="btn-edit" data-id="${item.id}">Editar</button>
                <button class="btn-delete" data-id="${
                  item.id
                }">Eliminar</button>
            `;
      itemsList.appendChild(itemElement);
    });

    // Añadir event listeners a los nuevos botones de eliminar
    document.querySelectorAll(".btn-delete").forEach((button) => {
      button.addEventListener("click", (e) => {
        const itemId = parseInt(e.target.dataset.id);
        deleteItem(itemId);
      });
    });

    // Añadir event listeners a los nuevos botones de editar
    document.querySelectorAll(".btn-edit").forEach((button) => {
      button.addEventListener("click", (e) => {
        const itemId = parseInt(e.target.dataset.id);
        startEditing(itemId);
      });
    });
  }

  function deleteItem(id) {
    let items = getItems();
    items = items.filter((item) => item.id !== id);
    localStorage.setItem("auctionItems", JSON.stringify(items));
    loadItems(); // Recargar la lista
  }

  function startEditing(id) {
    const items = getItems();
    const itemToEdit = items.find((item) => item.id === id);
    if (!itemToEdit) return;

    // Llenar el formulario con los datos del item
    document.getElementById("item-name").value = itemToEdit.name;
    document.getElementById("start-price").value = itemToEdit.price;
    document.getElementById("min-bid").value = itemToEdit.minBid;
    document.getElementById("item-image").value = itemToEdit.image;
    // Deshabilitamos la duración al editar para no extender la subasta accidentalmente
    document.getElementById("duration").disabled = true;

    editingItemId = id;
    submitBtn.textContent = "Guardar Cambios";
    cancelEditBtn.style.display = "block";
  }

  function resetFormState() {
    form.reset();
    editingItemId = null;
    submitBtn.textContent = "Iniciar Subasta";
    cancelEditBtn.style.display = "none";
    document.getElementById("duration").disabled = false;
  }
});
