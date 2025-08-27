# SpaceMyPDF

A modern web application for manipulating PDF files directly in your browser.

## Features

- **PDF Upload**: Upload PDF files from your device
- **PDF Preview**: View your PDFs directly in the browser
- **PDF Manipulation**:
  - Rotate pages
  - Delete pages
  - Reorder pages
  - Add spacing between pages
- **Note Space Customization**:
  - Add note space to any side (left, right, top, bottom)
  - Customize width and color
  - Add helpful patterns (lines, grid, dots) for better note-taking
- **PDF Download**: Download your modified PDFs
- **PDF Merging**: Combine multiple PDFs into one document

## Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **PDF Processing**: PDF.js, pdf-lib
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/SpaceMyPDF.git
   cd SpaceMyPDF
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Add any required environment variables here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

This application is configured for easy deployment on Vercel. See the deployment documentation for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all the open-source libraries that made this project possible.
