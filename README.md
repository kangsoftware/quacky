# Quacky
Simple and open social media for teens.

![App mascot](https://quackycdn.linus.my/pub/Screenshot_2026-03-14_103723-removebg-preview.png)

It's basically another social media site built from the ground up.

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

# 4. Migrate database
node scripts/patch_db.js
```

Access Quacky at [localhost:3001](http://localhost:3001) and create an account.

## License

Quacky is licensed under the [CC BY-NC 4.0](LICENSE).
