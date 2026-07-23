# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend-build
WORKDIR /frontend
RUN npm install --global pnpm@10
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm build

FROM maven:3.9.9-eclipse-temurin-17-alpine AS backend-build
WORKDIR /backend
COPY backend/pom.xml ./
RUN mvn --batch-mode dependency:go-offline
COPY backend/src ./src
COPY --from=frontend-build /frontend/dist/frontend/browser ./src/main/resources/static
RUN mvn --batch-mode package -DskipTests

FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S billpay && adduser -S billpay -G billpay
WORKDIR /app
COPY --from=backend-build /backend/target/*.jar app.jar
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=50 -XX:InitialRAMPercentage=20 -XX:MaxMetaspaceSize=96m -Xss256k -XX:+UseSerialGC"
USER billpay
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
