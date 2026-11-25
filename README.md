# FarmDay Rwanda 🌱
A weather-based activity planner for Rwandan farmers and rural communities. Choose a district and an activity (planting, drying harvest, spraying, travel) and get a 7-day forecast turned into clear advice: Best / OK / Avoid.

- **Demo video:** <paste YouTube link later>
- **Live (load balancer):** http://3.9.180.234
- **Web01:** http://18.171.52.4 | **Web02:** http://18.171.148.55 
- **Author:** Nziza Lael David

## Credentials
**No API key and no login are required.** Open-Meteo is a free public API, so there are no secrets in this repo.

## Features
- Search a district (all 30 Rwandan districts)
- Activity-specific advice rules
- Sort by date or best-first; filter to best days only
- Error handling for API failure, invalid input and empty results
- 30-minute caching of API responses

## API used
[Open-Meteo Forecast API](https://open-meteo.com/en/docs): daily rain, rain probability, temperature, wind. Credit to the Open-Meteo developers.

## Run locally
    git clone https://github.com/davidlael/Farmday.git && cd Farmday
    python3 -m http.server 8000     # open http://localhost:8000

## Deployment
**Web01 and Web02:** Nginx serves `/var/www/app`.

    sudo apt update && sudo apt install -y nginx git
    sudo git clone https://github.com/davidlael/Farmday.git /var/www/app
    # Nginx site config: root /var/www/app; add_header X-Served-By $hostname;
    sudo nginx -t && sudo systemctl restart nginx

**Lb01:** HAProxy with round-robin and health checks.

    sudo apt install -y haproxy
    # frontend :80 -> backend web_servers (web01, web02), "balance roundrobin", "check"
    sudo haproxy -c -f /etc/haproxy/haproxy.cfg && sudo systemctl restart haproxy

**Testing:** `for i in {1..6}; do curl -sI http://3.9.180.234 | grep -i x-served-by; done` shows the two hostnames alternating. The page footer also shows which server answered.

## Challenges
- HTML IDS didn't match script.js
- Date typo that broke sorting
- Finding the project path inside OneDrive From WSL

## Credits
Open-Meteo API, Nginx, HAProxy. 
I understand the code and can explain it.
