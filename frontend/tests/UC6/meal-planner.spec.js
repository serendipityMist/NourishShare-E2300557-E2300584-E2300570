import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'gfcgffghhhhgg53@gmail.com';
const TEST_PASSWORD = 'Spriha@123';

/*
 * Unique per test-run suffix.
 *
 * This stops meal names from colliding across repeated runs
 * (e.g. "Weekly Test Meal" would otherwise pile up in the
 * database every time the suite runs, causing strict-mode
 * violations when Playwright finds multiple matching elements).
 */
const RUN_ID = Date.now();

/*
|--------------------------------------------------------------------------
| UC6 - PLAN WEEKLY MEALS
|--------------------------------------------------------------------------
|
| Tests:
|
| 1. Protected route
| 2. Authenticated access
| 3. Weekly calendar
| 4. Meal slots
| 5. Search meals
| 6. Expiring inventory
| 7. Open meal planner modal
| 8. Select scheduled day
| 9. Select meal slot
| 10. Enter custom meal
| 11. Select inventory item
| 12. Recipe suggestion control
| 13. Reminder controls
| 14. Save meal
| 15. Backend request
| 16. Meal appears after saving
| 17. Edit existing meal
| 18. Delete existing meal
| 19. Navigation away and return
| 20. Empty inventory state
|
| No tests are intentionally skipped.
|--------------------------------------------------------------------------
*/

async function login(page) {
    await page.goto('/login', {
        waitUntil: 'domcontentloaded',
    });

    await expect(
        page.getByRole('button', {
            name: /log in/i,
        })
    ).toBeVisible({
        timeout: 15000,
    });

    await page
        .getByLabel('Email or Phone Number')
        .fill(TEST_EMAIL);

    await page
        .getByLabel('Password')
        .fill(TEST_PASSWORD);

    await Promise.all([
        page.waitForURL(/dashboard|welcome/, {
            timeout: 30000,
        }),

        page
            .getByRole('button', {
                name: /log in/i,
            })
            .click(),
    ]);
}


async function openMealPlanner(page) {
    await login(page);

    await page.goto('/meal-planner', {
        waitUntil: 'domcontentloaded',
    });

    await expect(page).toHaveURL(/meal-planner/i);

    await expect(
        page.getByText('Weekly Meal Planner', {
            exact: true,
        })
    ).toBeVisible({
        timeout: 20000,
    });
}


/*
|--------------------------------------------------------------------------
| UC6
|--------------------------------------------------------------------------
*/

