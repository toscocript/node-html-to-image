import { Page } from "puppeteer";
import handlebars, { compile } from "handlebars";

import { MakeScreenshotParams } from "./types";

export async function makeScreenshot(
  page: Page,
  {
    scale = 2,
    screenshot,
    beforeScreenshot,
    waitUntil = "networkidle0",
    handlebarsHelpers,
  }: MakeScreenshotParams
) {
  const hasHelpers = handlebarsHelpers && typeof handlebarsHelpers === "object";
  if (hasHelpers) {
    if (
      Object.values(handlebarsHelpers).every(
        (h) => typeof h === "function"
      )
    ) {
      handlebars.registerHelper(handlebarsHelpers);
    } else {
      throw Error("Some helper is not a valid function");
    }
  }


  if (screenshot?.content || hasHelpers) {
    const template = compile(screenshot.html);
    screenshot.setHTML(template(screenshot.content));
  }
await page.setViewport({
  width: 480,
  height: 480,
  deviceScaleFactor: scale || 2
});
  await page.setContent(screenshot.html, { waitUntil });
  const element = await page.$(screenshot.selector);
  if (!element) {
    throw Error("No element matches selector: " + screenshot.selector);
  }

  if (isFunction(beforeScreenshot)) {
    await beforeScreenshot(page);
  }

  const buffer = await element.screenshot({
    path: screenshot.output,
    type: screenshot.type,
    omitBackground: screenshot.transparent,
    encoding: screenshot.encoding,
    quality: screenshot.quality,
  });

  screenshot.setBuffer(buffer);

  return screenshot;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFunction(f: any) {
  return f && typeof f === "function";
}
