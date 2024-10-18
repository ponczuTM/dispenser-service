import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  for (let i = 0; i < 100; i++) {
    await page
      .getByRole("row", { name: "BigMac BigMac - 0 +" })
      .getByRole("button")
      .nth(1)
      .click();

    await page.getByRole("button", { name: "ZAMÓW" }).click();

    await page.reload();

    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
});
