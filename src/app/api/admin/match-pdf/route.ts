import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matchId = req.nextUrl.searchParams.get("id");
  if (!matchId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const baseUrl = req.nextUrl.origin;
  const printUrl = `${baseUrl}/admin/print/match/${matchId}`;

  try {
    let browser;

    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      const chromium = (await import("@sparticuz/chromium")).default;
      const puppeteer = (await import("puppeteer-core")).default;
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: (chromium as any).defaultViewport || { width: 1280, height: 720 },
        executablePath: await chromium.executablePath(),
        headless: (chromium as any).headless ?? true,
      });
    } else {
      const puppeteer = (await import("puppeteer-core")).default;
      const possiblePaths = [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      ];
      let execPath = "";
      for (const p of possiblePaths) {
        try {
          const fs = await import("fs");
          if (fs.existsSync(p)) { execPath = p; break; }
        } catch {}
      }
      if (!execPath) {
        return NextResponse.json({ error: "Chrome not found locally" }, { status: 500 });
      }
      browser = await puppeteer.launch({
        executablePath: execPath,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    // Forward auth cookies so the print page can load
    const cookieHeader = req.headers.get("cookie") || "";
    const page = await browser.newPage();

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((c) => {
        const [name, ...rest] = c.trim().split("=");
        return { name, value: rest.join("="), domain: new URL(baseUrl).hostname, path: "/" };
      }).filter(c => c.name && c.value);
      if (cookies.length > 0) await page.setCookie(...cookies);
    }

    await page.goto(printUrl, { waitUntil: "networkidle0", timeout: 30000 });

    // Remove the auto-print script so it doesn't interfere
    await page.evaluate(() => {
      document.querySelectorAll("script").forEach((s) => s.remove());
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="biodata-match-${matchId.slice(-6)}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: `PDF generation failed: ${err.message}` }, { status: 500 });
  }
}
