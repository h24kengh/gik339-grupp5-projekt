const url ='http://localhost:3000/cars';

window.addEventListener('load', fetchData);

const carForm = document.getElementById('carForm');

function fetchData() {
  fetch(url)
    .then((result) => result.json())
    .then((cars) => {
      if (cars.length > 0) {
        let html = `<ul class="w-3/4 my-3 mx-auto flex flex-wrap gap-2 justify-center">`;
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

        const listContainer = document.getElementById('listContainer');
        listContainer.innerHTML = '';
        listContainer.insertAdjacentHTML('beforeend', html);
      } else {
        const listContainer = document.getElementById('listContainer');
        listContainer.innerHTML = `<p class="text-center mt-6 opacity-80">Inga bilar sparade ännu.</p>`;
      }
    });
}

function setCurrentCar(id) {
  console.log('current', id);

  fetch(`${url}/${id}`)
    .then((result) => result.json())
    .then((car) => {
      console.log(car);
      carForm.brand.value = car.brand;
      carForm.model.value = car.model;
      carForm.year.value = car.year;
      carForm.color.value = car.color;

      localStorage.setItem('currentId', car.id);
    });
}

function deleteCar(id) {
  console.log('delete', id);
  fetch(`${url}/${id}`, { method: 'DELETE' }).then(() => fetchData());
}

carForm.addEventListener('submit', handleSubmit);

function handleSubmit(e) {
  e.preventDefault();

  const serverCarObject = {
    brand: '',
    model: '',
    year: '',
    color: ''
  };

  serverCarObject.brand = carForm.brand.value;
  serverCarObject.model = carForm.model.value;
  serverCarObject.year = Number(carForm.year.value);
  serverCarObject.color = carForm.color.value;

  const id = localStorage.getItem('currentId');
  if (id) {
    serverCarObject.id = id;
  }

  const request = new Request(url, {
    method: serverCarObject.id ? 'PUT' : 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(serverCarObject)
  });

  fetch(request).then(() => {
    fetchData();
    localStorage.removeItem('currentId');
    carForm.reset();
  });
}
