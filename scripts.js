document.addEventListener("DOMContentLoaded", () => {
  const auctionGrid = document.querySelector(".auction-grid");
  let currentCard = null; // Mover la declaración aquí para que sea accesible globalmente
  function loadAuctionItems() {
    const items = JSON.parse(localStorage.getItem("auctionItems")) || [];
    auctionGrid.innerHTML = ""; // Limpiar la grilla

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "auction-card";
      card.dataset.endTime = item.endTime;
      // Guardamos el ID y el monto mínimo de puja en el dataset de la tarjeta
      card.dataset.itemId = item.id;
      card.dataset.minBid = item.minBid || 1;

      card.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="card-content">
            <h3>${item.name}</h3>
            <p class="current-price">Puja actual: <strong>$${item.price.toFixed(
              2
            )}</strong></p>
            <p class="min-bid-info">Puja mínima: $${(item.minBid || 1).toFixed(
              2
            )}</p>
            <div class="countdown">
                <p>Termina en:</p>
                <div class="timer">
                    <span class="days"></span> D : 
                    <span class="hours"></span> H : 
                    <span class="minutes"></span> M : 
                    <span class="seconds"></span> S
                </div>
            </div>
            <button class="btn btn-primary btn-block">Pujar Ahora</button>
        </div>
      `;

      auctionGrid.appendChild(card);
    });

    // Una vez cargados los items, inicializamos los contadores y modales
    initializeScripts();
  }

  function initializeScripts() {
    const auctionCards = document.querySelectorAll(".auction-card");

    auctionCards.forEach((card) => {
      const endTime = new Date(card.dataset.endTime).getTime();

      const timer = card.querySelector(".timer");
      const daysSpan = timer.querySelector(".days");
      const hoursSpan = timer.querySelector(".hours");
      const minutesSpan = timer.querySelector(".minutes");
      const secondsSpan = timer.querySelector(".seconds");

      const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
          // Al llegar a cero, oculta la tarjeta
          card.style.transition = "opacity 0.5s ease";
          card.style.opacity = "0";
          setTimeout(() => {
            card.style.display = "none";
          }, 500);
          clearInterval(interval);
          timer.innerHTML = "Subasta Finalizada";
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysSpan.textContent = String(days).padStart(2, "0");
        hoursSpan.textContent = String(hours).padStart(2, "0");
        minutesSpan.textContent = String(minutes).padStart(2, "0");
        secondsSpan.textContent = String(seconds).padStart(2, "0");
      };

      const interval = setInterval(updateCountdown, 1000);
      updateCountdown(); // Llama una vez al inicio para no esperar 1 segundo
    });

    // --- Lógica del Modal de Pujas ---
    const bidModal = document.getElementById("bid-modal");
    const closeModalBtn = document.querySelector(".close-modal");
    const bidButtons = document.querySelectorAll(".auction-card .btn-primary");
    const modalItemTitle = document.getElementById("modal-item-title");
    const modalCurrentPrice = document.getElementById("modal-current-price");
    const bidForm = document.getElementById("bid-form");
    const bidAmountInput = document.getElementById("bid-amount");
    // let currentCard = null; // Esta línea se mueve arriba

    const openModal = (card) => {
      // Extraer datos de la tarjeta de subasta
      const itemTitle = card.querySelector("h3").textContent;
      const currentPriceText = card.querySelector(
        ".current-price strong"
      ).textContent;
      const currentPriceValue = parseFloat(
        currentPriceText.replace(/[^0-9.-]+/g, "")
      );
      const minBidAmount = parseFloat(card.dataset.minBid);

      // Rellenar el modal con los datos
      modalItemTitle.textContent = `Pujar por ${itemTitle}`;
      modalCurrentPrice.textContent = currentPriceText;
      bidAmountInput.min = currentPriceValue + minBidAmount;
      bidAmountInput.placeholder = `> ${currentPriceText}`;
      bidAmountInput.step = minBidAmount;

      bidModal.classList.add("active");
    };

    const closeModal = () => {
      bidModal.classList.remove("active");
      bidForm.reset(); // Limpia el formulario al cerrar
    };

    bidButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest(".auction-card");
        openModal(card);
      });
    });

    closeModalBtn.addEventListener("click", closeModal);
    bidModal.addEventListener("click", (e) => {
      // Cierra el modal si se hace clic fuera del contenido
      if (e.target === bidModal) closeModal();
    });

    bidForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const bidValue = bidAmountInput.value;
      const itemId = parseInt(currentCard.dataset.itemId);

      // Lógica para actualizar el precio en localStorage
      let items = JSON.parse(localStorage.getItem("auctionItems")) || [];
      const itemIndex = items.findIndex((item) => item.id === itemId);

      if (itemIndex > -1) {
        items[itemIndex].price = parseFloat(bidValue);
        localStorage.setItem("auctionItems", JSON.stringify(items));

        // Actualizar la vista inmediatamente
        const priceElement = currentCard.querySelector(".current-price strong");
        priceElement.textContent = `$${parseFloat(bidValue).toFixed(2)}`;

        alert(`Has pujado $${bidValue}. ¡Gracias!`);
      } else {
        alert(
          "Error: No se pudo encontrar el artículo para actualizar la puja."
        );
      }

      closeModal();
    });
  }

  loadAuctionItems();
});
