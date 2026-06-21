import { test, expect } from "@playwright/test";

/**
 * Teilen-Dialog (M14) — prüft das native <dialog> + src/scripts/share.ts:
 *  1. Klick auf den Hero-CTA „Dank Dennis!" öffnet den Dialog (+ Konfetti-Burst).
 *  2. Das Textfeld ist mit dem Preset-Spruch vorbefüllt.
 *  3. Netzwerk-Buttons bauen korrekte Outbound-URLs aus dem (auch editierten) Text +
 *     window.location.origin und öffnen sie via window.open.
 *  4. „Text kopieren" legt Text + URL in die Zwischenablage und zeigt Feedback.
 *  5. Der native Teilen-Button ist nur sichtbar, wenn navigator.share existiert
 *     (headless Chromium: nicht → ausgeblendet).
 *  6. Esc / Backdrop-Klick / ✕ schließen den Dialog; Fokus geht zurück auf den Trigger.
 *  7. prefers-reduced-motion: reduce → KEIN Konfetti.
 *  8. Keine Konsolen-Fehler.
 * Läuft auf Desktop- UND Mobile-Viewport (playwright.config.ts).
 */

const ORIGIN = "http://localhost:4321";
const PRESET = "Wieder ein Problem gelöst. Dank Dennis! #dankdennis";

/** Fängt window.open ab, damit Tests die gebaute Ziel-URL lesen können. */
async function stubWindowOpen(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    (window as unknown as { __opened: string[] }).__opened = [];
    window.open = ((url?: string | URL) => {
      (window as unknown as { __opened: string[] }).__opened.push(String(url));
      return null;
    }) as typeof window.open;
  });
}

/**
 * Stubt navigator.share + navigator.canShare VOR dem Laden (damit share.ts den nativen
 * Button bindet). Aufgezeichnete Aufrufe liegen in window.__share.calls.
 * - canShareFiles: ob canShare(...mit files) true liefert (mobil ≈ true, Desktop ≈ false).
 * - shareResult: "resolve" (Erfolg) | "abort" (Nutzer bricht ab) | "reject" (anderer Fehler).
 */
async function stubWebShare(
  page: import("@playwright/test").Page,
  opts: { canShareFiles: boolean; shareResult: "resolve" | "abort" | "reject" },
) {
  await page.addInitScript((o) => {
    const w = window as unknown as {
      __share: {
        calls: Array<{ text?: string; url?: string; files: string[] }>;
      };
    };
    w.__share = { calls: [] };
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        w.__share.calls.push({
          text: data?.text,
          url: data?.url,
          files: (data?.files ?? []).map((f) => f.name),
        });
        if (o.shareResult === "abort")
          throw new DOMException("Abgebrochen", "AbortError");
        if (o.shareResult === "reject")
          throw new DOMException("Nicht erlaubt", "NotAllowedError");
      },
    });
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: (data: ShareData) =>
        data?.files?.length ? o.canShareFiles : true,
    });
  }, opts);
}

async function openDialog(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Dank Dennis!" }).click();
  await expect(page.locator("#share-dialog")).toHaveAttribute("open", "");
}

test("Hero-CTA trägt aria-haspopup=dialog und öffnet den Dialog", async ({
  page,
}) => {
  await page.goto("/");
  const cta = page.getByRole("button", { name: "Dank Dennis!" });
  await expect(cta).toHaveAttribute("aria-haspopup", "dialog");

  // Vor dem Klick ist der Dialog nicht offen.
  await expect(page.locator("#share-dialog")).not.toHaveAttribute("open", "");
  await openDialog(page);
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("Konfetti-Burst beim Öffnen (Canvas im Dialog)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(0);
  await openDialog(page);
  await expect(page.locator("#share-dialog canvas")).toHaveCount(1);
});

test("mit prefers-reduced-motion: reduce löst KEIN Konfetti aus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await openDialog(page);
  await page.waitForTimeout(300);
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("Textfeld ist mit dem Preset-Spruch vorbefüllt", async ({ page }) => {
  await page.goto("/");
  await openDialog(page);
  await expect(page.locator("#share-text")).toHaveValue(PRESET);
});

test("Netzwerk-Buttons bauen korrekte URLs (Preset-Text)", async ({ page }) => {
  await stubWindowOpen(page);
  await page.goto("/");
  await openDialog(page);

  const cases: Record<string, string> = {
    email: `mailto:?subject=${encodeURIComponent("Dank Dennis!")}&body=${encodeURIComponent(PRESET + "\n\n" + ORIGIN)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(PRESET + " " + ORIGIN)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(PRESET)}&url=${encodeURIComponent(ORIGIN)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(ORIGIN)}&text=${encodeURIComponent(PRESET)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ORIGIN)}`,
  };

  for (const [net, expected] of Object.entries(cases)) {
    await page.evaluate(() => {
      (window as unknown as { __opened: string[] }).__opened = [];
    });
    await page.locator(`[data-share-net="${net}"]`).click();
    const opened = await page.evaluate(
      () => (window as unknown as { __opened: string[] }).__opened,
    );
    expect(opened, net).toEqual([expected]);
  }
});

test("Netzwerk-URL übernimmt den editierten Text", async ({ page }) => {
  await stubWindowOpen(page);
  await page.goto("/");
  await openDialog(page);

  const edited = "Krass gerettet! Dank Dennis!";
  await page.locator("#share-text").fill(edited);
  await page.locator('[data-share-net="whatsapp"]').click();

  const opened = await page.evaluate(
    () => (window as unknown as { __opened: string[] }).__opened,
  );
  expect(opened).toEqual([
    `https://wa.me/?text=${encodeURIComponent(edited + " " + ORIGIN)}`,
  ]);
});

test("Text kopieren legt Text + URL in die Zwischenablage", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: ORIGIN,
  });
  await page.goto("/");
  await openDialog(page);

  await page.locator("[data-share-copy]").click();
  await expect(page.locator("[data-share-feedback]")).toContainText("Kopiert");

  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toBe(`${PRESET} ${ORIGIN}`);
});

