# Subs - Simplistic Open Source Subscription Cost Tracker

Subs is a lightweight application designed to help you track and manage your subscription costs across different services. With a clean and intuitive interface, it simplifies the process of monitoring your recurring expenses.

## Features

- **Track Subscriptions**: Add, edit, and delete subscription details including name, price, and currency
- **Automatic Favicon Fetching**: Visual identification of your subscriptions with icons from their domains
- **Multi-Currency Support**: Track subscriptions in different currencies with automatic conversion rates
- **Total Cost Calculation**: See your total monthly expenses at a glance
- **Import/Export**: Easily back up your subscription data or move it between devices
- **Client-Side Storage**: Option to store data in your browser for privacy or use SQLite for persistence
- **Responsive Design**: Works seamlessly on both desktop and mobile devices

## Demo

You can try out Subs without installing anything at [subs.ajnart.fr](https://subs.ajnart.fr)

![Demo GIF](https://github.com/user-attachments/assets/ffb88333-6c4d-46c9-9ca7-49602106e5f1)

## Tech Stack

Subs is built with modern web technologies:

- **Framework**: Remix (React)
- **Styling**: Tailwind CSS with Shadcn UI components
- **State Management**: Zustand
- **Package Manager**: Bun

## 🚀 Installation

### 🌐 Use the Online Version

Visit [subs.ajnart.fr](https://subs.ajnart.fr) to use the tool immediately without installation.

### 🐳 Run with Docker

Run with a single command:

```bash
docker run -p 7574:7574 -v ./data:/app/data --name subs --rm ghcr.io/ajnart/subs
```

Then visit `http://localhost:7574` in your browser.

### 📦 Using Docker Compose

Create a `docker-compose.yaml` file:

```yaml
services:
  subs:
    image: ghcr.io/ajnart/subs
    container_name: subs
    ports:
      - "7574:7574"
    restart: unless-stopped
    # volumes: Optional: Uncomment to use a volume to save data outside of the default docker volume
      # - ./data:/app/data
    # environment:
      # - USE_LOCAL_STORAGE=true  # Uncomment to use browser storage instead of file storage (different config for each browser)
```

Then run:

```bash
docker-compose up -d
```

> [!NOTE]
> Data is stored in the `/app/data` directory inside the container. Mount this directory as a volume to persist your data between container restarts.

### 🛠️ Build from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/ajnart/subs.git
   cd subs
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   - Optional: Set `USE_LOCAL_STORAGE=true` to use browser localStorage instead of using the internal API to handle the data (in ./data/config.json)

4. If using SQLite, push the database schema:
   ```bash
   bun run db:push
   ```

5. Start the development server:
   ```bash
   bun run dev
   ```

6. Open [http://localhost:7574](http://localhost:7574) in your browser

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve Subs.

## License

This project is open-source and available under the MIT License.

---

Thank you for your interest in Subs! We hope it helps you keep better track of your subscription costs.
