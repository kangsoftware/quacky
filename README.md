# Quacky
Simple and open social media

## Selfhost

We use docker to package Quacky. You can build and run the application by following the steps below:

```bash
# 1. Clone repo
git clone https://github.com/kangsoftware/quacky
cd quacky

# 2. Configure your platform settings
cp example.docker-compose.yml docker-compose.yml

# 3. Start services
docker compose up -d

# 4. Migrate database tables
npx prisma migrate dev

# 5.
# Go to http://localhost:3001 and create an account to start!
```

## Contributing & Docs

Find the Quacky documentation at [docs.kang.software/quacky](https://docs.kang.software/quacky)

## License

CC BY-NC 4.0