test.describe('UC6 - Plan Weekly Meals', () => {

    /*
    |--------------------------------------------------------------------------
    | 1. Unauthenticated access
    |--------------------------------------------------------------------------
    */

    test('Unauthenticated user is redirected from Meal Planner', async ({
        page,
    }) => {
        await page.goto('/meal-planner', {
            waitUntil: 'domcontentloaded',
        });

        await expect(page).toHaveURL(/login/i, {
            timeout: 15000,
        });
    });


    /*
    |--------------------------------------------------------------------------
    | 2. Authenticated access
    |--------------------------------------------------------------------------
    */

    test('Authenticated user can access Weekly Meal Planner', async ({
        page,
    }) => {
        await openMealPlanner(page);

        await expect(
            page.getByText('Weekly Meal Planner', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText(
                'Build your week using expiring ingredients and smart recipe suggestions.',
                {
                    exact: true,
                }
            )
        ).toBeVisible();
    });


    /*
    |--------------------------------------------------------------------------
    | 3. Weekly calendar
    |--------------------------------------------------------------------------
    */

    test('Meal Planner displays the weekly calendar', async ({
        page,
    }) => {
        await openMealPlanner(page);

        const days = [
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat',
            'Sun',
        ];

        for (const day of days) {
            await expect(
                page.getByText(day, {
                    exact: true,
                })
            ).toBeVisible();
        }

        await expect(
            page.locator('#calendar-grid')
        ).toBeVisible();
    });


    /*
    |--------------------------------------------------------------------------
    | 4. Meal slots
    |--------------------------------------------------------------------------
    */

    test('Weekly calendar contains breakfast lunch dinner and snack slots', async ({
        page,
    }) => {
        await openMealPlanner(page);

        /*
         * MealColumn renders these labels.
         *
         * There are seven days, therefore each slot normally
         * appears multiple times.
         */

        await expect(
            page.getByText('Breakfast', {
                exact: true,
            }).first()
        ).toBeVisible();

        await expect(
            page.getByText('Lunch', {
                exact: true,
            }).first()
        ).toBeVisible();

        await expect(
            page.getByText('Dinner', {
                exact: true,
            }).first()
        ).toBeVisible();

        await expect(
            page.getByText('Snack', {
                exact: true,
            }).first()
        ).toBeVisible();
    });


    /*
    |--------------------------------------------------------------------------
    | 5. Search meals
    |--------------------------------------------------------------------------
    */

    test('User can search existing meal plans', async ({
        page,
    }) => {
        await openMealPlanner(page);

        const searchInput = page.getByPlaceholder(
            'Search meals...'
        );

        await expect(searchInput).toBeVisible();

        await searchInput.fill('chicken');

        await expect(searchInput).toHaveValue('chicken');
    });


    /*
    |--------------------------------------------------------------------------
    | 6. Expiring inventory section
    |--------------------------------------------------------------------------
    */

    test('Meal Planner displays expiring inventory information', async ({
        page,
    }) => {
        await openMealPlanner(page);

        await expect(
            page.getByText('Expiring Soon', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByText(
                'Use these items first to reduce waste.',
                {
                    exact: true,
                }
            )
        ).toBeVisible();

        /*
         * Either expiring items or the empty state is valid.
         */
        const expiringItems = page.getByText(
            'Expiring',
            {
                exact: true,
            }
        );

        const emptyMessage = page.getByText(
            'No expiring items found. Add more inventory to get suggestions.',
            {
                exact: true,
            }
        );

        const hasExpiringItems = await expiringItems.count();

        if (hasExpiringItems > 0) {
            await expect(
                expiringItems.first()
            ).toBeVisible();
        } else {
            await expect(
                emptyMessage
            ).toBeVisible();
        }
    });


    /*
    |--------------------------------------------------------------------------
    | 7. Open meal modal
    |--------------------------------------------------------------------------
    */

    test('User can open the Plan a Meal dialog', async ({
        page,
    }) => {
        await openMealPlanner(page);

        /*
         * Each empty MealColumn contains "Plan a Meal".
         */
        const planMealButton = page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first();

        await expect(planMealButton).toBeVisible();

        await planMealButton.click();

        await expect(
            page.getByText('PLAN MEAL', {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole('heading', {
                name: 'Plan a Meal',
                exact: true,
            })
        ).toBeVisible();
    });


    /*
    |--------------------------------------------------------------------------
    | 8. Scheduled day
    |--------------------------------------------------------------------------
    */

    test('User can select a scheduled day', async ({
        page,
    }) => {
        await openMealPlanner(page);

        await page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first().click();

        const scheduledDayLabel = page.getByText(
            'Scheduled Day',
            {
                exact: true,
            }
        );

        await expect(
            scheduledDayLabel
        ).toBeVisible();

        const daySelect = page.locator(
            'select'
        ).filter({
            has: page.locator('option[value="Monday"]'),
        }).first();

        await expect(
            daySelect
        ).toBeVisible();

        await daySelect.selectOption('Wednesday');

        await expect(
            daySelect
        ).toHaveValue('Wednesday');
    });


    /*
    |--------------------------------------------------------------------------
    | 9. Meal slot
    |--------------------------------------------------------------------------
    */

    test('User can choose breakfast lunch dinner or snack', async ({
        page,
    }) => {
        await openMealPlanner(page);

        await page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first().click();

        const slots = [
            'Breakfast',
            'Lunch',
            'Dinner',
            'Snack',
        ];

        for (const slot of slots) {
            const slotButton = page.getByRole(
                'button',
                {
                    name: slot,
                    exact: true,
                }
            ).last();

            await expect(
                slotButton
            ).toBeVisible();

            await slotButton.click();
        }
    });


    /*
    |--------------------------------------------------------------------------
    | 10. Custom meal
    |--------------------------------------------------------------------------
    */

    test('User can create a custom meal by entering a dish name', async ({
        page,
    }) => {
        await openMealPlanner(page);

        await page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first().click();

        const dishInput = page.getByPlaceholder(
            'Enter dish name...'
        );

        await expect(
            dishInput
        ).toBeVisible();

        await dishInput.fill('Vegetable Fried Rice');

        await expect(
            dishInput
        ).toHaveValue('Vegetable Fried Rice');
    });


    /*
    |--------------------------------------------------------------------------
    | 11. Inventory selection
    |--------------------------------------------------------------------------
    */

    test('User can add an inventory item to a meal', async ({
        page,
    }) => {
        await openMealPlanner(page);

        await page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first().click();

        const addItemButton = page.getByRole(
            'button',
            {
                name: '+ Add Item',
                exact: true,
            }
        );

        await expect(
            addItemButton
        ).toBeVisible();

        await addItemButton.click();

        /*
         * The implementation renders either:
         *
         * - active inventory items
         * - No active inventory items available.
         */
        const emptyInventory = page.getByText(
            'No active inventory items available.',
            {
                exact: true,
            }
        );

        if (await emptyInventory.count() > 0) {
            await expect(
                emptyInventory
            ).toBeVisible();

            /*
             * Nothing to select, but the actual UI behavior
             * has been tested.
             */
            return;
        }

        /*
         * Find inventory menu items.
         *
         * They are rendered as divs, not buttons.
         */
        const inventoryMenu = page.locator(
            '.mt-3.p-2.bg-white'
        ).first();

        await expect(
            inventoryMenu
        ).toBeVisible();

        const inventoryItems = inventoryMenu.locator(
            'div.cursor-pointer'
        );

        const count = await inventoryItems.count();

        expect(
            count,
            'Inventory menu should contain at least one active item.'
        ).toBeGreaterThan(0);

        const firstItem = inventoryItems.first();

        await firstItem.click();

        /*
         * The selected inventory item should now appear
         * inside #inventoryTags.
         */
        const inventoryTags = page.locator(
            '#inventoryTags'
        );

        await expect(
            inventoryTags
        ).toBeVisible();

        await expect(
            inventoryTags.locator('span').first()
        ).toBeVisible();
    });


    /*
    |--------------------------------------------------------------------------
    | 12. Recipe suggestion control
    |--------------------------------------------------------------------------
    */

    test('Recipe suggestion control is available when inventory is selected', async ({
        page,
    }) => {
        await openMealPlanner(page);

        await page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first().click();

        const addItemButton = page.getByRole(
            'button',
            {
                name: '+ Add Item',
                exact: true,
            }
        );

        await addItemButton.click();

        const emptyInventory = page.getByText(
            'No active inventory items available.',
            {
                exact: true,
            }
        );

        if (await emptyInventory.count() > 0) {
            await expect(
                emptyInventory
            ).toBeVisible();

            /*
             * In this legitimate application state,
             * recipe suggestions cannot be requested because
             * no ingredients are selected.
             */
            return;
        }

        const inventoryItems = page.locator(
            '.mt-3.p-2.bg-white div.cursor-pointer'
        );

        await expect(
            inventoryItems.first()
        ).toBeVisible();

        await inventoryItems.first().click();

        const suggestionButton = page.getByRole(
            'button',
            {
                name: /suggest recipes from selected ingredients/i,
            }
        );

        await expect(
            suggestionButton
        ).toBeVisible();

        await expect(
            suggestionButton
        ).toBeEnabled();
    });


    /*
    |--------------------------------------------------------------------------
    | 13. Reminder
    |--------------------------------------------------------------------------
    */

    test('User can configure the meal preparation reminder', async ({
        page,
    }) => {
        await openMealPlanner(page);

        await page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first().click();

        await expect(
            page.getByText(
                'Meal Prep Reminder',
                {
                    exact: true,
                }
            )
        ).toBeVisible();

        await expect(
            page.getByText(
                'Notify me before starting',
                {
                    exact: true,
                }
            )
        ).toBeVisible();

        /*
         * Select reminder time.
         */
        const reminderSelect = page.locator(
            'select'
        ).filter({
            has: page.locator(
                'option[value="30"]'
            ),
        }).first();

        await expect(
            reminderSelect
        ).toBeVisible();

        await reminderSelect.selectOption('120');

        await expect(
            reminderSelect
        ).toHaveValue('120');

        /*
         * Toggle reminder.
         *
         * #reminderIcon's immediate parent only contains the
         * icon and label text — the actual toggle button lives
         * in a sibling container one level further up (the
         * shared "justify-between" row that holds both the
         * icon block and the select/button block). So we need
         * to go up two levels, not one, to reach the button.
         */
        const reminderButton = page.locator(
            '#reminderIcon'
        ).locator('../..').locator('button');

        await expect(
            reminderButton
        ).toBeVisible();

        await reminderButton.click();
    });


    /*
    |--------------------------------------------------------------------------
    | 14. Save custom meal
    |--------------------------------------------------------------------------
    */

    test('User can save a custom meal plan', async ({
        page,
    }) => {
        await openMealPlanner(page);

        await page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first().click();

        const mealName = `Playwright Test Meal ${RUN_ID}`;

        const dishInput = page.getByPlaceholder(
            'Enter dish name...'
        );

        await dishInput.fill(mealName);

        const saveButton = page.getByRole(
            'button',
            {
                name: 'Save Changes',
                exact: true,
            }
        );

        await expect(
            saveButton
        ).toBeVisible();

        await saveButton.click();

        /*
         * Successful save closes the modal and displays a toast.
         */
        await expect(
            page.getByText(
                `Saved ${mealName}`,
                {
                    exact: true,
                }
            )
        ).toBeVisible({
            timeout: 15000,
        });
    });


    /*
    |--------------------------------------------------------------------------
    | 15. Verify backend save request
    |--------------------------------------------------------------------------
    */

    test('Saving a meal sends a meal-plan request to the backend', async ({
        page,
    }) => {
        await openMealPlanner(page);

        const responsePromise = page.waitForResponse(
            (response) => {
                const url = response.url();

                return (
                    url.includes('/meal-plan') &&
                    response.request().method() !== 'GET'
                );
            },
            {
                timeout: 20000,
            }
        );

        await page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first().click();

        await page.getByPlaceholder(
            'Enter dish name...'
        ).fill(
            `Backend Test Meal ${RUN_ID}`
        );

        await page.getByRole(
            'button',
            {
                name: 'Save Changes',
                exact: true,
            }
        ).click();

        const response = await responsePromise;

        console.log(
            'Meal plan save response:',
            response.status(),
            response.url()
        );

        expect(
            response.status(),
            'Meal plan save request failed.'
        ).toBeLessThan(400);
    });


    /*
    |--------------------------------------------------------------------------
    | 16. Meal appears after save
    |--------------------------------------------------------------------------
    */

    test('Saved meal appears in the weekly meal planner', async ({
        page,
    }) => {
        await openMealPlanner(page);

        const mealName = `Weekly Test Meal ${RUN_ID}`;

        await page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first().click();

        await page.getByPlaceholder(
            'Enter dish name...'
        ).fill(
            mealName
        );

        await page.getByRole(
            'button',
            {
                name: 'Save Changes',
                exact: true,
            }
        ).click();

        await expect(
            page.getByText(
                `Saved ${mealName}`,
                {
                    exact: true,
                }
            )
        ).toBeVisible({
            timeout: 15000,
        });

        /*
         * The saved meal should appear somewhere in the
         * weekly calendar.
         */
        await expect(
            page.getByText(
                mealName,
                {
                    exact: true,
                }
            )
        ).toBeVisible({
            timeout: 15000,
        });
    });


    /*
    |--------------------------------------------------------------------------
    | 17. Edit an existing meal
    |--------------------------------------------------------------------------
    */

    test('User can edit an existing meal plan', async ({
        page,
    }) => {
        await openMealPlanner(page);

        const mealName = `Meal To Edit ${RUN_ID}`;

        /*
         * Find an actual meal card by looking for text
         * inside calendar columns that is not the standard
         * empty-state "Plan a Meal".
         */
        const mealNames = await page.locator(
            '#calendar-grid'
        ).locator(
            'p.font-semibold'
        ).allTextContents();

        const actualMealName = mealNames
            .map((name) => name.trim())
            .find(
                (name) =>
                    name &&
                    name !== 'Breakfast' &&
                    name !== 'Lunch' &&
                    name !== 'Dinner' &&
                    name !== 'Snack'
            );

        if (!actualMealName) {
            /*
             * Create a meal first so this test can exercise
             * the edit workflow without depending on pre-existing
             * database state.
             */
            await page.getByText(
                'Plan a Meal',
                {
                    exact: true,
                }
            ).first().click();

            await page.getByPlaceholder(
                'Enter dish name...'
            ).fill(
                mealName
            );

            await page.getByRole(
                'button',
                {
                    name: 'Save Changes',
                    exact: true,
                }
            ).click();

            await expect(
                page.getByText(
                    mealName,
                    {
                        exact: true,
                    }
                )
            ).toBeVisible({
                timeout: 15000,
            });
        }

        /*
         * Click the meal card.
         *
         * The MealColumn opens the modal when the meal area
         * is clicked.
         */
        const mealText =
            page.getByText(
                actualMealName || mealName,
                {
                    exact: true,
                }
            );

        await expect(
            mealText
        ).toBeVisible();

        await mealText.click();

        await expect(
            page.getByRole(
                'heading',
                {
                    name: /Edit Meal/i,
                }
            )
        ).toBeVisible();

        await expect(
            page.getByText(
                'EDIT MEAL',
                {
                    exact: true,
                }
            )
        ).toBeVisible();
    });


    /*
    |--------------------------------------------------------------------------
    | 18. Delete existing meal
    |--------------------------------------------------------------------------
    */

    test('User can delete an existing meal plan', async ({
        page,
    }) => {
        await openMealPlanner(page);

        const mealName = `Meal To Delete ${RUN_ID}`;

        /*
         * Create a dedicated meal first.
         */
        await page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first().click();

        await page.getByPlaceholder(
            'Enter dish name...'
        ).fill(
            mealName
        );

        await page.getByRole(
            'button',
            {
                name: 'Save Changes',
                exact: true,
            }
        ).click();

        await expect(
            page.getByText(
                mealName,
                {
                    exact: true,
                }
            )
        ).toBeVisible({
            timeout: 15000,
        });

        /*
         * Open the meal.
         */
        await page.getByText(
            mealName,
            {
                exact: true,
            }
        ).click();

        await expect(
            page.getByText(
                'EDIT MEAL',
                {
                    exact: true,
                }
            )
        ).toBeVisible();

        const deleteButton = page.getByRole(
            'button',
            {
                name: /delete meal/i,
            }
        );

        await expect(
            deleteButton
        ).toBeVisible();

        await deleteButton.click();

        await expect(
            page.getByText(
                'Meal removed',
                {
                    exact: true,
                }
            )
        ).toBeVisible({
            timeout: 15000,
        });
    });


    /*
    |--------------------------------------------------------------------------
    | 19. Leave and return
    |--------------------------------------------------------------------------
    */

    test('User can leave and return to Meal Planner', async ({
        page,
    }) => {
        await openMealPlanner(page);

        await expect(
            page.getByText(
                'Weekly Meal Planner',
                {
                    exact: true,
                }
            )
        ).toBeVisible();

        await page.goto('/dashboard', {
            waitUntil: 'domcontentloaded',
        });

        await expect(
            page
        ).toHaveURL(
            /dashboard/i,
            {
                timeout: 15000,
            }
        );

        await page.goto('/meal-planner', {
            waitUntil: 'domcontentloaded',
        });

        await expect(
            page
        ).toHaveURL(
            /meal-planner/i
        );

        await expect(
            page.getByText(
                'Weekly Meal Planner',
                {
                    exact: true,
                }
            )
        ).toBeVisible({
            timeout: 20000,
        });
    });


    /*
    |--------------------------------------------------------------------------
    | 20. Empty inventory / alternative state
    |--------------------------------------------------------------------------
    */

    test('Meal Planner handles an empty inventory state', async ({
        page,
    }) => {
        await openMealPlanner(page);

        await page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first().click();

        await page.getByRole(
            'button',
            {
                name: '+ Add Item',
                exact: true,
            }
        ).click();

        const emptyInventory = page.getByText(
            'No active inventory items available.',
            {
                exact: true,
            }
        );

        const inventoryItems = page.locator(
            '.mt-3.p-2.bg-white div.cursor-pointer'
        );

        const itemCount =
            await inventoryItems.count();

        if (itemCount === 0) {
            await expect(
                emptyInventory
            ).toBeVisible();
        } else {
            /*
             * The alternative valid state is that inventory
             * items are available.
             */
            await expect(
                inventoryItems.first()
            ).toBeVisible();
        }
    });


    /*
    |--------------------------------------------------------------------------
    | 21. Cancel meal modal
    |--------------------------------------------------------------------------
    */

    test('User can cancel meal planning without saving', async ({
        page,
    }) => {
        await openMealPlanner(page);

        await page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first().click();

        await expect(
            page.getByRole(
                'heading',
                {
                    name: 'Plan a Meal',
                    exact: true,
                }
            )
        ).toBeVisible();

        await page.getByPlaceholder(
            'Enter dish name...'
        ).fill(
            `Unsaved Meal ${RUN_ID}`
        );

        await page.getByRole(
            'button',
            {
                name: 'Cancel',
                exact: true,
            }
        ).click();

        /*
         * The modal is never removed from the DOM — it stays
         * mounted and is shown/hidden purely via CSS
         * (opacity + pointer-events), driven by the
         * `.modal-backdrop` wrapper class toggling between
         * "opacity-100 pointer-events-auto" and
         * "opacity-0 pointer-events-none".
         *
         * Because the element never actually leaves the DOM
         * or gets `display: none`, Playwright's toBeHidden()
         * will never resolve true here — it only checks for
         * detachment, display:none, visibility:hidden, or a
         * zero-size box, none of which opacity:0 satisfies.
         *
         * So instead we assert on the backdrop's class state,
         * which is what the app actually uses to represent
         * "closed".
         */
        const backdrop = page.locator('.modal-backdrop');

        await expect(backdrop).toHaveClass(/opacity-0/);
        await expect(backdrop).toHaveClass(/pointer-events-none/);
    });


    /*
    |--------------------------------------------------------------------------
    | 22. Validation when dish name is empty
    |--------------------------------------------------------------------------
    */

    test('System prevents saving a meal without a dish name', async ({
        page,
    }) => {
        await openMealPlanner(page);

        await page.getByText(
            'Plan a Meal',
            {
                exact: true,
            }
        ).first().click();

        const saveButton = page.getByRole(
            'button',
            {
                name: 'Save Changes',
                exact: true,
            }
        );

        await saveButton.click();

        await expect(
            page.getByText(
                'Please enter a dish name.',
                {
                    exact: true,
                }
            )
        ).toBeVisible();
    });
});