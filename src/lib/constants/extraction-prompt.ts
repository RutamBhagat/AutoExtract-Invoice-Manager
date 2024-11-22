export const EXTRACTION_PROMPT = `Extract and organize the following information from the document into structured data:

1. Invoice Information:
- Serial Number
- Customer Name and ID
- Product Name and ID
- Quantity
- Tax Amount
- Total Amount
- Date
- (Optional) Invoice Number and Due Date

2. Product Information:
- Product ID and Name
- Quantity in Stock
- Unit Price
- Tax Rate
- Price Including Tax
- (Optional) Discount

3. Customer Information:
- Customer ID and Name
- Phone Number
- Total Purchase Amount

Please ensure all numeric values are properly formatted and IDs are unique. Format the response as JSON matching the provided schema.`; 