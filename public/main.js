// const locationInput = document.getElementById('locationBox');
//         const suggestionsBox = document.getElementById('suggestions');

//         locationInput.addEventListener('input', async () => {
//             const query = locationInput.value.trim();
//             if (query.length < 3) {
//                 suggestionsBox.innerHTML = '';
//                 return;
//             }

//             try {
//                 const response = await fetch(`/api/location?q=${encodeURIComponent(query)}`);
//                 const suggestions = await response.json();

//                 // Clear previous suggestions
//                 suggestionsBox.innerHTML = '';

//                 suggestions.forEach(suggestion => {
//                     const div = document.createElement('div');
//                     div.textContent = suggestion.name;
//                     div.addEventListener('click', () => {
//                         locationInput.value = suggestion.name;
//                         suggestionsBox.innerHTML = '';
//                     });
//                     suggestionsBox.appendChild(div);
//                 });
//             } catch (error) {
//                 console.error('Error fetching suggestions:', error);
//             }
//         });

//         // Close suggestions if clicked outside
//         document.addEventListener('click', (e) => {
//             if (!suggestionsBox.contains(e.target) && e.target !== locationInput) {
//                 suggestionsBox.innerHTML = '';
//             }
//         });