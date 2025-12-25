import mongoose from "mongoose";
import { Auction } from "../../src/models/Auction";

const createTestAuction = (overrides = {}) => {
  return new Auction({
    title: "Test Auction",
    description: "Test description for auction",
    itemId: new mongoose.Types.ObjectId(),
    sellerId: new mongoose.Types.ObjectId(),
    category: "electronics",
    startingPrice: 100,
    minIncrement: 10,
    startTime: new Date(),
    endTime: new Date(Date.now() + 86400000),
    ...overrides,
  });
};

describe("Auction Model - Business Logic", () => {
  describe("canBeModified()", () => {
    test("should return true when status is draft", () => {
      // ARRANGE
      const auction = createTestAuction({ status: "draft" });

      // ACT
      const result = auction.canBeModified();

      // ASSERT
      expect(result).toBe(true);
    });

    test("should return false when status is not draft", () => {
      const auction = createTestAuction({ status: "active" });
      const result = auction.canBeModified();
      expect(result).toBe(false);
    });
  });

  describe("canBeDeleted()", () => {
    test("should return true when status is draft", () => {
      const auction = createTestAuction({ status: "draft" });
      const result = auction.canBeDeleted();
      expect(result).toBe(true);
    });

    test("should return true when status is pending", () => {
      const auction = createTestAuction({ status: "pending" });
      const result = auction.canBeDeleted();
      expect(result).toBe(true);
    });

    test("should return false when status is active", () => {
      const auction = createTestAuction({ status: "active" });
      const result = auction.canBeDeleted();
      expect(result).toBe(false);
    });
  });
});
