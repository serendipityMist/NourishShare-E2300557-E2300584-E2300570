import { Food } from "../models/food.model.js";
import { Notification } from "../models/notification.model.js";

async function runExpiryPass(daysAhead = 3) {
    const now = new Date();
    const until = new Date();
    until.setDate(until.getDate() + daysAhead);
    //not going in the main 
    const foods = await Food.find({
        expiryDate: { $gte: now, $lte: until },
        status: { $in: ["Available", "Upcoming"] }
    }).populate("owner", "name");

    for (const f of foods) {
        try {
            // Avoid duplicate expiry notifications for the same food item
            const exists = await Notification.findOne({
                owner: f.owner._id,
                notificationType: "Expiry",
                description: new RegExp(f._id.toString())
            });

            if (exists) continue;

            const title = `Item nearing expiry: ${f.name}`;
            const desc = `Your item "${f.name}" (expires ${f.expiryDate.toDateString()}) is approaching its expiry date. Consider consuming or donating it.`;

            await Notification.create({
                owner: f.owner._id,
                title,
                description: `${desc} [item:${f._id}]`,
                notificationType: "Expiry"
            });
        } catch (err) {
            console.error("Expiry notifier error for item", f._id, err);
        }
    }
}

export function scheduleExpiryNotifications(options = {}) {
    const daysAhead = options.daysAhead || 3;
    const intervalMs = options.intervalMs || 24 * 60 * 60 * 1000; // daily

    // Run once immediately, then schedule daily
    runExpiryPass(daysAhead).catch((e) => console.error("Expiry pass failed:", e));

    setInterval(() => {
        runExpiryPass(daysAhead).catch((e) => console.error("Expiry pass failed:", e));
    }, intervalMs);
}
