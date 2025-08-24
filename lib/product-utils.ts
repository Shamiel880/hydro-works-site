import type { WooCommerceProduct, WooCommerceVariation } from "@/types/woocommerce";

// Fixed function name to match what's called in cart context
export function extractAttributeValues(
  attributes: WooCommerceVariation["attributes"] | WooCommerceProduct["attributes"]
): string {
  console.log('🔍 Extracting attributes:', attributes);
  
  // Handle null/undefined
  if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
    console.log('❌ No attributes found');
    return "";
  }

  // Check if this is variation attributes (has 'option' property)
  const firstAttr = attributes[0];
  
  // Variation attributes (array of { name, option })
  if (firstAttr && typeof firstAttr === 'object' && 'option' in firstAttr) {
    console.log('✅ Processing variation attributes');
    const result = (attributes as WooCommerceVariation["attributes"])
      .map(attr => {
        console.log('- Variation attr:', attr);
        return attr.option;
      })
      .filter(option => option && option.trim() !== '')
      .join(", ");
    
    console.log('🎯 Variation result:', result);
    return result;
  }

  // Product attributes (array of objects with 'options' property)
  if (firstAttr && typeof firstAttr === 'object' && 'options' in firstAttr) {
    console.log('✅ Processing product attributes');
    const result = (attributes as WooCommerceProduct["attributes"])
      .map(attr => {
        console.log('- Product attr:', attr);
        return attr.options.join("/");
      })
      .filter(options => options && options.trim() !== '')
      .join(", ");
    
    console.log('🎯 Product result:', result);
    return result;
  }

  console.log('❌ Unknown attribute format');
  return "";
}

// Keep the old function name for backward compatibility
export const extractVariationAttributes = extractAttributeValues;