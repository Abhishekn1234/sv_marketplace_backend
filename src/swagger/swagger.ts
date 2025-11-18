import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerOptions = {
  definition: { openapi: "3.0.0", info: { title: "My API Docs", version: "1.0.0" } },
 apis: ["./dist/features/**/Routes/**/*.js"]
};



export const swaggerSpec = swaggerJsdoc(swaggerOptions);
// console.log("swaggeroptions",swaggerOptions);
export const swaggerDocs = (app: Express, port: number) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  console.log(`📘 Swagger available at http://localhost:${port}/api-docs`);
};