test("nativer Teilen-Button ist ohne navigator.share ausgeblendet", async ({
  page,
}) => {
  await page.goto("/");
  await openDialog(page);
  // headless Chromium hat kein navigator.share → Button bleibt hidden.
  const hasShare = await page.evaluate(
    () => typeof navigator.share === "function",
  );
  const nativeBtn = page.locator("[data-share-native]");
  if (hasShare) {
    await expect(nativeBtn).toBeVisible();
  } else {
    await expect(nativeBtn).toBeHidden();
  }
});

function shareCalls(page: import("@playwright/test").Page) {
  return page.evaluate(
    () =>
      (
        window as unknown as {
          __share: {
            calls: Array<{ text?: string; url?: string; files: string[] }>;
          };
        }
      ).__share.calls,
  );
}

test("Web Share Desktop (canShare ohne files): teilt Text + URL, keine Fehlermeldung", async ({
  page,
}) => {
  await stubWebShare(page, { canShareFiles: false, shareResult: "resolve" });
  await page.goto("/");
  await openDialog(page);
  await expect(page.locator("[data-share-native]")).toBeVisible();

  await page.locator("[data-share-native]").click();
  const calls = await shareCalls(page);
  expect(calls).toHaveLength(1);
  expect(calls[0].files).toEqual([]); // Bild fällt auf Desktop weg
  expect(calls[0].text).toBe(PRESET);
  expect(calls[0].url).toBe(ORIGIN);
  await expect(page.locator("[data-share-feedback]")).toHaveText("");
});

test("Web Share Mobil (canShare mit files): Bild wird als Datei mitgeschickt", async ({
  page,
}) => {
  await stubWebShare(page, { canShareFiles: true, shareResult: "resolve" });
  await page.goto("/");
  // Auf das Vorab-Laden des Share-Bilds warten, damit die Datei bereitsteht.
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/share/dank-dennis.jpg")),
    openDialog(page),
  ]);
  await page.waitForTimeout(150);

  await page.locator("[data-share-native]").click();
  const calls = await shareCalls(page);
  expect(calls).toHaveLength(1);
  expect(calls[0].files).toEqual(["dank-dennis.jpg"]);
});

test("Web Share AbortError (Nutzer bricht ab): keine Meldung", async ({
  page,
}) => {
  await stubWebShare(page, { canShareFiles: true, shareResult: "abort" });
  await page.goto("/");
  await openDialog(page);
  await page.locator("[data-share-native]").click();
  await page.waitForTimeout(200);
  await expect(page.locator("[data-share-feedback]")).toHaveText("");
});

test("Web Share scheitert (kein Abort): lautloser Fallback auf Kopieren, kein 'Teilen nicht möglich'", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: ORIGIN,
  });
  await stubWebShare(page, { canShareFiles: false, shareResult: "reject" });
  await page.goto("/");
  await openDialog(page);

  await page.locator("[data-share-native]").click();
  await expect(page.locator("[data-share-feedback]")).toContainText("Kopiert");
  await expect(page.locator("[data-share-feedback]")).not.toContainText(
    "Teilen nicht möglich",
  );
});

test("Esc, Backdrop-Klick und ✕ schließen den Dialog (Fokus zurück auf CTA)", async ({
  page,
}) => {
  await page.goto("/");
  const dialog = page.locator("#share-dialog");

  // 1) Esc
  await openDialog(page);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toHaveAttribute("open", "");

  // 2) Backdrop-Klick (oben links, außerhalb der Karte)
  await openDialog(page);
  await page.mouse.click(5, 5);
  await expect(dialog).not.toHaveAttribute("open", "");

  // 3) ✕-Button → schließt und gibt den Fokus an den CTA zurück
  await openDialog(page);
  await page.getByRole("button", { name: "Dialog schließen" }).click();
  await expect(dialog).not.toHaveAttribute("open", "");
  const focusIsCta = await page.evaluate(
    () =>
      document.activeElement?.getAttribute("data-share") !== null &&
      document.activeElement?.hasAttribute("data-share"),
  );
  expect(focusIsCta).toBe(true);
});

test("keine Konsolen-Fehler beim Teilen-Flow", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: ORIGIN,
  });
  await stubWindowOpen(page);

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await openDialog(page);
  await page.locator('[data-share-net="x"]').click();
  await page.locator("[data-share-copy]").click();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);

  expect(
    consoleErrors,
    `Konsolen-Fehler: ${consoleErrors.join(" | ")}`,
  ).toEqual([]);
});
