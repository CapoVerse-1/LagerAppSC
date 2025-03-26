export default function NotFound() {
  return (
    <html>
      <head>
        <title>404 - Page Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f3f4f6;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 28rem;
            width: 90%;
          }
          h1 {
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 1rem;
          }
          p {
            color: #4b5563;
            margin-bottom: 1.5rem;
          }
          a {
            display: inline-block;
            padding: 0.5rem 1rem;
            background-color: #2563eb;
            color: white;
            border-radius: 0.25rem;
            text-decoration: none;
            transition: background-color 0.2s;
          }
          a:hover {
            background-color: #1d4ed8;
          }
        `}} />
      </head>
      <body>
        <div className="container">
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for doesn't exist or has been moved.</p>
          <a href="/inventory">Return to Inventory</a>
        </div>
      </body>
    </html>
  );
} 