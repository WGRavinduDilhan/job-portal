# Stage 1: Build the application
FROM maven:3.8.4-eclipse-temurin-11 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first to leverage Docker cache
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:11-jre-jammy
WORKDIR /app
COPY --from=build /app/target/jobportal-api.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", \
	"-Dmanagement.endpoint.health.probes.enabled=true", \
	"-Dmanagement.health.livenessState.enabled=true", \
	"-Dmanagement.health.readinessState.enabled=true", \
	"-Dmanagement.endpoints.web.exposure.include=health,info", \
	"-Dmanagement.endpoint.health.show-details=always", \
	"-jar", "app.jar"]
