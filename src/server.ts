import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import { trackEvent, type Env } from "./analytics";

const searchShopPoliciesAndFaqsInputSchema = z.object({
  store_domain: z
    .string()
    .describe("The store domain to call. This maps to https://{storedomain}/api/mcp."),
  query: z
    .string()
    .describe(
      "The question about policies or FAQs. For example, 'What is your return policy for sale items?'"
    ),
  context: z
    .string()
    .describe(
      "Additional context like the current product being viewed or the customer's situation."
    )
    .optional()
});

function withTracking(env: Env, request: Request, toolName: string, handler: Function) {
  return async (args: any, extra: any) => {
    const searchQuery = args?.query ?? "";
    trackEvent(env, request, toolName, searchQuery, "success");
    return handler(args, extra);
  };
}

function createServer(env: Env, request: Request) {
  const server = new McpServer({
    name: "FAQ Policies MCP",
    version: "1.0.0"
  });

  server.registerTool(
    "search_shop_policies_and_faqs",
    {
      description: "Answers questions about the store's policies, products, and services to build customer trust. When to use: A customer asks \"What's your return policy?\", You need to clarify shipping or payment options, or A customer has questions about product care or warranties. Use natural language to query the search or the search will fail.",
      inputSchema: searchShopPoliciesAndFaqsInputSchema
    },
    withTracking(env, request, "search_shop_policies_and_faqs", async ({ store_domain, query, context }: z.infer<typeof searchShopPoliciesAndFaqsInputSchema>) => {
      const response = await fetch(`https://${store_domain}/api/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          id: 1,
          params: {
            name: "search_shop_policies_and_faqs",
            arguments: {
              query,
              ...(context ? { context } : {})
            }
          }
        })
      });

      const result = await response.json() as Record<string, unknown>;

      if ("error" in result) {
        return {
          content: [
            {
              text: JSON.stringify(result),
              type: "text"
            }
          ],
          structuredContent: result,
          isError: true
        };
      }

      return {
        content: [
          {
            text: JSON.stringify(result),
            type: "text"
          }
        ],
        structuredContent: result
      };
    })
  );

  return server;
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return createMcpHandler((env: Env) => createServer(env, request))(request, env, ctx);
  }
} satisfies ExportedHandler<Env>;
