# Dynamic JavaScript DOM Logic & RESTful API Client

## About
This student project demonstrates asynchronous JavaScript and DOM updates using a public REST API. FetchStore is a simple product browser where users can search, filter, sort, and save products.

## Features
- Uses `async`/`await` and `fetch()` to request products from Fake Store API.
- Separates API requests (`js/api.js`) from UI and DOM logic (`js/app.js).
- Searches product titles, descriptions, and categories without page reloads.
- Generates category tabs from API data.
- Sorts by price, rating, or name.
- Saves selected items with `localStorage`.
- Includes loading skeletons, empty states, and friendly error messages.
- Responsive styling, keyboard focus indicators, and reduced-motion support.

## Structure
```text
Dynamic_JavaScript_DOM_REST_API_Client/
├── index.html
├── README.md
├── css/styles.css
└── js/
    ├── api.js
    └── app.js
```

## Run the project
1. Open the folder in VS Code.
2. Use Live Server to run `index.html` (or another local static web server).
3. Keep an internet connection available because products are fetched from the API.

API endpoint: `https://fakestoreapi.com/products`

## Testing checklist
- [ ] Products load successfully.
- [ ] Search matches product titles, descriptions, and categories.
- [ ] Category tabs filter the results.
- [ ] Sorting options reorder the results.
- [ ] Saved items remain after a browser refresh.
- [ ] An error message appears if the API cannot be reached.
- [ ] The layout works on mobile and desktop widths.

## Technologies
HTML5, CSS3, JavaScript ES6+, Fetch API, REST API, DOM manipulation, and localStorage.

Note: the API is a third-party public service, so availability and data may change. This project is for learning and demonstration purposes.
