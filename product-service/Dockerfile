FROM openjdk:20-jdk
WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} /app/app.jar
COPY src/main/resources/application-prod.yml /app/application.yml
ENTRYPOINT ["java","-jar","app.jar", "--spring.config.location=/app/application.yml"]
