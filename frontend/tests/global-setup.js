const BASE_URL = 'http://localhost:8500/api/v1';

const TEST_EMAIL = 'gfcgffghhhhgg53@gmail.com';
const TEST_PASSWORD = 'Spriha@123';

/*
 * Any meal plan whose name STARTS WITH one of these strings is
 * considered test data and will be deleted before the suite runs.
 *
 * Keep this list in sync with the literal names used inside
 * tests/UC6/meal-planner.spec.js.
 */
const TEST_MEAL_NAME_PATTERNS = [
    'Weekly Test Meal',
    'Meal To Edit',
    'Meal To Delete',
    'Playwright Test Meal',
    'Backend Test Meal',
    'Unsaved Meal',
    'Vegetable Fried Rice',
];

function isTestMeal(mealName) {
    if (!mealName) return false;
    return TEST_MEAL_NAME_PATTERNS.some(
        (pattern) => mealName.startsWith(pattern)
    );
}

export default async function globalSetup() {
    console.log('\n[global-setup] Logging in as test user to clean up old meal-plan test data...');

    let loginRes;

    try {
        loginRes = await fetch(`${BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
            }),
        });
    } catch (err) {
        console.warn(
            `[global-setup] Could not reach backend at ${BASE_URL}. Is the backend running? Skipping cleanup.`
        );
        console.warn(`[global-setup] Error: ${err.message}`);
        return;
    }

    if (!loginRes.ok) {
        const body = await loginRes.text();
        console.warn(
            `[global-setup] Login failed with status ${loginRes.status}. Skipping meal-plan cleanup.`
        );
        console.warn(
            `[global-setup] If the field names are wrong (e.g. backend expects a different key than "email"), the response body below should say so:`
        );
        console.warn(`[global-setup] Response body: ${body}`);
        return;
    }

    const loginData = await loginRes.json();

    /*
     * Based on the refresh-token handling in axios.js, the token
     * is expected at data.data.accessToken. If your login response
     * shape differs, this will print what was actually received.
     */
    const accessToken = loginData?.data?.accessToken;

    if (!accessToken) {
        console.warn(
            '[global-setup] Login succeeded but no accessToken was found at data.data.accessToken.'
        );
        console.warn(
            `[global-setup] Actual response shape: ${JSON.stringify(loginData)}`
        );
        console.warn('[global-setup] Skipping cleanup — update the accessToken path above once you see the real shape.');
        return;
    }

    const authHeaders = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    let mealPlansRes;

    try {
        mealPlansRes = await fetch(`${BASE_URL}/meal-plans`, {
            headers: authHeaders,
        });
    } catch (err) {
        console.warn(`[global-setup] Failed to fetch meal plans: ${err.message}`);
        return;
    }

    if (!mealPlansRes.ok) {
        console.warn(
            `[global-setup] Failed to fetch meal plans (status ${mealPlansRes.status}). Skipping cleanup.`
        );
        return;
    }

    const mealPlansData = await mealPlansRes.json();
    const mealPlans = mealPlansData?.data?.mealPlans || [];

    const toDelete = mealPlans.filter((meal) => isTestMeal(meal.mealName));

    console.log(
        `[global-setup] Found ${mealPlans.length} total meal plan(s) on the test account, ${toDelete.length} match known test-data patterns.`
    );

    let deletedCount = 0;

    for (const meal of toDelete) {
        try {
            const delRes = await fetch(`${BASE_URL}/meal-plans/${meal._id}`, {
                method: 'DELETE',
                headers: authHeaders,
            });

            if (delRes.ok) {
                deletedCount += 1;
            } else {
                console.warn(
                    `[global-setup] Failed to delete "${meal.mealName}" (${meal._id}): status ${delRes.status}`
                );
            }
        } catch (err) {
            console.warn(
                `[global-setup] Error deleting "${meal.mealName}" (${meal._id}): ${err.message}`
            );
        }
    }

    console.log(
        `[global-setup] Cleanup complete. Deleted ${deletedCount}/${toDelete.length} old test meal plan(s).\n`
    );
}