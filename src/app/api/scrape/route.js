import puppeteer from 'puppeteer';
import { OpenAI } from "openai";

export async function POST(req) {
    const { url } = await req.json();

    if (!url) {
        return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400 });
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: false, // Set to false if you want to see the browser actions
        });
        const page = await browser.newPage();

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 0, // No timeout
        });

        const cookieConsentButtonSelector = 'button.Buttons__Button-sc-19xdot-1.CCPAModal__StyledCloseButton-sc-10x9kq-2';

        // Check if the cookie consent button is present and click it
        const cookieConsentButton = await page.$(cookieConsentButtonSelector);
        if (cookieConsentButton) {
            console.log("Cookie consent pop-up found, attempting to close...");
            await cookieConsentButton.click();
            console.log("Cookie consent pop-up closed.");

            // Use setTimeout to introduce a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log("Now extracting...");
        const loadMoreButtonSelector = 'button.Buttons__Button-sc-19xdot-1.PaginationButton__StyledPaginationButton-txi1dr-1';
        const reviewSelector = '.Comments__StyledComments-dzzyvm-0';

        let loadMoreButtonVisible = true;

        while (loadMoreButtonVisible) {
            try {
                console.log("Looking for the 'Load More Ratings' button...");
                // Check if the "Load More Ratings" button is visible
                await page.waitForSelector(loadMoreButtonSelector, { visible: true, timeout: 5000 });
                console.log("Button found, attempting to click...");

                await page.click(loadMoreButtonSelector);

                console.log("Button clicked, waiting for new content to load...");
                // Wait for new content to load
                await page.waitForFunction(
                    (selector, previousReviewCount) => {
                        return document.querySelectorAll(selector).length > previousReviewCount;
                    },
                    { timeout: 10000 }, // Adjust based on content loading time
                    reviewSelector,
                    (await page.$$eval(reviewSelector, reviews => reviews.length))
                );

                // Scroll down to load more content if necessary
                await page.evaluate(() => window.scrollBy(0, window.innerHeight));

                // Use setTimeout to introduce a delay
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                console.log("No more 'Load More Ratings' button found or an error occurred.");
                loadMoreButtonVisible = false; // Exit loop if button is not found or error occurs
            }
        }

        const data = await page.evaluate(() => {
            const firstName = document.querySelector('.NameTitle__Name-dowf0z-0 span')?.innerText;
            const lastName = document.querySelector('.NameTitle__LastNameWrapper-dowf0z-2')?.childNodes[0]?.textContent;
            const professorName = `${firstName} ${lastName}`;
            const overallRating = document.querySelector('.RatingValue__Numerator-qw8sqy-2')?.innerText;
            const reviews = [...document.querySelectorAll('.Comments__StyledComments-dzzyvm-0')].map(review => review.innerText);

            return {
                professorName,
                overallRating,
                reviews,
            };
        });

        const openai = new OpenAI({
            apiKey: "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",
            baseURL: "https://openrouter.ai/api/v1",
        });

        const systemPrompt = `You are an AI assistant that specializes in analyzing text data. Your task is to analyze a series of student reviews about a professor. Based on these reviews, you need to:
        1. Summarize the overall impression of the professor.
        2. Identify the key strengths (pros) of the professor according to the students.
        3. Highlight any areas for improvement (cons) mentioned by the students.
        
        Your response should be concise, well-structured, and provide a clear understanding of the professor's teaching style and effectiveness and his/her shortcommings.`;

        const completion = await openai.chat.completions.create({
            model: "google/gemma-2-9b-it:free",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Here are the reviews of the professor:" },
                ...data.reviews.map(review => ({ role: "user", content: review })),
            ],
        });
        console.log(completion)

        const summary = completion.choices[0].message.content;

        // Return only the required information
        const responseData = {
            professorName: data.professorName,
            overallRating: data.overallRating,
            summary: summary,
        };
        console.log(responseData);
        return new Response(JSON.stringify(responseData), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    } finally {
        if (browser) {
            // Uncomment this line to close the browser after the script is done
            await browser.close();
        }
    }
}
