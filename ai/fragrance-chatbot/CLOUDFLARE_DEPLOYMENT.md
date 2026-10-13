# Free live chatbot: Cloudflare + Render + Vercel

The storefront calls your existing Render API. Render retrieves public catalog data and calls Cloudflare Workers AI over HTTPS. No VM, Python service, custom domain, or DNS changes are required for this route. The local Qwen learning lab remains a separate training experiment.

## 1. Create or sign in to Cloudflare

Open [Cloudflare](https://dash.cloudflare.com/sign-up) and stay on the free plan. No credit card is required to start: [Workers AI](https://www.cloudflare.com/products/workers-ai/).

In the dashboard, open **Workers AI**, select **Use REST API**, then **Create a Workers AI API Token**. Review the permissions, restrict it to your intended account, and copy the token. Copy the **Account ID** from the same page (a 32-character hexadecimal value). Follow [Cloudflare's REST API guide](https://developers.cloudflare.com/workers-ai/get-started/rest-api/).

Keep the token private. Enter it directly in Render's environment settings. Never put it in this repository, a frontend variable, a screenshot, or a chat message. If you make a custom token, Cloudflare's guide requires Workers AI Read and Edit permissions.

The integration uses `@cf/meta/llama-3.2-3b-instruct`. If Cloudflare requests acceptance of the model license, review and accept it yourself in the dashboard before testing: [model and license](https://developers.cloudflare.com/workers-ai/models/llama-3.2-3b-instruct/).

## 2. Configure the existing Render backend

In **Render > fragrance-api > Environment**, add:

| Variable | Value |
| --- | --- |
| `Chatbot__Enabled` | `true` |
| `Chatbot__Provider` | `cloudflare` |
| `Chatbot__CloudflareAccountId` | Your Cloudflare Account ID |
| `Chatbot__CloudflareApiToken` | Your private Workers AI token |

The double underscores are intentional: ASP.NET maps these to the `Chatbot` settings section. `Chatbot__BaseUrl` and `Chatbot__ServiceKey` only apply to the local Python provider; they are not needed here.

Push the updated code to the GitHub branch used by Render and Vercel, then deploy that revision to both platforms. Existing Render services must receive these environment variables in their dashboard; editing `render.yaml` alone does not update an independently configured service. The Blueprint now lists the same four variables for new Blueprint deployments.

## 3. Configure Vercel

Use your existing `NEXT_PUBLIC_API_BASE_URL` pointing to `https://YOUR-RENDER-SERVICE.onrender.com/api`. Set `NEXT_PUBLIC_CHATBOT_ENABLED=true` if it was previously disabled, then redeploy the frontend. Keep the exact Vercel origin in Render's existing `CORS__AllowedOrigins` setting.

No Cloudflare credentials belong in Vercel. The browser sends questions only to Render. Public product names, descriptions, prices, availability, and public policy excerpts are sent to Cloudflare to answer the question. Private customer records are not retrieved. Cloudflare processes those questions and context on its infrastructure; see [data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/).

## 4. Verify the deployed website

Open `https://YOUR-RENDER-SERVICE.onrender.com/api/chat/status`. `{"ready":true}` means credentials can access the model catalog. This check does not generate an answer and does not prove remaining inference quota or model-license acceptance.

On your Vercel storefront, open **Ask the house** and ask:

- “What are base notes?”
- “What is the price of PRODUCT NAME?” using an active product in your actual catalog.

Check that replies appear, displayed cards link to the correct product, and card prices match the product page. Each question is independent; previous chat messages are not passed to the model. The public endpoint allows 15 requests per minute per IP. Generated answers remain experimental.

You can also test directly without a Cloudflare token in the request:

```powershell
Invoke-RestMethod -Method Post -Uri 'https://YOUR-RENDER-SERVICE.onrender.com/api/chat' -ContentType 'application/json' -Body '{"message":"What are base notes?"}'
```

Render's free backend may need time to wake after inactivity. A friendly unavailable response during a cold start is not proof that the Cloudflare credentials are invalid.

## Free allowance and errors

Workers AI currently includes **10,000 Neurons per day**, reset at **00:00 UTC (5:30 AM India time)**. Neurons measure compute, not chat messages. Stay on Workers Free: requests fail when the allocation is exhausted; extra usage requires an explicit paid upgrade. The application never upgrades your plan, purchases credits, or switches to a paid model. It caps answers at 192 output tokens and does not retry inference automatically. [Official pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).

- **429 with daily allowance message:** wait for the daily reset. Product pages still work.
- **429 with busy message:** try again later; Cloudflare has temporary capacity limits.
- **503:** confirm the Account ID, account-scoped token permissions, and model terms. Check Render logs privately; never paste secrets. Upstream error messages are intentionally not exposed to visitors.
- **`ready:false`:** check the provider setting, Account ID, token permissions, and connectivity.

To disable generation, set `Chatbot__Enabled=false` on Render. To hide the widget, set `NEXT_PUBLIC_CHATBOT_ENABLED=false` on Vercel and rebuild.

## Local checks and future training

To test this provider locally, add to the API's ignored `.env`:

```dotenv
CHATBOT_ENABLED=true
CHATBOT_PROVIDER=cloudflare
CLOUDFLARE_ACCOUNT_ID=YOUR_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=YOUR_PRIVATE_TOKEN
```

Run `dotnet run --project tests/FragranceCommerce.Chat.Tests` from the repository root for fake-HTTP contract checks. These verify the request, catalog context, token separation, readiness, quota, malformed responses, and friendly errors without using Cloudflare credits. An actual live inference check still requires your configured account and deployment.

The website initially uses Cloudflare's base Llama model. Our existing Qwen notebook trains a different model, and its adapter cannot be uploaded to Llama. A later learning step is to adapt the training project to a compatible base, evaluate an adapter against the baseline, and upload it using [Cloudflare's LoRA support](https://developers.cloudflare.com/workers-ai/features/fine-tunes/loras/). LoRA inference is currently free during open beta, which can change. No custom adapter is deployed by this integration.
