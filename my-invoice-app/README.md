# My Invoice App

My Invoice App is a web application that displays invoice data in a structured table format. The application fetches data from an external API and presents it in a user-friendly manner.

## Project Structure

```
my-invoice-app
├── src
│   ├── controllers
│   │   └── invoiceController.js    # Controller for handling invoice data
│   ├── routes
│   │   └── invoiceRoutes.js         # Routes for the invoice application
│   ├── views
│   │   └── invoice-table.ejs        # EJS view for displaying invoice data
│   └── app.js                       # Entry point of the application
├── package.json                      # NPM configuration file
└── README.md                        # Documentation for the project
```

## Features

- Fetches invoice data from an external API.
- Displays the data in a table format with the following columns:
  - No
  - Tanggal
  - Nama
  - Invoice Number
  - Jumlah

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd my-invoice-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run the following command:
```
npm start
```
The application will be available at `http://localhost:3000`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.