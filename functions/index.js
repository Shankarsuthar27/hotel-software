// Firebase Cloud Functions for Hotel PMS Pro
// Automated Midnight Night Audit & Tariff Posting

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * Scheduled Night Audit Cron Job
 * Executes automatically every day at 00:00 (Midnight IST / UTC+5:30)
 */
exports.scheduledNightAudit = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("Asia/Kolkata")
  .onRun(async (context) => {
    console.log("[NightAudit] Starting automated midnight tariff posting...");

    const propertiesSnap = await db.collection("properties").get();

    for (const propDoc of propertiesSnap.docs) {
      const propertyId = propDoc.id;
      const propertyData = propDoc.data();
      const curDate = propertyData.businessDate || new Date().toISOString().split("T")[0];

      console.log(`[NightAudit] Processing property: ${propertyId} for operational date: ${curDate}`);

      // Query active in-house reservations
      const inHouseSnap = await db
        .collection("properties")
        .doc(propertyId)
        .collection("reservations")
        .where("status", "==", "in_house")
        .get();

      let totalPostedRevenue = 0;
      let totalTax = 0;
      const chargesLog = [];

      for (const resDoc of inHouseSnap.docs) {
        const res = resDoc.data();
        const baseRate = Number(res.baseRatePerNight) || 2500;
        
        // Indian GST Slab: 12% if < ₹7500, 18% if >= ₹7500
        const isHighTariff = baseRate >= 7500;
        const gstRate = isHighTariff ? 0.18 : 0.12;
        const taxAmount = Math.round(baseRate * gstRate);

        totalPostedRevenue += baseRate;
        totalTax += taxAmount;

        const folioRef = db
          .collection("properties")
          .doc(propertyId)
          .collection("folios")
          .doc(res.folioId);

        const folioSnap = await folioRef.get();
        if (folioSnap.exists) {
          const folioData = folioSnap.data();
          const txList = folioData.transactions || [];

          const newNightlyTx = {
            id: `tx_audit_${Date.now()}_${resDoc.id}`,
            date: curDate,
            category: "Room (Room Rent / Accommodation)",
            type: "ROOM_CHARGE",
            desc: `Automated Night Audit Tariff - Room ${res.roomNumber}`,
            voucherNumber: `AUD-${curDate.replace(/-/g, "")}`,
            amount: baseRate,
            tax: taxAmount,
            direction: "DEBIT",
            isVoided: false,
            postedAt: new Date().toISOString()
          };

          txList.push(newNightlyTx);

          await folioRef.update({
            transactions: txList,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Update reservation balanceDue and totalAmount
          await resDoc.ref.update({
            totalAmount: admin.firestore.FieldValue.increment(baseRate + taxAmount),
            taxAmount: admin.firestore.FieldValue.increment(taxAmount),
            balanceDue: admin.firestore.FieldValue.increment(baseRate + taxAmount)
          });

          chargesLog.push({
            roomId: res.roomId,
            roomNumber: res.roomNumber,
            guestName: res.primaryGuest?.name,
            amount: baseRate,
            tax: taxAmount
          });
        }
      }

      // Advance property business date by 1 day
      const nextDateObj = new Date(curDate);
      nextDateObj.setDate(nextDateObj.getDate() + 1);
      const nextDate = nextDateObj.toISOString().split("T")[0];

      await propDoc.ref.update({
        businessDate: nextDate,
        lastNightAuditAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Record Night Audit summary log
      await db
        .collection("properties")
        .doc(propertyId)
        .collection("nightAudits")
        .doc(`na_${curDate.replace(/-/g, "")}`)
        .set({
          auditDate: curDate,
          totalRevenue: totalPostedRevenue,
          totalTax: totalTax,
          occupiedRooms: inHouseSnap.size,
          chargesPostedCount: chargesLog.length,
          chargesLog,
          status: "COMPLETED",
          performedBy: "Automated Firebase Cloud Function",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log(`[NightAudit] Completed for ${propertyId}: Posted ₹${totalPostedRevenue} across ${chargesLog.length} folios.`);
    }

    return null;
  });
