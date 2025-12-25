import { Request, Response as ExpressResponse, NextFunction } from "express";

global.fetch = jest.fn((url: string | URL | Request, options?: any) => {
  const urlString = url.toString();

  if (
    urlString.includes("/api/items/") &&
    (!options || options.method !== "PATCH") //Mock get`${process.env.ITEM_SERVICE_URL}/api/items/${itemId}`,
  ) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        item: {
          id: "694daff1f71b2a13e894ca74",
          title: "Test Item",
          ownerId: "507f1f77bcf86cd799439011",
          status: "available",
        },
      }),
    } as Response);
  }

  if (urlString.includes("/api/items/") && options?.method === "PATCH") {
    //Mock patch`${process.env.ITEM_SERVICE_URL}/api/items/${itemId}`,
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        item: {
          id: "694daff1f71b2a13e894ca74",
          title: "Updated Item",
        },
      }),
    } as Response);
  }

  return Promise.reject(new Error(`Unhandled fetch: ${urlString}`));
}) as jest.Mock;

// Mock authenticate
jest.mock("../../src/middleware/auth", () => ({
  authenticate: (req: Request, res: ExpressResponse, next: NextFunction) => {
    req.user = {
      userId: "507f1f77bcf86cd799439011",
      email: "test@example.com",
      role: "user",
    };
    next();
  },
}));
import { GenericContainer, StartedTestContainer } from "testcontainers";
import mongoose from "mongoose";
import request from "supertest";
import express, { Application } from "express";
import auctionRoutes from "../../src/routes/auctionRoutes";
import { Auction } from "../../src/models/Auction";

const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use("/api/auctions", auctionRoutes);
  return app;
};

describe("Auction API - Integration Tests", () => {
  let container: StartedTestContainer;
  let app: Application;

  beforeAll(async () => {
    process.env.ITEM_SERVICE_URL = "http://localhost:3005";

    container = await new GenericContainer("mongo:7")
      .withExposedPorts(27017)
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(27017);
    const mongoUri = `mongodb://${host}:${port}/test`;

    await mongoose.connect(mongoUri);

    app = createTestApp();
  }, 120000);

  afterEach(async () => {
    await Auction.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await container.stop();
  }, 60000);

  describe("POST /api/auctions", () => {
    test("should create auction successfully", async () => {
      const auctionData = {
        title: "Vintage Camera",
        description: "Rare vintage camera from 1960s",
        itemId: new mongoose.Types.ObjectId().toString(),
        category: "electronics",
        startingPrice: 100,
        minIncrement: 10,
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
      };

      const response = await request(app)
        .post("/api/auctions")
        .send(auctionData)
        .expect(201);

      expect(response.body).toHaveProperty("auction");
      expect(response.body.auction).toMatchObject({
        title: auctionData.title,
        description: auctionData.description,
        status: "draft",
      });

      const savedAuction = await Auction.findById(response.body.auction.id);
      expect(savedAuction).not.toBeNull();
      expect(savedAuction?.title).toBe("Vintage Camera");
    });

    test("should fail when required fields are missing", async () => {
      const invalidData = {
        description: "Missing title",
      };

      await request(app).post("/api/auctions").send(invalidData).expect(400);
    });
  });
});
