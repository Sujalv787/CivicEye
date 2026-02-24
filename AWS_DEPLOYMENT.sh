# =============== AWS EC2 DOCKER DEPLOYMENT GUIDE ===============
# Run these commands directly inside your Ubuntu EC2 terminal

# 1. First, make sure Docker is installed on your EC2 instance:
sudo apt update
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# 2. Add your ubuntu user to the docker group (so you don't need sudo every time)
sudo usermod -aG docker ubuntu
# (NOTE: You may need to log out and log back in to bash for this to take effect)

# 3. Clone or pull your latest repository
git clone https://github.com/Sujalv787/CivicEye.git
cd CivicEye
git pull origin main

# 4. Build the master Docker image
docker build -t civiceye-app .

# 5. Run the Container Database + App Stack
# You will need MongoDB running somewhere. If you don't have MongoDB Atlas (Cloud),
# the easiest way is to run a local Mongo container on the EC2 machine first:
docker run -d --name mongodb -p 27017:27017 mongo:latest

# 6. Run the CivicEye Application (Connecting to the mongo container)
# We use --net=host to allow the container to access localhost:27017 directly!
docker run -d --name civiceye-server --net=host --restart unless-stopped \
  -e MONGO_URI="mongodb://localhost:27017/civiceye" \
  -e JWT_SECRET="your_production_secure_jwt_token_here_123" \
  -e PORT=80 \
  civiceye-app

# 7. VERY IMPORTANT AWS STEP:
# Go to your AWS EC2 Console -> Security Groups -> Inbound Rules
# You MUST open Port 80 (HTTP) to 0.0.0.0/0 so the public internet can see your site!

# Your site will now be live at your EC2 Public IP address!
