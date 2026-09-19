# FAQ Policies MCP Server Documentation

Welcome to the documentation for the FAQ Policies MCP Server. This service equips your AI agents with direct access to a specific store's rules, policies, and frequently asked questions, ensuring accurate and up-to-date customer support.

By querying the store's backend directly, this server eliminates hallucinated return windows or estimated shipping costs, providing factual answers for seamless customer service.

**Server URL:** `https://faq-policies-mcp.anigok.com/mcp`

## Available Tools

### `search_shop_policies_and_faqs`

This is the primary tool of the server. It acts as a specialized search index designed to build customer trust by retrieving precise policy information.

**Optimal Use Cases:**

* A customer asks specific policy questions, such as return windows for clearance items.
* Clarifying operational details like shipping speeds, international customs fees, or accepted payment gateways.
* Addressing granular product care questions or warranty claims.

*Note: Always pass queries to this tool in natural language. The underlying search mechanism is optimized for conversational questions rather than rigid keyword strings.*

#### Input Schema

| Parameter | Type | Status | Description |
| :--- | :--- | :--- | :--- |
| `store_domain` | `string` | **Required** | The exact domain of the shop you are querying, excluding the protocol (e.g., `galactic-gadgets.shop`). This maps to `https://{store_domain}/api/mcp`. |
| `query` | `string` | **Required** | The customer's question regarding policies or FAQs, formatted as a natural language sentence. |
| `context` | `string` | *Optional* | Additional context to tailor the response, such as the specific product the customer is currently viewing or their cart status. |

## Implementation Examples

Below are examples of how an agent should structure calls to this tool in real-world scenarios.

### Example 1: High-Value Purchase Inquiry

A customer is evaluating a high-end espresso machine but expresses hesitation regarding the warranty coverage for accidental damage.

**Input:**

```json
{
  "store_domain": "premium-brew-supply.com",
  "query": "What is the warranty on your espresso machines? Does it cover accidental damage?",
  "context": "Customer is currently viewing the 'Barista Pro 5000' and seems hesitant to proceed to checkout."
}
```

### Example 2: International Shipping Logistics

A prospective buyer from overseas wants to purchase vintage clothing but needs clarification on shipping capabilities and potential hidden costs.

**Input:**

```json
{
  "store_domain": "vintage-vinyl-and-threads.co",
  "query": "Do you ship to New Zealand, and if so, what are the standard customs fees?",
  "context": ""
}
```

### Command-Line Usage (cURL)

You can easily test the MCP server directly from your terminal. Here is an example of a tool call payload using a real-world domain (`patagonia.com`).

```bash
curl -X POST "https://faq-policies-mcp.anigok.com/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream, application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_shop_policies_and_faqs",
      "arguments": {
        "store_domain": "patagonia.com",
        "query": "What is your return policy for unopened products?",
        "context": "Customer is considering returning a product."
      }
    }
  }'
```

## Technical Architecture

This MCP server functions as a lightweight, structured proxy. When the `search_shop_policies_and_faqs` tool is invoked, the server executes the following sequence:

1. Formats the parameters into a standardized JSON-RPC 2.0 POST request.
2. Transmits the request directly to the store's custom endpoint (`https://{store_domain}/api/mcp`).
3. Awaits the store's internal AI or search index to process the natural language query.
4. Captures the response—gracefully handling any errors—and returns the raw, structured JSON. This allows your LLM to instantly parse the policy data and synthesize a helpful response for the user.