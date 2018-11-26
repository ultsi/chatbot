FROM node:8.7.0

WORKDIR /install
COPY package.json /install
RUN npm install
RUN npm run build
ENV NODE_PATH=/install/node_modules
WORKDIR /app/chatbot
RUN echo "Europe/Helsinki" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata

COPY . .

CMD ["npm", "run start_prod"]
