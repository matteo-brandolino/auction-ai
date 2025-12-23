import { Response } from "express";
import { IAuction } from "../models/Auction";

export const checkAuctionOwnership = (
  auction: IAuction,
  userId: string,
  res: Response
): boolean => {
  if (!auction.isOwnedBy(userId)) {
    res.status(403).json({
      error: "Forbidden",
      message: "You can only modify your own auctions",
    });
    return false;
  }
  return true;
};

export const checkAuctionCanBeModified = (
  auction: IAuction,
  res: Response
): boolean => {
  if (!auction.canBeModified()) {
    res.status(400).json({
      error: "Bad Request",
      message: `Cannot modify auction with status: ${auction.status}. Only draft auctions can be modified.`,
    });
    return false;
  }
  return true;
};

export const checkAuctionCanBeDeleted = (
  auction: IAuction,
  res: Response
): boolean => {
  if (!auction.canBeDeleted()) {
    res.status(400).json({
      error: "Bad Request",
      message: `Cannot delete auction with status: ${auction.status}. Only draft or pending auctions can be deleted.`,
    });
    return false;
  }
  return true;
};

export const checkAuctionCanBeStarted = (
  auction: IAuction,
  res: Response
): boolean => {
  if (!auction.canBeStarted()) {
    res.status(400).json({
      error: "Bad Request",
      message: `Cannot start auction with status: ${auction.status}. Only pending auctions can be started manually.`,
    });
    return false;
  }
  return true;
};

export const validateAuctionTiming = (
  startTime: Date,
  endTime: Date,
  res: Response
): boolean => {
  const now = new Date();

  if (startTime < now) {
    res.status(400).json({
      error: "Bad Request",
      message: "Start time must be in the future",
    });
    return false;
  }

  if (endTime <= startTime) {
    res.status(400).json({
      error: "Bad Request",
      message: "End time must be after start time",
    });
    return false;
  }

  const minDuration = 5 * 60 * 1000; // 5 minutes
  const maxDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
  const duration = endTime.getTime() - startTime.getTime();

  if (duration < minDuration) {
    res.status(400).json({
      error: "Bad Request",
      message: "Auction duration must be at least 5 minutes",
    });
    return false;
  }

  if (duration > maxDuration) {
    res.status(400).json({
      error: "Bad Request",
      message: "Auction duration cannot exceed 7 days",
    });
    return false;
  }

  return true;
};
