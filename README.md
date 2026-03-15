![Screenshot of app](https://quackycdn.linus.my/pub/Screenshot%202026-03-15%20173203.png)

# Quacky
Simple and open social media

![App mascot](https://quackycdn.linus.my/pub/Screenshot_2026-03-14_103723-removebg-preview.png)

It's basically another social media site built from the ground up. **Currently v1 so expect some bugs! I'm still working on fixing them.**

## Features

- User posting, liking, reposts, sharing, attachments
- Notifications
- User profiles
- Settings
- Search
- Report abuse
- Discord webhook logging

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
