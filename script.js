// Espera a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Obtén referencias a los elementos del DOM
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const currentWeatherDiv = document.getElementById('currentWeather');
  const searchHistoryTable = document.getElementById('searchHistory');
  const apiKey = '1190749bda451528947de5f0b6f68e93'; // Tu clave de API

  // Agrega un controlador de eventos al botón de búsqueda
  searchBtn.addEventListener('click', searchWeather);

  // Agrega un controlador de eventos al presionar la tecla "Enter" en el campo de entrada
  cityInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      searchWeather();
    }
  });

  // Función para realizar la búsqueda del clima
  function searchWeather() {
    const cityName = cityInput.value;
    if (cityName) {
      // Realiza la solicitud a la API del clima
      axios
        .get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        .then(function(response) {
          const weatherData = response.data;
          const temperatureKelvin = weatherData.main.temp;
          const temperatureCelsius = temperatureKelvin - 273.15;

          // Guarda la búsqueda en el almacenamiento local
          saveSearch(cityName);

          // Muestra los datos del clima actual en el DOM
          currentWeatherDiv.innerHTML = `La temperatura actual en ${cityName} es: ${temperatureCelsius.toFixed(
             1
          )} °C.`;

          // Actualiza la visualización de las búsquedas anteriores en pantalla
          updateSearchHistory();
        })
        .catch(function(error) {
          console.log(error);
          currentWeatherDiv.innerHTML = 'Error al obtener el clima';
        });
    }
  }

  // Función para guardar la búsqueda en el almacenamiento local
  function saveSearch(city) {
    let searches = localStorage.getItem('searches');

    if (searches) {
      // Si ya hay búsquedas anteriores, convierte la cadena JSON en un array
      searches = JSON.parse(searches);
    } else {
      // Si no hay búsquedas anteriores, crea un nuevo array vacío
      searches = [];
    }

    // Verifica si la búsqueda ya existe en el array
    if (searches.includes(city)) {
      // Si la búsqueda ya existe, no la agrega nuevamente
      return;
    }

    // Agrega la nueva búsqueda al array
    searches.push(city);

    // Limita el número de búsquedas guardadas a un máximo de 5
    if (searches.length > 5) {
      searches.shift(); // Elimina la primera búsqueda más antigua
    }

    // Guarda el array actualizado en el almacenamiento local
    localStorage.setItem('searches', JSON.stringify(searches));
  }

  // Función para actualizar la visualización de las búsquedas anteriores en pantalla
  function updateSearchHistory() {
    const searches = getSearchesFromLocalStorage();
    displaySearches(searches);
  }

  // Función para obtener las búsquedas anteriores del almacenamiento local
  function getSearchesFromLocalStorage() {
    const savedSearches = localStorage.getItem('searches');
    if (savedSearches) {
      return JSON.parse(savedSearches);
    }
    return [];
  }

  // Función para mostrar las búsquedas anteriores en la tabla
  function displaySearches(searches) {
    // Limpiar la tabla antes de agregar nuevas filas
    searchHistoryTable.innerHTML = '';

    // Agregar una fila por cada búsqueda
    for (const search of searches) {
      const row = searchHistoryTable.insertRow(-1);
      const cityCell = row.insertCell(0);
      const temperatureCell = row.insertCell(1);

      cityCell.textContent = search;
      temperatureCell.textContent = 'Cargando...';

      getTemperature(search)
        .then(temperature => {
          temperatureCell.textContent = temperature;
        })
        .catch(error => {
          console.log(error);
          temperatureCell.textContent = 'Error al obtener el clima';
        });
    }
  }

  // Función para obtener la temperatura de una ciudad mediante la API
  function getTemperature(city) {
    return new Promise((resolve, reject) => {
      axios
        .get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
        .then(response => {
          const weatherData = response.data;
          const temperatureKelvin = weatherData.main.temp;
          const temperatureCelsius = temperatureKelvin - 273.15;
          resolve(`${temperatureCelsius.toFixed(1)} °C`);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  // Carga las búsquedas anteriores al cargar la página
  updateSearchHistory();
});
