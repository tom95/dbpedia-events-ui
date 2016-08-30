FROM node:onbuild
RUN apt-get update && apt-get install -y mongodb-server
RUN git clone https://github.com/tom95/dbpedia-events-ui.git
EXPOSE 8000
