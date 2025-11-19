import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: { 
      title: "KYC Authentication API", 
      version: "1.0.0",
      description: "API documentation for KYC Authentication system"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, "../features/**/Routes/*.ts"),
    path.join(__dirname, "../features/**/Controllers/*.ts"),
    path.join(__dirname, "../features/**/Services/*.ts")
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const swaggerDocs = (app: Express, port: number) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📘 Swagger available at http://localhost:${port}/api-docs`);
};
