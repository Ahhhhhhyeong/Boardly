## ✅ Setup Complete

The Docker Compose configuration has been finalized so that the frontend and backend can run together seamlessly.

### Files Updated

* `docker-compose.yml`
* `./backend/Dockerfile`
* `./frontend/Dockerfile`

### Configuration Details

* Backend runs on port `3000`
* Frontend runs on port `5173`
* Added `depends_on` so both services start together
* Configured bind mounts for local source files in development
* Configured the Vite dev server to run on `0.0.0.0`
* Added `CHOKIDAR_USEPOLLING` for more reliable file change detection on Windows environments

---

## 🔍 Verification Results

The following commands were used to verify the setup and execution.

1. `docker compose config`

   * Confirmed that the Compose file syntax and service configuration are valid.

2. `docker compose up --build -d`

   * Successfully completed the build and startup process.
   * The following output was confirmed:

     * ✔ Image `boardly-frontend` Built
     * ✔ Image `boardly-backend` Built
     * ✔ Container `boardly-backend` Started
     * ✔ Container `boardly-frontend` Started

3. `docker compose ps`

   * Verified that both containers are running and ports are correctly mapped.
   * `boardly-backend`: `0.0.0.0:3000->3000/tcp`
   * `boardly-frontend`: `0.0.0.0:5173->5173/tcp`

---

## ▶️ How to Run

Run the following command to start the services:

```bash
docker compose up --build -d
```

You can then access the applications in your browser:

* Backend: `http://localhost:3000`
* Frontend: `http://localhost:5173`

---

## 🛑 How to Stop

Use the following command to stop and remove all containers:

```bash
docker compose down
```

---

## 💡 Notes

The current configuration is intended for development purposes.
Bind mounts are enabled so that local file changes are immediately reflected inside the containers.
