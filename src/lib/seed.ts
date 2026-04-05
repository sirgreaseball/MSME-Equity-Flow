import { 
  collection, 
  doc, 
  setDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { mockUsers, mockBusinesses, mockListings, mockInvestments } from "@/data/msme";

/**
 * Seeds the Firestore database with the current mock data from msme.ts.
 * Only runs if the database is empty or if forced.
 */
export const seedDatabaseOnce = async (force = false) => {
  try {
    // 1. Always Ensure Demo Auth accounts exist
    const demoPassword = "password123";
    const demoUsers = [
      { email: 'john@example.com', name: 'John Investor', role: 'investor' },
      { email: 'sarah@techcorp.com', name: 'Sarah Johnson', role: 'business' },
      { email: 'admin@equityflow.com', name: 'Platform Admin', role: 'admin' }
    ];

    const emailToUid: Record<string, string> = {};

    for (const demoUser of demoUsers) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, demoUser.email, demoPassword);
        emailToUid[demoUser.email] = userCred.user.uid;
        console.log(`Created Auth account for ${demoUser.email}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          // Normal during development
          console.log(`Auth account exists for ${demoUser.email}`);
        } else {
          console.error(`Error checking auth for ${demoUser.email}:`, error);
        }
      }
    }

    // Check if we've already seeded Firestore docs
    // Version stamp — bump this to force a re-seed when mock data changes
    const SEED_VERSION = 'v5-dedicated-admin';
    const seeded = localStorage.getItem('equityFlow_seedVersion');
    if (seeded === SEED_VERSION && !force) {
      return;
    }

    // Only the version stamp controls whether we seed — the Firestore check
    // was causing new data to be blocked when old users already existed.

    console.log("Starting Firestore Document Seeding...");

    for (const user of mockUsers) {
      // If we just created this user, use the new firebase UID
      const idToUse = emailToUid[user.email] || user.id;
      
      // Update the user object with the correct ID for Firestore
      const userToSeed = { ...user, id: idToUse };
      await setDoc(doc(db, "users", idToUse), userToSeed);
      console.log(`Seeded user doc: ${user.name} (${idToUse})`);
      
      // Keep track of ID mapping for businesses
      emailToUid[user.email] = idToUse;
    }

    // 2. Seed Businesses
    for (const business of mockBusinesses) {
      // Find the owner's new ID if it changed
      const ownerEmail = mockUsers.find(u => u.id === business.ownerId)?.email;
      const ownerId = (ownerEmail && emailToUid[ownerEmail]) || business.ownerId;
      
      const businessToSeed = { ...business, ownerId };
      await setDoc(doc(db, "businesses", business.id), businessToSeed);
      console.log(`Seeded business: ${business.businessName}`);
    }

    // 3. Seed Listings
    for (const listing of mockListings) {
      await setDoc(doc(db, "listings", listing.id), listing);
      console.log(`Seeded listing: ${listing.id}`);
    }

    // 4. Seed Investments
    for (const investment of mockInvestments) {
      const userEmail = mockUsers.find(u => u.id === investment.userId)?.email;
      const userId = (userEmail && emailToUid[userEmail]) || investment.userId;
      
      const investmentToSeed = { ...investment, userId };
      await setDoc(doc(db, "investments", investment.id), investmentToSeed);
      console.log(`Seeded investment: ${investment.id}`);
    }

    localStorage.setItem('equityFlow_seedVersion', SEED_VERSION);
    console.log("Firebase Seeding Complete!");
    console.log("IMPORTANT: If data doesn't appear, check the browser console and create the required Firestore indexes via the provided links.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
