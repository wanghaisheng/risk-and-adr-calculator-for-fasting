// Get Quiz from global scope
const Quiz = window.Quiz;

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Quiz />);

/*
SETUP INSTRUCTIONS:
1. Download all files and keep the directory structure intact
2. Make sure you have a local web server (like Live Server VSCode extension)
3. Open the project folder in your code editor
4. Start your local web server pointing to the project directory
5. Open the index.html file through your local server
6. No build step is required as this uses React via CDN with Babel transpilation

For production:
1. Consider using Create React App or Vite for a proper build setup
2. Install Node.js and npm from https://nodejs.org/
3. Run: npm create vite@latest my-health-tracker -- --template react
4. Copy the components and logic into the new project
5. Install dependencies: npm install
6. Start development server: npm run dev
7. Build for production: npm run build
*/
