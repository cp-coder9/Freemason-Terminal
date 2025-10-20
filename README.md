# Cipher Masons

An AI-powered narrative adventure game exploring the history and mysteries of the Freemasons through a retro-futuristic terminal interface.

[cloudflarebutton]

## About The Project

Cipher Masons is an AI-powered, narrative-driven interactive fiction game that delves into the history, symbolism, and modern-day context of the Freemasons. The user interacts with a retro-futuristic terminal interface, styled after early-internet aesthetics with CRT effects, pixel fonts, and glitch art.

The core gameplay loop involves the user typing commands and questions to an AI, which acts as a 'Digital Archivist' of a Masonic lodge. This AI generates endless narrative content, historical information, moral dilemmas, and branching story paths, ensuring a unique and perpetually evolving experience.

## Key Features

*   **Endless Narrative:** AI-generated story ensures a unique and perpetually evolving experience every time you play.
*   **Interactive Terminal:** An immersive, retro-futuristic terminal interface serves as the entire game world.
*   **Historical Exploration:** Delve into the rich history, symbolism, and philosophy of the Freemasons.
*   **Dynamic Storytelling:** The narrative adapts and branches based on your questions and choices.
*   **Serverless Architecture:** Built on the high-performance, scalable Cloudflare Workers platform.
*   **Stateful AI Agents:** Utilizes Cloudflare Durable Objects to maintain conversation state and memory.

## Technology Stack

*   **Frontend:** React, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Zustand
*   **Backend:** Cloudflare Workers, Hono
*   **AI & Agents:** Cloudflare Agents SDK, Cloudflare AI Gateway, OpenAI
*   **Language:** TypeScript

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Bun](https://bun.sh/) package manager
*   A [Cloudflare account](https://dash.cloudflare.com/sign-up)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/cipher_masons.git
    cd cipher_masons
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Configure Environment Variables:**

    Create a `.dev.vars` file in the root of the project for local development. You will need to set up a Cloudflare AI Gateway to get the required credentials.

    ```ini
    # .dev.vars
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="your-cloudflare-api-key"
    ```

    Replace the placeholder values with your actual Cloudflare Account ID, Gateway ID, and an API key.

## Development

To start the local development server, which includes the Vite frontend and the Wrangler dev server for the worker, run:

```sh
bun dev
```

This will start the application on `http://localhost:3000` (or another available port). The frontend will automatically reload on file changes.

## Deployment

Deploying this application to Cloudflare is a straightforward process.

1.  **Login to Wrangler:**
    If you haven't already, authenticate Wrangler with your Cloudflare account.
    ```sh
    bunx wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script, which will build the application and deploy it to your Cloudflare account.
    ```sh
    bun deploy
    ```
    Wrangler will handle the process of uploading your assets and worker script.

Alternatively, you can deploy directly from your GitHub repository using the button below.

[cloudflarebutton]

## Project Structure

*   `src/`: Contains all the frontend React application code, including pages, components, and hooks.
*   `worker/`: Contains the backend Cloudflare Worker code, including the Hono router, the Chat Agent (Durable Object), and AI integration logic.
*   `wrangler.jsonc`: The configuration file for the Cloudflare Worker.
*   `vite.config.ts`: The configuration file for the Vite frontend build tool.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.