/* URL till backend-API:t som hanterar bilar */
const url = "http://localhost:3000/cars";

/* När fönstret har laddats färdigt hämtas data från servern */
window.addEventListener("load", fetchData);

/* Hämtar formuläret från DOM:en */
const carForm = document.getElementById("carForm");

/* Visar ett meddelande (success eller error) högst upp på sidan */
function showMessage(text, type = "success") {
  /* Hämtar meddelanderutan */
  const box = document.getElementById("messageBox");

  /* Sätter CSS-klasser dynamiskt beroende på typ av meddelande */
  box.className = `
    w-3/4 mx-auto mt-4 p-3 rounded-md text-center
    ${
      type === "success"
        ? "bg-green-200 text-green-900"
        : "bg-red-200 text-red-900"
    }
  `;

  /* Sätter texten i meddelanderutan */
  box.textContent = text;
  /* Gör rutan synlig */
  box.classList.remove("hidden");

  /* Gömmer meddelandet automatiskt efter 3 sekunder */
  setTimeout(() => {
    box.classList.add("hidden");
  }, 3000);
}

/* Visar en bekräftelseruta med Ja/Nej-alternativ */
function showConfirm(text, onYes) {
  /* Hämtar bekräftelserutan */
  const box = document.getElementById("confirmBox");

  /* Sätter layout och stil på bekräftelserutan */
  box.className =
    "w-3/4 mx-auto mt-3 p-3 rounded-md bg-slate-200 text-slate-900 flex items-center justify-between";

  /* Skapar HTML-innehållet med text och knappar */
  box.innerHTML = `
    <span>${text}</span>
    <div class="flex gap-2">
      <button id="confirmYes" class="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700">Ja</button>
      <button id="confirmNo" class="px-3 py-1 rounded-md bg-slate-400 text-slate-900 hover:bg-slate-500">Nej</button>
    </div>
  `;

  /* Gör bekräftelserutan synlig */
  box.classList.remove("hidden");

  /* Händelse för Ja-knappen */
  document.getElementById("confirmYes").onclick = () => {
    hideConfirm(); // Döljer bekräftelserutan
    onYes(); // Kör callback-funktionen
  };

  /* Händelse för Nej-knappen */
  document.getElementById("confirmNo").onclick = () => {
    hideConfirm(); // Döljer bekräftelserutan
    showMessage("Borttagning avbröts.", "error"); // Visar info-meddelande
  };
}

/* Döljer och återställer bekräftelserutan */
function hideConfirm() {
  const box = document.getElementById("confirmBox");
  box.classList.add("hidden");
  box.innerHTML = "";
}

/* Hämtar alla bilar från servern och renderar dem på sidan */
function fetchData() {
  fetch(url)
    .then((result) => result.json())
    .then((cars) => {
      /* Om det finns bilar i databasen */
      if (cars.length > 0) {
        let html = `<ul class="w-3/4 my-3 mx-auto flex flex-wrap gap-2 justify-center">`;

        /* Loopar igenom alla bilar och skapar HTML */
        cars.forEach((car) => {
          html += `
        <li
          class="bg-${car.color}-200 basis-1/4 text-${car.color}-900 p-2 rounded-md border-2 border-${car.color}-400 flex flex-col justify-between">
          <h3>${car.brand} ${car.model}</h3>
          <p>År: ${car.year}</p>
          <div>
            <button
              class="border border-${car.color}-300 hover:bg-white/100 rounded-md bg-white/50 p-1 text-sm mt-2" onclick="setCurrentCar(${car.id})">
              Ändra
            </button>
            <button class="border border-${car.color}-300 hover:bg-white/100 rounded-md bg-white/50 p-1 text-sm mt-2" onclick="deleteCar(${car.id})">
              Ta bort
            </button>
          </div>
        </li>`;
        });

        html += `</ul>`;

        /* Renderar listan i DOM:en */
        const listContainer = document.getElementById("listContainer");
        listContainer.innerHTML = "";
        listContainer.insertAdjacentHTML("beforeend", html);
      } else {
        /* Om inga bilar finns i databasen */
        const listContainer = document.getElementById("listContainer");
        listContainer.innerHTML = `<p class="text-center mt-6 opacity-80">Inga bilar sparade ännu.</p>`;
      }
    })
    .catch(() => {
      /* Felmeddelande om servern inte svarar */
      showMessage(
        "Kunde inte hämta bilar. Kontrollera att servern kör.",
        "error"
      );
    });
}

/* Hämtar en specifik bil och fyller formuläret för redigering */
function setCurrentCar(id) {
  fetch(`${url}/${id}`)
    .then((result) => result.json())
    .then((car) => {
      /* Fyller formulärfält med bilens data */
      carForm.brand.value = car.brand;
      carForm.model.value = car.model;
      carForm.year.value = car.year;
      carForm.color.value = car.color;

      /* Sparar bilens ID i localStorage */
      localStorage.setItem("currentId", car.id);
    })
    .catch(() => {
      showMessage("Kunde inte hämta bilen.", "error");
    });
}

/* Tar bort en bil efter bekräftelse */
function deleteCar(id) {
  showConfirm("Är du säker på att du vill ta bort bilen?", () => {
    fetch(`${url}/${id}`, { method: "DELETE" })
      .then(() => {
        showMessage("Bilen har tagits bort.");
        fetchData(); // Uppdaterar listan
      })
      .catch(() => {
        showMessage("Kunde inte ta bort bilen.", "error");
      });
  });
}

/* Lyssnar på submit-event från formuläret */
carForm.addEventListener("submit", handleSubmit);

/* Hanterar skapande och uppdatering av bil */
function handleSubmit(e) {
  e.preventDefault(); // Förhindrar sidladdning

  /* Objekt som ska skickas till servern */
  const serverCarObject = {
    brand: "",
    model: "",
    year: "",
    color: "",
  };

  /* Hämtar värden från formuläret */
  serverCarObject.brand = carForm.brand.value;
  serverCarObject.model = carForm.model.value;
  serverCarObject.year = Number(carForm.year.value);
  serverCarObject.color = carForm.color.value;

  /* Kontrollerar om en bil redan är vald för uppdatering */
  const id = localStorage.getItem("currentId");
  if (id) {
    serverCarObject.id = id;
  }

  /* Skapar ett Request-objekt för POST eller PUT */
  const request = new Request(url, {
    method: serverCarObject.id ? "PUT" : "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(serverCarObject),
  });

  /* Skickar datan till servern */
  fetch(request)
    .then(() => {
      /* Visar rätt meddelande beroende på operation */
      if (serverCarObject.id) {
        showMessage("Bilen har uppdaterats.");
      } else {
        showMessage("Ny bil har lagts till.");
      }

      fetchData(); // Uppdaterar listan
      localStorage.removeItem("currentId"); // Rensar valt ID
      carForm.reset(); // Tömmer formuläret
    })
    .catch(() => {
      showMessage("Kunde inte spara bilen.", "error");
    });
}
